"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, ICONS } from "./ui";

export function FloatingZaloWidget() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
      {/* Tooltip Chào mừng */}
      {showTooltip && (
        <div className="bg-surface border-2 border-accent text-ink px-4 py-2.5 rounded-2xl shadow-c3 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-bounce max-w-[240px]">
          <span>💬 Anh chị cần hỗ trợ Zalo 24/7?</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-ink-4 hover:text-ink font-bold ml-1 text-sm cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Button */}
      <Link
        href="/huong-dan"
        className="w-14 h-14 rounded-full bg-[#0068FF] text-white shadow-xl flex items-center justify-center relative active-press transition-transform duration-200 hover:scale-110 border-2 border-white"
        aria-label="Chat Zalo Hỗ Trợ"
      >
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white absolute top-0 right-0 pulse-dot" />
        <span className="font-extrabold text-xl tracking-tighter">Zalo</span>
      </Link>
    </div>
  );
}
