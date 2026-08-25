import Link from "next/link";
import { Icon, ICONS, NhanTep, Nut, The, Tien, ThanhTienTrinh, VienTrangThai } from "@/components/ui";
import { NutHuy } from "@/components/nut-huy";
import { NGANH, getToolById, toolsOf } from "@/lib/tools";
import { conLai, khiNao, khoangThoiGian } from "@/lib/format";
import { vieccuaToi } from "@/lib/phien";
import type { Job } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const CHANG: Record<string, string> = {
  reading: "Đọc nguồn",
  planning: "Lên dàn bài",
  resources: "Chuẩn bị hình",
  drawing: "Dựng từng trang",
  exporting: "Xuất file",
  done: "Xong",
};

export default async function BanLamViec({ searchParams }: { searchParams: Promise<{ nganh?: string }> }) {
  const nganhSlug = (await searchParams).nganh ?? NGANH[0].slug;
  const nganh = NGANH.find((n) => n.slug === nganhSlug) ?? NGANH[0];
  const viec = await vieccuaToi();

  const dangChay = viec.filter((v) => v.status === "running");
  const xepHang = viec.filter((v) => v.status === "queued");
  const xong = viec.filter((v) => v.status === "done").slice(0, 6);

  return (
    <div className="px-5 lg:px-6 pt-6 pb-9">
      {dangChay.map((v) => (
        <ViecDangChay key={v.id} viec={v} />
      ))}

      {xepHang.map((v) => (
        <The key={v.id} className="flex items-center gap-3.5 px-4.5 py-3.5 mb-3.5">
          <span className="inline-flex w-7.5 h-7.5 items-center justify-center rounded-sm bg-surface-3 text-ink-4 shrink-0">
            <Icon d={ICONS.clock} size={15} />
          </span>
          <div className="grow min-w-0">
            <span className="text-sm font-medium">{getToolById(v.tool_id)?.ten ?? v.tool_id}</span>
            <span className="text-[13px] text-ink-4 ml-2.5">đang xếp hàng</span>
          </div>
          <VienTrangThai tt="queued" />
        </The>
      ))}

      {dangChay.length === 0 && xepHang.length === 0 && viec.length === 0 && <ChuaCoGi />}

      {/* Công cụ theo ngành */}
      <div className="flex items-center justify-between mb-3.5 mt-7">
        <h2 className="text-[17px] font-semibold tracking-[-0.015em]">Công cụ ngành {nganh.tenNgan}</h2>
        <Link href={`/${nganh.slug}`} className="text-[13.5px] font-medium text-accent">
          Tìm hiểu thêm →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {toolsOf(nganh.slug).map((t) => (
          <Link key={t.id} href={`/app/tao/${t.id}`}>
            <The className="p-4 h-full hover:border-line-strong transition-colors">
              <div className="flex items-center justify-between mb-3">
                <NhanTep ext={t.ext} />
                <span className="text-xs text-ink-5">{khoangThoiGian(t.thoiGian)}</span>
              </div>
              <div className="text-[14.5px] font-semibold leading-snug tracking-[-0.01em] mb-3.5 min-h-10">{t.ten}</div>
              <div className="flex items-center justify-between">
                <Tien n={t.price_vnd} />
                <span className="inline-flex w-7.5 h-7.5 items-center justify-center rounded-sm bg-surface-3">
                  <Icon d={ICONS.arrowRight} size={15} width={2.2} />
                </span>
              </div>
            </The>
          </Link>
        ))}
      </div>

      {/* Tệp đã tạo */}
      {xong.length > 0 && (
        <>
          <h2 className="text-[17px] font-semibold tracking-[-0.015em] mb-3">Tệp đã tạo</h2>
          <The className="overflow-hidden">
            {xong.map((v) => {
              const t = getToolById(v.tool_id);
              return (
                <Link
                  key={v.id}
                  href={`/app/viec/${v.id}`}
                  className="flex items-center gap-3 px-4.5 py-3.5 border-b border-line last:border-0 hover:bg-surface-2"
                >
                  {t && <NhanTep ext={t.ext} size="sm" />}
                  <div className="grow min-w-0">
                    <div className="text-sm font-medium truncate">{v.output_files[0]?.name ?? t?.ten ?? v.tool_id}</div>
                    <div className="text-xs text-ink-5 mt-0.5">{khiNao(v.finished_at ?? v.created_at)}</div>
                  </div>
                  <span className="text-[13px] font-semibold text-accent">Tải về</span>
                </Link>
              );
            })}
          </The>
        </>
      )}
    </div>
  );
}

