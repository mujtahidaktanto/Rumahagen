// app/api/awards/[id]/provenance/route.ts
// API-229 GET /awards/{award_id}/provenance — riwayat provenance award:
// historical_snapshot (kolom JSONB di award_instances sendiri, terbaca oleh
// siapa pun yang lolos award_instances_select) digabung entri audit_logs
// terkait (0012) DAN qualifying_paths (award_qualifying_paths, M15 Fase 3/
// 0067 — provenance eksplisit Path Version + Evaluation yang menghasilkan
// award ini). audit_logs_select membutuhkan
// m09.administrative_audit_log.view — dipakai client biasa (BUKAN admin
// client) supaya RLS otomatis menyaring: staf lihat log lengkap, non-staf
// otomatis dapat array kosong tanpa perlu percabangan permission manual di
// sini (R-02). award_qualifying_paths_select juga digerbangi RLS-nya sendiri
// (pemilik award atau m15.award.manage) — query polos tanpa filter manual.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();

  const { data: award, error: awardError } = await supabase
    .from("award_instances")
    .select("id, historical_snapshot, issued_at, revoked_at, restored_at")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (awardError) {
    throw awardError;
  }
  if (!award) {
    throw new ApiError("NOT_FOUND", "Award tidak ditemukan atau Anda tidak punya akses.");
  }

  const { data: auditLogs, error: auditError } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity_type", "award_instances")
    .eq("entity_id", ctx.params.id)
    .order("created_at", { ascending: true });

  if (auditError) {
    throw auditError;
  }

  const { data: qualifyingPaths, error: qualifyingError } = await supabase
    .from("award_qualifying_paths")
    .select("*")
    .eq("award_instance_id", ctx.params.id)
    .order("created_at", { ascending: true });

  if (qualifyingError) {
    throw qualifyingError;
  }

  return {
    data: {
      award_id: award.id,
      historical_snapshot: award.historical_snapshot,
      issued_at: award.issued_at,
      revoked_at: award.revoked_at,
      restored_at: award.restored_at,
      audit_logs: auditLogs ?? [],
      qualifying_paths: qualifyingPaths ?? [],
    },
  };
});
