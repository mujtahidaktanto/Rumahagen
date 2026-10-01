// lib/ai/platform/reference-listings.ts — "Referensi dari deskripsi listing lain"
// (docs/ai-description-rules.md): kalimat kawasan dari listing/project lain di area yang sama,
// HANYA untuk mengenali istilah lokal -- dilarang disalin. Fungsi pemilih sentence (pure) terpisah
// dari query DB supaya bisa diuji tanpa Supabase.
import { createAdminClient } from "@/lib/supabase/admin";
import { stripFooter } from "./footer";

export type ReferenceCandidate = { description: string; agentId: string | null; cityId: string };

// content_flags (migration 0175) SENGAJA belum dipakai sebagai filter di sini -- kolomnya masih
// selalu '{}' (belum ada kode yang menulisnya, lihat catatan di migration 0175), jadi filter
// terhadapnya sekarang tidak bisa diverifikasi berfungsi. Tambahkan lagi begitu trigger penjaga
// injection-on-save dibangun.

/** "Maksimal 5 listing dan maksimal 2 dari agen yang sama" -- docs "Cara server memilih referensi". district_id dipakai hanya kalau hasil city+area < 2. */
async function queryListingReferences(cityId: string, areaKeywordNorm: string, districtId: string | null, excludeId: string | null): Promise<ReferenceCandidate[]> {
  const admin = createAdminClient();
  let q = admin.from("listings").select("description, agent_id, city_id").eq("status", "published").is("deleted_at", null).eq("city_id", cityId).eq("area_keyword_norm", areaKeywordNorm).order("published_at", { ascending: false }).limit(20);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q.returns<{ description: string | null; agent_id: string; city_id: string }[]>();
  let rows = (data ?? []).filter((r): r is { description: string; agent_id: string; city_id: string } => !!r.description);

  if (rows.length < 2 && districtId) {
    let q2 = admin.from("listings").select("description, agent_id, city_id, district_id").eq("status", "published").is("deleted_at", null).eq("city_id", cityId).eq("district_id", districtId).order("published_at", { ascending: false }).limit(20);
    if (excludeId) q2 = q2.neq("id", excludeId);
    const { data: data2 } = await q2.returns<{ description: string | null; agent_id: string; city_id: string }[]>();
    rows = (data2 ?? []).filter((r): r is { description: string; agent_id: string; city_id: string } => !!r.description);
  }

  const perAgent = new Map<string, number>();
  const picked: ReferenceCandidate[] = [];
  for (const r of rows) {
    if (picked.length >= 5) break;
    const used = perAgent.get(r.agent_id) ?? 0;
    if (used >= 2) continue;
    perAgent.set(r.agent_id, used + 1);
    picked.push({ description: stripFooter(r.description), agentId: r.agent_id, cityId: r.city_id });
  }
  return picked;
}

async function queryProjectReferences(cityId: string, areaKeywordNorm: string, excludeId: string | null): Promise<ReferenceCandidate[]> {
  const admin = createAdminClient();
  let q = admin.from("developer_projects").select("description").eq("status", "active").eq("city_id", cityId).eq("area_keyword_norm", areaKeywordNorm).order("created_at", { ascending: false }).limit(5);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q.returns<{ description: string | null }[]>();
  return (data ?? []).filter((r): r is { description: string } => !!r.description).map((r) => ({ description: stripFooter(r.description), agentId: null, cityId }));
}

/** Gabungan listing + project aktif di area yang sama (docs: "Untuk project developer, referensi diambil dari developer_projects aktif... ditambah listing di area itu"). */
export async function loadReferenceCandidates(cityId: string, areaKeywordNorm: string, districtId: string | null, excludeListingId: string | null): Promise<ReferenceCandidate[]> {
  const [listings, projects] = await Promise.all([queryListingReferences(cityId, areaKeywordNorm, districtId, excludeListingId), queryProjectReferences(cityId, areaKeywordNorm, excludeListingId)]);
  return [...listings, ...projects];
}
const AREA_SENTENCE_KEYWORDS = ["tol", "stasiun", "krl", "lrt", "mrt", "terminal", "mal", "rumah sakit", "universitas", "kampus", "sekolah", "kuliner", "wisata", "taman", "bandara", "akses", "dekat", "kawasan", "lingkungan"];

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?\n])\s+/).map((s) => s.trim()).filter(Boolean);
}

function countWords(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

/** Ambil hanya kalimat tentang kawasan (menyebut kata kunci area/kecamatan atau kata daftar di atas), maks 8 kalimat total dari seluruh referensi, maks 30 kata tiap kalimat. Dipanggil dengan teks yang SUDAH bersih (tanpa penutup/kontak/injection -- itu tanggung jawab pemanggil). */
export function extractAreaSentences(texts: { text: string; areaKeyword: string | null; districtName: string | null }[], maxTotal = 8): string[] {
  const result: string[] = [];
  for (const { text, areaKeyword, districtName } of texts) {
    for (const sentence of splitSentences(text)) {
      if (result.length >= maxTotal) return result;
      if (countWords(sentence) > 30) continue;
      const lower = sentence.toLowerCase();
      const mentionsArea = (areaKeyword && lower.includes(areaKeyword.toLowerCase())) || (districtName && lower.includes(districtName.toLowerCase()));
      const mentionsKeyword = AREA_SENTENCE_KEYWORDS.some((k) => lower.includes(k));
      if (mentionsArea || mentionsKeyword) result.push(sentence);
    }
  }
  return result.slice(0, maxTotal);
}

function normalizeForNgram(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** "8 kata berurutan yang sama persis" -- docs "Aturan pemakaian referensi oleh AI". Mengembalikan kalimat referensi yang kena, bukan sekadar boolean, supaya pemanggil bisa coba hapus baris itu dari draft (giliran kedua). */
export function findCopiedRun(generatedText: string, referenceSentences: string[], runLength = 8): string[] {
  const genWords = normalizeForNgram(generatedText);
  if (genWords.length < runLength) return [];
  const genGrams = new Set<string>();
  for (let i = 0; i <= genWords.length - runLength; i++) genGrams.add(genWords.slice(i, i + runLength).join(" "));

  return referenceSentences.filter((ref) => {
    const refWords = normalizeForNgram(ref);
    for (let i = 0; i <= refWords.length - runLength; i++) {
      if (genGrams.has(refWords.slice(i, i + runLength).join(" "))) return true;
    }
    return false;
  });
}

/** Percobaan kedua (docs: "kedua kali: kalimat itu dihapus") -- buang KALIMAT HASIL AI yang mengandung 8 kata berurutan sama dengan salah satu kalimat referensi, sisanya tetap dipakai. */
export function removeSentencesWithCopiedRuns(generatedText: string, referenceSentences: string[], runLength = 8): string {
  const refGrams = new Set<string>();
  for (const ref of referenceSentences) {
    const words = normalizeForNgram(ref);
    for (let i = 0; i <= words.length - runLength; i++) refGrams.add(words.slice(i, i + runLength).join(" "));
  }
  if (refGrams.size === 0) return generatedText;

  const kept = splitSentences(generatedText).filter((sentence) => {
    const words = normalizeForNgram(sentence);
    for (let i = 0; i <= words.length - runLength; i++) {
      if (refGrams.has(words.slice(i, i + runLength).join(" "))) return false;
    }
    return true;
  });
  return kept.join(" ").trim();
}
