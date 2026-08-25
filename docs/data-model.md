# Mô hình dữ liệu (Supabase / Postgres)

- **Ngày:** 2026-08-24
- **Căn cứ:** [ADR-0003](./adr/0003-web-architecture.md), [ADR-0005](./adr/0005-payments-and-credits.md)

Đây là bản thiết kế, chưa chạy migration nào. Toàn bộ tên bảng và cột dùng tiếng Anh; chú thích tiếng Việt.

---

## 1. Nguyên tắc

1. **Sổ credit chỉ ghi thêm.** Không có cột `balance` ở đâu cả. Số dư là `SUM(amount_vnd)`. Sửa số dư trực tiếp là mở đường cho sai lệch không truy được.
2. **Bật RLS trên mọi bảng, không ngoại lệ.** Mặc định là chặn; mở từng chính sách một.
3. **Tiền lưu bằng `bigint`, đơn vị đồng.** Không dùng số thực cho tiền.
4. **Chi phí AI lưu bằng micro-USD (`bigint`).** Chi phí thật rất nhỏ, lưu USD thực sẽ mất chính xác.
5. **Định nghĩa công cụ nằm trong mã nguồn, không nằm trong cơ sở dữ liệu.** Xem ADR-0003 mục 8. Bảng `tools` chỉ giữ phần thay đổi lúc chạy (bật/tắt, giá hiện hành) để đổi giá không phải deploy lại.

---

## 2. Bảng

### 2.1. `profiles` — hồ sơ người dùng

Nối 1–1 với `auth.users` của Supabase.

```sql
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  nganh        text,                      -- ngành chính, để cá nhân hoá bàn làm việc
  phone        text,
  free_job_used_at timestamptz,           -- đã dùng lượt miễn phí chưa
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);
```

### 2.2. `tools` — phần cấu hình động của công cụ

```sql
create table public.tools (
  id            text primary key,          -- 'edu.lecture-pptx'
  nganh         text not null,             -- 'giao-duc'
  price_vnd     bigint not null,           -- giá bán hiện hành
  cost_cap_umd  bigint not null,           -- trần chi phí (micro-USD) -> budget của session
  agent_id      text not null,             -- agent trên Managed Agents
  model         text not null,             -- 'claude-haiku-4-5' | 'claude-sonnet-5'
  enabled       boolean not null default true,
  free_eligible boolean not null default false,  -- có cho dùng lượt miễn phí không
  updated_at    timestamptz not null default now()
);
```

Tên, mô tả, schema đầu vào, nội dung SEO **không** nằm ở đây — chúng ở `lib/tools/` trong mã nguồn, vì chúng đi kèm form và trang, phải review qua git.

### 2.3. `jobs` — mỗi lần chạy một công cụ

```sql
create type job_status as enum ('queued','running','done','failed','cancelled');

create table public.jobs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  tool_id       text not null references public.tools(id),

  input         jsonb not null,            -- theo schema của công cụ
  input_files   jsonb not null default '[]',  -- [{bucket, path, name, bytes}]

  status        job_status not null default 'queued',
  stage         text,                      -- 'reading' | 'planning' | 'drawing' | 'exporting'
  stage_detail  text,                      -- 'trang 8/13'
  progress      smallint not null default 0,

  session_id    text,                      -- session Managed Agents
  price_vnd     bigint not null,           -- giá chốt lúc tạo, KHÔNG đọc lại từ tools
  cost_umd      bigint,                    -- chi phí THẬT, điền khi xong
  usage         jsonb,                     -- usage thô trả về từ API

  output_files  jsonb not null default '[]',
  error_code    text,
  error_detail  text,

  created_at    timestamptz not null default now(),
  started_at    timestamptz,
  finished_at   timestamptz,
  expires_at    timestamptz                -- lúc xoá file kết quả
);

create index on public.jobs (user_id, created_at desc);
create index on public.jobs (status) where status in ('queued','running');
```

**`price_vnd` chốt lúc tạo việc, không đọc lại từ `tools`.** Đổi giá giữa chừng không được ảnh hưởng việc đang chạy.

**`cost_umd` là cột quan trọng nhất của cả cơ sở dữ liệu.** Không có nó thì không biết công cụ nào đang lỗ.

### 2.4. `credit_ledger` — sổ credit

```sql
create type ledger_kind as enum ('topup','bonus','hold','commit','refund','adjust');

create table public.credit_ledger (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        ledger_kind not null,
  amount_vnd  bigint not null,             -- dương hoặc âm
  job_id      uuid references public.jobs(id) on delete set null,
  ref         text,                        -- mã giao dịch ngân hàng / mã việc
  note        text,
  created_at  timestamptz not null default now(),

  unique (kind, ref)                       -- chặn cộng tiền hai lần
);

create index on public.credit_ledger (user_id, created_at desc);
```

Số dư:

```sql
create or replace function public.get_balance(p_user uuid)
returns bigint language sql stable as $$
  select coalesce(sum(amount_vnd), 0) from public.credit_ledger where user_id = p_user;
$$;
```

Giữ tiền và tạo việc phải **trong cùng một giao dịch**, khoá hàng người dùng để hai yêu cầu đồng thời không cùng tiêu một số dư:

```sql
create or replace function public.create_job_with_hold(
  p_user uuid, p_tool text, p_input jsonb, p_input_files jsonb, p_price bigint
) returns uuid language plpgsql security definer as $$
declare v_balance bigint; v_job uuid;
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
```

