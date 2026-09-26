import { describe, expect, it } from "vitest";
import { parseCta, safeHref, staticCtaTarget } from "./cta";

const UUID = "8ab3ab52-5a08-4a38-93d1-5206526817d4";

describe("parseCta", () => {
  it("mengenali jenis terstruktur", () => {
    expect(parseCta("project:cluster-kanaya-residence-uji")).toEqual({ kind: "project", slug: "cluster-kanaya-residence-uji" });
    expect(parseCta(`course:${UUID}`)).toEqual({ kind: "course", id: UUID });
    expect(parseCta(`event:${UUID.toUpperCase()}`)).toEqual({ kind: "event", id: UUID });
    expect(parseCta("page:listing")).toEqual({ kind: "page", key: "listing" });
    expect(parseCta("url:https://contoh.id/promo")).toEqual({ kind: "url", url: "https://contoh.id/promo" });
  });
  it("whatsapp dengan pesan opsional", () => {
    expect(parseCta("whatsapp:08121234567")).toEqual({ kind: "whatsapp", phone: "08121234567", text: null });
    expect(parseCta("whatsapp:08121234567?text=Halo%20RumahAgen")).toEqual({ kind: "whatsapp", phone: "08121234567", text: "Halo RumahAgen" });
    expect(parseCta("whatsapp:abc")).toBeNull();
  });
  it("menolak isi yang tidak sah", () => {
    expect(parseCta("project:Bukan Slug")).toBeNull();
    expect(parseCta("course:bukan-uuid")).toBeNull();
    expect(parseCta("page:tidak-ada")).toBeNull();
    expect(parseCta("page:constructor")).toBeNull();
    expect(parseCta("url:http://tidak-aman.id")).toBeNull();
    expect(parseCta("url:javascript:alert(1)")).toBeNull();
    expect(parseCta("")).toBeNull();
    expect(parseCta(null)).toBeNull();
  });
  it("nilai lama: jalur situs atau https", () => {
    expect(parseCta("/listing")).toEqual({ kind: "legacy", href: "/listing" });
    expect(parseCta("https://rumahagen.com")).toMatchObject({ kind: "legacy" });
    expect(parseCta("//jahat.id")).toBeNull();
    expect(parseCta("javascript:alert(1)")).toBeNull();
    expect(parseCta("ftp://x.id")).toBeNull();
  });
});

describe("staticCtaTarget", () => {
  it("halaman tetap dan whatsapp", () => {
    expect(staticCtaTarget({ kind: "page", key: "daftar" })).toMatchObject({ href: "/daftar", external: false });
    const wa = staticCtaTarget({ kind: "whatsapp", phone: "08121234567", text: "Halo" });
    expect(wa).toMatchObject({ href: "https://wa.me/628121234567?text=Halo", external: true, label: "Hubungi via WhatsApp" });
  });
  it("jenis berbasis database -> null (diselesaikan resolveCta)", () => {
    expect(staticCtaTarget({ kind: "project", slug: "x" })).toBeNull();
  });
});

describe("safeHref", () => {
  it("hanya jalur situs atau https", () => {
    expect(safeHref("/promo/x")).toBe("/promo/x");
    expect(safeHref("http://x.id")).toBeNull();
  });
});
