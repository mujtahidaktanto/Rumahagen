// lib/ai/platform/text-sanitizer.ts — sanitizeSeoText() dari docs/ai-description-rules.md "Aturan
// penulisan deskripsi" + "Pembersihan output di server". DUA MODE dari fungsi yang SAMA (bukan dua
// fungsi terpisah, supaya aturan tidak drift): "description" hanya 3 larangan (huruf gaya, kapital
// semua, tanda baca berlebihan) + rapikan spasi; "seo" menambah hapus emoji/simbol dekoratif dan
// akhiran merek meta description -- lihat tabel "Larangan karakter" di dokumen untuk alasan tiap
// langkah. Murni (tanpa I/O), aman dipakai server maupun diuji unit.
const ALLOWED_CAPS = new Set(["SHM", "HGB", "AJB", "PPJB", "IMB", "PBG", "KPR", "KT", "KM", "LT", "LB", "PDAM", "AC", "VA", "KRL", "LRT", "MRT", "BRT", "BSD", "CBD", "RS"]);

// Huruf kapital kecil (small caps, mis. ʀᴜᴍᴀʜ) TIDAK didekomposisi NFKC bawaan JS (beda dari huruf
// bergaya matematis/lebar-penuh/lingkaran yang memang didekomposisi NFKC) -- peta manual untuk set
// yang umum dipakai sebagai "huruf kapital palsu".
const SMALL_CAPS: Record<string, string> = {
  "ᴀ": "a", "ʙ": "b", "ᴄ": "c", "ᴅ": "d", "ᴇ": "e", "ꜰ": "f", "ɢ": "g", "ʜ": "h", "ɪ": "i", "ᴊ": "j",
  "ᴋ": "k", "ʟ": "l", "ᴍ": "m", "ɴ": "n", "ᴏ": "o", "ᴘ": "p", "ꞯ": "q", "ʀ": "r", "ѕ": "s", "ᴛ": "t",
  "ᴜ": "u", "ᴠ": "v", "ᴡ": "w", "х": "x", "ʏ": "y", "ᴢ": "z",
};

// Karakter tak terlihat/kontrol (U+200B-200F spasi-lebar-nol dkk, U+2060, U+FEFF, U+00AD) -- jeda
// paragraf (\n) SENGAJA tidak dibuang di sini, hanya dirapikan di langkah tanda baca/spasi.
const INVISIBLE_CHARS = /[​-‏⁠﻿­]/g;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

// Rentang gabungan IPA Extensions (U+0250-02AF, berisi ʀ/ʜ) + Phonetic Extensions (U+1D00-1D7F) +
// Latin Extended-D (U+A730-A7FF) -- small caps "palsu" tersebar di tiga blok ini, bukan satu.
function stripSmallCaps(text: string): string {
  return text.replace(/[ɐ-ʯᴀ-ᵿꜰ-ꟿ]/g, (c) => SMALL_CAPS[c] ?? c);
}

function decapitalizeWord(word: string): string {
  // Kata 4+ huruf, seluruhnya kapital (huruf saja, bukan angka/simbol campur), bukan singkatan izin.
  if (word.length < 4 || !/^[A-Z]+$/.test(word) || ALLOWED_CAPS.has(word)) return word;
  return word[0] + word.slice(1).toLowerCase();
}

function tidyAllCaps(text: string): string {
  return text.replace(/\b[A-Z]{4,}\b/g, decapitalizeWord);
}

function tidyRepeatedPunctuation(text: string): string {
  // Tanda baca berulang (!!!, ??, ..., --, ~~, ***) -> satu; satu tanda seru di tengah kalimat tetap boleh (mode deskripsi).
  return text.replace(/([!?.\-~*])\1+/g, "$1");
}

const EMOJI_OR_SYMBOL = /[\u{1F000}-\u{1FFFF}\u{2190}-\u{2BFF}\u{2600}-\u{27BF}]|\p{S}/gu;

function stripEmojiAndSymbols(text: string): string {
  // Kecualikan ² (U+00B2) dan % dari pembuangan simbol -- keduanya dipakai untuk luas/persentase.
  return text.replace(EMOJI_OR_SYMBOL, (c) => (c === "²" || c === "%" ? c : ""));
}

function tidySpaces(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/ +([,.!?:;])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type SanitizeMode = "description" | "seo";

// NFKC mendekomposisi ² (U+00B2, superscript two) jadi "2" biasa -- itu TIDAK diinginkan, dokumen
// eksplisit mengizinkan ² tetap ada (luas m²). Dilindungi dengan sentinel sebelum normalize, dikembalikan sesudahnya.
const SUPERSCRIPT_TWO_SENTINEL = "\u0000SUP2\u0000";

/** sanitizeSeoText() -- lihat docs/ai-description-rules.md. mode "description" = 3 larangan saja; mode "seo" = aturan penuh (tanda seru dilarang sama sekali, bukan cuma yang berulang; tanpa akhiran merek, itu ditangani terpisah oleh applyMetaDescriptionSuffix). */
export function sanitizeSeoText(text: string, mode: SanitizeMode): string {
  let t = stripSmallCaps(text).replaceAll("²", SUPERSCRIPT_TWO_SENTINEL);
  t = t.normalize("NFKC");
  t = t.replaceAll(SUPERSCRIPT_TWO_SENTINEL, "²");
  t = t.replace(INVISIBLE_CHARS, "").replace(CONTROL_CHARS, " ");
  if (mode === "seo") t = stripEmojiAndSymbols(t);
  t = t.replace(/#|@(?!\w)|\*|~|\|/g, "");
  if (mode === "seo") t = t.replace(/[“”„‟«»❝❞]/g, '"').replace(/[‘’‚‛]/g, "'");
  t = tidyRepeatedPunctuation(t);
  // Tanda seru: mode description membolehkan SATU tanda seru di tengah kalimat (docs: "Satu tanda
  // seru di dalam kalimat masih boleh") -- yang berulang sudah dirapikan jadi satu di atas, tidak
  // disentuh lagi di sini. Mode seo melarang tanda seru SAMA SEKALI (beda aturan dari deskripsi).
  if (mode === "seo") t = t.replace(/!+/g, ".");
  t = tidyAllCaps(t);
  t = tidySpaces(t);
  return t;
}

const BRAND_SUFFIX = "  · RumahAgen ";
const META_DESCRIPTION_MAX = 155;

/** Tambah akhiran merek pada meta description kalau total masih <=155 karakter; kalau tidak, pertahankan titik penutup inti. Lihat docs/ai-description-rules.md "Panjang dan format". */
export function applyMetaDescriptionSuffix(core: string): string {
  const trimmed = core.trim().replace(/\.+$/, "");
  const withSuffix = `${trimmed}${BRAND_SUFFIX}`;
  if (withSuffix.length <= META_DESCRIPTION_MAX) return withSuffix;
  return `${trimmed}.`;
}
