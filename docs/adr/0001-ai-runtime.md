# ADR-0001: Chọn AI runtime cho Trợ Thủ (bản web)

- **Trạng thái:** Đề xuất — chờ duyệt
- **Ngày:** 2026-08-24 (viết lại toàn bộ; bản 2026-08-23 dành cho app desktop đã bỏ)
- **Phạm vi:** Chạy workflow `ppt-master` (và các workflow ngành khác sau này) trên **máy chủ của mình**, bằng **khóa API của mình**, để bán theo lượt cho người dùng Việt Nam.

---

## 1. Điều gì đã đổi so với bản trước

| | Bản desktop (bỏ) | Bản web (hiện tại) |
|---|---|---|
| Chỗ chạy agent | Máy giáo viên | Máy chủ của mình |
| Khóa API | Giáo viên tự nhập (BYOK) | **Khóa của mình** |
| Ai trả tiền token | Giáo viên trả thẳng cho nhà cung cấp | **Mình trả trước, thu lại qua credit** |
| Harness | Claude Agent SDK (bọc Claude Code) | **Không được dùng Claude Code** — xem mục 2 |

Đổi một dòng "ai trả tiền token" làm hỏng toàn bộ kiến trúc cũ. Đây là lý do ADR này phải viết lại chứ không vá.

---

## 2. Ràng buộc pháp lý — quyết định luôn phương án

Trang *Legal and compliance* của Claude Code, mục **"Can customers offer Claude Code in their products?"**:

> **Customers may not pay for, resell, or intermediate Claude usage on their end users' behalf.** Each end user must authenticate with their own Anthropic API key, Claude subscription plan credentials, or 3P inference provider credential […]. That usage is billed directly to the end user under their own agreement with Anthropic […].

Ngược lại, *Commercial Terms of Service* (mục A.1) cho phép rõ ràng việc dựng sản phẩm trên **Claude API**:

> […] to power products and services Customer makes available to its own customers and end users.

Mục D.4 chỉ cấm **bán lại dịch vụ** (resell the Services) — tức bán quyền truy cập model thô. Trợ Thủ bán một sản phẩm hoàn chỉnh (nhận giáo án → trả file .pptx), không bán quyền gọi API. Đây là mô hình SaaS bình thường.

**Kết luận cứng:**

| Cách làm | Được phép? |
|---|---|
| Claude Code / Claude Agent SDK + khóa của mình + thu tiền người dùng | ❌ **Cấm** |
| Claude **API** (Messages hoặc Managed Agents) + khóa của mình + bán sản phẩm | ✅ Được |
| Moonshot/Kimi API + bán sản phẩm | ✅ Được (chỉ cần thỏa thuận riêng nếu doanh thu Model-as-a-Service > 20 triệu USD/năm — không liên quan) |

→ **Loại bỏ hoàn toàn Claude Agent SDK khỏi kiến trúc web.** Kể cả khi trỏ nó sang endpoint Moonshot, binary vẫn là của Anthropic và điều khoản "không sửa binary, không thu tiền hộ" vẫn treo lơ lửng. Không đáng đánh cược cả doanh nghiệp vào một vùng xám.

---

## 3. Bài toán kỹ thuật còn lại

Bỏ Claude Code đi thì mất luôn thứ nó cho không: **vòng lặp agent** và **môi trường chạy lệnh**. ppt-master cần cả hai, vì `SKILL.md` bắt agent tự gõ lệnh shell chạy các script Python trong thư mục skill:

> Run `python3 "${SKILL_DIR}/scripts/attribution_guard.py"` […]

Một lần tạo deck là hàng chục lệnh như vậy: `svg_quality_checker.py`, `finalize_svg.py`, `svg_to_pptx.py`, `image_gen.py`, `source_to_md/pdf_to_md.py`…

Nên runtime bắt buộc phải có đủ bốn thứ:

1. Vòng lặp nhiều lượt (model gọi tool → chạy → trả kết quả → lặp)
2. Tool đọc/ghi file và **chạy lệnh shell**
3. Một **container cách ly** cho mỗi việc — ppt-master chạy lệnh tùy ý, không được để chung máy với dữ liệu người khác
4. Python 3.10+ với đầy đủ `requirements.txt` của ppt-master trong container đó

---

## 4. Ba phương án

### (A) Claude Managed Agents — Anthropic chạy hộ cả vòng lặp lẫn sandbox

Anthropic cung cấp `POST /v1/agents` + `/v1/sessions`: mình khai báo agent một lần, mỗi việc mở một session, Anthropic dựng container riêng và chạy vòng lặp. Bốn thứ ở mục 3 đều có sẵn.

