import { describe, expect, it } from "vitest";
import { AREA_ROLES, areaOf, homePathOf, isRoleCode, ROLE_CODES } from "./roles";
import { safeNext } from "./safe-next";

describe("roles", () => {
  it("memetakan peran ke area", () => {
    expect(areaOf("agent")).toBe("agent");
    expect(areaOf("superadmin")).toBe("admin");
    expect(areaOf("admin")).toBe("admin");
    expect(areaOf("manager")).toBe("admin");
    expect(areaOf("developer_partner")).toBe("partner");
    expect(areaOf("instructor")).toBe("instructor");
    expect(areaOf("buyer")).toBeNull();
  });
  it("beranda peran: area masing-masing, buyer ke /", () => {
    expect(homePathOf("agent")).toBe("/agent");
    expect(homePathOf("manager")).toBe("/admin");
    expect(homePathOf("buyer")).toBe("/");
  });
  it("setiap peran ber-area muncul tepat di satu daftar AREA_ROLES", () => {
    for (const role of ROLE_CODES.filter((r) => r !== "buyer")) {
      const owners = Object.entries(AREA_ROLES).filter(([, roles]) => roles.includes(role));
      expect(owners).toHaveLength(1);
      expect(owners[0]![0]).toBe(areaOf(role));
    }
  });
  it("isRoleCode menolak nilai tak dikenal", () => {
    expect(isRoleCode("agent")).toBe(true);
    expect(isRoleCode("root")).toBe(false);
    expect(isRoleCode(undefined)).toBe(false);
  });
});

describe("safeNext", () => {
  it("menerima jalur relatif", () => {
    expect(safeNext("/agent/listing?tab=1")).toBe("/agent/listing?tab=1");
  });
  it("menolak URL absolut, protocol-relative, dan backslash", () => {
    expect(safeNext("https://jahat.example")).toBe("/portal");
    expect(safeNext("//jahat.example")).toBe("/portal");
    expect(safeNext("/\\jahat.example")).toBe("/portal");
    expect(safeNext("javascript:alert(1)")).toBe("/portal");
  });
  it("menolak jalur dengan karakter baris baru", () => {
    expect(safeNext("/a\r\nSet-Cookie: x=1")).toBe("/portal");
  });
  it("kosong memakai fallback", () => {
    expect(safeNext(null)).toBe("/portal");
    expect(safeNext("", "/x")).toBe("/x");
  });
});
