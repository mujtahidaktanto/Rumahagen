// lib/public/agent-reviews.ts — ulasan dan peringkat agen publik (M02 agent_reviews, migration 0030). Dibaca di server dengan RLS pemanggil: anon hanya melihat ulasan
// `approved` yang belum dihapus (agent_reviews_select); filter yang sama ditulis eksplisit agar tidak bergantung pada RLS saja. Menulis ulasan = POST /api/agents/{id}/reviews (belum
// ada layarnya di Fase 2). Peringkat dihitung dari kolom rating semua ulasan tayang (maks. RATING_ROWS_CAP baris; di atas itu rata-rata memakai sampel terbaru).
import { createClient } from "@/lib/supabase/server";

export type AgentReview = { id: string; reviewer_name: string | null; rating: number; comment: string | null; created_at: string };
export type RatingSummary = { average: number | null; count: number };

export const REVIEW_LIST_LIMIT = 10;
const RATING_ROWS_CAP = 5000;

/** Rata-rata satu desimal dan jumlah; tanpa ulasan -> average null. */
export function summarizeRatings(ratings: readonly number[]): RatingSummary {
  const valid = ratings.filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
  if (valid.length === 0) return { average: null, count: 0 };
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  return { average: Math.round(avg * 10) / 10, count: valid.length };
}

/** Nama pengulas untuk tampilan: kosong -> "Pengguna RumahAgen". */
export function reviewerLabel(name: string | null): string {
  const t = (name ?? "").trim();
  return t.length > 0 ? t : "Pengguna RumahAgen";
}

export type AgentReviewsResult = { ok: true; summary: RatingSummary; reviews: AgentReview[] } | { ok: false };

export async function getAgentReviews(agentId: string): Promise<AgentReviewsResult> {
  const supabase = await createClient();
  const [listRes, ratingRes] = await Promise.all([
    supabase
      .from("agent_reviews")
      .select("id, reviewer_name, rating, comment, created_at")
      .eq("agent_id", agentId)
      .eq("status", "approved")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .limit(REVIEW_LIST_LIMIT)
      .returns<AgentReview[]>(),
    supabase.from("agent_reviews").select("rating").eq("agent_id", agentId).eq("status", "approved").is("deleted_at", null).order("created_at", { ascending: false }).limit(RATING_ROWS_CAP).returns<{ rating: number }[]>(),
  ]);
  if (listRes.error || ratingRes.error) return { ok: false };
  return { ok: true, summary: summarizeRatings((ratingRes.data ?? []).map((r) => r.rating)), reviews: listRes.data ?? [] };
}

/** Peringkat banyak agen sekaligus (untuk kartu daftar). Gagal -> peta kosong (kartu tampil tanpa peringkat). */
export async function getAgentRatings(agentIds: readonly string[]): Promise<Map<string, RatingSummary>> {
  const out = new Map<string, RatingSummary>();
  if (agentIds.length === 0) return out;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_reviews")
    .select("agent_id, rating")
    .in("agent_id", [...agentIds])
    .eq("status", "approved")
    .is("deleted_at", null)
    .limit(RATING_ROWS_CAP)
    .returns<{ agent_id: string; rating: number }[]>();
  if (error || !data) return out;
  const grouped = new Map<string, number[]>();
  for (const r of data) grouped.set(r.agent_id, [...(grouped.get(r.agent_id) ?? []), r.rating]);
  for (const [id, ratings] of grouped) out.set(id, summarizeRatings(ratings));
  return out;
}
