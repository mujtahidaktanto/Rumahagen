// app/api/listings/from-project/[project_id]/route.ts
// POST /listings/from-project/{project_id} — API-034 (M03/M06, Gate
// PRE-00-H §19-24, "APPROVED CLAIM -> AGENT-OWNED LISTING
// INITIALIZATION"). Sebelum route ini, klaim project developer yang
// SUDAH DI-APPROVE tidak pernah menghasilkan listing apa pun -- Agent
// "claim" project tapi tidak pernah dapat listing untuk dijual.
//
// HARD-GATE (§21): "Project existence alone is not sufficient to
// authorize Listing creation from Project" -- WAJIB approved
// agent_project_claims milik PEMANGGIL SENDIRI, dicek eksplisit di kode
// (bukan RLS baru) karena ini aturan LINTAS-TABEL (agent_project_claims +
// developer_projects -> listings), bukan RLS satu-tabel biasa. RLS
// `listings_insert` (0018, m03.listing.create scope 'own') tetap jadi
// penegak akhir untuk INSERT listings itu sendiri -- R-02.
//
// FIELD MAPPING (§22, "v1.5 mapping artifact"): 24 kolom developer_
// projects PERSIS type/constraint sama dengan listings (dikonfirmasi
// komentar migration 0034 sendiri) -- disalin langsung. `name`->`title`,
// `location`->`address` (agent boleh override keduanya lewat body),
// `price_min`->`price` (project cuma punya RANGE, listing butuh SATU
// nilai -- keputusan rekayasa: pakai harga awal/starting price, bukan
// max, konsisten praktik "mulai dari" properti berbasis project).
// `whatsapp_number` WAJIB dari body (Agent-owned field, Gate §22).
//
// MEDIA INHERITANCE (§23): "Approved Claim permits Project Media to be
// inherited into the resulting Listing media context" -- developer_
// project_media (photo/video) DISALIN (bukan referensi hidup) ke
// listing_photos/listing_videos milik listing baru -- "No authority
// leakage": Project Media tetap milik Developer, salinannya di listing
// murni milik Agent sejak saat itu (§24, Agent edit listing TIDAK
// memutasi Project).
//
// status listing baru SELALU 'draft' (default kolom) -- "Claim approval
// != Listing Publish authority" (§19) -- Agent tetap harus publish
// terpisah lewat PATCH /listings/{id}/status yang sudah ada.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createListingFromProjectSchema } from "@/lib/validation/listings";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`.slice(0, 220);
}

const PROJECT_SOURCED_FIELDS = [
  "category",
  "transaction_type",
  "property_type",
  "province_id",
  "city_id",
  "district_id",
  "area_keyword",
  "latitude",
  "longitude",
  "price_unit",
  "is_negotiable",
  "bedrooms",
  "bathrooms",
  "land_area",
  "building_area",
  "floors",
  "carport_capacity",
  "electrical_power",
  "water_source",
  "furnishing",
  "year_built",
  "certificate_type",
  "certificate_transferred",
  "imb_status",
  "dispute_free_declared",
  "meta_title",
  "meta_description",
] as const;

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat listing dari project.");
  }

  const body = await validateJsonBody(ctx.request, createListingFromProjectSchema);
  const supabase = await createClient();

  const { data: claim, error: claimErr } = await supabase
    .from("agent_project_claims")
    .select("id, status")
    .eq("agent_id", ctx.userId)
    .eq("project_id", ctx.params.project_id)
    .maybeSingle();
  if (claimErr) throw claimErr;
  if (!claim || claim.status !== "approved") {
    throw new ApiError(
      "FORBIDDEN",
      "Butuh klaim project yang sudah 'approved' milik Anda sendiri untuk membuat listing dari project ini (Gate PRE-00-H §21).",
    );
  }

  const { data: project, error: projectErr } = await supabase
    .from("developer_projects")
    .select("*")
    .eq("id", ctx.params.project_id)
    .maybeSingle();
  if (projectErr) throw projectErr;
  if (!project) {
    throw new ApiError("NOT_FOUND", "Project tidak ditemukan.");
  }

  const projectFields = Object.fromEntries(
    PROJECT_SOURCED_FIELDS.map((k) => [k, (project as Record<string, unknown>)[k]]),
  );
  const title = body.title ?? project.name;
  const address = body.address ?? project.location;
  if (!address) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Project ini tidak punya 'location' -- isi 'address' di body untuk melengkapi listing.",
    );
  }

  const { data: listing, error: insertErr } = await supabase
    .from("listings")
    .insert({
      ...projectFields,
      agent_id: ctx.userId,
      developer_project_id: project.id,
      title,
      slug: slugify(title),
      address,
      price: project.price_min,
      whatsapp_number: body.whatsapp_number,
    })
    .select()
    .single();
  if (insertErr) throw insertErr;

  const { data: projectMedia, error: mediaErr } = await supabase
    .from("developer_project_media")
    .select("type, url")
    .eq("project_id", project.id);
  if (mediaErr) throw mediaErr;

  const photos = (projectMedia ?? []).filter((m) => m.type === "photo");
  const videos = (projectMedia ?? []).filter((m) => m.type === "video");
  if (photos.length > 0) {
    const { error } = await supabase
      .from("listing_photos")
      .insert(photos.map((p, i) => ({ listing_id: listing.id, url: p.url, sort_order: i })));
    if (error) throw error;
  }
  if (videos.length > 0) {
    const { error } = await supabase
      .from("listing_videos")
      .insert(videos.map((v) => ({ listing_id: listing.id, url: v.url, type: "video" as const })));
    if (error) throw error;
  }

  await supabase.rpc("log_audit_event", {
    p_action: "m03.listing.create_from_project",
    p_entity_type: "listings",
    p_entity_id: listing.id,
    p_new_value: { developer_project_id: project.id, media_copied: (projectMedia ?? []).length },
  });

  return { data: listing, status: 201 };
});
