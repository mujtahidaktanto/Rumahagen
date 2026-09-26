# RumahAgen — Frontend Handoff Brief (Claude Design + Claude Code)

> **Untuk siapa:** Claude Code (implementasi) dan Claude Design (canvas wireframe).
> **Taruh di repo:** `docs/frontend/FRONTEND_HANDOFF.md`. Rujuk dari `CLAUDE.md` di root agar selalu dibaca.
> **Tanggal baseline:** 2026-09-25 (repo `github.com/mujtahidaktanto/Rumahagen` cabang `main`, Supabase `jawywzavznjekxxlhwqo`, migration terakhir 0152).
> **Pemilik produk:** Mujtahid Aktanto.

---

## 1. Keputusan

Frontend RumahAgen **dibangun di repo ini** (`apps/web`, Next.js 15 + React 19). **Tidak memakai Bolt.**
Claude Design dipakai untuk desain dan wireframe, Claude Code untuk menulis kode produksi.

Alasan singkat:

1. Backend sudah matang: **281 API route** di `apps/web/app/api`, dengan validasi Zod, idempotency, rate limit, audit log, cek permission, dan harga pesanan dihitung di server. UI yang memanggil Supabase langsung dari browser (pola default Bolt) akan melewati semua lapisan ini.
2. Wireframe v2 **sudah ada di Claude Design** (180 layar, 90 Desktop + 90 Mobile) dan sudah dicocokkan ke skema Supabase live. Format `.dc.html` tidak bisa dibaca Bolt.
3. Repo berisi ±2.558 file (mayoritas dokumen governance). Bolt membaca seluruh codebase di setiap prompt, sehingga boros token dan rawan kena batas "project too large".

---

## 2. Kondisi saat ini (hasil deep scan)

### Repo

| Area | Status |
|---|---|
| Framework | Next.js 15, React 19, TypeScript, `@supabase/ssr`, Zod, pdf-lib, sharp, qrcode |
| Root app | `apps/web` (Vercel Root Directory = `apps/web`, npm) |
| API | 281 route handler, semua lewat `withApiHandler` (`lib/api/handler.ts`) |
| Halaman UI | Hanya 3: `/` (scaffold), `/verifikasi`, `/verifikasi/[code]` |
| Komponen bersama | `packages/ui` masih kosong (README saja) |
| Middleware | `middleware.ts` menangani pengalihan URL dari tabel `url_redirects` |
| Wireframe v2 | `docs/design/wireframes-v2/` (arsip ekspor; sumber kebenaran = canvas hidup) |
| Wireframe lama | `docs/design/wireframes/` WF-00–WF-11 (PNG statis, **usang**, jangan dipakai sebagai acuan utama) |
| Deploy | Belum ada proyek Vercel. Panduan: `docs/deployment/VERCEL_STAGING.md` |

### Database Supabase

- 110 tabel, 235 RLS policy, 183 fungsi, 102 trigger, 5 bucket storage (`approval-records`, `project-media` publik, `marketing-kits`, `agent-ktp`, `certificate-assets`).
- 7 role: superadmin, admin, manager, agent, developer_partner, instructor, buyer (buyer tidak punya persona UI; dianggap Publik/Agent).

### Temuan keamanan yang HARUS ditutup sebelum frontend dibuka ke internet

| Temuan (Supabase Security Advisor) | Jumlah | Tindakan |
|---|---|---|
| Fungsi `SECURITY DEFINER` bisa dipanggil role **anon** via `/rest/v1/rpc/*` | 67 | Revoke `EXECUTE` dari `anon` (dan `public`) kecuali yang memang publik. Termasuk `create_notification`, `log_audit_event`, `check_and_increment_rate_limit`, `adjust_learning_points` |
| Fungsi `SECURITY DEFINER` bisa dipanggil **authenticated** | 96 | Audit satu per satu; revoke yang hanya dipakai trigger/route server |
| View `SECURITY DEFINER`: `public_agent_profiles` | 1 (ERROR) | Pastikan hanya kolom publik yang terekspos, atau ubah ke `security_invoker` |
| `search_path` mutable pada fungsi | 12 | Set `search_path` eksplisit |
| Leaked password protection mati | 1 | Aktifkan di Supabase Auth |

