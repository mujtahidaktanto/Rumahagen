// lib/api/idempotency.ts
// Menutup D13-16 & D13-21 — endpoint retry-sensitive (POST/PATCH/DELETE yang
// mengubah state finansial/kuota/lifecycle, mis. M03 Listing Refresh,
// M14 Commercial Purchase, M13 Force Revoke) WAJIB pakai ini.
//
// Kontrak: client mengirim header `Idempotency-Key: <uuid>`. Request pertama
// dieksekusi & hasilnya disimpan ke public.api_idempotency_keys (lihat migration
// 0010). Request berikutnya dengan key sama akan mengembalikan response yang
// SAMA PERSIS tanpa mengulang efek samping. Kalau key sama tapi payload beda →
// 409 IDEMPOTENCY_MISMATCH (menghindari penyalahgunaan key).

import crypto from "node:crypto";
import { createAdminClient } from "../supabase/admin";
import { ApiError } from "./errors";

function hashPayload(payload: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(payload ?? null)).digest("hex");
}

export interface IdempotencyCheckResult {
  key: string;
  isReplay: boolean;
  cachedStatus?: number;
  cachedBody?: unknown;
}

export async function checkIdempotency(
  idempotencyKey: string | null,
  requestPath: string,
  payload: unknown,
  userId: string | null,
): Promise<IdempotencyCheckResult | null> {
  if (!idempotencyKey) {
    // Endpoint yang butuh idempotency HARUS menolak request tanpa key —
    // pengecekan wajib-tidaknya dilakukan di pemanggil (per-route), bukan di sini,
    // supaya util ini tetap reusable untuk endpoint yang idempotency-nya opsional.
    return null;
  }

  const requestHash = hashPayload(payload);
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("api_idempotency_keys")
    .select("request_hash, response_status, response_body, completed_at")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) {
    if (existing.request_hash !== requestHash) {
      throw new ApiError(
        "IDEMPOTENCY_MISMATCH",
        "Idempotency-Key sudah dipakai dengan payload berbeda.",
      );
    }
    if (existing.completed_at) {
      return {
        key: idempotencyKey,
        isReplay: true,
        cachedStatus: existing.response_status ?? undefined,
        cachedBody: existing.response_body ?? undefined,
      };
    }
    // Ada baris tapi belum completed_at → request pertama masih diproses
    // (concurrent retry) — tolak sebagai konflik daripada race condition.
    throw new ApiError("CONFLICT", "Request dengan Idempotency-Key ini sedang diproses.");
  }

  await admin.from("api_idempotency_keys").insert({
    idempotency_key: idempotencyKey,
    request_path: requestPath,
    request_hash: requestHash,
    created_by: userId,
  });

  return { key: idempotencyKey, isReplay: false };
}

export async function completeIdempotency(idempotencyKey: string, status: number, body: unknown) {
  const admin = createAdminClient();
  await admin
    .from("api_idempotency_keys")
    .update({ response_status: status, response_body: body, completed_at: new Date().toISOString() })
    .eq("idempotency_key", idempotencyKey);
}
