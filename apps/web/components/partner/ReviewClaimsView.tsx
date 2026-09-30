"use client";

// components/partner/ReviewClaimsView.tsx — Review Klaim (M06, wireframe 03-Developer-Partner/M06-Review-Klaim): klaim Agent atas proyek milik sendiri, lintas proyek
// (RPC partner_incoming_claims). Menyetujui klaim hanya mengizinkan Agent membuat listing draft dari proyek ini; listing itu dimiliki dan dikelola Agent, bukan mitra
// (PRE-00-H §19, ditegaskan di banner). Kontak Agent (WhatsApp + email) ditampilkan apa adanya sesuai keputusan produk 2026-09-25 (migration 0147) — BUKAN dibatasi
// "hanya nama dan profil publik" seperti draf lama wireframe (mengikuti keputusan produk yang lebih baru, bukan teks wireframe).
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { BuildingIcon, UserIcon } from "@/components/ui/icons";
import { formatDateTime, whatsappUrl } from "@/lib/format";
import { SUPPORT_EMAIL } from "@/lib/config";
import type { IncomingClaimRow } from "@/lib/partner/claims-data";
import type { ProjectOption } from "@/lib/partner/marketing-kit-data";
import { CLAIM_STATUS_FILTERS, canApproveOrReject, canRevoke, canShowApprovalPdf, claimStatus, type ClaimStatusFilter } from "@/lib/partner/claims-rules";
import { ApiClientError, api } from "@/lib/api-client";
import type { Part } from "@/lib/agent/dashboard-data";

const FILTER_LABEL: Record<ClaimStatusFilter, string> = { all: "Semua", pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak", revoked: "Dicabut", withdrawn: "Ditarik" };

export function ReviewClaimsView({
  linked,
  projects,
  claims,
  projectFilter,
  initialStatus,
}: {
  linked: boolean;
  projects: ProjectOption[];
  claims: Part<IncomingClaimRow[]>;
  projectFilter: string | null;
  initialStatus: ClaimStatusFilter;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ClaimStatusFilter>(initialStatus);

  if (!linked) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
        <h1 className="text-headline">Klaim Masuk</h1>
        <div className="flex flex-col items-center gap-3 rounded-md border border-warning-600/30 bg-warning-100 p-8 text-center">
          <BuildingIcon size={28} />
          <span className="text-title-md text-ink-900">Akun Anda belum terhubung ke perusahaan developer</span>
          <p className="text-body-md text-ink-500">Selama belum terhubung, proyek, marketing kit, dan klaim belum bisa dikelola.</p>
          <LinkButton href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Hubungkan akun Developer Partner")}` as Route}>Hubungi Tim RumahAgen</LinkButton>
        </div>
      </div>
    );
  }

  const all = claims.ok ? claims.data : [];
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const f of CLAIM_STATUS_FILTERS) if (f !== "all") c[f] = all.filter((r) => r.status === f).length;
    return c;
  }, [all]);
  const filtered = statusFilter === "all" ? all : all.filter((r) => r.status === statusFilter);

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <h1 className="text-headline">Klaim Masuk</h1>
      <p className="rounded-md border border-blue-200 bg-info-100 p-3.5 text-body-md text-ink-700">
        Menyetujui klaim hanya mengizinkan agen membuat <strong>listing draft</strong> dari proyek Anda; listing itu dimiliki dan dikelola agen, bukan Anda.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CLAIM_STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`rounded-pill border px-3.5 py-1.5 text-[13px] font-bold ${statusFilter === f ? "border-blue-600 bg-blue-50 text-blue-700" : "border-ink-100 bg-white text-ink-500"}`}
            >
              {FILTER_LABEL[f]} ({counts[f] ?? 0})
            </button>
          ))}
        </div>
        {projects.length > 0 ? (
          <Select
            value={projectFilter ?? ""}
            onChange={(e) => router.push((e.target.value ? `/partner/klaim?proyek=${e.target.value}` : "/partner/klaim") as Route)}
            className="max-w-[220px]"
          >
            <option value="">Semua proyek</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        ) : null}
      </div>

      {!claims.ok ? (
        <ErrorState title="Klaim gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : all.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-body-md text-ink-500">Belum ada klaim masuk. Klaim muncul di sini setelah agen mengklaim proyek Anda.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-body-md text-ink-500">Tidak ada klaim pada filter ini. Pilih status atau proyek lain.</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
          {filtered.map((c) => (
            <ClaimRow key={c.claimId} claim={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ClaimRow({ claim }: { claim: IncomingClaimRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"rejected" | "revoked" | null>(null);
  const st = claimStatus(claim.status);
  const wa = whatsappUrl(claim.agentWhatsapp);

  async function setStatus(status: "approved" | "rejected" | "revoked") {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/claims/${claim.claimId}`, { status }, { idempotency: true });
      setConfirm(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal memproses klaim. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-col gap-2.5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UserIcon size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-label-lg text-ink-900">{claim.agentName ?? "Agent"}</span>
              {claim.agentPublicSlug ? (
                <a href={`/agen/${claim.agentPublicSlug}`} target="_blank" rel="noreferrer" className="text-caption text-blue-600">
                  Profil publik
                </a>
              ) : null}
            </div>
            <div className="text-caption">
              {wa ? (
                <a href={wa} target="_blank" rel="noreferrer" className="text-success-600">
                  WhatsApp {claim.agentWhatsapp}
                </a>
              ) : null}
              {wa && claim.agentEmail ? " · " : ""}
              {claim.agentEmail ?? ""}
            </div>
            <div className="text-caption">
              {claim.projectName} · Diklaim {formatDateTime(claim.claimedAt)}
            </div>
          </div>
        </div>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {canApproveOrReject(claim.status) ? (
          <>
            <Button size="sm" loading={busy} onClick={() => void setStatus("approved")}>
              Setujui
            </Button>
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => setConfirm("rejected")}>
              Tolak
            </Button>
          </>
        ) : null}
        {canShowApprovalPdf(claim.status) ? (
          <a
            href={`/api/claims/${claim.claimId}/approval-pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-pill border-[1.5px] border-ink-100 px-4 text-[13px] font-bold text-blue-600 hover:border-blue-500"
          >
            Approval PDF
          </a>
        ) : null}
        {canRevoke(claim.status) ? (
          <Button variant="secondary" size="sm" className="text-danger-600" disabled={busy} onClick={() => setConfirm("revoked")}>
            Cabut
          </Button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      <Dialog
        open={!!confirm}
        onClose={() => (busy ? undefined : setConfirm(null))}
        title={confirm === "rejected" ? "Tolak klaim ini?" : "Cabut klaim yang sudah disetujui?"}
        description={
          confirm === "rejected"
            ? `Klaim ${claim.agentName ?? "agen ini"} atas ${claim.projectName} akan ditolak.`
            : `Klaim ${claim.agentName ?? "agen ini"} atas ${claim.projectName} akan dicabut. Listing draft yang sudah dibuat agen tidak ikut terhapus.`
        }
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setConfirm(null)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void setStatus(confirm as "rejected" | "revoked")}>
              {confirm === "rejected" ? "Ya, Tolak" : "Ya, Cabut"}
            </Button>
          </>
        }
      />
    </li>
  );
}
