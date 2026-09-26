// components/agent/ClaimsView.tsx — Klaim Proyek (M06, wireframe 01-Agent/M06-Klaim-Proyek): daftar "Proyek yang Saya Klaim" dengan status, aksi menurut status (Batalkan Klaim, Buat Listing dari Proyek, Approval PDF, Marketing
// Kit), dan tautan Jelajahi Proyek Developer (klaim baru diajukan dari halaman detail proyek publik). Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses.
import Link from "next/link";
import type { Route } from "next";
import { ClaimActions } from "@/components/agent/ClaimActions";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { PinIcon } from "@/components/ui/icons";
import type { ClaimsData } from "@/lib/agent/claim-data";
import { claimStatus } from "@/lib/agent/claim-rules";
import { formatDate } from "@/lib/format";

const BROWSE = "/developer" as Route;

export function ClaimsView({ data }: { data: ClaimsData }) {
  const claims = data.claims.ok ? data.claims.data : null;
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Klaim Proyek</h1>
        <LinkButton href={BROWSE} variant="secondary">
          Jelajahi Proyek Developer
        </LinkButton>
      </div>
      <p className="text-body-md text-ink-500">Proyek yang Saya Klaim. Klaim baru diajukan dari halaman detail proyek; setelah disetujui developer, Anda bisa membuat draf listing dari data resmi proyek.</p>

      {!claims ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Klaim gagal dimuat" message="Periksa koneksi Anda lalu coba lagi." />
          <div className="flex justify-center pb-10">
            <LinkButton href={"/agent/klaim" as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : claims.length === 0 ? (
        <div className="rounded-md bg-white">
          <EmptyState title="Belum ada klaim" message="Anda belum mengklaim proyek developer apapun. Klaim proyek dari halaman detail proyek untuk mulai memasarkannya sebagai listing Anda." />
          <div className="flex justify-center pb-10">
            <LinkButton href={BROWSE} size="sm">
              Jelajahi Proyek Developer
            </LinkButton>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {claims.map((c) => {
            const st = claimStatus(c.status);
            return (
              <li key={c.id} className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    {c.projectSlug ? (
                      <Link href={`/project/${c.projectSlug}` as Route} className="text-title-md break-words text-ink-900">
                        {c.projectName}
                      </Link>
                    ) : (
                      <span className="text-title-md break-words text-ink-900">{c.projectName}</span>
                    )}
                    {c.location ? (
                      <span className="flex items-center gap-1.5 text-body-md text-ink-500">
                        <PinIcon size={14} className="flex-none" />
                        <span className="break-words">{c.location}</span>
                      </span>
                    ) : null}
                    <span className="text-caption">
                      {c.kind ? `${c.kind} · ` : ""}Diklaim {formatDate(c.claimedAt)}
                      {c.reviewedAt ? ` · Ditinjau ${formatDate(c.reviewedAt)}` : ""}
                    </span>
                  </div>
                  <Badge tone={st.tone}>{st.label}</Badge>
                </div>
                <ClaimActions claim={c} defaultWhatsapp={data.defaultWhatsapp} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
