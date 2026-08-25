-- Chỉ gọi sang Vercel khi thật sự có việc.
--
-- Vì sao: gói Hobby cho 4 giờ Active CPU mỗi tháng. Gõ cửa mỗi phút suốt
-- 30 ngày là 87.600 lần gọi, ngốn khoảng 2,4 giờ CPU — hơn nửa hạn mức — chỉ
-- để nhận về câu "không có gì". Kiểm tra hàng đợi ngay trong Postgres gần như
-- miễn phí, nên hỏi ở đây trước rồi mới gọi ra ngoài.
--
-- Đánh đổi: không có gì. Việc mới vào hàng đợi vẫn được phát ở nhịp kế tiếp,
-- vì lúc đó hàng đợi đã khác rỗng.

-- Có việc nào đang chờ phát không
create or replace function co_viec_cho()
returns boolean
language sql
stable
security definer
set search_path = public, pgmq
as $$
  select exists (select 1 from pgmq.q_jobs);
$$;

-- Có việc .pptx nào đang chạy bên Managed Agents cần dò không
create or replace function co_viec_dang_chay()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from jobs where status = 'running' and session_id is not null
  );
$$;

revoke all on function co_viec_cho()       from anon, authenticated;
revoke all on function co_viec_dang_chay() from anon, authenticated;

-- Đặt lại lịch: thêm điều kiện trước khi gọi
do $$ begin perform cron.unschedule('nhip-dispatch'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('nhip-poll');     exception when others then null; end $$;

select cron.schedule('nhip-dispatch', '* * * * *',
  $$select nhip_cron('/api/cron/dispatch') where co_viec_cho()$$);

select cron.schedule('nhip-poll', '* * * * *',
  $$select nhip_cron('/api/cron/poll') where co_viec_dang_chay()$$);
