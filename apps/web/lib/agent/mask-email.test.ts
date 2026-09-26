import { describe, expect, it } from "vitest";
import { maskEmail } from "./mask-email";

describe("maskEmail", () => {
  it("menyamarkan nama, menyisakan huruf pertama dan domain", () => {
    expect(maskEmail("mujtahid@gmail.com")).toBe("m*****@gmail.com");
    expect(maskEmail("ab@x.id")).toBe("a**@x.id");
  });
  it("kosong atau tidak valid -> null", () => {
    expect(maskEmail(null)).toBeNull();
    expect(maskEmail("bukan-email")).toBeNull();
  });
});
