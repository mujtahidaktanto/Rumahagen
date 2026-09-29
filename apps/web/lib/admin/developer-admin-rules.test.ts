import { describe, expect, it } from "vitest";
import { partnerStatus, projectStatus, unlinkedDeveloperPartnerUsers } from "./developer-admin-rules";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import type { PartnerRow } from "@/lib/admin/developer-admin-data";

describe("status", () => {
  it("proyek: 4 nilai CHECK, tak dikenal apa adanya", () => {
    for (const s of ["active", "coming_soon", "sold_out", "inactive"]) expect(projectStatus(s).label).not.toBe(s);
    expect(projectStatus("x")).toEqual({ label: "x", tone: "neutral" });
  });
  it("partner: 2 nilai", () => {
    expect(partnerStatus("active").tone).toBe("success");
    expect(partnerStatus("inactive").tone).toBe("neutral");
  });
});

describe("unlinkedDeveloperPartnerUsers", () => {
  const u = (id: string, role: string): DirectoryUserRow => ({ id, name: id, email: `${id}@x.com`, roleCode: role, status: "active", createdAt: "", ktpVerified: false });
  const p = (id: string, userId: string | null): PartnerRow => ({ id, companyName: id, picName: null, picContact: null, status: "active", userId, linkedEmail: null });
  it("hanya role developer_partner yang belum tertaut ke perusahaan mana pun", () => {
    const users = [u("u1", "developer_partner"), u("u2", "developer_partner"), u("u3", "agent")];
    const partners = [p("p1", "u1")];
    expect(unlinkedDeveloperPartnerUsers(users, partners).map((x) => x.id)).toEqual(["u2"]);
  });
});