Cách nạp ppt-master vào, hai đường:

| Đường | Cách làm | Đánh đổi |
|---|---|---|
| **Skills API** | Đóng gói `skills/ppt-master/` thành custom skill, tham chiếu bằng `skill_id` trên agent | Sạch, không cần GitHub token. Tối đa 20 skill/agent — thừa sức |
| **`github_repository`** | Repo riêng của mình có `.claude/skills/ppt-master/`, mount vào session | Cần PAT GitHub; đổi skill là phải mở session mới. Tiện khi muốn sửa skill thường xuyên |

Các mảnh khớp sẵn, đã kiểm chứng trong tài liệu:

- `networking: {type: "limited", allow_package_managers: true}` → container **`pip install` được** `requirements.txt` của ppt-master
- Agent ghi file ra `/mnt/session/outputs/` → lấy về bằng Files API với `scope_id = session_id`. Đây là đường file `.pptx` đi ra
- **Session budget** — trần chi tiêu tính bằng tiền cho từng session, do nền tảng chặn. Đây chính là cơ chế chống lạm dụng mà mô hình bán theo lượt bắt buộc phải có
- Nén ngữ cảnh và prompt caching bật sẵn
- Có màn theo dõi trực tiếp trong Console để soi khi lỗi

**Giá:** token theo bảng giá thường + **0,08 USD/giờ-session** (chỉ tính lúc `running`). Một deck ~15 phút ≈ 0,02 USD ≈ **520 ₫**. Không đáng kể so với token.

**Điểm yếu lớn nhất:** khóa vào model của Anthropic. Không chạy được Kimi K2.7 Code (0,95/4,00 USD) — mà đó lại là đòn bẩy chi phí mạnh nhất trong bảng ở ADR-0004.

### (B) Tự viết vòng lặp agent + tự chạy container

Tự viết vòng lặp tool-use bằng Anthropic SDK (hoặc Tool Runner), tự dựng container Docker có Python + ppt-master, tự quản hàng đợi, tự dọn container, tự chặn chi phí.

- **Được:** chạy được model nào cũng được — Kimi K2.7 Code, GLM, MiniMax. Chi phí/deck giảm còn khoảng **một phần ba**.
- **Mất:** phải tự làm phần khó nhất. Cách ly container, giới hạn tài nguyên, dọn rác, chống thoát sandbox, hàng đợi, thử lại, theo dõi. Và chất lượng vòng lặp tự viết gần như chắc chắn kém Claude Code ở giai đoạn đầu — mà ppt-master lại rất nhạy với chất lượng harness (README nói thẳng: *"model đặt trần chất lượng"*).

### (C) Claude Code / Claude Agent SDK

**Loại.** Vi phạm điều khoản ở mục 2.

---

## 5. Quyết định

### 5.1. Ra mắt (M1 → M4): **phương án (A) — Claude Managed Agents**, model mặc định **Claude Haiku 4.5**

Lý do, xếp theo mức quan trọng:

**Một — nó bỏ đi đúng ba việc khó nhất.** Vòng lặp agent, sandbox cách ly, và trần chi phí theo session. Ba thứ này nếu tự làm thì mất hàng tuần và sai một cái là mất tiền thật hoặc lộ dữ liệu người khác.

**Hai — hợp lệ rõ ràng.** Không phải suy diễn điều khoản.

**Ba — chọn model theo bài toán đơn vị, không theo cảm tính.** [ADR-0004](./0004-pricing-and-unit-economics.md) tính ra một deck 13 trang chạy Sonnet 5 tốn khoảng **52.000 ₫**, chạy Haiku 4.5 khoảng **20.000 ₫**. Ở mức giá giáo viên Việt Nam chấp nhận được, chênh lệch đó quyết định sản phẩm có mô hình kinh doanh hay không. Nên:

| Tầng | Model | Giá bán |
|---|---|---|
| Mặc định | **Claude Haiku 4.5** | 45.000 ₫ |
| Bản đẹp (tuỳ chọn) | Claude Sonnet 5 | 120.000 ₫ |

Đây là quyết định **có điều kiện**. FAQ của ppt-master nói SVG đòi tính tọa độ tuyệt đối chính xác và Claude làm tốt hơn các dòng khác — nhưng nó không nói gì về chênh lệch *giữa* các bậc Claude. Haiku 4.5 là bậc nhỏ nhất, nên rủi ro tràn chữ và lệch bố cục là có thật.

