"use client";

import { NhanTep, Nut } from "./ui";
import type { Tool } from "@/lib/tools";

export function DemoFileModal({
  tool,
  onClose,
}: {
  tool: Tool;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-scale">
      <div className="bg-surface border-2 border-line-strong rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-3 hover:bg-surface-4 text-ink-3 font-bold flex items-center justify-center cursor-pointer transition-colors"
          title="Đóng"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <NhanTep ext={tool.ext} size="md" />
          <h3 className="text-xl sm:text-2xl font-extrabold text-ink">
            Mẫu file kết quả xuất ra
          </h3>
        </div>

        <p className="text-sm text-ink-3 mb-6">
          Đây là hình ảnh minh họa thực tế của tệp <b className="text-ink font-bold">{tool.ext.toUpperCase()}</b> do công cụ <b className="text-accent">{tool.ten}</b> tạo ra. Tệp tải về máy của bạn sẽ giữ nguyên cấu trúc chuẩn này và sửa được 100%.
        </p>

        {/* Dynamic Visual Content according to Ext */}
        <div className="bg-ink text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-inner border border-white/10">
          {tool.ext === "pptx" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-emerald-400 font-mono font-bold">POWERPOINT SLIDESHARE (13 SLIDES)</span>
                <span className="text-xs text-white/60">Tỷ lệ 16:9 HD</span>
              </div>
              <div className="aspect-video bg-slate-900 rounded-xl border border-white/15 p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-accent-line tracking-wider uppercase">TIẾT HỌC MẪU</span>
                  <div className="text-lg font-bold text-white mt-1">{tool.ten}</div>
                  <div className="text-xs text-white/70 mt-1">Cấu trúc 5 phần: Khởi động ➔ Khám phá ➔ Luyện tập ➔ Vận dụng ➔ Tổng kết</div>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="aspect-video bg-white/10 rounded p-1 text-[8px] text-white/70">
                      Slide {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tool.ext === "docx" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-blue-300 font-mono font-bold">WORD DOCUMENT (CHUẨN IN A4)</span>
                <span className="text-xs text-white/60">Font Be Vietnam Pro / Times New Roman</span>
              </div>
              <div className="bg-white text-ink rounded-xl p-5 text-xs font-serif leading-relaxed shadow-md border border-line">
                <div className="text-center font-bold uppercase text-sm mb-2">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="text-center font-bold text-xs mb-4">Độc lập - Tự do - Hạnh phúc</div>
                <div className="font-bold text-center text-sm mb-3 underline uppercase">{tool.ten}</div>
                <p className="text-ink-2 mb-2">Hôm nay, ngày ... tháng ... năm 2026, tại trụ sở công ty...</p>
                <div className="p-2 bg-surface-3 rounded border border-line text-[11px] font-sans my-2">
                  [Nội dung biểu mẫu chuẩn hóa 100% bám sát quy định luật pháp hiện hành]
                </div>
              </div>
            </div>
          )}

          {tool.ext === "xlsx" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-emerald-400 font-mono font-bold">EXCEL SPREADSHEET (BẢNG HÀM TỰ ĐỘNG)</span>
                <span className="text-xs text-white/60">Xuất file .xlsx</span>
              </div>
              <div className="bg-white text-ink rounded-xl overflow-hidden text-xs shadow-md border border-line">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-bold">
                      <th className="p-2 border border-emerald-700">STT</th>
                      <th className="p-2 border border-emerald-700">Nội dung</th>
                      <th className="p-2 border border-emerald-700">Sổ sách</th>
                      <th className="p-2 border border-emerald-700">Thực tế</th>
                      <th className="p-2 border border-emerald-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[11px]">
                    <tr className="bg-emerald-50">
                      <td className="p-2 border text-center">01</td>
                      <td className="p-2 border font-sans font-medium">Khoản thu #1024</td>
                      <td className="p-2 border">15.000.000₫</td>
                      <td className="p-2 border">15.000.000₫</td>
                      <td className="p-2 border text-emerald-700 font-bold">Khớp ✓</td>
                    </tr>
                    <tr className="bg-red-50 text-red-700 font-bold">
                      <td className="p-2 border text-center">02</td>
                      <td className="p-2 border font-sans">Khoản chi #1089</td>
                      <td className="p-2 border">4.200.000₫</td>
                      <td className="p-2 border">4.500.000₫</td>
                      <td className="p-2 border bg-red-100 text-red-700">Chênh 300k ⚠️</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-line-strong">
          <div className="text-xs text-ink-3">
            Biết trước chi phí: <b className="text-ink font-extrabold text-sm">{tool.price_vnd.toLocaleString("vi-VN")}₫ / lượt</b>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border-1.5 border-line-strong text-ink font-bold text-xs hover:bg-surface-3 active-press flex-1 sm:flex-none"
            >
              Đóng lại
            </button>
            <Nut kieu="chinh" co="sm" href={`/${tool.nganh}/${tool.slug}`} className="font-bold flex-1 sm:flex-none">
              Dùng thử công cụ này →
            </Nut>
          </div>
        </div>
      </div>
    </div>
  );
}
