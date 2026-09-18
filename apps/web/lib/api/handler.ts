// lib/api/handler.ts
// Titik gabung SEMUA konvensi Tahap 0 (D13-16 s.d. D13-23). Setiap route di
// Step 3 (STEP-11 API) HARUS dibungkus withApiHandler() ini, bukan
// mendefinisikan Response sendiri — supaya error/status/pagination/rate-limit/
// idempotency/content-type/traceId konsisten di seluruh API tanpa diulang.
//
// Contoh pemakaian (akan dipakai nanti di Step 3):
//
//   export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
//     const body = await validateJsonBody(ctx.request, createListingSchema);
//     ... has_permission dicek lewat RLS Supabase, bukan diulang manual di sini ...
//     return { data: newListing, status: 201 };
//   });

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { ApiError, errorBody } from "./errors";
import { assertJsonContentType } from "./content-type";
import { checkRateLimit, rateLimitHeaders } from "./rate-limit";
import { checkIdempotency, completeIdempotency } from "./idempotency";
import { createClient } from "../supabase/server";
import { jsonSuccess } from "./response";
import type { PaginationMeta } from "./pagination";

export interface ApiContext {
  request: Request;
  traceId: string;
  userId: string | null;
  params: Record<string, string>; // ADD-NEW — dynamic segment ([id], dst.) untuk route Step 3
}

export interface HandlerResult<T> {
  data: T;
  status?: number;
  headers?: HeadersInit;
  pagination?: PaginationMeta; // D13-19 — diikutkan ke meta response kalau endpoint bersifat list
}

export interface WithApiHandlerOptions {
  requireIdempotencyKey?: boolean; // wajibkan header Idempotency-Key (D13-21)
}

export function withApiHandler<T>(
  options: WithApiHandlerOptions,
  fn: (ctx: ApiContext) => Promise<HandlerResult<T>>,
) {
  return async function handler(
    request: Request,
    routeContext: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> {
    const traceId = crypto.randomUUID(); // D13-23

    try {
      // ADD-NEW — Next.js 15 App Router selalu mengirim argumen kedua ini
      // (params kosong {} untuk route tanpa dynamic segment, mis.
      // roles/route.ts). Signature TIDAK boleh opsional (`routeContext?`) —
      // Next.js men-generate .next/types per route yang memvalidasi bahwa
      // parameter kedua exported handler PERSIS menerima bentuk ini, dan
      // `| undefined` dari tanda opsional membuatnya gagal type-check.
      const params = (await routeContext.params) ?? {};

      assertJsonContentType(request); // D13-22

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? null;

      const rateLimitKey = userId ?? request.headers.get("x-forwarded-for") ?? "anonymous";
      const rl = await checkRateLimit(supabase, rateLimitKey); // D13-20, bisa throw RATE_LIMITED

      const idempotencyKey = request.headers.get("idempotency-key");
      if (options.requireIdempotencyKey && !idempotencyKey) {
        throw new ApiError(
          "VALIDATION_ERROR",
          "Header Idempotency-Key wajib untuk endpoint ini.",
        );
      }

      let bodyForHash: unknown = null;
      if (idempotencyKey && ["POST", "PATCH", "PUT"].includes(request.method)) {
        bodyForHash = await request.clone().json().catch(() => null);
        const idem = await checkIdempotency(idempotencyKey, new URL(request.url).pathname, bodyForHash, userId);
        if (idem?.isReplay) {
          return NextResponse.json(idem.cachedBody, {
            status: idem.cachedStatus ?? 200,
            headers: { "Content-Type": "application/json; charset=utf-8", ...rateLimitHeaders(rl) },
          });
        }
      }

      const result = await fn({ request, traceId, userId, params });
      const status = result.status ?? 200;

      const response = jsonSuccess(result.data, {
        status,
        traceId,
        pagination: result.pagination,
        headers: { ...rateLimitHeaders(rl), ...(result.headers ?? {}) },
      });

      if (idempotencyKey) {
        const responseBodyForCache = { data: result.data, meta: { traceId, ...(result.pagination ? { pagination: result.pagination } : {}) } };
        await completeIdempotency(idempotencyKey, status, responseBodyForCache);
      }

      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        const headers: HeadersInit = { "Content-Type": "application/json; charset=utf-8" };
        if (err.code === "RATE_LIMITED" && err.details && typeof err.details === "object") {
          const d = err.details as { retryAfterSeconds?: number };
          if (d.retryAfterSeconds) headers["Retry-After"] = String(d.retryAfterSeconds);
        }
        return NextResponse.json({ ...errorBody(err), meta: { traceId } }, { status: err.status, headers });
      }

      // ADD-NEW — Postgres/PostgREST error 42501 ("insufficient_privilege")
      // terjadi saat RLS WITH CHECK menolak INSERT/UPDATE. Berbeda dari
      // SELECT/UPDATE yang RLS-nya diam-diam mengembalikan 0 baris, INSERT
      // yang ditolak WITH CHECK melempar error Postgres asli — tanpa mapping
      // ini setiap route harus menangkapnya sendiri-sendiri (ditemukan
      // pertama kali di POST /events/{id}/rsvp saat Agent mencoba
      // guest-registration yang scope-nya cuma Instructor). Ditaruh di sini
      // (bukan per-route) supaya SEMUA endpoint mutasi otomatis dapat 403
      // yang benar, bukan 500 generik — R-02: satu tempat, bukan duplikasi.
      if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "42501") {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Anda tidak punya akses untuk operasi ini." }, meta: { traceId } },
          { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } },
        );
      }

      // ADD-NEW — Postgres 23514 ("check_violation") terjadi saat sebuah
      // CHECK constraint DB menolak INSERT/UPDATE (mis.
      // learning_point_accounts.balance_projection >= 0 saat admin mencoba
      // adjustment yang membuat saldo negatif — ditemukan saat testing
      // POST /admin/learning-point-adjustments). Ini kegagalan business-rule
      // yang sah (409), bukan bug server (500) — di-mapping terpusat di sini
      // supaya semua endpoint mutasi otomatis dapat status yang benar.
      if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "23514") {
        const message =
          "detail" in err && typeof (err as { detail?: unknown }).detail === "string"
            ? "Perubahan ini melanggar aturan data (mis. saldo tidak boleh negatif)."
            : "Perubahan ini melanggar aturan data.";
        return NextResponse.json(
          { error: { code: "CONFLICT", message }, meta: { traceId } },
          { status: 409, headers: { "Content-Type": "application/json; charset=utf-8" } },
        );
      }

      // Error tak terduga — jangan bocorkan detail internal ke client (D13-17/18).
      console.error(`[${traceId}] Unhandled API error:`, err);
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." }, meta: { traceId } },
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } },
      );
    }
  };
}
