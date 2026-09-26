// components/admin/AwardAppealView.tsx — Banding Penghargaan (M15, wireframe 02-Admin/M15-Award-Appeal): satu daftar, tanpa tab. RLS mengizinkan Superadmin/Admin/Manager melihat SEMUA
// banding lintas agent; keputusan juga hanya scope 'all' (Agent tidak bisa memutuskan bandingnya sendiri, ditegakkan RLS tanpa owner_id).
import { AwardAppealRowActions } from "@/components/admin/AwardAppealRowActions";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { AppealStatus, AwardAppealRow, AwardStatus } from "@/lib/admin/award-appeal-data";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";
import type { Part } from "@/lib/agent/dashboard-data";

const APPEAL_STATUS_LABEL: Record<AppealStatus, string> = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };
const APPEAL_STATUS_TONE: Record<AppealStatus, "warning" | "success" | "danger"> = { pending: "warning", approved: "success", rejected: "danger" };
const AWARD_STATUS_LABEL: Record<AwardStatus, string> = { active: "Aktif", expired: "Kedaluwarsa", revoked: "Dicabut", restored: "Dipulihkan" };
const AWARD_STATUS_TONE: Record<AwardStatus, "success" | "neutral" | "danger" | "info"> = { active: "success", expired: "neutral", revoked: "danger", restored: "info" };

export function AwardAppealView({ viewerRole, appeals }: { viewerRole: AdminViewerRole; appeals: Part<AwardAppealRow[]> }) {
  const canDecideRole = viewerRole === "superadmin" || viewerRole === "admin" || viewerRole === "manager";

  return (
    <div className="flex w-full flex-col gap-4 p-4 lg:p-8">
      <h1 className="text-headline">Banding Penghargaan</h1>
      <p className="text-body-md text-ink-500">
        award_appeals (0098) — hanya untuk award berstatus 'revoked'. Pemilik award TIDAK BISA memutuskan bandingnya sendiri (anti self-approval, ditegakkan RLS tanpa owner_id).
      </p>

      {!appeals.ok ? (
        <ErrorState title="Data banding gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : appeals.data.length === 0 ? (
        <p className="py-16 text-center text-body-md text-ink-300">Tidak ada banding yang menunggu keputusan.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Pemohon Banding</TH>
              <TH>Title Award</TH>
              <TH>Alasan</TH>
              <TH>Status Banding</TH>
              <TH>Status Award</TH>
              <TH>Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {appeals.data.map((a) => (
              <TR key={a.id}>
                <TD className="text-label-lg">{a.appellantName}</TD>
                <TD className="text-body-md">{a.titleName}</TD>
                <TD className="max-w-[240px] truncate text-body-md">{a.reason}</TD>
                <TD>
                  <Badge tone={APPEAL_STATUS_TONE[a.appealStatus]}>{APPEAL_STATUS_LABEL[a.appealStatus]}</Badge>
                </TD>
                <TD>
                  <Badge tone={AWARD_STATUS_TONE[a.awardStatus]}>{AWARD_STATUS_LABEL[a.awardStatus]}</Badge>
                </TD>
                <TD>
                  <AwardAppealRowActions
                    awardId={a.awardId}
                    appealId={a.id}
                    appellantName={a.appellantName}
                    canDecide={canDecideRole && a.appealStatus === "pending"}
                    canRestore={canDecideRole && a.appealStatus === "approved" && a.awardStatus === "revoked"}
                  />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
