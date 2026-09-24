// app/api/developer-partners/route.ts
// GET (list, publik untuk partner status='active' + staf lihat semua lewat
// RLS OR clause), POST (create, staf-dikelola). Otorisasi lewat RLS
// developer_partners_select/developer_partners_manage (0033) — R-02. ?mine=true: hanya perusahaan yang akunnya milik pengguna login.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { validateJsonBody } from "@/lib/api/validate";
import { createDeveloperPartnerSchema } from "@/lib/validation/developer-partners";
import { ApiError } from "@/lib/api/errors";
import { validateSearchParams } from "@/lib/api/validate";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const listPartnersQuerySchema = z.object({ mine: z.enum(["true", "false"]).optional() });

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const filters = validateSearchParams(url.searchParams, listPartnersQuerySchema);
  const supabase = await createClient();
  let query = supabase
    .from("developer_partners")
    .select("*", { count: "exact" })
    .order("company_name")
    .range(offset, offset + limit - 1);
  if (filters.mine === "true") {
    if (!ctx.userId) {
      throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat perusahaan milik saya.");
    }
    query = query.eq("user_id", ctx.userId);
  }
  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createDeveloperPartnerSchema);
  const supabase = await createClient();

  const { data, error } = await supabase.from("developer_partners").insert(body).select().single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
