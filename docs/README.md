# Trợ Thủ — mục lục tài liệu

Nền tảng web bán công cụ xử lý giấy tờ theo lượt cho người đi làm Việt Nam.
Ra mắt với ngành Giáo dục, kiến trúc chừa sẵn cho 15 ngành.

**Cập nhật lần cuối:** 2026-08-24

---

## Đọc theo thứ tự này nếu mới vào

| # | Tài liệu | Nội dung |
|---|---|---|
| 1 | [`viec-anh-phai-tu-lam.md`](./viec-anh-phai-tu-lam.md) | **Đọc đầu tiên.** Việc chỉ anh làm được, xếp theo thứ tự |
| 2 | [`plan.md`](./plan.md) | Sản phẩm là gì, lộ trình M0–M5, tiêu chí "xong" kiểm chứng được |
| 3 | [`adr/0004-pricing-and-unit-economics.md`](./adr/0004-pricing-and-unit-economics.md) | Bảng giá và bài toán đơn vị. **Mục 0 nói rõ bảng giá cũ sai ở đâu** |

---

## Quyết định kiến trúc (ADR)

| # | Tài liệu | Chốt điều gì |
|---|---|---|
| 0001 | [AI runtime](./adr/0001-ai-runtime.md) | Claude Managed Agents, model Haiku 4.5. **Vì sao không được dùng Claude Code** |
| 0002 | [Stack desktop](./adr/0002-desktop-stack.md) | ⛔ Đã bị thay thế — giữ để tra lịch sử |
| 0003 | [Kiến trúc web](./adr/0003-web-architecture.md) | Next.js + Supabase + Managed Agents. **Va chạm 800 giây của Vercel và cách giải** |
| 0004 | [Giá và bài toán đơn vị](./adr/0004-pricing-and-unit-economics.md) | Giá vốn từng công cụ, bảng giá, chiến lược ba tầng |
| 0005 | [Thanh toán và credit](./adr/0005-payments-and-credits.md) | Nạp trước, sổ ghi thêm, SePay, hoàn tiền, pháp lý |

---

## Tài liệu thi công

| Tài liệu | Nội dung |
|---|---|
| [`trang-thai-ma-nguon.md`](./trang-thai-ma-nguon.md) | **Mã nguồn đã dựng tới đâu, chạy thử thế nào, còn thiếu gì** |
| [`data-model.md`](./data-model.md) | Lược đồ Supabase, RLS, hàm giữ tiền, truy vấn biên lợi nhuận |
| [`design-system.md`](./design-system.md) | Token màu, chữ, hình khối rút từ bộ thiết kế — để dựng React cho khớp |
| [`seo-plan.md`](./seo-plan.md) | Cây địa chỉ, loại trang, ranh giới sinh trang hàng loạt, đo cái gì |

---

## Thiết kế

Bộ **12 màn** đã duyệt, dựng trên một hệ thiết kế thống nhất.
Mã nguồn artboard nằm ở `design/*.dc.html`, bố cục ở `design/canvas.json`.

| Trang | Màn |
|---|---|
| Khách mới | Trang chủ · Trang ngành Giáo dục · Bảng giá · Đăng nhập · Điện thoại |
| Trong app | Bàn làm việc · Trang công cụ · Nạp tiền · Đã xong · Điện thoại (tạo & nạp) · Rỗng/Lỗi/Hết tiền |
| Quản trị | Tổng quan, biên lợi nhuận từng công cụ, bảng việc |

Dựng lại và xuất bản:

```bash
cd design && node "<skill-dir>/seed-canvas.mjs" --template "<skill-dir>/payload.template.html" \
  --out tro-thu-huong-thiet-ke.html --title "Trợ Thủ — Hướng thiết kế trang chủ" \
  --artboard Main.dc.html --artboard Nganh.dc.html --artboard Pricing.dc.html \
  --artboard Auth.dc.html --artboard Mobile.dc.html --artboard Workbench.dc.html \
  --artboard ToolPage.dc.html --artboard Nap.dc.html --artboard Xong.dc.html \
  --artboard MobileTool.dc.html --artboard States.dc.html --artboard Admin.dc.html \
  --canvas canvas.json
```

---

## `vendor/ppt-master`

Lõi sinh PPTX, giấy phép **MIT**, tác giả **Hugo He** — <https://github.com/hugohe3/ppt-master>

**Không sửa bất kỳ file nào trong đó.** Clone bằng sparse-checkout (bỏ `examples/` và ảnh nặng: repo gốc ~780 MB, bản đang có 59 MB).

Cập nhật:

```bash
cd vendor/ppt-master && git pull
```

Giữ nguyên `LICENSE` và ghi credit trong trang Giới thiệu của sản phẩm.

---

## Trạng thái hiện tại

| | |
|---|---|
| Tài liệu | ✅ Xong — 5 ADR + 5 tài liệu thi công |
| Thiết kế | ✅ Xong — 12 màn, giá đã đồng bộ với ADR-0004 |
| Mã sản phẩm | ✅ **Đã dựng** — build sạch, lint sạch. Xem [`trang-thai-ma-nguon.md`](./trang-thai-ma-nguon.md) |
| Chạy trên mạng | ✅ **https://trothu.vercel.app** — chế độ thử nội bộ, chưa mở công khai |
| 14 công cụ văn bản | ✅ **Chạy thật trên production** — 10 việc xong, 0 hỏng, biên lợi nhuận 93% (ADR-0004 mục 0b) |
| 3 công cụ PowerPoint | ⬜ **Chưa chạy** — thiếu `ANTHROPIC_API_KEY`. Script `scripts/m1-poc.ts` đã sẵn sàng |
| Thanh toán | ⬜ Chưa làm |
| Quản lý phiên bản | ⛔ **Chưa có git** — không có lịch sử, không có bản sao lưu |

---

## Quy ước trong tài liệu

- `[chưa kiểm chứng]` — số liệu tôi không tra được nguồn đáng tin, đừng dựa vào để quyết
- `[SỐ]`, `[TÊN NGÂN HÀNG]`, `[N]` — chỗ trống chờ anh điền, cố ý không bịa
- Mọi số tiền là **đồng Việt Nam**, tỉ giá quy đổi 1 USD ≈ 26.000 ₫ `[cần kiểm chứng lúc phát hành]`
