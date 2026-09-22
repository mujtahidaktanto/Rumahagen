// app/api/calculator/dbr/[id]/save-as-prospect/route.ts
// POST /calculator/dbr/{id}/save-as-prospect (STEP11-B10 M07 list,
// PRESERVE). STEP10-D mengunci prospect_name/prospect_phone sebagai kolom
// NULLABLE langsung di DBR_SIMULATIONS (bukan tabel PROSPECT terpisah) --
// endpoint ini melampirkan nama/telepon prospek ke simulasi yang sudah ada
// (mis. dijalankan anonim dulu, baru "disimpan sebagai prospek" setelah
// agent bicara dengan calon pembeli). HANYA dua field ini yang bisa
// berubah -- trigger enforce_dbr_simulation_prospect_only_update (0099)
// menolak kalau ada kolom lain yang ikut berubah, menjaga hasil kalkulasi
// tetap immutable.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { saveDbrSimulationAsProspectSchema } from "@/lib/validation/dbr-simulations";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, saveDbrSimulationAsProspectSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dbr_simulations")
    .update({ prospect_name: body.prospect_name, prospect_phone: body.prospect_phone })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Simulasi DBR tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
