import type { MetadataRoute } from "next";

const GOC = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trolyai-vn.vercel.app";

/** Bật khi còn đang thử nội bộ — chặn toàn bộ máy tìm kiếm */
const RIENG_TU = process.env.NEXT_PUBLIC_CHE_DO_RIENG_TU === "1";

export default function robots(): MetadataRoute.Robots {
  if (RIENG_TU) {
    // Giai đoạn thử: không cho lập chỉ mục bất cứ thứ gì.
    // Bỏ biến NEXT_PUBLIC_CHE_DO_RIENG_TU khi sẵn sàng mở công khai.
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Phần trong app không có gì để xếp hạng và có dữ liệu riêng tư
      disallow: ["/app/", "/admin", "/api/", "/dang-nhap"],
    },
    sitemap: `${GOC}/sitemap.xml`,
  };
}
