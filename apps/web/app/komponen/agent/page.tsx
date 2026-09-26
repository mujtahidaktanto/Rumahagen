// app/komponen/agent/page.tsx — layar Agent dengan DATA CONTOH (bukan database) untuk memeriksa tampilan tanpa login: /komponen/agent?dashboard=normal|kosong|gagal|ktp.
// Sembunyikan di produksi nyata dengan env HIDE_DEV_PAGES=1 (sama seperti /komponen).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardView } from "@/components/agent/DashboardView";
import type { DashboardData } from "@/lib/agent/dashboard-data";

export const metadata: Metadata = { title: "Contoh Layar Agent | RumahAgen", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ dashboard?: string }> };

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

const filled: DashboardData = {
  identityInReview: false,
  stats: { ok: true, data: { activeListings: 18, views: 2140, leads: 9, points: 320 } },
  listings: {
    ok: true,
    data: [
      { id: "1", title: "Rumah Minimalis 2 Lantai — BSD City", status: "published", location: "Tangerang Selatan, Banten", coverUrl: null },
      { id: "2", title: "Ruko 3 Lantai Siap Pakai Dekat Stasiun dengan Judul Sangat Panjang untuk Menguji Pemotongan Teks", status: "pending_review", location: "Bekasi, Jawa Barat", coverUrl: null },
      { id: "3", title: "Apartemen Studio Furnished View Kota", status: "suspended", location: null, coverUrl: null },
    ],
  },
  notifications: {
    ok: true,
    data: {
      unread: 2,
      items: [
        { id: "n1", title: 'Listing "Rumah BSD" mendapat 3 leads baru', message: null, createdAt: ago(12), isRead: false },
        { id: "n2", title: "Verifikasi dokumen sedang ditinjau", message: null, createdAt: ago(75), isRead: false },
        { id: "n3", title: 'Learning Point +20 dari sesi "Negosiasi"', message: null, createdAt: ago(60 * 26), isRead: true },
      ],
    },
  },
};

export default async function SampleAgentPage({ searchParams }: Props) {
  if (process.env.HIDE_DEV_PAGES === "1") notFound();
  const { dashboard = "normal" } = await searchParams;
  const data: DashboardData =
    dashboard === "kosong"
      ? { identityInReview: false, stats: { ok: true, data: { activeListings: 0, views: 0, leads: 0, points: null } }, listings: { ok: true, data: [] }, notifications: { ok: true, data: { unread: 0, items: [] } } }
      : dashboard === "gagal"
        ? { identityInReview: false, stats: { ok: false }, listings: { ok: false }, notifications: { ok: false } }
        : dashboard === "ktp"
          ? { ...filled, identityInReview: true }
          : filled;
  return (
    <div className="min-h-dvh bg-surface">
      <DashboardView name="Rian Saputra" data={data} />
    </div>
  );
}
