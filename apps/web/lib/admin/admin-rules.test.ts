import { describe, expect, it } from "vitest";
import {
  canChangeUserRole,
  canEditMatrixColumn,
  canManageAgentActions,
  canManagePreset,
  canPickPresetTargetRole,
  grantedScopeLabel,
  isRowVisibleToManager,
  roleOptionsForChangeRole,
  validateCreateStaff,
} from "./admin-rules";

describe("isRowVisibleToManager", () => {
  it("hanya agent/instructor/buyer/developer_partner", () => {
    for (const r of ["agent", "instructor", "buyer", "developer_partner"]) expect(isRowVisibleToManager(r)).toBe(true);
    for (const r of ["admin", "manager", "superadmin"]) expect(isRowVisibleToManager(r)).toBe(false);
  });
});

describe("canManageAgentActions", () => {
  it("superadmin dan admin saja", () => {
    expect(canManageAgentActions("superadmin")).toBe(true);
    expect(canManageAgentActions("admin")).toBe(true);
    expect(canManageAgentActions("manager")).toBe(false);
  });
});

describe("canChangeUserRole", () => {
  it("superadmin bebas; manager hanya baris agent; admin tidak pernah", () => {
    expect(canChangeUserRole("superadmin", "agent")).toBe(true);
    expect(canChangeUserRole("superadmin", "admin")).toBe(true);
    expect(canChangeUserRole("manager", "agent")).toBe(true);
    expect(canChangeUserRole("manager", "instructor")).toBe(false);
    expect(canChangeUserRole("admin", "agent")).toBe(false);
  });
});

describe("roleOptionsForChangeRole", () => {
  it("superadmin semua role; manager hanya mitra", () => {
    expect(roleOptionsForChangeRole("superadmin")).toContain("superadmin");
    expect(roleOptionsForChangeRole("manager")).toEqual(["instructor", "buyer", "developer_partner"]);
  });
});

describe("canEditMatrixColumn", () => {
  it("superadmin semua kolom; manager hanya kolom agent; admin tidak ada", () => {
    expect(canEditMatrixColumn("superadmin", "manager")).toBe(true);
    expect(canEditMatrixColumn("manager", "agent")).toBe(true);
    expect(canEditMatrixColumn("manager", "manager")).toBe(false);
    expect(canEditMatrixColumn("admin", "agent")).toBe(false);
  });
});

describe("canManagePreset & canPickPresetTargetRole", () => {
  it("superadmin dan manager bisa kelola; hanya superadmin bisa pilih target role lain", () => {
    expect(canManagePreset("superadmin")).toBe(true);
    expect(canManagePreset("manager")).toBe(true);
    expect(canManagePreset("admin")).toBe(false);
    expect(canPickPresetTargetRole("superadmin")).toBe(true);
    expect(canPickPresetTargetRole("manager")).toBe(false);
  });
});

describe("grantedScopeLabel", () => {
  it("all/own/none -> ALL/OWN/NONE", () => {
    expect(grantedScopeLabel("all")).toBe("ALL");
    expect(grantedScopeLabel("own")).toBe("OWN");
    expect(grantedScopeLabel("none")).toBe("NONE");
  });
});

describe("validateCreateStaff", () => {
  it("email valid dan kata sandi minimal 8 karakter", () => {
    expect(validateCreateStaff({ email: "bukan-email", password: "12345678", roleCode: "admin" }).email).toBeTruthy();
    expect(validateCreateStaff({ email: "a@b.com", password: "short", roleCode: "admin" }).password).toBeTruthy();
    expect(validateCreateStaff({ email: "a@b.com", password: "12345678", roleCode: "admin" })).toEqual({});
  });
});
