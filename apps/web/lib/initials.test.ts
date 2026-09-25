import { describe, expect, it } from "vitest";
import { initialsOf } from "./initials";

describe("initialsOf", () => {
  it("memakai huruf pertama kata pertama dan terakhir", () => {
    expect(initialsOf("Rian Saputra")).toBe("RS");
    expect(initialsOf("dewi ayu anggraini")).toBe("DA");
  });
  it("satu kata menghasilkan satu huruf", () => {
    expect(initialsOf("Mujtahid")).toBe("M");
  });
  it("nama kosong atau spasi saja menghasilkan ?", () => {
    expect(initialsOf("")).toBe("?");
    expect(initialsOf("   ")).toBe("?");
  });
  it("mengabaikan spasi berlebih", () => {
    expect(initialsOf("  Budi   Santoso  ")).toBe("BS");
  });
});
