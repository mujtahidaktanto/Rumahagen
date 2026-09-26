// lib/agent/search-scope.ts — pencarian topbar: tiga cakupan yang halamannya sudah mendukung kata kunci (?q=): listing (Discovery), agen, dan event. Murni agar bisa diuji.
export const SEARCH_SCOPES = [
  { value: "listing", label: "Listing", path: "/listing", placeholder: "Cari listing, lokasi, atau tipe…" },
  { value: "agen", label: "Agen", path: "/agen", placeholder: "Cari nama, kota, atau kantor agen…" },
  { value: "event", label: "Event", path: "/event", placeholder: "Cari event…" },
] as const;
export type SearchScope = (typeof SEARCH_SCOPES)[number]["value"];

export function searchHref(scope: string, q: string): string | null {
  const s = SEARCH_SCOPES.find((x) => x.value === scope);
  const term = q.trim().slice(0, 100);
  if (!s || !term) return null;
  return `${s.path}?q=${encodeURIComponent(term)}`;
}
