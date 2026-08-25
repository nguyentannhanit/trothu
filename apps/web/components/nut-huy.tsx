"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Nut } from "@/components/ui";

export function NutHuy({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [dangHuy, setDangHuy] = useState(false);

  async function huyViec() {
    if (!confirm("Bạn có chắc muốn huỷ việc này? Tiền sẽ được hoàn lại.")) return;
    setDangHuy(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/cancel`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "Không huỷ được. Thử lại sau.");
      } else {
        router.refresh();
      }
    } catch {
      alert("Có lỗi xảy ra, thử lại sau.");
    } finally {
      setDangHuy(false);
    }
  }

  return (
    <Nut kieu="vien" co="sm" onClick={huyViec} disabled={dangHuy}>
      {dangHuy ? "Đang huỷ…" : "Huỷ"}
    </Nut>
  );
}
