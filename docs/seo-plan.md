# Kế hoạch SEO cho Trợ Thủ

- **Ngày:** 2026-08-24
- **Bối cảnh:** SEO là kênh tăng trưởng chính. Không có ngân sách quảng cáo, người dùng mục tiêu tìm bằng Google bằng tiếng Việt.

---

## 1. Sự thật phải chấp nhận trước

**Trang chủ không phải cửa vào.** Không ai gõ "trợ thủ" vào Google. Họ gõ *"cách làm powerpoint bài giảng nhanh"*, *"mẫu biên bản nghiệm thu xây dựng"*, *"ma trận đề kiểm tra ngữ văn 8"*.

Nên trang chủ chỉ để chốt niềm tin sau khi người ta đã vào. **Trang kéo người vào là trang ngành và trang công cụ.** Bố cục 12 màn đã theo đúng nhận định này: trang ngành là trang dày nội dung nhất.

Và **thứ ba: Google 2026 phạt nội dung mỏng sinh hàng loạt.** Dựng 5.000 trang na ná nhau là cách nhanh nhất để mất toàn bộ tên miền. Mục 4 nói rõ giới hạn.

---

## 2. Cây địa chỉ

Thiết kế cho 5 ngành hôm nay và 15 ngành sau này mà không phải đổi lại.

```
/                                        trang chủ
/gia                                     bảng giá
/huong-dan                               hướng dẫn dùng

/giao-duc                                ← TRANG NGÀNH (trục SEO chính)
/giao-duc/tao-bai-giang-powerpoint       ← TRANG CÔNG CỤ (trục chuyển đổi chính)
/giao-duc/tao-bai-giang-powerpoint/thcs/ngu-van   ← trang con theo cấp+môn
/giao-duc/soan-de-kiem-tra
/giao-duc/phieu-bai-tap

/ke-toan
/ke-toan/doi-soat-sao-ke
/xay-dung
/xay-dung/bien-ban-nghiem-thu
/ban-hang
/nhan-su

/thu-vien                                ← thư viện bài giảng dựng sẵn (ADR-0004)
/thu-vien/toan-5/phan-so-bang-nhau

/blog/...                                bài viết dài, không phải trang công cụ
```

Quy tắc: **địa chỉ tiếng Việt không dấu, không số thứ tự, không tham số.** `/giao-duc/tao-bai-giang-powerpoint` đọc là hiểu và Google cũng vậy.

---

## 3. Mỗi loại trang làm nhiệm vụ gì

| Loại | Số trang | Nhắm từ khoá | Nội dung tối thiểu |
|---|---|---|---|
| Trang ngành | 5 → 15 | "phần mềm cho giáo viên", "công cụ kế toán" | 800+ chữ thật, bảng công cụ, 6 câu hỏi, liên kết nội bộ tới mọi trang con |
| Trang công cụ | 17 → 60 | "tạo bài giảng powerpoint", "mẫu biên bản nghiệm thu" | 600+ chữ, ảnh kết quả thật, giá công khai, hướng dẫn từng bước, 4–6 câu hỏi |
| Trang cấp+môn | ~30 | "bài giảng ngữ văn 8", "giáo án toán lớp 5" | **Chỉ tạo khi có nội dung riêng thật** — xem mục 4 |
| Thư viện | 2.000 | "bài giảng bài Lão Hạc", "phân số bằng nhau lớp 5" | Xem trước bài thật + tải về. Nội dung là giá trị thật, không phải chữ độn |
| Blog | 1–2 bài/tuần | câu hỏi nghề nghiệp đuôi dài | 1.200+ chữ, viết từ kinh nghiệm thật |

**Trang công cụ vừa là trang bán vừa là trang SEO.** Không tách hai trang cho cùng một từ khoá — chúng sẽ cắn nhau trên bảng xếp hạng.

---

## 4. Ranh giới của SEO sinh hàng loạt

Đây là chỗ dễ hỏng nhất. Quy tắc cứng:

> **Chỉ sinh một trang khi trang đó có ít nhất một thứ mà trang khác không có.**

| Được sinh hàng loạt | Vì sao được |
|---|---|
| Trang thư viện (2.000 bài giảng) | Mỗi trang có **một file bài giảng thật khác nhau** để tải. Đó là giá trị thật, không phải chữ độn |
| Trang cấp+môn (~30) | Mỗi trang có ảnh bài giảng mẫu riêng của môn đó, bố cục riêng, câu hỏi riêng của môn |

| Không được sinh | Vì sao không |
|---|---|
| "Tạo bài giảng cho [tên tỉnh]" | Không có gì khác nhau ngoài chữ thay thế |
| Một trang cho từng biến thể từ khoá | Cắn nhau, và Google nhận ra ngay |
| Trang môn chưa có bài giảng mẫu thật | Trang rỗng thì thà đừng có |

**Thứ tự làm:** 5 trang ngành → 17 trang công cụ → viết blog đều → chỉ khi thư viện đã có nội dung thật mới mở 2.000 trang thư viện. Đừng đảo thứ tự.

---

## 5. Kỹ thuật

### Dựng trang

- **Trang marketing dựng tĩnh, làm mới định kỳ.** Nội dung gần như không đổi, mà tốc độ là yếu tố xếp hạng.
- Trang thư viện dựng tĩnh khi xuất bản, không render lúc chạy.
- Trang trong app (`/app/...`) đặt `noindex` — không có gì để xếp hạng và có dữ liệu riêng tư.

### Thẻ bắt buộc mọi trang

