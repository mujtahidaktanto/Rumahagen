// app/api/agents/me/certificates/route.ts
// API-056 GET /agents/me/certificates — "M04 Certificate/Credential
// presentation; not M15 Award".
//
// 0150: memuat nomor, kode verifikasi, status, judul kursus (dari snapshot), dan tautan unduh PDF. Kursus selesai yang belum punya sertifikat tetap bisa
// diunduh lewat GET /courses/{id}/certificate (menerbitkan saat itu juga), jadi daftar ini bukan syarat untuk mengunduh.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat certificate sendiri.");
  }

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("certificates")
    .select("id, course_id, certificate_number, verification_code, status, issued_at, revoked_at, course_title:snapshot->>course_title, organizer_type:snapshot->>organizer_type", {
      count: "exact",
    })
    .eq("agent_id", ctx.userId)
    .order("issued_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const items = (data ?? []).map((c) => ({
    ...c,
    download_path: c.status === "issued" ? `/api/certificates/${c.id}/pdf?download=1` : null,
  }));

  return { data: items, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
