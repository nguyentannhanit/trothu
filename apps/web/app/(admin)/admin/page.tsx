import { redirect } from "next/navigation";
import { Logo } from "@/components/site-chrome";
import { Icon, ICONS, The, VienTrangThai, cx } from "@/components/ui";
import { getToolById } from "@/lib/tools";
import { khiNao, umdToVnd, vnd } from "@/lib/format";
import { currentUser, supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { daCauHinh } from "@/lib/phien";
import type { Job } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function TrangQuanTri() {
  if (!daCauHinh()) return <ChuaCauHinh />;

  const user = await currentUser();
  if (!user) redirect("/dang-nhap");

  const sb = await supabaseServer();
  const { data: hoSo } = await sb.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!hoSo?.is_admin) redirect("/app");

  const admin = supabaseAdmin();
  const { data: viec } = await admin
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);
  const ds = (viec ?? []) as Job[];

  const homNay = ds.filter((v) => new Date(v.created_at).toDateString() === new Date().toDateString());
  const doanhThu = homNay.filter((v) => v.status === "done").reduce((s, v) => s + v.price_vnd, 0);
  const chiPhi = homNay.reduce((s, v) => s + umdToVnd(v.cost_umd ?? 0), 0);
  const bien = doanhThu > 0 ? Math.round(((doanhThu - chiPhi) / doanhThu) * 100) : 0;
  const dangChay = ds.filter((v) => v.status === "running" || v.status === "queued").length;

  const canTay = ds.filter((v) => v.status === "failed").length;

  // Biên lợi nhuận theo công cụ — con số quan trọng nhất của cả trang
  const theoCongCu = new Map<string, { thu: number; chi: number; so: number }>();
  ds.filter((v) => v.status === "done").forEach((v) => {
    const cur = theoCongCu.get(v.tool_id) ?? { thu: 0, chi: 0, so: 0 };
    cur.thu += v.price_vnd;
    cur.chi += umdToVnd(v.cost_umd ?? 0);
    cur.so += 1;
    theoCongCu.set(v.tool_id, cur);
  });
  const bienBang = [...theoCongCu.entries()]
    .map(([id, x]) => ({ id, ...x, bien: x.thu > 0 ? Math.round(((x.thu - x.chi) / x.thu) * 100) : 0 }))
    .sort((a, b) => a.bien - b.bien);

  return (
    <div className="min-h-screen bg-bg">
      <header className="h-14 px-5 flex items-center justify-between bg-surface border-b border-line">
        <div className="flex items-center gap-3">
          <Logo size={27} chu={false} />
          <div>
            <div className="text-[14.5px] font-bold tracking-[-0.02em] leading-tight">Trợ Thủ</div>
            <div className="font-mono text-[10px] text-ink-5">QUẢN TRỊ</div>
          </div>
        </div>
        <span className="text-[13px] text-ink-4">{user.email}</span>
      </header>

      <div className="px-5 py-5.5">
        {canTay > 0 && (
          <div className="flex items-center gap-3.5 bg-danger-soft border border-[#F2C9C2] rounded-lg px-4.5 py-3.5 mb-4.5">
            <span className="text-danger shrink-0">
              <Icon d={ICONS.warn} size={18} width={2.1} />
            </span>
            <div className="grow text-sm">
              <strong className="font-semibold">{canTay} việc lỗi</strong>{" "}
              <span className="text-ink-2">— đã hoàn tiền tự động, xem lại nguyên nhân bên dưới</span>
            </div>
          </div>
        )}

        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4 mb-4.5">
          <Kpi ten="Doanh thu hôm nay" giaTri={vnd(doanhThu)} phu={`${homNay.length} việc`} />
          <Kpi ten="Chi phí API hôm nay" giaTri={vnd(chiPhi)} phu="gồm cả việc lỗi đã hoàn tiền" />
          <Kpi
            ten="Biên lợi nhuận"
            giaTri={`${bien}%`}
            phu="ngưỡng cảnh báo: dưới 50%"
            canhBao={doanhThu > 0 && bien < 50}
          />
          <Kpi ten="Việc đang chạy" giaTri={String(dangChay)} phu="gồm cả đang xếp hàng" />
        </div>

        <div className="grid gap-3.5 lg:grid-cols-[1fr_350px] mb-4.5">
          <The className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14.5px] font-semibold">Việc gần đây</span>
              <span className="font-mono text-xs text-ink-5">{ds.length} bản ghi</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="font-mono text-[10px] tracking-[0.07em] text-ink-5">
                    {["MÃ VIỆC", "CÔNG CỤ", "TRẠNG THÁI", "THU", "CHI PHÍ", "BIÊN", "LÚC"].map((h, i) => (
                      <th key={h} className={cx("pb-2.5 font-normal", i > 2 && "text-right")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ds.slice(0, 15).map((v) => {
                    const chi = umdToVnd(v.cost_umd ?? 0);
                    const b = v.status === "done" && v.price_vnd > 0 ? Math.round(((v.price_vnd - chi) / v.price_vnd) * 100) : null;
                    return (
                      <tr key={v.id} className="border-t border-line">
                        <td className="py-3 font-mono text-xs text-ink-3">{v.id.slice(0, 8)}</td>
                        <td className="py-3 text-[13px] text-ink-2">{getToolById(v.tool_id)?.ten ?? v.tool_id}</td>
                        <td className="py-3">
                          <VienTrangThai tt={v.status} />
                        </td>
                        <td className="py-3 text-right font-mono text-[12.5px] tabular">{v.price_vnd.toLocaleString("vi-VN")}</td>
                        <td className="py-3 text-right font-mono text-[12.5px] text-ink-3 tabular">
                          {v.cost_umd == null ? "—" : chi.toLocaleString("vi-VN")}
                        </td>
                        <td
                          className={cx(
                            "py-3 text-right font-mono text-[12.5px] font-semibold tabular",
                            b == null ? "text-ink-5" : b < 50 ? "text-danger" : "text-accent",
                          )}
                        >
                          {b == null ? "—" : `${b}%`}
                        </td>
                        <td className="py-3 text-right text-xs text-ink-5 whitespace-nowrap">{khiNao(v.created_at)}</td>
                      </tr>
                    );
                  })}
                  {ds.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-9 text-center text-sm text-ink-4">
                        Chưa có việc nào. Số liệu hiện ra sau lần chạy đầu tiên.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </The>

          <The className="p-5">
            <div className="text-[14.5px] font-semibold mb-1">Biên lợi nhuận theo công cụ</div>
            <p className="text-[12.5px] text-ink-4 mb-4">Công cụ tệ nhất lên đầu</p>
            <div className="flex flex-col gap-3.5">
              {bienBang.map((b) => (
                <div key={b.id}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[13px] text-ink-2 pr-2 truncate">{getToolById(b.id)?.ten ?? b.id}</span>
                    <span
                      className={cx("font-mono text-[12.5px] font-semibold tabular", b.bien < 50 ? "text-danger" : "text-accent")}
                    >
                      {b.bien}%
                    </span>
                  </div>
                  <div className="h-[5px] rounded-sm bg-surface-4 overflow-hidden">
                    <div
                      className={cx("h-full rounded-sm", b.bien < 50 ? "bg-danger" : "bg-accent")}
                      style={{ width: `${Math.max(0, Math.min(100, b.bien))}%` }}
                    />
                  </div>
                </div>
              ))}
              {bienBang.length === 0 && (
                <p className="text-[13px] text-ink-4">Chưa đủ dữ liệu — cần ít nhất một việc chạy xong.</p>
              )}
            </div>
          </The>
        </div>
      </div>
    </div>
  );
}

function Kpi({ ten, giaTri, phu, canhBao }: { ten: string; giaTri: string; phu: string; canhBao?: boolean }) {
  return (
    <The className="px-5 py-4.5">
      <div className="text-[13px] text-ink-3 mb-2">{ten}</div>
      <div className={cx("text-[25px] font-bold tracking-[-0.03em] tabular", canhBao && "text-danger")}>{giaTri}</div>
      <div className="text-[12.5px] text-ink-5 mt-1">{phu}</div>
    </The>
  );
}

function ChuaCauHinh() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <The className="max-w-[520px] p-7">
        <h1 className="text-[20px] font-bold tracking-[-0.02em] mb-2.5">Chưa cấu hình Supabase</h1>
        <p className="text-sm leading-relaxed text-ink-2">
          Trang quản trị cần kết nối cơ sở dữ liệu. Chép <code>.env.example</code> thành <code>.env.local</code>, điền
          khoá Supabase rồi chạy migration trong <code>supabase/migrations/</code>.
        </p>
      </The>
    </div>
  );
}
