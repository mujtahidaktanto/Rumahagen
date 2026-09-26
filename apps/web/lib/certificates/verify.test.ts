import { describe, expect, it } from "vitest";
import { organizerLabel } from "./verify";

describe("organizerLabel", () => {
  it("memetakan jenis penyelenggara yang dikenal", () => {
    expect(organizerLabel("rumahagen")).toBe("RumahAgen");
    expect(organizerLabel("partner")).toBe("Mitra RumahAgen");
    expect(organizerLabel("instructor")).toBe("Instruktur");
  });
  it("kosong atau tak dikenal -> null", () => {
    expect(organizerLabel(null)).toBeNull();
    expect(organizerLabel("lainnya")).toBeNull();
  });
});
