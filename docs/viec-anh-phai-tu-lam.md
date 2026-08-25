# Việc anh phải tự tay làm

- **Ngày:** 2026-08-24

Đây là những thứ tôi **không** làm thay được: cần danh tính của anh, thẻ của anh, chữ ký của anh, hoặc quyết định kinh doanh của anh. Xếp theo thứ tự cần làm.

Đánh dấu `[ ]` khi xong để lần sau khỏi phải nhớ.

---

## A. Gấp — chặn mốc M1, không có thì không chạy thử được

### [ ] A1. Tài khoản Anthropic có thanh toán

- Vào [platform.claude.com](https://platform.claude.com) → đăng ký → thêm thẻ
- Tạo API key, cất vào chỗ an toàn
- Nạp trước khoảng **1 triệu ₫** cho giai đoạn thử M1

**Vì sao:** M1 phải gọi API thật mới đo được chi phí thật. Mọi con số trong ADR-0004 hiện là ước lượng.

**Cần thẻ quốc tế.** Nếu chưa có, đây là việc phải giải quyết đầu tiên — không có đường vòng.

### [ ] A2. Bật Managed Agents cho tài khoản

- Kiểm tra trong Console xem Managed Agents (beta) đã dùng được chưa
- Nếu chưa thấy, liên hệ hỗ trợ để xin bật

**Vì sao:** ADR-0001 chọn Managed Agents làm runtime. Không bật được thì phải chuyển sang phương án worker riêng ở ADR-0003 mục 6 — biết sớm thì đỡ mất công.

### [ ] A3. Chốt hai con số

| Câu hỏi | Đề xuất của tôi | Anh chốt |
|---|---|---|
| Giữ file nguồn người dùng tải lên bao lâu? | 7 ngày | ______ |
| Giữ file kết quả bao lâu? | 90 ngày | ______ |

**Vì sao:** hai con số này đang là `[SỐ] ngày` ở khắp bộ thiết kế và trong Chính sách dữ liệu. Phải có số thật mới viết được chính sách, mà không có chính sách thì không nên thu tiền.

---

## B. Trước khi thu đồng tiền đầu tiên

### [ ] B1. Đăng ký hộ kinh doanh hoặc doanh nghiệp

- Nộp tại UBND quận/huyện nơi đặt trụ sở
- Ngành nghề: dịch vụ công nghệ thông tin / phần mềm

**Vì sao bắt buộc:**
- MoMo Business **chỉ ký với** doanh nghiệp hoặc hộ kinh doanh đã cấp phép
- Không xuất được hoá đơn cho trường học
- Thu tiền dịch vụ không đăng ký là rủi ro thuế

**Chi phí:** vài trăm nghìn đồng lệ phí, khoảng 3–5 ngày làm việc `[anh kiểm chứng lại thời gian ở địa phương]`

### [ ] B2. Mở tài khoản ngân hàng riêng cho việc kinh doanh

- **Không dùng chung với tài khoản cá nhân.** Đối soát sẽ thành ác mộng, và thuế cũng không rõ ràng
- Chọn ngân hàng SePay có hỗ trợ — xem danh sách trên [sepay.vn](https://sepay.vn/api-ngan-hang.html)

### [ ] B3. Đăng ký SePay và nối webhook

- Đăng ký, nối tài khoản ngân hàng ở B2
- Lấy khoá webhook, đưa vào biến môi trường của Vercel
- **Tự chuyển khoản thử 10.000 ₫ cho chính mình** và xác nhận webhook bắn đúng

**Vì sao đây là đường chính:** không mất phí trên từng giao dịch, tiền vào trong khoảng một phút, tự đối soát được. MoMo để sau.

### [ ] B4. Khai báo tài khoản với cơ quan thuế

Nghị định 68/2026/NĐ-CP yêu cầu hộ và cá nhân kinh doanh khai báo toàn bộ tài khoản ngân hàng và ví điện tử dùng cho kinh doanh. `[anh nhờ kế toán xác nhận điều khoản áp dụng cụ thể cho trường hợp của mình]`

### [ ] B5. Viết Điều khoản sử dụng và Chính sách dữ liệu

Bộ thiết kế đã chừa sẵn chỗ ở chân trang. Phải nói rõ tối thiểu:

- Giữ file nguồn bao nhiêu ngày (số ở A3)
- **Không** dùng dữ liệu người dùng để huấn luyện mô hình
- **Không** chia sẻ cho bên thứ ba, trừ nhà cung cấp AI để xử lý yêu cầu
- Chính sách hoàn tiền (ADR-0005 mục 4)
- Không hoàn tiền mặt, chỉ hoàn credit

Tôi soạn bản nháp được nếu anh muốn, nhưng anh phải đọc và chịu trách nhiệm — đây là cam kết pháp lý.

---

## C. Trước khi mở cho người lạ dùng

### [ ] C0. Tắt chế độ riêng tư

Web đang chạy ở **chế độ thử nội bộ** từ 24/08/2026. Ba khoá đang đóng:

| Khoá | Đang là | Ở đâu |
|---|---|---|
| Máy tìm kiếm | `robots.txt` trả `Disallow: /`, thẻ `noindex`, sitemap rỗng | biến `NEXT_PUBLIC_CHE_DO_RIENG_TU=1` trên Vercel |
| Người lạ đăng ký | Tắt — email mới không tạo được tài khoản | Supabase → Auth → `disable_signup = true` |
| Địa chỉ | `trothu.vercel.app`, chưa quảng bá ở đâu | — |

**Để mở công khai:** xoá biến `NEXT_PUBLIC_CHE_DO_RIENG_TU` trên Vercel rồi deploy lại,
và bật lại đăng ký trong Supabase. Làm sau khi xong C1–C5, không làm trước.

**Lưu ý:** gói Hobby **không cho** đặt mật khẩu bảo vệ bản production, nên ai biết
địa chỉ vẫn xem được các trang giới thiệu. Không vào được phần trong app vì phải
đăng nhập, mà không đăng ký được. Muốn khoá hẳn thì phải lên Pro (xem C2).

### [ ] C1. Mua tên miền

- `.vn` hoặc `.com`, ngắn, dễ đọc qua điện thoại
- Ước **500.000 – 900.000 ₫/năm** `[anh kiểm chứng giá thật]`

**Vì sao gấp:** `trothu.vercel.app` vừa không xếp hạng tốt trên Google, vừa làm người Việt không dám chuyển khoản. Địa chỉ lạ là mất niềm tin ngay lập tức.

### [ ] C2. Lên gói Vercel Pro

**Gói Hobby không được dùng cho mục đích thương mại.** Ngay khi bắt đầu thu tiền là phải lên Pro (~20 USD/tháng). Đây là điều khoản, không phải khuyến nghị.

### [ ] C3. Google Search Console và Analytics

- Search Console: thêm tên miền, xác minh sở hữu, nộp sitemap
- Analytics: Google Analytics, hoặc Plausible/Umami nếu muốn nhẹ và riêng tư hơn

**Làm ngay ngày đầu có tên miền.** Search Console chỉ hiện dữ liệu từ lúc xác minh trở đi — chậm một tháng là mất một tháng dữ liệu.

### [ ] C4. Kênh hỗ trợ

- Lập một số Zalo riêng cho hỗ trợ, đưa vào chân trang
- Đừng dùng số cá nhân — sau này giao lại cho người khác sẽ khổ

### [ ] C5. Tìm 10 giáo viên chịu dùng thử thật

Đây là việc khó nhất trong danh sách và **không ai làm thay được**.

- Ưu tiên người anh quen, dạy các môn khác nhau, các cấp khác nhau
- Cho họ dùng miễn phí, đổi lại xin phản hồi thẳng thắn
- **Ngồi im mà xem họ dùng.** Đừng hướng dẫn. Chỗ nào họ khựng lại là chỗ thiết kế sai

Đây là tiêu chí "xong" số 7 của mốc M4.

---

## D. Quyết định kinh doanh — tôi tư vấn được, nhưng anh quyết

### [ ] D1. Duyệt bảng giá mới

**Đây là việc quan trọng nhất trong cả danh sách.**

Bảng giá cũ trong bản thiết kế đầu tiên là **sai** — bài giảng 15.000 ₫ trong khi giá vốn khoảng 52.000 ₫. Tôi đã tính lại ở [ADR-0004](./adr/0004-pricing-and-unit-economics.md) và sửa cả bộ thiết kế:

| | Cũ (lỗ) | Mới |
|---|---|---|
| Bài giảng PowerPoint | 15.000 ₫ | **45.000 ₫** |
| Làm đẹp bài giảng cũ | 10.000 ₫ | **32.000 ₫** |
| Đề kiểm tra | 8.000 ₫ | **12.000 ₫** |
| **Mới thêm:** Bài giảng từ mẫu có sẵn | — | **15.000 ₫** |

Câu hỏi cho anh: **45.000 ₫ một bài giảng — giáo viên Việt Nam có trả không?** Anh hiểu thị trường này hơn tôi. Nếu anh thấy quá cao thì đường đi là đẩy mạnh tầng 15.000 ₫ và tầng thư viện, chứ **không phải** hạ giá bài giảng xuống dưới giá vốn.

### [ ] D2. Có làm thư viện bài giảng dựng sẵn không?

Đầu tư một lần khoảng **40 triệu ₫** (2.000 bài × 20.000 ₫ giá vốn). Đây là nguồn lãi chính theo ADR-0004 và là thứ đối thủ khó sao chép nhất.

**Đừng quyết bây giờ.** Chờ M1 chứng minh chất lượng bài giảng đủ dùng đã. Sinh 2.000 bài xấu là mất 40 triệu ₫ không cứu được.

### [ ] D3. Bốn ngành còn lại — danh mục công cụ có đúng không?

Tôi tự đề xuất 11 công cụ cho Kế toán, Xây dựng, Bán hàng, Nhân sự dựa trên suy đoán. **Chưa hỏi ai làm nghề đó.**

Trước khi xây, hỏi ít nhất 2 người mỗi ngành: *"Việc giấy tờ nào anh/chị mất nhiều thời gian nhất hằng tuần?"* Câu trả lời gần như chắc chắn khác danh sách của tôi.

---

## E. Việc lặp lại sau khi chạy thật

### [ ] E1. Mỗi ngày — xem trang quản trị

Hai thứ duy nhất phải nhìn:

1. **Biên lợi nhuận từng công cụ.** Dưới 50% kéo dài 7 ngày → xử lý theo ADR-0004 mục 5
2. **Dải cảnh báo đỏ** — job lỗi chưa hoàn tiền, chuyển khoản chưa khớp

### [ ] E2. Mỗi tuần

- Đọc mục Queries trong Search Console → ghi lại từ khoá bất ngờ → thành ý tưởng bài viết
- Đọc lại tin nhắn Zalo hỗ trợ → câu hỏi lặp lại lần thứ ba thì phải thành trang FAQ
- Kiểm tra `vendor/ppt-master` có bản mới không (nó cập nhật khá thường xuyên)

### [ ] E3. Mỗi tháng

- Đối chiếu hoá đơn Anthropic với tổng `cost_umd` trong cơ sở dữ liệu. Lệch nhiều nghĩa là có chỗ đang chạy mà không được ghi sổ
- Xem lại tỉ giá USD/VND trong công thức tính biên

---

## F. Những thứ tôi cố ý KHÔNG làm thay

| Việc | Vì sao |
|---|---|
| Tạo tài khoản, nhập thẻ, nhập mật khẩu | Nguyên tắc an toàn — tôi không nhập thông tin thanh toán hay danh tính của anh vào bất kỳ đâu |
| Cài dependency, dựng mã sản phẩm | Quy tắc anh đặt trong CLAUDE.md: hỏi trước khi cài. Anh đang ngủ nên tôi không tự quyết |
| Mua tên miền, đăng ký dịch vụ | Cần thẻ và danh tính của anh |
| Viết Điều khoản sử dụng bản cuối | Soạn nháp được, nhưng đây là cam kết pháp lý — anh phải đọc và chịu trách nhiệm |
| Chạy thử M1 tốn tiền API | Quy tắc anh đặt: hỏi trước khi chạy lệnh tốn tiền |
| Quyết giá bán | Anh hiểu thị trường; tôi chỉ đưa được giá vốn và biên |

---

## Tóm lại — ba việc làm trước tiên sáng mai

1. **Đọc [ADR-0004](./adr/0004-pricing-and-unit-economics.md) mục 0** — chỗ tôi thừa nhận bảng giá cũ sai và tính lại. Đây là thứ đổi nhiều nhất so với đêm qua.
2. **Trả lời D1**: 45.000 ₫ một bài giảng có bán được không?
3. **Trả lời câu 2 trong [plan.md mục 6](./plan.md)**: cho phép cài dependency và bắt đầu dựng mã chưa?

Ba câu đó thông thì M1 chạy được ngay.