function ViecDangChay({ viec }: { viec: Job }) {
  const t = getToolById(viec.tool_id);
  const conBaoLau = t ? Math.max(0, ((t.thoiGian[1] * 60) * (100 - viec.progress)) / 100) : 0;

  return (
    <The className="p-5.5 mb-3.5 rounded-2xl shadow-[var(--shadow-c3)]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5 min-w-0">
          {t && (
            <span className={`inline-flex w-10 h-10 items-center justify-center rounded-[11px] ${t.ext === "pptx" ? "bg-pptx-bg" : t.ext === "xlsx" ? "bg-xlsx-bg" : "bg-docx-bg"} shrink-0`}>
              <NhanTep ext={t.ext} size="sm" />
            </span>
          )}
          <div className="min-w-0">
            <div className="text-base font-semibold tracking-[-0.015em] truncate">{t?.ten ?? viec.tool_id}</div>
            <div className="text-[13px] text-ink-4 mt-0.5">
              Bắt đầu {khiNao(viec.started_at ?? viec.created_at)} · đã trừ <Tien n={viec.price_vnd} co="sm" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="hidden sm:block text-[13px] text-ink-3">
            Còn khoảng <strong className="text-ink font-semibold">{conLai(conBaoLau)}</strong>
          </span>
          <NutHuy jobId={viec.id} />
        </div>
      </div>

      <div className="mb-4.5">
        <ThanhTienTrinh phanTram={viec.progress} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {Object.entries(CHANG)
          .filter(([k]) => k !== "done")
          .map(([key, nhan], i, arr) => {
            const hienTai = viec.stage === key;
            const daQua = arr.findIndex(([k]) => k === viec.stage) > i;
            return (
              <div key={key} className={`border-t-2 pt-2.5 ${hienTai || daQua ? "border-accent" : "border-surface-4"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {daQua && (
                    <span className="text-accent">
                      <Icon d={ICONS.check} size={13} width={3} />
                    </span>
                  )}
                  <span className={`text-[13px] ${hienTai ? "font-semibold text-ink" : daQua ? "text-ink" : "text-ink-5"}`}>
                    {nhan}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-ink-5">
                  {hienTai ? (viec.stage_detail ?? "đang làm") : daQua ? "xong" : "chưa tới"}
                </div>
              </div>
            );
          })}
      </div>
    </The>
  );
}

function ChuaCoGi() {
  return (
    <The className="px-7 py-9 text-center rounded-2xl">
      <div className="flex justify-center mb-5.5">
        {[-8, 0, 8].map((r, i) => (
          <div
            key={i}
            className="w-13 h-16.5 border-[1.5px] border-dashed border-line-strong rounded-md bg-surface-2"
            style={{ transform: `rotate(${r}deg)`, marginLeft: i > 0 ? -10 : 0, zIndex: i === 1 ? 1 : 0 }}
          />
        ))}
      </div>
      <h2 className="text-[17px] font-semibold tracking-[-0.015em] mb-2">Chưa có việc nào ở đây</h2>
      <p className="text-sm leading-relaxed text-ink-3 max-w-[46ch] mx-auto mb-5.5">
        Việc đầu tiên miễn phí. Làm thử một cái, mở file trong Word hoặc PowerPoint xem có dùng được không rồi hãy nạp
        tiền.
      </p>
      <Nut kieu="chinh" href="/app/tao/edu.exam">
        Làm thử việc đầu tiên
      </Nut>
      <p className="mt-5 text-[12.5px] text-ink-5">Không cần thẻ, không tự động gia hạn</p>
    </The>
  );
}
