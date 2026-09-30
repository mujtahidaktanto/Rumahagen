import { describe, expect, it } from "vitest";
import { kitTypeLabel, validateKitFile } from "./marketing-kit-rules";

describe("kitTypeLabel", () => {
  it("2 nilai CHECK; tak dikenal jatuh ke label apa adanya", () => {
    expect(kitTypeLabel("brochure")).not.toBe("brochure");
    expect(kitTypeLabel("price_list")).not.toBe("price_list");
    expect(kitTypeLabel("aneh")).toBe("aneh");
  });
});

describe("validateKitFile", () => {
  it("hanya PDF", () => {
    expect(validateKitFile({ type: "application/pdf", size: 1000 })).toBeNull();
    expect(validateKitFile({ type: "image/png", size: 1000 })).toBeDefined();
  });
  it("maksimal 20 MB", () => {
    expect(validateKitFile({ type: "application/pdf", size: 20 * 1024 * 1024 })).toBeNull();
    expect(validateKitFile({ type: "application/pdf", size: 21 * 1024 * 1024 })).toBeDefined();
  });
});
