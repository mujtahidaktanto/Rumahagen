// lib/partner/claims-rules.ts — aturan murni Review Klaim (M06, wireframe 03-Developer-Partner/M06-Review-Klaim). Label status DIPAKAI ULANG dari lib/agent/claim-rules.ts
// (sama persis, murni tanpa I/O — dipakai juga oleh layar Klaim Proyek Agent dan Dashboard Developer Partner). Developer Partner boleh approve/reject (dari pending)
// dan revoke (dari approved) — TIDAK boleh withdraw (hanya Agent pemilik klaim, trigger trg_project_claim_transition_rules migration 0127).
export { CLAIM_STATUS, claimStatus } from "@/lib/agent/claim-rules";

export const CLAIM_STATUS_FILTERS = ["all", "pending", "approved", "rejected", "revoked", "withdrawn"] as const;
export type ClaimStatusFilter = (typeof CLAIM_STATUS_FILTERS)[number];

export const canApproveOrReject = (status: string) => status === "pending";
export const canRevoke = (status: string) => status === "approved";
export const canShowApprovalPdf = (status: string) => status === "approved";
