// app/api/events/[id]/route.ts
// API-080 GET, API-083 PUT (termasuk transisi status — lihat catatan di
// lib/validation/events.ts), API-084 DELETE (RLS-nya baru ditambahkan
// migration 0039, lihat rasional di file itu). Otorisasi lewat RLS
// events_select/events_update/events_delete (0031/0039) — R-02.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateEventSchema } from "@/lib/validation/events";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", ctx.params.id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateEventSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update(body)
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (typeof error.message === "string" && (error.message.includes("m05.event.publish") || error.message.includes("m05.event.cancellation"))) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").delete().eq("id", ctx.params.id).select().maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Event tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data: { id: ctx.params.id, deleted: true } };
});
