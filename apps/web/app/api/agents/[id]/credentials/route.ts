// app/api/agents/[id]/credentials/route.ts
// API-015 GET /agents/{slug|user_id}/credentials — presentasi credential publik (STEP11-B1, F11-B1-011: M02 hanya konsumen presentasi; otoritas ada di M15).
// Sejak migration 0148 dibaca dari view `public_agent_profiles` (parameter = public_slug atau user_id): daftar title yang dipilih Agent, utama lebih dulu lalu tambahan
// berurutan. `certificates` (M04) sengaja tidak disertakan (tidak ada jalur publik).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { agentLookup } from "@/lib/api/agent-key";
import { createClient } from "@/lib/supabase/server";

interface PublicTitle {
  code: string;
  name: string;
  description: string | null;
}

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const key = agentLookup(ctx.params.id);
  const { data, error } = await supabase
    .from("public_agent_profiles")
    .select("primary_title, additional_titles")
    .eq(key.column, key.value)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Profil agent tidak ditemukan atau tidak publik.");
  }

  const primary = data.primary_title as PublicTitle | null;
  const additional = (data.additional_titles ?? []) as PublicTitle[];
  return {
    data: [
      ...(primary ? [{ presentation_type: "primary", display_order: 0, ...primary }] : []),
      ...additional.map((t, i) => ({ presentation_type: "additional", display_order: i + 1, ...t })),
    ],
  };
});