Migration **0146** (keamanan RPC anon) disebut di `VERCEL_STAGING.md` tersimpan di `git stash@{0}` di komputer lokal (termasuk berkas untracked `0146_...sql` dan `lib/api/audit.ts`). Urutan wajib: pulihkan stash → uji → commit & push kode → deploy → baru terapkan migration 0146.

Rencana rinci Fase 0 (klasifikasi 67 fungsi anon, temuan tambahan, urutan) ada di [`audit/FASE0_SECURITY_PLAN.md`](../../audit/FASE0_SECURITY_PLAN.md). Angka Advisor di tabel di atas diverifikasi ulang 2026-09-25 (67, 96, 12, 1, 1).

---

## 3. Aturan arsitektur frontend (WAJIB untuk Claude Code)

1. **Semua mutasi lewat `/api/*`.** Jangan pernah `insert/update/delete/rpc` ke Supabase dari komponen browser. `lib/supabase/client.ts` hanya boleh dipakai untuk hal yang benar-benar butuh browser (mis. listener sesi auth, upload ke signed URL yang diberikan API).
2. **Pembacaan data** untuk halaman app (Agent/Admin/Partner/Instructor) juga lewat `/api/*`. Halaman publik SEO (M11) boleh dirender di server, tetapi **memakai ulang fungsi query di `lib/`**, bukan menulis ulang logika.
3. **Kontrak response** (jangan dikarang ulang):
   - Sukses: `{ data: T, meta?: { pagination?, traceId } }`
   - Galat: `{ error: { code, message, details? } }` dengan `code` ∈ `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `VALIDATION_ERROR` 422, `CONFLICT` 409, `RATE_LIMITED` 429 (hormati `Retry-After`), `IDEMPOTENCY_MISMATCH` 409, `INTERNAL_ERROR` 500.
4. **Idempotency:** setiap `POST`/`PATCH` yang mengubah uang, kuota, poin, atau status mengirim header `Idempotency-Key: <uuid>`. Buat UUID sekali per aksi pengguna (bukan per retry).
5. **Auth:** sesi berbasis cookie `@supabase/ssr`. Login lewat `POST /api/auth/login`; logout `POST /api/auth/logout`. Proteksi halaman per persona di layout grup route (cek sesi + role di server), tetapi **otorisasi final tetap di API/RLS**. UI hanya menyembunyikan, bukan mengamankan.
6. **Satu API client bertipe** di `apps/web/lib/api-client/` (fetch wrapper yang: mengirim cookie, memetakan envelope `data`/`error`, menangani 401 → redirect login, 429 → pesan tunggu, dan menyisipkan `Idempotency-Key`).
7. **Setiap layar punya 4 keadaan:** memuat, kosong, gagal (dengan tombol Coba Lagi), sukses. Ini sudah digambar di wireframe v2 — ikuti.
8. **Tidak ada status, field, atau warna karangan.** Badge status harus sama persis dengan CHECK constraint tabel; warna/tipografi dari `tokens.css`.
9. **Bahasa UI:** Bahasa Indonesia. Teks di `.dc.html` adalah placeholder, strukturnya yang mengikat.
10. **Aksesibilitas:** target sentuh ≥44px di mobile, dialog `role="dialog"`, saklar `aria-checked`, bisa dipakai keyboard.
11. **Jangan ubah migration atau API** saat mengerjakan UI. Kalau ada celah backend, catat di `audit/` dan minta keputusan dulu.

### Struktur folder yang disarankan

```
apps/web/app/
├── (publik)/            # M11 Homepage, Discovery, Detail-*, Konten, Promo, M04 Verifikasi
├── (auth)/              # M01 Login, Register, OTP, Recovery
├── (agent)/             # shell nav rail 8 item + Context Switcher (STEP13-E §4.2)
├── (admin)/             # shell capability-driven (STEP13-E §4.3)
├── (partner)/           # Developer Partner, nav 7 tujuan
├── (instructor)/        # nav 6 item
└── notifikasi/          # M08 Pusat Notifikasi (semua peran)
packages/ui/             # komponen bersama + tokens (Button, Badge status, Card, Dialog, Table, EmptyState, ErrorState, Skeleton, NavRail, Drawer)
```

### Design tokens

- Sumber: `docs/design/wireframes-v2/tokens.css` (prefix `--ra-*`), font tunggal **Plus Jakarta Sans**.
- Warna inti: biru `--ra-blue-600 #1652C4` (kepercayaan), emas `--ra-gold-600 #E08E1D` (kemitraan), status success/warning/danger/neutral/info.
- Breakpoint wireframe: Desktop 1440×900, Mobile 390×844. Desktop dan Mobile harus punya fungsi identik, hanya tata letak berbeda.
- Rekomendasi: salin `tokens.css` ke `packages/ui`, lalu petakan ke Tailwind v4 `@theme` (atau CSS Modules bila tidak ingin Tailwind). Putuskan sekali di Fase 0.

