/**
 * Dựng lời nhắc gửi cho agent từ định nghĩa công cụ và dữ liệu người dùng nhập.
 *
 * Cố ý viết bằng tiếng Việt: ppt-master khớp ngôn ngữ nguồn, và người dùng
 * muốn đầu ra tiếng Việt. Xem SKILL.md mục Global Communication Rules.
 */

export interface PromptArgs {
  /** ví dụ: "Tạo bài giảng PowerPoint" */
  tenCongCu: string;
  /** slug skill của ppt-master nếu công cụ này dùng nó */
  skill?: string;
  /** dữ liệu người dùng nhập, đã có nhãn tiếng Việt */
  truong: { label: string; value: string }[];
  /** tuỳ chọn đã bật */
  tuyChon: string[];
  /** tên file người dùng tải lên, đã gắn ở /workspace/nguon/ */
  files: string[];
  /** yêu cầu định dạng đầu ra */
  ext: string;
}

export function buildPrompt(a: PromptArgs): string {
  const d: string[] = [];

  d.push(`Nhiệm vụ: ${a.tenCongCu}.`);
  d.push("");

  if (a.files.length > 0) {
    d.push("Nguồn nội dung — đọc kỹ trước khi làm:");
    a.files.forEach((f) => d.push(`- /workspace/nguon/${f}`));
    d.push("");
    d.push("Bám sát nội dung trong các file trên. Không tự thêm phần ngoài phạm vi nguồn.");
    d.push("");
  }

  if (a.truong.length > 0) {
    d.push("Yêu cầu cụ thể:");
    a.truong.filter((t) => t.value).forEach((t) => d.push(`- ${t.label}: ${t.value}`));
    d.push("");
  }

  if (a.tuyChon.length > 0) {
    d.push("Tuỳ chọn đã bật:");
    a.tuyChon.forEach((t) => d.push(`- ${t}`));
    d.push("");
  }

  d.push("Ràng buộc bắt buộc:");
  d.push("- Toàn bộ nội dung viết bằng tiếng Việt, đúng chính tả và dấu.");
  d.push(`- Ghi file kết quả vào /mnt/session/outputs/ dưới dạng .${a.ext}`);
  d.push("- Không hỏi lại. Thiếu thông tin thì tự quyết định hợp lý rồi ghi chú lại ở cuối.");
  d.push("- Làm một mạch tới khi có file kết quả. Không dừng giữa chừng chờ xác nhận.");

  if (a.skill) {
    d.push("");
    d.push(`Dùng skill ${a.skill}, chạy chế độ nhanh (quick generate) — bỏ bước xác nhận thiết kế.`);
  }

  return d.join("\n");
}
