/**
 * Sinh liên kết đăng nhập dùng một lần rồi mở luôn trình duyệt.
 *
 * Dùng khi phát triển: không cần cấu hình email, không cần Google OAuth.
 * Chạy: node scripts/dang-nhap-nhanh.mjs [email]
 */
import fs from "node:fs";
import { execFile } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const ENV_PATH = new URL("../apps/web/.env.local", import.meta.url);
const env = Object.fromEntries(
  fs
    .readFileSync(ENV_PATH, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const email = process.argv[2] || "nguyentannhanit@gmail.com";
// Địa chỉ web: tham số thứ 3 > .env.local > máy mình.
// Truyền tham số để mở thẳng bản đang chạy trên mạng mà không cần bật máy chủ dev.
const goc = process.argv[3] || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Thiếu cấu hình Supabase trong apps/web/.env.local");
  process.exit(1);
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await sb.auth.admin.generateLink({ type: "magiclink", email });
if (error) {
  console.error("Không sinh được liên kết:", error.message);
  process.exit(1);
}

const link = `${goc}/api/auth/confirm?token_hash=${data.properties.hashed_token}&type=email&next=/app`;

console.log("");
console.log("  Tài khoản: " + email);
console.log("  Đang mở trình duyệt...");
console.log("");
console.log("  Nếu không tự mở, dán liên kết này vào trình duyệt:");
console.log("  " + link);
console.log("");

// Thử hai cách mở. `start` chạy tốt ở quyền người dùng thường; `explorer.exe` là
// phương án dự phòng khi tiến trình đang chạy ở quyền quản trị — Windows chặn
// tiến trình quyền cao mở tab trong trình duyệt quyền thường, nhưng Explorer thì được.
function moTrinhDuyet(url) {
  return new Promise((resolve) => {
    execFile("cmd", ["/c", "start", "", url], (err) => {
      if (!err) return resolve(true);
      execFile("explorer.exe", [url], () => resolve(true)); // explorer luôn trả lỗi giả, bỏ qua
    });
  });
}

await moTrinhDuyet(link);
