import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DuongDan, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DongTich, Icon, ICONS, NhanTep, Nut, The, Tien } from "@/components/ui";
import { TOOLS, getNganh, getTool, toolHref, toolsOf } from "@/lib/tools";
import { khoangThoiGian, vnd } from "@/lib/format";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ nganh: t.nganh, tool: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nganh: string; tool: string }>;
}): Promise<Metadata> {
  const p = await params;
  const t = getTool(p.nganh, p.tool);
  if (!t) return {};
  return {
    title: t.ten,
    description: `${t.tomTat}. Đầu ra .${t.ext} sửa được, mất ${khoangThoiGian(t.thoiGian)}, ${vnd(t.price_vnd)} một lần.`,
    alternates: { canonical: `/${t.nganh}/${t.slug}` },
  };
}

export default async function TrangCongCu({ params }: { params: Promise<{ nganh: string; tool: string }> }) {
  const p = await params;
  const t = getTool(p.nganh, p.tool);
  if (!t) notFound();
  const khac = toolsOf(t.nganh).filter((x) => x.id !== t.id).slice(0, 3);
  const tongToiDa = t.price_vnd + (t.addOns ?? []).reduce((s, a) => s + (a.default ? a.price_vnd : 0), 0);

  return (
    <>
      <SiteHeader trang="cong-cu" />

      {/* Dữ liệu có cấu trúc — Google hiện giá ngay trên kết quả tìm kiếm */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: t.ten,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: t.moTa,
            offers: { "@type": "Offer", price: t.price_vnd, priceCurrency: "VND" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.hoi.map((h) => ({
              "@type": "Question",
              name: h.q,
              acceptedAnswer: { "@type": "Answer", text: h.a },
            })),
          }),
        }}
      />

      <section className="px-6 md:px-16 pt-10 pb-12">
        <DuongDan
          muc={[{ nhan: "Trang chủ", href: "/" }, { nhan: getNganh(t.nganh)?.ten ?? t.nganh, href: `/${t.nganh}` }, { nhan: t.ten }]}
        />

        <div className="grid gap-12 lg:grid-cols-[1fr_380px] items-start mt-5">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <NhanTep ext={t.ext} />
              <span className="text-[13px] text-ink-4">{khoangThoiGian(t.thoiGian)}</span>
            </div>

            <h1 className="text-[32px] md:text-[38px] leading-tight font-extrabold tracking-[-0.035em] mb-4 text-balance">
              {t.ten}
            </h1>
            <p className="text-[17px] leading-relaxed text-ink-2 max-w-[68ch] mb-8">{t.moTa}</p>

            <div className="mb-9">
              <h2 className="text-[17px] font-semibold tracking-[-0.015em] mb-3.5">Bạn sẽ nhận được</h2>
              <div className="flex flex-col gap-2.5">
                {t.nhanDuoc.map((n) => (
                  <DongTich key={n}>{n}</DongTich>
                ))}
              </div>
            </div>

            <div className="mb-9">
              <h2 className="text-[17px] font-semibold tracking-[-0.015em] mb-3.5">Cần chuẩn bị gì</h2>
              <The className="px-5 py-4.5">
                {t.accepts ? (
                  <p className="text-[14.5px] leading-relaxed text-ink-2">
                    Tải lên file có sẵn của bạn — nhận {t.accepts.join(", ")}. Hoặc bỏ trống và chỉ gõ yêu cầu, công cụ
                    tự soạn nội dung.
                  </p>
                ) : (
                  <p className="text-[14.5px] leading-relaxed text-ink-2">
                    Không cần tải file. Chỉ điền vài ô thông tin ở màn tạo là chạy được.
                  </p>
                )}
              </The>
            </div>

            <div>
              <h2 className="text-[17px] font-semibold tracking-[-0.015em] mb-3.5">Câu hỏi hay gặp</h2>
              <div className="flex flex-col gap-3">
                {t.hoi.map((h) => (
                  <The key={h.q} className="px-5.5 py-5">
                    <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] mb-2">{h.q}</h3>
                    <p className="text-sm leading-relaxed text-ink-2">{h.a}</p>
                  </The>
                ))}
              </div>
            </div>
          </div>

          {/* Cột giá — bám theo khi cuộn */}
          <div className="lg:sticky lg:top-6 flex flex-col gap-3.5">
            <The className="p-5.5 rounded-2xl shadow-[var(--shadow-c3)]">
              <div className="flex items-baseline justify-between mb-1">
                <Tien n={t.price_vnd} co="xl" />
                <span className="text-[13px] text-ink-4">/ lần</span>
              </div>
              {t.addOns?.length ? (
                <p className="text-[13px] text-ink-3 mb-4">
                  Bật hết tuỳ chọn: {vnd(tongToiDa)}. Màn tạo hiện tổng và số dư còn lại trước khi bấm.
                </p>
              ) : (
                <p className="text-[13px] text-ink-3 mb-4">Giá cố định, không phát sinh.</p>
              )}

              <Nut kieu="chinh" co="lg" href={`/app/tao/${t.id}`} className="w-full">
                {t.freeEligible ? "Làm thử miễn phí" : "Tạo ngay"}
              </Nut>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-[12.5px] text-ink-4">
                <Icon d={ICONS.clock} size={14} />
                Mất {khoangThoiGian(t.thoiGian)} · đóng trình duyệt vẫn chạy
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
                    Chạy lỗi hoặc kết quả không dùng được — báo trong 24 giờ, tiền hoàn lại vào tài khoản, không hỏi lý
                    do.
                  </p>
                </div>
              </div>
            </div>

            {khac.length > 0 && (
              <The className="px-4.5 py-4">
                <div className="text-[13.5px] font-semibold mb-3">Người dùng ngành này cũng dùng</div>
                <div className="flex flex-col gap-2.5">
                  {khac.map((k) => (
                    <Link key={k.id} href={toolHref(k)} className="flex items-center gap-2.5 group">
                      <NhanTep ext={k.ext} size="sm" />
                      <span className="grow text-[13.5px] group-hover:text-accent">{k.ten}</span>
                      <Tien n={k.price_vnd} co="sm" />
                    </Link>
                  ))}
                </div>
              </The>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
