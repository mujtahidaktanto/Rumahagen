// lib/ai/platform/field-limits.ts — FIELD_LIMITS (docs/ai-description-rules.md "Panjang mengikuti
// field"): batas AI maksimal = 3/4 batas field sebenarnya, supaya agen/developer masih punya ruang
// edit sendiri. Nilai DICEK LANGSUNG ke skema validasi nyata (lib/validation/listings.ts,
// lib/validation/developer-projects.ts, komponen wizard) sebelum ditulis, bukan disalin dari
// dokumen mentah:
//   - title: 200 (schema + wizard cocok persis)
//   - description: TIDAK ADA batas di schema maupun wizard (listings.description/
//     developer_projects.description keduanya `text` tanpa .max() dan tanpa maxLength di form) --
//     dokumen SENDIRI mengantisipasi kasus ini: "bila form tidak membatasi, 2.000" (pagu default
//     eksplisit dari dokumen, bukan angka yang dikarang di sini).
export const FIELD_LIMITS = {
  title: 200,
  description: 2000, // pagu default dokumen (field tidak dibatasi skema) -- lihat komentar di atas.
} as const;

/** maks_karakter = floor(0.75 * batas field) -- plafon hasil AI, bukan target panjang. */
export function maxAiChars(limit: number): number {
  return Math.floor(0.75 * limit);
}

export const MAX_TITLE_CHARS = maxAiChars(FIELD_LIMITS.title); // 150
export const MAX_DESCRIPTION_CHARS = maxAiChars(FIELD_LIMITS.description); // 1500 (termasuk penutup)
