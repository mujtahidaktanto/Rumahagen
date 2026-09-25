import { describe, expect, it } from "vitest";
import { orgQuery, parseOrgSearch, socialLinks } from "./organization-data";

describe("parseOrgSearch / orgQuery", () => {
  it("bawaan dan nilai tidak valid", () => {
    expect(parseOrgSearch({})).toEqual({ jenis: null, q: "", tampil: 12 });
    expect(parseOrgSearch({ jenis: "perusahaan", tampil: "5" })).toEqual({ jenis: null, q: "", tampil: 12 });
  });
  it("jenis valid, tampil dibulatkan/dibatasi, query tanpa nilai bawaan", () => {
    const s = parseOrgSearch({ jenis: "kantor", q: " bogor ", tampil: "30" });
    expect(s).toEqual({ jenis: "kantor", q: "bogor", tampil: 36 });
    expect(orgQuery(parseOrgSearch({}))).toBe("");
    expect(orgQuery(s, { tampil: 12 })).toBe("?q=bogor&jenis=kantor");
  });
});

describe("socialLinks", () => {
  it("hanya https dan kunci dikenal", () => {
    const r = socialLinks({ instagram: "https://instagram.com/rumahagen", facebook: "http://fb.com/x", tiktok: "javascript:alert(1)", whatsapp: "https://wa.me/1", youtube: 5 });
    expect(r).toEqual([{ key: "instagram", label: "Instagram", href: "https://instagram.com/rumahagen" }]);
  });
  it("kosong/bukan objek -> []", () => {
    expect(socialLinks(null)).toEqual([]);
    expect(socialLinks(undefined)).toEqual([]);
  });
});
