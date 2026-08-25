# ADR-0005: Thanh toán và sổ credit

- **Trạng thái:** Đề xuất — chờ duyệt
- **Ngày:** 2026-08-24
- **Phụ thuộc:** [ADR-0003](./0003-web-architecture.md) (Supabase Postgres), [ADR-0004](./0004-pricing-and-unit-economics.md) (bảng giá)

---

## 1. Nạp trước, không thu theo từng lần

Bán từng bài 12.000 ₫ qua chuyển khoản là sai về vận hành:

- Phí cố định cộng công đối soát ăn gần hết lãi một giao dịch nhỏ
- Người dùng phải mở app ngân hàng mỗi lần tạo — ma sát này giết chuyển đổi
- Chạy trước đòi tiền sau thì có người quỵt; đòi tiền trước từng lần thì không ai dùng

**Nạp trước giải cả ba.** Một giao dịch 300.000 ₫ thay vì hai mươi giao dịch nhỏ. Tiền vào trước. Chạy hỏng thì hoàn credit chứ không hoàn tiền thật.

### Gói nạp

| Nạp | Vào tài khoản | Tương đương |
|---|---|---|
| 50.000 ₫ | 50.000 ₫ | 1 bài giảng, hoặc 5 phiếu bài tập |
| 100.000 ₫ | 100.000 ₫ | 2 bài giảng, hoặc 8 đề kiểm tra |
| **300.000 ₫** | **315.000 ₫** (tặng 5%) | 7 bài giảng, hoặc 21 mẫu bài giảng có sẵn |
| 500.000 ₫ | 550.000 ₫ (tặng 10%) | 12 bài giảng |

Tối thiểu 50.000 ₫. Không có gói tháng, không tự động gia hạn, credit **không hết hạn**.

Phần tặng thêm ghi thành **dòng riêng** trong sổ và tiêu **trước** phần nạp — để nếu sau này có chính sách hoàn tiền thì chỉ hoàn phần tiền thật.

---

## 2. Sổ credit — thiết kế bắt buộc

Đây là chỗ dễ mất tiền và dễ mất niềm tin nhất. Ba quy tắc cứng.

### Quy tắc 1 — Sổ chỉ ghi thêm, không bao giờ sửa

**Không có cột `so_du`.** Số dư là tổng của sổ. Sửa số dư trực tiếp là mở đường cho sai lệch không truy được.

```
credit_ledger
  id, user_id, created_at
  kind        topup | bonus | hold | commit | refund | adjust
  amount_vnd  dương hoặc âm
  job_id      null nếu là nạp tiền
  ref         mã giao dịch ngân hàng / mã việc
  note
```

Số dư khả dụng = `SUM(amount_vnd)`. Tính trong một câu truy vấn, không cache.

### Quy tắc 2 — Giữ tiền trước khi chạy

```
Nhận yêu cầu
  ├─ số dư < giá?  → từ chối, CHƯA tốn đồng nào tiền API
  └─ đủ            → ghi hold (−giá) → mở session
Session xong
  ├─ có file ra    → ghi commit (0 ₫, chốt hold) + ghi cost_real vào jobs
  └─ lỗi           → ghi refund (+giá) → jobs.status = failed
```

`hold` và `refund` bù trừ nhau nên số dư tự về đúng. Không cần xoá dòng nào.

### Quy tắc 3 — Mỗi thay đổi số dư phải có `ref` duy nhất

Webhook ngân hàng bắn hai lần là chuyện thường. `UNIQUE (kind, ref)` chặn cộng tiền hai lần. Không có ràng buộc này thì sớm muộn cũng mất tiền.

---

## 3. Đường thanh toán

### 3.1. Chuyển khoản QR qua SePay — đường chính

SePay đọc biến động số dư tài khoản ngân hàng và bắn webhook. Không mất phí trên từng giao dịch như cổng thanh toán.

Luồng:

```
Người dùng chọn 300.000 ₫
  → sinh mã giao dịch: TT + <6 ký tự>       (ví dụ TT HL8421)
  → ghi bảng topup_intent (pending, hết hạn sau 30 phút)
  → hiện QR VietQR có sẵn số tiền và nội dung
Người dùng chuyển khoản
  → SePay bắn webhook  →  /api/webhooks/sepay
       ├─ xác thực chữ ký
       ├─ tách mã giao dịch từ nội dung
       ├─ khớp topup_intent, so số tiền
       ├─ ghi ledger topup (+300.000) và bonus (+15.000), ref = mã giao dịch ngân hàng
       └─ Realtime báo về trình duyệt → màn "Đang chờ" tự chuyển sang "Đã nhận"
```

**Ba tình huống phải xử lý, không được bỏ:**

