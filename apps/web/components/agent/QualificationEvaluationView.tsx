// components/agent/QualificationEvaluationView.tsx — Status Evaluasi & Penghargaan (M15, wireframe 01-Agent/36): riwayat evaluasi kualifikasi milik sendiri + penghargaan aktif + ajukan
// banding atas award yang dicabut. Evaluasi/award murni tugas staf/sistem (migration 0128) — layar ini hanya menampilkan hasil dan memfasilitasi banding.
import type { Route } from "next";
import { AppealDialog } from "@/components/agent/AppealDialog";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { TrophyIcon } from "@/components/ui/icons";
import type { QualificationEvaluationPageData } from "@/lib/agent/qualification-data";
import { AWARD_STATUS_LABEL, AWARD_STATUS_TONE, QUALIFICATION_RESULT_LABEL, QUALIFICATION_RESULT_TONE, canAppealAward } from "@/lib/agent/qualification-rules";

const df = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

function evaluatorLabel(evaluatorType: string): string {
  if (evaluatorType === "system_automated") return "Sistem Otomatis";
  if (evaluatorType === "staff") return "Tim RumahAgen";
  if (evaluatorType === "instructor") return "Instruktur Peninjau";
  return evaluatorType;
}

export function QualificationEvaluationView({ data }: { data: QualificationEvaluationPageData }) {
  const { evaluations, awards } = data;

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Status Evaluasi &amp; Penghargaan</h1>
        <LinkButton href={"/agent/kualifikasi" as Route} variant="secondary" size="sm">
          + Ajukan Bukti Baru
        </LinkButton>
      </div>

      <section>
        <h2 className="mb-3 text-title-lg">Riwayat Evaluasi Kualifikasi</h2>
        <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
          {!evaluations.ok ? (
            <ErrorState title="Evaluasi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." className="p-6" />
          ) : evaluations.data.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-5 py-12 text-center">
              <p className="text-body-md text-ink-500">Belum ada evaluasi kualifikasi</p>
              <p className="text-caption">Evaluasi muncul di sini setelah bukti yang Anda ajukan diproses.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ink-50">
                  <th className="px-4 py-2.5 text-left text-label-md text-ink-300">Title/Jalur Dituju</th>
                  <th className="px-4 py-2.5 text-left text-label-md text-ink-300">Hasil</th>
                  <th className="px-4 py-2.5 text-left text-label-md text-ink-300">Dievaluasi Oleh</th>
                  <th className="px-4 py-2.5 text-left text-label-md text-ink-300">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.data.map((ev) => (
                  <tr key={ev.id} className="border-t border-ink-50">
                    <td className="px-4 py-3 text-label-lg">{ev.targetTitleLabel}</td>
                    <td className="px-4 py-3">
                      <Badge tone={QUALIFICATION_RESULT_TONE[ev.result]}>{QUALIFICATION_RESULT_LABEL[ev.result]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-body-md text-ink-500">{evaluatorLabel(ev.evaluatorType)}</td>
                    <td className="px-4 py-3 text-body-md text-ink-500">{df.format(new Date(ev.evaluatedAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-2.5 max-w-[640px] text-caption">
          Kualifikasi bukan otorisasi tambahan — title dan penghargaan di sini murni pengakuan pencapaian, tidak mengubah role atau izin akun Anda di sistem.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-title-lg">Penghargaan Saya</h2>
        {!awards.ok ? (
          <ErrorState title="Penghargaan gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
        ) : awards.data.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-md border border-ink-100 bg-white px-5 py-12 text-center">
            <p className="text-body-md text-ink-500">Belum ada penghargaan aktif</p>
            <p className="text-caption">Lulus evaluasi kualifikasi untuk mendapatkan title/penghargaan pertama Anda.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awards.data.map((a) => (
              <div key={a.id} className="flex flex-col gap-2.5 rounded-md border border-ink-100 bg-white p-5">
                <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                  <TrophyIcon size={20} />
                </span>
                <span className="text-label-lg">{a.titleName}</span>
                <span className="text-caption">
                  Diberikan {df.format(new Date(a.issuedAt))}
                  {a.expiresAt ? ` · berlaku s.d. ${df.format(new Date(a.expiresAt))}` : ""}
                </span>
                <Badge tone={AWARD_STATUS_TONE[a.status]} className="self-start">
                  {AWARD_STATUS_LABEL[a.status]}
                </Badge>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <LinkButton href={"/agent/kualifikasi/presentasi" as Route} variant="secondary" size="sm">
                    Kelola Tampilan di Profil
                  </LinkButton>
                  {canAppealAward(a.status, a.hasPendingAppeal) ? <AppealDialog awardId={a.id} awardTitle={a.titleName} /> : null}
                  {a.status === "revoked" && a.hasPendingAppeal ? <span className="text-caption text-warning-600">Banding menunggu keputusan</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
