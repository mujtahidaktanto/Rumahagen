// lib/public/promo-data.ts — data Promo & Pengumuman publik (M11), dibaca di server dari `public_announcement_promotion` dengan RLS anon: hanya status active dalam jendela jadwal
// (schedule_at <= sekarang < expires_at). Karena itu promo yang akan datang/berakhir/diarsipkan tidak terlihat pengunjung (sama seperti Detail Listing). Tautan dan gambar dari data
// hanya diterima bila aman (jalur situs sendiri atau https), agar konten yang dikelola staf tidak bisa menyisipkan javascript: atau skema aneh.
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export type Promo = {
  id: string;
  title: string;
  content: string | null;
  image_reference: string | null;
  cta_reference: string | null;
  campaign_reference: string | null;
  priority: number;
  schedule_at: string | null;
  expires_at: string | null;
  created_at: string;
};

const PROMO_SELECT = "id, title, content, image_reference, cta_reference, campaign_reference, priority, schedule_at, expires_at, created_at";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// safeHref dipindah ke ./cta (satu sumber untuk CTA dan gambar); diekspor ulang agar pemanggil lama tetap jalan.
export { safeHref } from "./cta";

/** Label sisa waktu untuk kartu: "Berakhir hari ini", "Berakhir dalam 3 hari", "Berakhir 30 Sep 2026", atau "Tanpa batas waktu". */
export function expiryLabel(expiresAt: string | null | undefined, now: Date = new Date()): string {
  if (!expiresAt) return "Tanpa batas waktu";
  const end = new Date(expiresAt);
  if (Number.isNaN(end.getTime())) return "Tanpa batas waktu";
  // Selisih hari kalender di zona Asia/Jakarta (bukan selisih 24 jam), agar promo yang berakhir malam ini tidak disebut "besok".
  const dayKey = (d: Date) => Date.parse(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(d));
  const days = Math.round((dayKey(end) - dayKey(now)) / 86_400_000);
  if (days <= 0) return "Berakhir hari ini";
  if (days === 1) return "Berakhir besok";
  if (days <= 7) return `Berakhir dalam ${days} hari`;
  return `Berakhir ${formatDate(expiresAt)}`;
}

/** "1 Sep 2026 – 30 Sep 2026", "Mulai 1 Sep 2026", "Hingga 30 Sep 2026", atau "Tanpa batas waktu". */
export function validityText(p: Pick<Promo, "schedule_at" | "expires_at">): string {
  const from = formatDate(p.schedule_at);
  const to = formatDate(p.expires_at);
  if (from && to) return `${from} – ${to}`;
  if (from) return `Mulai ${from}`;
  if (to) return `Hingga ${to}`;
  return "Tanpa batas waktu";
}

export type PromosResult = { ok: true; items: Promo[] } | { ok: false; items: [] };

export async function getActivePromos(limit = 60): Promise<PromosResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_announcement_promotion")
    .select(PROMO_SELECT)
    .eq("status", "active")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Promo[]>();
  if (error) return { ok: false, items: [] };
  return { ok: true, items: data ?? [] };
}

export type PromoResult = { state: "ok"; promo: Promo } | { state: "not_found" } | { state: "error" };

export async function getPromo(id: string): Promise<PromoResult> {
  if (!UUID.test(id)) return { state: "not_found" }; // id bukan uuid -> tidak mungkin ada (hindari galat query)
  const supabase = await createClient();
  const { data, error } = await supabase.from("public_announcement_promotion").select(PROMO_SELECT).eq("id", id).eq("status", "active").maybeSingle<Promo>();
  if (error) return { state: "error" };
  return data ? { state: "ok", promo: data } : { state: "not_found" };
}