---

## 4. Alur kerja Claude Design ↔ Claude Code

```
Claude Design (canvas)                    Claude Code (repo)
──────────────────────                    ──────────────────
1. Rapikan Design System   ──/design-sync──▶ packages/ui (tokens + komponen)
2. Pilih 1 modul / layar   ──handoff──────▶ halaman di apps/web/app/(persona)/...
3. Review hasil di Vercel Preview ◀──push branch── PR per modul
4. Revisi di canvas bila perlu, ulangi 2–3
```

- **Satu PR = satu modul atau satu kelompok layar.** Jangan handoff 180 layar sekaligus.
- Setelah komponen di `packages/ui` berubah, jalankan ulang `/design-sync` agar canvas memakai komponen terbaru (sinkronisasi tidak otomatis).
- Vercel Preview per branch menggantikan fitur "preview instan" Bolt.
- Setiap kali canvas diubah, ekspor ulang ke `docs/design/wireframes-v2/` agar arsip di git tidak ketinggalan.

---

## 5. Rencana fase

| Fase | Isi | Selesai bila |
|---|---|---|
| **0. Gerbang** | Tutup temuan keamanan §2 (migration 0146 dkk.), aktifkan leaked password protection, buat proyek Vercel staging dengan Deployment Protection | Security Advisor tanpa ERROR; tidak ada RPC sensitif untuk anon |
| **1. Fondasi UI** | `packages/ui`: tokens, 10–12 komponen dasar, badge status sesuai CHECK constraint; `lib/api-client`; layout grup route + guard sesi/role | Halaman contoh memakai semua komponen di Desktop & Mobile |
| **2. Auth + Publik** | M01 Login/Register/OTP/Recovery/Akun-Dibatasi; M11 Homepage, Discovery, Detail-Listing, Detail-Agen/Organisasi/Developer-Project/Event/Learning, Konten, Promo | Bisa daftar, login, cari listing, buka detail; SEO (metadata, sitemap) jalan |
| **3. Agent inti** | M08 Dashboard, M02 Profil-Saya (+KTP), M03 Listing-Saya/Wizard/Detail, M12 Organisasi, M04 Pembelajaran/Belajar-Course, M05 Event | Agent bisa buat & terbitkan listing end-to-end di staging |
| **4. Agent lanjutan** | M06 Klaim-Proyek, M07 DBR, M13 Koneksi-AI/Assistant, M14 Katalog/Pesanan/Langganan (Midtrans sandbox), M15 Evidence/Evaluasi/Title, M08 Statistik | Pembelian add-on sukses lewat Midtrans sandbox + webhook |
| **5. Admin** | 27 layar `02-Admin` (M03, M04, M06, M07, M09, M10, M11, M13, M14, M15) | Superadmin bisa moderasi listing, kelola katalog, lihat analytics |
| **6. Partner + Instructor + Notifikasi** | `03-Developer-Partner` (9), `04-Instructor` (10), `06-Bersama` Pusat Notifikasi | Semua persona punya shell lengkap |
| **7. Pengerasan** | Uji aksesibilitas, performa (Core Web Vitals halaman publik), cron snapshot analytics, domain & email | Siap produksi |

