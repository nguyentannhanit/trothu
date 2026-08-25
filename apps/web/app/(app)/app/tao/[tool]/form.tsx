"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, ICONS, Nut, The, cx } from "@/components/ui";
import type { Field, Tool } from "@/lib/tools";
import { khoangThoiGian, vnd } from "@/lib/format";

const KIEU = [
  { ten: "Sáng, gọn", nen: "#F4F5F6", chinh: "#0D0F14", phu: "#DFE1E4", diem: "#00785F" },
  { ten: "Tối, đậm", nen: "#22252B", chinh: "#FFFFFF", phu: "#3A3E46", diem: "#E0A32E" },
  { ten: "Nhiều hình", nen: "#EFE9E2", chinh: "#3E362D", phu: "#D8CFC4", diem: "#B4720E" },
  { ten: "Bảng biểu", nen: "#EDF1F6", chinh: "#1F3A5F", phu: "#D3DDE9", diem: "#2B579A" },
];

export default function FormTao({ tool, soDu }: { tool: Tool; soDu: number }) {
  const router = useRouter();

  const [gt, setGt] = useState<Record<string, string | number>>(() => {
    const d: Record<string, string | number> = {};
    tool.fields.forEach((f) => {
      if (f.kind === "select") d[f.name] = f.default ?? f.options[0];
      else if (f.kind === "segmented") d[f.name] = f.default;
      else if (f.kind === "stepper") d[f.name] = f.default;
      else if (f.kind === "style") d[f.name] = f.default;
      else d[f.name] = "";
    });
    return d;
  });
  const [bat, setBat] = useState<Record<string, boolean>>(() =>
    Object.fromEntries((tool.addOns ?? []).map((a) => [a.name, a.default])),
  );
  const [files, setFiles] = useState<File[]>([]);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  const dong = useMemo(() => {
    const rows = [{ ten: tool.ten, tien: tool.price_vnd }];
    (tool.addOns ?? []).forEach((a) => {
      if (bat[a.name]) rows.push({ ten: a.label, tien: a.price_vnd });
    });
    return rows;
  }, [tool, bat]);

  const tong = dong.reduce((s, d) => s + d.tien, 0);
  const duTien = soDu >= tong;

  async function tao() {
    setLoi(null);
    setDangGui(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolId: tool.id,
          input: gt,
          addOns: Object.entries(bat).filter(([, v]) => v).map(([k]) => k),
          fileNames: files.map((f) => f.name),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Không tạo được việc");
      router.push(`/app/viec/${data.jobId}`);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại giúp tôi");
      setDangGui(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_396px] items-start px-5 lg:px-6 pt-7 pb-11">
      <div>
        <h1 className="text-[28px] md:text-[30px] font-bold tracking-[-0.03em] mb-2">{tool.ten}</h1>
        <p className="text-[15.5px] leading-relaxed text-ink-2 max-w-[68ch] mb-7">{tool.moTa}</p>

        {tool.accepts && (
          <Khoi so={1} ten="Nội dung">
            <label className="flex items-center justify-center gap-2.5 border-[1.5px] border-dashed border-line-strong rounded-lg px-4 py-4 text-[13.5px] text-ink-4 cursor-pointer hover:border-accent hover:text-accent">
              <Icon d={ICONS.upload} size={16} />
              Chọn file — {tool.accepts.join(", ")}
              <input
                type="file"
                multiple
                accept={tool.accepts.join(",")}
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
            </label>
            {files.map((f) => (
              <div key={f.name} className="flex items-center gap-3 border border-line rounded-lg bg-surface-2 px-4 py-3.5 mt-2.5">
                <span className="grow min-w-0">
                  <span className="block text-[14.5px] font-medium truncate">{f.name}</span>
                  <span className="block text-[12.5px] text-ink-4 mt-0.5">{Math.round(f.size / 1024)} KB</span>
                </span>
                <button
                  onClick={() => setFiles((p) => p.filter((x) => x !== f))}
                  className="text-ink-4 hover:text-danger cursor-pointer"
                  aria-label={`Bỏ ${f.name}`}
                >
                  <Icon d="M6 6l12 12M18 6L6 18" size={16} />
                </button>
              </div>
            ))}
            <p className="text-[12.5px] text-ink-4 mt-2.5">
              Không có file cũng được — điền các ô bên dưới là chạy được.
            </p>
          </Khoi>
        )}

        <Khoi so={tool.accepts ? 2 : 1} ten="Yêu cầu cụ thể">
          <div className="grid gap-3.5 sm:grid-cols-3">
            {tool.fields
              .filter((f) => f.kind === "select")
              .map((f) => (
                <TruongSelect key={f.name} f={f} gt={gt} setGt={setGt} />
              ))}
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 mt-3.5">
            {tool.fields
              .filter((f) => f.kind === "stepper" || f.kind === "segmented")
              .map((f) => (
                <TruongKhac key={f.name} f={f} gt={gt} setGt={setGt} />
              ))}
          </div>
          {tool.fields
            .filter((f) => f.kind === "text")
            .map((f) => (
              <div key={f.name} className="mt-3.5">
                <label className="block text-[13px] font-medium text-ink-2 mb-2">{f.label}</label>
                <input
                  value={String(gt[f.name] ?? "")}
                  onChange={(e) => setGt((p) => ({ ...p, [f.name]: e.target.value }))}
                  placeholder={f.kind === "text" ? f.placeholder : ""}
                  className="w-full h-10.5 px-3.5 rounded-md border border-line-strong bg-surface text-[14.5px] placeholder:text-ink-5"
                />
              </div>
            ))}
        </Khoi>

        {tool.fields.some((f) => f.kind === "style") && (
          <Khoi so={tool.accepts ? 3 : 2} ten="Kiểu trình bày" phu="đổi được sau khi tạo xong">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {KIEU.map((k) => {
                const chon = gt.kieu === k.ten;
                return (
                  <button
                    key={k.ten}
                    onClick={() => setGt((p) => ({ ...p, kieu: k.ten }))}
                    className={cx(
                      "text-left border-[1.5px] rounded-lg p-2.5 cursor-pointer",
                      chon ? "border-accent" : "border-line-strong hover:border-ink-5",
                    )}
                  >
                    <div className="h-18 rounded-sm p-3 mb-2.5 flex flex-col justify-between" style={{ background: k.nen }}>
                      <div>
                        <div className="h-1.5 w-[62%] rounded-[2px] mb-1.5" style={{ background: k.chinh }} />
                        <div className="h-1 w-[88%] rounded-[2px]" style={{ background: k.phu }} />
                      </div>
                      <div className="flex gap-1">
                        <div className="grow h-4 rounded-[3px]" style={{ background: k.phu }} />
                        <div className="grow h-4 rounded-[3px]" style={{ background: k.phu }} />
                        <div className="grow h-4 rounded-[3px]" style={{ background: k.diem }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cx("text-[13.5px]", chon ? "font-semibold" : "font-medium")}>{k.ten}</span>
                      {chon && (
                        <span className="text-accent">
                          <Icon d={ICONS.check} size={16} width={2.8} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {(tool.addOns ?? []).map((a) => (
              <div key={a.name} className="flex items-center gap-3.5 border-t border-line pt-4.5 mt-4.5">
                <button
                  onClick={() => setBat((p) => ({ ...p, [a.name]: !p[a.name] }))}
                  className={cx(
                    "inline-flex w-10 h-6 rounded-full p-[3px] items-center transition-colors cursor-pointer shrink-0",
                    bat[a.name] ? "bg-accent justify-end" : "bg-surface-4 justify-start",
                  )}
                  role="switch"
                  aria-checked={bat[a.name]}
                  aria-label={a.label}
                >
                  <span className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
                </button>
                <div className="grow">
                  <div className="text-[14.5px] font-medium">{a.label}</div>
                  <div className="text-[13px] text-ink-4 mt-0.5">{a.hint}</div>
                </div>
                <span className="text-[13.5px] font-semibold text-ink-2 whitespace-nowrap">+ {vnd(a.price_vnd)}</span>
              </div>
            ))}
          </Khoi>
        )}
      </div>

      {/* Cột giá — bám theo khi cuộn */}
      <div className="lg:sticky lg:top-6 flex flex-col gap-3.5">
        <The className="p-5.5 rounded-2xl shadow-[var(--shadow-c3)]">
          <div className="text-[15px] font-semibold tracking-[-0.015em] mb-4">Bạn sẽ nhận được</div>
          <div className="flex flex-col gap-2.5 mb-5">
            {tool.nhanDuoc.map((n) => (
              <div key={n} className="flex items-start gap-2.5">
                <span className="text-accent shrink-0 mt-0.5">
                  <Icon d={ICONS.check} size={16} width={2.6} />
                </span>
                <span className="text-[13.5px] leading-relaxed text-ink-2">{n}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-line pt-4 flex flex-col gap-2.5">
            {dong.map((d) => (
              <div key={d.ten} className="flex items-center justify-between text-[13.5px]">
                <span className="text-ink-3 pr-3">{d.ten}</span>
                <span className="font-medium tabular whitespace-nowrap">{vnd(d.tien)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-line mt-3.5 pt-3.5 flex items-baseline justify-between">
            <span className="text-[14.5px] font-semibold">Tổng cộng</span>
            <span className="text-[26px] font-bold tracking-[-0.03em] tabular">{vnd(tong)}</span>
          </div>
          <div className="flex items-center justify-between text-[12.5px] text-ink-4 mt-1">
            <span>Số dư sau khi tạo</span>
            <span className="tabular">{vnd(Math.max(0, soDu - tong))}</span>
          </div>

          {duTien ? (
            <Nut kieu="chinh" co="lg" className="w-full mt-4.5" onClick={tao} disabled={dangGui}>
              {dangGui ? "Đang gửi…" : `Tạo ${tool.ten.toLowerCase()}`}
            </Nut>
          ) : (
            <>
              <div className="bg-danger-soft border border-[#F2C9C2] rounded-lg px-4 py-3.5 mt-4.5">
                <div className="text-[13.5px] font-semibold text-danger mb-1">
                  Còn thiếu {vnd(tong - soDu)}
                </div>
                <p className="text-[13px] leading-relaxed text-ink-2">
                  Nạp thêm rồi bấm tạo lại — phần bạn đã nhập vẫn giữ nguyên.
                </p>
              </div>
              <Nut kieu="chinh" co="lg" href="/app/nap" className="w-full mt-2.5">
                Nạp tiền
              </Nut>
            </>
          )}

          {loi && <p className="mt-3 text-[13.5px] text-danger">{loi}</p>}

          <div className="flex items-center justify-center gap-1.5 mt-3 text-[12.5px] text-ink-4">
            <Icon d={ICONS.clock} size={14} />
            Mất {khoangThoiGian(tool.thoiGian)} · đóng trình duyệt vẫn chạy
          </div>
        </The>

        <div className="bg-accent-soft border border-accent-line rounded-xl px-4.5 py-4">
          <div className="flex items-start gap-2.5">
            <span className="text-accent shrink-0 mt-px">
              <Icon d={ICONS.info} size={17} />
            </span>
            <div>
              <div className="text-[13.5px] font-semibold text-accent mb-1">Không ưng thì không mất tiền</div>
              <p className="text-[13px] leading-relaxed text-ink-2">
                Chạy lỗi hoặc kết quả không dùng được — bấm báo lỗi trong 24 giờ, tiền hoàn lại vào tài khoản, không hỏi
                lý do.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Khoi({ so, ten, phu, children }: { so: number; ten: string; phu?: string; children: React.ReactNode }) {
  return (
    <The className="p-5.5 mb-3.5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-ink text-white font-mono text-[11px]">
          {so}
        </span>
        <span className="text-base font-semibold tracking-[-0.015em]">{ten}</span>
        {phu && <span className="text-[13px] text-ink-4">— {phu}</span>}
      </div>
      {children}
    </The>
  );
}

function TruongSelect({
  f,
  gt,
  setGt,
}: {
  f: Field;
  gt: Record<string, string | number>;
  setGt: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
}) {
  if (f.kind !== "select") return null;
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink-2 mb-2">{f.label}</label>
      <select
        value={String(gt[f.name] ?? "")}
        onChange={(e) => setGt((p) => ({ ...p, [f.name]: e.target.value }))}
        className="w-full h-10.5 px-3 rounded-md border border-line-strong bg-surface text-[14.5px] font-medium cursor-pointer"
      >
        {f.options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function TruongKhac({
  f,
  gt,
  setGt,
}: {
  f: Field;
  gt: Record<string, string | number>;
  setGt: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
}) {
  if (f.kind === "stepper") {
    const v = Number(gt[f.name] ?? f.default);
    return (
      <div>
        <label className="block text-[13px] font-medium text-ink-2 mb-2">{f.label}</label>
        <div className="flex items-center justify-between h-10.5 pl-3.5 pr-1 rounded-md border border-line-strong bg-surface">
          <span className="text-[14.5px] font-semibold tabular">
            {v} {f.unit}
          </span>
          <div className="flex gap-1">
            {[
              { d: ICONS.minus, delta: -1, nhan: "giảm" },
              { d: ICONS.plus, delta: 1, nhan: "tăng" },
            ].map((b) => (
              <button
                key={b.nhan}
                aria-label={`${b.nhan} ${f.label.toLowerCase()}`}
                onClick={() =>
                  setGt((p) => ({ ...p, [f.name]: Math.min(f.max, Math.max(f.min, v + b.delta)) }))
                }
                className="inline-flex w-8 h-8 items-center justify-center rounded-sm bg-surface-3 hover:bg-surface-4 cursor-pointer"
              >
                <Icon d={b.d} size={14} width={2.4} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (f.kind === "segmented") {
    return (
      <div>
        <label className="block text-[13px] font-medium text-ink-2 mb-2">{f.label}</label>
        <div className="flex items-center gap-1 p-1 rounded-md bg-surface-4 h-10.5">
          {f.options.map((o) => {
            const chon = gt[f.name] === o;
            return (
              <button
                key={o}
                onClick={() => setGt((p) => ({ ...p, [f.name]: o }))}
                className={cx(
                  "grow h-full rounded-sm text-[13.5px] cursor-pointer transition-colors",
                  chon ? "bg-surface text-ink font-semibold shadow-[0_1px_2px_rgba(13,15,20,0.06)]" : "text-ink-3 font-medium",
                )}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}
