// app/api/dbr-simulations/[id]/route.ts
// GET detail dbr_simulations. TIDAK ADA PUT/DELETE — hasil simulasi
// bersifat historis/append-only (komentar migration 0052, pola sama
// seperti listing_price_history), tidak ada RLS UPDATE/DELETE untuk
// siapa pun.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dbr_simulations")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Simulasi DBR tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
