// lib/agent/listing-params.ts — parameter URL daftar "Listing Saya" (?status=&tampil=), tanpa I/O. Status = nilai CHECK listings.status; "semua" = tanpa filter.
export const MY_LISTING_STATUSES = ["draft", "pending_review", "published", "sold", "rented", "expired", "rejected", "suspended"] as const;
export type MyListingStatus = (typeof MY_LISTING_STATUSES)[number];
export type MyListingFilter = "semua" | MyListingStatus;

export const MY_LISTING_PAGE_SIZE = 12;
export const MY_LISTING_MAX_SHOWN = 96;

export type MyListingsSearch = { status: MyListingFilter; tampil: number };

export function parseMyListingsSearch(raw: Record<string, string | string[] | undefined>): MyListingsSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const s = one(raw.status) ?? "";
  const t = Number(one(raw.tampil));
  const tampil = Number.isFinite(t) && t >= MY_LISTING_PAGE_SIZE && t <= MY_LISTING_MAX_SHOWN ? Math.ceil(t / MY_LISTING_PAGE_SIZE) * MY_LISTING_PAGE_SIZE : MY_LISTING_PAGE_SIZE;
  return { status: (MY_LISTING_STATUSES as readonly string[]).includes(s) ? (s as MyListingStatus) : "semua", tampil };
}

export function myListingsQuery(s: MyListingsSearch, patch: Partial<MyListingsSearch> = {}): string {
  const v = { ...s, ...patch };
  const p = new URLSearchParams();
  if (v.status !== "semua") p.set("status", v.status);
  if (v.tampil !== MY_LISTING_PAGE_SIZE) p.set("tampil", String(v.tampil));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}
