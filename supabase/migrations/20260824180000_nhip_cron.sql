-- Đồng hồ nhịp cho hàng đợi việc.
--
-- Vì sao ở đây mà không ở Vercel: gói Hobby của Vercel chỉ cho cron chạy
-- MỖI NGÀY MỘT LẦN, và biểu thức chạy dày hơn sẽ làm hỏng luôn lần deploy.
-- Hàng đợi cần nhịp mỗi phút, nên đồng hồ nằm bên Supabase (pg_cron miễn phí,
-- không phụ thuộc gói Vercel). Vercel chỉ còn là nơi nhận cú gọi.

create extension if not exists pg_net;

-- Nơi cất địa chỉ web và mã bí mật. Không mở cho anon/authenticated —
-- chỉ pg_cron (chạy dưới quyền postgres) đọc được.
create table if not exists cau_hinh_cron (
  khoa    text primary key,
  gia_tri text not null,
  sua_luc timestamptz not null default now()
);

alter table cau_hinh_cron enable row level security;
revoke all on cau_hinh_cron from anon, authenticated;

-- Gọi một đường dẫn cron trên web. Im lặng bỏ qua nếu chưa cấu hình địa chỉ,
-- để lúc chưa deploy thì cron không kêu lỗi mỗi phút.
create or replace function nhip_cron(p_duong_dan text)
returns bigint
language plpgsql
security definer
set search_path = public, net
as $$
declare
  v_goc    text;
  v_bi_mat text;
begin
  select gia_tri into v_goc    from cau_hinh_cron where khoa = 'goc_web';
  select gia_tri into v_bi_mat from cau_hinh_cron where khoa = 'bi_mat_cron';

  if v_goc is null or v_bi_mat is null then
    return null;
  end if;

  return net.http_get(
    url     := v_goc || p_duong_dan,
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_bi_mat),
    timeout_milliseconds := 5000   -- không chờ; việc chạy tiếp phía Vercel
  );
end;
$$;

revoke all on function nhip_cron(text) from anon, authenticated;

-- Đặt lại lịch: xoá cũ trước để chạy lại di trú này không bị trùng.
do $$
begin
  perform cron.unschedule('nhip-dispatch');
exception when others then null;
end $$;

do $$
begin
  perform cron.unschedule('nhip-poll');
exception when others then null;
end $$;

-- dispatch: nhận việc mới trong hàng đợi rồi chạy
select cron.schedule('nhip-dispatch', '* * * * *', $$select nhip_cron('/api/cron/dispatch')$$);

-- poll: dò việc .pptx đang chạy bên Managed Agents
select cron.schedule('nhip-poll', '* * * * *', $$select nhip_cron('/api/cron/poll')$$);
