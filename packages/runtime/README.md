# @trothu/runtime

Lớp **duy nhất** chạm tới AI trong toàn hệ thống.

Web app không import `@anthropic-ai/sdk` ở bất kỳ đâu khác. Đổi nhà cung cấp,
đổi model, hay đổi hẳn cách chạy agent chỉ được sửa trong thư mục này.

- `index.ts` — hợp đồng `Runtime` (start / poll / collect / cancel)
- `managed-agents.ts` — bản cài đặt hiện tại, dùng Claude Managed Agents
- `prompt.ts` — dựng lời nhắc từ định nghĩa công cụ

Muốn đổi sang worker tự dựng (phương án dự phòng ở ADR-0003 mục 6): viết một
class mới thoả `Runtime`, đổi chỗ khởi tạo trong `apps/web/lib/runtime.ts`.
Không đụng tới UI.
