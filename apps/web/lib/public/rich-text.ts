// lib/public/rich-text.ts — mengubah teks konten (kolom `content` promo dan konten statis) menjadi blok yang aman dirender React TANPA HTML mentah (tidak ada dangerouslySetInnerHTML,
// jadi tidak ada risiko XSS dari konten yang dikelola staf). Format sederhana: baris kosong memisah paragraf, "## Judul" = subjudul, "- butir" berurutan = daftar.
// Murni dan diuji. Baris lain dalam satu paragraf digabung dengan spasi.

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseContent(text: string | null | undefined): ContentBlock[] {
  if (!text) return [];
  const blocks: ContentBlock[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) blocks.push({ type: "paragraph", text: para.join(" ") });
    para = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (line === "") {
      flushPara();
      flushList();
    } else if (/^#{1,6}\s+/.test(line)) {
      flushPara();
      flushList();
      blocks.push({ type: "heading", text: line.replace(/^#{1,6}\s+/, "") });
    } else if (/^[-*•]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-*•]\s+/, ""));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

/** Ringkasan satu baris untuk kartu: teks polos tanpa penanda, dipotong di batas kata. */
export function excerptOf(text: string | null | undefined, max = 140): string {
  const plain = parseContent(text)
    .map((b) => (b.type === "list" ? b.items.join(", ") : b.text))
    .join(" ")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).trimEnd()}…`;
}
