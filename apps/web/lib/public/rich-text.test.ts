import { describe, expect, it } from "vitest";
import { excerptOf, parseContent } from "./rich-text";

describe("parseContent", () => {
  it("kosong -> tanpa blok", () => {
    expect(parseContent(null)).toEqual([]);
    expect(parseContent("  \n\n ")).toEqual([]);
  });
  it("paragraf, subjudul, dan daftar", () => {
    const b = parseContent("Pembuka baris satu\nlanjutan\n\n## Syarat\n- Satu\n- Dua\n\nPenutup");
    expect(b).toEqual([
      { type: "paragraph", text: "Pembuka baris satu lanjutan" },
      { type: "heading", text: "Syarat" },
      { type: "list", items: ["Satu", "Dua"] },
      { type: "paragraph", text: "Penutup" },
    ]);
  });
  it("CRLF dan HTML mentah diperlakukan sebagai teks biasa", () => {
    const b = parseContent("<script>alert(1)</script>\r\n\r\n## <b>x</b>");
    expect(b[0]).toEqual({ type: "paragraph", text: "<script>alert(1)</script>" });
    expect(b[1]).toEqual({ type: "heading", text: "<b>x</b>" });
  });
});

describe("excerptOf", () => {
  it("pendek dikembalikan utuh", () => {
    expect(excerptOf("Halo dunia")).toBe("Halo dunia");
  });
  it("panjang dipotong di batas kata dengan elipsis", () => {
    const e = excerptOf("kata ".repeat(60), 50);
    expect(e.endsWith("…")).toBe(true);
    expect(e.length).toBeLessThanOrEqual(51);
  });
  it("penanda subjudul dan daftar tidak ikut", () => {
    expect(excerptOf("## Judul\n- a\n- b")).toBe("Judul a, b");
  });
});
