// Định dạng hiển thị — dùng chung, đừng tự viết lại ở từng màn.

/** 45000 → "45.000₫" */
export function vnd(n: number): string {
  return `${n.toLocaleString("vi-VN")}₫`;
}

/** micro-USD → đồng. Tỉ giá tạm cứng, xem docs/data-model.md mục 5 */
export const USD_VND = 26_000;
export function umdToVnd(umd: number): number {
  return Math.round((umd * USD_VND) / 1_000_000);
}

/** [10, 20] → "10–20 phút" */
export function khoangThoiGian([a, b]: [number, number]): string {
  return `${a}–${b} phút`;
}

/** 384 → "6 phút" · 45 → "45 giây" */
export function conLai(giay: number): string {
  if (giay < 90) return `${Math.max(0, Math.round(giay))} giây`;
  return `${Math.round(giay / 60)} phút`;
}

const NGAY = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

/** Thời điểm theo cách người Việt nói: "hôm qua 22:10", "24/08 20:02" */
export function khiNao(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const gio = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const ngayD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const ngayN = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lech = Math.round((ngayN - ngayD) / 86_400_000);
  if (lech === 0) return `hôm nay ${gio}`;
  if (lech === 1) return `hôm qua ${gio}`;
  if (lech < 7) return `${lech} ngày trước`;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${gio}`;
}

export function thuNgay(d = new Date()): string {
  return `${NGAY[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "Cô Hương Lan" → "HL" */
export function chuCaiDau(ten: string): string {
  const p = ten.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  return (p.slice(-2).map((x) => x[0]).join("") || "?").toUpperCase();
}

/** Số dư còn dùng được bao nhiêu lần công cụ giá `gia` */
export function conBaoNhieuLan(soDu: number, gia: number): number {
  return gia > 0 ? Math.floor(soDu / gia) : 0;
}
