// lib/partner/profile-rules.ts — aturan murni Profil Developer (M06). Kolom yang boleh diubah mitra sendiri (bukan user_id/status/deleted_at — dikunci trigger
// trg_developer_partner_self_edit_columns, migration 0126). company_logo di sini URL teks biasa: tidak ada bucket storage untuk logo developer (beda dari
// avatar Agent/foto listing, migration 0158), jadi tidak ada unggah berkas seperti di wireframe — dicatat di audit/FRONTEND_GAPS.md.
export type PartnerProfileForm = { companyName: string; companyLogo: string; description: string; picName: string; picContact: string };
export type PartnerProfileErrors = Partial<Record<"companyName" | "companyLogo", string>>;

export function validatePartnerProfileForm(f: PartnerProfileForm): PartnerProfileErrors {
  const errors: PartnerProfileErrors = {};
  if (!f.companyName.trim()) errors.companyName = "Nama perusahaan wajib diisi.";
  else if (f.companyName.trim().length > 200) errors.companyName = "Maksimal 200 karakter.";
  if (f.companyLogo.trim()) {
    try {
      const u = new URL(f.companyLogo.trim());
      if (u.protocol !== "https:") errors.companyLogo = "Harus tautan https.";
    } catch {
      errors.companyLogo = "Harus tautan URL lengkap (https://…).";
    }
  }
  return errors;
}
