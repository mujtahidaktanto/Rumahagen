// app/api/admin/config/system/route.ts
// API-238 GET /admin/config/system — daftar seluruh config key/value.
// Sumber: STEP11-A F11-A-002 ("M09 GET/PUT /admin/config/system"). Otorisasi
// sepenuhnya lewat RLS system_configs_select (has_permission
// m09.system_configuration.view, 0011) — R-02, tidak diduplikasi di sini.
// PUT per-key ada di [key]/route.ts (API-239) karena tabel dimodelkan sebagai
// baris key/value (0011), bukan satu objek besar.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("system_configs")
    .select("*")
    .order("config_key");

  if (error) {
    throw error;
  }

  return { data };
});
