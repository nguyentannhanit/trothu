import { notFound } from "next/navigation";
import { getToolById } from "@/lib/tools";
import { phienHienTai } from "@/lib/phien";
import FormTao from "./form";

export const dynamic = "force-dynamic";

export default async function TrangTao({ params }: { params: Promise<{ tool: string }> }) {
  const tool = getToolById(decodeURIComponent((await params).tool));
  if (!tool) notFound();
  const phien = await phienHienTai();
  return <FormTao tool={tool} soDu={phien?.soDu ?? 0} />;
}
