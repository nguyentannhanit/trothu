import type { MetadataRoute } from "next";
import { NGANH, TOOLS, toolHref } from "@/lib/tools";

const GOC = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trolyai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Che do rieng tu: sitemap rong, khong chi duong cho may tim kiem
  if (process.env.NEXT_PUBLIC_CHE_DO_RIENG_TU === "1") return [];

  const now = new Date();
  return [
    { url: GOC, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${GOC}/gia`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${GOC}/huong-dan`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...NGANH.map((n) => ({
      url: `${GOC}/${n.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    // Trang công cụ vừa là trang bán vừa là trang SEO — ưu tiên cao nhất sau trang chủ
    ...TOOLS.map((t) => ({
      url: `${GOC}${toolHref(t)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
