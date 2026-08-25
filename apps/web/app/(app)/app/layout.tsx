import Link from "next/link";
import { Logo } from "@/components/site-chrome";
import { Icon, ICONS, Nut, cx } from "@/components/ui";
import { NavNganh, NavLinks } from "@/components/sidebar-nav";
import { NGANH, toolsOf } from "@/lib/tools";
import { conBaoNhieuLan, thuNgay, vnd } from "@/lib/format";
import { daCauHinh, phienHienTai } from "@/lib/phien";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const phien = await phienHienTai();

  return (
    <div className="min-h-screen grid lg:grid-cols-[248px_1fr] bg-bg">
      {/* Cột trái — 5 ngành luôn thấy, thêm ngành chỉ là thêm dòng */}
      <aside className="hidden lg:flex flex-col gap-5.5 bg-surface border-r border-line px-3.5 py-4.5">
        <div className="px-1.5">
          <Logo />
        </div>

        <Link
          href="/app"
          className="flex items-center gap-2 h-9.5 px-2.5 rounded-md border border-line-strong bg-surface-2 text-[13.5px] text-ink-4 hover:bg-surface-3"
        >
          <Icon d={ICONS.search} size={15} width={2} />
          <span className="grow text-left">Tìm việc cần làm</span>
        </Link>

        <NavLinks
          links={[
            { href: "/app", nhan: "Bàn làm việc", icon: ICONS.grid },
            { href: "/app?loc=dang-chay", nhan: "Việc đang chạy", icon: ICONS.clock, so: phien?.dangChay ?? 0 },
            { href: "/app?loc=tep", nhan: "Tệp đã tạo", icon: ICONS.folder },
          ]}
        />

        <div>
          <div className="font-mono text-[10.5px] tracking-[0.09em] text-ink-5 px-2.5 mb-2">NGÀNH</div>
          <NavNganh
            nganh={NGANH.map((n) => ({
              slug: n.slug,
              ten: n.ten,
              icon: n.icon,
              soCongCu: toolsOf(n.slug).length,
            }))}
            icons={{}}
          />
        </div>

        <div className="grow" />

        <div className="border border-line rounded-lg bg-surface-2 p-3.5">
          <div className="text-[12.5px] text-ink-3 mb-1">Số dư tài khoản</div>
          <div className="text-[22px] font-bold tracking-[-0.025em] mb-0.5 tabular">{vnd(phien?.soDu ?? 0)}</div>
          <div className="text-xs text-ink-5 mb-3">
            còn khoảng {conBaoNhieuLan(phien?.soDu ?? 0, 45_000)} bài giảng
          </div>
          <Nut kieu="chinh" co="sm" href="/app/nap" className="w-full">
            Nạp thêm
          </Nut>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="h-15 px-5 lg:px-6 flex items-center justify-between bg-surface border-b border-line">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <span className="lg:hidden">
              <Logo chu={false} size={26} />
            </span>
            <span className="text-[15.5px] font-semibold tracking-[-0.015em]">Bàn làm việc</span>
            <span className="hidden sm:block text-[13.5px] text-ink-4">{thuNgay()}</span>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="lg:hidden text-[13px] font-semibold tabular">{vnd(phien?.soDu ?? 0)}</span>
            <span className="inline-flex w-7.5 h-7.5 items-center justify-center rounded-full bg-surface-4 text-[12.5px] font-semibold text-ink-2">
              {phien?.chuCai ?? "?"}
            </span>
          </div>
        </header>

        {!daCauHinh() && <ChuaCauHinh />}
        {children}
      </div>
    </div>
  );
}

/** Hiện khi chưa cắm biến môi trường Supabase — để dev không phải đoán vì sao trắng trang */
function ChuaCauHinh() {
  return (
    <div className="m-5 lg:m-6 bg-warn-soft border border-warn-line rounded-xl px-5 py-4">
      <div className="flex items-start gap-2.5">
        <span className="text-warn shrink-0 mt-px">
          <Icon d={ICONS.warn} size={17} width={2} />
        </span>
        <div className="text-[13.5px] leading-relaxed text-warn-ink">
          <strong className="font-semibold">Chưa cấu hình Supabase.</strong> Chép <code>.env.example</code> thành{" "}
          <code>.env.local</code> rồi điền <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> và <code>SUPABASE_SERVICE_ROLE_KEY</code>. Các màn bên dưới đang
          hiện dữ liệu rỗng.
        </div>
      </div>
    </div>
  );
}
