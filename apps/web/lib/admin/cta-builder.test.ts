import { describe, expect, it } from "vitest";
import { buildCtaReference, parseCtaForEdit, EMPTY_CTA_FORM } from "./cta-builder";

describe("buildCtaReference", () => {
  it("none atau isian kosong/tidak valid -> null", () => {
    expect(buildCtaReference(EMPTY_CTA_FORM)).toBeNull();
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "project", slugOrId: "" })).toBeNull();
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "project", slugOrId: "Bukan Slug!" })).toBeNull();
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "course", slugOrId: "bukan-uuid" })).toBeNull();
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "whatsapp", phone: "" })).toBeNull();
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "url", url: "http://tidak-https.com" })).toBeNull();
  });
  it("project/course/event", () => {
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "project", slugOrId: "green-valley" })).toBe("project:green-valley");
    const id = "2e310408-7a1a-4c3b-9d2e-0a1b2c3d4e5f";
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "course", slugOrId: id.toUpperCase() })).toBe(`course:${id}`);
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "event", slugOrId: id })).toBe(`event:${id}`);
  });
  it("page", () => {
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "page", pageKey: "promo" })).toBe("page:promo");
  });
  it("whatsapp dengan/tanpa teks", () => {
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "whatsapp", phone: "0812", waText: "" })).toBe("whatsapp:0812");
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "whatsapp", phone: "0812", waText: "Halo & Selamat" })).toBe("whatsapp:0812?text=Halo%20%26%20Selamat");
  });
  it("url https saja", () => {
    expect(buildCtaReference({ ...EMPTY_CTA_FORM, kind: "url", url: "https://x.com" })).toBe("https://x.com".replace("https://x.com", "url:https://x.com"));
  });
});

describe("parseCtaForEdit round-trip", () => {
  it("membalikkan buildCtaReference", () => {
    for (const f of [
      { ...EMPTY_CTA_FORM, kind: "project" as const, slugOrId: "green-valley" },
      { ...EMPTY_CTA_FORM, kind: "page" as const, pageKey: "agen" },
      { ...EMPTY_CTA_FORM, kind: "whatsapp" as const, phone: "0812", waText: "Halo" },
      { ...EMPTY_CTA_FORM, kind: "url" as const, url: "https://x.com" },
    ]) {
      const ref = buildCtaReference(f);
      expect(parseCtaForEdit(ref)).toEqual(f);
    }
  });
  it("kosong atau tidak dikenal -> none", () => {
    expect(parseCtaForEdit(null)).toEqual(EMPTY_CTA_FORM);
    expect(parseCtaForEdit("")).toEqual(EMPTY_CTA_FORM);
    expect(parseCtaForEdit("aneh:tanpa-format")).toEqual(EMPTY_CTA_FORM);
    expect(parseCtaForEdit("page:kunci-tidak-ada")).toEqual(EMPTY_CTA_FORM);
  });
});
