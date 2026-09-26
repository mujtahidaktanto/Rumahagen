// app/komponen/agent/page.tsx — layar Agent dengan DATA CONTOH (bukan database) untuk memeriksa tampilan tanpa login: /komponen/agent?dashboard=normal|kosong|gagal|ktp dan
// /komponen/agent?layar=profil&profil=terisi|baru&ktp=belum|terverifikasi (menyimpan/verifikasi di sini memanggil API sungguhan dan akan gagal tanpa sesi).
// Sembunyikan di produksi nyata dengan env HIDE_DEV_PAGES=1 (sama seperti /komponen).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardView } from "@/components/agent/DashboardView";
import { KtpCard } from "@/components/agent/KtpCard";
import { ListingWizard } from "@/components/agent/ListingWizard";
import { MyListingDetailView } from "@/components/agent/MyListingDetailView";
import { MyListingsView } from "@/components/agent/MyListingsView";
import { ProfileForm } from "@/components/agent/ProfileForm";
import type { DashboardData } from "@/lib/agent/dashboard-data";
import type { MyListingItem, MyListingsData } from "@/lib/agent/listing-data";
import { EMPTY_WIZARD, WIZARD_STEPS, type StepKey } from "@/lib/agent/listing-wizard";

export const metadata: Metadata = { title: "Contoh Layar Agent | RumahAgen", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ dashboard?: string; layar?: string; profil?: string; ktp?: string; kuota?: string; daftar?: string; status?: string }> };

