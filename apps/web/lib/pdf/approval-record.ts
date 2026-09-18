import { PDFDocument, StandardFonts } from "pdf-lib";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ApprovalRecordResult {
  id: string;
  claim_id: string;
  artifact_path: string;
  artifact_sha256: string;
  file_size: number;
  generated_at: string;
}

type Snapshot = {
  claim: {
    id: string; agent_id: string; project_id: string; status: string;
    reviewed_by: string | null; reviewed_at: string | null; claimed_at: string;
  };
  project: {
    id: string; name: string; slug: string; meta_title: string | null;
    meta_description: string | null; status: string; location: string | null;
    category: string; transaction_type: string; developer_id: string;
  };
  developer: { company_name: string; pic_name: string | null };
  agent: { id: string; email: string };
};

async function loadSnapshot(claimId: string): Promise<Snapshot> {
  const admin = createAdminClient();
  const { data: claim, error: claimError } = await admin
    .from("agent_project_claims")
    .select("id,agent_id,project_id,status,reviewed_by,reviewed_at,claimed_at")
    .eq("id", claimId).maybeSingle();
  if (claimError) throw claimError;
  if (!claim || claim.status !== "approved") {
    throw new Error("Approval Record hanya dapat dibuat untuk claim approved.");
  }

  const { data: project, error: projectError } = await admin
    .from("developer_projects")
    .select("id,name,slug,meta_title,meta_description,status,location,category,transaction_type,developer_id")
    .eq("id", claim.project_id).maybeSingle();
  if (projectError) throw projectError;
  if (!project) throw new Error("Developer Project tidak ditemukan.");

  const { data: developer, error: developerError } = await admin
    .from("developer_partners")
    .select("company_name,pic_name")
    .eq("id", project.developer_id).maybeSingle();
  if (developerError) throw developerError;
  if (!developer) throw new Error("Developer Partner tidak ditemukan.");

  const { data: authUser, error: authError } = await admin.auth.admin.getUserById(claim.agent_id);
  if (authError) throw authError;
  if (!authUser.user) throw new Error("Agent tidak ditemukan.");

  return {
    claim,
    project,
    developer,
    agent: { id: claim.agent_id, email: authUser.user.email ?? "" },
  };
}

function safeText(value: string | null | undefined) {
  return (value ?? "-").replace(/[\r\n]+/g, " ").slice(0, 105);
}

async function buildPdf(snapshot: Snapshot, generatedAt: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([595.28, 841.89]);
  const margin = 48;
  let y = 790;

  const draw = (value: string, size = 10, font = regular) => {
    page.drawText(safeText(value), { x: margin, y, size, font });
    y -= size + 8;
  };
  const heading = (value: string) => { y -= 4; draw(value, 12, bold); };

  draw("RUMAHAGEN", 20, bold);
  draw("APPROVAL CLAIM / APPROVAL RECORD", 14, bold);
  draw("Dokumen bukti persetujuan klaim Developer Project.");
  heading("CLAIM");
  draw(`Claim ID: ${snapshot.claim.id}`);
  draw("Status: APPROVED");
  draw(`Claimed At: ${snapshot.claim.claimed_at}`);
  draw(`Approved At: ${snapshot.claim.reviewed_at ?? generatedAt}`);
  draw(`Approved By: ${snapshot.claim.reviewed_by ?? "-"}`);
  heading("AGENT");
  draw(`Agent ID: ${snapshot.agent.id}`);
  draw(`Email: ${snapshot.agent.email || "-"}`);
  heading("DEVELOPER PROJECT");
  draw(`Project ID: ${snapshot.project.id}`);
  draw(`Project: ${snapshot.project.name}`);
  draw(`Slug: ${snapshot.project.slug}`);
  draw(`Developer: ${snapshot.developer.company_name}`);
  draw(`PIC: ${snapshot.developer.pic_name ?? "-"}`);
  draw(`Location: ${snapshot.project.location ?? "-"}`);
  draw(`Category: ${snapshot.project.category}`);
  draw(`Transaction: ${snapshot.project.transaction_type}`);
  draw(`Project Status: ${snapshot.project.status}`);
  draw(`Meta Title: ${snapshot.project.meta_title ?? "-"}`);
  draw(`Meta Description: ${snapshot.project.meta_description ?? "-"}`);
  heading("ARTIFACT");
  draw(`Generated At: ${generatedAt}`);
  draw("Immutable Approval Record generated automatically as a consequence of Claim approval.");
  draw("This record does not grant ordinary Listing Create, Update, Publish, or Refresh authority.");
  return pdf.save();
}

export async function ensureApprovalRecord(claimId: string): Promise<ApprovalRecordResult> {
  const admin = createAdminClient();
  const { data: existing, error: existingError } = await admin
    .from("approval_records")
    .select("id,claim_id,artifact_path,artifact_sha256,file_size,generated_at")
    .eq("claim_id", claimId).maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    const { data: object, error } = await admin.storage
      .from("approval-records").download(existing.artifact_path);
    if (error) throw error;
    if (!object) throw new Error("Approval Record metadata exists but PDF object is missing.");
    return existing as ApprovalRecordResult;
  }

  const snapshot = await loadSnapshot(claimId);
  // Use the authoritative approval timestamp so concurrent retries generate identical bytes.
  const generatedAt = snapshot.claim.reviewed_at ?? new Date().toISOString();
  const bytes = await buildPdf(snapshot, generatedAt);
  const hash = crypto.createHash("sha256").update(bytes).digest("hex");
  const path = `claims/${claimId}/approval-record-v1.pdf`;

  const { error: uploadError } = await admin.storage
    .from("approval-records")
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (uploadError && !/already exists/i.test(uploadError.message)) throw uploadError;

  const { data: record, error: insertError } = await admin
    .from("approval_records")
    .insert({
      claim_id: claimId, version: 1, artifact_path: path,
      artifact_sha256: hash, mime_type: "application/pdf",
      file_size: bytes.length, generated_at: generatedAt,
      approved_by: snapshot.claim.reviewed_by,
    })
    .select("id,claim_id,artifact_path,artifact_sha256,file_size,generated_at")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: raced, error: raceError } = await admin
        .from("approval_records")
        .select("id,claim_id,artifact_path,artifact_sha256,file_size,generated_at")
        .eq("claim_id", claimId).single();
      if (!raceError && raced) return raced as ApprovalRecordResult;
    }
    throw insertError;
  }
  return record as ApprovalRecordResult;
}

export async function readApprovalRecordPdf(claimId: string) {
  const admin = createAdminClient();
  const { data: record, error } = await admin
    .from("approval_records")
    .select("id,claim_id,artifact_path,artifact_sha256,file_size,generated_at")
    .eq("claim_id", claimId).maybeSingle();
  if (error) throw error;
  if (!record) return null;

  const { data: file, error: fileError } = await admin.storage
    .from("approval-records").download(record.artifact_path);
  if (fileError) throw fileError;
  if (!file) throw new Error("Approval Record PDF tidak ditemukan di storage.");

  return { record: record as ApprovalRecordResult, bytes: Buffer.from(await file.arrayBuffer()) };
}
