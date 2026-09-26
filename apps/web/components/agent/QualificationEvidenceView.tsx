// components/agent/QualificationEvidenceView.tsx — Bukti Kualifikasi (M15, wireframe 01-Agent/35-Kualifikasi-Bukti): ajukan bukti kualifikasi milik sendiri (qualification_evidence) dan lihat
// riwayatnya. Evaluasi dan pemberian award murni tugas staf/sistem (migration 0128) — layar ini hanya mengajukan dan menampilkan status, tidak ada aksi mengubah hasil.
import type { Route } from "next";
import { SubmitEvidenceDialog } from "@/components/agent/SubmitEvidenceDialog";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { InfoIcon, SparkleIcon } from "@/components/ui/icons";
import type { QualificationEvidencePageData } from "@/lib/agent/qualification-data";
import { QUALIFICATION_RESULT_LABEL, QUALIFICATION_RESULT_TONE } from "@/lib/agent/qualification-rules";

const df = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

function sourceTypeLabel(sourceType: string): string {
  if (sourceType === "upload") return "Upload manual";
  if (sourceType === "external_link") return "Tautan eksternal";
  if (sourceType === "m04.session_completion_outcomes") return "Dari pembelajaran (otomatis)";
  return sourceType;
}

function ChainStep({ label, done }: { label: string; done: boolean }) {
  return <span className={`rounded-pill px-2.5 py-1 text-[12px] font-bold ${done ? "bg-success-100 text-success-600" : "bg-warning-100 text-warning-600"}`}>{label}</span>;
}

export function QualificationEvidenceView({ userId, data }: { userId: string; data: QualificationEvidencePageData }) {
  const { evidence, titles } = data;

  return (
    <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">Bukti Kualifikasi</h1>
        <div className="flex gap-2.5">
          <LinkButton href={"/agent/kualifikasi/evaluasi" as Route} variant="secondary" size="sm">
            Status Evaluasi &amp; Penghargaan
          </LinkButton>
          {titles.ok ? <SubmitEvidenceDialog userId={userId} titles={titles.data} /> : null}
        </div>
      </div>

      <div className="flex gap-3 rounded-md border border-blue-200 bg-info-100 p-3.5">
        <span className="flex-none text-info-600">
          <InfoIcon size={20} />
        </span>
        <p className="text-body-md">
          Anda hanya <strong>mengajukan bukti</strong>. Evaluasi dilakukan tim RumahAgen atau sistem dan tidak bisa Anda ubah. Kualifikasi bukan otorisasi tambahan — title dan penghargaan murni
          pengakuan pencapaian, tidak mengubah role atau izin akun Anda di sistem.
        </p>
      </div>

      <section className="overflow-hidden rounded-md border border-ink-100 bg-white">
        {!evidence.ok ? (
          <ErrorState title="Bukti gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." className="px-5" />
        ) : evidence.data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <SparkleIcon size={26} />
            </span>
            <p className="text-body-md text-ink-500">Belum ada bukti yang diajukan.</p>
            <p className="max-w-sm text-caption">Ajukan bukti untuk kualifikasi title atau penghargaan. Bukti dari pembelajaran RumahAgen tercatat otomatis.</p>
            {titles.ok ? <SubmitEvidenceDialog userId={userId} titles={titles.data} label="Ajukan Bukti" /> : null}
          </div>
        ) : (
          <ul>
            {evidence.data.map((e) => {
              const result = e.evaluationResult ?? "pending";
              const step2Done = e.evaluationResult !== null && e.evaluationResult !== "pending";
              const step3Done = !!e.awardTitleName;
              return (
                <li key={e.id} className="border-t border-ink-50 first:border-t-0">
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 px-5 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="truncate text-label-lg">{e.targetTitle ?? e.evidenceType}</p>
                        <p className="text-caption">
                          {e.evidenceType} · {sourceTypeLabel(e.sourceType)} · diajukan {df.format(new Date(e.capturedAt))}
                        </p>
                      </div>
                      <Badge tone={QUALIFICATION_RESULT_TONE[result]}>{QUALIFICATION_RESULT_LABEL[result]}</Badge>
                      <span className="text-caption text-blue-600">Lihat jejak</span>
                    </summary>
                    <div className="mx-5 mb-4 flex flex-col gap-2 rounded-sm bg-ink-50 p-3.5">
                      <div className="flex flex-wrap items-center gap-1.5" aria-label="Jejak kualifikasi">
                        <ChainStep label="Bukti" done />
                        <span className="text-ink-200">›</span>
                        <ChainStep label="Evaluasi" done={step2Done} />
                        <span className="text-ink-200">›</span>
                        <ChainStep label="Award" done={step3Done} />
                      </div>
                      <p className="text-caption">
                        Sumber: {e.sourceReference}
                        {e.note ? ` · ${e.note}` : ""}
                      </p>
                      <p className="text-caption">{e.awardTitleName ? `Award: ${e.awardTitleName}` : "Belum ada award. Evaluasi dan award ditentukan tim RumahAgen atau sistem, bukan oleh Anda."}</p>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!titles.ok ? <p className="text-caption text-danger-600">Katalog title gagal dimuat.</p> : null}
    </div>
  );
}
