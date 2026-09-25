"use client";

// components/dev/ComponentGallery.tsx — halaman contoh Fase 1: semua komponen dasar, tipografi, dan palet dalam satu layar (uji Desktop dan Mobile).
import { useState } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button, IconButton, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { PropertyCard } from "@/components/public/PropertyCard";
import type { FeaturedListing } from "@/lib/public/home-data";

// Contoh data (bukan dari database): jual dengan kamar, sewa dengan judul sangat panjang (terpotong), tanah tanpa kamar dan tanpa lokasi.
const base = { price_unit: null, bedrooms: null, bathrooms: null, land_area: null, building_area: null, cityName: null, provinceName: null, coverUrl: null, coverAlt: null };
const SAMPLE_LISTINGS: FeaturedListing[] = [
  { ...base, id: "1", slug: "rumah-minimalis", title: "Rumah Minimalis Modern 2 Lantai", transaction_type: "sale", price: 850000000, bedrooms: 3, bathrooms: 2, building_area: 120, cityName: "Kabupaten Bogor", provinceName: "Jawa Barat" },
  { ...base, id: "2", slug: "apartemen", title: "Apartemen Strategis Full Furnished Dekat Stasiun MRT dan Pusat Perbelanjaan Kelas Atas", transaction_type: "rent", price: 5000000, price_unit: "per_bulan", bedrooms: 2, bathrooms: 1, building_area: 60, cityName: "Kota Administrasi Jakarta Selatan", provinceName: "DKI Jakarta" },
  { ...base, id: "3", slug: "tanah", title: "Tanah Kavling Siap Bangun", transaction_type: "sale", price: 1200000000, land_area: 300 },
];

const tones: BadgeTone[] = ["neutral", "warning", "success", "danger", "info"];
const swatches: [string, string][] = [
  ["bg-blue-900", "blue-900"], ["bg-blue-700", "blue-700"], ["bg-blue-600", "blue-600"], ["bg-blue-500", "blue-500"], ["bg-blue-200", "blue-200"], ["bg-blue-100", "blue-100"],
  ["bg-gold-700", "gold-700"], ["bg-gold-600", "gold-600"], ["bg-gold-500", "gold-500"], ["bg-gold-200", "gold-200"], ["bg-gold-100", "gold-100"],
  ["bg-ink-900", "ink-900"], ["bg-ink-700", "ink-700"], ["bg-ink-500", "ink-500"], ["bg-ink-300", "ink-300"], ["bg-ink-200", "ink-200"], ["bg-ink-100", "ink-100"], ["bg-ink-50", "ink-50"],
  ["bg-success-600", "success-600"], ["bg-warning-600", "warning-600"], ["bg-danger-600", "danger-600"], ["bg-info-600", "info-600"],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title-lg">{title}</h2>
      {children}
    </section>
  );
}

