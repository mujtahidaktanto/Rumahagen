// lib/ai/platform/number-consistency.ts — "Cek konsistensi angka" (docs/ai-description-rules.md):
// angka berdekatan kata kunci (kamar tidur/KT, kamar mandi/KM, luas tanah/LT, luas bangunan/LB,
// VA) di teks dibandingkan dengan DATA_FORM. Jarak fasilitas (km) SENGAJA dikecualikan -- itu
// berasal dari FAKTA_KAWASAN, bukan field properti. Heuristik regex pragmatis (bukan NLP) --
// sesuai cara kerja yang dideskripsikan dokumen sendiri ("mencari angka yang berdekatan").
export type FormNumbers = { bedrooms?: number | null; bathrooms?: number | null; landArea?: number | null; buildingArea?: number | null; electricalPower?: number | null };
export type NumberMismatch = { field: keyof FormNumbers; keyword: string; foundNumber: number; expected: number };

function parseNum(s: string): number {
  return Number(s.replace(/\./g, "").replace(",", "."));
}

const CHECKS: { field: keyof FormNumbers; label: string; patterns: RegExp[] }[] = [
  { field: "bedrooms", label: "kamar tidur", patterns: [/(\d+)\s*kamar\s*tidur/gi, /(\d+)\s*kt\b/gi] },
  { field: "bathrooms", label: "kamar mandi", patterns: [/(\d+)\s*kamar\s*mandi/gi, /(\d+)\s*km\b/gi] },
  { field: "landArea", label: "luas tanah", patterns: [/luas\s*tanah[^0-9]{0,10}(\d+(?:[.,]\d+)?)/gi, /(\d+(?:[.,]\d+)?)\s*m²?\s*luas\s*tanah/gi, /(\d+(?:[.,]\d+)?)\s*m²?\s*\(?lt\)?/gi] },
  { field: "buildingArea", label: "luas bangunan", patterns: [/luas\s*bangunan[^0-9]{0,10}(\d+(?:[.,]\d+)?)/gi, /(\d+(?:[.,]\d+)?)\s*m²?\s*luas\s*bangunan/gi, /(\d+(?:[.,]\d+)?)\s*m²?\s*\(?lb\)?/gi] },
  { field: "electricalPower", label: "listrik", patterns: [/(\d+(?:[.,]\d+)?)\s*va\b/gi] },
];

/** Baris mismatch; kosong = konsisten (atau field tidak disebut sama sekali di teks, yang dianggap sah -- AI boleh tidak menyebut semua spesifikasi). */
export function checkNumberConsistency(text: string, data: FormNumbers): NumberMismatch[] {
  const mismatches: NumberMismatch[] = [];
  for (const check of CHECKS) {
    const expected = data[check.field];
    if (expected === null || expected === undefined) continue;
    for (const pattern of check.patterns) {
      for (const m of text.matchAll(pattern)) {
        const found = parseNum(m[1]!);
        if (Math.abs(found - expected) > 0.5) {
          mismatches.push({ field: check.field, keyword: check.label, foundNumber: found, expected });
        }
      }
    }
  }
  return mismatches;
}
