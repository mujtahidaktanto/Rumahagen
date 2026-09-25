// lib/api/ref-query.ts
// Pembantu query untuk endpoint referensi wilayah (ref-provinces, ref-cities, ref-districts): filter induk berbentuk uuid dan pencarian nama.

import { z } from "zod";
import { ApiError } from "./errors";

const uuidSchema = z.string().uuid();

// Mengembalikan uuid valid atau null bila parameter tidak ada; parameter yang ada tetapi bukan uuid ditolak 422 (bukan galat cast Postgres).
export function optionalUuidParam(searchParams: URLSearchParams, name: string): string | null {
  const raw = searchParams.get(name);
  if (raw === null || raw === "") {
    return null;
  }
  const parsed = uuidSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError("VALIDATION_ERROR", `Parameter ${name} harus berupa uuid`);
  }
  return parsed.data;
}

// Pola ILIKE "mengandung" dengan karakter khusus (% _ \) di-escape; null bila kosong. Panjang dibatasi agar tidak dipakai sebagai beban.
export function containsPattern(searchParams: URLSearchParams, name = "q"): string | null {
  const raw = (searchParams.get(name) ?? "").trim();
  if (!raw) {
    return null;
  }
  if (raw.length > 100) {
    throw new ApiError("VALIDATION_ERROR", `Parameter ${name} terlalu panjang (maksimal 100 karakter)`);
  }
  return `%${raw.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
