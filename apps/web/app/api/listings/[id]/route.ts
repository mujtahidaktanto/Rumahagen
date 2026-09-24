// app/api/listings/[id]/route.ts
// API-026 GET, API-027 PUT (ordinary edit), API-029 DELETE. Sumber semantik:
// STEP11-B2 — "ordinary edit is owner-only, with platform-level Superadmin
// exception" (PUT); "exact cross-scope authority remains governed by M03/M10"
// (DELETE). Otorisasi sepenuhnya lewat RLS
// listings_select_published_or_owner_or_staff / listings_update / listings_delete
// (0018) — route tidak menduplikasi keputusan akses (R-02).
//
// CATATAN: UPDATE/DELETE yang diblokir RLS mengembalikan 0 baris (bukan error
// Postgres) — tidak bisa dibedakan dari "tidak ditemukan" tanpa membocorkan
// keberadaan baris ke pemanggil yang tidak berhak, jadi keduanya direspons
// 404 NOT_FOUND (pola standar REST untuk menghindari kebocoran informasi akses).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateListingSchema } from "@/lib/validation/listings";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Listing tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateListingSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throwIntegrityError(error);
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Listing tidak ditemukan atau Anda tidak punya akses untuk mengubahnya.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .delete()
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Listing tidak ditemukan atau Anda tidak punya akses untuk menghapusnya.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
