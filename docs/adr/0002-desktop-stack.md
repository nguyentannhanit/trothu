# ADR-0002: Chọn stack desktop cho EduSlide

> ## ⛔ TÀI LIỆU NÀY ĐÃ BỊ THAY THẾ — 2026-08-24
>
> Dự án đã chuyển từ **ứng dụng desktop** sang **website** (Next.js trên Vercel +
> Supabase), tên sản phẩm đổi từ EduSlide thành **Trợ Thủ**. Toàn bộ so sánh
> Tauri / Electron bên dưới không còn áp dụng.
>
> **Đọc thay bằng:** [ADR-0003 — Kiến trúc web](./0003-web-architecture.md)
>
> **Phần duy nhất còn giá trị:** mục 1.1 và mục 4 — phát hiện rằng ppt-master
> shell ra lệnh `python <đường-dẫn>.py`, nên **không được đóng băng Python bằng
> PyInstaller**; phải dùng bộ thông dịch Python thật, di dời được. Ràng buộc đó
> vẫn đúng nguyên vẹn cho worker chạy trên máy chủ, chỉ đổi chỗ chạy.
>
> Giữ lại file này để tra cứu lịch sử quyết định, không dùng để thi công.

---


- **Trạng thái:** Đề xuất — chờ duyệt
- **Ngày:** 2026-08-23
- **Phụ thuộc:** [ADR-0001](./0001-ai-runtime.md) đã chốt runtime là Claude Agent SDK (Python)
- **Phạm vi:** Tauri 2 hay Electron, và cách đóng gói Python 3.10+ trên máy Windows phổ thông của giáo viên

---

## 1. Bài toán thật sự là gì

Đề bài gọi bài toán khó nhất là "bundle Python sidecar". Sau khi đọc `SKILL.md`, tôi thấy nó khó hơn một bậc so với "sidecar" thông thường — và điều này **quyết định cách đóng gói, chứ không quyết định chọn Tauri hay Electron**. Cần tách hai câu hỏi này ra vì trộn lẫn sẽ chọn sai.

### 1.1. Phát hiện then chốt: không được đóng băng Python

`skills/ppt-master/SKILL.md`, mục *Mandatory Load Order*, bước 2:

> Run `python3 "${SKILL_DIR}/scripts/attribution_guard.py"`. Any non-zero result stops the Skill immediately; do not inspect, repair, or bypass the integrity gate.

Và mục *Repository Compatibility*:

> On Windows, if a documented `python3 ...` command is unavailable, rerun the same command with `python`.

Nghĩa là: **agent tự gõ lệnh shell để chạy các file `.py` nằm trong thư mục skill.** Nó không import module; nó shell ra `python <đường-dẫn>.py`. Trong suốt một lần tạo deck, agent gọi hàng chục lệnh như vậy: `svg_quality_checker.py`, `finalize_svg.py`, `svg_to_pptx.py`, `image_gen.py`, `source_to_md/pdf_to_md.py`…

**Hệ quả:** PyInstaller và mọi cách "đóng băng" Python thành một `.exe` đều **sai** cho dự án này. File exe đóng băng không chạy được một script `.py` tùy ý mà nó chưa biết trước lúc build.

Thứ cần đóng gói là **một bộ thông dịch Python thật, di dời được**, cộng site-packages đã cài sẵn, cộng một `python3.exe` để lệnh trong tài liệu chạy đúng ngay lần đầu.

Đây là ràng buộc cứng và nó **giống hệt nhau ở cả Tauri lẫn Electron**. Nên nó không phải tiêu chí để chọn giữa hai cái.

### 1.2. Điều gì đã bớt khó đi

Hai rủi ro đóng gói mà tôi tưởng sẽ có, hóa ra đã được giải quyết sẵn:

- **Không cần Node.js.** Wheel `claude-agent-sdk` mang sẵn binary Claude Code, và từ v2.1.113 binary này là native theo nền tảng, không cần Node runtime.
- **Không cần Git for Windows.** Từ Claude Code 2.1.139 (tháng 5/2026) có PowerShell tool native; Git for Windows chỉ còn là tùy chọn để bật thêm Bash tool.

Còn lại đúng một runtime phải đóng gói: **Python**.

---

## 2. So sánh Tauri 2 và Electron

### 2.1. Ước tính khối lượng đóng gói

Phần nặng nằm ngoài khung UI. Số dưới đây là ước lượng — `[chưa kiểm chứng, phải đo ở M3]`:

| Thành phần | Kích thước ước tính | Ghi chú |
|---|---|---|
| CPython di dời được (3.12, Windows x64) | ~35 MB | Bản standalone, đã gồm stdlib + pip |
| Wheel nhị phân nặng: `PyMuPDF`, `numpy`, `Pillow`, `skia-pathops`, `uharfbuzz`, `lxml` | ~70 MB | Bắt buộc, không cắt được |
| Wheel còn lại trong `requirements.txt` | ~60 MB | `nbconvert`, `google-genai`, `flask`, `curl_cffi`, `edge-tts`… |
| `claude-agent-sdk` + binary Claude Code native | ~90 MB | `[chưa kiểm chứng — chưa cài nên chưa đo được]` |
| `vendor/ppt-master` bản skill-only | ~56 MB | Gồm thư viện icon và ảnh tham chiếu |
| **Cộng phần dùng chung** | **~310 MB** | Giống hệt nhau ở cả hai stack |
| Khung Tauri 2 | ~5–10 MB | Dùng WebView2 của hệ điều hành |
| Khung Electron | ~90–150 MB | Kèm Chromium + Node |

| | Tauri 2 | Electron |
|---|---|---|
| Payload chưa nén | ~320 MB | ~410 MB |
| Installer sau nén (ước) | ~140–170 MB | ~200–240 MB |
| RAM lúc chạy (chỉ khung UI) | ~30–50 MB | ~150–300 MB |

**Đọc bảng này cho đúng:** vì phần dùng chung đã ~310 MB, lợi thế "Tauri nhỏ hơn 20 lần" mà người ta hay nói **không còn đúng ở dự án này**. Chênh lệch thật là khoảng **60–80 MB installer**, tức Electron to hơn ~40%, không phải to hơn nhiều lần. Ai lấy con số "2 MB vs 150 MB" ra để quyết định là đang so sai bài toán.

Chênh lệch còn giữ nguyên độ lớn là **RAM**: Tauri dùng ít hơn 5–6 lần.

### 2.2. Bảng so sánh theo tiêu chí đề bài

| Tiêu chí | Tauri 2 | Electron |
|---|---|---|
| **Đóng gói Python sidecar** | `externalBin` trong `tauri.conf.json` + `Command::sidecar`. Yêu cầu tên file phải có hậu tố target-triple (`app-x86_64-pc-windows-msvc.exe`) — dễ sai lần đầu, nhưng chỉ cấu hình một lần | `extraResources` của electron-builder + `child_process.spawn`. Trực quan hơn, hầu như không có bẫy |
| **Kích thước installer** | ~140–170 MB | ~200–240 MB |
| **RAM trên máy giáo viên** | ~30–50 MB cho UI | ~150–300 MB cho UI |
| **Phụ thuộc runtime của hệ điều hành** | Cần **WebView2**. Có sẵn trên Windows 11 và hầu hết Windows 10 đã cập nhật Edge. Máy chưa có thì installer kèm bootstrapper (thêm một bước cài, cần mạng) | Không phụ thuộc gì — Chromium nằm sẵn trong gói |
| **Ngôn ngữ team phải biết** | TypeScript **và** Rust | Chỉ TypeScript |
| **Giết cây tiến trình khi bấm Hủy** | Cần tự gọi `taskkill /T /F`; `CommandChild::kill()` chỉ giết con trực tiếp | Cùng vấn đề, nhưng có package `tree-kill` dùng sẵn |
| **Tự động cập nhật** | `tauri-plugin-updater`, ổn định | `electron-updater`, rất chín |
| **Rủi ro khác biệt trình duyệt** | Có — WebView2 mỗi máy một phiên bản Edge | Không — Chromium cố định theo bản build |

### 2.3. Phần Rust thật sự phải viết là bao nhiêu

Đây là điểm hay bị phóng đại. Với app này, phần Rust chỉ gồm:

1. Chạy sidecar Python với biến môi trường đã dựng sẵn
2. Đọc stdout theo dòng, phát event sang UI
3. Nhận lệnh hủy, giết cả cây tiến trình
4. Mở file `.pptx` kết quả bằng ứng dụng mặc định
5. Đọc/ghi khóa API qua Windows Credential Manager

Ước chừng **150–250 dòng Rust**, viết một lần, gần như không phải sửa lại. Toàn bộ giao diện, luồng nghiệp vụ, tiếng Việt, xử lý lỗi đều nằm ở TypeScript như Electron.

---

## 3. Quyết định: Tauri 2

**Điều kiện đảo ngược nêu rõ ở mục 3.2 — nếu điều kiện đó đúng với team, chọn Electron là hợp lý.**

