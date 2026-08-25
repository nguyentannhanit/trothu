import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, ICONS, Nut, The, ThanhTienTrinh, Tien } from "@/components/ui";
import { getToolById, toolsOf } from "@/lib/tools";
import { conLai, khiNao, vnd } from "@/lib/format";
import { motViec } from "@/lib/phien";

export const dynamic = "force-dynamic";

export default async function TrangViec({ params }: { params: Promise<{ id: string }> }) {
  const viec = await motViec((await params).id);
  if (!viec) notFound();
  const tool = getToolById(viec.tool_id);

  if (viec.status === "failed") return <ManLoi jobId={viec.id} tien={viec.price_vnd} chiTiet={viec.error_detail} />;
  if (viec.status !== "done") return <ManDangChay viec={viec} />;

  const khac = tool ? toolsOf(tool.nganh).filter((x) => x.id !== tool.id).slice(0, 2) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_356px] items-start px-5 lg:px-6 pt-8 pb-11">
      <div>
        <div className="flex items-start gap-4 mb-6">
          <span className="inline-flex w-11.5 h-11.5 items-center justify-center rounded-[13px] bg-accent-soft text-accent shrink-0">
            <Icon d={ICONS.check} size={24} width={2.6} />
          </span>
          <div>
            <h1 className="text-[27px] font-bold tracking-[-0.03em] mb-1">
              {tool?.ext === "pptx" ? "Bài giảng của bạn đã xong" : "Tệp của bạn đã xong"}
            </h1>
            <p className="text-[14.5px] text-ink-2">
              {viec.output_files.length} tệp · xong {khiNao(viec.finished_at ?? viec.created_at)} · đã trừ{" "}
              {vnd(viec.price_vnd)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 mb-7">
          {viec.output_files.map((f) => (
            <Nut key={f.path} kieu="chinh" co="lg" href={`/api/tep/${viec.id}/${encodeURIComponent(f.name)}`}>
              <Icon d={ICONS.download} size={18} width={2.2} />
              Tải {f.name}
            </Nut>
          ))}
          <Nut kieu="vien" co="lg" href={tool ? `/app/tao/${tool.id}` : "/app"}>
            <Icon d={ICONS.redo} size={17} />
            Tạo lại
          </Nut>
        </div>

        {viec.output_files.length === 0 && (
          <The className="px-5 py-4.5">
            <p className="text-[14.5px] text-ink-2">
              Việc đã xong nhưng chưa thấy tệp nào. Bấm báo lỗi bên phải — tiền sẽ được hoàn lại.
            </p>
          </The>
        )}
      </div>

      <div className="flex flex-col gap-3.5">
        <The className="p-5.5 rounded-2xl">
          <div className="text-[15px] font-semibold tracking-[-0.015em] mb-4">Chi phí</div>
          <div className="flex items-center justify-between text-[13.5px] mb-3">
            <span className="text-ink-3">{tool?.ten ?? viec.tool_id}</span>
            <span className="font-medium tabular">{vnd(viec.price_vnd)}</span>
          </div>
          <div className="border-t border-line pt-3.5 flex items-baseline justify-between">
            <span className="text-sm font-semibold">Đã trừ</span>
            <Tien n={viec.price_vnd} co="lg" />
          </div>
          <p className="text-[12.5px] text-ink-4 mt-1 text-right">đúng bằng số báo trước khi bấm</p>
        </The>

        <The className="px-5.5 py-5">
          <div className="text-[14.5px] font-semibold mb-1.5">Chưa ưng?</div>
          <p className="text-[13px] leading-relaxed text-ink-2 mb-3.5">
            Thiếu nội dung, sai thông tin, hoặc bố cục vỡ — báo trong 24 giờ, tiền hoàn lại vào tài khoản, không hỏi lý
            do.
          </p>
          <Nut kieu="phu" co="sm" className="w-full">
            Báo lỗi việc này
          </Nut>
        </The>

        {khac.length > 0 && (
          <div className="bg-ink text-white rounded-2xl p-5.5">
            <div className="text-[14.5px] font-semibold mb-1.5">Làm nốt bộ hồ sơ</div>
            <p className="text-[13px] leading-relaxed text-white/60 mb-4">
              Dùng lại đúng nội dung vừa rồi, không phải nhập lại.
            </p>
            <div className="flex flex-col gap-2.5">
              {khac.map((k) => (
                <Link
                  key={k.id}
                  href={`/app/tao/${k.id}`}
                  className="flex items-center gap-3 bg-white/6 border border-white/10 rounded-md px-3.5 py-3 hover:bg-white/10"
                >
                  <span className="font-mono text-[9px] font-medium text-white/70 bg-white/10 rounded-[4px] px-1.5 py-1">
                    {k.ext.toUpperCase()}
                  </span>
                  <span className="grow text-[13.5px] font-medium">{k.ten}</span>
                  <span className="text-[13px] font-semibold text-accent-line tabular">{vnd(k.price_vnd)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <The className="px-4.5 py-4 flex items-start gap-2.5">
          <span className="text-ink-4 shrink-0 mt-px">
            <Icon d={ICONS.lock} size={16} />
          </span>
          <p className="text-[12.5px] leading-relaxed text-ink-3">
            File nguồn bạn tải lên sẽ được xoá sau <strong className="text-ink font-semibold">[SỐ] ngày</strong>. File
            kết quả giữ trong tài khoản cho tới khi bạn xoá.
          </p>
        </The>
      </div>
    </div>
  );
}

function ManDangChay({ viec }: { viec: NonNullable<Awaited<ReturnType<typeof motViec>>> }) {
  const tool = getToolById(viec.tool_id);
  const conBaoLau = tool ? Math.max(0, (tool.thoiGian[1] * 60 * (100 - viec.progress)) / 100) : 0;

  return (
    <div className="max-w-[720px] mx-auto px-5 lg:px-6 pt-13 pb-13 text-center">
      <span className="inline-flex w-13 h-13 items-center justify-center rounded-2xl bg-accent-soft text-accent mb-5">
        <Icon d={ICONS.clock} size={26} />
      </span>
      <h1 className="text-[27px] font-bold tracking-[-0.03em] mb-2">
        {viec.status === "queued" ? "Đang xếp hàng" : "Đang làm rồi"}
      </h1>
      <p className="text-[15px] text-ink-2 mb-7">
        {tool?.ten}
        {viec.status === "running" && ` · còn khoảng ${conLai(conBaoLau)}`}
      </p>

      <The className="p-6 text-left">
        <div className="mb-4">
          <ThanhTienTrinh phanTram={viec.progress} />
        </div>
        <div className="flex items-center justify-between text-[13.5px]">
          <span className="text-ink-2">{viec.stage_detail ?? "đang chuẩn bị"}</span>
          <span className="font-mono text-ink-4 tabular">{viec.progress}%</span>
        </div>
      </The>

      <p className="text-[13.5px] text-ink-4 mt-5">
        Đóng trình duyệt cũng được — việc vẫn chạy tiếp, xong sẽ có trong mục Tệp đã tạo.
      </p>
      <Nut kieu="vien" href="/app" className="mt-5">
        Về bàn làm việc
      </Nut>
    </div>
  );
}

function ManLoi({ jobId, tien, chiTiet }: { jobId: string; tien: number; chiTiet: string | null }) {
  return (
    <div className="max-w-[560px] mx-auto px-5 lg:px-6 pt-13 pb-13">
      <The className="p-6.5 rounded-2xl">
        <div className="flex items-start gap-3.5 mb-4.5">
          <span className="inline-flex w-10 h-10 items-center justify-center rounded-[11px] bg-danger-soft text-danger shrink-0">
            <Icon d={ICONS.warn} size={20} width={2.2} />
          </span>
          <div>
            <h1 className="text-[16.5px] font-semibold tracking-[-0.015em] mb-1">Việc chạy không xong</h1>
            <p className="text-[13.5px] text-ink-3">Mã việc {jobId.slice(0, 8)}</p>
          </div>
        </div>

        <div className="bg-surface-2 border border-line rounded-xl px-4 py-3.5 mb-3.5">
          <div className="text-[13px] font-semibold mb-1.5">Chuyện gì đã xảy ra</div>
          <p className="text-[13px] leading-relaxed text-ink-2">
            {chiTiet ?? "Máy chủ gặp sự cố giữa chừng. Đây là lỗi bên Trợ Thủ, không phải do file bạn tải lên."}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-accent-soft border border-accent-line rounded-xl px-4 py-3.5 mb-4.5">
          <span className="text-accent shrink-0">
            <Icon d={ICONS.check} size={17} width={2.6} />
          </span>
          <p className="text-[13.5px] leading-relaxed">
            <strong className="font-semibold">{vnd(tien)} đã hoàn lại</strong> vào tài khoản. Bạn không mất gì.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Nut kieu="chinh" co="lg" href="/app" className="w-full">
            Chạy lại — vẫn miễn phí
          </Nut>
          <Nut kieu="vien" co="lg" href="/huong-dan" className="w-full">
            Nhắn Zalo hỗ trợ
          </Nut>
        </div>
      </The>
    </div>
  );
}
