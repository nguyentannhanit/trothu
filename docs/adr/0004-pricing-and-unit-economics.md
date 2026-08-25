# ADR-0004: Bài toán đơn vị và bảng giá

- **Trạng thái:** Đề xuất — chờ duyệt
- **Ngày:** 2026-08-24
- **Phụ thuộc:** [ADR-0001](./0001-ai-runtime.md) (runtime là Managed Agents, model của Anthropic)

---

## 0. Việc cần anh đọc trước tiên

**Giá trong bản thiết kế đầu tiên là sai.** Tôi đặt bài giảng PowerPoint 15.000 ₫ trong khi giá vốn ước tính khoảng 52.000 ₫. Bán như vậy là **lỗ 37.000 ₫ mỗi bài**, càng đông khách càng lỗ nặng.

Nguyên nhân: bảng giá đó dựng khi còn tính chạy Kimi K2.7 Code (0,95/4,00 USD). Sau khi ADR-0001 chốt Managed Agents thì chỉ chạy được model của Anthropic, và bảng giá không được tính lại theo.

ADR này tính lại từ đầu và sửa bản thiết kế theo. Kết quả chính:

| | Giá cũ (sai) | Giá mới |
|---|---|---|
| Bài giảng PowerPoint | 15.000 ₫ | **45.000 ₫** |
| Làm đẹp bài giảng cũ | 10.000 ₫ | **32.000 ₫** |
| Đề kiểm tra | 8.000 ₫ | **12.000 ₫** |
| Các công cụ chỉ ra văn bản | phần lớn giữ nguyên | |

Đồng thời thêm hai đường rẻ hơn cho người không muốn trả 45.000 ₫: **bài giảng từ mẫu có sẵn** (15.000 ₫) và **thư viện bài giảng dựng sẵn** (thuê bao).

---

## 0b. SỐ ĐO THẬT — công cụ văn bản trên Gemini (2026-08-24)

Đo trên **8 lần chạy thật**, không phải ước lượng. Đây là số thay thế cho toàn bộ
phần ước tính ở mục 1 và 2 đối với **14 công cụ ra `.docx` / `.xlsx`**.

| Công cụ | Token vào/ra | Giá vốn | Giá bán | Biên |
|---|---|---|---|---|
| Đề kiểm tra | 303 / 2.148 | 514 ₫ | 12.000 ₫ | **96%** |
| Phiếu bài tập | 332 / 1.847 | 445 ₫ | 9.000 ₫ | **95%** |
| Kế hoạch bài dạy | 315 / 2.885 | 687 ₫ | 10.000 ₫ | **93%** |
| Mô tả công việc | 313 / 2.600 | 621 ₫ | 5.000 ₫ | **88%** |
| Kịch bản video ngắn | 303–313 / 1.385–1.772 | 336–427 ₫ | 5.000 ₫ | **91–93%** |
| Bài đăng Fanpage | 312 / 2.035 | 488 ₫ | 5.000 ₫ | **90%** |
| **Trung bình** | | **483 ₫** | | **93%** |

Giá vốn tính theo **giá trả phí** của Gemini Flash (1,50 / 9,00 USD mỗi triệu token,
tỉ giá 26.000 ₫). Tầng miễn phí hiện tại là **0 ₫** — 1.500 lượt/ngày.

### Vì sao rẻ hơn ước tính tới mười lần

Mục 1.2 đoán mỗi việc tốn ~15.000 token đầu ra. Thực tế chỉ **1.400–2.900**. Ba lý do:

1. **Không có vòng lặp agent.** Một lần gọi, không có ngữ cảnh tích luỹ qua từng lượt.
2. **Không nạp skill.** ppt-master ngốn 85–190 KB markdown mỗi phiên; công cụ văn bản không cần.
3. **Đầu ra là JSON có cấu trúc, không phải SVG.** Việc dàn trang do mã tất định lo.

### Điều này đổi gì

**Bảng giá ở mục 3 giờ quá thận trọng đối với 14 công cụ văn bản.** Ở biên 93%, có
thể hạ giá gần một nửa mà vẫn giữ biên trên 85%. Với giáo viên Việt Nam, 6.000 ₫ so
với 12.000 ₫ cho một đề kiểm tra là khác biệt thật về quyết định mua.

Hai hướng, **chưa chốt cái nào** — cần dữ liệu người dùng thật trước:

