// Kiểu dữ liệu bảng — khớp supabase/migrations/0001_init.sql
export type JobStatus = "queued" | "running" | "done" | "failed" | "cancelled";
export type LedgerKind = "topup" | "bonus" | "hold" | "commit" | "refund" | "adjust";

export interface Profile {
  id: string;
  full_name: string | null;
  nganh: string | null;
  phone: string | null;
  free_job_used_at: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  tool_id: string;
  input: Record<string, unknown>;
  input_files: { bucket: string; path: string; name: string; bytes: number }[];
  status: JobStatus;
  stage: string | null;
  stage_detail: string | null;
  progress: number;
  session_id: string | null;
  price_vnd: number;
  cost_umd: number | null;
  usage: Record<string, unknown> | null;
  output_files: { path: string; name: string; bytes: number }[];
  error_code: string | null;
  error_detail: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  expires_at: string | null;
}

export interface LedgerRow {
  id: number;
  user_id: string;
  kind: LedgerKind;
  amount_vnd: number;
  job_id: string | null;
  ref: string | null;
  note: string | null;
  created_at: string;
}

export interface TopupIntent {
  id: string;
  user_id: string;
  amount_vnd: number;
  bonus_vnd: number;
  memo_code: string;
  method: "bank_qr" | "momo";
  status: "pending" | "matched" | "expired" | "manual";
  matched_ref: string | null;
  created_at: string;
  expires_at: string;
}
