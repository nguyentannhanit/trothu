# Trợ Thủ — Kế hoạch và lộ trình

- **Trạng thái:** Đề xuất — chờ duyệt
- **Ngày:** 2026-08-24 (viết lại toàn bộ; bản 2026-08-23 dành cho app desktop đã bỏ)
- **Căn cứ:** [ADR-0001 runtime](./adr/0001-ai-runtime.md) · [ADR-0003 kiến trúc web](./adr/0003-web-architecture.md) · [ADR-0004 giá](./adr/0004-pricing-and-unit-economics.md) · [ADR-0005 thanh toán](./adr/0005-payments-and-credits.md)

> ⚠️ **Chưa có dòng mã sản phẩm nào được viết, chưa cài dependency nào.** Hiện repo chỉ có `docs/`, `design/` và `vendor/ppt-master`. Quy tắc anh đặt là hỏi trước khi cài dependency — nên phần dựng mã chờ anh duyệt.

---

## 1. Sản phẩm là gì

**Trợ Thủ** — nền tảng web bán công cụ xử lý giấy tờ theo lượt cho người đi làm Việt Nam. Ra mắt với ngành Giáo dục, kiến trúc chừa sẵn cho 15 ngành.

| | |
|---|---|
| Địa chỉ tạm | `trothu.vercel.app` (phải mua tên miền thật trước khi ship — xem `seo-plan.md` mục 9) |
| Stack | Next.js trên Vercel · Supabase · Claude Managed Agents |
| Lõi sinh nội dung | `vendor/ppt-master` (MIT) nạp làm Agent Skill |
| Thu tiền | Nạp credit trước, chuyển khoản QR qua SePay; MoMo sau khi có GPKD |
| Ngành đầu | Giáo dục — 6 công cụ |

---

## 2. Cây thư mục

Đầy đủ ở [ADR-0003 mục 8](./adr/0003-web-architecture.md). Tóm tắt:

```
trothu/
├── apps/web/            Next.js — marketing (tĩnh, cho SEO) + app + quản trị
├── supabase/            migration + Edge Function (dispatcher, poller)
├── packages/runtime/    LỚP DUY NHẤT gọi AI — run_job()
├── vendor/ppt-master/   MIT, không sửa
├── design/              12 artboard đã duyệt
└── docs/
```

**Ranh giới để thêm ngành mà không đụng lõi:** mỗi công cụ khai báo trong một file ở `apps/web/lib/tools/`. Thêm công cụ = thêm một file + một agent trên Anthropic. Không sửa `packages/runtime`, không sửa dispatcher/poller, không sửa sổ credit.

Bài kiểm tra: `git diff --name-only` sau khi thêm một công cụ mới chỉ được hiện file trong `lib/tools/` và `migrations/`. Hiện chỗ khác là ranh giới đã hỏng.

---

## 3. Lộ trình

Năm mốc, tuần tự. Mốc rủi ro cao nhất làm trước.

### M0 — Việc thủ công của anh *(làm song song, không chặn M1)*

Chi tiết và thứ tự ở [`viec-anh-phai-tu-lam.md`](./viec-anh-phai-tu-lam.md). Gồm: tài khoản Anthropic có thanh toán, tên miền, tài khoản ngân hàng riêng, GPKD, Search Console.

**Xong khi:** có `ANTHROPIC_API_KEY` chạy được và tên miền đã trỏ.

---

### M1 — PoC lõi, chạy bằng CLI, chưa có web

**Đây là mốc rủi ro cao nhất.** Toàn bộ giả định của bốn ADR đứng hay sập ở đây. Không viết một dòng giao diện nào trước khi M1 xong.

Phạm vi: một script Node hoặc Python gọi Managed Agents, nạp skill ppt-master, ra file `.pptx`.

| # | Tiêu chí "xong" | Cách kiểm |
|---|---|---|
| 1 | Skill ppt-master nạp được vào Managed Agents | Sự kiện khởi tạo session liệt kê đúng tên skill |
| 2 | Sandbox `pip install` được `requirements.txt` | Chạy được `svg_to_pptx.py --help` trong sandbox |
| 3 | Một file `.docx` vào → một file `.pptx` ra | `files.list(scope_id)` trả về đúng một file `.pptx` |
| 4 | File mở được trong PowerPoint thật, **không** hiện hộp thoại "cần sửa chữa" | Mở thủ công |
| 5 | Nội dung là đối tượng PowerPoint gốc, không phải ảnh | Bấm vào một textbox, sửa được chữ; bấm một hình, đổi được màu |
| 6 | Số trang khớp yêu cầu, sai lệch tối đa ±1 | Đếm |
| 7 | **Đo chi phí thật** cả Haiku 4.5 và Sonnet 5, mỗi bên 5 lần | Ghi `usage` → so với ADR-0004 → **cập nhật lại ADR-0004 bằng số đo** |
| 8 | **Đo chênh lệch chất lượng** hai model | Cùng một giáo án, 10 lần mỗi model, đếm số trang tràn chữ / lệch bố cục |
| 9 | Đường dẫn và nội dung tiếng Việt không làm hỏng lệnh | Đặt tên project `Bài giảng Ngữ văn 8 — Lão Hạc` |
| 10 | `budget` của session chặn được khi vượt trần | Đặt trần thấp có chủ ý, xác nhận session dừng ở `budget_reached` |
| 11 | Đo được luồng "từ mẫu có sẵn" (Fill Native PPTX) | Chạy 5 lần, ghi chi phí |

