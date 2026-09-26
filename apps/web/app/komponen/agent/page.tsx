// app/komponen/agent/page.tsx — layar Agent dengan DATA CONTOH (bukan database) untuk memeriksa tampilan tanpa login: /komponen/agent?dashboard=normal|kosong|gagal|ktp dan
// /komponen/agent?layar=belajar&belajar=normal|kosong|gagal (Pembelajaran) dan ?layar=course&course=normal|selesai|tanpa-kuis (Belajar-Course; soal kuis dimuat dari API sungguhan dan gagal tanpa sesi), /komponen/agent?layar=event&event=normal|kosong|gagal (Event Saya) dan ?layar=event-form&mode=baru|belum|tayang|ditolak|batal&pendaftar=normal|kosong|gagal (Ajukan/Kelola Event, kartu Pendaftar; simpan memanggil API sungguhan dan gagal tanpa sesi), /komponen/agent?layar=organisasi&org=tanpa|undangan|gagal|leader|member|closing|ditutup|dibekukan|kuota-gagal, ?layar=org-baru, ?layar=org-anggota&peran=leader|member (Organisasi; aksi memanggil API sungguhan dan gagal tanpa sesi), /komponen/agent?layar=profil&profil=terisi|baru&ktp=belum|terverifikasi (menyimpan/verifikasi di sini memanggil API sungguhan dan akan gagal tanpa sesi).
// Sembunyikan di produksi nyata dengan env HIDE_DEV_PAGES=1 (sama seperti /komponen).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardView } from "@/components/agent/DashboardView";
import { CourseRunner } from "@/components/agent/CourseRunner";
import { EventForm } from "@/components/agent/EventForm";
import { EventRegistrants } from "@/components/agent/EventRegistrants";
import { MyEventsView } from "@/components/agent/MyEventsView";
import { OrgCreateForm } from "@/components/agent/OrgCreateForm";
import { OrgMembersPanel } from "@/components/agent/OrgMembersPanel";
import { OrganizationView } from "@/components/agent/OrganizationView";
import { KtpCard } from "@/components/agent/KtpCard";
import { LearningView } from "@/components/agent/LearningView";
import { ListingWizard } from "@/components/agent/ListingWizard";
import type { ActiveContext, ContextOrg } from "@/lib/agent/context";
import { MyListingDetailView } from "@/components/agent/MyListingDetailView";
import { MyListingsView } from "@/components/agent/MyListingsView";
import { ProfileForm } from "@/components/agent/ProfileForm";
import type { DashboardData } from "@/lib/agent/dashboard-data";
import type { MyEvents, Registrant } from "@/lib/agent/event-data";
import type { MyOrgData, OrgPageData, PendingRequest, RosterMember } from "@/lib/agent/org-data";
import { EMPTY_EVENT, type EventFormValues } from "@/lib/agent/event-rules";
import type { CourseRun, MyLearning } from "@/lib/agent/learning-data";
import type { MyListingItem, MyListingsData } from "@/lib/agent/listing-data";
import { EMPTY_WIZARD, WIZARD_STEPS, type StepKey } from "@/lib/agent/listing-wizard";

export const metadata: Metadata = { title: "Contoh Layar Agent | RumahAgen", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ dashboard?: string; layar?: string; profil?: string; ktp?: string; kuota?: string; daftar?: string; status?: string; belajar?: string; course?: string; event?: string; mode?: string; pendaftar?: string; org?: string; peran?: string; konteks?: string }> };

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