| Hướng | Lập luận |
|---|---|
| Giữ giá, ăn biên cao | Có tiền nuôi 3 công cụ PPTX vốn đắt, và nuôi thư viện dựng sẵn |
| Hạ giá còn 5.000–7.000 ₫ | Rào cản mua thấp hơn, đông người dùng hơn, dễ lan truyền trong nhóm giáo viên |

Quyết định sau khi có 10 người dùng thật — xem `plan.md` mốc M4 tiêu chí 7.

**Ba công cụ ra `.pptx` KHÔNG áp dụng số này.** Chúng vẫn cần ppt-master và Managed
Agents, giá vốn vẫn theo ước tính ở mục 1.3 cho tới khi chạy thử M1 thật.

---

## 1. Cách tính giá vốn

ppt-master không công bố số token nào — FAQ nói thẳng repo *"không chứa quan hệ đo được nào giữa việc tái dùng template và lượng token"*. Nên tôi dựng mô hình từ kích thước thật của file trong repo. Giả định nêu hết ra đây để anh bác bỏ được.

### 1.1. Số đo thật (byte, đo trên `vendor/ppt-master`)

| Thành phần | Kích thước |
|---|---|
| `SKILL.md` + `routing.md` + `quick-generate.md` (nạp cho luồng Quick) | 84,6 KB |
| `references/executor-base.md` | 49,1 KB |
| Các reference khác agent phải đọc thêm | ~40 KB |
| SVG một trang (đo trên 4 trang mẫu thật) | 3,0 – 11,3 KB, trung bình ~8 KB |
| `design_spec.md` sinh ra (mẫu thật) | 32,4 KB |

### 1.2. Giả định quy đổi

| Giả định | Giá trị | Vì sao |
|---|---|---|
| Markdown kỹ thuật | ~3,5 ký tự/token | Tiếng Anh nhiều thuật ngữ, nhiều bảng |
| SVG | ~3,0 ký tự/token | Dày số và tên thuộc tính |
| Số lượt gọi model / deck 13 trang | ~40 | Đọc nguồn 5 · lập kế hoạch 5 · vẽ trang 13×2 · kiểm tra sửa 6 · xuất 3 |
| Ngữ cảnh trung bình mỗi lượt | ~95k token | Tăng dần từ ~65k đến ~120k |
| Tỉ lệ cache hit | ~92% | Managed Agents bật prompt caching sẵn |
| Thinking token | ~1,5× phần output nhìn thấy | Tính tọa độ tuyệt đối cần suy luận nhiều. Thinking tính tiền như output |
| Tokenizer Sonnet 5 | ×1,3 | Tài liệu giá của Anthropic ghi rõ Claude 4.7 trở lên sinh nhiều hơn ~30% token |
| Tokenizer Haiku 4.5 | ×1,0 | Thuộc thế hệ tokenizer cũ |
| Tỉ giá | 1 USD ≈ 26.000 ₫ | `[cần kiểm chứng lại lúc phát hành]` |

### 1.3. Giá vốn một deck 13 trang, luồng Quick

| | Claude Sonnet 5 | Claude Haiku 4.5 |
|---|---|---|
| Đọc cache | 4,55 M × 0,20 $ = 0,91 $ | 3,50 M × 0,10 $ = 0,35 $ |
| Ghi cache | 0,26 M × 2,50 $ = 0,65 $ | 0,20 M × 1,25 $ = 0,25 $ |
| Input mới | 0,13 M × 2,00 $ = 0,26 $ | 0,10 M × 1,00 $ = 0,10 $ |
| Output (gồm thinking) | 0,15 M × 10,00 $ = 1,50 $ | 0,115 M × 5,00 $ = 0,58 $ |
| Session runtime | 0,02 $ | 0,02 $ |
| **Cộng** | **≈ 3,34 $ ≈ 87.000 ₫** | **≈ 1,30 $ ≈ 34.000 ₫** |
| Luồng Quick (~60% Default) | **≈ 2,00 $ ≈ 52.000 ₫** | **≈ 0,78 $ ≈ 20.000 ₫** |

Công cụ **chỉ sinh văn bản** (đề kiểm tra, phiếu bài tập, hợp đồng, kịch bản video) rẻ hơn hẳn vì bỏ hẳn khâu vẽ SVG từng trang — khâu đắt nhất. Ước ~15 lượt, ngữ cảnh trung bình ~40k, output ~15k token → **Haiku 4.5 ≈ 0,18 $ ≈ 4.700 ₫**.

