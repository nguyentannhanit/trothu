"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Icon, cx } from "@/components/ui";
import type { Nganh } from "@/lib/tools";

/** Sidebar nav cho ngành — highlight đúng ngành đang chọn */
export function NavNganh({ nganh, icons }: { nganh: { slug: string; ten: string; icon: string; soCongCu: number }[]; icons: Record<string, string> }) {
  const search = useSearchParams();
  const nganhHienTai = search.get("nganh") ?? nganh[0]?.slug;

  return (
    <div className="flex flex-col gap-0.5">
      {nganh.map((n) => {
        const active = n.slug === nganhHienTai;
        return (
          <Link
            key={n.slug}
            href={`/app?nganh=${n.slug}`}
            className={cx(
              "flex items-center gap-2.5 h-9 px-2.5 rounded-md text-[13.5px]",
              active ? "bg-accent-soft text-accent font-semibold" : "text-ink-2 font-medium hover:bg-surface-2",
            )}
          >
            <Icon d={n.icon} size={16} />
            <span className="grow">{n.ten}</span>
            <span className="font-mono text-[11px] text-ink-5">{n.soCongCu}</span>
          </Link>
        );
      })}
    </div>
  );
}

/** Sidebar nav links — highlight dựa trên URL hiện tại */
export function NavLinks({ links }: { links: { href: string; nhan: string; icon: string; so?: number }[] }) {
  const search = useSearchParams();
  const pathname = usePathname();
  const loc = search.get("loc");

  function isActive(href: string): boolean {
    if (href === "/app" && !loc && pathname === "/app") return true;
    if (href.includes("loc=dang-chay") && loc === "dang-chay") return true;
    if (href.includes("loc=tep") && loc === "tep") return true;
    return false;
  }

  return (
    <nav className="flex flex-col gap-0.5">
      {links.map((n) => {
        const dam = isActive(n.href);
        return (
          <Link
            key={n.nhan}
            href={n.href}
            className={cx(
              "flex items-center gap-2.5 h-9.5 px-2.5 rounded-md text-sm",
              dam ? "bg-surface-3 text-ink font-semibold" : "text-ink-2 font-medium hover:bg-surface-2",
            )}
          >
            <Icon d={n.icon} size={17} />
            <span className="grow">{n.nhan}</span>
            {!!n.so && (
              <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1.5 rounded-full bg-accent text-white font-mono text-[10.5px] font-medium">
                {n.so}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
