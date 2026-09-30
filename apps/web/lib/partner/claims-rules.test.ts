import { describe, expect, it } from "vitest";
import { canApproveOrReject, canRevoke, canShowApprovalPdf } from "./claims-rules";

describe("aksi klaim per status", () => {
  it("approve/reject hanya dari pending", () => {
    expect(canApproveOrReject("pending")).toBe(true);
    expect(canApproveOrReject("approved")).toBe(false);
  });
  it("revoke hanya dari approved", () => {
    expect(canRevoke("approved")).toBe(true);
    expect(canRevoke("pending")).toBe(false);
  });
  it("approval PDF hanya untuk approved", () => {
    expect(canShowApprovalPdf("approved")).toBe(true);
    expect(canShowApprovalPdf("revoked")).toBe(false);
  });
});
