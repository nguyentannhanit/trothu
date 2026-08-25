"use client";

import { useState } from "react";
import { Nut, Tien } from "./ui";

export function SavingsCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(8);
  const [role, setRole] = useState<string>("giang-vien");

  // Tính toán thời gian tiết kiệm (~80% thời gian)
  const savedHoursPerWeek = Math.round(hoursPerWeek * 0.8 * 10) / 10;
  const savedHoursPerMonth = Math.round(savedHoursPerWeek * 4);
  const estimatedCostPerMonth = Math.round((hoursPerWeek * 4) * 8500); // 8,500đ / lượt trung bình

  return (
    <section className="px-6 md:px-12 py-16 bg-gradient-to-br from-accent-soft/40 via-surface to-surface-2 border-y-2 border-line-strong">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block bg-accent-soft border border-accent-line text-accent text-xs font-bold px-3.5 py-1 rounded-full mb-3 shadow-2xs">
            TIỆN ÍCH UỐC TÍNH HIỆU QUẢ
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Bạn sẽ tiết kiệm được bao nhiêu thời gian?
          </h2>
          <p className="text-sm sm:text-base text-ink-3 mt-2 font-medium">
            Kéo thanh trượt bên dưới để xem Trợ Lý AI giúp bạn giải phóng bao nhiêu giờ làm việc lặp đi lặp lại mỗi tháng.
          </p>
        </div>

        <div className="bg-surface border-2 border-line-strong rounded-3xl p-6 sm:p-10 shadow-c3 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          {/* Controls */}
          <div>
            <div className="mb-6">
              <label className="block text-sm font-bold text-ink mb-2">
                Công việc của bạn:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "giang-vien", label: "🎓 Giáo viên / Giảng viên" },
                  { id: "ke-toan", label: "📊 Kế toán / Tài chính" },
                  { id: "xay-dung", label: "🏗️ Kỹ sư công trình" },
                  { id: "nhan-su", label: "💼 Hành chính / HR" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-1.5 transition-all cursor-pointer active-press ${
                      role === r.id
                        ? "bg-accent text-white border-accent shadow-sm"
                        : "bg-surface-2 text-ink-2 border-line-strong hover:bg-surface-3"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-ink">
                  Số giờ làm giấy tờ thủ công mỗi tuần:
                </span>
                <span className="text-xl font-extrabold text-accent bg-accent-soft px-3 py-1 rounded-xl border border-accent-line">
                  {hoursPerWeek} giờ / tuần
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full h-3 bg-surface-4 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-ink-4 font-mono font-bold mt-2">
                <span>2 giờ/từơng</span>
                <span>12 giờ</span>
                <span>25 giờ/tuần</span>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-ink text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider mb-3">
                KẾT QUẢ DỰ KIẾN
              </div>

              <div className="mb-6">
                <div className="text-xs text-white/70 font-medium">Tiết kiệm mỗi tháng:</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight my-1">
                  ~{savedHoursPerMonth} giờ
                </div>
                <div className="text-xs text-emerald-300 font-semibold">
                  Tương đương {savedHoursPerWeek} giờ thư giãn mỗi tuần 🎉
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 mb-6">
                <div className="text-xs text-white/70 font-medium">Chi phí Trợ Lý AI dự kiến/tháng:</div>
                <div className="text-2xl font-bold text-amber-300 mt-1">
                  <Tien n={estimatedCostPerMonth} co="lg" />
                  <span className="text-xs font-normal text-white/60 ml-1">/ tháng (nạp trả dần)</span>
                </div>
              </div>
            </div>

            <Nut kieu="trang" co="md" href="/dang-nhap" className="w-full font-extrabold text-ink active-press">
              Thử nghiệm tiết kiệm ngay →
            </Nut>
          </div>
        </div>
      </div>
    </section>
  );
}
