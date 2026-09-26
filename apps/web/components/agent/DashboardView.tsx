// components/agent/DashboardView.tsx — isi Dashboard Agent (M08 Dashboard, wireframe 01-Agent/M08-Dashboard): spanduk verifikasi identitas (informasi saja), 4 angka bulan ini,
// 4 pintasan, Listing Terbaru, dan Notifikasi. Tiap widget punya keadaan sukses/kosong/gagal sendiri (data dimuat per bagian, lihat lib/agent/dashboard-data.ts); keadaan memuat = app/agent/loading.tsx.
// Pintasan ke layar yang belum dibangun (Fase 3 lanjutan dan Fase 4) tampil sebagai kartu nonaktif "Segera hadir" sampai halamannya ada (ubah `href` di QUICK_ACTIONS).
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ListingStatusBadge } from "@/components/ui/StatusBadge";
import { BuildingIcon, ChartIcon, DocIcon, InfoIcon, TrophyIcon } from "@/components/ui/icons";
import { relativeTimeId, type DashboardData, type Part } from "@/lib/agent/dashboard-data";
import { listingPhotoUrl } from "@/lib/media/variants";

const nf = new Intl.NumberFormat("id-ID");

function Tile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="flex flex-col gap-1 p-5">
      <span className="text-caption">{label}</span>
      <span className="text-headline">{value}</span>
      {hint ? <span className="text-caption">{hint}</span> : null}
    </Card>
  );
}

const QUICK_ACTIONS: { title: string; note: string; icon: ReactNode; href: string | null }[] = [
  { title: "Kalkulator DBR", note: "Cek kelayakan KPR prospek", icon: <DocIcon size={20} />, href: "/agent/dbr" },
  { title: "Klaim Proyek", note: "Proyek developer & marketing kit", icon: <BuildingIcon size={20} />, href: "/agent/klaim" },
  { title: "Kualifikasi & Penghargaan", note: "Ajukan bukti, cek status, kelola title", icon: <TrophyIcon size={20} />, href: "/agent/kualifikasi" },
  { title: "Statistik Saya", note: "Performa listing, lead, dan kuota", icon: <ChartIcon size={20} />, href: "/agent/statistik" },
];

function QuickAction({ a }: { a: (typeof QUICK_ACTIONS)[number] }) {
  const body = (
    <>
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-sm bg-blue-50 text-blue-600">{a.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-label-lg text-ink-900">{a.title}</span>
        <span className="block text-caption">{a.note}</span>
        {a.href ? null : (
          <Badge tone="neutral" dot={false} className="mt-1.5">
            Segera hadir
          </Badge>
        )}
      </span>
    </>
  );
  return a.href ? (
    <Link href={a.href as Route} className="flex min-h-[76px] items-center gap-3 rounded-md border border-ink-100 bg-white p-4 text-inherit no-underline hover:shadow-2 hover:no-underline">
      {body}
    </Link>
  ) : (
    <div aria-disabled="true" className="flex min-h-[76px] items-center gap-3 rounded-md border border-ink-100 bg-white p-4 opacity-70">
      {body}
    </div>
  );
}

function Widget({ title, action, count, children }: { title: string; action?: ReactNode; count?: string; children: ReactNode }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
        <h2 className="text-title-md">{title}</h2>
        {action ?? (count ? <span className="text-caption">{count}</span> : null)}
      </div>
      {children}
    </Card>
  );
}

function whenOk<T>(p: Part<T>): T | null {
  return p.ok ? p.data : null;
}

