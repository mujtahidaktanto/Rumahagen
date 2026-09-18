# M06 Approval Claim PDF — Runtime Test Protocol

## Scope
Validates the locked M06 Approval Claim / Approval Record physical gap:
1. automatic PDF generation after Claim approval;
2. persistent private storage;
3. View (inline PDF);
4. Download (attachment);
5. immutable DB record;
6. SHA-256 provenance;
7. Agent / Developer Partner / staff access boundary;
8. non-approved claim rejection.

## Prerequisites
- Migration 0097_m06_approval_records.sql applied.
- pdf-lib installed by apps/web/package.json.
- Server environment contains existing Supabase variables and SUPABASE_SERVICE_ROLE_KEY.
- A real M06 project with an Agent claim in pending state.
- A Developer Partner owner or staff reviewer account.

## Happy path

### 1. Approve claim
Use the existing endpoint:
PUT /api/claims/{claim_id}
Body:
{"status":"approved"}
Expected:
- HTTP 200.
- agent_project_claims.status = approved.
- reviewed_by and reviewed_at populated by the existing DB trigger.
- approval_records row exists after the request completes, unless physical storage temporarily failed; View/Download retry generation.

### 2. View PDF
GET /api/claims/{claim_id}/approval-record
Expected:
- HTTP 200.
- Content-Type: application/pdf.
- Content-Disposition: inline.
- Browser/PDF viewer renders the document.
- X-Approval-Record-Id is present.
- X-Approval-Record-SHA256 is a 64-character lowercase hexadecimal hash.

### 3. Download PDF
GET /api/claims/{claim_id}/approval-record/download
Expected:
- HTTP 200.
- Content-Type: application/pdf.
- Content-Disposition: attachment.
- Downloaded bytes are identical to the View response.

### 4. Verify persistence and hash
Run:
SELECT id, claim_id, version, artifact_path, artifact_sha256, mime_type, file_size, generated_at, approved_by FROM public.approval_records WHERE claim_id = '<CLAIM_ID>';
Expected:
- exactly one record for the claim;
- version = 1;
- mime_type = application/pdf;
- file_size > 0;
- SHA-256 is 64 lowercase hexadecimal characters;
- artifact_path = claims/<claim_id>/approval-record-v1.pdf.

### 5. Verify immutability
Attempt an UPDATE or DELETE on public.approval_records.
Expected: database error: approval_records is immutable.

## Authorization tests
Agent owner: View and Download allowed.
Developer Partner owner: View and Download allowed.
Staff with existing M06 claim review authority: View and Download allowed.
Unrelated Agent / Buyer / unrelated Developer: authorization-safe denial; no artifact leakage.

## Negative lifecycle test
For pending, rejected, withdrawn, or revoked claim: GET approval-record must return HTTP 409 and must not generate a PDF.

## Integrity test
Download the PDF and calculate SHA-256 locally. Expected: local_sha256 == approval_records.artifact_sha256.

## Retry test
1. Cause storage generation to fail temporarily.
2. Approve a claim.
3. Confirm Claim remains approved.
4. Restore storage.
5. Call View or Download.
6. Confirm PDF is generated and persisted automatically.
7. Confirm only one approval_records row exists.

## M06 authority invariant
No human Generate permission is introduced.
Approval: Claim approved -> Approval Record automatically generated.
Approved Claim -> Agent-owned M03 Listing remains a separate downstream contract.
M03 remains Listing authority; M10 remains authorization authority.