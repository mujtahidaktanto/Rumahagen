import { describe, expect, it } from "vitest";
import { staticContentStatus, validateStaticContentForm, type StaticContentForm } from "./static-content-rules";

const EMPTY: StaticContentForm = { title: "", slug: "", content: "", metaTitle: "", metaDescription: "", canonicalUrl: "", indexability: "index", sitemapParticipation: true, status: "draft" };

describe("validateStaticContentForm", () => {
  it("judul dan slug wajib", () => {
    const errs = validateStaticContentForm(EMPTY);
    expect(errs.title).toBeDefined();
    expect(errs.slug).toBeDefined();
  });
  it("slug hanya huruf kecil/angka/tanda hubung", () => {
    expect(validateStaticContentForm({ ...EMPTY, title: "Judul", slug: "Syarat Ketentuan" }).slug).toBeDefined();
    expect(validateStaticContentForm({ ...EMPTY, title: "Judul", slug: "syarat-ketentuan" }).slug).toBeUndefined();
  });
  it("URL kanonik harus URL lengkap bila diisi", () => {
    expect(validateStaticContentForm({ ...EMPTY, title: "Judul", slug: "halaman", canonicalUrl: "bukan-url" }).canonicalUrl).toBeDefined();
    expect(validateStaticContentForm({ ...EMPTY, title: "Judul", slug: "halaman", canonicalUrl: "https://rumahagen.com/x" }).canonicalUrl).toBeUndefined();
    expect(validateStaticContentForm({ ...EMPTY, title: "Judul", slug: "halaman", canonicalUrl: "" }).canonicalUrl).toBeUndefined();
  });
});

describe("staticContentStatus", () => {
  it("4 nilai CHECK; tak dikenal jatuh ke label apa adanya", () => {
    for (const s of ["draft", "published", "unpublished", "archived"]) expect(staticContentStatus(s).label).not.toBe(s);
    expect(staticContentStatus("aneh").label).toBe("aneh");
  });
});
