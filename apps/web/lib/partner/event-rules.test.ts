import { describe, expect, it } from "vitest";
import { canEditPartnerEvent } from "./event-rules";

describe("canEditPartnerEvent", () => {
  it("hanya bisa diubah selagi menunggu persetujuan", () => {
    expect(canEditPartnerEvent("pending_approval")).toBe(true);
    expect(canEditPartnerEvent("published")).toBe(false);
    expect(canEditPartnerEvent("rejected")).toBe(false);
    expect(canEditPartnerEvent("cancelled")).toBe(false);
  });
});
