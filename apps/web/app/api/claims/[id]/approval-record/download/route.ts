import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { createClient } from "@/lib/supabase/server";
import { ensureApprovalRecord, readApprovalRecordPdf } from "@/lib/pdf/approval-record";
import { ApiError } from "@/lib/api/errors";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data: claim, error } = await supabase
    .from("agent_project_claims").select("id,status")
    .eq("id", ctx.params.id).maybeSingle();

  if (error) throw error;
  if (!claim) throw new ApiError("NOT_FOUND", "Claim tidak ditemukan atau Anda tidak punya akses.");
  if (claim.status !== "approved") throw new ApiError("CONFLICT", "Approval Record belum tersedia karena claim belum approved.");

  await ensureApprovalRecord(ctx.params.id);
  const result = await readApprovalRecordPdf(ctx.params.id);
  if (!result) throw new ApiError("NOT_FOUND", "Approval Record tidak tersedia.");

  return new NextResponse(result.bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="approval-claim-${ctx.params.id}.pdf"`,
      "X-Approval-Record-Id": result.record.id,
      "X-Approval-Record-SHA256": result.record.artifact_sha256,
      "Cache-Control": "private, no-store",
    },
  });
});
