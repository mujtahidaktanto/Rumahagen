// app/api/developer-partners/events/route.ts
// POST /developer-partners/events — M05 gap terakhir dari audit endpoint
// agen/user M01-M15. Gate PRE-00-G §15 "DEVELOPER PARTNER EVENT
// PUBLICATION": "Developer Partner -> OWN / SUBMIT -> subject to
// approval. Developer Partner does not directly publish the Event
// through an unrestricted bypass." Classification: PRESERVE.
//
// Otorisasi lewat RLS events_insert (has_permission('m05.event.create',
// submitted_by), 0031) -- permission developer_partner ditambahkan lewat
// migration 0115 (reuse permission code yang sudah ada, TIDAK ada
// permission baru). "Subject to approval" TIDAK butuh mekanisme baru:
// events.status DEFAULT 'pending_approval' (0031) + trigger
// enforce_event_lifecycle_permissions yang menolak transisi ke
// 'published' tanpa m05.event.publish (Developer Partner SENGAJA tidak
// diberi permission itu di 0115) -- submission fisik selalu berhenti di
// 'pending_approval' sampai staf (Superadmin/Admin/Manager, m05.event.
// publish scope 'all') menyetujui lewat PUT /events/{id} yang sudah ada.
//
// `related_project_id` (kalau diisi) divalidasi harus project MILIK
// pemanggil sendiri (developer_projects.developer_id -> developer_
// partners.user_id = pemanggil) -- dicek eksplisit di kode karena ini
// aturan LINTAS-TABEL (events -> developer_projects -> developer_
// partners), bukan RLS satu-tabel biasa; `submitted_by` SELALU pemanggil
// sendiri (bukan dari body -- endpoint ini murni untuk submission diri
// sendiri, beda dari POST /events generik yang membolehkan staf membuat
// event atas nama orang lain).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createEventSchema } from "@/lib/validation/events";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat event.");
  }

  const body = await validateJsonBody(ctx.request, createEventSchema.omit({ submitted_by: true }));
  const supabase = await createClient();

  if (body.related_project_id) {
    const { data: partner, error: partnerErr } = await supabase
      .from("developer_partners")
      .select("id")
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (partnerErr) throw partnerErr;

    const { data: project, error: projectErr } = await supabase
      .from("developer_projects")
      .select("id, developer_id")
      .eq("id", body.related_project_id)
      .maybeSingle();
    if (projectErr) throw projectErr;

    if (!partner || !project || project.developer_id !== partner.id) {
      throw new ApiError("VALIDATION_ERROR", "related_project_id harus project milik Anda sendiri.");
    }
  }

  const { data, error } = await supabase
    .from("events")
    .insert({ ...body, submitted_by: ctx.userId })
    .select()
    .single();

  if (error) throw error;

  return { data, status: 201 };
});