export function DashboardView({ name, data }: { name: string; data: DashboardData }) {
  const stats = whenOk(data.stats);
  const listings = whenOk(data.listings);
  const notes = whenOk(data.notifications);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <div>
        <h1 className="text-headline">Dashboard</h1>
        <p className="text-body-md text-ink-500">Halo, {name}. {data.scope.kind === "org_leader" ? `Ringkasan bulan ini untuk organisasi ${data.scope.label}.` : "Ringkasan aktivitas Anda bulan ini."}</p>
        {data.scope.kind === "personal" ? null : (
          <p role="note" className="text-caption">
            Konteks: <strong className="text-ink-900">{data.scope.label}</strong>
            {data.scope.kind === "org_leader" ? " — angka dan listing seluruh organisasi (listing pribadi anggota tidak dihitung). Ganti konteks lewat pengalih di bilah atas." : " — Listing Terbaru menampilkan listing Anda di organisasi ini; angka di atas tetap angka pribadi Anda karena statistik organisasi hanya untuk pemimpin."}
          </p>
        )}
      </div>

      {data.identityInReview ? (
        <div role="status" className="flex items-start gap-3 rounded-md border border-blue-200 bg-info-100 p-4">
          <InfoIcon size={18} className="mt-0.5 flex-none text-info-600" />
          <div className="min-w-0 flex-1">
            <p className="text-label-lg text-ink-900">Verifikasi identitas Anda sedang ditinjau</p>
            <p className="text-body-md text-ink-700">
              Ini sekadar informasi — seluruh fitur tetap dapat Anda pakai seperti biasa, termasuk membuat dan mempublikasikan listing baru. Estimasi peninjauan 1×24 jam kerja.
            </p>
          </div>
          <Badge tone="info">submitted</Badge>
        </div>
      ) : null}

      <section aria-label="Ringkasan bulan ini">
        {data.stats.ok ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile label="Total Listing Aktif" value={nf.format(stats!.activeListings)} />
            <Tile label="Dilihat Bulan Ini" value={nf.format(stats!.views)} />
            <Tile label="Leads Baru" value={nf.format(stats!.leads)} hint="Klik WhatsApp bulan ini" />
            <Tile label="Learning Points" value={stats!.points === null ? "—" : nf.format(stats!.points)} />
          </div>
        ) : (
          <Card>
            <ErrorState title="Ringkasan gagal dimuat" message="Terjadi gangguan saat mengambil angka Anda. Muat ulang halaman beberapa saat lagi." className="py-8" />
          </Card>
        )}
      </section>

      <section aria-label="Pintasan" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <QuickAction key={a.title} a={a} />
        ))}
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Widget title="Listing Terbaru" action={<span className="text-caption">3 terakhir</span>}>
          {!data.listings.ok ? (
            <ErrorState title="Listing gagal dimuat" message="Muat ulang halaman beberapa saat lagi." className="py-8" />
          ) : listings!.length === 0 ? (
            <EmptyState title="Belum ada listing" message="Listing yang Anda buat akan tampil di sini." className="py-8" />
          ) : (
            <ul>
              {listings!.map((l) => (
                <li key={l.id} className="flex items-center gap-3 border-b border-ink-50 px-5 py-3 last:border-b-0">
                  {l.coverUrl ? (
                    // Foto sampul dari data (URL tersimpan); gambar biasa tanpa optimasi Next.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={listingPhotoUrl(l.coverUrl, "sm") ?? l.coverUrl} alt="" className="h-11 w-14 flex-none rounded-sm bg-ink-100 object-cover" />
                  ) : (
                    <span aria-hidden="true" className="flex h-11 w-14 flex-none items-center justify-center rounded-sm bg-ink-100 text-ink-300">
                      <BuildingIcon size={18} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label-lg text-ink-900">{l.title}</span>
                    {l.location ? <span className="block truncate text-caption">{l.location}</span> : null}
                  </span>
                  <ListingStatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </Widget>

        <Widget title="Notifikasi" count={notes && notes.unread > 0 ? `${nf.format(notes.unread)} belum dibaca` : undefined}>
          {!data.notifications.ok ? (
            <ErrorState title="Notifikasi gagal dimuat" message="Muat ulang halaman beberapa saat lagi." className="py-8" />
          ) : notes!.items.length === 0 ? (
            <EmptyState title="Belum ada notifikasi" message="Aktivitas listing dan akun akan muncul di sini." className="py-8" />
          ) : (
            <ul>
              {notes!.items.map((n) => (
                <li key={n.id} className="flex items-start gap-3 border-b border-ink-50 px-5 py-3 last:border-b-0">
                  <span aria-hidden="true" className={`mt-1.5 h-2 w-2 flex-none rounded-full ${n.isRead ? "bg-transparent" : "bg-blue-600"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-md text-ink-900 break-words">{n.title}</span>
                    <span className="block text-caption">{relativeTimeId(n.createdAt)}</span>
                    {!n.isRead ? <span className="sr-only">Belum dibaca</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Widget>
      </div>
    </div>
  );
}
