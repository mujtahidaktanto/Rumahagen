// app/api/calculator/dbr/config/route.ts
// GET /calculator/dbr/config (STEP11-B10 M07 list, "PRESERVE — the endpoint
// family exists"). Sebelum agent menjalankan POST /dbr-simulations, dia
// perlu tahu bank apa saja yang tersedia + threshold/rate masing-masing
// untuk memilih `bank_id` -- itulah "config" kalkulator DBR sejak model
// lama dbr_config tunggal digantikan Bank Master per-bank (0089, Gate
// PRE-00-I). Tabel `banks` dan RLS banks_select
// (has_permission('m07.bank_master.view')) SUDAH ADA sejak 0089, hanya
// belum ada route yang memakainya untuk tujuan ini.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banks")
    .select("id, name, dbr_threshold_percent, default_interest_rate, status")
    .eq("status", "active")
    .order("name");

  if (error) {
    throw error;
  }

  return { data };
});