### 2.5. `topup_intents` — ý định nạp tiền

```sql
create table public.topup_intents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  amount_vnd   bigint not null,
  bonus_vnd    bigint not null default 0,
  memo_code    text not null unique,       -- 'TT HL8421' — nội dung chuyển khoản
  method       text not null,              -- 'bank_qr' | 'momo'
  status       text not null default 'pending',  -- pending | matched | expired | manual
  matched_ref  text,                       -- mã giao dịch ngân hàng khi khớp
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null
);
```

`memo_code` phải **ngắn, không dấu, không ký tự dễ nhầm** (bỏ O/0, I/1). Người dùng gõ tay được thì tỉ lệ sai giảm hẳn.

### 2.6. `bank_events` — mọi webhook nhận được, ghi thô

```sql
create table public.bank_events (
  id          bigserial primary key,
  provider    text not null,               -- 'sepay'
  ref         text not null,               -- mã giao dịch của ngân hàng
  amount_vnd  bigint not null,
  content     text,                        -- nội dung chuyển khoản thô
  raw         jsonb not null,
  matched_intent uuid references public.topup_intents(id),
  created_at  timestamptz not null default now(),
  unique (provider, ref)
);
```

Ghi thô **trước**, khớp **sau**. Webhook đến mà không khớp được intent nào thì vẫn còn nguyên ở đây để xử lý tay — đây là cứu cánh khi người dùng ghi sai nội dung.

### 2.7. `library_items` — thư viện bài giảng dựng sẵn

Chưa xây ở M1–M3, nhưng thiết kế trước để không phải sửa lược đồ về sau (xem ADR-0004 mục 4).

```sql
create table public.library_items (
  id          uuid primary key default gen_random_uuid(),
  nganh       text not null,
  cap_hoc     text,                        -- 'tieu-hoc' | 'thcs' | 'thpt'
  lop         smallint,
  mon         text,
  bo_sach     text,
  title       text not null,
  slug        text not null unique,        -- cho SEO
  file_path   text not null,               -- trong Storage
  source_job  uuid references public.jobs(id),
  download_count integer not null default 0,
  published_at timestamptz
);
```

---

## 3. RLS

```sql
alter table public.profiles       enable row level security;
alter table public.jobs           enable row level security;
alter table public.credit_ledger  enable row level security;
alter table public.topup_intents  enable row level security;
alter table public.tools          enable row level security;
alter table public.bank_events    enable row level security;

-- Người dùng chỉ đọc dữ liệu của chính mình
create policy p_jobs_own    on public.jobs          for select using (auth.uid() = user_id);
create policy p_ledger_own  on public.credit_ledger for select using (auth.uid() = user_id);
create policy p_intent_own  on public.topup_intents for select using (auth.uid() = user_id);
create policy p_profile_own on public.profiles      for select using (auth.uid() = id);

-- Bảng công cụ: ai cũng đọc được phần đang bật
create policy p_tools_read  on public.tools for select using (enabled);

-- KHÔNG có policy INSERT/UPDATE nào cho người dùng thường.
-- Mọi thao tác ghi đi qua RPC security definer hoặc service role.
-- bank_events không có policy đọc — chỉ service role chạm tới.
```

**Bẫy phải nhớ:** Realtime tôn trọng RLS, nên trình duyệt tự động chỉ nhận được thay đổi trên hàng `jobs` của chính mình. Đó là hành vi mong muốn — nhưng phải bật publication cho bảng `jobs` thì Realtime mới chạy.

---

## 4. Vòng đời file

| Kho | Nội dung | Xoá khi nào |
|---|---|---|
| `uploads` | File nguồn người dùng tải lên | Sau **7 ngày** `[anh chốt con số]` |
| `outputs` | File kết quả | Sau **90 ngày** `[anh chốt con số]` |
| `library` | Bài giảng dựng sẵn | Không xoá |

Dọn bằng `pg_cron` chạy hằng ngày. Con số đang là đề xuất — anh chốt rồi điền vào Chính sách dữ liệu và vào mọi chỗ `[SỐ] ngày` trong bộ thiết kế.

Đường dẫn file: `uploads/{user_id}/{job_id}/{filename}` và `outputs/{user_id}/{job_id}/{filename}` — có `user_id` ở đầu để viết chính sách Storage theo tiền tố cho gọn.

---

## 5. Truy vấn cho trang quản trị

Biên lợi nhuận theo công cụ, 7 ngày — đây là con số phải nhìn hằng ngày:

```sql
select
  t.id,
  count(*)                                    as so_viec,
  sum(j.price_vnd)                            as doanh_thu,
  sum(j.cost_umd) * 26 / 1000                 as chi_phi_vnd,   -- 1 USD ≈ 26.000đ
  round(100.0 * (sum(j.price_vnd) - sum(j.cost_umd) * 26 / 1000)
        / nullif(sum(j.price_vnd), 0), 1)     as bien_phan_tram
from public.jobs j
join public.tools t on t.id = j.tool_id
where j.finished_at > now() - interval '7 days'
  and j.status = 'done'
group by t.id
order by bien_phan_tram asc;   -- công cụ tệ nhất lên đầu
```

Tỉ giá cứng trong truy vấn là tạm. Khi doanh thu đủ lớn thì lưu tỉ giá tại thời điểm chạy vào chính bảng `jobs`.
