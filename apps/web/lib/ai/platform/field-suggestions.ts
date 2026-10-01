// lib/ai/platform/field-suggestions.ts — validasi "saran_field" sebelum ditampilkan ke agen/developer
// (docs/ai-description-rules.md "Saran isi kolom terstruktur"). Field numerik/enum dicek di sini
// (murni); district_id (dicocokkan ke ref_districts DALAM kota yang dipilih) dan nama fasilitas
// (dicocokkan ke tabel amenities) butuh query DB -- divalidasi terpisah oleh pemanggil (route).
export type ValidationResult = { ok: boolean };

const intRange = (min: number, max: number) => (v: unknown): ValidationResult => {
  const n = typeof v === "number" ? v : Number(v);
  return { ok: Number.isInteger(n) && n >= min && n <= max };
};
const positiveNumber = () => (v: unknown): ValidationResult => {
  const n = typeof v === "number" ? v : Number(v);
  return { ok: Number.isFinite(n) && n > 0 };
};
const enumCheck = (allowed: string[]) => (v: unknown): ValidationResult => ({ ok: typeof v === "string" && allowed.includes(v) });
const booleanCheck = () => (v: unknown): ValidationResult => ({ ok: typeof v === "boolean" });

const CURRENT_YEAR = new Date().getFullYear();

/** Field yang validasinya murni (tanpa query DB) -- district_id dan fasilitas TIDAK ada di sini, lihat komentar di atas. */
export const PURE_FIELD_VALIDATORS: Record<string, (v: unknown) => ValidationResult> = {
  bedrooms: intRange(0, 50),
  bathrooms: intRange(0, 50),
  floors: intRange(1, 100),
  carport_capacity: intRange(0, 20),
  land_area: positiveNumber(),
  building_area: positiveNumber(),
  electrical_power: intRange(450, 200_000),
  year_built: intRange(1900, CURRENT_YEAR),
  property_type: enumCheck(["rumah", "apartemen", "ruko", "tanah", "gudang", "kavling", "lainnya"]),
  transaction_type: enumCheck(["sale", "rent"]),
  certificate_type: enumCheck(["shm", "hgb", "girik", "ppjb", "strata_title", "lainnya"]),
  certificate_transferred: booleanCheck(),
  imb_status: enumCheck(["ada", "tidak_ada", "dalam_proses"]),
  water_source: enumCheck(["pdam", "sumur", "lainnya"]),
  furnishing: enumCheck(["unfurnished", "semi_furnished", "fully_furnished"]),
};

/** Field yang butuh query DB untuk divalidasi (district_id, fasilitas) -- ditangani pemanggil, bukan di sini. */
export const DB_VALIDATED_FIELDS = new Set(["district_id", "amenities"]);

/** "Server memastikan potongan itu benar-benar ada di teks input; kalau tidak ada, saran dibuang." Pencocokan longgar (spasi/kapital dirapikan) supaya tidak gagal hanya karena beda spasi. */
export function evidenceExistsIn(bukti: string, sourceText: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  return norm(sourceText).includes(norm(bukti));
}

export type RawSuggestion = { field: string; nilai: unknown; jenis: "isi_kosong" | "konflik"; bukti: string; keyakinan: "tinggi" | "sedang" | "rendah" };

/** Saring saran yang lolos validasi murni (numerik/enum) DAN buktinya ada di teks sumber. Saran district_id/fasilitas lolos tahap ini (divalidasi lanjut oleh pemanggil), field tak dikenal dibuang. */
export function filterPureValidSuggestions(suggestions: RawSuggestion[], sourceText: string): RawSuggestion[] {
  return suggestions.filter((s) => {
    if (!evidenceExistsIn(s.bukti, sourceText)) return false;
    if (DB_VALIDATED_FIELDS.has(s.field)) return true;
    const validator = PURE_FIELD_VALIDATORS[s.field];
    if (!validator) return false; // field tidak dikenal -- dibuang, bukan ditampilkan apa adanya.
    return validator(s.nilai).ok;
  });
}
