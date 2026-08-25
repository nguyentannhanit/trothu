# Hệ thiết kế Trợ Thủ

- **Ngày:** 2026-08-24
- **Nguồn sự thật:** bộ 12 màn trong `design/` (canvas đã duyệt). Tài liệu này rút token ra để dựng React cho khớp.

Mọi giá trị dưới đây lấy trực tiếp từ các artboard, không làm tròn lại.

---

## 1. Màu

```css
:root {
  /* Nền và mặt */
  --bg:            #F7F7F8;   /* nền trang */
  --surface:       #FFFFFF;   /* thẻ, bảng, ô nhập */
  --surface-2:     #FAFAFB;   /* nền phụ trong thẻ, đầu bảng */
  --surface-3:     #F1F2F4;   /* nút phụ, chip tĩnh */
  --surface-4:     #EDEEF0;   /* rãnh của nút gạt, thanh tiến trình rỗng */

  /* Chữ */
  --ink:           #0D0F14;   /* tiêu đề, số liệu chính */
  --ink-2:         #464C57;   /* thân bài */
  --ink-3:         #6B7280;   /* mô tả phụ */
  --ink-4:         #868C97;   /* nhãn, chú thích */
  --ink-5:         #A0A5AE;   /* rất mờ, chỗ trống */

  /* Viền */
  --line:          rgba(13,15,20,0.08);
  --line-strong:   rgba(13,15,20,0.12);

  /* Nhấn */
  --accent:        #00785F;
  --accent-soft:   color-mix(in srgb, var(--accent) 8%, #FFFFFF);
  --accent-line:   color-mix(in srgb, var(--accent) 26%, #FFFFFF);

  /* Tín hiệu */
  --danger:        #C0392B;
  --danger-soft:   #FBEBE9;
  --warn:          #B4720E;
  --warn-soft:     #FDF6E7;
  --warn-line:     #F0DCA8;
  --warn-ink:      #6B4F08;

  /* Màu định dạng tệp — dùng thống nhất mọi nơi */
  --pptx:          #B7472A;  --pptx-bg: #F9EAE6;
  --docx:          #2B579A;  --docx-bg: #E8EEF7;
  --xlsx:          #1F6F43;  --xlsx-bg: #E6F1EA;
}
```

**Quy tắc dùng màu nhấn:** chỉ cho hành động chính, dấu tích, và trạng thái đang chọn. Giá tiền dùng `--ink`, không dùng màu nhấn — nếu mọi con số đều xanh thì không còn gì nổi bật.

**Khối nền đen** (`--ink` làm nền, chữ trắng) dùng để cắt nhịp trang dài: dải "Ba bước" ở trang chủ, dải kết ở trang ngành, thẻ bán chéo ở màn kết quả. Không dùng quá hai khối trên một trang.

---

## 2. Chữ

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
```

**Be Vietnam Pro** — bộ chữ thiết kế riêng cho tiếng Việt, dấu không bị chồng lên chữ hoa. Đây là lý do chọn nó thay vì Inter.
**IBM Plex Mono** — số liệu, mã việc, mã giao dịch, nhãn định dạng tệp, nhãn viết hoa.

| Vai trò | Cỡ | Đậm | line-height | letter-spacing |
|---|---|---|---|---|
| Tiêu đề trang chủ | 54px | 800 | 1.06 | −0.035em |
| Tiêu đề trang ngành | 42–44px | 800 | 1.10–1.12 | −0.035em |
| H1 trong app | 27–30px | 700 | 1.15 | −0.03em |
| H2 phần | 25–27px | 700 | 1.2 | −0.025em |
| Tiêu đề thẻ | 15–17px | 650 | 1.35 | −0.015em |
| Thân bài | 15–17px | 400 | 1.6–1.7 | — |
| Thân nhỏ | 13.5–14px | 400 | 1.55–1.65 | — |
| Nhãn | 12.5–13px | 500 | 1.5 | — |
| Mono nhãn hoa | 10–11px | 500 | 1.4 | 0.07em |
| Số tiền lớn | 21–30px | 700 | 1.1 | −0.025 đến −0.035em |

`font-weight: 650` không phải lỗi — Be Vietnam Pro là biến thể, 650 nằm giữa 600 và 700 và dùng cho tiêu đề thẻ.

---

## 3. Hình khối

```css
--r-sm: 8px;    /* chip nhỏ, nhãn tệp */
--r-md: 10px;   /* nút, ô nhập */
--r-lg: 12px;   /* thẻ nhỏ, nút lớn */
--r-xl: 14px;   /* thẻ */
--r-2xl:16px;   /* thẻ lớn, khối bước */
--r-3xl:20px;   /* dải kết */
--r-full: 999px;