**Sản phẩm giao:** một file `.pptx` mở được + bảng số đo chi phí thật + ADR-0004 đã cập nhật + kết luận chọn model mặc định.

**Nếu M1 thất bại** (ppt-master không chạy được trong sandbox của Anthropic): chuyển sang phương án dự phòng ở [ADR-0003 mục 6](./adr/0003-web-architecture.md) — worker riêng trên Fly.io hoặc VPS. Toàn bộ phần còn lại của kế hoạch **không đổi**.

---

### M2 — Web tối thiểu, một công cụ, nạp tiền thủ công

Phạm vi: Next.js + Supabase + đúng **một** công cụ (Tạo bài giảng PowerPoint). Chưa có thanh toán tự động — anh cộng credit bằng tay từ trang quản trị.

| # | Tiêu chí "xong" | Cách kiểm |
|---|---|---|
| 1 | Đăng nhập bằng Google và bằng email không mật khẩu | Thử cả hai |
| 2 | Kéo thả file hoặc gõ chủ đề → thấy giá và số dư còn lại **trước khi bấm** | Đối chiếu với artboard "Trang công cụ" |
| 3 | Bấm tạo → trừ tiền giữ → việc vào hàng đợi → chạy | Kiểm bảng `credit_ledger` có dòng `hold` |
| 4 | Thanh tiến trình chạy theo **sự kiện thật** qua Realtime | Tắt mạng giữa chừng: thanh phải dừng, không chạy tiếp giả vờ |
| 5 | Đóng trình duyệt rồi mở lại vẫn thấy việc đang chạy | Thử thật |
| 6 | Xong → tải được file `.pptx` | Mở trong PowerPoint |
| 7 | Chạy hỏng → **tự động hoàn credit** và hiện màn "Chạy hỏng" | Ép lỗi bằng cách đặt `budget` cực thấp |
| 8 | Không đủ số dư → chặn **trước khi** chạy, chưa tốn tiền API | Kiểm log: không có session nào được mở |
| 9 | RLS chặn thật | Đăng nhập tài khoản B, thử đọc job của A bằng gọi API trực tiếp |
| 10 | `cost_umd` được ghi vào bảng `jobs` mỗi việc | Truy vấn kiểm |
| 11 | Trang hiện đúng hệ thiết kế | So với artboard, sai lệch phải giải thích được |
| 12 | Thêm một công cụ giả (khung rỗng) không sửa file nào ngoài `lib/tools/` | `git diff --name-only` |

Tiêu chí 12 là bài kiểm tra ranh giới. Trượt thì sửa kiến trúc ngay ở M2, đừng để tới lúc có 17 công cụ.

---

### M3 — Thanh toán tự động và trang quản trị

| # | Tiêu chí "xong" | Cách kiểm |
|---|---|---|
| 1 | Chọn gói → hiện QR có sẵn số tiền và mã giao dịch | Đối chiếu artboard "Nạp tiền" |
| 2 | Chuyển khoản thật → credit vào trong vòng 2 phút, không cần bấm gì | **Chuyển khoản thật, tiền thật** |
| 3 | Webhook đến hai lần không cộng tiền hai lần | Gửi lại webhook cũ, kiểm sổ |
| 4 | Ghi sai nội dung chuyển khoản → vào hàng chờ xử lý tay, có cảnh báo trên trang quản trị | Chuyển khoản ghi sai có chủ ý |
| 5 | Đối soát bù chạy được khi webhook chết | Tắt webhook, chạy cron, kiểm khớp |
| 6 | Trang quản trị hiện **biên lợi nhuận từng công cụ** | Đối chiếu artboard "Trang quản trị" |
| 7 | Nút hoàn credit thủ công có ghi vết vào sổ | Thử hoàn một việc |
| 8 | Trang quản trị chỉ admin vào được | Đăng nhập tài khoản thường, thử vào |

---

### M4 — Mở rộng đủ 17 công cụ và làm SEO

