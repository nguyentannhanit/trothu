# Trạng thái mã nguồn

- **Ngày:** 2026-08-24
- **Đang chạy tại:** https://trothu.vercel.app — chế độ thử nội bộ
- **Trạng thái build:** ✅ `next build` sạch · ✅ `eslint --max-warnings=0` sạch · 37 trang

---

## ĐIỂM DỪNG — 24/08/2026, hết ngày

### Chạy được rồi

| | |
|---|---|
| Web | https://trothu.vercel.app, deploy từ máy bằng `npx vercel deploy --prod` |
| Đăng nhập | Email không mật khẩu. **Google chưa bật** — thiếu Client ID |
| 14 công cụ văn bản | Chạy thật trên production. 11 việc, 10 xong, **0 hỏng** |
| 3 công cụ PowerPoint | ⛔ Chưa chạy được — thiếu `ANTHROPIC_API_KEY` |
| Đồng hồ nhịp | `pg_cron` bên Supabase, chỉ gọi khi có việc |
| Sổ tiền | Giữ → chốt/hoàn, đã kiểm trên production |
| Thanh toán | ⛔ Chưa làm gì |

### Ba khoá đang đóng (chế độ thử)

1. `NEXT_PUBLIC_CHE_DO_RIENG_TU=1` → `robots.txt` chặn hết, thẻ `noindex`, sitemap rỗng
2. Supabase `disable_signup = true` → email lạ không tạo được tài khoản
3. `NEXT_PUBLIC_GOOGLE_BAT` để trống → nút Google ẩn

Cách mở: xem `viec-anh-phai-tu-lam.md` mục C0.

### Bốn cái bẫy đã gỡ hôm nay — đừng giẫm lại

| Bẫy | Vì sao gãy |
|---|---|
| Cron mỗi phút trong `vercel.json` | Hobby chỉ cho chạy **mỗi ngày**, biểu thức dày hơn làm **hỏng luôn deploy**. Đã chuyển sang `pg_cron` |
| Lockfile thiếu bản nhị phân Linux | Vercel dùng `npm ci`, chỉ cài đúng những gì lockfile ghi. Lockfile sinh trên Windows không có bản Linux → `lightningcss` không nạp được. Đã khai 4 bản Linux vào `apps/web/optionalDependencies` — **thêm gói native nào cũng phải làm bước này** |
| `@trothu/runtime` không khai báo | Chạy được ở máy nhờ hoisting. Đã khai vào `apps/web/package.json` |
| Cron gọi mỗi phút kể cả lúc rỗng | Ngốn ~2,4 trong 4 giờ CPU miễn phí mỗi tháng. Đã thêm điều kiện, xem ADR-0003 mục 3.2b |

### Hai giới hạn phải nhớ

- **Thư đăng nhập: 2 cái mỗi giờ.** Supabase đang dùng máy gửi thư mặc định. Thử quá 2 lần là bị chặn tạm — không phải web hỏng. Nối SMTP riêng thì hết.
- **Gói Hobby không cho đặt mật khẩu bảo vệ production.** Ai biết địa chỉ vẫn xem được trang giới thiệu; vào trong app thì không.

### Mai làm gì — theo thứ tự đáng làm

1. **Anh tự dùng thử như một giáo viên thật.** Chưa ai ngoài anh chạm vào. Chỗ nào vướng là chỗ thiết kế sai
2. **Trang `/dieu-khoan` và `/chinh-sach-du-lieu`** — đang là liên kết chết ở chân trang đăng nhập
3. **Tải file lên từ trình duyệt** — form chọn được file nhưng chưa đẩy lên Storage
4. Google OAuth, nếu muốn — cần anh tạo Client ID bên Google Cloud
5. Khoá Anthropic, nếu muốn mở 3 công cụ PowerPoint — cần thẻ quốc tế

### Chưa có quản lý phiên bản

Dự án **chưa có git**. Không có lịch sử, không có bản sao lưu, sai một cái là không lùi được.
`.gitignore` đã viết sẵn và đúng. Cần bàn xem có đưa lên GitHub riêng tư không.

---

## 0. Supabase — ĐÃ DỰNG XONG (2026-08-24)

| | |
|---|---|
| Project | `trothu` · ref `hjkmfdgnelkgflvwuomc` |
| Vùng | Singapore (ap-southeast-1) |
| Bảng điều khiển | https://supabase.com/dashboard/project/hjkmfdgnelkgflvwuomc |
| Migration | `20260824000000_init.sql` + `20260824120000_queue_functions.sql` đã áp dụng |
| Đã chạy thử thật | đăng nhập → tạo việc → giữ tiền → xếp hàng → hoàn tiền · **tất cả đúng** |
| Đã kiểm chứng | 6 bảng · hàm `get_balance` · 2 kho tệp `uploads` và `outputs` |
| Cấu hình | `apps/web/.env.local` đã điền 3 khoá |
| Mật khẩu CSDL | `.db-password.txt` ở gốc dự án — **cất chỗ khác rồi xoá đi**, Supabase không cho xem lại |


### Lỗi đã tìm ra và sửa khi chạy thử

