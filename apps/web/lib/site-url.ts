/**
 * Hàm lấy URL trang web an toàn 100%.
 * Tự động thêm https:// nếu thiếu và bắt mọi lỗi URL không hợp lệ
 * từ biến môi trường NEXT_PUBLIC_SITE_URL.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  const fallback = "https://trolyai-vn.vercel.app";

  if (!raw || typeof raw !== "string") return fallback;

  let url = raw.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  try {
    return new URL(url).origin;
  } catch {
    return fallback;
  }
}
