// app/api/calculator/dbr/[id]/revoke-share/route.ts
// POST /calculator/dbr/{id}/revoke-share — membungkus revoke_dbr_simulation_share()
// dari supabase/migrations/0089_m07_bank_master_dbr_share_revoke.sql (Gate
// PRE-00-I §28: "Creator-controlled Revoke immediately invalidates the shared
// access... A revoked reference must not continue to authorize access.").
// Sibling route dari share/route.ts — dipisah state-changing action-nya
// sendiri-sendiri (pola sama seperti listings refresh/unpublish terpisah),
// bukan digabung PUT generik, supaya niat aksi eksplisit di path.
//
// requireIdempotencyKey: true — konsisten dengan share/route.ts, meski
// revoke_dbr_simulation_share() sendiri idempoten (revoked_at cuma ditimpa
// now() berkali-kali, tidak merusak apa pun kalau dipanggil ulang).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mencabut share simulasi DBR.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("revoke_dbr_simulation_share", { p_id: ctx.params.id })
    .single();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("tidak ditemukan")) {
      throw new ApiError("NOT_FOUND", "Simulasi DBR tidak ditemukan.");
    }
    if (typeof error.message === "string" && error.message.includes("hanya Creator")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("INTERNAL_ERROR", "revoke_dbr_simulation_share() tidak mengembalikan hasil.");
  }

  return { data };
});