---

## 6. Prompt siap pakai

### 6a. Untuk Claude Code — sesi pertama (Fase 0 + 1)

```
Baca docs/frontend/FRONTEND_HANDOFF.md, docs/design/wireframes-v2/README.md,
docs/design/wireframes-v2/MODULES.md, docs/deployment/VERCEL_STAGING.md,
apps/web/lib/api/*.ts. Jangan baca docs/core/ kecuali perlu rujukan pasal.

Tugas:
1. Periksa Supabase Security Advisor proyek jawywzavznjekxxlhwqo. Susun rencana
   migration untuk menutup fungsi SECURITY DEFINER yang bisa dipanggil anon,
   view public_agent_profiles, dan search_path mutable. Tunjukkan rencananya
   dulu, jangan terapkan sebelum saya setujui.
2. Setelah disetujui: buat packages/ui dari tokens.css (Plus Jakarta Sans),
   komponen dasar (Button, Badge status, Card, Dialog, Table, Skeleton,
   EmptyState, ErrorState, NavRail, Drawer), dan lib/api-client bertipe sesuai
   kontrak §3 (envelope data/error, Idempotency-Key, 401/429).
3. Buat layout grup route (publik), (auth), (agent), (admin), (partner),
   (instructor) dengan guard sesi+role di server.
Patuhi semua aturan §3. Satu branch, satu PR.
```

### 6b. Untuk Claude Code — per modul (ulangi tiap fase)

```
Implementasikan layar [NAMA LAYAR, mis. 01-Agent/M03-Listing-Saya] dari handoff
Claude Design (Desktop + Mobile). Gunakan hanya komponen packages/ui dan
lib/api-client. Cari route API yang sesuai di apps/web/app/api (jangan membuat
API baru). Wajib 4 keadaan: memuat, kosong, gagal, sukses. Badge status harus
sama dengan CHECK constraint tabel terkait. Jika ada data yang dibutuhkan layar
tapi tidak disediakan API, BERHENTI dan catat sebagai celah di
audit/FRONTEND_GAPS.md. Buat PR dengan screenshot Desktop dan Mobile.
```

### 6c. Untuk Claude Design — persiapan handoff

```
Ini canvas wireframe RumahAgen (180 layar). Sebelum handoff ke Claude Code:
1. Pastikan Design System memakai token --ra-* dari tokens.css dan font Plus
   Jakarta Sans; tidak ada warna atau status di luar katalog badge.
2. Pastikan tiap layar yang akan di-handoff punya varian Desktop 1440 dan
   Mobile 390 dengan fungsi identik, serta keadaan memuat/kosong/gagal.
3. Tambahkan anotasi di canvas: nama route API yang dipakai tiap aksi
   (mis. "Simpan → PATCH /api/listings/{id}") dan persona yang boleh melihat.
4. Handoff per modul, dimulai dari: Design System → 00-Publik M01 (auth) →
   00-Publik M11 → 01-Agent M08 Dashboard → M03 Listing.
Jangan ubah struktur data, field, atau status yang sudah dicocokkan ke skema
Supabase; hanya perbaiki tata letak dan kejelasan visual.
```

---

## 6d. Keputusan struktur dan kemajuan Fase 1 (diperbarui 2026-09-25)