**Xếp hàng thất bại âm thầm.** Mã cũ gọi `pgmq_public.send` — schema đó chỉ lộ ra API
khi bật Queues thủ công trên dashboard. Không bật thì lệnh hỏng mà **không báo lỗi**:
việc vẫn tạo, tiền vẫn bị giữ, nhưng không bao giờ chạy.

Sửa bằng cách **gộp xếp hàng vào cùng giao dịch với tạo việc và giữ tiền**
(`create_job_with_hold` nay gọi thẳng `pgmq.send`). Hỏng bất kỳ bước nào là quay lui
cả ba — không bao giờ có chuyện giữ tiền mà việc không chạy.

Kèm theo: tự bọc `job_dequeue` / `job_ack` / `job_queue_depth` bằng hàm security definer
trong schema `public`, không phụ thuộc công tắc nào trên dashboard nữa.

**Liên kết đăng nhập không vào được.** Luồng ngầm trả token ở phần `#` của URL mà máy chủ
không đọc được. Thêm route `/api/auth/confirm` dùng `verifyOtp` với `token_hash` trên query.

Còn thiếu để đăng nhập chạy được: bật **Google** và **Magic Link** trong
Supabase → Authentication → Providers. Việc này phải bấm tay trên bảng điều khiển.

---

## 0b. Gemini — 14/17 công cụ đã CHẠY THẬT (2026-08-24)

**Phát hiện quan trọng:** chỉ 3 công cụ ra `.pptx` mới cần ppt-master và môi trường
chạy Python. **14 công cụ còn lại chỉ ra `.docx` / `.xlsx`** — tức là văn bản có cấu
trúc. Với chúng, một lần gọi model rồi ghi file bằng thư viện là đủ: không sandbox,
không vòng lặp agent, **không cần tài khoản Anthropic**.

| | |
|---|---|
| Nhà cung cấp | Google Gemini, model `gemini-3.7-flash` |
| Tầng miễn phí | 10 lượt/phút · 1.500 lượt/ngày — đủ cho vài chục khách đầu |
| Thời gian một tệp | 9–28 giây, đo thật trên 8 lần chạy |
| Đã chạy thật | đề kiểm tra · phiếu bài tập · kế hoạch bài dạy · mô tả công việc · kịch bản video · bài đăng Fanpage |
| Cấu hình | `GEMINI_API_KEY` trong `apps/web/.env.local` |

### Hai đường chạy, chọn theo định dạng đầu ra

| Đầu ra | Đường đi | Mất bao lâu |
|---|---|---|
| `.docx` / `.xlsx` | dispatcher gọi Gemini, ghi file, xong ngay | 9–28 giây |
| `.pptx` | dispatcher mở phiên Managed Agents, poller dò | 10–20 phút |

Quyết định bằng `tool.ext` trong `app/api/cron/dispatch/route.ts`.
Lớp sinh tài liệu ở `packages/runtime/src/gemini.ts` và `tai-lieu.ts`.

Định dạng văn bản bám Nghị định 30/2020 về thể thức văn bản hành chính:
Times New Roman cỡ 13, lề trên 2 cm, dưới 2 cm, trái 3 cm, phải 1,5 cm.

### Ba điều học được khi chạy thử

**Node không hiểu vài cú pháp TypeScript.** Gán thuộc tính ngay trong tham số hàm
khởi tạo — `constructor(private x)` — và import thiếu đuôi `.ts` đều làm
`node --experimental-strip-types` gãy. Đã bỏ cả hai trong `packages/runtime`.

**Gemini không nhận kiểu hợp (union).** Lược đồ đầu ra phải gộp mọi loại khối vào
một đối tượng với các trường tuỳ chọn, phân biệt bằng trường `loai`. Bảng dùng dạng
`{ o: [...] }` thay cho mảng lồng mảng.

**Đừng gõ tiếng Việt thẳng vào lệnh curl trên Windows.** Bảng mã cửa sổ dòng lệnh
làm hỏng chữ có dấu **trước khi** tới máy chủ, sinh ra tên tệp kiểu `ng-van`. Trình
duyệt thật không bị. Khi thử bằng dòng lệnh: ghi JSON ra file UTF-8 rồi dùng
`--data-binary @file`. Tôi đã mất mấy vòng sửa nhầm mã nguồn vì lỗi này.

---

## 1. Đã dựng xong