const bucket = (limit: number, used: number, resets: string | null) => ({ limit, used, remaining: Math.max(0, limit - used), period_start: null, resets_at: resets });
const sampleListings: MyListingItem[] = [
  { id: "l1", title: "Tanah Kavling Siap Bangun 200m² — Cluster Green Valley", status: "draft", location: "Cibubur, Jakarta Timur", priceText: "Rp 850 Jt", viewCount: 12, coverUrl: null, note: { text: "Belum terbit — memakai 1 jatah saat terbit", tone: "normal" } },
  { id: "l2", title: "Ruko 3 Lantai Siap Pakai Dekat Stasiun Commuter Line", status: "pending_review", location: "Bekasi Timur, Jawa Barat", priceText: "Rp 3,2 M", viewCount: 88, coverUrl: null, note: null },
  { id: "l3", title: "Rumah Minimalis 2 Lantai Desain Modern Dekat Sekolah Internasional", status: "published", location: "BSD City, Tangerang Selatan", priceText: "Rp 2,1 M", viewCount: 640, coverUrl: null, note: { text: "Tayang sampai 23 Des 2026 · 61 hari lagi", tone: "normal" } },
  { id: "l4", title: "Apartemen 2BR Full Furnished View Kota", status: "published", location: "Jakarta Selatan", priceText: "Rp 8 Jt/bulan", viewCount: 210, coverUrl: null, note: { text: "Masa tenggang sampai 30 Des 2026 — tetap tampil, lalu kembali ke draf", tone: "warn" } },
];

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
  const { dashboard = "normal", layar, profil = "terisi", ktp = "belum" } = await searchParams;
  if (layar === "profil") {
    const baru = profil === "baru";
    const verified = ktp === "terverifikasi";
    return (
      <div className="min-h-dvh bg-surface">
        <ProfileForm
          exists={!baru}
          initial={{ fullName: "Rian Saputra", whatsapp: baru ? "" : "0812-3456-7890", bio: baru ? "" : "Agen properti berpengalaman 6 tahun dengan fokus di kawasan BSD City dan sekitarnya.", specialization: baru ? [] : ["Rumah Tapak", "Apartemen", "KPR Konsultasi"], coverageArea: baru ? "" : "BSD City & Sekitarnya", licenseNumber: baru ? "" : "AREBI-2024-08123", officeName: "", provinceId: "", cityId: "", profileVisibility: "public", publicCtaEnabled: false }}
          avatarUrl={null}
          publicSlug={baru ? null : "rian-saputra-12345678"}
          soldCount={baru ? 0 : 34}
          rentedCount={baru ? 0 : 12}
          provinceName={null}
          cityName={null}
          organization={baru ? null : { name: "PT Properti Jaya Sejahtera", slug: "kantor-uji-rumahagen" }}
          titles={baru ? [] : [{ name: "Top Performer Regional 2026", kind: "primary" }, { name: "Mentor Komunitas", kind: "additional" }]}
          ktpSlot={<KtpCard state={verified ? "verified" : "deferred"} maskedNik={verified ? "************0001" : null} submittedAt={verified ? "2026-09-25T03:00:00Z" : null} profileExists={!baru} />}
        />
      </div>
    );
  }
  if (layar === "wizard") {
    const sp = await searchParams;
    const l = (sp as { langkah?: string }).langkah;
    const start = (WIZARD_STEPS.map((x) => x.key) as string[]).includes(l ?? "") ? (l as StepKey) : undefined;
    const filled = { ...EMPTY_WIZARD, title: "Rumah Minimalis 2 Lantai BSD City", category: "secondary" as const, transactionType: "sale" as const, address: "Jl. Kenanga Raya No. 12, Cluster Anggrek", propertyType: "rumah", landArea: "150", buildingArea: "120", bedrooms: "3", bathrooms: "2", price: "850.000.000", isNegotiable: true, certificateType: "shm", certificateTransferred: true, photoUrls: ["https://example.com/foto-1.jpg", "https://example.com/foto-2.jpg"], whatsapp: "0812-3456-7890", description: "Rumah minimalis modern 2 lantai, kondisi siap huni." };
    return (
      <div className="min-h-dvh bg-surface">
        <ListingWizard mode={(sp as { mode?: string }).mode === "edit" ? "edit" : "baru"} initial={(sp as { isi?: string }).isi === "0" ? EMPTY_WIZARD : filled} listingId="1a2b3c4d-1111-2222-3333-444455556666" status="draft" startStep={start} />
      </div>
    );
  }
  if (layar === "listing-detail") {
    const { status = "published" } = await searchParams;
    const gagal = (await searchParams).kuota === "gagal";
    const photo = (n: number) => ({ url: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='800' height='500' fill='%23${["dbe7fb", "e3f5ec", "fdeccc"][n % 3]}'/></svg>`)}`, alt: null });
    return (
      <div className="min-h-dvh bg-surface">
        <MyListingDetailView
          data={{
            state: "ok",
            listing: { id: "1a2b3c4d-1111-2222-3333-444455556666", slug: "rumah-minimalis-modern-a1b2c3", title: "Rumah Minimalis 2 Lantai Desain Modern Dekat Sekolah Internasional", status, rejectionReason: status === "rejected" ? "Foto tidak sesuai aturan: memuat watermark pihak lain." : null, transactionType: "sale", category: "secondary", propertyType: "rumah", price: 2100000000, priceUnit: null, isNegotiable: true, address: "Jl. Kenanga Raya No. 12, Cluster Anggrek", location: "Serpong, Tangerang Selatan, Banten", landArea: 150, buildingArea: 120, bedrooms: 3, bathrooms: 2, floors: 2, carportCapacity: 2, certificateType: "shm", description: "Rumah minimalis modern 2 lantai dalam kondisi siap huni, lokasi strategis dekat sekolah internasional dan akses tol. Lingkungan cluster aman dengan keamanan 24 jam.", amenities: ["Carport 2 Mobil", "Keamanan 24 Jam", "Taman"], photos: status === "draft" ? [] : [photo(0), photo(1), photo(2), photo(3)], viewCount: 640, ctaClickCount: 14, lastRefreshedAt: null, publishedAt: status === "draft" ? null : "2026-09-01T03:00:00Z" },
            leads: gagal ? { ok: false } : { ok: true, data: { total: 9, items: [{ id: "a", source: "whatsapp_cta", createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), status: "new" }, { id: "b", source: "whatsapp_cta", createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(), status: "contacted" }, { id: "c", source: "whatsapp_cta", createdAt: new Date(Date.now() - 74 * 3600_000).toISOString(), status: "converted" }] } },
            refresh: gagal ? { ok: false } : { ok: true, data: { allowance: 5, usedToday: 2 } },
          }}
        />
      </div>
    );
  }
  if (layar === "listing") {
    const { kuota = "tersedia", daftar = "isi", status = "semua" } = await searchParams;
    const penuh = kuota === "penuh";
    const pro = kuota === "pro";
    const q: MyListingsData["quota"] = kuota === "gagal" ? { ok: false } : { ok: true, data: { scope: "personal", free: bucket(25, penuh ? 25 : kuota === "hampir" ? 23 : 7, "2026-09-30T17:00:00Z"), pro: { ...bucket(75, pro ? 12 : 0, "2026-10-14T00:00:00Z"), active: pro }, purchased: { balance: penuh ? 0 : pro ? 5 : 0 }, total_remaining: penuh ? 0 : kuota === "hampir" ? 2 : pro ? 81 : 18, validity_days: 90, grace_days: 7 } };
    const list: MyListingsData["list"] = daftar === "gagal" ? { ok: false } : daftar === "kosong" ? { ok: true, data: { items: [], filteredTotal: 0, total: 0, counts: {} } } : { ok: true, data: { items: status === "semua" ? sampleListings : sampleListings.filter((x) => x.status === status), filteredTotal: 47, total: 47, counts: { draft: 4, pending_review: 1, published: 32, sold: 5, rented: 3, expired: 2, rejected: 0, suspended: 0 } } };
    return (
      <div className="min-h-dvh bg-surface">
        <MyListingsView data={{ list, quota: q }} search={{ status: (status as never) ?? "semua", tampil: 12 }} />
      </div>
    );
  }
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
