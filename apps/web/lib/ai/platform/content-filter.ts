// lib/ai/platform/content-filter.ts — penyaring input/output memakai public.ai_blocked_terms
// (migration 0175): kalimat yang cocok pola DIBUANG dari teks, bukan seluruh teks ditolak --
// docs/ai-description-rules.md "Anti prompt injection" lapis 3 (input) dan "Penyaring output dan
// cek angka" (output). `terms` DIAMBIL PEMANGGIL (query DB) supaya modul ini tetap murni/teruji.
export type BlockedTerm = { kind: "competitor_domain" | "competitor_name" | "property_site_keyword" | "banned_phrase" | "injection_pattern"; value: string; matchType: "contains" | "word" | "domain" | "regex" };

const INVISIBLE = /[​-‏⁠﻿]/g;
// Huruf mirip (Kiril -> Latin) dipakai hanya untuk KEPERLUAN PENCOCOKAN, tidak mengubah teks asli.
const LOOKALIKE: Record<string, string> = { а: "a", е: "e", о: "o", р: "p", с: "c", х: "x", у: "y", і: "i" };
const LEET: Record<string, string> = { "1": "i", "0": "o", "3": "e" };

function normalizeForMatch(text: string): string {
  let t = text.normalize("NFKC").replace(INVISIBLE, "").toLowerCase();
  t = t.replace(/[Ѐ-ӿ]/g, (c) => LOOKALIKE[c] ?? c);
  t = t.replace(/[103]/g, (c) => LEET[c] ?? c);
  return t.replace(/\s+/g, " ").trim();
}

function termMatchesText(term: BlockedTerm, normalizedText: string): boolean {
  const v = normalizeForMatch(term.value);
  switch (term.matchType) {
    case "contains":
    case "domain":
      return normalizedText.includes(v);
    case "word":
      return new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(normalizedText);
    case "regex":
      try {
        return new RegExp(term.value, "i").test(normalizedText);
      } catch {
        return false; // pola regex rusak (mis. ditambah superadmin keliru) -- jangan sampai menjatuhkan seluruh pemeriksaan.
      }
    default:
      return false;
  }
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?\n])\s+/).filter((s) => s.trim().length > 0);
}

export type FilterResult = { clean: string; removedSentences: string[]; matchedTerms: BlockedTerm[] };

/** Buang kalimat yang cocok salah satu pola dari `terms`; sisanya tetap dipakai (docs: "supaya deskripsi tetap bisa dibuat"). */
export function filterBlockedSentences(text: string, terms: BlockedTerm[]): FilterResult {
  const sentences = splitSentences(text);
  const removed: string[] = [];
  const matched: BlockedTerm[] = [];
  const kept = sentences.filter((s) => {
    const normalized = normalizeForMatch(s);
    const hit = terms.find((t) => termMatchesText(t, normalized));
    if (hit) {
      removed.push(s.trim());
      matched.push(hit);
      return false;
    }
    return true;
  });
  return { clean: kept.join(" ").replace(/\s+/g, " ").trim(), removedSentences: removed, matchedTerms: matched };
}

/** Deteksi saja (tanpa membuang) -- dipakai untuk fakta riset kawasan (sumber_url) yang ditolak utuh kalau cocok pola pesaing/injection. */
export function textMatchesAnyTerm(text: string, terms: BlockedTerm[]): boolean {
  const normalized = normalizeForMatch(text);
  return terms.some((t) => termMatchesText(t, normalized));
}

const PHONE_PATTERN = /(\+62|62|0)8[0-9]{7,11}/g;
const URL_PATTERN = /https?:\/\/[^\s)]+/gi;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/gi;

/** Hapus nomor telepon Indonesia, URL, dan email -- docs "Penyaring output dan cek angka". */
export function stripContactInfo(text: string): string {
  return text.replace(PHONE_PATTERN, "").replace(URL_PATTERN, "").replace(EMAIL_PATTERN, "").replace(/ {2,}/g, " ").trim();
}
