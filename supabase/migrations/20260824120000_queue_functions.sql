-- Hàng đợi: tự bọc pgmq bằng hàm security definer trong schema public.
--
-- Vì sao không dùng pgmq_public của Supabase: schema đó chỉ lộ ra API khi bật
-- Queues thủ công trên dashboard. Quên bật một cái là lệnh xếp hàng hỏng ÂM THẦM —
-- việc vẫn tạo, tiền vẫn giữ, nhưng không bao giờ chạy. Tự bọc thì không phụ thuộc
-- vào công tắc nào cả.

-- ── Gộp xếp hàng vào cùng giao dịch tạo việc ───────────────────────
-- Tạo việc, giữ tiền, xếp hàng — cả ba trong MỘT giao dịch.
-- Hỏng bất kỳ bước nào là quay lui hết, không bao giờ giữ tiền mà không chạy.
create or replace function public.create_job_with_hold(
  p_user        uuid,
  p_tool        text,
  p_input       jsonb,
  p_input_files jsonb,
  p_price       bigint
) returns uuid language plpgsql security definer set search_path = public, pgmq as $$
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

  perform pgmq.send('jobs', jsonb_build_object('job_id', v_job));

  return v_job;
end $$;

-- ── Lấy việc ra khỏi hàng đợi ──────────────────────────────────────
-- p_vt: cửa sổ ẩn tính bằng giây. Trong khoảng đó việc không hiện cho lần đọc khác,
-- nên hai nhịp dispatcher chạy chồng nhau cũng không mở hai phiên cho cùng một việc.
create or replace function public.job_dequeue(p_n int default 5, p_vt int default 300)
returns table (msg_id bigint, job_id uuid)
language plpgsql security definer set search_path = public, pgmq as $$
begin
  return query
  select m.msg_id, (m.message ->> 'job_id')::uuid
  from pgmq.read('jobs', p_vt, p_n) m;
end $$;

-- ── Báo đã xử lý xong, xoá khỏi hàng đợi ───────────────────────────
create or replace function public.job_ack(p_msg_id bigint)
returns boolean language plpgsql security definer set search_path = public, pgmq as $$
begin
  return pgmq.delete('jobs', p_msg_id);
end $$;

-- ── Đếm việc đang chờ, cho trang quản trị ──────────────────────────
create or replace function public.job_queue_depth()
returns bigint language sql stable security definer set search_path = public, pgmq as $$
  select coalesce(count(*), 0)::bigint from pgmq.q_jobs;
$$;

-- Chỉ cho phép gọi từ máy chủ, không lộ cho trình duyệt
revoke all on function public.job_dequeue(int, int)  from anon, authenticated;
revoke all on function public.job_ack(bigint)        from anon, authenticated;
revoke all on function public.job_queue_depth()      from anon, authenticated;