export function ComponentGallery() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, setState] = useState<"memuat" | "kosong" | "gagal">("memuat");
  const [saving, setSaving] = useState(false);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-8 lg:px-10">
      <header className="flex flex-col gap-3">
        <Logo height={40} className="self-start" />
        <h1 className="text-display">Komponen dasar RumahAgen</h1>
        <p className="text-body-lg text-ink-500">Halaman contoh Fase 1. Token dari <code>tokens.css</code>, Tailwind v4 (<code>@theme</code>), font Plus Jakarta Sans.</p>
      </header>

      <Section title="Tipografi">
        <Card className="flex flex-col gap-2 p-5">
          <p className="text-display">Display 32 / 800</p>
          <p className="text-headline">Headline 24 / 700</p>
          <p className="text-title-lg">Title Large 20 / 700</p>
          <p className="text-title-md">Title Medium 16 / 600</p>
          <p className="text-body-lg">Body Large 16 / 400 — teks isi utama.</p>
          <p className="text-body-md">Body Medium 14 / 400 — teks isi kompak.</p>
          <p className="text-label-lg">Label Large 14 / 600</p>
          <p className="text-label-md uppercase">Label Medium 12 / 700</p>
          <p className="text-caption">Caption 12 / 400 — keterangan kecil.</p>
        </Card>
      </Section>

      <Section title="Palet warna (hanya dari katalog desain)">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {swatches.map(([cls, name]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <div className={`h-12 rounded-sm border border-ink-100 ${cls}`} />
              <span className="text-caption">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tombol">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Nonaktif</Button>
          <Button
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1500);
            }}
          >
            {saving ? "Menyimpan…" : "Simpan (uji memproses)"}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Kecil</Button>
          <Button size="sm" variant="secondary">Kecil secondary</Button>
          <LinkButton href="/komponen/shell" variant="secondary">Lihat kerangka aplikasi</LinkButton>
          <IconButton label="Menu"><MenuIcon /></IconButton>
          <IconButton label="Tutup"><CloseIcon /></IconButton>
        </div>
      </Section>

      <Section title="Lencana status">
        <div className="flex flex-wrap gap-2">
          {tones.map((t) => (
            <Badge key={t} tone={t}>{t}</Badge>
          ))}
          <Badge tone="success" dot={false}>tanpa titik</Badge>
        </div>
      </Section>

      <Section title="Bidang formulir">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Email" hint="Gunakan email aktif." required>
            {(a) => <Input type="email" placeholder="nama@email.com" {...a} />}
          </Field>
          <Field label="Kata sandi" error="Kata sandi harus memuat minimal 1 huruf besar." required>
            {(a) => <Input type="password" defaultValue="rumahagen1" {...a} />}
          </Field>
          <Field label="Deskripsi" className="lg:col-span-2">
            {(a) => <Textarea placeholder="Ceritakan tentang listing Anda…" {...a} />}
          </Field>
        </div>
      </Section>

      <Section title="Keadaan data: memuat, kosong, gagal">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih keadaan">
          {(["memuat", "kosong", "gagal"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={state === s}
              onClick={() => setState(s)}
              className="h-10 rounded-pill border-[1.5px] border-ink-100 bg-white px-4 text-[13px] font-bold text-ink-700 aria-pressed:border-blue-600 aria-pressed:bg-blue-600 aria-pressed:text-white"
            >
              {s}
            </button>
          ))}
        </div>
        <Card>
          {state === "memuat" ? (
            <LoadingRegion className="flex flex-col gap-3 p-4">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </LoadingRegion>
          ) : null}
          {state === "kosong" ? <EmptyState title="Belum ada listing" message="Buat listing pertama Anda agar tampil di sini." action={<Button size="sm">Buat listing</Button>} /> : null}
          {state === "gagal" ? <ErrorState message="Terjadi gangguan saat mengambil data. Tidak ada yang berubah." onRetry={() => setState("memuat")} /> : null}
        </Card>
      </Section>

      <Section title="Tabel">
        <Table>
          <THead>
            <TR>
              <TH>Nama</TH>
              <TH>Kota</TH>
              <TH>Status</TH>
              <TH>Harga</TH>
            </TR>
          </THead>
          <TBody>
            <TR><TD>Rumah Minimalis Modern 2 Lantai</TD><TD>Kota Bandung</TD><TD><Badge tone="success">Terbit</Badge></TD><TD>Rp 850.000.000</TD></TR>
            <TR><TD>Ruko Sunburst CBD</TD><TD>Kabupaten Tangerang</TD><TD><Badge tone="warning">Menunggu</Badge></TD><TD>Rp 2.100.000.000</TD></TR>
            <TR><TD>Apartemen Studio</TD><TD>Kota Administrasi Jakarta Selatan</TD><TD><Badge tone="neutral">Draf</Badge></TD><TD>Rp 640.000.000</TD></TR>
          </TBody>
        </Table>
      </Section>

      <Section title="Kartu properti (publik)">
        <ul className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 xl:grid-cols-4">
          {SAMPLE_LISTINGS.map((p) => (
            <li key={p.id} className="flex">
              <div className="flex w-full flex-col [&>a]:h-full">
                <PropertyCard listing={p} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Dialog">
        <div>
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>Buka dialog</Button>
        </div>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Arsipkan listing?"
          description="Listing tidak lagi tampil untuk umum. Anda bisa mengaktifkannya kembali kapan saja."
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button variant="danger" onClick={() => setDialogOpen(false)}>Arsipkan</Button>
            </>
          }
        />
      </Section>
    </div>
  );
}
