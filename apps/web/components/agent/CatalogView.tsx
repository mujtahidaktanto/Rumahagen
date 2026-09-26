// components/agent/CatalogView.tsx — Katalog Komersial (M14, wireframe 01-Agent/M14-Katalog-Komersial): daftar add-on aktif dengan harga dan kapasitas, penjelasan slot listing, beli lewat dialog. Empat keadaan:
// memuat (loading.tsx), kosong, gagal, sukses. Katalog hanya berisi add-on; paket langganan Pro ada di Langganan Saya.
import Link from "next/link";
import type { Route } from "next";
import { CatalogGrid } from "@/components/agent/CatalogGrid";
import { CommercialTabs } from "@/components/agent/CommercialTabs";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { InfoIcon } from "@/components/ui/icons";
import type { CatalogData } from "@/lib/agent/commercial-data";

export function CatalogView({ data }: { data: CatalogData }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <h1 className="text-headline">Komersial</h1>
      <CommercialTabs active="katalog" />

      <p role="note" className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-info-100 p-3.5 text-body-md text-ink-900">
        <InfoIcon size={17} className="mt-0.5 flex-none text-info-600" />
        <span>
          Slot listing menambah kuota penerbitan di atas kuota Gratis dan Pro. Slot dipakai terakhir (setelah Gratis dan Pro), tidak reset, dan tidak kedaluwarsa sebelum dipakai. Tiap slot yang dipakai berlaku 90 hari + 7 hari masa tenggang.{" "}
          <Link href={"/agent/komersial/pesanan" as Route} className="font-bold">
            Lihat kuota saya
          </Link>
        </span>
      </p>

      {!data.addons.ok ? (
        <div className="rounded-md bg-white">
          <ErrorState title="Katalog add-on gagal dimuat" message="Terjadi gangguan saat mengambil katalog. Tidak ada pembelian yang diproses." />
          <div className="flex justify-center pb-10">
            <LinkButton href={"/agent/komersial" as Route} variant="secondary" size="sm">
              Coba Lagi
            </LinkButton>
          </div>
        </div>
      ) : data.addons.data.length === 0 ? (
        <div className="rounded-md bg-white">
          <EmptyState title="Belum ada add-on yang dijual" message="Katalog add-on kosong saat ini. Kuota Gratis dan Pro Anda tetap berlaku; cek lagi nanti." />
          <div className="flex justify-center pb-10">
            <LinkButton href={"/agent/komersial/langganan" as Route} variant="secondary" size="sm">
              Lihat Langganan Saya
            </LinkButton>
          </div>
        </div>
      ) : (
        <CatalogGrid addons={data.addons.data} orgs={data.orgs} defaultOrgId={data.defaultOrgId} />
      )}
    </div>
  );
}
