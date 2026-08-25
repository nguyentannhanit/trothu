import { phienHienTai } from "@/lib/phien";
import FormNap from "./form-nap";

export const dynamic = "force-dynamic";

export default async function TrangNap() {
  const phien = await phienHienTai();
  return <FormNap soDu={phien?.soDu ?? 0} />;
}