**M1 tiêu chí 8 bắt buộc phải đo:** cùng một giáo án, chạy 10 lần mỗi model, đếm số trang hỏng. Nếu Haiku 4.5 hỏng quá 20% số trang thì đảo lại — Sonnet 5 làm mặc định, giá bài giảng lên 120.000 ₫, và tầng "từ mẫu có sẵn" 15.000 ₫ thành sản phẩm chủ lực.

**Bốn — đo được ngay.** Session trả về `usage` đầy đủ, nên ghi chi phí thật từng việc vào cơ sở dữ liệu ngay từ ngày đầu. Không có số này thì không biết công cụ nào đang lỗ (xem trang quản trị trong bộ thiết kế).

### 5.2. Tối ưu chi phí (sau khi có khách thật): **chuyển dần sang (B)**

Chỉ làm khi có **đủ ba điều kiện**:

1. Đã chạy thật ít nhất 200 việc và có số liệu chi phí từng công cụ
2. Có ít nhất một công cụ biên lợi nhuận dưới 50% kéo dài
3. Lượng việc đủ lớn để tiền tiết kiệm được bù chi phí vận hành hạ tầng riêng

Chuyển từng công cụ một, không chuyển cả hệ. Bắt đầu bằng công cụ **đơn giản nhất** (Mô tả công việc, Bài đăng Fanpage — không cần chạy Python) chứ không phải bài giảng PPTX.

### 5.3. Ranh giới bắt buộc để chuyển được về sau

Toàn bộ mã gọi AI nằm sau **một interface duy nhất**:

```
run_job(tool_id, input, budget) -> { output_files, usage, cost }
```

Web app không bao giờ gọi thẳng Anthropic SDK. Đổi từ (A) sang (B) chỉ được phép đụng vào phần cài đặt của interface này. Nếu một ngày phải sửa cả UI để đổi runtime, tức là ranh giới đã bị vi phạm từ trước.

---

## 6. Hệ quả

**Phải làm:**

- Đóng gói `vendor/ppt-master/skills/ppt-master/` thành custom skill và tải lên qua Skills API. Ghi lại `skill_id` và phiên bản trong cấu hình.
- Mỗi công cụ = một **agent** riêng (system prompt + skill + tool riêng). Tạo một lần, lưu `agent_id`, **không bao giờ gọi `agents.create()` trong đường xử lý yêu cầu**.
- Mỗi việc = một **session** riêng, có `budget` bằng đúng trần chi phí của công cụ đó nhân 1,5 (đệm cho lần chạy khó).
- `networking` để `limited` + `allow_package_managers: true`. Chỉ mở thêm host khi thật cần (ví dụ Pexels cho tìm ảnh).
- Ghi `usage` và `cost` thật vào bảng `jobs` mỗi khi session kết thúc — không có ngoại lệ.
- Xóa session sau khi đã lấy file ra và hết thời hạn lưu.

**Chấp nhận:**

- Khóa vào Anthropic ở giai đoạn đầu. Đây là đánh đổi có chủ ý: đổi tiền lấy tốc độ ra mắt và sự an toàn.
- Chi phí/deck cao hơn khoảng ba lần so với chạy model rẻ. ADR-0004 xử lý chuyện này bằng cách xếp tầng sản phẩm chứ không bằng cách hạ chất lượng.

**Chưa kiểm chứng, phải thử ở M1:**

- `pip install` toàn bộ `requirements.txt` của ppt-master trong sandbox mất bao lâu, và có wheel nào gãy không (`skia-pathops`, `uharfbuzz`, `PyMuPDF` là ba cái đáng ngờ nhất). Nếu chậm, cân nhắc dựng sẵn môi trường thay vì cài lại mỗi session.
- ppt-master có chạy trơn trong sandbox của Anthropic không — nó vốn được viết cho Claude Code, không phải Managed Agents.
- Chi phí thật một deck 13 trang. Mọi con số trong ADR-0004 hiện là **ước lượng**.

---

## 7. Nguồn

- `vendor/ppt-master/skills/ppt-master/SKILL.md`, `requirements.txt`, `docs/faq.md`, `README.md`
- [Legal and compliance — Claude Code Docs](https://code.claude.com/docs/en/legal-and-compliance)
- [Commercial Terms of Service — Anthropic](https://www.anthropic.com/legal/commercial-terms)
- [Pricing — Claude Platform Docs](https://platform.claude.com/docs/en/about-claude/pricing)
- Tài liệu Managed Agents đi kèm skill `claude-api`: `managed-agents-core.md`, `managed-agents-environments.md`, `managed-agents-tools.md`
- [Terms of Service for Kimi OpenPlatform](https://platform.kimi.ai/docs/agreement/modeluse)