const DEMO_ORGS: ContextOrg[] = [
  { id: "0db7b607-a7fa-41af-adbf-052707bf79fc", name: "PT Properti Jaya Sejahtera", role: "leader" },
  { id: "7d1b1c5e-3d2a-4f0a-9d6b-1f4a8e2c9b10", name: "Sinar Griya Realty", role: "member" },
];

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
          initial={{ fullName: "Rian Saputra", whatsapp: baru ? "" : "0812-3456-7890", bio: baru ? "" : "Agen properti berpengalaman 6 tahun dengan fokus di kawasan BSD City dan sekitarnya.", specialization: baru ? [] : ["Rumah Tapak", "Apartemen", "KPR Konsultasi"], coverageArea: baru ? "" : "BSD City & Sekitarnya", licenseNumber: baru ? "" : "AREBI-2024-08123", officeName: "", provinceId: "", cityId: "", profileVisibility: "public", publicCtaEnabled: false, publicSlug: baru ? "" : "rian-saputra-12345678" }}
          avatarUrl={null}
          publicSlug={baru ? null : "rian-saputra-12345678"}
          slugChangedAt={(ktp === "terverifikasi") ? "2026-09-10T03:00:00Z" : null}
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
  if (layar === "belajar") {
    const { belajar = "normal" } = await searchParams;
    const day = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
    const gagal: MyLearning = { points: { ok: false }, courses: { ok: false }, certificates: { ok: false }, sessions: { ok: false } };
    const kosong: MyLearning = { points: { ok: true, data: 0 }, courses: { ok: true, data: [] }, certificates: { ok: true, data: [] }, sessions: { ok: true, data: [] } };
    const normal: MyLearning = {
      points: { ok: true, data: 320 },
      courses: {
        ok: true,
        data: [
          { enrollmentId: "e1", courseId: "c1", title: "Financial & KPR: Dasar Analisis DBR", category: "financial_kpr", status: "in_progress", progress: 60, lessonCount: 3, completedAt: null },
          { enrollmentId: "e2", courseId: "c2", title: "Sales Skill: Negosiasi Properti Tingkat Lanjut dengan Judul yang Sangat Panjang untuk Menguji Pemotongan Teks", category: "sales_skill", status: "completed", progress: 100, lessonCount: 5, completedAt: day(4) },
          { enrollmentId: "e3", courseId: "c3", title: "Legal & Regulasi: Memahami PPJB", category: "legal_regulasi", status: "in_progress", progress: 20, lessonCount: 4, completedAt: null },
        ],
      },
      certificates: {
        ok: true,
        data: [
          { id: "k1", courseId: "c2", title: "Sales Skill: Negosiasi Properti Tingkat Lanjut", status: "issued", number: "RA-2026-000123", verificationCode: "ABCD1234EFGH", passedAt: day(4), revokedAt: null },
          { id: null, courseId: "c4", title: "Financial & KPR: Dasar Analisis DBR", status: "missing", number: null, verificationCode: null, passedAt: day(16), revokedAt: null },
          { id: "k3", courseId: "c5", title: "Legal & Regulasi: Memahami PPJB", status: "revoked", number: "RA-2026-000077", verificationCode: "ZZZZ9999YYYY", passedAt: day(24), revokedAt: day(6) },
        ],
      },
      sessions: {
        ok: true,
        data: [
          { id: "s1", sessionId: "x1", title: "Sesi Live Q&A: Analisis DBR", status: "active", startAt: new Date(Date.now() + 20 * 86_400_000).toISOString(), endAt: null, completedAt: null },
          { id: "s2", sessionId: "x2", title: "Workshop Negosiasi Batch September", status: "completed", startAt: day(21), endAt: day(21), completedAt: day(21) },
          { id: "s3", sessionId: "x3", title: "Sesi menunggu aktivasi", status: "pending", startAt: null, endAt: null, completedAt: null },
        ],
      },
    };
    return (
      <div className="min-h-dvh bg-surface">
        <LearningView data={belajar === "kosong" ? kosong : belajar === "gagal" ? gagal : normal} />
      </div>
    );
  }
  if (layar === "course") {
    const { course = "normal" } = await searchParams;
    const selesai = course === "selesai";
    const run: CourseRun = {
      enrollmentId: "e1",
      courseId: "c1",
      title: "Financial & KPR: Dasar Analisis DBR",
      passingGrade: 70,
      status: selesai ? "completed" : "in_progress",
      progress: selesai ? 100 : 30,
      lessons: [
        { id: "l1", title: "Pengantar Analisis DBR", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        { id: "l2", title: "Rumus dan Contoh Perhitungan DBR", type: "pdf", url: "https://example.com/dbr.pdf" },
        { id: "l3", title: "Studi Kasus: Menilai Kelayakan KPR (judul panjang untuk menguji pemotongan teks di daftar materi)", type: "slide", url: null },
      ],
      quizzes: course === "tanpa-kuis" ? [] : [{ id: "q1", title: null, passed: selesai }],
      certificateIssued: false,
    };
    return (
      <div className="min-h-dvh bg-surface">
        <CourseRunner run={run} />
      </div>
    );
  }
  if (layar === "event") {
    const { event = "normal" } = await searchParams;
    const day = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
    const gagal: MyEvents = { registrations: { ok: false }, submitted: { ok: false } };
    const kosong: MyEvents = { registrations: { ok: true, data: [] }, submitted: { ok: true, data: [] } };
    const normal: MyEvents = {
      registrations: {
        ok: true,
        data: [
          { id: "r1", eventId: "e1", title: "Open House Perumahan Green Valley", category: "open_house", startAt: day(6), endAt: null, status: "registered", eventStatus: "published" },
          { id: "r2", eventId: "e2", title: "Training Sertifikasi Negosiasi Properti dengan Judul yang Sangat Panjang untuk Menguji Pemotongan Teks di Daftar", category: "training", startAt: day(14), endAt: null, status: "pending_approval", eventStatus: "published" },
          { id: "r3", eventId: "e3", title: "Gathering Komunitas Agen Jabodetabek", category: "gathering", startAt: day(-11), endAt: null, status: "attended", eventStatus: "published" },
          { id: "r4", eventId: "e4", title: "Event yang Tidak Lagi Terlihat", category: null, startAt: null, endAt: null, status: "waitlist", eventStatus: null },
        ],
      },
      submitted: {
        ok: true,
        data: [
          { id: "s1", title: "Sharing Session: Strategi Closing Q4", category: "training", startAt: day(24), status: "published", approvalMode: "auto_confirm" },
          { id: "s2", title: "Workshop Fotografi Properti untuk Listing", category: "training", startAt: day(40), status: "pending_approval", approvalMode: "manual_approval" },
          { id: "s3", title: "Launching Cluster Anggrek", category: "launching_proyek", startAt: day(50), status: "rejected", approvalMode: "closed" },
          { id: "s4", title: "Gathering Akhir Tahun", category: "gathering", startAt: day(80), status: "cancelled", approvalMode: "auto_confirm" },
        ],
      },
    };
    return (
      <div className="min-h-dvh bg-surface">
        <MyEventsView data={event === "kosong" ? kosong : event === "gagal" ? gagal : normal} />
      </div>
    );
  }
  if (layar === "event-form") {
    const { mode = "baru", pendaftar = "normal" } = await searchParams;
    const ago = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
    const rows: Registrant[] = [
      { id: "g1", status: "pending_approval", participantMode: "self", guestEmail: null, registeredAt: ago(1), agentName: "Budi Santoso dengan Nama yang Sangat Panjang untuk Menguji Pemotongan Teks di Baris", agentOffice: "Ray White Kelapa Gading" },
      { id: "g2", status: "pending_approval", participantMode: "self", guestEmail: null, registeredAt: ago(2), agentName: "Sinta Dewi", agentOffice: null },
      { id: "g3", status: "registered", participantMode: "self", guestEmail: null, registeredAt: ago(3), agentName: "Andi Wijaya", agentOffice: "Century 21 Bintaro" },
      { id: "g4", status: "registered", participantMode: "guest", guestEmail: "tamu@contoh.com", registeredAt: ago(3), agentName: "Rian Saputra", agentOffice: null },
      { id: "g5", status: "attended", participantMode: "self", guestEmail: null, registeredAt: ago(9), agentName: "Maya Putri", agentOffice: "RE/MAX Pantai Indah" },
      { id: "g6", status: "cancelled", participantMode: "self", guestEmail: null, registeredAt: ago(5), agentName: "Dodi Prasetyo", agentOffice: null },
    ];
    const registrants = pendaftar === "gagal" ? ({ ok: false } as const) : ({ ok: true, data: pendaftar === "kosong" ? [] : rows } as const);
    const filled: EventFormValues = {
      ...EMPTY_EVENT,
      title: "Sharing Session: Strategi Closing Q4",
      description: "Diskusi santai membahas strategi closing di kuartal akhir tahun, dilengkapi studi kasus nyata dari agent top performer.",
      location: "Kantor RumahAgen, Jakarta Selatan",
      startAt: "2026-10-20T14:00",
      host: "Rian Saputra",
      quota: "50",
      approvalMode: "manual_approval",
    };
    const status = mode === "tayang" ? "published" : mode === "ditolak" ? "rejected" : mode === "batal" ? "cancelled" : "pending_approval";
    const options = { courses: { ok: true as const, data: [{ id: "c1", name: "Financial & KPR: Dasar Analisis DBR" }, { id: "c2", name: "Sales Skill: Negosiasi Properti Tingkat Lanjut" }] }, projects: { ok: true as const, data: [{ id: "p1", name: "Green Valley Residence" }] } };
    return (
      <div className="min-h-dvh bg-surface">
        {mode === "baru" ? (
          <EventForm mode="baru" options={options} />
        ) : (
          <EventForm
            mode="kelola"
            eventId="1a2b3c4d-1111-2222-3333-444455556666"
            status={status}
            initial={filled}
            options={options}
            extra={<EventRegistrants eventId="1a2b3c4d-1111-2222-3333-444455556666" registrants={registrants} startIso={new Date(Date.now() - 3_600_000).toISOString()} quota={50} approvalMode="manual_approval" />}
          />
        )}
      </div>
    );
  }
  if (layar === "organisasi") {
    const { org = "leader" } = await searchParams;
    const at = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
    const inv = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();
    const quota = { ok: true as const, data: { scope: "organization" as const, free: { limit: 50, used: 9, remaining: 41, period_start: null, resets_at: inv(5) }, pro: { limit: 100, used: 0, remaining: 0, period_start: null, resets_at: null, active: false }, purchased: { balance: 0 }, total_remaining: 41, validity_days: 90, grace_days: 7 } };
    const roster: RosterMember[] = [
      { memberId: "m1", agentId: "a1", role: "leader", joinedAt: at(700), name: "Rian Saputra", isSelf: org !== "member" },
      { memberId: "m2", agentId: "a2", role: "member", joinedAt: at(240), name: "Dewi Anggraini", isSelf: org === "member" },
      { memberId: "m3", agentId: "a3", role: "member", joinedAt: at(150), name: "Bambang Sutrisno", isSelf: false },
      { memberId: "m4", agentId: "a4", role: "member", joinedAt: at(60), name: "Siti Rahma", isSelf: false },
    ];
    const status = org === "closing" ? "closing" : org === "ditutup" ? "closed" : org === "dibekukan" ? "suspended" : "active";
    const base: MyOrgData = {
      membershipId: "m1",
      role: org === "member" ? "member" : "leader",
      org: {
        id: "0db7b607-a7fa-41af-adbf-052707bf79fc",
        name: "PT Properti Jaya Sejahtera dengan Nama Organisasi yang Cukup Panjang",
        slug: "properti-jaya",
        type: "kantor",
        status,
        logoUrl: null,
        bannerUrl: null,
        description: "Kantor agen properti di BSD City.",
        website: "https://propertijaya.id",
        social: { instagram: "@propertijaya" },
        address: "Ruko Sunburst CBD, BSD City, Tangerang Selatan",
        phone: "(021) 5551234",
      },
      roster: { ok: true, data: roster },
      pendingCount: org === "member" ? null : { ok: true, data: 2 },
      listingCount: { ok: true, data: 12 },
      quota: org === "kuota-gagal" ? { ok: false } : quota,
    };
    const data: OrgPageData =
      org === "gagal"
        ? { state: "error" }
        : org === "tanpa"
          ? { state: "no_org", invitations: { ok: true, data: [] } }
          : org === "undangan"
            ? {
                state: "no_org",
                invitations: {
                  ok: true,
                  data: [
                    { id: "i1", organizationId: "o1", organizationName: "Kantor Properti Nusantara", organizationType: "kantor", leaderName: "Dewi Anggraini", createdAt: at(3), expiresAt: inv(4), isExpired: false },
                    { id: "i2", organizationId: "o2", organizationName: "Tim Broker BSD dengan Nama yang Sangat Panjang untuk Menguji Pemotongan Teks", organizationType: "tim", leaderName: "Rian Saputra", createdAt: at(16), expiresAt: at(9), isExpired: true },
                  ],
                },
              }
            : { state: "org", ...base };
    return (
      <div className="min-h-dvh bg-surface">
        <OrganizationView data={data} maskedEmail="m*****@gmail.com" />
      </div>
    );
  }
  if (layar === "org-baru") {
    return (
      <div className="min-h-dvh bg-surface">
        <OrgCreateForm />
      </div>
    );
  }
  if (layar === "org-anggota") {
    const { peran = "leader" } = await searchParams;
    const at = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
    const roster: RosterMember[] = [
      { memberId: "m1", agentId: "a1", role: "leader", joinedAt: at(700), name: "Rian Saputra", isSelf: peran !== "member" },
      { memberId: "m2", agentId: "a2", role: "member", joinedAt: at(240), name: "Dewi Anggraini", isSelf: peran === "member" },
      { memberId: "m3", agentId: "a3", role: "member", joinedAt: at(150), name: "Bambang Sutrisno", isSelf: false },
    ];
    const pending: PendingRequest[] = [
      { id: "p1", kind: "agent_request", createdAt: at(2), expiresAt: null, isExpired: false, agentName: "Fajar Nugroho", agentOffice: "Ray White Kelapa Gading" },
      { id: "p2", kind: "agent_request", createdAt: at(5), expiresAt: null, isExpired: false, agentName: "Maya Kusuma", agentOffice: null },
      { id: "p3", kind: "leader_invite", createdAt: at(1), expiresAt: new Date(Date.now() + 6 * 86_400_000).toISOString(), isExpired: false, agentName: "Andi Saputra", agentOffice: null },
      { id: "p4", kind: "leader_invite", createdAt: at(12), expiresAt: at(5), isExpired: true, agentName: "Lestari Wulan", agentOffice: null },
    ];
    return (
      <div className="min-h-dvh bg-surface">
        <OrgMembersPanel orgId="0db7b607-a7fa-41af-adbf-052707bf79fc" orgName="PT Properti Jaya Sejahtera" role={peran === "member" ? "member" : "leader"} status="active" roster={{ ok: true, data: roster }} pending={peran === "member" ? null : { ok: true, data: pending }} />
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
        <ListingWizard mode={(sp as { mode?: string }).mode === "edit" ? "edit" : "baru"} initial={(sp as { isi?: string }).isi === "0" ? EMPTY_WIZARD : filled} listingId="1a2b3c4d-1111-2222-3333-444455556666" status="draft" startStep={start} orgs={DEMO_ORGS} />
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
    const { kuota = "tersedia", daftar = "isi", status = "semua", konteks } = await searchParams;
    const orgCtx: ActiveContext = konteks === "org" ? { kind: "org", org: DEMO_ORGS[0]! } : { kind: "personal" };
    const penuh = kuota === "penuh";
    const pro = kuota === "pro";
    const q: MyListingsData["quota"] = kuota === "gagal" ? { ok: false } : { ok: true, data: { scope: "personal", free: bucket(25, penuh ? 25 : kuota === "hampir" ? 23 : 7, "2026-09-30T17:00:00Z"), pro: { ...bucket(75, pro ? 12 : 0, "2026-10-14T00:00:00Z"), active: pro }, purchased: { balance: penuh ? 0 : pro ? 5 : 0 }, total_remaining: penuh ? 0 : kuota === "hampir" ? 2 : pro ? 81 : 18, validity_days: 90, grace_days: 7 } };
    const list: MyListingsData["list"] = daftar === "gagal" ? { ok: false } : daftar === "kosong" ? { ok: true, data: { items: [], filteredTotal: 0, total: 0, counts: {} } } : { ok: true, data: { items: status === "semua" ? sampleListings : sampleListings.filter((x) => x.status === status), filteredTotal: 47, total: 47, counts: { draft: 4, pending_review: 1, published: 32, sold: 5, rented: 3, expired: 2, rejected: 0, suspended: 0 } } };
    return (
      <div className="min-h-dvh bg-surface">
        <MyListingsView data={{ list, quota: q }} search={{ status: (status as never) ?? "semua", tampil: 12 }} context={orgCtx} />
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
