"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DongTich, Icon, ICONS, NhanTep, Nut, The, Tien, cx } from "@/components/ui";
import { FloatingZaloWidget } from "@/components/zalo-widget";
import { SavingsCalculator } from "@/components/savings-calculator";
import { TestimonialsSection } from "@/components/testimonials";
import { DemoFileModal } from "@/components/demo-modal";
import { NGANH, TOOLS, toolHref, toolsOf, type Tool } from "@/lib/tools";
import { khoangThoiGian } from "@/lib/format";

export default function TrangChu() {
  const [activeNganh, setActiveNganh] = useState<string>("giao-duc");
  const [activeExtFilter, setActiveExtFilter] = useState<string>("all");
  const [activeProofTab, setActiveProofTab] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [searchValue, setSearchValue] = useState<string>("");
  const [demoTool, setDemoTool] = useState<Tool | null>(null);

  // Lọc danh sách công cụ theo Ngành & Định dạng tệp
  const filteredTools = TOOLS.filter((t) => {
    const matchNganh = activeNganh === "all" || t.nganh === activeNganh;
    const matchExt = activeExtFilter === "all" || t.ext === activeExtFilter;
    const matchSearch = searchValue === "" || t.ten.toLowerCase().includes(searchValue.toLowerCase()) || t.tomTat.toLowerCase().includes(searchValue.toLowerCase());
    return matchNganh && matchExt && matchSearch;
  });

  const selectedNganhObj = NGANH.find((n) => n.slug === activeNganh) || NGANH[0];

  return (
    <>
      <SiteHeader />

      {/* ── SECTION 2: HERO SECTION ── */}
      <section className="px-6 md:px-12 pt-12 md:pt-16 pb-16 bg-gradient-to-b from-accent-soft/50 via-bg to-bg border-b border-line-strong relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft border border-accent-line mb-5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-accent pulse-dot" />
              <span className="text-xs md:text-sm font-bold text-accent">
                {TOOLS.length} công cụ AI hỗ trợ cho {NGANH.length} ngành nghề
              </span>
            </div>

            <h1 className="text-[38px] sm:text-[48px] lg:text-[54px] leading-[1.08] font-extrabold tracking-[-0.035em] text-ink text-balance">
              Giấy tờ lặp đi lặp lại,
              <br />
              <span className="text-accent underline decoration-accent-line decoration-wavy decoration-2 underline-offset-4">giao cho máy làm.</span>
            </h1>

            <p className="mt-4 mb-8 text-base sm:text-[17px] leading-relaxed text-ink-2 max-w-[520px]">
              Gõ việc bạn cần — bài giảng, biên bản, báo cáo, hợp đồng. Nhận về file Word, Excel, PowerPoint mở lên sửa được từng chữ. Trả tiền theo từng lượt, không thuê bao.
            </p>

            {/* Ô tìm kiếm Hero + Prompt Chips */}
            <div className="bg-surface border-2 border-line-strong rounded-2xl p-3 shadow-c2 transition-all duration-200 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15 mb-4">
              <div className="flex items-center gap-3 px-3 py-1">
                <span className="text-accent shrink-0">
                  <Icon d={ICONS.search} size={22} width={2.2} />
                </span>
                <input
                  type="text"
                  placeholder="Bạn muốn Trợ Thủ làm việc gì giúp bạn hôm nay?"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="grow text-base text-ink bg-transparent border-none outline-none font-sans placeholder:text-ink-4"
                />
                <Nut kieu="chinh" co="md" className="shrink-0 active-press">
                  Tìm công cụ
                </Nut>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-line mt-2 text-xs">
                <span className="font-mono text-ink-4 text-[11px] font-semibold mr-1">Gợi ý:</span>
                {[
                  { nhan: "✨ Soạn bài giảng Toán 5", text: "Soạn bài giảng" },
                  { nhan: "📊 Đối soát sao kê ngân hàng", text: "Đối soát sao kê" },
                  { nhan: "📝 Tạo hợp đồng lao động", text: "Hợp đồng lao động" },
                  { nhan: "🏗️ Viết biên bản nghiệm thu", text: "Biên bản nghiệm thu" },
                ].map((chip) => (
                  <button
                    key={chip.nhan}
                    onClick={() => setSearchValue(chip.text)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-3 hover:bg-accent-soft hover:text-accent border border-line text-ink-2 font-medium transition-all active-press cursor-pointer shadow-2xs"
                  >
                    {chip.nhan}
                  </button>
                ))}
              </div>
            </div>

            {/* Micro Trust Notes */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-ink-3">
              {["Bài đầu dùng thử miễn phí", "Không cần cài phần mềm", "Không tự động gia hạn"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 font-semibold text-ink-2">
                  <span className="text-accent bg-accent-soft p-0.5 rounded-full">
                    <Icon d={ICONS.check} size={14} width={2.8} />
                  </span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Khối Minh Họa Trực Quan Bên Phải (Input -> Processing -> Output) */}
          <div className="bg-surface border-2 border-line-strong rounded-2xl p-5 md:p-6 shadow-c3 relative animate-fade-in-scale">
            <div className="flex items-center justify-between mb-4 bg-surface-2 border border-line px-3.5 py-2 rounded-xl text-xs font-bold text-ink-2">
              <span>Luồng xử lý tự động</span>
              <div className="flex items-center gap-1.5 text-accent bg-accent-soft px-2.5 py-1 rounded-full border border-accent-line">
                <span className="w-2 h-2 rounded-full bg-accent pulse-dot" />
                <span>Đang tạo bài giảng PowerPoint...</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_32px_1.4fr] gap-3.5 items-center">
              {/* File đầu vào */}
              <div className="bg-surface-2 border-2 border-dashed border-line-strong rounded-xl p-4 flex flex-col gap-2.5 hover:border-accent/60 transition-colors">
                <div className="flex items-center gap-2">
                  <NhanTep ext="docx" size="sm" />
                  <span className="text-xs font-bold text-ink truncate">giao-an-toan-5.docx</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-ink-3 italic">
                  "Giáo án Tiết 42: Phân số bằng nhau. Mục tiêu: Giúp học sinh hiểu tính chất cơ bản..."
                </p>
              </div>

              {/* Mũi tên */}
              <div className="hidden sm:flex justify-center text-accent animate-pulse">
                <Icon d={ICONS.arrowRight} size={24} width={2.5} />
              </div>

              {/* Kết quả PowerPoint */}
              <div className="bg-ink text-white rounded-xl p-4 shadow-c2 border border-white/10 active-press transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <NhanTep ext="pptx" size="sm" />
                  <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">13 SLIDES</span>
                </div>
                <div className="text-sm font-extrabold text-white">
                  Bài 42: Phân số bằng nhau
                </div>
                <div className="text-[10px] text-accent-line mt-0.5 font-medium">Toán lớp 5 • Bộ sách Kết Nối</div>

                <div className="grid grid-cols-3 gap-1.5 mt-3">
                  <div className="aspect-video bg-accent/30 border border-accent rounded p-1 text-[7px] text-emerald-200">
                    <b className="text-white block font-bold">Slide 1</b> Tiêu đề
                  </div>
                  <div className="aspect-video bg-white/10 border border-white/15 rounded p-1 text-[7px] text-white/70">
                    Khởi động
                  </div>
                  <div className="aspect-video bg-white/10 border border-white/15 rounded p-1 text-[7px] text-white/70">
                    Khám phá
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-emerald-400 font-bold">
                  <Icon d={ICONS.check} size={14} width={2.8} />
                  <span>Sửa được từng chữ trong PowerPoint</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: THANH TẠO NIỀM TIN (TRUST BAR) ── */}
      <section className="bg-surface border-b-2 border-line-strong py-6 px-6 md:px-12 shadow-c1">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3.5 justify-center md:justify-start">
            <span className="text-3xl font-extrabold text-ink tracking-tight">17+</span>
            <span className="text-xs sm:text-sm text-ink-2 font-medium leading-tight">
              Công cụ chuyên sâu<br /><b className="text-ink font-semibold">cho công việc Việt Nam</b>
            </span>
          </div>
          <div className="flex items-center gap-3.5 justify-center md:justify-start border-l-2 border-line-strong pl-4 md:pl-6">
            <span className="text-3xl font-extrabold text-ink tracking-tight">5</span>
            <span className="text-xs sm:text-sm text-ink-2 font-medium leading-tight">
              Ngành nghề cốt lõi<br /><b className="text-ink font-semibold">Giáo dục, Kế toán...</b>
            </span>
          </div>
          <div className="flex items-center gap-3.5 justify-center md:justify-start border-l-2 border-line-strong pl-4 md:pl-6">
            <span className="text-3xl font-extrabold text-accent tracking-tight">100%</span>
            <span className="text-xs sm:text-sm text-ink-2 font-medium leading-tight">
              File kết quả sửa được<br /><b className="text-accent font-bold">Word, Excel, PowerPoint</b>
            </span>
          </div>
          <div className="flex items-center gap-3.5 justify-center md:justify-start border-l-2 border-line-strong pl-4 md:pl-6">
            <span className="text-2xl font-extrabold text-ink tracking-tight">Minh bạch</span>
            <span className="text-xs sm:text-sm text-ink-2 font-medium leading-tight">
              Biết giá trước khi bấm<br /><b className="text-amber-accent font-bold">Không phí gia hạn</b>
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: KHÁM PHÁ THEO NGÀNH NGHỀ ── */}
      <section id="nganh-nghe" className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">PHÂN LOẠI NGHIỆP VỤ</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Bạn đang làm công việc gì?
            </h2>
            <p className="text-sm sm:text-base text-ink-3 mt-1.5">
              Chọn ngành nghề của bạn để xem ngay các công cụ được thiết kế chuẩn nghiệp vụ
            </p>
          </div>
          <button
            onClick={() => setActiveNganh("all")}
            className="text-sm font-bold text-accent hover:underline inline-flex items-center gap-1 shrink-0 active-press cursor-pointer"
          >
            Xem tất cả {TOOLS.length} công cụ →
          </button>
        </div>

        {/* 5 Industry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {NGANH.map((n) => {
            const isSelected = activeNganh === n.slug;
            const count = toolsOf(n.slug).length;

            return (
              <div
                key={n.id}
                onClick={() => setActiveNganh(n.slug)}
                className={cx(
                  "p-4 sm:p-5 rounded-2xl border-2 cursor-pointer active-press transition-all duration-200 flex flex-col justify-between select-none relative group",
                  isSelected
                    ? "bg-surface border-accent shadow-c3 ring-4 ring-accent/15 -translate-y-1"
                    : "bg-surface border-line-strong hover:border-ink hover:-translate-y-1 shadow-c1"
                )}
              >
                <div>
                  <div className={cx(
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 transition-colors",
                    isSelected ? "bg-accent text-white shadow-md shadow-accent/25" : "bg-accent-soft text-accent group-hover:bg-accent group-hover:text-white"
                  )}>
                    <Icon d={n.icon} size={22} width={2.2} />
                  </div>
                  <h3 className="text-base font-extrabold text-ink mb-0.5">{n.tenNgan}</h3>
                  <div className="text-xs font-bold text-accent mb-2.5">{count} công cụ chuyên biệt</div>
                  <p className="text-xs text-ink-3 leading-relaxed line-clamp-2">{n.moTa}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-line-strong flex items-center justify-between text-xs font-bold">
                  <span className={isSelected ? "text-accent" : "text-ink-3 group-hover:text-ink"}>
                    {isSelected ? "Đang chọn ✓" : "Khám phá"}
                  </span>
                  <Icon d={ICONS.arrowRight} size={14} width={2.4} className={cx("transition-transform group-hover:translate-x-1", isSelected ? "text-accent" : "text-ink-4")} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 5: CÔNG CỤ NỔI BẬT & BỘ LỌC ── */}
      <section id="cong-cu" className="bg-slate-100/80 border-y-2 border-line-strong px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-surface p-5 rounded-2xl border-2 border-line-strong shadow-c1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                Danh sách công cụ
              </h2>
              <p className="text-sm text-ink-2 font-medium mt-1">
                Đang hiển thị cho ngành: <b className="text-accent underline font-bold">{activeNganh === "all" ? "Tất cả các ngành" : selectedNganhObj.ten}</b> ({filteredTools.length} công cụ)
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink-4 uppercase mr-1">Định dạng:</span>
              {[
                { id: "all", label: "Tất cả" },
                { id: "pptx", label: "PowerPoint (PPTX)" },
                { id: "docx", label: "Word (DOCX)" },
                { id: "xlsx", label: "Excel (XLSX)" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveExtFilter(f.id)}
                  className={cx(
                    "px-4 py-1.5 rounded-full text-xs font-bold border-1.5 active-press transition-all cursor-pointer select-none",
                    activeExtFilter === f.id
                      ? "bg-ink text-white border-ink shadow-md"
                      : "bg-surface text-ink-2 border-line-strong hover:bg-surface-3 hover:border-ink"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid công cụ */}
          {filteredTools.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl border-2 border-line-strong p-8 shadow-c1">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-lg font-bold text-ink">Không tìm thấy công cụ phù hợp</div>
              <p className="text-sm text-ink-3 mt-1 mb-5">Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.</p>
              <button
                onClick={() => { setActiveNganh("all"); setActiveExtFilter("all"); setSearchValue(""); }}
                className="text-xs font-bold text-accent underline hover:text-accent-hover active-press cursor-pointer"
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((t) => {
                const isFeatured = t.id === "edu.lecture-pptx";

                return (
                  <div
                    key={t.id}
                    className={cx(
                      "bg-surface border-2 border-line-strong rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-c3 hover:border-accent flex flex-col justify-between group animate-fade-in-scale",
                      isFeatured ? "lg:col-span-2 bg-gradient-to-br from-white via-surface to-accent-soft/30 border-accent/60 shadow-c2" : ""
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <NhanTep ext={t.ext} />
                        <span className="text-xs font-semibold text-ink-3 flex items-center gap-1.5 bg-surface-3 px-2.5 py-1 rounded-full border border-line">
                          <Icon d={ICONS.clock} size={14} width={2} />
                          {khoangThoiGian(t.thoiGian)}
                        </span>
                      </div>

                      <h3 className={cx("font-extrabold tracking-tight text-ink mb-2 group-hover:text-accent transition-colors", isFeatured ? "text-xl sm:text-2xl" : "text-lg")}>
                        {t.ten}
                      </h3>

                      <p className="text-sm leading-relaxed text-ink-2 grow mb-4">
                        {t.tomTat}
                      </p>

                      {/* Preview kết quả nhỏ kèm Nút Xem thử mẫu file */}
                      <div className="bg-surface-2 border border-line-strong rounded-xl p-3 mb-5 text-xs text-ink-3 font-medium flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base shrink-0">📄</span>
                          <span className="truncate">File <b className="text-ink font-bold">{t.ext.toUpperCase()}</b> mở sửa được từng chữ.</span>
                        </div>
                        <button
                          onClick={() => setDemoTool(t)}
                          className="text-[11px] font-bold text-accent underline hover:text-accent-hover shrink-0 cursor-pointer active-press"
                        >
                          Xem mẫu file →
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t-2 border-line">
                      <div>
                        <Tien n={t.price_vnd} co="lg" />
                        <span className="text-xs text-ink-4 font-semibold ml-1">/ lượt</span>
                      </div>

                      <Nut kieu="chinh" co="sm" href={toolHref(t)} className="gap-1.5 font-bold shadow-sm active-press">
                        Dùng ngay
                        <Icon d={ICONS.arrowRight} size={14} width={2.4} />
                      </Nut>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── BỔ SUNG: SAVINGS CALCULATOR WIDGET ── */}
      <SavingsCalculator />

      {/* ── SECTION 6: LUỒNG SỬ DỤNG 3 BƯỚC ── */}
      <section id="cach-hoat-dong" className="px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto bg-ink text-white rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl border border-white/10">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] items-start">
            <div>
              <div className="font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase mb-2">QUY TRÌNH TỐI GIẢN</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Ba bước.
                <br />
                Không có bước nào phải học.
              </h2>
              <p className="mt-4 mb-8 text-base leading-relaxed text-white/75 max-w-[40ch]">
                Mọi công cụ trên Trợ Thủ đều chạy đúng ba bước này — quen một cái là dùng được cả {TOOLS.length} công cụ.
              </p>
              <Nut kieu="trang" href="/dang-nhap" className="font-bold active-press text-ink">
                Làm thử bài đầu tiên
              </Nut>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  so: "01",
                  ten: "Nói bạn cần gì hoặc tải file lên",
                  moTa: "Gõ một câu mô tả hoặc kéo thả file có sẵn (giáo án Word, sao kê PDF, ảnh ghi chép). Không có biểu mẫu phức tạp nào phải điền.",
                },
                {
                  so: "02",
                  ten: "Xem trước giá và thời gian",
                  moTa: "Trợ Thủ báo trước rõ ràng chi phí (ví dụ 12.000₫) và thời gian chờ (ví dụ 4 phút). Bạn bấm 'Chạy' mới trừ tiền.",
                },
                {
                  so: "03",
                  ten: "Tải về file hoàn chỉnh để sửa",
                  moTa: "File gốc Word (.docx), Excel (.xlsx) hoặc PowerPoint (.pptx). Mở trực tiếp trên máy tính của bạn sửa từng chữ, từng ô.",
                },
              ].map((b) => (
                <div
                  key={b.so}
                  className="grid grid-cols-[44px_1fr] gap-4 bg-white/5 border border-white/15 rounded-2xl p-5 hover:bg-white/10 transition-colors active-press cursor-pointer"
                >
                  <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-accent/40 border border-emerald-400/30 font-mono text-base font-bold text-emerald-300">
                    {b.so}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{b.ten}</h3>
                    <p className="text-sm leading-relaxed text-white/70">{b.moTa}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: MINH HỌA KẾT QUẢ THỰC TẾ (BEFORE / AFTER) ── */}
      <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">BẰNG CHỨNG THỰC TẾ</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Thấy tận mắt kết quả trước khi dùng
          </h2>
          <p className="text-sm sm:text-base text-ink-3 mt-2">
            Không chỉ là lời mô tả. Xem sự khác biệt giữa nội dung bạn đưa và file hoàn chỉnh Trợ Thủ trả về.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center flex-wrap gap-2.5 mb-8">
          {[
            { label: "🎓 Giáo dục (Slide PPTX)", idx: 0 },
            { label: "📊 Kế toán (Đối soát Excel)", idx: 1 },
            { label: "💼 Nhân sự (Hợp đồng Word)", idx: 2 },
          ].map((tab) => (
            <button
              key={tab.idx}
              onClick={() => setActiveProofTab(tab.idx)}
              className={cx(
                "px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold border-2 active-press transition-all cursor-pointer select-none",
                activeProofTab === tab.idx
                  ? "bg-accent text-white border-accent shadow-md"
                  : "bg-surface text-ink-2 border-line-strong hover:bg-surface-2 hover:border-ink"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Comparison Showcase Box */}
        <div className="bg-surface border-2 border-line-strong rounded-3xl p-6 md:p-8 shadow-c3 animate-fade-in-scale">
          {activeProofTab === 0 && (
            <div className="grid md:grid-cols-[1fr_44px_1.3fr] gap-6 items-center">
              <div className="bg-surface-2 border-2 border-line-strong rounded-2xl p-5 shadow-2xs">
                <div className="text-xs font-extrabold text-ink-4 uppercase mb-2">ĐẦU VÀO CỦA BẠN</div>
                <div className="bg-surface border border-line-strong rounded-xl p-4 text-sm text-ink-2 leading-relaxed">
                  <b className="text-ink font-bold">Yêu cầu gõ vào:</b><br />
                  "Soạn giúp cô bài giảng Tiết 15 Địa lý 6: Các đới khí hậu trên Trái Đất. Cần 12 slide có hoạt động khởi động, hình minh họa và câu hỏi kiểm tra."
                </div>
              </div>

              <div className="hidden md:flex justify-center">
                <span className="w-11 h-11 rounded-full bg-accent-soft border border-accent-line text-accent flex items-center justify-center font-bold text-lg shadow-sm">➔</span>
              </div>

              <div className="bg-ink text-white rounded-2xl p-6 shadow-xl border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <NhanTep ext="pptx" size="sm" />
                  <span className="text-xs text-emerald-400 font-mono font-bold">14 SLIDES HOÀN CHỈNH</span>
                </div>
                <div className="text-xl font-extrabold text-white">
                  Tiết 15: Các đới khí hậu trên Trái Đất
                </div>
                <p className="text-xs text-white/75 mt-2 leading-relaxed">
                  Bao gồm: Đới nóng (Nhiệt đới), 2 Đới hòa hoãn (Ôn đới), 2 Đới lạnh (Hàn đới). Có sơ đồ minh họa & 5 câu hỏi tương tác.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/15 px-3 py-1 rounded-full text-white font-medium">Tự động căn chỉnh font</span>
                  <span className="bg-white/15 px-3 py-1 rounded-full text-white font-medium">Sửa được từng đối tượng</span>
                </div>
              </div>
            </div>
          )}

          {activeProofTab === 1 && (
            <div className="grid md:grid-cols-[1fr_44px_1.3fr] gap-6 items-center">
              <div className="bg-surface-2 border-2 border-line-strong rounded-2xl p-5 shadow-2xs">
                <div className="text-xs font-extrabold text-ink-4 uppercase mb-2">ĐẦU VÀO CỦA BẠN</div>
                <div className="bg-surface border border-line-strong rounded-xl p-4 text-sm text-ink-2 leading-relaxed">
                  <b className="text-ink font-bold">File sao kê PDF / Excel 500 dòng:</b><br />
                  Sao kê ngân hàng tháng 8 kèm sổ quỹ tiền mặt công ty chưa hạch toán.
                </div>
              </div>

              <div className="hidden md:flex justify-center">
                <span className="w-11 h-11 rounded-full bg-accent-soft border border-accent-line text-accent flex items-center justify-center font-bold text-lg shadow-sm">➔</span>
              </div>

              <div className="bg-ink text-white rounded-2xl p-6 shadow-xl border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <NhanTep ext="xlsx" size="sm" />
                  <span className="text-xs text-emerald-400 font-mono font-bold">EXCEL ĐỐI SOÁT</span>
                </div>
                <div className="text-xl font-extrabold text-white">
                  Bảng đối soát sao kê tháng 8
                </div>
                <p className="text-xs text-white/75 mt-2 leading-relaxed">
                  Tự động tô đỏ 3 khoản chênh lệch giữa sao kê ngân hàng và sổ quỹ, xuất bảng Pivot thống kê thu chi.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/15 px-3 py-1 rounded-full text-white font-medium">Chính xác 100%</span>
                  <span className="bg-white/15 px-3 py-1 rounded-full text-white font-medium">Không cần gõ hàm Excel</span>
                </div>
              </div>
            </div>
          )}

          {activeProofTab === 2 && (
            <div className="grid md:grid-cols-[1fr_44px_1.3fr] gap-6 items-center">
              <div className="bg-surface-2 border-2 border-line-strong rounded-2xl p-5 shadow-2xs">
                <div className="text-xs font-extrabold text-ink-4 uppercase mb-2">ĐẦU VÀO CỦA BẠN</div>
                <div className="bg-surface border border-line-strong rounded-xl p-4 text-sm text-ink-2 leading-relaxed">
                  <b className="text-ink font-bold">Thông tin nhân sự:</b><br />
                  "Nguyễn Văn A, Chức danh Kế toán viên, Lương 12 triệu, Phụ cấp 1.5 triệu, Thử việc 2 tháng."
                </div>
              </div>

              <div className="hidden md:flex justify-center">
                <span className="w-11 h-11 rounded-full bg-accent-soft border border-accent-line text-accent flex items-center justify-center font-bold text-lg shadow-sm">➔</span>
              </div>

              <div className="bg-ink text-white rounded-2xl p-6 shadow-xl border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <NhanTep ext="docx" size="sm" />
                  <span className="text-xs text-blue-300 font-mono font-bold">HỢP ĐỒNG WORD</span>
                </div>
                <div className="text-xl font-extrabold text-white">
                  Hợp đồng lao động Bộ luật 2019
                </div>
                <p className="text-xs text-white/75 mt-2 leading-relaxed">
                  Điền đầy đủ điều khoản quyền lợi, bảo mật thông tin và trách nhiệm hai bên chuẩn pháp lý.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/15 px-3 py-1 rounded-full text-white font-medium">Chuẩn mẫu A4 in ngay</span>
                  <span className="bg-white/15 px-3 py-1 rounded-full text-white font-medium">Đúng luật lao động</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── BỔ SUNG: TESTIMONIALS SECTION ── */}
      <TestimonialsSection />

      {/* ── SECTION 8: BẢNG GIÁ (TRẢ THEO LƯỢT) ── */}
      <section id="bang-gia" className="bg-slate-100/90 border-y-2 border-line-strong px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block bg-amber-soft border-1.5 border-amber-line text-amber-accent text-xs font-bold px-3.5 py-1 rounded-full mb-3 shadow-2xs">
              MÔ HÌNH NẠP TIỀN THÔNG MINH
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Nạp trước, dùng dần. Không thuê bao.
            </h2>
            <p className="text-sm sm:text-base text-ink-3 mt-2 font-medium">
              Tiền trong tài khoản vĩnh viễn không hết hạn. Biết giá trước khi bấm. Chạy lỗi hoàn tiền 100%.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Gói 100k */}
            <div className="bg-surface border-2 border-line-strong rounded-2xl p-8 flex flex-col justify-between relative hover-float">
              <div>
                <div className="text-base font-bold text-ink-2">Gói Trải Nghiệm</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-ink my-3 tracking-tight">100.000₫</div>
                <div className="text-xs font-medium text-ink-3 mb-6">Nạp 100k nhận đúng 100k vào tài khoản</div>
                <div className="space-y-3.5 text-xs sm:text-sm text-ink-2">
                  <DongTich>Chạy được ~2 bài giảng PPTX hoành tráng</DongTich>
                  <DongTich>Hoặc soạn ~8 đề kiểm tra Word</DongTich>
                  <DongTich>Dùng cho tất cả {TOOLS.length} công cụ</DongTich>
                  <DongTich>Hạn dùng: Vĩnh viễn không hết hạn</DongTich>
                </div>
              </div>
              <Nut kieu="vien" href="/gia" className="w-full mt-8 font-bold active-press">
                Nạp 100.000₫
              </Nut>
            </div>

            {/* Gói 300k Phổ biến */}
            <div className="bg-surface border-3 border-accent rounded-2xl p-8 flex flex-col justify-between relative shadow-c3 hover-float">
              <div className="absolute -top-3.5 right-6 bg-accent text-white text-[11.5px] font-extrabold px-3.5 py-1 rounded-full shadow-md">
                ĐƯỢC CHỌN NHIỀU NHẤT (+5%)
              </div>
              <div>
                <div className="text-base font-extrabold text-accent">Gói Phổ Thông</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-ink my-3 tracking-tight">300.000₫</div>
                <div className="text-xs font-bold text-accent mb-6 bg-accent-soft px-3 py-1 rounded-md inline-block">Nhận ngay 315.000₫ (Tặng thêm 15k)</div>
                <div className="space-y-3.5 text-xs sm:text-sm text-ink-2">
                  <DongTich>Chạy được ~7 bài giảng PPTX lớn</DongTich>
                  <DongTich>Hoặc ~26 đề kiểm tra / phiếu bài tập</DongTich>
                  <DongTich>Đã bao gồm bài dùng thử miễn phí</DongTich>
                  <DongTich>Tiền không hết hạn, không tự gia hạn</DongTich>
                </div>
              </div>
              <Nut kieu="chinh" href="/gia" className="w-full mt-8 font-bold shadow-md active-press">
                Nạp 300.000₫ →
              </Nut>
            </div>

            {/* Gói 500k */}
            <div className="bg-surface border-2 border-line-strong rounded-2xl p-8 flex flex-col justify-between relative hover-float">
              <div>
                <div className="text-base font-bold text-ink-2">Gói Tiết Kiệm</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-ink my-3 tracking-tight">500.000₫</div>
                <div className="text-xs font-bold text-amber-accent mb-6 bg-amber-soft px-3 py-1 rounded-md inline-block">Nhận ngay 550.000₫ (Tặng 10% = +50k)</div>
                <div className="space-y-3.5 text-xs sm:text-sm text-ink-2">
                  <DongTich>Chạy được ~12 bài giảng PPTX</DongTich>
                  <DongTich>Hoặc ~45 hợp đồng & hồ sơ nghiệp vụ</DongTich>
                  <DongTich>Tiết kiệm nhất cho công việc hằng ngày</DongTich>
                  <DongTich>Hoàn tiền 100% nếu công cụ chạy lỗi</DongTich>
                </div>
              </div>
              <Nut kieu="vien" href="/gia" className="w-full mt-8 font-bold active-press">
                Nạp 500.000₫
              </Nut>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FAQ & ZALO SUPPORT ── */}
      <section id="huong-dan" className="px-6 md:px-12 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Câu hỏi thường gặp
          </h2>
          <p className="text-sm text-ink-3 mt-2 font-medium">
            Giải đáp thắc mắc cho anh chị văn phòng và thầy cô lần đầu sử dụng
          </p>
        </div>

        <div className="space-y-3.5">
          {[
            {
              q: "Tôi nhận được loại file gì sau khi máy chạy xong?",
              a: "Bạn nhận về file gốc Word (.docx), Excel (.xlsx) hoặc PowerPoint (.pptx). Tải về máy mở lên là chỉnh sửa được từng chữ, từng hình, từng công thức như file bạn tự gõ.",
            },
            {
              q: "Có cần phải cài đặt phần mềm nào vào máy không?",
              a: "Không cần cài đặt bất kỳ phần mềm hay tiện ích nào. Bạn chỉ cần truy cập website trothu.vercel.app trên máy tính hoặc điện thoại là dùng được ngay.",
            },
            {
              q: "Nếu công cụ chạy ra kết quả bị lỗi thì sao?",
              a: "Nếu hệ thống gặp sự cố không trả ra file hoặc file bị lỗi cấu trúc, Trợ Thủ sẽ tự động hoàn 100% tiền của lượt đó lại vào tài khoản của bạn ngay lập tức.",
            },
            {
              q: "Tôi thanh toán nạp tiền bằng hình thức nào?",
              a: "Bạn có thể chuyển khoản bằng quét mã VietQR ngân hàng hoặc ứng dụng MoMo. Tiền sẽ vào tài khoản tự động trong vòng 30 giây đến 1 phút.",
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-surface border-2 border-line-strong rounded-xl p-5 cursor-pointer active-press transition-all hover:border-accent hover:shadow-c1"
              onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
            >
              <div className="flex items-center justify-between font-extrabold text-base text-ink">
                <span>{faq.q}</span>
                <span className={cx("text-xl transition-transform duration-200", openFaqIndex === idx ? "rotate-45 text-accent" : "text-ink-4")}>+</span>
              </div>
              {openFaqIndex === idx && (
                <p className="mt-3 text-sm leading-relaxed text-ink-3 border-t border-line-strong pt-3 font-medium animate-fade-in-scale">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Zalo Support Box */}
        <div className="mt-10 bg-accent-soft border-2 border-accent-line rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-c1">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <span className="text-3xl p-2 bg-white rounded-xl shadow-2xs">💬</span>
            <div>
              <div className="font-extrabold text-base text-accent">Cần hỗ trợ trực tiếp?</div>
              <div className="text-xs sm:text-sm text-ink-2 font-medium">Đội ngũ Trợ Thủ sẵn sàng giải đáp qua Zalo 8h00 – 22h00 hàng ngày</div>
            </div>
          </div>
          <Nut kieu="chinh" co="sm" href="/huong-dan" className="shrink-0 font-bold active-press">
            Chat Zalo Hỗ Trợ
          </Nut>
        </div>
      </section>

      {/* ── SECTION 10: CTA CUỐI TRANG ── */}
      <section className="px-6 md:px-12 py-10 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-accent via-[#00604C] to-[#004436] text-white rounded-3xl p-10 sm:p-14 text-center shadow-2xl border border-emerald-400/20">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Đừng làm lại những giấy tờ máy có thể làm giúp bạn.
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto mb-8 font-medium">
            Thử ngay bài đầu tiên hoàn toàn miễn phí. Không cần thẻ tín dụng, không cần đăng ký phức tạp.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Nut kieu="trang" co="lg" href="/dang-nhap" className="font-extrabold text-ink active-press shadow-lg">
              Dùng thử bài đầu miễn phí →
            </Nut>
            <Nut kieu="vien" co="lg" href="/gia" className="text-white border-white/50 hover:bg-white/10 font-bold active-press">
              Xem tất cả {TOOLS.length} công cụ
            </Nut>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* ── BỔ SUNG: FLOATING ZALO WIDGET ── */}
      <FloatingZaloWidget />

      {/* ── BỔ SUNG: DEMO FILE PREVIEW MODAL ── */}
      {demoTool && (
        <DemoFileModal tool={demoTool} onClose={() => setDemoTool(null)} />
      )}
    </>
  );
}
