"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { DongTich, Icon, ICONS, LuuY, Nut, The, Tien, cx } from "@/components/ui";
import { vnd } from "@/lib/format";

const GOI = [
  { tien: 50_000, tang: 0, luot: "~1 bài giảng", phanTram: 0 },
  { tien: 100_000, tang: 0, luot: "~2 bài giảng", phanTram: 0 },
  { tien: 300_000, tang: 15_000, luot: "~7 bài giảng", phanTram: 5 },
  { tien: 500_000, tang: 50_000, luot: "~12 bài giảng", phanTram: 10 },
];

const QUY_DOI = [
  { ten: "Bài giảng PowerPoint · 45.000₫", gia: 45_000 },
  { ten: "Bài giảng từ mẫu · 15.000₫", gia: 15_000 },
  { ten: "Đề kiểm tra · 12.000₫", gia: 12_000 },
  { ten: "Phiếu bài tập · 9.000₫", gia: 9_000 },
];

export default function FormNap({ soDu }: { soDu: number }) {
  const [selectedGoi, setSelectedGoi] = useState(GOI[2]); // Default 300k
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"agribank" | "momo">("agribank");
  const [showQrModal, setShowQrModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tính toán số tiền
  const numCustomAmount = parseInt(customAmount.replace(/\D/g, ""), 10) || 0;
  const isCustom = numCustomAmount >= 50_000;
  const currentAmount = isCustom ? numCustomAmount : selectedGoi.tien;
  const currentBonus = isCustom
    ? numCustomAmount >= 500_000
      ? Math.round(numCustomAmount * 0.1)
      : numCustomAmount >= 300_000
      ? Math.round(numCustomAmount * 0.05)
      : 0
    : selectedGoi.tang;

  const soDuHienTai = soDu;
  const sauKhiNap = soDuHienTai + currentAmount + currentBonus;

  // Tạo mã QR & Mở Modal
  const handleTaoMaQR = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setTransactionId(randomCode);
    setShowQrModal(true);
  };

  // Copy text helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // VietQR / MoMo URLs
  const noiDungChuyenKhoan = `NAP TROLYAI ${transactionId || "8382"}`;
  const vietQrUrl = `https://img.vietqr.io/image/agribank-5507205155771-compact2.png?amount=${currentAmount}&addInfo=${encodeURIComponent(
    noiDungChuyenKhoan
  )}&accountName=NGUYEN%20TAN%20NHAN`;

  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=2|99|0383331807|NGUYEN%20TAN%20NHAN||0|0|${currentAmount}|${encodeURIComponent(
    noiDungChuyenKhoan
  )}`;

  return (
    <div className="max-w-[1000px] mx-auto px-5 lg:px-6 pt-9 pb-13">
      <h1 className="text-[30px] font-bold tracking-[-0.03em] mb-1.5">Nạp tiền vào tài khoản</h1>
      <p className="text-[15.5px] text-ink-2 mb-7">
        Tiền trong tài khoản không hết hạn và dùng được cho mọi công cụ ở cả 5 ngành.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px] items-start">
        <div className="flex flex-col gap-3.5">
          {/* BƯỚC 1: CHỌN SỐ TIỀN */}
          <The className="p-5.5">
            <Buoc so={1} ten="Chọn số tiền" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
              {GOI.map((g) => {
                const isSelected = !isCustom && selectedGoi.tien === g.tien;
                return (
                  <button
                    key={g.tien}
                    type="button"
                    onClick={() => {
                      setSelectedGoi(g);
                      setCustomAmount("");
                    }}
                    className={cx(
                      "relative rounded-xl border-2 px-3.5 py-3.5 text-left transition-all cursor-pointer active-press",
                      isSelected ? "bg-accent-soft border-accent shadow-sm" : "bg-surface border-line-strong hover:border-accent/40"
                    )}
                  >
                    <div className="text-[18px] font-bold tracking-[-0.025em] tabular">{vnd(g.tien)}</div>
                    <div className="text-[12.5px] text-ink-3 mt-0.5">{g.luot}</div>
                    {g.tang > 0 && (
                      <span className="absolute -top-2.5 right-2.5 text-[11px] font-extrabold text-white bg-accent rounded-full px-2 py-0.5 shadow-xs">
                        Tặng {g.phanTram}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ô nhập số tiền tùy chỉnh */}
            <div
              className={cx(
                "flex items-center gap-3 border-2 rounded-xl px-4 py-3 transition-all",
                isCustom ? "border-accent bg-accent-soft/30" : "border-dashed border-line-strong bg-surface"
              )}
            >
              <span className="text-[13.5px] font-medium text-ink-2">Hoặc nhập số khác:</span>
              <input
                type="text"
                placeholder="Ví dụ: 200.000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="grow font-mono text-base font-semibold text-ink bg-transparent outline-none placeholder:text-ink-4"
              />
              <span className="text-sm font-semibold text-ink-3">₫ (tối thiểu 50.000₫)</span>
            </div>
          </The>

          {/* BƯỚC 2: CÁCH THANH TOÁN */}
          <The className="p-5.5">
            <Buoc so={2} ten="Cách thanh toán" />
            <div className="grid sm:grid-cols-2 gap-3 mb-5.5">
              {/* Agribank VietQR Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("agribank")}
                className={cx(
                  "flex items-center gap-3 border-2 rounded-xl px-4 py-3.5 text-left transition-all cursor-pointer active-press",
                  paymentMethod === "agribank" ? "bg-accent-soft border-accent shadow-sm" : "bg-surface border-line-strong hover:border-accent/40"
                )}
              >
                <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-surface text-accent shrink-0 border border-line shadow-xs">
                  <Icon d={ICONS.qr} size={20} />
                </span>
                <div className="grow">
                  <div className="text-[14.5px] font-bold text-ink">Chuyển khoản VietQR</div>
                  <div className="text-[12px] text-ink-3 mt-px">Agribank · Tự động cộng tiền</div>
                </div>
                {paymentMethod === "agribank" && (
                  <span className="text-accent">
                    <Icon d={ICONS.check} size={18} width={2.8} />
                  </span>
                )}
              </button>

              {/* MoMo Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("momo")}
                className={cx(
                  "flex items-center gap-3 border-2 rounded-xl px-4 py-3.5 text-left transition-all cursor-pointer active-press",
                  paymentMethod === "momo" ? "bg-[#F6E9F2] border-[#D82D8B] shadow-sm" : "bg-surface border-line-strong hover:border-[#D82D8B]/40"
                )}
              >
                <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-[#D82D8B] text-white font-extrabold text-sm shrink-0 shadow-xs">
                  MoMo
                </span>
                <div className="grow">
                  <div className="text-[14.5px] font-bold text-ink">Ví MoMo</div>
                  <div className="text-[12px] text-ink-3 mt-px">Quét mã Ví MoMo 0383331807</div>
                </div>
                {paymentMethod === "momo" && (
                  <span className="text-[#D82D8B]">
                    <Icon d={ICONS.check} size={18} width={2.8} />
                  </span>
                )}
              </button>
            </div>

            <div className="border border-line rounded-xl bg-surface-2 p-5">
              <p className="text-[13.5px] leading-relaxed text-ink-2 mb-3">
                Mã QR và thông tin chuyển khoản chính xác sẽ hiển thị ngay khi anh chị bấm nút <strong className="font-semibold text-ink">Lấy mã QR thanh toán</strong>.
              </p>
              <LuuY>
                Giữ nguyên <strong className="font-semibold">nội dung chuyển khoản</strong> mà hệ thống cấp để tiền tự động cộng vào tài khoản trong 1 phút.
              </LuuY>
            </div>
          </The>
        </div>

        {/* CỘT ĐƠN NẠP BÊN PHẢI */}
        <div className="flex flex-col gap-3.5">
          <The className="p-5.5 rounded-2xl shadow-c3 border-2 border-line-strong">
            <div className="text-[16px] font-extrabold tracking-[-0.015em] mb-4 text-ink">Tóm tắt đơn nạp</div>
            <div className="flex flex-col gap-2.5">
              <Dong ten="Số tiền nạp" tien={vnd(currentAmount)} />
              {currentBonus > 0 && <Dong ten="Tặng thêm ưu đãi" tien={`+ ${vnd(currentBonus)}`} nhan />}
              <Dong ten="Số dư hiện có" tien={vnd(soDuHienTai)} />
            </div>
            <div className="border-t border-line mt-4 pt-4 flex items-baseline justify-between">
              <span className="text-[14.5px] font-bold text-ink">Số dư sau khi nạp</span>
              <Tien n={sauKhiNap} co="xl" />
            </div>

            <Nut
              kieu="chinh"
              co="lg"
              onClick={handleTaoMaQR}
              className="w-full mt-5 font-extrabold text-base shadow-md active-press"
            >
              {paymentMethod === "agribank" ? "Lấy mã QR chuyển khoản →" : "Tạo mã quét MoMo →"}
            </Nut>
          </The>

          {/* QUY ĐỔI GIÁ TRI */}
          <The className="p-4.5">
            <div className="text-[13.5px] font-bold mb-3.5 text-ink">{vnd(sauKhiNap)} dùng được bao nhiêu?</div>
            <div className="flex flex-col gap-3">
              {QUY_DOI.map((q) => {
                const so = Math.floor(sauKhiNap / q.gia);
                const max = Math.max(1, Math.floor(sauKhiNap / QUY_DOI[QUY_DOI.length - 1].gia));
                return (
                  <div key={q.ten}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[13px] text-ink-2">{q.ten}</span>
                      <span className="font-mono text-[12.5px] font-bold text-ink tabular">{so} lần</span>
                    </div>
                    <div className="h-[5px] rounded-sm bg-surface-4 overflow-hidden">
                      <div
                        className="h-full rounded-sm bg-accent transition-all duration-300"
                        style={{ width: `${Math.min(100, (so / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </The>

          <The className="px-4.5 py-4 flex flex-col gap-2.5 text-xs text-ink-3">
            <DongTich>Tiền không hết hạn, không tự động gia hạn</DongTich>
            <DongTich>Chạy lỗi được hoàn lại 100% vào tài khoản</DongTich>
            <DongTich>Hỗ trợ Zalo xuất hóa đơn: 0383331807</DongTich>
          </The>
        </div>
      </div>

      {/* ── MODAL HIỂN THỊ MÃ QR CHUYỂN KHOẢN VÀ THÔNG TIN ── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border-2 border-line-strong rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-lg font-extrabold text-ink">
                  {paymentMethod === "agribank" ? "Mã QR Chuyển Khoản Agribank" : "Mã QR Thanh Toán MoMo"}
                </h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-surface-3 hover:bg-surface-4 flex items-center justify-center font-bold text-ink-3 hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* QR Code Container */}
            <div className="my-5 flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-line shadow-inner text-center">
              <img
                src={paymentMethod === "agribank" ? vietQrUrl : momoQrUrl}
                alt="Mã QR Chuyển Khoản"
                className="w-56 h-56 object-contain rounded-lg border border-slate-100"
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Mở app {paymentMethod === "agribank" ? "Ngân hàng (VietQR)" : "Ví MoMo"} để quét mã tự động
              </p>
            </div>

            {/* Chi tiết chuyển khoản */}
            <div className="bg-surface-2 border border-line rounded-xl p-4 space-y-3 text-sm">
              {/* Ngân hàng / Ví */}
              <div className="flex items-center justify-between">
                <span className="text-ink-3 text-xs">Phương thức:</span>
                <span className="font-bold text-ink">
                  {paymentMethod === "agribank" ? "Agribank (Nông Nghiệp)" : "Ví Điện Tử MoMo"}
                </span>
              </div>

              {/* STK */}
              <div className="flex items-center justify-between">
                <span className="text-ink-3 text-xs">
                  {paymentMethod === "agribank" ? "Số tài khoản:" : "Số điện thoại MoMo:"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink text-base">
                    {paymentMethod === "agribank" ? "5507205155771" : "0383331807"}
                  </span>
                  <button
                    onClick={() => handleCopy(paymentMethod === "agribank" ? "5507205155771" : "0383331807", "stk")}
                    className="text-xs text-accent font-semibold hover:underline cursor-pointer"
                  >
                    {copiedField === "stk" ? "✓ Đã chép" : "Chép"}
                  </button>
                </div>
              </div>

              {/* Tên chủ TK */}
              <div className="flex items-center justify-between">
                <span className="text-ink-3 text-xs">Chủ tài khoản:</span>
                <span className="font-bold text-ink uppercase">NGUYEN TAN NHAN</span>
              </div>

              {/* Số tiền */}
              <div className="flex items-center justify-between pt-2 border-t border-line">
                <span className="text-ink-3 text-xs">Số tiền cần chuyển:</span>
                <span className="font-mono font-extrabold text-accent text-lg">{vnd(currentAmount)}</span>
              </div>

              {/* Nội dung chuyển khoản */}
              <div className="flex items-center justify-between bg-amber-soft border border-amber-line p-3 rounded-lg">
                <div>
                  <span className="text-[11px] font-bold text-amber-accent block uppercase">Nội dung chuyển khoản (Bắt buộc)</span>
                  <span className="font-mono font-extrabold text-ink text-base tracking-wider">{noiDungChuyenKhoan}</span>
                </div>
                <button
                  onClick={() => handleCopy(noiDungChuyenKhoan, "nd")}
                  className="bg-amber-accent text-white text-xs font-bold px-3 py-1.5 rounded-md hover:brightness-110 active-press cursor-pointer shrink-0"
                >
                  {copiedField === "nd" ? "✓ Đã chép" : "Copy mã"}
                </button>
              </div>
            </div>

            {/* Footer action */}
            <div className="mt-5 flex flex-col gap-2 text-center">
              <a
                href="https://zalo.me/0383331807"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-sm"
              >
                Đã chuyển khoản? Xác nhận qua Zalo 0383331807 ↗
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs text-ink-3 hover:text-ink font-semibold py-1 cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Buoc({ so, ten }: { so: number; ten: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-ink text-white font-mono text-[11px]">
        {so}
      </span>
      <span className="text-base font-semibold tracking-[-0.015em]">{ten}</span>
    </div>
  );
}

function Dong({ ten, tien, nhan }: { ten: string; tien: string; nhan?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[13.5px]">
      <span className="text-ink-3">{ten}</span>
      <span className={cx("font-medium tabular", nhan && "text-accent font-semibold")}>{tien}</span>
    </div>
  );
}