```
trothu/
├── apps/web/                    Next.js 16 · React 19 · Tailwind 4
│   ├── app/
│   │   ├── (marketing)/         trang chủ · [nganh] · [nganh]/[tool] · gia · huong-dan
│   │   ├── (app)/app/           bàn làm việc · tao/[tool] · viec/[id] · nap
│   │   ├── (admin)/admin/       tổng quan, biên lợi nhuận từng công cụ
│   │   ├── dang-nhap/           Google + email không mật khẩu
│   │   ├── api/                 jobs · cron/dispatch · cron/poll · webhooks/sepay
│   │   │                        auth/callback · tep/[id]/[ten]
│   │   ├── sitemap.ts robots.ts
│   │   └── globals.css          toàn bộ token thiết kế
│   ├── components/              ui.tsx · site-chrome.tsx
│   └── lib/
│       ├── tools/               ★ ĐỊNH NGHĨA CÔNG CỤ — thêm công cụ chỉ đụng ở đây
│       ├── supabase/            client · server · types
│       ├── credits.ts           sổ credit: giữ · chốt · hoàn
│       ├── runtime.ts           chỗ DUY NHẤT khởi tạo runtime
│       ├── phien.ts             phiên đăng nhập, số dư, việc
│       └── format.ts            tiền, thời gian, tên tiếng Việt
├── packages/runtime/            ★ LỚP DUY NHẤT chạm tới AI
├── supabase/migrations/         0001_init.sql — bảng, RLS, hàm giữ tiền, pgmq
├── scripts/
│   ├── m1-poc.ts                chạy thử M1 và ĐO CHI PHÍ THẬT
│   └── setup-agents.ts          tạo môi trường + 17 agent, chạy một lần
├── vercel.json                  cron mỗi phút cho dispatch và poll
└── .env.example
```

**36 trang tĩnh** sinh sẵn cho SEO: trang chủ, bảng giá, hướng dẫn, 5 trang ngành, 17 trang công cụ, sitemap, robots.

---

## 2. Chạy thử ngay

```bash
npm install
npm run dev --workspace=web
```

Mở `http://localhost:3000`. Chưa cắm Supabase thì phần marketing chạy đầy đủ, phần trong app hiện lời nhắc thiếu cấu hình thay vì trắng trang.

---

## 3. Ba việc để hệ thống chạy thật

### Bước 1 — Supabase

```bash
cp .env.example apps/web/.env.local     # rồi điền 3 khoá Supabase
supabase db push                        # chạy migration 0001_init.sql
```

Trong Supabase Dashboard bật thêm: Auth → Google provider, và Auth → Email → Magic Link.

### Bước 2 — Anthropic

```bash
export ANTHROPIC_API_KEY=sk-ant-...
node --experimental-strip-types scripts/setup-agents.ts
```

Script in ra `ANTHROPIC_ENVIRONMENT_ID` và 17 dòng `AGENT_ID__*`. Chép hết vào `.env.local`.

> Trước đó cần tải skill ppt-master lên bằng Skills API rồi đặt `PPT_MASTER_SKILL_ID`.
> Chưa có thì các công cụ ra `.pptx` vẫn chạy nhưng không có ppt-master, chất lượng sẽ khác hẳn.

### Bước 3 — Chạy M1 và đo chi phí thật

```bash
node --experimental-strip-types scripts/m1-poc.ts \
  --topic "Lão Hạc" --model claude-haiku-4-5 --lan 5
```

Script in ra chi phí trung vị và biên lợi nhuận so với giá 45.000₫.
**Lệch quá 50% so với ước tính 20.000₫ trong ADR-0004 thì phải sửa lại bảng giá.**

---

## 4. Chỗ khác với tài liệu — có chủ ý

| Tài liệu nói | Mã nguồn làm | Vì sao |
|---|---|---|
| dispatcher/poller là Supabase Edge Function (Deno) | Route handler của Next.js, gọi bằng Vercel Cron | Cùng một thiết kế, nhưng tất cả là TypeScript và dùng chung `packages/runtime`. Ít chỗ để lệch hơn. Hàng đợi vẫn là pgmq của Supabase |
| — | Thêm mốc quá hạn 45 phút trong poller | Việc treo mãi sẽ giữ tiền người dùng vô thời hạn. Quá hạn thì ghi hỏng và hoàn tiền tự động |

Cả hai thay đổi **không** ảnh hưởng ADR-0003; nếu Managed Agents không dùng được thì phương án worker riêng vẫn thay được đúng như mục 6 của ADR đó.

---

## 5. Chưa làm

| Việc | Vì sao |
|---|---|
| Chạy thử M1 thật | Máy này không có `ANTHROPIC_API_KEY`. Mã đã sẵn sàng |
| Tải file lên Supabase Storage từ trình duyệt | Form đã chọn được file và gửi tên lên; phần xin URL ký sẵn cần Supabase thật để làm cho đúng |
| Trang `/dieu-khoan` và `/chinh-sach-du-lieu` | Là cam kết pháp lý — anh phải đọc và chịu trách nhiệm, xem `viec-anh-phai-tu-lam.md` mục B5 |
| Thư viện bài giảng dựng sẵn | Cổng chặn ở `plan.md` mốc M5: chờ M1 chứng minh chất lượng |
| Nút "Báo lỗi" gọi API thật | Giao diện đã có, đường dây phía sau làm ở M3 |

---

## 6. Ranh giới cần giữ

Ba quy tắc, phá cái nào là kiến trúc hỏng:

1. **Chỉ `packages/runtime` được import `@anthropic-ai/sdk`.** Chỗ khác gọi qua `lib/runtime.ts`.
2. **Thêm công cụ chỉ đụng `lib/tools/`.** Kiểm bằng `git diff --name-only` — hiện file ngoài đó là sai.
3. **Không có cột số dư ở đâu cả.** Số dư là `SUM(credit_ledger.amount_vnd)`. Đừng bao giờ cache nó vào bảng.
