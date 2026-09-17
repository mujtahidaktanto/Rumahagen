// app/api/qualification-evidence/[id]/route.ts
// API-221 GET /qualification-evidence/{evidence_id}. Otorisasi lewat RLS
// qualification_evidence_select (0026) — m15.qualification.administer.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qualification_evidence")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Qualification evidence tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