- **Komponen di `apps/web/components` (bukan `packages/ui`)**, tanpa npm workspaces. Rincian struktur ada di `CLAUDE.md`. Bagian 3 dan 5 di atas yang menyebut `packages/ui` dibaca sebagai `apps/web/components/ui`.
- **Selesai:** Tailwind v4 dengan token `@theme` (`app/globals.css`), font Plus Jakarta Sans (`next/font`), komponen dasar (Button/LinkButton/IconButton, Badge, Card, Field/Input/Textarea, Dialog, Table, Skeleton/LoadingRegion, EmptyState/ErrorState), `AppShell` (rel dapat disembunyikan + laci mobile), `lib/api-client` bertipe (envelope, Idempotency-Key, 401, 429 + Retry-After, galat jaringan) dengan 12 uji Vitest, galeri `/komponen` dan `/komponen/shell`.
- **Selesai juga (2026-09-25):** penjaga sesi dan peran di server + kerangka persona. URL: `/login` (grup `(auth)`), `/portal` (titik masuk: alihkan menurut peran), `/agent`, `/admin`, `/partner`, `/instructor` (tiap area punya `layout.tsx` yang memanggil `PersonaShell` -> `requireArea(area)`; `lib/auth/{roles,session,safe-next}.ts`). Middleware menyegarkan sesi Supabase untuk jalur aplikasi dan menambah header `x-pathname`. Aturan: belum login -> `/login?next=`; akun tidak aktif -> `/login?alasan=dibatasi`; peran salah area -> beranda area perannya (bukan 403). Peran dibaca lewat RPC `current_role_code()` (tabel `roles` hanya terbaca pemegang izin `m10.role_catalogue.view`). Uji ujung-ke-ujung terhadap DB live lulus (login, salah-area, akun dibatasi, open redirect ditolak). Halaman isi tiap area masih placeholder (`AreaHome`).
- **Fase 2 mulai (2026-09-25):** `/daftar` (Register + OTP email + berhasil dalam satu halaman), `/lupa-password` (minta link, cek email, kata sandi baru via `?tahap=reset`, link tidak berlaku); Login diberi tautan Lupa/Daftar dan tombol Google. Komponen `components/auth/{PasswordInput,OtpInput,StatusPanel}`. Celah backend (nama/WA di register, OTP WA, open redirect callback) di `audit/FRONTEND_GAPS.md`. Selesai juga: `/akun-dibatasi` (pending_review/suspended/rejected; `requireArea` dan `/login` mengalihkan ke sana), Global Public Shell (`app/(publik)/layout.tsx`: `components/public/{PublicHeader,PublicNav,PublicFooter,HeroSearch,PropertyCard}`, tautan di `public-nav.ts`) dan Homepage `/` (data `lib/public/home-data.ts`, RLS anon; tiap bagian punya keadaan kosong/gagal). Halaman tujuan tautan (`/listing`, `/agen`, `/organisasi`, `/developer`, `/event`, `/learning`, `/learning-session`, `/konten`, `/promo`) belum ada dan dibangun bertahap. Discovery `/listing` selesai (filter di URL tanpa JS: `lib/public/listing-{params,search}.ts` diuji, `components/public/{ListingFilters,FilterToggle,SortSelect}`, `loading.tsx`, "Muat Lebih Banyak" lewat `?tampil=`; halaman berfilter noindex; filter fasilitas = semua terpilih; filter lokasi provinsi/kota belum ada karena tidak ada di wireframe). Detail Listing `/listing/[slug]` selesai (isi di `components/public/ListingDetailView.tsx`, data `lib/public/listing-detail.ts`, `ListingGallery/ShareButton/ViewTracker/WhatsAppButton`, pesan WhatsApp berdetail di `lib/public/whatsapp-message.ts`; mencatat view dan klik WhatsApp lewat `/api/listings/{id}/{views,cta-click}`; not-found/loading/gagal; non-published noindex; contoh data di `/komponen/listing`). Discovery dipisah Dijual/Disewa (bawaan Dijual). Agen selesai: `/agen` (daftar, cari nama/kota/kantor, `lib/public/agent-data.ts`, `AgentCard`, `DiscoveryTabs`) dan `/agen/[slug]` (`AgentDetailView`: profil, title 1+3, tentang, portofolio, WhatsApp + nomor lisensi; ulasan tidak ada datanya). Register meminta nama lengkap (WA tidak). Promo selesai (`/promo`, `/promo/[id]`: `lib/public/promo-data.ts`, hanya aktif dalam jadwal) dan Konten Publik (`/konten`, `/konten/[slug]`: `lib/public/content-data.ts`, `RichText` aman tanpa HTML mentah). Learning selesai: `/learning` (daftar course + kategori CHECK), `/learning/[id]` (kurikulum judul saja, prasyarat, sesi terkait, CTA masuk/Mulai Belajar), `/learning-session` dan `/learning-session/[id]` (hanya pengguna login; pengunjung melihat panel terbatas); data `lib/public/learning-data.ts`, `EnrollButton`, `LearningCards`, `RestrictedPanel`. `course_lessons.content_url` terbaca anonim = risiko yang DITERIMA pemilik produk (2026-09-26). Title otomatis dari kelulusan course (migration 0155): staf memilih title per course lewat `PUT /api/courses/{id}/certificate-config` (`awards_title_definition_id`); Detail Course menampilkan title yang akan didapat; layar Admin (Sertifikat-Kursus) perlu kolom pilihan title (wireframe belum diperbarui). Organisasi selesai: `/organisasi` (daftar + filter jenis + cari) dan `/organisasi/[slug]` (`OrganizationDetailView`: banner, tentang, anggota lewat nama organisasi, listing organisasi, kontak; `lib/public/organization-data.ts`). Developer selesai: `/developer` (daftar proyek + filter status/tipe + cari; `ProjectCard`) dan `/project/[slug]` (`ProjectDetailView`: galeri, legalitas, spesifikasi, kartu developer + WhatsApp PIC, panel kemitraan Agent dengan komisi dan Klaim Proyek Ini; pengunjung melihat ajakan masuk; `lib/public/project-data.ts`). Komisi hanya dibaca untuk Agent login, tetapi masih terbaca anonim lewat REST (temuan di `audit/FRONTEND_GAPS.md`). Event selesai: `/event` (daftar akan datang/lalu + kategori + cari; `EventCard`) dan `/event/[id]` (kartu tanggal/jam, Online/Offline, Tentang Event, event terkait course/proyek, pendaftaran lewat `POST /api/events/{id}/rsvp`; `meeting_link` tidak ditampilkan; `lib/public/event-data.ts`); celah di `audit/FRONTEND_GAPS.md`. **Fase 2 selesai.** Pemeriksaan ulang 2026-09-26: ulasan agen (`lib/public/agent-reviews.ts`, `RatingStars`), Verifikasi Sertifikat dibangun ulang di Global Public Shell (`app/verifikasi/*`, pembatas percobaan), Detail Learning Session + event/organisasi terkait; sitemap untuk halaman baru ditunda (butuh keputusan mengubah API-150). CTA promo terstruktur (`lib/public/cta.ts`; keputusan: form admin memakai jenis CTA + pemilih isi, dikerjakan di Fase Admin M09). Detail di `audit/FRONTEND_GAPS.md`.
- **Fase 3 mulai (2026-09-26):** 3a Dashboard Agent `/agent` selesai (`components/agent/DashboardView.tsx`, data `lib/agent/dashboard-data.ts`, `components/ui/StatusBadge.tsx`, `app/agent/loading.tsx`, galeri `/komponen/agent`); belum diuji dengan login Agent. 3b Profil Saya `/agent/profil` selesai (`components/agent/{ProfileForm,KtpCard}.tsx`, `lib/agent/profile-data.ts`, `lib/validation/profile-form.ts`, `components/ui/{Switch,Field.Select}`, galeri `?layar=profil`); belum diuji dengan login Agent. 3c Listing selesai: `/agent/listing` (daftar + kuota), `/agent/listing/[id]` (detail + aksi + refresh), `/agent/listing/baru` (Wizard 9 langkah, `?salin=`) dan `/agent/listing/[id]/edit` (`?langkah=media`); `components/agent/{MyListingsView,ListingQuotaCard,MyListingDetailView,ListingActions,ListingWizard}.tsx`, `lib/agent/{listing-*,time}.ts`. Media hanya lewat tautan (belum ada API unggah). Belum diuji dengan login Agent. 3d Pembelajaran selesai: `/agent/belajar` (`components/agent/{LearningView,LpHistoryButton,CertificateList}.tsx`, data `lib/agent/learning-data.ts`) dan `/agent/belajar/[id]` (`CourseRunner.tsx`: materi berurutan, kuis lewat `/quizzes/{id}/take|attempt-status|submit`, unduh sertifikat); aturan murni `lib/agent/learning-rules.ts` (diuji); galeri `?layar=belajar` dan `?layar=course`; celah di `audit/FRONTEND_GAPS.md` (progres per pelajaran disandikan di progress_percent, course tanpa kuis, kartu Learning Path). Belum diuji dengan login Agent. Unggah foto (0158) selesai: `AvatarUploader` (pangkas lingkaran), Wizard mengunggah foto listing (3 varian), `lib/media/*`, `lib/storage/public-images.ts`. 3e Event selesai: `/agent/event`, `/agent/event/baru`, `/agent/event/[id]` (`components/agent/{MyEventsView,EventForm}.tsx`, data `lib/agent/event-data.ts`, aturan murni `lib/agent/event-rules.ts` diuji, label murni `lib/public/event-labels.ts`); celah keamanan pendaftaran dan pembatalan di `audit/FRONTEND_GAPS.md`. Belum diuji dengan login Agent. Urutan berikut: 3f Organisasi; satu PR per modul.
- **Belum:** badge status per entitas (dibuat per modul dari CHECK constraint), ikon khusus menu (sementara ikon netral), penyaringan menu Admin per kemampuan, Context Switcher Agent.
- API mensyaratkan `Content-Type: application/json` pada semua POST/PUT/PATCH/DELETE (422 bila tidak ada, termasuk yang tanpa badan); `lib/api-client` sudah mengirimnya.
- Catatan: `npm audit` melaporkan postcss (bawaan `next`, 1 tinggi/1 sedang) yang hanya bisa diperbaiki dengan naik ke Next 16 (perubahan besar); risiko praktis rendah (postcss hanya memproses CSS milik kita saat build). Tinjau saat rencana upgrade Next.

