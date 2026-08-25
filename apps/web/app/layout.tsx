import type { Metadata } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Be Vietnam Pro là bộ chữ thiết kế riêng cho tiếng Việt — dấu không chồng lên chữ hoa
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://trothu.vercel.app"),
  title: {
    default: "Trợ Thủ — Công cụ xử lý giấy tờ cho người đi làm",
    template: "%s — Trợ Thủ",
  },
  description:
    "Bài giảng, biên bản, báo cáo, hợp đồng — nhập nội dung, nhận về file Word, Excel, PowerPoint sửa được từng chữ. Trả theo lượt, không thuê bao.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Trợ Thủ",
  },
  // Che do rieng tu: chan may tim kiem o CA the meta lan robots.txt.
  // Bo bien NEXT_PUBLIC_CHE_DO_RIENG_TU khi san sang mo cong khai.
  robots:
    process.env.NEXT_PUBLIC_CHE_DO_RIENG_TU === "1"
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${beVietnam.variable} ${plexMono.variable} font-sans`}>{children}</body>
    </html>
  );
}
