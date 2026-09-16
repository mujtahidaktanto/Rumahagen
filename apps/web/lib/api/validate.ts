// lib/api/validate.ts
// Menutup D13-18 (bagian request-side) — satu util validateRequest() dipakai
// semua route, bukan tiap route parsing & validasi manual sendiri-sendiri.

import type { ZodSchema } from "zod";
import { ApiError } from "./errors";

export async function validateJsonBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError("VALIDATION_ERROR", "Body request bukan JSON valid.");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError("VALIDATION_ERROR", "Validasi body request gagal.", parsed.error.flatten());
  }
  return parsed.data;
}

export function validateSearchParams<T>(searchParams: URLSearchParams, schema: ZodSchema<T>): T {
  const obj = Object.fromEntries(searchParams.entries());
  const parsed = schema.safeParse(obj);
  if (!parsed.success) {
    throw new ApiError("VALIDATION_ERROR", "Validasi query parameter gagal.", parsed.error.flatten());
  }
  return parsed.data;
}
