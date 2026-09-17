// app/api/learning/paths/[id]/activities/route.ts
// API-063 GET /learning/paths/{path_id}/activities — Path activity
// structure. Mengambil aktivitas dari SEMUA versi path ini (bukan cuma versi
// terbaru) — klien memfilter/menyortir per learning_path_version_id kalau
// perlu; tidak ada aturan "versi mana yang aktif" yang dievidence eksplisit
// untuk dikunci di sini.

import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();

  const { data: versions, error: versionsError } = await supabase
    .from("learning_path_versions")
    .select("id")
    .eq("learning_path_id", ctx.params.id);

  if (versionsError) {
    throw versionsError;
  }

  const versionIds = (versions ?? []).map((v) => v.id);
  if (versionIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("learning_activities")
    .select("*")
    .in("learning_path_version_id", versionIds)
    .order("sequence_no", { ascending: true });

  if (error) {
    throw error;
  }

  return { data };
});
