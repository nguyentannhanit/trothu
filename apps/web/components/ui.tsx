import Link from "next/link";
import type { ReactNode } from "react";
import { EXT_STYLE, type FileExt } from "@/lib/tools";
import { vnd } from "@/lib/format";

export function cx(...v: (string | false | null | undefined)[]) {
  return v.filter(Boolean).join(" ");
}

/* ── Biểu tượng: SVG nét, không dùng emoji ────────────────────────── */
export function Icon({ d, size = 18, width = 1.9, className }: { d: string; size?: number; width?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  logo: "M4 7h9M4 12h16M4 17h6",
  search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-3.6-3.6",
  check: "M20 6L9 17l-5-5",
  arrowRight: "M5 12h13M12 6l6 6-6 6",
  chevronRight: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 6l-6 6 6 6",
  download: "M12 4v12M7 11l5 5 5-5M4 20h16",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  clock: "M12 3a9 9 0 1 1-9 9M12 7v5l3.5 2",
  warn: "M12 8v5M12 16h.01M12 3l9.5 17H2.5L12 3z",
  info: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 8h.01M11 12h1v4h1",
  lock: "M8 10V7a4 4 0 0 1 8 0v3M4 10h16v10H4z",
  copy: "M9 9h10v10H9zM5 15V5h10",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
  redo: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5",
  folder: "M4 6a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z",
  grid: "M4 5h7v6H4zM13 5h7v10h-7zM4 13h7v6H4zM13 17h7v2h-7z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0",
} as const;

/* ── Nút ──────────────────────────────────────────────────────────── */
type NutKieu = "chinh" | "toi" | "phu" | "vien" | "trang";
const NUT: Record<NutKieu, string> = {
  chinh: "bg-accent text-white hover:brightness-110 shadow-sm hover:shadow-md",
  toi: "bg-ink text-white hover:bg-slate-800 shadow-sm",
  phu: "bg-surface-3 text-ink hover:bg-surface-4 border border-line-strong",
  vien: "bg-transparent text-ink border-1.5 border-line-strong hover:bg-surface-3 hover:border-ink",
  trang: "bg-white text-ink hover:bg-surface-2 shadow-sm border border-line",
};
const CAO = { sm: "h-9 px-3.5 text-[13.5px]", md: "h-[42px] px-5 text-[14.5px]", lg: "h-12 px-6 text-[15px]" };

export function Nut({
  kieu = "chinh",
  co = "md",
  href,
  children,
  className,
  ...rest
}: {
  kieu?: NutKieu;
  co?: keyof typeof CAO;
  href?: string;
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cx(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold active-press transition-all duration-200 cursor-pointer select-none",
    NUT[kieu],
    CAO[co],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ── Thẻ ──────────────────────────────────────────────────────────── */
export function The({ children, className, nhoBong }: { children: ReactNode; className?: string; nhoBong?: boolean }) {
  return (
    <div
      className={cx(
        "bg-surface border-1.5 border-line rounded-2xl transition-all duration-200",
        nhoBong ? "shadow-c1 hover:shadow-c2 hover:-translate-y-1 hover:border-line-strong" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Nhãn định dạng tệp ──────────────────────────────────────────── */
export function NhanTep({ ext, size = "md" }: { ext: FileExt; size?: "sm" | "md" }) {
  const s = EXT_STYLE[ext];
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-md font-mono font-bold tracking-wider uppercase border border-current/10 shadow-2xs",
        s.fg,
        s.bg,
        size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10.5px] px-2 py-1",
      )}
    >
      {s.nhan}
    </span>
  );
}

/* ── Chip ─────────────────────────────────────────────────────────── */
export function Chip({ children, chon, className }: { children: ReactNode; chon?: boolean; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold border active-press transition-all duration-200 cursor-pointer select-none",
        chon ? "bg-accent text-white border-accent shadow-sm" : "bg-surface text-ink-2 border-line-strong hover:bg-surface-2 hover:border-ink-3",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ── Thanh tiến trình ─────────────────────────────────────────────── */
export function ThanhTienTrinh({ phanTram }: { phanTram: number }) {
  return (
    <div className="h-2 rounded-full bg-surface-4 overflow-hidden border border-line" role="progressbar" aria-valuenow={phanTram} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, phanTram))}%` }} />
    </div>
  );
}

/* ── Viên trạng thái ─────────────────────────────────────────────── */
const TRANG_THAI = {
  done: { nhan: "Xong", cls: "text-accent bg-accent-soft border border-accent-line" },
  running: { nhan: "Đang chạy", cls: "text-warn bg-[#FDF4E3] border border-warn-line" },
  failed: { nhan: "Lỗi", cls: "text-danger bg-danger-soft border border-danger/20" },
  queued: { nhan: "Xếp hàng", cls: "text-ink-3 bg-surface-3 border border-line" },
  cancelled: { nhan: "Đã huỷ", cls: "text-ink-3 bg-surface-3 border border-line" },
} as const;

export function VienTrangThai({ tt }: { tt: keyof typeof TRANG_THAI }) {
  const s = TRANG_THAI[tt];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", s.cls)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />
      {s.nhan}
    </span>
  );
}

/* ── Tiền ─────────────────────────────────────────────────────────── */
export function Tien({ n, co = "md" }: { n: number; co?: "sm" | "md" | "lg" | "xl" }) {
  const cls = {
    sm: "text-[13.5px] font-semibold",
    md: "text-[15px] font-extrabold tracking-[-0.02em]",
    lg: "text-[19px] font-extrabold tracking-[-0.02em]",
    xl: "text-[28px] font-extrabold tracking-[-0.03em]",
  }[co];
  return <span className={cx(cls, "tabular text-ink")}>{vnd(n)}</span>;
}

/* ── Khối lưu ý nền vàng ─────────────────────────────────────────── */
export function LuuY({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 bg-warn-soft border-1.5 border-warn-line rounded-xl px-4 py-3.5 shadow-2xs">
      <span className="text-warn shrink-0 mt-0.5">
        <Icon d={ICONS.warn} size={18} width={2.2} />
      </span>
      <div className="text-xs sm:text-sm leading-relaxed text-warn-ink font-medium">{children}</div>
    </div>
  );
}

/* ── Dòng có dấu tích ────────────────────────────────────────────── */
export function DongTich({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-accent shrink-0 mt-0.5 p-0.5 rounded-full bg-accent-soft">
        <Icon d={ICONS.check} size={15} width={2.8} />
      </span>
      <span className="text-xs sm:text-sm leading-relaxed text-ink-2 font-medium">{children}</span>
    </div>
  );
}
