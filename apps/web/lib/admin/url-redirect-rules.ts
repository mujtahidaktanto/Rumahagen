// lib/admin/url-redirect-rules.ts — aturan murni Pengalihan URL (M11, wireframe 02-Admin/M11-Pengalihan-URL). Label alasan persis CHECK constraint url_redirects.reason (migration 0051/0130).
export const REDIRECT_REASON_LABEL: Record<string, string> = {
  slug_changed: "Slug berubah",
  listing_deleted: "Listing dihapus",
  listing_merged: "Listing digabung",
  lainnya: "Lainnya",
};
export const redirectReasonLabel = (r: string | null) => (r ? (REDIRECT_REASON_LABEL[r] ?? r) : "—");

const INTERNAL_PATH_RE = /^\/([^/\s\\][^\s\\]*)?$/;
export function validateInternalPath(v: string): string | null {
  return INTERNAL_PATH_RE.test(v.trim()) ? null : 'Harus jalur internal yang diawali "/" tanpa spasi (URL luar tidak diizinkan).';
}

/** Mencegah putaran langsung (old == new) sebelum mengirim ke server — DB juga menolak lewat trigger/CHECK (23514). */
export function validateRedirectForm(oldPath: string, newPath: string): { oldPath?: string; newPath?: string } {
  const errors: { oldPath?: string; newPath?: string } = {};
  const oldErr = validateInternalPath(oldPath);
  const newErr = validateInternalPath(newPath);
  if (oldErr) errors.oldPath = oldErr;
  if (newErr) errors.newPath = newErr;
  if (!oldErr && !newErr && oldPath.trim() === newPath.trim()) errors.newPath = "Jalur baru tidak boleh sama dengan jalur lama.";
  return errors;
}
