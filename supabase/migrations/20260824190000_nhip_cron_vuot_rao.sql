-- Bổ sung: gửi kèm khoá vượt rào của Vercel.
--
-- Giai đoạn thử nội bộ bật SSO Protection — mọi người lạ gõ địa chỉ đều bị
-- đẩy về trang đăng nhập Vercel. Máy móc thì không đăng nhập được, nên Vercel
-- cho một khoá riêng đi kèm header `x-vercel-protection-bypass`.
--
-- Khi nào mở công khai thì xoá hàng 'khoa_vuot_rao' trong cau_hinh_cron,
-- hàm vẫn chạy bình thường vì header là tuỳ chọn.

create or replace function nhip_cron(p_duong_dan text)
returns bigint
language plpgsql
security definer
set search_path = public, net
as $$
declare
  v_goc     text;
  v_bi_mat  text;
  v_vuot    text;
  v_headers jsonb;
begin
  select gia_tri into v_goc    from cau_hinh_cron where khoa = 'goc_web';
  select gia_tri into v_bi_mat from cau_hinh_cron where khoa = 'bi_mat_cron';
  select gia_tri into v_vuot   from cau_hinh_cron where khoa = 'khoa_vuot_rao';

  if v_goc is null or v_bi_mat is null then
    return null;
  end if;

  v_headers := jsonb_build_object('Authorization', 'Bearer ' || v_bi_mat);

  if v_vuot is not null then
    v_headers := v_headers || jsonb_build_object('x-vercel-protection-bypass', v_vuot);
  end if;

  return net.http_get(
    url                  := v_goc || p_duong_dan,
    headers              := v_headers,
    timeout_milliseconds := 5000   -- không chờ; việc chạy tiếp phía Vercel
  );
end;
$$;

revoke all on function nhip_cron(text) from anon, authenticated;
