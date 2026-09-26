// lib/admin/course-labels.ts — label kategori kursus/tipe pelajaran/template sertifikat sebagai DATA MURNI, tanpa import apa pun. Komponen client (CourseFormDialog, LessonFormDialog,
// CertificateConfigView) HARUS mengimpor nilai (bukan hanya tipe) dari sini, bukan dari lib/admin/course-data.ts atau lib/public/learning-data.ts — keduanya satu file dengan fungsi server
// (createClient dari next/headers), jadi import nilai apa pun dari sana ikut membundel next/headers ke client dan build gagal ("next/headers ... not supported in the pages/ directory").
// Nilai di sini HARUS tetap sinkron dengan lib/public/learning-data.ts (COURSE_CATEGORIES/COURSE_CATEGORY_LABEL/LESSON_TYPE_LABEL) — ubah di kedua tempat bila kategori/tipe berubah.
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

export type CertTemplate = "classic" | "modern" | "corporate" | "premium";
export const CERT_TEMPLATE_LABEL: Record<CertTemplate, string> = { classic: "Klasik Elegan", modern: "Modern Minimalis", corporate: "Korporat", premium: "Premium Art Deco" };