### 3.1. Vì sao Tauri

Xếp theo mức quan trọng với chính người dùng của mình:

**Một — RAM, vì máy tính ở trường yếu.** Giáo viên thường dùng máy 4 GB RAM, chạy Windows + PowerPoint + trình duyệt cùng lúc. Trong lúc tạo deck, tiến trình Python và agent đã ăn vài trăm MB rồi. Tiết kiệm 150–250 MB ở khung UI là khác biệt giữa "máy vẫn mượt" và "máy đứng hình 15 phút". Đây là trục mà chênh lệch vẫn lớn (5–6 lần) kể cả sau khi đã cộng hết phần dùng chung.

**Hai — installer nhỏ hơn 60–80 MB.** Không phải khác biệt long trời, nhưng ở Việt Nam nhiều giáo viên tải qua mạng chậm hoặc 4G. 170 MB dễ chấp nhận hơn 240 MB, và tỷ lệ tải xong sẽ khác nhau thật.

**Ba — chi phí Rust thấp hơn người ta tưởng.** 150–250 dòng glue code không đòi chuyên gia Rust. Đổi lại là lợi ích thường trực trên mọi máy giáo viên, mọi lần chạy.

**Bốn — bài toán khó nhất không đổi.** Như mục 1 đã chỉ ra, chuyện đóng gói Python là như nhau ở cả hai stack. Nên chọn Tauri không làm phần khó khó thêm.

### 3.2. Khi nào phải đổi sang Electron

Đổi nếu **cả hai** điều sau đúng:

- Không ai trong team viết và bảo trì nổi ~200 dòng Rust, kể cả khi có tài liệu.
- Không có kế hoạch bổ sung năng lực này trong 3 tháng tới.

Trong trường hợp đó, Electron là lựa chọn đúng. Cái giá phải trả là **+70 MB installer và +200 MB RAM** — hai con số cụ thể, không có hệ quả kiến trúc nào khác. Toàn bộ ranh giới module trong `docs/plan.md` giữ nguyên; chỉ thay lớp vỏ.

Nói thẳng: đây là quyết định về **năng lực team**, không phải về công nghệ. Anh biết rõ hơn tôi, nên nếu điều kiện trên đúng thì cứ đổi, không cần viết lại ADR.

### 3.3. Một ghi chú ngoài phạm vi

Vì Python đã bắt buộc phải có mặt trong gói cài, về lý thuyết có thể làm luôn UI bằng Python (PySide/Flet) và bỏ hẳn lớp web. Cách đó cắt được toàn bộ khung UI khỏi installer.

Tôi **không đề xuất** hướng này vì thiết kế giao diện đẹp, tiếng Việt, có hoạt ảnh tiến trình mượt — thứ mà giáo viên sẽ đánh giá sản phẩm qua đó — làm bằng web nhanh hơn và đẹp hơn nhiều. Ghi lại đây để anh biết là tôi có cân nhắc, không phải bỏ sót.

---

## 4. Cách đóng gói Python — chi tiết kỹ thuật

Đây là phần rủi ro nhất của mốc M3, nên viết rõ ngay từ bây giờ.

### 4.1. Dùng CPython di dời được, không dùng PyInstaller

