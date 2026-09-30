// lib/partner/learning-results-data.ts — data Hasil Kemitraan (M04, wireframe 03-Developer-Partner/M04-Hasil-Kemitraan). partnership_learning_results (migration 0024),
// dibaca langsung di server dengan RLS pemanggil (scope 'own' — hanya baris partner_user_id = akun login yang terbaca, ditegaskan lewat query role_permissions live).
// result_payload ikut disertakan di daftar (bukan cuma detail terpisah) — JSONB kecil, dan dialog Ubah butuh nilainya langsung tanpa permintaan tambahan.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type LearningResultRow = {
  id: string;
  resultType: string;
  resultSummary: string | null;
  provenanceSource: string;
  provenanceReference: string;
  sessionId: string | null;
  resultPayload: Record<string, unknown>;
  validationStatus: string;
  createdAt: string;
};

const SELECT = "id, result_type, result_summary, provenance_source, provenance_reference, session_id, result_payload, validation_status, created_at";

type Row = {
  id: string;
  result_type: string;
  result_summary: string | null;
  provenance_source: string;
  provenance_reference: string;
  session_id: string | null;
  result_payload: Record<string, unknown> | null;
  validation_status: string;
  created_at: string;
};

function map(r: Row): LearningResultRow {
  return {
    id: r.id,
    resultType: r.result_type,
    resultSummary: r.result_summary,
    provenanceSource: r.provenance_source,
    provenanceReference: r.provenance_reference,
    sessionId: r.session_id,
    resultPayload: r.result_payload ?? {},
    validationStatus: r.validation_status,
    createdAt: r.created_at,
  };
}

export async function getMyLearningResults(userId: string): Promise<Part<LearningResultRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partnership_learning_results")
    .select(SELECT)
    .eq("partner_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<Row[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map(map) };
}
