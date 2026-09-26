// lib/agent/qualification-data.ts — data layar Kualifikasi M15 (Bukti, Evaluasi & Penghargaan, Presentasi Title). Dibaca langsung dari Supabase dengan RLS pemanggil
// (qualification_evidence_select/qualification_evaluations_select/award_instances_select/award_appeals_select, scope OWN) — bukan lewat /api/* (pola sama seperti lib/agent/ai-data.ts).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "./dashboard-data";
import type { AwardStatus, QualificationResult } from "./qualification-rules";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type TitleOption = { id: string; name: string; code: string };

async function loadActiveTitles(supabase: Supabase): Promise<Part<TitleOption[]>> {
  const { data, error } = await supabase.from("title_definitions").select("id, name, code").eq("status", "active").order("name").returns<TitleOption[]>();
  if (error) return { ok: false };
  return { ok: true, data: data ?? [] };
}

// ── Bukti Kualifikasi ──
export type QualificationEvidenceRow = {
  id: string;
  evidenceType: string;
  sourceType: string;
  sourceReference: string;
  targetTitle: string | null;
  note: string | null;
  capturedAt: string;
  evaluationResult: QualificationResult | null;
  awardTitleName: string | null;
};

type EvidenceDbRow = {
  id: string;
  qualification_evaluation_id: string | null;
  evidence_type: string;
  source_type: string;
  source_reference: string;
  evidence_payload: Record<string, unknown> | null;
  captured_at: string;
};

export type QualificationEvidencePageData = { evidence: Part<QualificationEvidenceRow[]>; titles: Part<TitleOption[]> };

export async function getQualificationEvidencePage(userId: string): Promise<QualificationEvidencePageData> {
  const supabase = await createClient();
  const [evRes, titles] = await Promise.all([
    supabase
      .from("qualification_evidence")
      .select("id, qualification_evaluation_id, evidence_type, source_type, source_reference, evidence_payload, captured_at")
      .eq("user_id", userId)
      .order("captured_at", { ascending: false })
      .returns<EvidenceDbRow[]>(),
    loadActiveTitles(supabase),
  ]);

  if (evRes.error) return { evidence: { ok: false }, titles };

  const evalIds = (evRes.data ?? []).map((e) => e.qualification_evaluation_id).filter((id): id is string => !!id);
  const [evalRes, awardRes] = evalIds.length
    ? await Promise.all([
        supabase.from("qualification_evaluations").select("id, result").in("id", evalIds).returns<{ id: string; result: QualificationResult }[]>(),
        supabase
          .from("award_instances")
          .select("qualification_evaluation_id, title_definitions(name)")
          .in("qualification_evaluation_id", evalIds)
          .returns<{ qualification_evaluation_id: string | null; title_definitions: { name: string } | { name: string }[] | null }[]>(),
      ])
    : [{ data: [] as { id: string; result: QualificationResult }[], error: null }, { data: [], error: null }];

  const resultById = new Map((evalRes.data ?? []).map((e) => [e.id, e.result]));
  const awardTitleByEvalId = new Map<string, string>();
  for (const a of awardRes.data ?? []) {
    if (!a.qualification_evaluation_id) continue;
    const t = Array.isArray(a.title_definitions) ? a.title_definitions[0] : a.title_definitions;
    if (t?.name) awardTitleByEvalId.set(a.qualification_evaluation_id, t.name);
  }

  const evidence: QualificationEvidenceRow[] = (evRes.data ?? []).map((e) => {
    const payload = e.evidence_payload ?? {};
    return {
      id: e.id,
      evidenceType: e.evidence_type,
      sourceType: e.source_type,
      sourceReference: e.source_reference,
      targetTitle: typeof payload.target_title === "string" ? payload.target_title : null,
      note: typeof payload.note === "string" ? payload.note : null,
      capturedAt: e.captured_at,
      evaluationResult: e.qualification_evaluation_id ? (resultById.get(e.qualification_evaluation_id) ?? null) : null,
      awardTitleName: e.qualification_evaluation_id ? (awardTitleByEvalId.get(e.qualification_evaluation_id) ?? null) : null,
    };
  });

  return { evidence: { ok: true, data: evidence }, titles };
}

// ── Evaluasi & Penghargaan ──
export type QualificationEvaluationRow = { id: string; result: QualificationResult; evaluatorType: string; evaluatedAt: string; targetTitleLabel: string };
export type AwardRow = { id: string; titleName: string; status: AwardStatus; issuedAt: string; expiresAt: string | null; hasPendingAppeal: boolean };
export type QualificationEvaluationPageData = { evaluations: Part<QualificationEvaluationRow[]>; awards: Part<AwardRow[]> };

