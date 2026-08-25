"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon, ICONS, Nut, cx } from "./ui";
import { NGANH } from "@/lib/tools";

export function Logo({ size = 32, chu = true }: { size?: number; chu?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <span
        className="inline-flex items-center justify-center rounded-lg bg-accent text-white shadow-md shadow-accent/20 transition-transform group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Icon d={ICONS.logo} size={Math.round(size * 0.56)} width={2.4} />
      </span>
      {chu && <span className="text-lg font-extrabold tracking-[-0.03em] text-ink">Trợ Thủ</span>}
    </Link>
  );
}

export function DuongDan({ muc }: { muc: { nhan: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-ink-3">
      {muc.map((m, idx) => (
        <span key={idx} className="flex items-center gap-2">
          {idx > 0 && <span className="text-ink-4">/</span>}
          {m.href ? (
            <Link href={m.href} className="hover:text-accent transition-colors">
              {m.nhan}
            </Link>
          ) : (
            <span className="text-ink font-bold">{m.nhan}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SiteHeader({ trang }: { trang?: "cong-cu" | "gia" | "huong-dan" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nav = [
    { href: "/#cong-cu", nhan: "Khám phá công cụ", key: "cong-cu" },
    { href: "/#nganh-nghe", nhan: "Ngành nghề", key: "nganh-nghe" },
    { href: "/#cach-hoat-dong", nhan: "Cách hoạt động", key: "cach-hoat-dong" },
    { href: "/gia", nhan: "Bảng giá", key: "gia" },
    { href: "/huong-dan", nhan: "Hướng dẫn", key: "huong-dan" },
  ];

  return (
    <header className="sticky top-0 z-50 h-17 px-6 md:px-12 flex items-center justify-between bg-surface/95 backdrop-blur-md border-b border-line transition-all">
      <div className="flex items-center gap-8 lg:gap-12">
        <Logo />
        <nav className="hidden lg:flex items-center gap-7 text-[14.5px] font-medium text-ink-2">
          {nav.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className={cx(
                "transition-colors hover:text-accent",
                n.key === trang ? "text-accent font-semibold" : "text-ink-2"
              )}
            >
              {n.nhan}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dang-nhap"
          className="hidden sm:inline-flex text-[14px] font-semibold text-ink-2 hover:text-accent px-3 py-2 rounded-md"
        >
          Đăng nhập
        </Link>
        <Nut kieu="chinh" co="sm" href="/dang-nhap" className="shadow-sm">
          Dùng thử miễn phí
        </Nut>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md text-ink-2 hover:bg-surface-3 transition-colors ml-1"
          aria-label="Mở menu"
        >
          <Icon d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} size={22} width={2} />
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-17 left-0 right-0 bg-surface border-b border-line p-6 flex flex-col gap-4 shadow-xl lg:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3 text-base font-medium text-ink">
            {nav.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-line/50 hover:text-accent"
              >
                {n.nhan}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/dang-nhap"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-lg border border-line-strong font-semibold text-ink"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface px-6 md:px-12 pt-14 pb-10">
      <div className="max-w-7xl mx-auto grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div className="lg:pr-6">
          <Logo size={28} />
          <p className="mt-3.5 text-[14px] leading-relaxed text-ink-3 max-w-[36ch]">
            Nền tảng công cụ AI tự động hóa giấy tờ và công việc văn phòng lặp đi lặp lại cho người đi làm Việt Nam.
          </p>
          <p className="mt-4 font-mono text-xs text-ink-4">
            [TÊN HỘ KINH DOANH] · MST [MÃ SỐ THUẾ]
          </p>
        </div>

        <FooterCot
          tieuDe="Ngành nghề"
          muc={NGANH.map((n) => ({ nhan: n.tenNgan, href: `/${n.slug}` }))}
        />

        <FooterCot
          tieuDe="Sản phẩm"
          muc={[
            { nhan: "Tạo bài giảng PPTX", href: "/giao-duc/tao-bai-giang-powerpoint" },
            { nhan: "Soạn đề kiểm tra", href: "/giao-duc/soan-de-kiem-tra" },
            { nhan: "Đối soát sao kê", href: "/ke-toan/doi-soat-sao-ke" },
            { nhan: "Biên bản nghiệm thu", href: "/xay-dung/bien-ban-nghiem-thu" },
            { nhan: "Hợp đồng lao động", href: "/nhan-su/hop-dong-lao-dong" },
          ]}
        />

        <FooterCot
          tieuDe="Hỗ trợ"
          muc={[
            { nhan: "Hướng dẫn sử dụng", href: "/huong-dan" },
            { nhan: "Câu hỏi thường gặp", href: "/huong-dan" },
            { nhan: "Bảng giá lượt", href: "/gia" },
            { nhan: "Zalo hỗ trợ 24/7", href: "/huong-dan" },
          ]}
        />

        <FooterCot
          tieuDe="Pháp lý"
          muc={[
            { nhan: "Điều khoản sử dụng", href: "/dieu-khoan" },
            { nhan: "Chính sách dữ liệu", href: "/chinh-sach-du-lieu" },
            { nhan: "Chính sách hoàn tiền", href: "/chinh-sach-du-lieu#hoan-tien" },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-4">
        <span>© 2026 Trợ Thủ. Tất cả quyền được bảo lưu.</span>
        <span>Giao diện tối ưu riêng cho người đi làm Việt Nam 🇻🇳</span>
      </div>
    </footer>
  );
}

function FooterCot({ tieuDe, muc }: { tieuDe: string; muc: { nhan: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[14px] font-bold text-ink mb-1">{tieuDe}</div>
      {muc.map((m) => (
        <Link key={m.nhan} href={m.href} className="text-[13.5px] text-ink-3 hover:text-accent transition-colors">
          {m.nhan}
        </Link>
      ))}
    </div>
  );
}