> ⚠️ Toàn bộ bảng trên là **ước lượng, không phải số đo**. Sai số ±50% là bình thường cho tới khi M1 chạy thật. Hệ số nhân giá ở mục 2 được đặt để chịu được sai số đó.

---

## 2. Quy tắc định giá

> **Giá bán = giá vốn ước tính × 2,2, làm tròn lên mốc 1.000 ₫.**

Hệ số 2,2 không phải lợi nhuận. Nó phải nuôi năm khoản:

| Khoản | Ước |
|---|---|
| Việc chạy hỏng phải hoàn tiền (chi phí API mình chịu) | ~8% |
| Bài đầu miễn phí cho người mới | ~10% doanh thu tháng đầu của mỗi người |
| Phí thanh toán | ~2% |
| Thuế | theo quy định hộ kinh doanh |
| Sai số ước tính giá vốn | ±50% |

Sau khi trừ hết, biên thực còn khoảng **45–50%**. Đó mới là con số thật.

**Ngưỡng báo động: biên dưới 50% kéo dài 7 ngày** → phải xử lý ngay, xem mục 5.

---

## 3. Bảng giá

Model mặc định: **Haiku 4.5**. Riêng bài giảng có thêm bản chạy Sonnet 5.

### Giáo dục

| Công cụ | Model | Giá vốn ước | Giá bán | Biên |
|---|---|---|---|---|
| Bài giảng PowerPoint | Haiku 4.5 | 20.000 ₫ | **45.000 ₫** | 56% |
| Bài giảng PowerPoint — bản đẹp | Sonnet 5 | 52.000 ₫ | **120.000 ₫** | 57% |
| Làm đẹp bài giảng cũ | Haiku 4.5 | 14.000 ₫ | **32.000 ₫** | 56% |
| Bài giảng từ mẫu có sẵn | Haiku 4.5 | 6.000 ₫ | **15.000 ₫** | 60% |
| Đề kiểm tra | Haiku 4.5 | 4.700 ₫ | **12.000 ₫** | 61% |
| Kế hoạch bài dạy | Haiku 4.5 | 4.000 ₫ | **10.000 ₫** | 60% |
| Phiếu bài tập phân hoá | Haiku 4.5 | 3.500 ₫ | **9.000 ₫** | 61% |

### Kế toán / Tài chính

| Công cụ | Giá vốn ước | Giá bán | Biên |
|---|---|---|---|
| Báo cáo tài chính | 6.000 ₫ | **14.000 ₫** | 57% |
| Đối soát sao kê | 5.000 ₫ | **12.000 ₫** | 58% |
| Bảng lương tháng | 4.000 ₫ | **10.000 ₫** | 60% |

### Xây dựng / Kỹ thuật

| Công cụ | Giá vốn ước | Giá bán | Biên |
|---|---|---|---|
| Báo cáo tiến độ tuần | 5.500 ₫ | **13.000 ₫** | 58% |
| Thuyết minh dự toán | 5.500 ₫ | **13.000 ₫** | 58% |
| Biên bản nghiệm thu | 4.500 ₫ | **11.000 ₫** | 59% |

### Bán hàng / Marketing

| Công cụ | Giá vốn ước | Giá bán | Biên |
|---|---|---|---|
| Báo giá gửi khách | 2.500 ₫ | **6.000 ₫** | 58% |
| Kịch bản video ngắn | 2.000 ₫ | **5.000 ₫** | 60% |
| Bài đăng Fanpage | 2.000 ₫ | **5.000 ₫** | 60% |

### Nhân sự / Hành chính

| Công cụ | Giá vốn ước | Giá bán | Biên |
|---|---|---|---|
| Hợp đồng lao động | 3.000 ₫ | **8.000 ₫** | 62% |
| Mô tả công việc | 2.000 ₫ | **5.000 ₫** | 60% |

### Tuỳ chọn cộng thêm

| Tuỳ chọn | Giá vốn ước | Cộng thêm |
|---|---|---|
| Hình minh hoạ vẽ riêng (4 hình, `gpt-image-2` mức trung bình) | 5.200 ₫ | **+ 8.000 ₫** |
| Không bật thì dùng ảnh từ Pexels/Pixabay | 0 ₫ | 0 ₫ |

---

## 4. Vì sao 45.000 ₫ cho một bài giảng là bán được

