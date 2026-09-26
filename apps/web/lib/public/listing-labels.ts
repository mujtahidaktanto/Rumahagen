// lib/public/listing-labels.ts — label enum listing (sertifikat, IMB, sumber air, perabotan), murni tanpa I/O agar aman dipakai komponen klien. Diekspor ulang dari listing-detail.ts.
export const CERTIFICATE_LABEL: Record<string, string> = { shm: "SHM", hgb: "HGB", girik: "Girik", ppjb: "PPJB", strata_title: "Strata Title", lainnya: "Lainnya" };
export const IMB_LABEL: Record<string, string> = { ada: "Ada", tidak_ada: "Tidak ada", dalam_proses: "Dalam proses" };
export const WATER_LABEL: Record<string, string> = { pdam: "PDAM", sumur: "Sumur", lainnya: "Lainnya" };
export const FURNISHING_LABEL: Record<string, string> = { unfurnished: "Tanpa perabot", semi_furnished: "Semi furnished", fully_furnished: "Full furnished" };
