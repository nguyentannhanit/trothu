"use client";

import Link from "next/link";

import { useState } from "react";
import { Logo } from "@/components/site-chrome";
import { Icon, ICONS, Nut } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { NGANH, TOOLS } from "@/lib/tools";

// Nút Google chỉ hiện khi đã khai báo client ID bên Supabase.
// Chưa bật mà vẫn hiện thì bấm vào là rơi vào trang lỗi "provider is not enabled".
const GOOGLE_BAT = process.env.NEXT_PUBLIC_GOOGLE_BAT === "1";

// Giai đoạn thử nội bộ: Supabase đang tắt đăng ký, email lạ sẽ bị từ chối
const RIENG_TU = process.env.NEXT_PUBLIC_CHE_DO_RIENG_TU === "1";

const LY_DO = [
  {
    ten: "File sửa được, không phải ảnh",
    moTa: "Mở bằng PowerPoint và Word có sẵn trên máy, bấm vào từng chữ từng hình để sửa.",
    icon: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z",
  },
  {
    ten: "Biết giá trước khi bấm",
    moTa: "Mỗi công cụ ghi rõ giá một lần dùng. Nạp bao nhiêu tiêu bấy nhiêu, tiền không hết hạn.",
    icon: "M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  },
  {
    ten: "Tài liệu của bạn không đi đâu cả",
    moTa: "File tải lên bị xoá sau 7 ngày, không dùng để huấn luyện, không chia sẻ cho ai.",
    icon: "M12 3l8 4v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V7l8-4z",
  },
];

export default function DangNhap() {
  const [email, setEmail] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [daGui, setDaGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function guiLienKet(e: React.FormEvent) {
    e.preventDefault();
    setLoi(null);
    setDangGui(true);
    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Không gửi được liên kết");
      setDaGui(true);
    } catch (e) {
      setLoi(dienGiaiLoi(e));
    } finally {
      setDangGui(false);
    }
  }

  async function vaoBangGoogle() {
    setLoi(null);
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/api/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setLoi("Chưa vào được bằng Google. Thử lại hoặc dùng email.");
    }
  }

  // Đổi lỗi tiếng Anh của Supabase sang câu người dùng hiểu được
  function dienGiaiLoi(e: unknown): string {
    const msg = (e instanceof Error ? e.message : "").toLowerCase();
    if (msg.includes("signups not allowed") || msg.includes("signup is disabled"))
      return "Địa chỉ này chưa có tài khoản và tính năng tự đăng ký đang bị tắt ở Supabase. Bạn cần bật 'Allow new users to sign up' trong Supabase Dashboard -> Authentication -> Providers -> Email.";
    if (msg.includes("rate limit") || msg.includes("too many"))
      return "Gửi quá nhiều thư trong thời gian ngắn. Chờ khoảng một giờ rồi thử lại.";
    return "Không gửi được liên kết. Kiểm tra lại địa chỉ email rồi thử lần nữa.";
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Trái: lý do */}
      <div className="hidden lg:flex flex-col bg-ink text-white px-14 py-13">
        <Logo />
        <h2 className="mt-13 text-[32px] leading-[1.18] font-bold tracking-[-0.03em]">
          Việc đầu tiên
          <br />
          không mất tiền.
        </h2>
        <p className="mt-4 mb-10 text-[15.5px] leading-relaxed text-white/60 max-w-[42ch]">
          Đăng nhập là dùng được ngay. Không cần thẻ ngân hàng, không tự động gia hạn, không có gói dùng thử hết hạn.
        </p>

        <div className="flex flex-col gap-5">
          {LY_DO.map((l) => (
            <div key={l.ten} className="flex items-start gap-3.5">
              <span className="inline-flex w-8.5 h-8.5 items-center justify-center rounded-[10px] bg-white/7 shrink-0 text-accent-line">
                <Icon d={l.icon} size={17} />
              </span>
              <div>
                <div className="text-[15px] font-semibold mb-1">{l.ten}</div>
                <p className="text-[13.5px] leading-relaxed text-white/55">{l.moTa}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grow" />
        <div className="border-t border-white/10 pt-5.5 flex items-center gap-6.5">
          {[
            { so: String(TOOLS.length), ten: "công cụ" },
            { so: String(NGANH.length), ten: "ngành nghề" },
            { so: "24/7", ten: "hỗ trợ Zalo" },
          ].map((s) => (
            <div key={s.ten}>
              <div className="font-mono text-[19px] font-medium mb-0.5 tabular">{s.so}</div>
              <div className="text-[12.5px] text-white/45">{s.ten}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phải: form */}
      <div className="flex items-center justify-center px-6 py-13">
        <div className="w-full max-w-[396px]">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <h1 className="text-[27px] font-bold tracking-[-0.03em] mb-1.5">Đăng nhập</h1>
          <p className="text-[14.5px] text-ink-3 mb-7">
            {RIENG_TU
              ? "Trợ Lý AI đang chạy thử nội bộ. Chỉ những địa chỉ đã được mời mới đăng nhập được."
              : "Chưa có tài khoản? Cứ đăng nhập — hệ thống tự tạo cho bạn."}
          </p>

          {daGui ? (
            <div className="bg-accent-soft border border-accent-line rounded-xl px-5 py-5">
              <div className="flex items-start gap-2.5">
                <span className="text-accent shrink-0 mt-px">
                  <Icon d={ICONS.check} size={18} width={2.6} />
                </span>
                <div>
                  <div className="text-[15px] font-semibold text-accent mb-1">Đã gửi liên kết</div>
                  <p className="text-[13.5px] leading-relaxed text-ink-2">
                    Mở hộp thư <strong className="font-semibold">{email}</strong> và bấm vào đường dẫn trong thư. Nếu
                    không thấy, kiểm tra mục thư rác.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {GOOGLE_BAT && (
                <>
                  <button
                    onClick={vaoBangGoogle}
                    className="w-full h-12.5 flex items-center justify-center gap-3 rounded-xl border border-line-strong bg-surface text-[15px] font-semibold hover:bg-surface-2 cursor-pointer"
                  >
                    <GoogleIcon />
                    Tiếp tục với Google
                  </button>

                  <div className="flex items-center gap-3.5 my-5">
                    <span className="grow h-px bg-line" />
                    <span className="text-[12.5px] text-ink-5">hoặc</span>
                    <span className="grow h-px bg-line" />
                  </div>
                </>
              )}

              <form onSubmit={guiLienKet}>
                <label htmlFor="email" className="block text-[13px] font-medium text-ink-2 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten.cua.ban@gmail.com"
                  className="w-full h-12.5 px-4 rounded-xl border border-line-strong bg-surface text-[15px] placeholder:text-ink-5 mb-3"
                />
                <Nut kieu="chinh" co="lg" className="w-full" disabled={dangGui}>
                  {dangGui ? "Đang gửi…" : "Gửi liên kết đăng nhập"}
                </Nut>
              </form>

              {loi && <p className="mt-3 text-[13.5px] text-danger">{loi}</p>}

              <div className="flex items-start gap-2.5 bg-surface border border-line rounded-xl px-4 py-3.5 mt-5.5">
                <span className="text-ink-4 shrink-0 mt-px">
                  <Icon d="M3 5h18v14H3zM3 7l9 6 9-6" size={16} />
                </span>
                <p className="text-[12.5px] leading-relaxed text-ink-3">
                  Không cần nhớ mật khẩu. Trợ Lý AI gửi một đường dẫn vào email, bấm vào là vào thẳng tài khoản.
                </p>
              </div>
            </>
          )}

          <p className="mt-5.5 text-center text-[12.5px] leading-relaxed text-ink-5">
            Đăng nhập là đồng ý với{" "}
            <Link href="/dieu-khoan" className="text-ink-3 underline">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="/chinh-sach-du-lieu" className="text-ink-3 underline">
              Chính sách dữ liệu
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22 12.2c0-.7-.06-1.4-.18-2.05H12v3.88h5.62a4.8 4.8 0 0 1-2.08 3.15v2.6h3.36C20.87 18 22 15.36 22 12.2z" />
      <path fill="#34A853" d="M12 22.5c2.82 0 5.18-.93 6.9-2.53l-3.36-2.6c-.94.63-2.14 1-3.54 1-2.72 0-5.03-1.83-5.85-4.3H2.68v2.7A10.44 10.44 0 0 0 12 22.5z" />
      <path fill="#FBBC05" d="M6.15 14.07a6.2 6.2 0 0 1 0-3.99v-2.7H2.68a10.4 10.4 0 0 0 0 9.39l3.47-2.7z" />
      <path fill="#EA4335" d="M12 5.78c1.53 0 2.9.53 3.99 1.56l2.98-2.98C17.17 2.7 14.81 1.7 12 1.7a10.44 10.44 0 0 0-9.32 5.68l3.47 2.7c.82-2.47 3.13-4.3 5.85-4.3z" />
    </svg>
  );
}