Giáo viên tự soạn một bài giảng điện tử mất khoảng **2–3 tiếng**. Đó là chi phí thật họ đang trả bằng thời gian buổi tối.

Nhưng "tiết kiệm thời gian" không tự động thành tiền, nhất là với nghề mà văn hoá chia sẻ tài liệu miễn phí rất mạnh. Nên **không được chỉ có một mức giá**. Ba tầng:

| Tầng | Giá | Giá vốn | Dùng khi |
|---|---|---|---|
| **Thư viện dựng sẵn** | thuê bao ~49.000 ₫/tháng, tải không giới hạn | ~0 ₫ | Bài đúng chương trình — phần lớn nhu cầu |
| **Từ mẫu có sẵn** | 15.000 ₫/bài | 6.000 ₫ | Có sẵn nội dung, chỉ cần trình bày lại |
| **Sinh mới hoàn toàn** | 45.000 ₫/bài | 20.000 ₫ | Bài riêng, chuyên đề, ngoại khoá |

**Lãi chính đến từ tầng thư viện, không phải tầng sinh AI.** Đây là điểm quan trọng nhất của cả tài liệu này.

### Vì sao thư viện là câu trả lời

Chương trình GDPT 2018 là chương trình **quốc gia**. Bài "Phân số bằng nhau" lớp 5 giống nhau ở hàng chục nghìn lớp. Mô hình bán theo lượt hiện tại bắt **mỗi giáo viên trả tiền để sinh lại cùng một bài giảng** — vô lý về kinh tế.

Đảo lại:

- Mình sinh trước 2.000 bài, trả **một lần**: 2.000 × 20.000 ₫ = **40 triệu ₫**
- Giáo viên tải về sửa trong PowerPoint — chi phí biên gần **0 ₫**
- Sinh bằng AI thành đường **dự phòng**, không phải đường mặc định

40 triệu ₫ là **tài sản cố định**, không phải hoá đơn hằng tháng. Chia cho 10.000 giáo viên là 4.000 ₫/người, trả một lần.

Và đây mới là thứ khó sao chép. Lớp vỏ AI đối thủ dựng lại trong hai tuần. **2.000 bài giảng tiếng Việt đã kiểm duyệt nội dung** thì không.

**Cảnh báo:** đừng dựng thư viện trước khi M1 chứng minh chất lượng bài giảng đủ dùng. Sinh 2.000 bài xấu là mất 40 triệu ₫ và không cứu được.

---

## 5. Khi biên tụt dưới 50%

Xử lý theo thứ tự, dừng lại ngay khi biên hồi phục:

1. **Xem lại đầu vào.** Người dùng đưa file quá to hay yêu cầu quá nhiều trang? Đặt trần (ví dụ tối đa 20 trang, file ≤ 20 MB).
2. **Hạ luồng.** Đang chạy Default thì chuyển sang Quick cho công cụ đó.
3. **Đổi model.** Sonnet 5 → Haiku 4.5. Phải chạy thử 20 bài so sánh chất lượng trước, không đổi mù.
4. **Tăng giá.** Báo trước 14 ngày, giữ giá cũ cho phần credit đã nạp.
5. **Bỏ công cụ.** Nếu ba bước trên không cứu được thì nó không có mô hình kinh doanh. Bỏ đi tốt hơn là bán lỗ.

Tuyệt đối **không** làm: âm thầm giảm chất lượng để giữ giá. Người dùng sẽ nhận ra, và mất niềm tin thì không mua lại lần hai.

---

## 6. Số phải đo ở M1 — không đo thì mọi thứ trên đây là suy đoán

| Cần đo | Cách đo |
|---|---|
| `usage` thật của một deck 13 trang, cả Haiku lẫn Sonnet 5 | Chạy mỗi bên 5 lần, lấy trung vị |
| Chênh lệch chất lượng Haiku vs Sonnet 5 | Cùng một giáo án, chạy 10 lần mỗi model, đếm số trang tràn chữ / lệch bố cục |
| Chi phí luồng "từ mẫu có sẵn" | Chạy 5 lần |
| Tỉ lệ chạy hỏng | Đếm trên 50 lần chạy đầu |
| Thời gian `pip install` trong sandbox | Đo ngay lần đầu — nếu quá lâu thì phải dựng sẵn môi trường |

Sau khi có số, **quay lại sửa ADR này** và sửa bảng giá trong bộ thiết kế cho khớp.
