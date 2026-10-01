// lib/partner/profile-rules.ts — aturan murni Profil Developer (M06). Kolom yang boleh diubah mitra sendiri (bukan user_id/status/deleted_at — dikunci trigger
// trg_developer_partner_self_edit_columns, migration 0126). company_logo kini diisi lewat unggah+pangkas (migration 0172, bucket developer-media) — nilainya
// selalu URL hasil unggah server (atau kosong), jadi tidak perlu lagi validasi format URL teks bebas di sini.
export type PartnerProfileForm = { companyName: string; companyLogo: string; description: string; picName: string; picContact: string };
export type PartnerProfileErrors = Partial<Record<"companyName", string>>;

export function validatePartnerProfileForm(f: PartnerProfileForm): PartnerProfileErrors {
  const errors: PartnerProfileErrors = {};
  if (!f.companyName.trim()) errors.companyName = "Nama perusahaan wajib diisi.";
  else if (f.companyName.trim().length > 200) errors.companyName = "Maksimal 200 karakter.";
  return errors;
}