export async function getQualificationEvaluationPage(userId: string): Promise<QualificationEvaluationPageData> {
  const supabase = await createClient();
  const [evalRes, awardRes] = await Promise.all([
    supabase
      .from("qualification_evaluations")
      .select("id, result, evaluator_type, evaluation_time")
      .eq("user_id", userId)
      .order("evaluation_time", { ascending: false })
      .returns<{ id: string; result: QualificationResult; evaluator_type: string; evaluation_time: string }[]>(),
    supabase
      .from("award_instances")
      .select("id, status, issued_at, expires_at, qualification_evaluation_id, title_definitions(name)")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false })
      .returns<
        { id: string; status: AwardStatus; issued_at: string; expires_at: string | null; qualification_evaluation_id: string | null; title_definitions: { name: string } | { name: string }[] | null }[]
      >(),
  ]);

  if (evalRes.error || awardRes.error) {
    return { evaluations: evalRes.error ? { ok: false } : { ok: true, data: [] }, awards: awardRes.error ? { ok: false } : { ok: true, data: [] } };
  }

  const evalIds = evalRes.data.map((e) => e.id);
  const evidenceRes = evalIds.length
    ? await supabase.from("qualification_evidence").select("qualification_evaluation_id, evidence_payload").in("qualification_evaluation_id", evalIds).returns<{ qualification_evaluation_id: string | null; evidence_payload: Record<string, unknown> | null }[]>()
    : { data: [] as { qualification_evaluation_id: string | null; evidence_payload: Record<string, unknown> | null }[], error: null };

  const targetTitleFromEvidence = new Map<string, string>();
  for (const ev of evidenceRes.data ?? []) {
    if (!ev.qualification_evaluation_id) continue;
    const t = ev.evidence_payload?.target_title;
    if (typeof t === "string" && !targetTitleFromEvidence.has(ev.qualification_evaluation_id)) targetTitleFromEvidence.set(ev.qualification_evaluation_id, t);
  }
  const awardTitleByEvalId = new Map<string, string>();
  for (const a of awardRes.data) {
    if (!a.qualification_evaluation_id) continue;
    const t = Array.isArray(a.title_definitions) ? a.title_definitions[0] : a.title_definitions;
    if (t?.name) awardTitleByEvalId.set(a.qualification_evaluation_id, t.name);
  }

  const appealRes = await supabase.from("award_appeals").select("award_id, status").eq("appellant_id", userId).eq("status", "pending").returns<{ award_id: string; status: string }[]>();
  const pendingAppealAwardIds = new Set((appealRes.data ?? []).map((a) => a.award_id));

  return {
    evaluations: {
      ok: true,
      data: evalRes.data.map((e) => ({
        id: e.id,
        result: e.result,
        evaluatorType: e.evaluator_type,
        evaluatedAt: e.evaluation_time,
        targetTitleLabel: awardTitleByEvalId.get(e.id) ?? targetTitleFromEvidence.get(e.id) ?? "—",
      })),
    },
    awards: {
      ok: true,
      data: awardRes.data.map((a) => {
        const t = Array.isArray(a.title_definitions) ? a.title_definitions[0] : a.title_definitions;
        return { id: a.id, titleName: t?.name ?? "Title tidak dikenal", status: a.status, issuedAt: a.issued_at, expiresAt: a.expires_at, hasPendingAppeal: pendingAppealAwardIds.has(a.id) };
      }),
    },
  };
}

// ── Presentasi Title ──
export type HeldTitle = { titleDefinitionId: string; titleName: string; issuedAt: string };
export type LockedTitle = { titleName: string; reason: string; badge: "danger" | "neutral" };
export type TitlePresentationPageData = {
  held: Part<HeldTitle[]>;
  locked: Part<LockedTitle[]>;
  primaryId: string | null;
  additionalIds: string[];
};

export async function getTitlePresentationPage(userId: string): Promise<TitlePresentationPageData> {
  const supabase = await createClient();
  const [awardRes, presRes] = await Promise.all([
    supabase
      .from("award_instances")
      .select("status, issued_at, title_definition_id, title_definitions(name)")
      .eq("user_id", userId)
      .order("issued_at", { ascending: true })
      .returns<{ status: AwardStatus; issued_at: string; title_definition_id: string; title_definitions: { name: string } | { name: string }[] | null }[]>(),
    supabase
      .from("title_presentations")
      .select("title_definition_id, presentation_type, display_order")
      .eq("user_id", userId)
      .eq("active", true)
      .order("display_order", { ascending: true })
      .returns<{ title_definition_id: string; presentation_type: string; display_order: number }[]>(),
  ]);

  if (awardRes.error) return { held: { ok: false }, locked: { ok: false }, primaryId: null, additionalIds: [] };

  const nameOf = (row: { title_definitions: { name: string } | { name: string }[] | null }) => {
    const t = Array.isArray(row.title_definitions) ? row.title_definitions[0] : row.title_definitions;
    return t?.name ?? "Title tidak dikenal";
  };

  const heldByTitle = new Map<string, HeldTitle>();
  const lockedByTitle = new Map<string, LockedTitle>();
  for (const a of awardRes.data) {
    if (a.status === "active" || a.status === "restored") {
      if (!heldByTitle.has(a.title_definition_id)) heldByTitle.set(a.title_definition_id, { titleDefinitionId: a.title_definition_id, titleName: nameOf(a), issuedAt: a.issued_at });
    } else if (!heldByTitle.has(a.title_definition_id) && !lockedByTitle.has(a.title_definition_id)) {
      lockedByTitle.set(a.title_definition_id, {
        titleName: nameOf(a),
        reason: a.status === "revoked" ? "Award dicabut. Tidak bisa ditampilkan; ajukan banding di Status Evaluasi." : "Award kedaluwarsa. Tidak tampil di profil publik.",
        badge: a.status === "revoked" ? "danger" : "neutral",
      });
    }
  }

  const presentation = presRes.error ? [] : presRes.data;
  const primary = presentation.find((p) => p.presentation_type === "primary");
  const additional = presentation.filter((p) => p.presentation_type === "additional").sort((a, b) => a.display_order - b.display_order);

  return {
    held: { ok: true, data: Array.from(heldByTitle.values()) },
    locked: { ok: true, data: Array.from(lockedByTitle.values()) },
    primaryId: primary?.title_definition_id ?? null,
    additionalIds: additional.map((p) => p.title_definition_id),
  };
}
