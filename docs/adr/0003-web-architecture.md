# ADR-0003: Kiến trúc web cho Trợ Thủ

- **Trạng thái:** Đề xuất — chờ duyệt
- **Ngày:** 2026-08-24
- **Thay thế:** [ADR-0002 — stack desktop](./0002-desktop-stack.md)
- **Phụ thuộc:** [ADR-0001](./0001-ai-runtime.md) đã chốt runtime là Claude Managed Agents

---

## 1. Va chạm phải xử lý trước mọi thứ khác

Anh chọn Vercel + Supabase. Đây là lựa chọn tốt, nhưng nó có **một va chạm cứng** với đặc thù sản phẩm, và phải giải quyết ngay từ dòng code đầu tiên.

**Mỗi việc tạo bài giảng chạy 10–20 phút. Không hạ tầng nào trong stack này chạy nổi một hàm lâu như vậy.**

| Nơi chạy | Trần thời gian |
|---|---|
| Vercel Function — gói Hobby | **300 giây** (5 phút) |
| Vercel Function — gói Pro, bật Fluid Compute | **800 giây** (~13,3 phút) |
| Supabase Edge Function | 150 giây (miễn phí) / ~400 giây (trả phí) |
| **Việc tạo bài giảng cần** | **600–1.200 giây** |

Kể cả gói Pro của Vercel cũng **không đủ** cho một deck 15 trang. Đây là chỗ mà rất nhiều dự án đâm đầu vào rồi mới biết.

### Lời giải: để phần chạy lâu ở phía Anthropic

Đây là lý do thứ hai — và quan trọng hơn — để chọn Managed Agents ở ADR-0001. **Anthropic giữ vòng lặp agent và container; hạ tầng của mình chỉ cần chạy những nhịp rất ngắn:**

| Nhịp | Việc làm | Mất bao lâu |
|---|---|---|
| Nhận yêu cầu | Kiểm tra số dư → giữ tiền → ghi việc vào bảng → xếp hàng | < 1 giây |
| Phát việc | Mở session Managed Agents, lưu `session_id` | 1–3 giây |
| Dò trạng thái | Hỏi trạng thái session, cập nhật bảng | < 1 giây |
| Thu kết quả | Tải file từ Files API → đẩy lên Supabase Storage → chốt sổ | 5–20 giây |

Không nhịp nào chạm tới trần 300 giây. **Vercel + Supabase đủ dùng, không cần thuê thêm máy chủ.**

---

## 2. Sơ đồ hệ thống

```
Trình duyệt (Next.js — Vercel)
   │
   ├── tải file lên  ──── URL ký sẵn ────►  Supabase Storage  (KHÔNG đi qua Vercel)
   │
   ├── POST /api/jobs ───────────────────►  Vercel Function
   │                                          ├─ kiểm tra + GIỮ tiền (credit_ledger)
   │                                          ├─ ghi hàng vào bảng jobs (queued)
   │                                          └─ pgmq.send()
   │
   └── Supabase Realtime (theo dõi bảng jobs) ◄── cập nhật tiến trình về trình duyệt

Supabase pg_cron (mỗi phút)
   │
   ├── Edge Function: dispatcher
   │      pgmq.read() → sessions.create()  ──────►  Claude Managed Agents
   │      lưu session_id, jobs.status = running        (Anthropic giữ container
   │                                                    + vòng lặp agent 10–20 phút)
   │
   └── Edge Function: poller
          với mỗi job đang chạy:
            GET session status
            ├─ running     → cập nhật chặng, tiếp tục chờ
            ├─ idle/xong   → files.list(scope_id) → tải .pptx
            │                 → Storage → jobs.status = done
            │                 → CHỐT sổ (trừ thật, ghi cost thật)
            └─ lỗi         → jobs.status = failed → HOÀN tiền đã giữ

SePay webhook ──► Vercel Function /api/webhooks/sepay ──► cộng credit
```

---

## 3. Từng lớp một

### 3.1. Next.js trên Vercel

