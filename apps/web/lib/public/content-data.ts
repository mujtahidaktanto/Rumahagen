// lib/public/content-data.ts — data Konten Publik / Pusat Bantuan (M11), dibaca di server dari `static_public_content` dengan RLS anon: hanya status `published`.
// Slug dipakai di URL (/konten/{slug}); halaman dengan indexability = 'noindex' diberi robots noindex.
import { createClient } from "@/lib/supabase/server";

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  indexability: "index" | "noindex";
  published_at: string | null;
  updated_at: string;
};

export type ArticleSummary = Pick<Article, "id" | "title" | "slug" | "content" | "updated_at">;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FULL = "id, title, slug, content, meta_title, meta_description, canonical_url, indexability, published_at, updated_at";

export type ArticlesResult = { ok: true; items: ArticleSummary[] } | { ok: false; items: [] };

/** Daftar artikel published (terbaru diperbarui dulu); `q` mencari di judul dan isi. */
export async function listArticles(q: string): Promise<ArticlesResult> {
  const supabase = await createClient();
  let query = supabase.from("static_public_content").select("id, title, slug, content, updated_at").eq("status", "published").order("updated_at", { ascending: false }).limit(60);
  const kw = q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
  if (kw) query = query.or(`title.ilike.%${kw}%,content.ilike.%${kw}%`);
  const { data, error } = await query.returns<ArticleSummary[]>();
  if (error) return { ok: false, items: [] };
  return { ok: true, items: data ?? [] };
}

export type ArticleResult = { state: "ok"; article: Article; related: Pick<ArticleSummary, "title" | "slug">[] } | { state: "not_found" } | { state: "error" };

export async function getArticle(slug: string): Promise<ArticleResult> {
  if (!SLUG.test(slug)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("static_public_content").select(FULL).eq("slug", slug).eq("status", "published").maybeSingle<Article>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };
  // "Artikel Lainnya" pelengkap: gagal memuat tidak menjatuhkan halaman.
  const rel = await supabase.from("static_public_content").select("title, slug").eq("status", "published").neq("slug", slug).order("updated_at", { ascending: false }).limit(5);
  return { state: "ok", article: data, related: rel.error ? [] : (rel.data ?? []) };
}