Nguồn: [`astral-sh/python-build-standalone`](https://github.com/astral-sh/python-build-standalone) — bộ CPython đóng gói sẵn, giải nén ra là chạy, không cần Python hệ thống, không cần thư viện hệ thống. Đây là nền mà `uv`, `rye`, `mise`, `pipx`, `hatch` đang dùng.

Bố cục trong gói cài:

```
<InstallDir>/
  runtime/python/            ← CPython di dời được
    python.exe
    python3.exe              ← bản sao của python.exe (SKILL.md ưu tiên gọi python3)
    Lib/site-packages/       ← đã cài sẵn requirements.txt lúc build
  runtime/skill/             ← bản sao vendor/ppt-master/skills, chỉ đọc
  bin/eduslide-runtime.exe   ← sidecar, gọi Agent SDK
```

### 4.2. Dựng biến môi trường cho phiên agent

Agent chỉ thấy được Python nếu mình bơm vào `PATH` của tiến trình con. Truyền qua `ClaudeAgentOptions(env=...)`:

| Biến | Giá trị | Vì sao |
|---|---|---|
| `PATH` | `<InstallDir>/runtime/python;` + PATH gốc | Để lệnh `python3 …` và `python …` của SKILL.md chạy được |
| `PYTHONHOME` | *(để trống)* | Bản standalone tự xác định; đặt vào dễ gây xung đột |
| `PYTHONIOENCODING` | `utf-8` | Tên file và nội dung tiếng Việt; console Windows mặc định không phải UTF-8 |
| `ANTHROPIC_BASE_URL` | theo cấu hình model | Cho phép đổi sang Kimi mà không sửa code (ADR-0001) |
| `ANTHROPIC_AUTH_TOKEN` | khóa lấy từ Credential Manager | Không bao giờ ghi ra file phẳng |
| `ANTHROPIC_MODEL` | theo cấu hình model | |

Thư mục làm việc (`cwd`) trỏ vào không gian làm việc của người dùng, **không** trỏ vào `InstallDir` — vì ppt-master ghi ra `projects/<tên>/` ngay tại cwd, mà `Program Files` không cho ghi.

### 4.3. Ba rủi ro phải xác minh ở M1, không đợi tới M3

| Rủi ro | Cách kiểm tra ở M1 |
|---|---|
| Agent gọi script ppt-master qua **PowerShell tool** trên Windows có ổn không (tài liệu ppt-master viết theo phong cách bash) | Chạy M1 bằng chính CPython di dời được, không dùng Python hệ thống. Nếu lỗi, cài kèm Git for Windows portable và đặt `CLAUDE_CODE_GIT_BASH_PATH` |
| Đường dẫn có **dấu cách và dấu tiếng Việt** làm hỏng lệnh shell | Đặt tên project thử là `Bài giảng Toán lớp 5` ngay từ M1 |
| Wheel nhị phân (`skia-pathops`, `uharfbuzz`, `PyMuPDF`) có chạy trên CPython di dời được không | Cài `requirements.txt` vào runtime đó rồi chạy `svg_to_pptx.py` trên SVG mẫu |

### 4.4. WebView2

Installer NSIS của Tauri có sẵn tùy chọn nhúng bootstrapper WebView2. Chọn chế độ `downloadBootstrapper` (nhẹ, cần mạng) hay `embedBootstrapper` (nặng thêm vài MB, cài offline được) sẽ quyết định ở M3 sau khi khảo sát máy giáo viên thật. Mặc định đề xuất: **embed**, vì máy ở trường hay bị chặn mạng.

---

## 5. Hệ quả

**Phải làm:**

- Toàn bộ giao tiếp UI ↔ sidecar đi qua **stdout dạng JSON mỗi dòng một bản ghi**. Không dùng cơ chế riêng của Tauri, để đổi sang Electron chỉ mất lớp vỏ.
- Sidecar Python là **tiến trình độc lập có hợp đồng rõ ràng**, không phải thư viện nhúng. Đây là điều kiện để mốc M4 thay lõi agent mà không đụng UI.
- Bấm Hủy phải giết **cả cây tiến trình** (`taskkill /T /F`), vì Python sinh ra binary Claude Code làm tiến trình cháu.
- `vendor/ppt-master` chép vào gói cài dưới dạng **chỉ đọc**, giữ nguyên `LICENSE` MIT và attribution.

**Chấp nhận:**

- Installer ~150–170 MB. Với app tạo bài giảng bằng AI thì hợp lý, nhưng phải nói trước trên trang tải để giáo viên không bỏ giữa chừng.
- Máy Windows 10 chưa có WebView2 sẽ mất thêm một bước cài.
- Chỉ hỗ trợ **Windows x64** ở M3. ARM64 chưa có wheel Agent SDK (ADR-0001), macOS để sau.

---

## 6. Nguồn

Kho mã: `vendor/ppt-master/skills/ppt-master/SKILL.md`, `vendor/ppt-master/skills/ppt-master/requirements.txt`, `vendor/ppt-master/docs/windows-installation.md`

Web (tra ngày 2026-08-23):
- [Embedding External Binaries — Tauri v2](https://v2.tauri.app/develop/sidecar/)
- [astral-sh/python-build-standalone — GitHub](https://github.com/astral-sh/python-build-standalone)
- [A new home for python-build-standalone — Astral](https://astral.sh/blog/python-build-standalone)
- [Advanced setup — Claude Code Docs](https://code.claude.com/docs/en/setup)
- [Claude Code on Windows: The New PowerShell Tool](https://claudcod.com/blog/claude-code-windows-powershell/)
- [Electron vs Tauri 2026: Bundle Size, RAM, Security and Team Fit — PkgPulse](https://www.pkgpulse.com/guides/electron-vs-tauri-2026)
- [example-tauri-v2-python-server-sidecar — GitHub](https://github.com/dieharders/example-tauri-v2-python-server-sidecar)