## 7. Yang perlu diputuskan pemilik produk

1. ~~Tailwind v4 atau CSS Modules~~ **DIPUTUSKAN 2026-09-25: Tailwind v4** dengan `@theme` yang memetakan `--ra-*` dari `tokens.css`. Batas browser: Chrome 111+, Safari/iOS 16.4+, Firefox 128+. Uji di satu HP Android lama lewat Vercel Preview sebelum halaman publik diperluas; bila >±5% pengguna di bawah batas itu, pertimbangkan Tailwind v3.4 atau CSS Modules sebelum banyak layar dibangun.
2. Urutan persona setelah Agent: Admin dulu (operasional) atau Developer Partner dulu (akuisisi mitra).
3. Kapan membuat proyek Supabase produksi terpisah (staging saat ini memakai `jawywzavznjekxxlhwqo`).
4. Nasib role `buyer` di database (masih ada, tanpa UI).

---

## 8. Rujukan di repo

| Butuh | Buka |
|---|---|
| Kode modul & persona | `docs/design/wireframes-v2/MODULES.md` |
| Status wireframe & keputusan desain | `docs/design/wireframes-v2/README.md` |
| Sumber per fitur (celah & keputusan) | `docs/design/wireframes-v2/SOURCE-*.md` |
| Canvas hidup (sumber kebenaran desain) | https://claude.ai/artifact/E2exTSy32okUjjacqMqB2Q |
| Kontrak API bersama | `apps/web/lib/api/` (`handler.ts`, `response.ts`, `errors.ts`, `idempotency.ts`, `pagination.ts`) |
| Skema & RLS | `supabase/migrations/` + `supabase/migrations/README.md` |
| Deploy staging | `docs/deployment/VERCEL_STAGING.md` |
| Spesifikasi UI resmi (nav, shell) | `docs/core/current/06-product/STEP-13-SUCCESSOR-SPECIFICATIONS` (STEP13-E §4) |
| Definisi metrik analytics | `docs/analytics/METRIC_DEFINITIONS_v1.md` |
