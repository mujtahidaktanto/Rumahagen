// app/api/integrations/learning-session/providers/[provider]/events/route.ts
// API-101 POST /integrations/learning-session/providers/{provider}/events —
// provider event ingress (webhook-style). Alur wajib per STEP11-B5 §9:
// Provider -> Event -> Validation -> Normalization -> Idempotency -> Evidence.
//
// SCOPE: `idempotency_key` (UNIQUE di session_participation_evidence, 0022)
// mencegah event yang sama tersimpan dobel — itulah lapisan Idempotency yang
// evidenced. TIDAK ADA validasi signature webhook provider sungguhan
// (STEP11-B5 §9 eksplisit: "Webhook signature validation, replay handling...
// remain runtime-unverified" — tidak ada skema signature per-provider yang
// evidenced di dokumen manapun, jadi tidak dikarang di sini). `[provider]`
// dari URL disimpan sebagai konteks tapi tidak divalidasi terhadap daftar
// provider tertentu (session_provider_bindings.provider_key juga TEXT bebas
// per desain 0021).
//
// Endpoint ini TIDAK memakai createClient() session-bound (tidak ada sesi
// user login untuk webhook provider eksternal) — dipanggil dengan admin
// client, TAPI RLS session_participation_evidence_insert butuh
// has_permission('m04.session_evidence.manage') yang scope-nya role
// platform (Superadmin/Admin/Manager=all, Agent/Buyer/Instructor=own) —
// tidak ada identitas user untuk webhook eksternal. Karena itu insert lewat
// admin client (bypass RLS) SAMA SEPERTI pola lib/api/idempotency.ts untuk
// api_idempotency_keys — infrastruktur cross-cutting, bukan actor bermain.
//
// ADD-NEW KEAMANAN (di luar STEP11-B5, yang eksplisit tidak mengevidence
// skema signature provider): tanpa pengecekan APA PUN, endpoint ini adalah
// admin-bypass-RLS yang terbuka bebas di internet — siapa pun bisa menyuntik
// baris evidence palsu. Sambil menunggu signature verification per-provider
// yang sebenarnya (di luar scope, butuh spek tiap provider), endpoint ini
// mewajibkan shared-secret minimal via header `X-Webhook-Secret` yang
// dibandingkan ke env var LEARNING_SESSION_WEBHOOK_SECRET — baseline
// keamanan, bukan business logic yang dikarang.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { providerEventIngressSchema } from "@/lib/validation/learning-sessions";
import { ApiError } from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const expectedSecret = process.env.LEARNING_SESSION_WEBHOOK_SECRET;
  if (!expectedSecret) {
    throw new ApiError("INTERNAL_ERROR", "LEARNING_SESSION_WEBHOOK_SECRET belum dikonfigurasi di server.");
  }
  const providedSecret = ctx.request.headers.get("x-webhook-secret");
  if (providedSecret !== expectedSecret) {
    throw new ApiError("UNAUTHENTICATED", "Header X-Webhook-Secret tidak valid.");
  }

  const body = await validateJsonBody(ctx.request, providerEventIngressSchema);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("session_participation_evidence")
    .insert({
      binding_id: body.binding_id,
      session_enrollment_id: body.session_enrollment_id ?? null,
      external_event_id: body.external_event_id ?? null,
      idempotency_key: body.idempotency_key,
      observed_at: body.observed_at ?? null,
      payload_metadata: body.payload_metadata ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Event dengan idempotency_key ini sudah pernah diterima.");
    }
    throw error;
  }

  return { data, status: 201 };
});
