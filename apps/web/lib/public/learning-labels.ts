// lib/public/learning-labels.ts — label dan util murni Learning (dipisah dari lib/public/learning-data.ts agar bisa diimpor Client Component tanpa menarik
// lib/supabase/server.ts (next/headers) ke bundle browser). Tidak ada I/O di sini.

export const COURSE_CATEGORIES = ["sales_skill", "legal_regulasi", "produk_developer", "financial_kpr", "lainnya"] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];
export const COURSE_CATEGORY_LABEL: Record<string, string> = {
  sales_skill: "Sales Skill",
  legal_regulasi: "Legal & Regulasi",
  produk_developer: "Produk Developer",
  financial_kpr: "Financial & KPR",
  lainnya: "Lainnya",
};

export const LESSON_TYPE_LABEL: Record<string, string> = { video: "Video", pdf: "PDF", slide: "Slide" };

export const SESSION_TYPE_LABEL: Record<string, string> = { broadcast: "Broadcast", interactive: "Interaktif", on_demand: "On-Demand" };
export const SESSION_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  scheduled: "Terjadwal",
  live: "Sedang Berlangsung",
  ended: "Selesai",
  cancelled: "Dibatalkan",
  failed: "Gagal Dilaksanakan",
};
export const SESSION_VISIBILITY_LABEL: Record<string, string> = { public: "Publik", organization: "Organisasi", partner: "Mitra", private: "Privat" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

export type SessionSummaryTitleInput = { courseTitle: string | null; session_type: string };

/** Judul tampilan sesi: judul kursus terkait, atau "Sesi {tipe}" bila tidak ada kursus (learning_sessions tidak punya kolom judul). */
export function sessionTitle(s: SessionSummaryTitleInput): string {
  return s.courseTitle ?? `Sesi ${SESSION_TYPE_LABEL[s.session_type] ?? s.session_type}`;
}
