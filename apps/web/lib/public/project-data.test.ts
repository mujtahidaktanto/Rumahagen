import { describe, expect, it } from "vitest";
import { parseProjectSearch, projectQuery } from "./project-data";
import { buildProjectWhatsAppMessage } from "./whatsapp-message";

describe("parseProjectSearch / projectQuery", () => {
  it("bawaan dan nilai tidak valid", () => {
    expect(parseProjectSearch({})).toEqual({ q: "", jenis: null, status: null, tampil: 12 });
    expect(parseProjectSearch({ jenis: "kapal", status: "inactive", tampil: "5" })).toEqual({ q: "", jenis: null, status: null, tampil: 12 });
  });
  it("status inactive tidak pernah bisa dipilih publik; nilai valid diterima", () => {
    const s = parseProjectSearch({ q: " serpong ", jenis: "rumah", status: "coming_soon", tampil: "30" });
    expect(s).toEqual({ q: "serpong", jenis: "rumah", status: "coming_soon", tampil: 36 });
    expect(projectQuery(parseProjectSearch({}))).toBe("");
    expect(projectQuery(s, { tampil: 12 })).toBe("?q=serpong&jenis=rumah&status=coming_soon");
  });
});

describe("buildProjectWhatsAppMessage", () => {
  it("memuat nama proyek, lokasi, harga, dan tautan", () => {
    const m = buildProjectWhatsAppMessage({ picName: "Bapak Rudi", projectName: "Cluster *Kanaya*", slug: "cluster-kanaya", location: "Serpong", priceLabel: "Rp 650.000.000 – Rp 950.000.000", siteUrl: "https://rumahagen.com/" });
    expect(m).toContain("Halo Bapak Rudi,");
    expect(m).toContain("*Cluster Kanaya*");
    expect(m).toContain("Lokasi: Serpong");
    expect(m).toContain("Tautan: https://rumahagen.com/project/cluster-kanaya");
  });
  it("tanpa nama PIC dan lokasi", () => {
    const m = buildProjectWhatsAppMessage({ projectName: "X", slug: "x", priceLabel: "Hubungi developer", siteUrl: "https://a.b" });
    expect(m.startsWith("Halo,\n")).toBe(true);
    expect(m).not.toContain("Lokasi:");
  });
});
