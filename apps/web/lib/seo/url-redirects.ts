// lib/seo/url-redirects.ts
// Logika murni (tanpa dependensi Node/Next, aman di edge runtime) untuk pengalihan URL dari tabel url_redirects (migration 0051, 0130, 0137).
// Dipakai middleware. Cocokkan pathname+query lebih dulu, lalu pathname saja; ikuti rantai sampai batas dan hentikan bila berputar.

export type RedirectType = 301 | 302;
export interface RedirectRule {
  to: string;
  status: RedirectType;
}
export type RedirectMap = Map<string, RedirectRule>;

export const MAX_REDIRECT_HOPS = 5;

interface Row {
  old_path: string;
  new_path: string;
  redirect_type: number;
}

export function buildRedirectMap(rows: Row[]): RedirectMap {
  const map: RedirectMap = new Map();
  for (const r of rows) {
    if (typeof r.old_path !== "string" || typeof r.new_path !== "string") continue;
    // Hanya jalur internal (CHECK database sama; pertahanan berlapis terhadap open redirect).
    if (!r.old_path.startsWith("/") || !r.new_path.startsWith("/") || r.new_path.startsWith("//")) continue;
    map.set(r.old_path, { to: r.new_path, status: r.redirect_type === 302 ? 302 : 301 });
  }
  return map;
}

/** Mengembalikan tujuan akhir (jalur internal) dan kode, atau null bila tidak ada pengalihan. */
export function resolveRedirect(map: RedirectMap, pathname: string, search = ""): RedirectRule | null {
  const first: RedirectRule | undefined = map.get(pathname + search) ?? (search ? map.get(pathname) : undefined);
  if (!first) return null;

  const seen = new Set<string>([pathname + search, pathname]);
  let current = first;
  let status: RedirectType = first.status;
  for (let hop = 1; hop < MAX_REDIRECT_HOPS; hop++) {
    if (seen.has(current.to)) return null; // putaran: jangan alihkan
    seen.add(current.to);
    const next = map.get(current.to) ?? map.get(current.to.split("?")[0] ?? "");
    if (!next) break;
    if (next.status === 302) status = 302;
    current = next;
  }
  if (seen.has(current.to) && current.to === pathname + search) return null;
  return { to: current.to, status };
}
