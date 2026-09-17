// lib/validation/learning-sessions.ts
// Skema Zod untuk M04 Learning Session/Enrollment/Provider Binding/Evidence
// (STEP11-B5 API-086-115). Field persis mengikuti kolom
// `public.learning_sessions`/`session_enrollments`/`session_provider_bindings`/
// `session_artifacts` di supabase/migrations/0021_m04_learning_sessions.sql
// / 0022_m04_session_evidence.sql.

import { z } from "zod";

export const createLearningSessionSchema = z.object({
  owner_id: z.string().uuid().optional(), // default ke pemanggil, pola sama seperti listings.agent_id
  course_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  session_type: z.enum(["broadcast", "interactive", "on_demand"]),
  start_at: z.string().datetime(),
  end_at: z.string().datetime().optional(),
  visibility: z.enum(["public", "organization", "partner", "private"]).optional(),
});
export type CreateLearningSessionInput = z.infer<typeof createLearningSessionSchema>;

export const updateLearningSessionSchema = createLearningSessionSchema.omit({ owner_id: true }).partial();
export type UpdateLearningSessionInput = z.infer<typeof updateLearningSessionSchema>;

export const sessionStatusSchema = z.object({
  status: z.enum(["draft", "scheduled", "live", "ended", "cancelled", "failed"]),
});
export type SessionStatusInput = z.infer<typeof sessionStatusSchema>;

export const listLearningSessionsQuerySchema = z.object({
  session_type: z.enum(["broadcast", "interactive", "on_demand"]).optional(),
  organization_id: z.string().uuid().optional(),
});
export type ListLearningSessionsQuery = z.infer<typeof listLearningSessionsQuerySchema>;

// POST /learning/sessions/{id}/enrollments (API-092)
export const createEnrollmentSchema = z.object({
  activation_reference: z.string().optional(),
});
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

// PATCH /learning/session-enrollments/{id}/status (API-096) — staff-only
// (Gate §26: "SERVER/BUSINESS-RULE GOVERNED, NO NEW PERMISSION" — ditegakkan
// RLS session_enrollments_manage_staff, bukan permission code baru).
export const enrollmentStatusSchema = z.object({
  status: z.enum(["pending", "active", "completed"]),
});
export type EnrollmentStatusInput = z.infer<typeof enrollmentStatusSchema>;

// PUT /learning/sessions/{id}/provider-binding (API-099, create/replace)
export const providerBindingSchema = z.object({
  provider_key: z.string().min(1),
  external_provider_session_id: z.string().optional(),
  binding_state: z.enum(["pending", "active", "ended", "failed", "replaced"]).optional(),
  effective_from: z.string().datetime().optional(),
  effective_to: z.string().datetime().optional(),
});
export type ProviderBindingInput = z.infer<typeof providerBindingSchema>;

// POST /integrations/learning-session/providers/{provider}/events (API-101)
// — provider event ingress. SCOPE: memvalidasi bentuk payload minimal
// (idempotency_key wajib untuk mencegah duplikasi — session_participation_evidence.idempotency_key
// UNIQUE di DB, 0022) dan menyimpannya sebagai evidence mentah. TIDAK
// memvalidasi signature webhook provider sungguhan (STEP11-B5 §9: "Webhook
// signature validation... remain runtime-unverified" — tidak ada skema
// signature yang evidenced per provider, jadi tidak dikarang di sini).
export const providerEventIngressSchema = z.object({
  binding_id: z.string().uuid(),
  session_enrollment_id: z.string().uuid().optional(),
  external_event_id: z.string().optional(),
  idempotency_key: z.string().min(1),
  observed_at: z.string().datetime().optional(),
  payload_metadata: z.record(z.string(), z.unknown()).optional(),
});
export type ProviderEventIngressInput = z.infer<typeof providerEventIngressSchema>;

// POST /learning/sessions/{id}/attendance/evaluate (API-105)
export const attendanceEvaluateSchema = z.object({
  session_enrollment_id: z.string().uuid(),
  evidence_id: z.string().uuid().optional(),
  policy_version: z.string().min(1),
  result: z.string().min(1),
});
export type AttendanceEvaluateInput = z.infer<typeof attendanceEvaluateSchema>;

// POST /learning/sessions/{id}/completion/evaluate (API-108)
export const completionEvaluateSchema = z.object({
  session_enrollment_id: z.string().uuid(),
  attendance_evaluation_id: z.string().uuid().optional(),
  completion_policy_version: z.string().min(1),
  result: z.string().min(1),
});
export type CompletionEvaluateInput = z.infer<typeof completionEvaluateSchema>;

// POST /learning/sessions/{id}/artifacts (API-111)
export const createArtifactSchema = z.object({
  artifact_type: z.string().min(1),
  provider_key: z.string().optional(),
  source_url: z.string().optional(),
  status: z.enum(["pending", "available", "unavailable", "expired"]).optional(),
});
export type CreateArtifactInput = z.infer<typeof createArtifactSchema>;

// PUT /learning/sessions/{id}/event (API-114)
export const sessionEventAssociationSchema = z.object({
  event_id: z.string().uuid(),
});
export type SessionEventAssociationInput = z.infer<typeof sessionEventAssociationSchema>;

// ADD-NEW — tidak ada API ID spesifik di STEP11-B5 untuk resource
// learning_session_assignments (dibahas sebagai keputusan Q-M04-G-01/G-02
// tanpa route id), tapi tabel+RLS sudah lengkap sejak 0021.
export const createAssignmentSchema = z.object({
  actor_id: z.string().uuid(),
  capability: z.enum(["HOST", "INSTRUCTOR"]),
});
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