- **App Router.** Trang marketing (chủ, ngành, công cụ, bảng giá) dựng tĩnh và làm mới định kỳ — vừa nhanh vừa tốt cho SEO. Trang trong app (bàn làm việc, kết quả) render động.
- **Server Actions / Route Handlers** cho mọi thao tác ghi. Không bao giờ gọi Anthropic từ trình duyệt.
- **Bật Fluid Compute** ngay từ đầu, kể cả khi chưa cần 800 giây — nó tính tiền theo thời gian CPU thật chứ không theo thời gian chờ mạng, nên các hàm gọi API rẻ hơn hẳn.
- **Không cho file đi qua Vercel.** Giới hạn thân yêu cầu của Vercel Function khoảng 4,5 MB `[cần kiểm chứng lại lúc dựng]`, mà giáo án PDF có ảnh dễ vượt. Trình duyệt xin URL ký sẵn rồi tải thẳng lên Supabase Storage. Đây cũng là cách rẻ và nhanh hơn.

### 3.2. Supabase

| Thành phần | Dùng để làm gì |
|---|---|
| **Postgres** | Người dùng, số dư, sổ credit, việc, công cụ, ngành. Xem `docs/data-model.md` |
| **Auth** | Google + email không mật khẩu (magic link). Không tự làm mật khẩu |
| **Storage** | Hai kho: `uploads` (file nguồn, tự xoá) và `outputs` (file kết quả) |
| **Realtime** | Trình duyệt theo dõi đúng hàng `jobs` của mình → thanh tiến trình chạy thật, không cần trình duyệt hỏi liên tục |
| **pgmq (Queues)** | Hàng đợi việc. Giao đúng một lần, có cửa sổ ẩn — việc không bị chạy hai lần |
| **pg_cron** | Gọi dispatcher và poller định kỳ (xem 3.2b — bắt buộc phải ở đây, không phải chọn cho vui) |
| **Edge Functions** | Chỗ đặt dispatcher và poller |
| **RLS** | Bắt buộc bật trên mọi bảng. Người dùng chỉ đọc được hàng của chính họ |

### 3.2b. Đồng hồ nhịp bắt buộc nằm ở Supabase

Vercel cũng có cron riêng, nhưng **gói Hobby chỉ cho chạy mỗi ngày một lần**, và
biểu thức chạy dày hơn không phải là chạy sai — nó **làm hỏng luôn lần deploy**:

> *Hobby accounts are limited to daily cron jobs. This cron expression would run more than once per day.*
> — [Vercel, Usage & Pricing for Cron Jobs](https://vercel.com/docs/cron-jobs/usage-and-pricing)

Gói Pro mới cho nhịp mỗi phút, giá 20 USD/tháng. Hàng đợi cần nhịp mỗi phút, nên
đồng hồ đặt ở `pg_cron` bên Supabase (miễn phí, không phụ thuộc gói Vercel), gọi
sang Vercel qua `pg_net`. Vercel chỉ còn là nơi *nhận* cú gọi.

Xem `supabase/migrations/20260824180000_nhip_cron.sql`. Địa chỉ web và mã bí mật
nằm trong bảng `cau_hinh_cron`, không nhúng cứng trong di trú.

**Và chỉ gọi khi có việc.** Gói Hobby cho **4 giờ Active CPU mỗi tháng**. Gõ cửa
mỗi phút suốt 30 ngày là 87.600 lần gọi ≈ 2,4 giờ CPU — hơn nửa hạn mức — chỉ để
nghe câu "không có gì". Nên `pg_cron` hỏi Postgres trước (`co_viec_cho()`,
`co_viec_dang_chay()`), khác rỗng mới gọi ra ngoài. Đo thật: 4 phút chạy thử chỉ
sinh 1 cú gọi thay vì 8, việc vẫn phát đúng nhịp.

Xem `supabase/migrations/20260824200000_nhip_cron_co_viec_moi_goi.sql`.

**Đánh đổi phải biết:** lúc rỗng thì không còn lưu lượng nào chạm vào Supabase từ
bên ngoài. Dự án Free bị ngủ đông sau 7 ngày không có "user database activity" —
tài liệu Supabase không nói rõ truy vấn nội bộ của `pg_cron` có tính hay không
`[chưa kiểm chứng]`. Ngủ đông không mất dữ liệu, bấm một nút là dậy.

### 3.3. Vì sao dùng pgmq chứ không gọi thẳng

Ba lý do, đều là chuyện tiền:

1. **Chặn chạy hai lần.** Người dùng bấm hai lần, mạng chập chờn, hàm chạy lại — mỗi lần lặp là mất tiền API thật. pgmq giao đúng một lần.
2. **Điều tiết tải.** Tối Chủ nhật 100 giáo viên bấm cùng lúc. Có hàng đợi thì mình chọn được cho chạy 10 việc một lúc và báo thời gian chờ thật, thay vì để 100 session cùng đốt tiền và đụng trần tốc độ của Anthropic.
3. **Thử lại có kiểm soát.** Lỗi tạm thời thì thử lại, lỗi thật thì hoàn tiền — logic nằm một chỗ.

---

## 4. Vòng đời một việc, và tiền đi kèm

Đây là phần dễ mất tiền nhất nếu làm ẩu. Ba nguyên tắc:

**Nguyên tắc 1 — Giữ tiền trước khi chạy, không phải sau.**
Lúc nhận yêu cầu: ghi một dòng `hold` âm vào sổ credit. Số dư khả dụng = tổng sổ. Nếu không đủ, từ chối ngay, chưa tốn đồng nào tiền API.

**Nguyên tắc 2 — Chốt sổ bằng chi phí thật, không phải chi phí đoán.**
Session xong trả về `usage`. Ghi `cost_real` vào bảng `jobs`. Người dùng vẫn trả đúng giá niêm yết, nhưng **mình phải biết mình lãi hay lỗ từng việc** — đây chính là cột quan trọng nhất trên trang quản trị.

**Nguyên tắc 3 — Lỗi thì hoàn tiền tự động, không đợi người dùng kêu.**
Session `terminated` mà không có file ra → đảo dòng `hold`, đặt trạng thái `failed`, hiện màn "Chạy hỏng" (đã có trong bộ thiết kế). Chi phí API mình chịu. Chi phí này phải được ghi lại để tính đúng biên lợi nhuận.

Trạng thái của một việc:

```
queued → running → done
                 ↘ failed  (hoàn tiền)
                 ↘ cancelled (người dùng huỷ — hoàn phần chưa dùng)
```

**Trần chi phí từng session** (`budget` của Managed Agents) đặt bằng trần chi phí của công cụ nhân 1,5. Đây là dây bảo hiểm cuối cùng: kể cả khi mọi logic của mình sai, Anthropic vẫn dừng session ở mức đó.

---

## 5. Cách ly và an toàn

| Rủi ro | Xử lý |
|---|---|
| ppt-master chạy lệnh shell tùy ý | Chạy trong container của Anthropic, mỗi session một container riêng. Không bao giờ chạy trên máy chủ của mình |
| Người dùng tạo nội dung ngoài giáo dục trên khóa của mình | Lọc đầu vào trước khi mở session; ghi log; khoá tài khoản tái phạm. Đây là trách nhiệm của mình theo Usage Policy |
| Người dùng đọc dữ liệu người khác | RLS trên mọi bảng, không có ngoại lệ. URL file là URL ký sẵn có hạn |
| Khoá API lộ | Chỉ nằm trong biến môi trường của Vercel và Supabase. Không bao giờ gửi xuống trình duyệt |
| Khoá API bị khoá hoặc hết hạn mức | Đây là điểm chết duy nhất của hệ. Phải có cảnh báo khi tỉ lệ lỗi tăng, và ADR-0001 mục 5.3 chừa sẵn chỗ đổi nhà cung cấp |
| Mạng ra ngoài của container | `networking: limited`, chỉ mở PyPI và các host thật sự cần |

---

## 6. Đường thoát nếu Managed Agents không dùng được

Nếu M1 cho thấy ppt-master không chạy trơn trong sandbox của Anthropic, phương án dự phòng là **một worker chạy thường trú**:

- Một máy nhỏ (Fly.io machine hoặc VPS ~5 USD/tháng) chạy Docker
- Vòng lặp: `pgmq.read()` → chạy job trong container → đẩy kết quả lên Supabase Storage → `pgmq.delete()`
- Toàn bộ phần Next.js, Supabase, sổ credit **giữ nguyên không đổi**

Đây là lý do mục 3 tách dispatcher/poller thành một lớp riêng: đổi chỗ chạy chỉ đụng lớp đó. Chi phí thêm: khoảng 130.000 ₫/tháng cộng công vận hành.

---

## 7. Chi phí hạ tầng ước tính (chưa tính token)

| Khoản | Tháng đầu | Khi có ~1.000 người trả phí |
|---|---|---|
| Vercel | 0 ₫ (Hobby) | ~520.000 ₫ (Pro, 20 USD) |
| Supabase | 0 ₫ (Free) | ~650.000 ₫ (Pro, 25 USD) |
| Tên miền `.vn` | — | ~750.000 ₫/năm `[cần kiểm chứng giá thật]` |
| SePay | 0 ₫ | theo bảng giá SePay `[cần kiểm chứng]` |
| Session runtime (Anthropic) | không đáng kể | ~520 ₫/việc |

**Lưu ý:** gói Hobby của Vercel **không được dùng cho mục đích thương mại**. Ngay khi bắt đầu thu tiền, phải lên Pro. Đây là việc bắt buộc, không phải tuỳ chọn — xem `docs/viec-anh-phai-tu-lam.md`.

---

## 8. Cấu trúc thư mục đề xuất

```
trothu/
├── apps/
│   └── web/                        # Next.js — Vercel
│       ├── app/
│       │   ├── (marketing)/        # chủ, ngành, công cụ, bảng giá — dựng tĩnh, cho SEO
│       │   ├── (app)/              # bàn làm việc, tạo, kết quả, nạp tiền — cần đăng nhập
│       │   ├── (admin)/            # trang quản trị
│       │   └── api/                # route handler + webhook SePay
│       ├── components/
│       │   ├── ui/                 # nút, thẻ, chip… theo docs/design-system.md
│       │   └── tools/              # form riêng của từng công cụ
│       └── lib/
│           ├── supabase/
│           ├── credits/            # sổ credit — giữ, chốt, hoàn
│           └── tools/              # ĐỊNH NGHĨA CÔNG CỤ (xem dưới)
│
├── supabase/
│   ├── migrations/
│   └── functions/
│       ├── dispatcher/             # hàng đợi → mở session
│       └── poller/                 # dò trạng thái → thu file → chốt sổ
│
├── packages/
│   └── runtime/                    # LỚP DUY NHẤT gọi AI — run_job()
│
├── vendor/ppt-master/              # MIT, không sửa
└── docs/
```

### Ranh giới để thêm ngành mà không đụng lõi

Mỗi công cụ khai báo trong **một file duy nhất** ở `lib/tools/`:

```
{
  id, nganh, tên, mô tả, định dạng đầu ra,
  giá, trần chi phí, thời gian ước tính,
  agent_id (Managed Agents),
  schema đầu vào,   → sinh ra form
  nội dung SEO      → sinh ra trang công cụ
}
```

Thêm công cụ mới = thêm một file ở đây + một agent trên Anthropic. **Không sửa** `packages/runtime`, không sửa dispatcher/poller, không sửa sổ credit, không sửa lớp UI dùng chung. Nếu phải sửa, ranh giới đã hỏng — dừng lại xem lại thiết kế.

---

## 9. Nguồn

- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations) · [Configuring Maximum Duration](https://vercel.com/docs/functions/configuring-functions/duration)
- [Supabase Queues](https://supabase.com/docs/guides/queues) · [PGMQ Extension](https://supabase.com/docs/guides/queues/pgmq)
- Tài liệu Managed Agents đi kèm skill `claude-api`: `managed-agents-core.md`, `managed-agents-environments.md`
