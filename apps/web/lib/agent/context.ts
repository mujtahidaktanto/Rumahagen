// lib/agent/context.ts — Context Switcher Agent (STEP13-E §5.3): Pribadi <-> tiap organisasi yang diikuti. Pilihan disimpan di cookie `ra_ctx` ("personal" atau id organisasi) dan SELALU divalidasi server
// terhadap keanggotaan aktif (nilai yang tidak cocok = Pribadi). Ganti konteks TIDAK mengubah kepemilikan atau peran platform; hanya memilih organisasi yang dilihat di layar Organisasi dan kuota penerbitan.
// Murni tanpa I/O agar bisa dipakai server dan komponen klien serta diuji.
export const CONTEXT_COOKIE = "ra_ctx";
export const PERSONAL_CONTEXT = "personal";

export type ContextOrg = { id: string; name: string; role: string };
export type ActiveContext = { kind: "personal" } | { kind: "org"; org: ContextOrg };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Konteks aktif dari nilai cookie; nilai kosong/asing/bukan anggota = Pribadi. */
export function resolveContext(cookieValue: string | undefined | null, orgs: ContextOrg[]): ActiveContext {
  if (!cookieValue || cookieValue === PERSONAL_CONTEXT || !UUID.test(cookieValue)) return { kind: "personal" };
  const org = orgs.find((o) => o.id === cookieValue);
  return org ? { kind: "org", org } : { kind: "personal" };
}

/** Pemimpin aktif organisasi pada konteks aktif (boleh melihat semua listing organisasi, baca saja; migration 0162). */
export const isLeaderContext = (c: ActiveContext) => c.kind === "org" && c.org.role === "leader";

export const contextLabel = (c: ActiveContext) => (c.kind === "org" ? c.org.name : "Pribadi");

/** String cookie untuk klien (berlaku 1 tahun, seluruh situs). */
export function contextCookieString(value: string): string {
  return `${CONTEXT_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
