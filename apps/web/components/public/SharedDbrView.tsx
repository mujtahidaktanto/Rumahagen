// components/public/SharedDbrView.tsx — halaman hasil simulasi DBR yang dibagikan agen kepada prospek (M07; tanpa login, tautan berupa token acak). Hanya menampilkan hasil, bank, plafon, tenor, dan bunga;
// penghasilan, cicilan berjalan, nomor telepon, dan identitas agen TIDAK pernah dikirim ke halaman ini (pemilihan bidang di lib/agent/dbr-data.ts getSharedDbr).
import { DbrResultCard } from "@/components/agent/DbrResultCard";
import { InfoIcon } from "@/components/ui/icons";
import type { SharedDbr } from "@/lib/agent/dbr-data";

export function SharedDbrView({ data }: { data: SharedDbr }) {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-4 py-8 lg:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-caption">Simulasi Kelayakan KPR</p>
        <h1 className="text-headline break-words">{data.prospectName ? `Hasil Simulasi untuk ${data.prospectName}` : "Hasil Simulasi DBR"}</h1>
      </header>
      <DbrResultCard result={data} />
      <p role="note" className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-info-100 p-3.5 text-body-md text-ink-900">
        <InfoIcon size={17} className="mt-0.5 flex-none text-info-600" />
        <span>Ini simulasi indikatif berdasarkan data yang diberikan kepada agen Anda, bukan keputusan atau janji persetujuan dari bank. Hasil akhir mengikuti penilaian bank. Tautan ini dapat dicabut oleh agen kapan saja.</span>
      </p>
    </main>
  );
}
