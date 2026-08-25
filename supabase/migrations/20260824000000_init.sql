-- Trợ Thủ — lược đồ khởi tạo
-- Bám theo docs/data-model.md. Chạy bằng: supabase db push
--
-- Ba nguyên tắc không được phá:
--   1. Sổ credit chỉ ghi thêm — không có cột số dư ở đâu cả
--   2. RLS bật trên mọi bảng, mặc định chặn
--   3. Tiền lưu bigint đơn vị đồng; chi phí AI lưu bigint đơn vị micro-USD

create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pgmq;

-- ── Kiểu ────────────────────────────────────────────────────────────
create type job_status  as enum ('queued','running','done','failed','cancelled');
create type ledger_kind as enum ('topup','bonus','hold','commit','refund','adjust');

-- ── profiles ────────────────────────────────────────────────────────
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  nganh            text,
  phone            text,
  free_job_used_at timestamptz,
  is_admin         boolean     not null default false,
  created_at       timestamptz not null default now()
);

-- Tự tạo hồ sơ khi có người đăng ký
create or replace function public.tao_ho_so()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger tr_tao_ho_so after insert on auth.users
  for each row execute function public.tao_ho_so();

-- ── tools ───────────────────────────────────────────────────────────
-- Chỉ giữ phần đổi lúc chạy. Tên, mô tả, form, nội dung SEO nằm trong mã nguồn
-- (apps/web/lib/tools) vì chúng phải review qua git.
create table public.tools (
  id            text primary key,
  nganh         text        not null,
  price_vnd     bigint      not null check (price_vnd >= 0),
  cost_cap_umd  bigint      not null check (cost_cap_umd > 0),
  agent_id      text        not null,
  model         text        not null,
  enabled       boolean     not null default true,
  free_eligible boolean     not null default false,
  updated_at    timestamptz not null default now()
);

-- ── jobs ────────────────────────────────────────────────────────────
create table public.jobs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  tool_id      text        not null,

  input        jsonb       not null default '{}',
  input_files  jsonb       not null default '[]',

  status       job_status  not null default 'queued',
  stage        text,
  stage_detail text,
  progress     smallint    not null default 0 check (progress between 0 and 100),

  session_id   text,
  price_vnd    bigint      not null check (price_vnd >= 0),
  cost_umd     bigint,
  usage        jsonb,

  output_files jsonb       not null default '[]',
  error_code   text,
  error_detail text,

  created_at   timestamptz not null default now(),
  started_at   timestamptz,
  finished_at  timestamptz,
  expires_at   timestamptz
);

create index jobs_user_idx    on public.jobs (user_id, created_at desc);
create index jobs_active_idx  on public.jobs (status) where status in ('queued','running');
create index jobs_expire_idx  on public.jobs (expires_at) where expires_at is not null;

-- ── credit_ledger ───────────────────────────────────────────────────
create table public.credit_ledger (
  id         bigserial   primary key,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  kind       ledger_kind not null,
  amount_vnd bigint      not null,
  job_id     uuid        references public.jobs(id) on delete set null,
  ref        text,
  note       text,
  created_at timestamptz not null default now(),
  unique (kind, ref)          -- chặn cộng tiền hai lần khi webhook bắn lặp
);

create index ledger_user_idx on public.credit_ledger (user_id, created_at desc);

-- ── topup_intents ───────────────────────────────────────────────────
create table public.topup_intents (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  amount_vnd  bigint      not null check (amount_vnd >= 50000),
  bonus_vnd   bigint      not null default 0,
  memo_code   text        not null unique,
  method      text        not null default 'bank_qr',
  status      text        not null default 'pending',
  matched_ref text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '30 minutes'
);

create index intents_pending_idx on public.topup_intents (status, expires_at);

-- ── bank_events ─────────────────────────────────────────────────────
-- Ghi thô trước, khớp sau. Webhook không khớp được vẫn còn dấu vết để xử lý tay.
create table public.bank_events (
  id             bigserial   primary key,
  provider       text        not null,
  ref            text        not null,
  amount_vnd     bigint      not null,
  content        text,
  raw            jsonb       not null,
  matched_intent uuid        references public.topup_intents(id),
  created_at     timestamptz not null default now(),
  unique (provider, ref)
);

-- ── Số dư và giữ tiền ───────────────────────────────────────────────
create or replace function public.get_balance(p_user uuid)
returns bigint language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount_vnd), 0)::bigint
  from public.credit_ledger
  where user_id = p_user;
$$;

-- Tạo việc và giữ tiền trong CÙNG một giao dịch.
-- Khoá theo người dùng để hai yêu cầu đồng thời không cùng tiêu một số dư.
create or replace function public.create_job_with_hold(
  p_user        uuid,
  p_tool        text,
  p_input       jsonb,
  p_input_files jsonb,
  p_price       bigint
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_balance bigint;
  v_job     uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));

  select coalesce(sum(amount_vnd), 0) into v_balance
  from public.credit_ledger where user_id = p_user;

  if v_balance < p_price then
    raise exception 'INSUFFICIENT_CREDIT' using detail = v_balance::text;
  end if;

  insert into public.jobs (user_id, tool_id, input, input_files, price_vnd)
  values (p_user, p_tool, p_input, p_input_files, p_price)
  returning id into v_job;

  insert into public.credit_ledger (user_id, kind, amount_vnd, job_id, ref)
  values (p_user, 'hold', -p_price, v_job, v_job::text);

  return v_job;
end $$;

-- ── Hàng đợi ────────────────────────────────────────────────────────
select pgmq.create('jobs');

-- ── RLS ─────────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.jobs          enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.topup_intents enable row level security;
alter table public.tools         enable row level security;
alter table public.bank_events   enable row level security;

create policy p_profile_own on public.profiles      for select using (auth.uid() = id);
create policy p_jobs_own    on public.jobs          for select using (auth.uid() = user_id);
create policy p_ledger_own  on public.credit_ledger for select using (auth.uid() = user_id);
create policy p_intent_own  on public.topup_intents for select using (auth.uid() = user_id);
create policy p_tools_read  on public.tools         for select using (enabled);

-- Không có policy INSERT/UPDATE nào cho người dùng thường.
-- Mọi thao tác ghi đi qua RPC security definer hoặc service role.
-- bank_events không có policy đọc — chỉ service role chạm tới.

-- Realtime cho bảng jobs, để trình duyệt thấy tiến trình mà không phải hỏi liên tục
alter publication supabase_realtime add table public.jobs;

-- ── Kho tệp ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('outputs', 'outputs', false)
  on conflict (id) do nothing;

-- Đường dẫn dạng {user_id}/... nên viết chính sách theo tiền tố là đủ
create policy p_uploads_own on storage.objects for all
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy p_outputs_read on storage.objects for select
  using (bucket_id = 'outputs' and (storage.foldername(name))[1] = auth.uid()::text);