| # | Tiêu chí "xong" | Cách kiểm |
|---|---|---|
| 1 | Đủ 6 công cụ Giáo dục chạy thật | Chạy thử từng cái |
| 2 | Đủ 5 trang ngành và 17 trang công cụ, dựng tĩnh | Xem mã nguồn trang: nội dung nằm trong HTML, không phải do JS đổ vào |
| 3 | `sitemap.xml` và `robots.txt` đúng | Search Console không báo lỗi |
| 4 | Dữ liệu có cấu trúc hợp lệ | Rich Results Test của Google |
| 5 | Điểm hiệu năng ≥ 90 trên di động | PageSpeed Insights |
| 6 | Có ≥ 3 bài blog viết từ kinh nghiệm thật | Đọc lại xem có trả lời trọn một câu hỏi không |
| 7 | **10 giáo viên thật tự dùng được mà không cần anh ngồi cạnh** | Quan sát, không hướng dẫn |

Tiêu chí 7 là tiêu chí thật sự quan trọng. Sáu cái trên chỉ chứng minh phần mềm chạy; cái này chứng minh nó dùng được.

---

### M5 — Thư viện bài giảng dựng sẵn *(chỉ làm nếu M1–M4 chứng minh chất lượng)*

Đây là nguồn lãi chính theo [ADR-0004 mục 4](./adr/0004-pricing-and-unit-economics.md), nhưng cũng là khoản đầu tư một lần lớn nhất (~40 triệu ₫).

**Cổng chặn — không mở M5 nếu chưa đủ cả ba:**

1. Tỉ lệ hài lòng của bài giảng sinh ra ≥ 80% (đo bằng tỉ lệ **không** bấm báo lỗi)
2. Có ít nhất 50 người dùng trả phí thật
3. Chi phí thật một bài đã đo và ổn định

| # | Tiêu chí "xong" |
|---|---|
| 1 | 200 bài đầu tiên của một khối lớp, kiểm duyệt nội dung từng bài |
| 2 | Trang thư viện dựng tĩnh, mỗi bài một địa chỉ riêng |
| 3 | Gói thuê bao thư viện chạy được (khác cơ chế credit) |
| 4 | Đo được: bao nhiêu người vào từ Google → tải bài → chuyển sang trả phí |

Chỉ mở rộng lên 2.000 bài sau khi 200 bài đầu chứng minh có người tải.

---

## 4. Cố ý KHÔNG làm ở giai đoạn đầu

- Ứng dụng di động — web trên điện thoại là đủ
- Tài khoản nhóm / trường học
- Đăng nhập bằng Zalo (Supabase không hỗ trợ sẵn, tự làm tốn công)
- Chỉnh sửa bài giảng trực tiếp trên web — cứ để họ sửa trong PowerPoint
- Lồng tiếng và xuất video (ppt-master có sẵn, nhưng chưa cần)
- Đa ngôn ngữ
- Sinh ảnh AI bật mặc định — mặc định dùng Pexels/Pixabay miễn phí, ảnh AI là tuỳ chọn có báo giá

---

## 5. Rủi ro lớn nhất, xếp theo mức nguy hiểm

| Rủi ro | Biết sớm nhất ở đâu | Nếu xảy ra |
|---|---|---|
| ppt-master không chạy được trong sandbox Anthropic | M1 | Chuyển sang worker riêng (ADR-0003 mục 6) |
| Chi phí thật cao hơn ước tính nhiều | M1 tiêu chí 7 | Tăng giá hoặc bỏ công cụ (ADR-0004 mục 5) |
| Chất lượng Haiku 4.5 không đủ dùng | M1 tiêu chí 8 | Dùng Sonnet 5, giá bài giảng lên ~120.000 ₫, đẩy mạnh tầng "từ mẫu có sẵn" |
| Giáo viên không chịu trả 45.000 ₫/bài | M4 tiêu chí 7 | Đẩy tầng 15.000 ₫ và tầng thư viện lên làm chủ lực |
| Khoá API bị khoá hoặc đụng trần tốc độ | Bất cứ lúc nào | Điểm chết duy nhất. Phải có cảnh báo tỉ lệ lỗi và nhà cung cấp dự phòng đã cấu hình sẵn |
| Google phạt vì nội dung mỏng | Sau M4 vài tháng | Xem `seo-plan.md` mục 4 — đừng sinh trang hàng loạt trước khi có nội dung thật |

---

## 6. Việc cần anh quyết trước khi bắt đầu M1

| # | Câu hỏi | Vì sao cần |
|---|---|---|
| 1 | Duyệt 5 ADR và bảng giá mới? | Toàn bộ M1 dựa lên đó. Đặc biệt là **giá bài giảng 45.000 ₫** thay cho 15.000 ₫ |
| 2 | Cho phép cài dependency và dựng mã chưa? | Quy tắc anh đặt là hỏi trước. Hiện chưa cài gì |
| 3 | Ngân sách thử nghiệm M1 bao nhiêu? | Phải gọi API thật mới đo được. Ước ~30 lần chạy × trung bình 35.000 ₫ ≈ **1 triệu ₫** |
| 4 | Số ngày lưu file nguồn và file kết quả? | Đang để `[SỐ]` khắp nơi. Đề xuất: nguồn 7 ngày, kết quả 90 ngày |
