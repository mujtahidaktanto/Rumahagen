// lib/auth/safe-next.ts — parameter `next` (tujuan setelah login) hanya boleh berupa jalur di situs ini. Menolak URL absolut, "//host", "/\host", dan
// skema lain (mencegah open redirect setelah login). Bila tidak valid mengembalikan fallback.
export function safeNext(next: string | null | undefined, fallback = "/portal"): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (/[\r\n]/.test(next)) return fallback;
  return next;
}
