// app/api/agents/me/slug-availability/route.ts
// GET /agents/me/slug-availability?slug=... — cek alamat profil publik (/agen/{slug}) SEBELUM disimpan (migration 0157): tersedia atau alasan (format, panjang, dicadangkan, dipakai, sama),
// apakah bulan ini masih boleh mengganti (1x per bulan kalender WIB), dan kapan boleh lagi. Logika seluruhnya di database (RPC check_my_agent_slug); route ini hanya membungkusnya. Penegakan
// akhir tetap di trigger saat PUT /users/profile (dua orang bisa memilih nama sama bersamaan).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateSearchParams } from "@/lib/api/validate";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const querySchema = z.object({ slug: z.string().max(120) });

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const { slug } = validateSearchParams(new URL(ctx.request.url).searchParams, querySchema);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_my_agent_slug", { p_slug: slug });
  if (error) {
    throw error;
  }
  return { data };
});
