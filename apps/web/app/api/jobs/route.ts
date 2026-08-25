import { NextResponse } from "next/server";
import { z } from "zod";
import { getToolById } from "@/lib/tools";
import { currentUser } from "@/lib/supabase/server";
import { taoViecVaGiuTien } from "@/lib/credits";

export const runtime = "nodejs";

const Body = z.object({
  toolId: z.string().min(1),
  input: z.record(z.string(), z.union([z.string(), z.number()])),
  addOns: z.array(z.string()).default([]),
  fileNames: z.array(z.string()).default([]),
});

/**
 * Nhận yêu cầu tạo việc.
 *
 * Thứ tự BẮT BUỘC, xem docs/adr/0003-web-architecture.md mục 4:
 *   kiểm tra số dư → GIỮ tiền → ghi việc → xếp hàng
 * Không bao giờ mở phiên agent ở đây — dispatcher lo việc đó.
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ code: "CHUA_DANG_NHAP", message: "Bạn cần đăng nhập trước" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ code: "DU_LIEU_SAI", message: "Dữ liệu gửi lên không hợp lệ" }, { status: 400 });
  }
  const { toolId, input, addOns, fileNames } = parsed.data;

  const tool = getToolById(toolId);
  if (!tool) {
    return NextResponse.json({ code: "KHONG_CO_CONG_CU", message: "Không tìm thấy công cụ này" }, { status: 404 });
  }

  // Giá chốt tại đây, không đọc lại lúc chạy — đổi giá giữa chừng không ảnh hưởng việc đang chạy
  const gia =
    tool.price_vnd + (tool.addOns ?? []).filter((a) => addOns.includes(a.name)).reduce((s, a) => s + a.price_vnd, 0);

  try {
    const jobId = await taoViecVaGiuTien({
      userId: user.id,
      toolId,
      input: { ...input, __addOns: addOns },
      inputFiles: fileNames.map((name) => ({ bucket: "uploads", path: `${user.id}/${name}`, name, bytes: 0 })),
      priceVnd: gia,
    });

    return NextResponse.json({ jobId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("INSUFFICIENT_CREDIT")) {
      return NextResponse.json(
        { code: "KHONG_DU_TIEN", message: "Số dư không đủ. Nạp thêm rồi bấm tạo lại." },
        { status: 402 },
      );
    }
    console.error("[jobs] tạo việc hỏng:", e);
    return NextResponse.json(
      { code: "LOI_MAY_CHU", message: "Chưa tạo được việc. Thử lại sau ít phút giúp tôi." },
      { status: 500 },
    );
  }
}