--sh-1: 0 1px 2px rgba(13,15,20,0.03);                                 /* thẻ thường */
--sh-2: 0 1px 2px rgba(13,15,20,0.04), 0 16px 40px -20px rgba(13,15,20,0.22);  /* ô tìm kiếm */
--sh-3: 0 1px 2px rgba(13,15,20,0.03), 0 20px 48px -30px rgba(13,15,20,0.40);  /* cột giá dính */
```

**Khoảng cách: mọi giá trị là bội số của 4.** Hay dùng: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 32, 40, 56, 64, 76.

**Chiều cao điều khiển:** 32 (nhỏ) · 36 (nút thanh trên) · 40–42 (nút thường) · 44 (nút chính) · 46–48 (nút to, ô nhập trên điện thoại) · 50 (nút chính màn đăng nhập).

**Trên điện thoại mọi ô bấm ≥ 44px.** Không có ngoại lệ.

---

## 4. Biểu tượng

SVG vẽ tay, nét ngoài, không dùng emoji hay ký tự đặc biệt.

```
viewBox="0 0 24 24"  fill="none"  stroke="currentColor"
stroke-width: 1.9–2.2   (2.6–2.8 cho dấu tích nhỏ)
stroke-linecap="round"  stroke-linejoin="round"
```

Cỡ hiển thị: 13–15 (trong dòng chữ) · 16–19 (nút, nhãn) · 20–24 (đầu khối).

---

## 5. Thành phần

### Nút

| Loại | Nền | Chữ | Viền |
|---|---|---|---|
| Chính | `--accent` | `#FFFFFF` | không |
| Chính tối | `--ink` | `#FFFFFF` | không |
| Phụ | `--surface-3` | `--ink` | không |
| Viền | trong suốt | `--ink` hoặc `--ink-2` | `1px var(--line-strong)` |
| Trên nền đen | `#FFFFFF` | `--ink` | không |

### Thẻ

`background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-xl); box-shadow: var(--sh-1);`

**Không dùng viền màu ở cạnh trái.** Đó là dấu hiệu giao diện do AI sinh, và bản thiết kế đã cố ý bỏ.

### Nhãn định dạng tệp

```html
<span style="font-family: 'IBM Plex Mono'; font-size: 9.5–10px; font-weight: 500;
             color: var(--pptx); background: var(--pptx-bg);
             border-radius: 5px; padding: 4px 6px;">PPTX</span>
```

### Điều khiển phân đoạn (segmented)

Rãnh `--surface-4`, padding 3px, bo `--r-md`. Mục đang chọn: nền trắng, bo `--r-sm`, `box-shadow: 0 1px 2px rgba(13,15,20,0.06)`, đậm 600. Mục còn lại: chữ `--ink-3`, đậm 500.

### Trạng thái việc

| Trạng thái | Chữ | Nền |
|---|---|---|
| Xong | `--accent` | `--accent-soft` |
| Đang chạy | `--warn` | `#FDF4E3` |
| Lỗi | `--danger` | `--danger-soft` |
| Xếp hàng | `--ink-3` | `--surface-3` |

Dạng viên thuốc, có chấm tròn 5px cùng màu chữ ở đầu.

### Thanh tiến trình

Cao 5–6px, bo 3–4px, rãnh `--surface-4`, phần đã chạy `--accent`.
**Luôn kèm chữ nói rõ đang làm gì** — "Đang vẽ trang 8/13", không chỉ có phần trăm.

---

## 6. Cách viết chữ trên giao diện

Người đọc là giáo viên, kế toán, kỹ sư công trường — không phải dân công nghệ.

**Nên:**
- "Bài giảng của cô đã xong" — không phải "Tác vụ hoàn tất"
- "Còn khoảng 6 phút" — không phải "ETA 6m"
- "Chưa ưng?" — không phải "Báo cáo sự cố"
- "Trước bạn còn 2 việc" — nói thẳng, đừng giấu hàng đợi
- Số tiền luôn có dấu chấm ngăn nghìn và ký hiệu ₫: `45.000₫`

**Tránh:**
- Từ kỹ thuật: token, prompt, model, API, job, queue, render
- Câu bị động và câu hô hào: "Khám phá sức mạnh của…"
- Báo lỗi kiểu máy: hiện mã lỗi nhỏ ở góc để hỗ trợ tra, nhưng câu chính phải là tiếng người

**Nói về tiền phải đi trước, không đi sau.** Giá hiện trước khi bấm, tổng cộng và số dư còn lại hiện cùng chỗ với nút. Đây là quy tắc quan trọng nhất của cả sản phẩm bán theo lượt.

---

## 7. Bố cục

| Màn | Rộng | Lề |
|---|---|---|
| Trang marketing | 1280 | 64 |
| Trong app | 1440 | 24–40 |
| Điện thoại | 390 | 14–16 |

**Trong app:** cột trái cố định 248px (quản trị 216px). Cột phải của trang công cụ và màn kết quả rộng 356–396px, dính khi cuộn.

**Điện thoại:** một cột, thanh dưới 4 mục, thanh giá dính đáy ở màn tạo. **Không vẽ thanh trạng thái giả của điện thoại** — máy thật tự vẽ đè lên.

---

## 8. Dựng bằng React

- **Tailwind** với các token ở mục 1 khai trong `theme.extend`. Không dùng màu mặc định của Tailwind — `gray-500` không khớp với `--ink-4`.
- **shadcn/ui** cho nút, ô nhập, hộp thoại — rồi ghi đè token cho khớp. Đừng dùng giao diện mặc định của nó, bo góc và bóng của họ khác.
- **Không thêm thư viện biểu đồ** cho trang quản trị. Biểu đồ cột trong bản thiết kế là flex + div, khoảng 20 dòng, và khớp hệ thiết kế sẵn.
- **Kiểm tra tiếng Việt trước khi ship:** đặt tên project thử là `Bài giảng Ngữ văn 8 — Lão Hạc` và soi xem dấu có bị cắt ở dòng có `letter-spacing` âm không.