```html
<title>Tạo bài giảng PowerPoint tự động cho giáo viên — Trợ Thủ</title>
<meta name="description" content="Đưa giáo án Word hoặc chỉ một chủ đề, nhận về file .pptx 10–15 trang sửa được trong PowerPoint. Bám chương trình GDPT 2018. Bài đầu miễn phí.">
<link rel="canonical" href="https://trothu.vercel.app/giao-duc/tao-bai-giang-powerpoint">
<meta property="og:image" content="...">   <!-- ảnh bài giảng THẬT, không phải logo -->
<html lang="vi">
```

Tiêu đề dưới 60 ký tự, mô tả 140–160. Viết cho người đọc trước, không nhồi từ khoá.

### Dữ liệu có cấu trúc

| Trang | Loại schema |
|---|---|
| Trang công cụ | `SoftwareApplication` + `Offer` (có giá — Google hiện giá trên kết quả tìm kiếm) |
| Câu hỏi | `FAQPage` |
| Blog | `Article` + `BreadcrumbList` |
| Thư viện | `CreativeWork` + `BreadcrumbList` |

### Sitemap và robots

- `sitemap.xml` sinh tự động, chia nhóm khi vượt 5.000 địa chỉ
- `robots.txt` chặn `/app/`, `/admin/`, `/api/`
- Khai báo trong Google Search Console **ngay ngày đầu** — càng sớm càng có dữ liệu sớm

### Tốc độ

Bộ 12 màn không dùng thư viện nặng nào: không thư viện biểu đồ, không thư viện hoạt hình, biểu tượng là SVG viết thẳng trong mã. Giữ nguyên như vậy.

Một điểm phải để ý: **font Google chặn hiển thị**. Dùng `next/font` để tự lưu trữ Be Vietnam Pro thay vì gọi thẳng `fonts.googleapis.com` — bỏ được một vòng kết nối tới máy chủ khác.

---

## 6. Liên kết nội bộ

Đây là thứ rẻ nhất và hay bị bỏ quên nhất.

```
Trang chủ ──► 5 trang ngành ──► 17 trang công cụ ──► trang cấp+môn
    ▲              ▲                   │                    │
    └──────────────┴───────────────────┴────────────────────┘
                     (đường dẫn phân cấp trên mọi trang)

Blog ──► trang công cụ liên quan   (mỗi bài ít nhất 2 liên kết)
Thư viện ──► trang công cụ đã sinh ra nó
```

Bố cục đã có sẵn: dải môn học trên trang ngành, dải từ khoá cuối trang, thẻ "Giáo viên khác cũng dùng" trên trang công cụ. **Phải là thẻ `<a href>` thật**, không phải `<div onclick>`.

---

## 7. Nội dung — viết gì

Nguồn ý tưởng theo thứ tự ưu tiên:

1. **Câu hỏi thật của người dùng.** Mỗi lần ai đó nhắn Zalo hỏi gì, ghi lại. Đó là từ khoá đuôi dài có sẵn người tìm.
2. **Nhóm Facebook giáo viên.** Câu hỏi lặp lại nhiều lần là bài viết cần có.
3. **Google Search Console** sau 4–6 tuần: mục Queries cho biết người ta đang tìm gì mà đến được trang mình — thường khác hẳn dự đoán.

Mỗi bài viết phải trả lời được một câu hỏi cụ thể **trọn vẹn**, kể cả khi người đọc không mua gì. Bài viết chỉ để dụ nhấp thì Google nhận ra và người đọc cũng vậy.

Một câu cảnh báo: **đừng dùng chính Trợ Thủ để sinh hàng loạt bài blog.** Nội dung AI đại trà là đúng thứ Google đang lọc. Dùng AI làm bản nháp thì được, nhưng phải có kinh nghiệm thật của anh trong đó.

---

## 8. Đo cái gì

| Chỉ số | Xem ở đâu | Ngưỡng |
|---|---|---|
| Số trang được lập chỉ mục | Search Console | Tăng đều; tụt là có vấn đề kỹ thuật |
| Lượt hiển thị theo trang | Search Console | Trang công cụ phải dẫn đầu sau tháng 2 |
| Tỉ lệ nhấp | Search Console | Dưới 2% thì viết lại tiêu đề và mô tả |
| Vào từ Google → đăng ký | Analytics | Đây mới là con số thật, không phải lượt truy cập |
| Vào từ Google → nạp tiền | Analytics | Con số quyết định SEO có đáng làm không |

**Đừng nhìn thứ hạng từ khoá.** Nó dao động vô nghĩa. Nhìn lượt hiển thị và tỉ lệ chuyển đổi.

---

## 9. Việc anh phải tự làm

| Việc | Khi nào |
|---|---|
| Mua tên miền `.vn` hoặc `.com` | Trước khi ship — tên miền `vercel.app` **không xếp hạng tốt** và không tạo được niềm tin để người ta chuyển khoản |
| Lập Google Search Console + xác minh sở hữu | Ngày đầu tiên có tên miền |
| Lập Google Analytics (hoặc Plausible/Umami) | Cùng lúc |
| Viết 2–3 bài blog đầu bằng kinh nghiệm thật | Trước khi ship |

**Tên miền là việc gấp nhất trong bảng này.** `trothu.vercel.app` dùng để phát triển thì được, nhưng bán hàng trên tên miền con của Vercel thì vừa mất điểm SEO vừa mất niềm tin — người Việt nhìn địa chỉ lạ là không dám chuyển khoản.
