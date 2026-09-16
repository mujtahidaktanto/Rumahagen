// app/api/admin/notification-templates/[type]/route.ts
// GET satu template, PUT update wording/is_active. Otorisasi lewat RLS
// notification_templates_all (has_permission
// m09.notification_template_content.configure, 0013).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { notificationTemplateUpdateSchema } from "@/lib/validation/admin";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_templates")
    .select("*")
    .eq("type", ctx.params.type)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", `Template '${ctx.params.type}' tidak ditemukan.`);
  }

  return { data };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, notificationTemplateUpdateSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notification_templates")
    .update({ ...body, updated_by: ctx.userId })
    .eq("type", ctx.params.type)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", `Template '${ctx.params.type}' tidak ditemukan atau Anda tidak punya akses.`);
  }

  return { data };
});