| Tình huống | Xử lý |
|---|---|
| Nội dung chuyển khoản sai | Vào hàng chờ xử lý tay trên trang quản trị. Đây là loại việc tay tốn công nhất — vì vậy màn nạp tiền để cảnh báo nền vàng, không để chìm |
| Số tiền lệch | Cộng đúng số nhận được, không cộng theo gói. Ghi note |
| Webhook đến trước khi người dùng đóng trang | Bình thường. Realtime lo phần hiển thị |

Nếu webhook chết, phải có **đối soát bù**: cron mỗi 15 phút gọi API SePay lấy giao dịch gần đây, đối chiếu với `topup_intent` còn treo.

### 3.2. Ví MoMo — đường phụ

MoMo Business bắt buộc có **giấy phép kinh doanh** (doanh nghiệp hoặc hộ kinh doanh). Không dùng ví cá nhân được.

→ **Giai đoạn đầu chỉ làm QR chuyển khoản.** Thêm MoMo sau khi có GPKD. Nút MoMo vẫn hiện trong thiết kế nhưng để trạng thái "sắp có".

### 3.3. Không làm

- Thẻ quốc tế (Stripe, Paddle): người dùng mục tiêu phần lớn không có
- Tự động gia hạn: mất niềm tin, mà lợi ích không đáng
- Rút credit ra tiền mặt: rắc rối pháp lý, không cần thiết

---

## 4. Chính sách hoàn tiền

| Trường hợp | Xử lý | Tự động? |
|---|---|---|
| Việc chạy lỗi, không ra file | Hoàn đủ vào credit | ✅ Tự động |
| File ra nhưng hỏng nặng, báo trong 24 giờ | Hoàn đủ vào credit | ✅ Tự động, không hỏi lý do |
| Hỏng một trang | Vẽ lại riêng trang đó | ✅ Miễn phí |
| Báo sau 24 giờ | Xét từng trường hợp | ❌ Tay |
| Đòi hoàn tiền mặt | Không có chính sách hoàn tiền mặt | ❌ |

Cho hoàn tự động không hỏi lý do trong 24 giờ nghe rủi ro nhưng thực ra rẻ hơn: giá vốn một việc chỉ vài nghìn đồng, còn tranh cãi với người dùng thì mất thời gian và mất khách. **Theo dõi tỉ lệ hoàn tiền theo người dùng** — ai hoàn quá 30% số việc thì xem lại thủ công.

---

## 5. Chống lạm dụng

| Rủi ro | Xử lý |
|---|---|
| Lập nhiều tài khoản lấy bài miễn phí | Bài miễn phí gắn với **email đã xác minh**, và chỉ mở cho công cụ rẻ nhất, không mở cho bài giảng PPTX |
| Tạo nội dung ngoài giáo dục trên khoá của mình | Lọc đầu vào trước khi mở session; ghi log; khoá tài khoản tái phạm |
| Bấm tạo hàng loạt | Trần: 3 việc chạy cùng lúc, 20 việc/ngày cho mỗi tài khoản |
| Đầu vào cực lớn làm nổ chi phí | Trần số trang, trần dung lượng file, và `budget` của session (ADR-0003 mục 4) |

---

## 6. Pháp lý và thuế — việc anh phải tự làm

| Việc | Vì sao bắt buộc |
|---|---|
| **Đăng ký hộ kinh doanh hoặc doanh nghiệp** | MoMo Business yêu cầu; SePay và xuất hoá đơn cũng cần |
| **Khai báo tài khoản ngân hàng với cơ quan thuế** | Nghị định 68/2026/NĐ-CP: hộ và cá nhân kinh doanh phải khai toàn bộ tài khoản ngân hàng và ví dùng cho kinh doanh `[cần kiểm chứng lại điều khoản áp dụng cụ thể]` |
| **Đăng ký thuế** | Doanh thu dịch vụ số vượt 100 triệu ₫/năm là phải đăng ký và nộp |
| **Viết Điều khoản sử dụng và Chính sách dữ liệu** | Trang thiết kế đã chừa chỗ. Phải nói rõ: giữ file nguồn bao nhiêu ngày, không dùng huấn luyện, không chia sẻ bên thứ ba |
| **Quyết định số ngày lưu file** | Mọi chỗ trong thiết kế đang để `[SỐ] ngày`. Đề xuất: nguồn 7 ngày, kết quả 90 ngày |

Chi tiết và thứ tự làm nằm ở [`docs/viec-anh-phai-tu-lam.md`](../viec-anh-phai-tu-lam.md).

---

## 7. Nguồn

- [SePay — API ngân hàng và webhook](https://sepay.vn/)
- [MoMo cập nhật giải pháp nhận tiền cho hộ kinh doanh — VnExpress](https://vnexpress.net/momo-cap-nhat-giai-phap-nhan-tien-cho-ho-kinh-doanh-5054190.html)
- [Hướng dẫn tích hợp cổng thanh toán MoMo](https://phuongnamvina.com/tich-hop-cong-thanh-toan-momo-vao-website.html)
