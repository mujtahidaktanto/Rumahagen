// components/partner/HasilKemitraanView.tsx — Hasil Kemitraan (M04, wireframe 03-Developer-Partner/M04-Hasil-Kemitraan): catatan hasil pelatihan/kegiatan pembelajaran
// bersama RumahAgen, terpisah dari poin dan sertifikat Learning RumahAgen (partnership_learning_results, migration 0024). Server Component murni — LearningResultFormDialog
// merender tombol pemicunya sendiri, jadi tidak ada prop fungsi yang menyeberang ke Client Component (lihat komentar di dialog itu).
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { BuildingIcon } from "@/components/ui/icons";
import { SUPPORT_EMAIL } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import { LearningResultFormDialog } from "@/components/partner/LearningResultFormDialog";
import type { LearningResultRow } from "@/lib/partner/learning-results-data";
import { validationStatus } from "@/lib/partner/learning-results-rules";
import type { Part } from "@/lib/agent/dashboard-data";
import type { Route } from "next";

export function HasilKemitraanView({ linked, results }: { linked: boolean; results: Part<LearningResultRow[]> }) {
  if (!linked) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
        <h1 className="text-headline">Hasil Kemitraan</h1>
        <div className="flex flex-col items-center gap-3 rounded-md border border-warning-600/30 bg-warning-100 p-8 text-center">
          <BuildingIcon size={28} />
          <span className="text-title-md text-ink-900">Akun Anda belum terhubung ke perusahaan developer</span>
          <p className="text-body-md text-ink-500">Selama belum terhubung, proyek, marketing kit, dan klaim belum bisa dikelola.</p>
          <LinkButton href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Hubungkan akun Developer Partner")}` as Route}>Hubungi Tim RumahAgen</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Hasil Kemitraan</h1>
          <p className="text-body-md text-ink-500">
            Hasil kemitraan dicatat bersama asal data-nya. Validasi dilakukan tim RumahAgen dan tidak bisa Anda ubah. Hasil ini terpisah dari poin dan sertifikat Learning RumahAgen.
          </p>
        </div>
        {results.ok && results.data.length > 0 ? <LearningResultFormDialog /> : null}
      </div>

      {!results.ok ? (
        <ErrorState title="Hasil gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : results.data.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-body-md text-ink-500">Belum ada hasil kemitraan. Catat hasil pelatihan atau kegiatan pembelajaran bersama RumahAgen beserta asal datanya.</p>
          <div className="mt-4 flex justify-center">
            <LearningResultFormDialog />
          </div>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
          {results.data.map((r) => {
            const st = validationStatus(r.validationStatus);
            return (
              <li key={r.id} className="flex flex-col gap-2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-label-lg text-ink-900">{r.resultType}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    {r.resultSummary ? <p className="text-body-md text-ink-700">{r.resultSummary}</p> : null}
                    <p className="text-caption">
                      Asal data: {r.provenanceSource} · Ref {r.provenanceReference} · {formatDateTime(r.createdAt)}
                    </p>
                    {r.sessionId ? <p className="text-caption">Sesi terkait: {r.sessionId}</p> : null}
                  </div>
                  <LearningResultFormDialog result={r} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
