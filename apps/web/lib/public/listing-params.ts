// lib/public/listing-params.ts — parameter pencarian Discovery listing (M11) yang tersimpan di URL (bisa dibagikan, dapat diindeks, tanpa JS). Murni dan diuji.
// Nilai tidak valid dibuang diam-diam (URL buatan tangan tidak boleh merusak halaman); batas: q 100 karakter, tampil 12–96.

export const PROPERTY_TYPES = ["rumah", "apartemen", "ruko", "tanah", "gudang", "kavling", "lainnya"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  rumah: "Rumah",
  apartemen: "Apartemen",
  ruko: "Ruko",
  tanah: "Tanah",
  gudang: "Gudang",
  kavling: "Kavling",
  lainnya: "Lainnya",
};

export const SORTS = ["terbaru", "termurah", "termahal"] as const;
export type Sort = (typeof SORTS)[number];
export const SORT_LABEL: Record<Sort, string> = { terbaru: "Terbaru", termurah: "Harga terendah", termahal: "Harga tertinggi" };

export const PAGE_SIZE = 12;
export const MAX_SHOWN = 96;

export type ListingSearch = {
  q: string;
  jenis: PropertyType[];
  transaksi: "sale" | "rent" | null;
  min: number | null;
  max: number | null;
  kt: number | null; // kamar tidur minimal
  km: number | null; // kamar mandi minimal
  fasilitas: string[]; // id amenities (uuid)
  urut: Sort;
  tampil: number;
};

type Raw = Record<string, string | string[] | undefined>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const many = (v: string | string[] | undefined): string[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const one = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined, { min = 0, max = 1e13 }: { min?: number; max?: number } = {}): number | null => {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

export function parseListingSearch(raw: Raw): ListingSearch {
  const jenis = [...new Set(many(raw.jenis).filter((j): j is PropertyType => (PROPERTY_TYPES as readonly string[]).includes(j)))];
  const transaksi = one(raw.transaksi);
  const urut = one(raw.urut);
  const tampil = num(one(raw.tampil), { min: PAGE_SIZE, max: MAX_SHOWN });
  return {
    q: (one(raw.q) ?? "").trim().slice(0, 100),
    jenis,
    transaksi: transaksi === "sale" || transaksi === "rent" ? transaksi : null,
    min: num(one(raw.min)),
    max: num(one(raw.max)),
    kt: num(one(raw.kt), { min: 1, max: 10 }),
    km: num(one(raw.km), { min: 1, max: 10 }),
    fasilitas: [...new Set(many(raw.fasilitas).filter((f) => UUID.test(f)))].slice(0, 20),
    urut: (SORTS as readonly string[]).includes(urut ?? "") ? (urut as Sort) : "terbaru",
    tampil: tampil ? Math.ceil(tampil / PAGE_SIZE) * PAGE_SIZE : PAGE_SIZE,
  };
}

/** Jumlah filter aktif (tanpa q, urut, tampil) — untuk lencana tombol Filter di layar sempit. */
export function activeFilterCount(s: ListingSearch): number {
  return s.jenis.length + (s.transaksi ? 1 : 0) + (s.min !== null ? 1 : 0) + (s.max !== null ? 1 : 0) + (s.kt ? 1 : 0) + (s.km ? 1 : 0) + s.fasilitas.length;
}

/** Bangun query string dari pencarian (nilai bawaan dihilangkan) dengan perubahan `patch`. Memakai untuk tautan "Muat Lebih Banyak", urutan, dan reset. */
export function listingQuery(s: ListingSearch, patch: Partial<ListingSearch> = {}): string {
  const v = { ...s, ...patch };
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  v.jenis.forEach((j) => p.append("jenis", j));
  if (v.transaksi) p.set("transaksi", v.transaksi);
  if (v.min !== null) p.set("min", String(v.min));
  if (v.max !== null) p.set("max", String(v.max));
  if (v.kt) p.set("kt", String(v.kt));
  if (v.km) p.set("km", String(v.km));
  v.fasilitas.forEach((f) => p.append("fasilitas", f));
  if (v.urut !== "terbaru") p.set("urut", v.urut);
  if (v.tampil !== PAGE_SIZE) p.set("tampil", String(v.tampil));
  const s2 = p.toString();
  return s2 ? `?${s2}` : "";
}

/** Buang karakter yang berarti khusus di filter .or() PostgREST dan pola ilike ( , ( ) % * \ ). */
export function safeKeyword(q: string): string {
  return q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
}
