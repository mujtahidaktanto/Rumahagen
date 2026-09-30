// lib/partner/marketing-kit-rules.ts — aturan murni Marketing Kit (M06, wireframe 03-Developer-Partner/M06-Marketing-Kit). file_type persis CHECK constraint
// marketing_kit.file_type (migration 0035, hanya brochure/price_list — "BUKAN generic document storage").
export const KIT_TYPE_LABEL: Record<string, string> = { brochure: "Brosur", price_list: "Daftar Harga" };
export const KIT_TYPE_OPTIONS = ["brochure", "price_list"] as const;
export const kitTypeLabel = (t: string) => KIT_TYPE_LABEL[t] ?? t;

export const MAX_KIT_MB = 20;

export function validateKitFile(file: { type: string; size: number }): string | null {
  if (file.type !== "application/pdf") return "Hanya file PDF.";
  if (file.size > MAX_KIT_MB * 1024 * 1024) return `Ukuran maksimal ${MAX_KIT_MB} MB.`;
  return null;
}
