import { describe, expect, it } from "vitest";
import { CONTEXT_COOKIE, contextCookieString, contextLabel, resolveContext } from "./context";
import { notificationHref, unreadBadge } from "./notification-link";
import { searchHref } from "./search-scope";

const orgs = [
  { id: "0db7b607-a7fa-41af-adbf-052707bf79fc", name: "Kantor Uji", role: "leader" },
  { id: "fea2e964-628b-4629-a47f-681709197651", name: "Tim BSD", role: "member" },
];

describe("resolveContext", () => {
  it("kosong, personal, asing, atau bukan anggota = Pribadi", () => {
    expect(resolveContext(undefined, orgs)).toEqual({ kind: "personal" });
    expect(resolveContext("personal", orgs)).toEqual({ kind: "personal" });
    expect(resolveContext("bukan-uuid", orgs)).toEqual({ kind: "personal" });
    expect(resolveContext("11111111-1111-1111-1111-111111111111", orgs)).toEqual({ kind: "personal" });
  });
  it("id organisasi yang diikuti = konteks organisasi", () => {
    const c = resolveContext(orgs[1]!.id, orgs);
    expect(c).toEqual({ kind: "org", org: orgs[1] });
    expect(contextLabel(c)).toBe("Tim BSD");
    expect(contextLabel({ kind: "personal" })).toBe("Pribadi");
  });
  it("string cookie", () => {
    expect(contextCookieString("personal")).toBe(`${CONTEXT_COOKIE}=personal; Path=/; Max-Age=31536000; SameSite=Lax`);
  });
});

describe("notifikasi", () => {
  it("tujuan per entitas; entitas tanpa layar = null", () => {
    expect(notificationHref("event", "e1")).toBe("/event/e1");
    expect(notificationHref("listing", "l1")).toBe("/agent/listing/l1");
    expect(notificationHref("certificate", "c1")).toBe("/agent/belajar");
    expect(notificationHref("organization", null)).toBe("/agent/organisasi");
    expect(notificationHref("award", "a1")).toBeNull();
    expect(notificationHref(null, null)).toBeNull();
    expect(notificationHref("event", null)).toBeNull();
  });
  it("lencana", () => {
    expect(unreadBadge(0)).toBe("");
    expect(unreadBadge(7)).toBe("7");
    expect(unreadBadge(100)).toBe("99+");
  });
});

describe("searchHref", () => {
  it("cakupan valid dengan kata kunci", () => {
    expect(searchHref("listing", " rumah bsd ")).toBe("/listing?q=rumah%20bsd");
    expect(searchHref("agen", "Budi")).toBe("/agen?q=Budi");
    expect(searchHref("event", "open house")).toBe("/event?q=open%20house");
  });
  it("kosong atau cakupan asing = null", () => {
    expect(searchHref("listing", "  ")).toBeNull();
    expect(searchHref("proyek", "x")).toBeNull();
  });
});
