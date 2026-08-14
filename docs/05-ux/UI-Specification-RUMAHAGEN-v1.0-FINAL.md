# UI SPECIFICATION
## Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 5 Agustus 2026
**Status:** ✅ Baseline (BERLAKU) — naik dari Draft, 5 Agustus 2026, disahkan Owner (Mujtahid Aktanto)
**Owner:** Technical Lead / UI-UX Design Lead — Mujtahid Aktanto (Solo Project Owner, AI-Assisted)
**Dokumen sumber:** Functional Specification v1.0 (Screen Inventory, Bagian 2), `SYSTEM-ARCHITECTURE.md` Bagian 10, `development-playbook.md` Bagian 8-10, `technology-decisions.md` §4.3/4.4/4.18/4.19

> **Dasar penyusunan:** Dokumen ini **belum pernah ada sebelumnya** — dikonfirmasi lewat `document-governance-baseline-register.md` Governance Notes poin 4 dan `foundation-validation-report.md` §17 (status **Not Ready**, gap Tinggi: "Tidak ada satu pun representasi visual di antara 17 dokumen"). Disusun sesuai urutan `foundation-validation-report.md` Bagian 16 langkah 7, memakai **Screen Inventory dari Functional Specification v1.0 Bagian 2 (43 layar)** sebagai basis wajib — setiap layar di dokumen ini memetakan balik ke requirement fungsional yang benar (`foundation-validation-report.md` §16 catatan langkah 7), bukan didesain lepas dari spesifikasi fungsional.

> **Batasan mengikat (tidak dapat diubah dokumen ini):** Component Library **shadcn/ui** dan CSS Framework **Tailwind CSS** sudah final (`ADR-021`, `technology-decisions.md` §4.3–4.4) — dokumen ini mendefinisikan *token* desain (warna, tipografi, spacing) yang **mengisi** sistem shadcn/ui yang sudah dipilih, bukan mengusulkan library baru. Form memakai **React Hook Form + Zod** (§4.18–4.19). State UI lokal memakai **Zustand**, state server memakai **TanStack Query** (`development-playbook.md` Bagian 9) — tidak diulang detailnya di sini, hanya direferensikan.

---

## 1. Ruang Lingkup

Mendefinisikan sistem desain (token warna/tipografi/spacing), pola layout (template halaman), inventaris komponen, dan wireframe untuk **43 layar** dari Functional Specification v1.0. Tidak mencakup high-fidelity visual mockup (piksel-presisi) — itu adalah pekerjaan implementasi/desain grafis lanjutan di luar cakupan dokumen governance ini, konsisten dengan `foundation-validation-report.md` yang membedakan "UI Specification/Wireframe" (dokumen ini) dari implementasi kode.

---

## 2. Sistem Desain (Design Tokens)

### 2.1 Arah Visual

Subjek: platform kerja profesional agen properti Indonesia — kepercayaan finansial (kalkulator KPR), data lokasi presisi (peta bidang tanah), dan kredibilitas dokumen legal (sertifikat, IMB). Alih-alih palet AI generik (krem-terracotta, hitam-neon, atau broadsheet hairline), arah visual diambil dari **dunia dokumen pertanahan Indonesia**: peta kadaster, garis kontur, cap/segel sertifikat tanah, dan warna tanah subur — elemen yang secara harfiah adalah *world* dari subjek ini (bukan dekorasi generik).

**Signature element:** garis kisi tipis ala peta kadaster (*cadastral grid*) sebagai tekstur latar halus di area hero/dashboard, dan motif *pin bidang tanah* (bukan pin lokasi generik bulat, melainkan bentuk poligon bidang kecil bersudut) dipakai konsisten di titik-titik penting: penanda lokasi listing, badge status, dan loading indicator kalkulator DBR.

### 2.2 Palet Warna

| Token (var shadcn) | Nama | Hex | Peran |
|---|---|---|---|
| `--primary` | Pine Deep | `#1B4332` | Warna utama — hijau tanah/hutan pekat, dipakai navigasi utama, tombol aksi primer, header. Melambangkan tanah & pertumbuhan, bukan hijau korporat generik. |
| `--primary-foreground` | Paper | `#FAF8F3` | Teks di atas Pine Deep. |
| `--accent` | Land Gold | `#B8863F` | Aksen — emas tanah/ochre, dipakai untuk elemen bernilai (harga, badge kelayakan DBR "Layak", highlight sertifikat). Sengaja dipilih **berbeda dari terracotta `#D97757`** (ditandai sebagai default AI generik) — lebih ke arah emas dokumen resmi/cap dinas. |
| `--background` | Paper | `#FAF8F3` | Latar utama — putih kertas hangat, bukan krem `#F4F1EA` generik. |
| `--foreground` | Ink Navy | `#1C2541` | Teks utama — navy gelap, bukan hitam pekat; mengevokasi tinta stempel dokumen resmi. |
| `--muted` | Fog | `#E8E4DA` | Latar sekunder, garis pemisah, state disabled. |
| `--muted-foreground` | Slate | `#6B7280` | Teks sekunder/caption. |
| `--destructive` | Alert Clay | `#B3441E` | Error, aksi hapus, status "Tidak Layak"/"Ditolak" — merah-bata, selaras palet tanah, bukan merah stop generik. |
| `--success` | (custom token) | `#2D6A4F` | Status "Layak"/"Published"/"Approved" — hijau lebih terang dari Pine Deep agar terbedakan sebagai status, bukan brand. |
| `--warning` | (custom token) | `#C9A227` | Status "Perlu Review"/"Pending" — kuning-emas redup. |

> **Integrasi shadcn/ui:** nilai di atas diisikan ke CSS variable tema shadcn (`app/globals.css`, format HSL sesuai konvensi shadcn) — tidak mengubah struktur komponen shadcn, murni override token warna default.

### 2.3 Tipografi

| Peran | Font | Rasional |
|---|---|---|
| **Display** (judul halaman, angka besar kalkulator DBR) | **Fraunces** (serif, weight 400–600) | Serif dengan karakter sedikit "bercap resmi" tanpa terasa mewah-berlebihan — cocok untuk angka finansial (hasil DBR, harga listing) yang perlu terasa tepercaya, bukan serif dekoratif klise. |
| **Body & UI** (form, tabel, navigasi) | **Inter** (sans-serif, weight 400–600) | Legible di ukuran kecil untuk tabel admin/dashboard padat data, dukungan karakter Indonesia lengkap, dipakai luas jadi aman untuk performa loading. |
| **Data/Mono** (nomor sertifikat, ID listing, kode OTP) | **JetBrains Mono** (weight 400–500) | Angka tabular untuk kode yang harus mudah dibaca-ulang (OTP, ID transaksi). |

**Skala tipe** (rem, basis 16px): `text-xs` 0.75 · `text-sm` 0.875 · `text-base` 1 · `text-lg` 1.125 · `text-xl` 1.25 · `text-2xl` 1.5 · `text-3xl` 1.875 · `text-4xl` 2.25 · `text-5xl` 3 (dipakai terbatas: angka hasil DBR & harga listing di halaman detail).

### 2.4 Spacing, Radius, Shadow

- **Spacing scale:** kelipatan 4px mengikuti default Tailwind (`p-1`=4px s.d. `p-16`=64px) — tidak membuat skala custom baru, cukup disiplin memakai skala yang sudah ada.
- **Radius:** `rounded-md` (6px) sebagai default kartu/input — bukan `rounded-none` (kesan broadsheet generik) atau `rounded-2xl` berlebihan; `rounded-full` khusus avatar & badge status.
- **Shadow:** minimal — `shadow-sm` untuk kartu listing/dropdown, tanpa drop shadow berlebihan; kartu mengandalkan `border` tipis (`border-muted`) sebagai pemisah utama, bukan shadow.

### 2.5 Motion

- Transisi standar: `150–200ms ease-out` untuk hover/focus state.
- **Satu momen orkestrasi bermakna** (bukan animasi tersebar): saat hasil Kalkulator DBR muncul, angka DBR% melakukan *count-up* singkat (400ms) dari 0 ke nilai hasil — memberi bobot pada momen keputusan finansial, tanpa animasi dekoratif di tempat lain.
- **Reduced motion dihormati**: seluruh transisi/count-up di atas otomatis nonaktif jika `prefers-reduced-motion: reduce` terdeteksi (wajib, bukan opsional).

---
## 3. Layout Templates

43 layar Functional Spec dikelompokkan ke **6 template halaman** reusable — mencegah 43 desain lepas yang inkonsisten. Setiap layar di Bagian 5 memetakan ke salah satu template ini.

### Template A — Public Marketing/List (halaman publik, SSR)
```
┌─────────────────────────────────────────────┐
│ Header: Logo | Nav | [Masuk/Daftar]          │
├─────────────────────────────────────────────┤
│ Filter Bar (sticky on scroll, collapsible    │
│  di mobile)                                  │
├───────────────┬───────────────┬─────────────┤
│  Card         │  Card         │  Card       │  ← grid 3 kol desktop,
├───────────────┼───────────────┼─────────────┤     2 kol tablet, 1 kol mobile
│  Card         │  Card         │  Card       │
├───────────────┴───────────────┴─────────────┤
│              [Muat Lebih Banyak]             │
├───────────────────────────────────────────────┤
│ Footer                                        │
└───────────────────────────────────────────────┘
```
Dipakai: Katalog Listing, Katalog Kursus, Katalog Proyek Developer, Kalender Event.

### Template B — Detail Publik
```
┌─────────────────────────────────────────────┐
│ Header                                        │
├───────────────────────────┬───────────────────┤
│ Galeri Media (foto/video)  │ Panel Ringkas:    │
│                             │  - Harga          │
│                             │  - CTA WhatsApp   │
│                             │  - Cek DBR         │
├─────────────────────────────┤  - Info Agen      │
│ Deskripsi & Spesifikasi      │                   │
│ Peta Lokasi                  │                   │
│ Listing/Proyek Serupa        │                   │
└───────────────────────────┴───────────────────┘
```
Dipakai: Detail Listing, Detail Proyek Developer, Detail Event, Profil Publik Agen, Halaman Publik Organization.

### Template C — Dashboard Kerja (route group `(dashboard)`, CSR)
```
┌────────┬──────────────────────────────────────┐
│ Sidebar│ Topbar: Judul Halaman | Notif | Avatar │
│ Nav    ├──────────────────────────────────────┤
│ (per   │ Ringkasan (cards statistik)            │
│ role)  ├──────────────────────────────────────┤
│        │ Konten Utama (tabel/list/widget)       │
│        │                                        │
└────────┴──────────────────────────────────────┘
```
Sidebar collapse jadi bottom nav/drawer di mobile. Dipakai: Dashboard Agen, Dashboard Admin, Listing Saya, Daftar Prospek, Sertifikat Saya, Organization Dashboard, Pusat Notifikasi.

### Template D — Form Wizard (multi-step)
```
┌─────────────────────────────────────────────┐
│ Step Indicator: ①──②──③──④──⑤──⑥ (progress)  │
├─────────────────────────────────────────────┤
│                                                │
│           [Field-field step aktif]            │
│                                                │
├─────────────────────────────────────────────┤
│ [← Kembali]              [Lanjut / Submit →]  │
└─────────────────────────────────────────────┘
```
Step Indicator diberi label teks di desktop (mis. "1. Kategori"), diringkas jadi dot progress di mobile. Dipakai: Form Listing (6 step), Buat Organization (2 step), Registrasi Agen + Onboarding (rangkaian 3 layar berperilaku sebagai 1 wizard).

### Template E — Form Single-Page + Hasil Real-Time
```
┌───────────────────────┬───────────────────────┐
│  Form Input             │  Panel Hasil            │
│  (field-field)           │  (update real-time,     │
│                          │   count-up animation)   │
│                          │                         │
│  [Hitung] [Simpan]       │  [Export PDF]           │
└───────────────────────┴───────────────────────┘
```
Di mobile: Panel Hasil pindah ke bawah Form, sticky di bagian bawah layar saat scroll (agar hasil tetap terlihat sambil mengubah field). Dipakai: **Kalkulator DBR**, Chat AI Assistant (varian: panel kiri=riwayat thread, kanan=percakapan aktif).

### Template F — Admin Table/CRUD
```
┌────────┬──────────────────────────────────────┐
│ Sidebar│ Judul | [+ Tambah Baru]                │
│        ├──────────────────────────────────────┤
│        │ Search & Filter Bar                    │
│        ├──────────────────────────────────────┤
│        │ Tabel: kolom sortable, aksi per baris  │
│        │  (Edit/Hapus/Approve/Reject)            │
│        ├──────────────────────────────────────┤
│        │ Pagination                             │
└────────┴──────────────────────────────────────┘
```
Dipakai: Manajemen User, Moderasi Listing, Moderasi Review, Kelola Kursus, Kelola Event, Kelola Developer, Kelola Role, Permission Matrix Editor, Konfigurasi Sistem.

---

## 4. Inventaris Komponen

Mengikuti `development-playbook.md` §8.1–8.3: **wajib** cek `components/ui/` (shadcn/ui) dulu sebelum membuat komponen baru; komponen fitur dinamai `{Module}{Purpose}` PascalCase.

### 4.1 Primitif shadcn/ui yang Dipakai
`Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Dialog`, `Sheet` (drawer mobile), `Card`, `Badge`, `Avatar`, `Table`, `Tabs`, `Toast` (Sonner), `Skeleton` (loading state), `Popover`, `Command` (dropdown search wilayah/proyek), `Progress` (step indicator, upload progress), `Calendar` (Kalender Event), `Tooltip`.

### 4.2 Komponen Komposit Kustom (per modul, di atas primitif shadcn/ui)

| Komponen | Modul | Tanggung Jawab | Tipe (Bagian 8.2 Playbook) |
|---|---|---|---|
| `ListingForm` | M03 | Wizard 6-step, orkestrasi React Hook Form + Zod | Smart |
| `ListingCard` | M03 | Kartu ringkas listing (grid Template A) | Presentational |
| `ListingGallery` | M03 | Galeri foto/video + lightbox | Presentational |
| `ListingMap` | M03 | Wrapper Leaflet+OSM untuk pin lokasi (ADR-008) | Presentational (menerima lat/long via props) |
| `RegionCascadeSelect` | M03 | 3 `Select` cascading Provinsi→Kota→Kecamatan | Smart (fetch opsi per level) |
| `ListingDuplicateBlockModal` | M03 | Modal blocking saat submit ditolak (409) karena foto identik terdeteksi — tampilkan listing yang identik + CTA aksi | Presentational (menerima data via props dari respons API, tidak fetch sendiri) |
| `ListingDuplicateWarningBanner` | M03 | Banner non-blocking di atas form saat submit berhasil namun ada `possible_duplicates` (similarity 90-99%) | Presentational |
| `DbrCalculatorForm` | M07 | Form + panel hasil real-time, count-up | Smart |
| `DbrEligibilityBadge` | M07 | Badge warna Layak/Perlu Review/Tidak Layak | Presentational |
| `AgentProfileCard` | M02 | Kartu ringkas agen (dipakai di listing detail & pencarian) | Presentational |
| `AgentReviewForm` | M02 | Form rating bintang + komentar | Smart |
| `CourseProgressBar` | M04 | Progress belajar per kursus | Presentational |
| `QuizRunner` | M04 | Orkestrasi soal-per-soal + submit | Smart |
| `EventCalendarView` | M05 | Wrapper `Calendar` shadcn dengan data event | Smart |
| `OrganizationInviteDialog` | M12 | Modal cari-agen + kirim undangan | Smart |
| `PermissionMatrixGrid` | M10 | Grid Entity×Action×Role dengan toggle scope | Smart |
| `AiConnectionCard` | M13 | Kartu status koneksi provider + aksi | Presentational |
| `AiChatThread` | M13 | Panel percakapan + label pengingat permanen | Smart |
| `StatusBadge` | Global | Badge status generik (Draft/Published/Pending/dsb, warna per token §2.2) | Presentational |
| `EmptyState` | Global | Ilustrasi + pesan + CTA untuk state kosong (Bagian 6.6 Functional Spec) | Presentational |
| `StepIndicator` | Global | Progress wizard Template D | Presentational |

> Seluruh komponen "Smart" mengikuti aturan `development-playbook.md` §9 (TanStack Query untuk server state, Zustand untuk UI state wizard) — tidak diulang di sini.

---
## 5. Wireframe Detail (Layar Prioritas)

Konsisten Functional Specification v1.0 Bagian 3 (2 layar presisi penuh), berikut wireframe ASCII level struktur — bukan piksel-presisi, cukup untuk implementasi.

### 5.1 Form Listing — Step 3 (Detail & Spesifikasi), contoh representatif Template D

```
┌──────────────────────────────────────────────────────────┐
│ ①Kategori ─ ②Lokasi ─ ●③Detail ─ ④Legalitas ─ ⑤Media ─ ⑥Kontak │
├──────────────────────────────────────────────────────────┤
│ Judul Listing *                                             │
│ [_________________________________________________]         │
│                                                               │
│ Tipe Properti *          Harga *                             │
│ [Select: Rumah ▾]        [Rp __________]  ☐ Bisa Ditawar     │
│                                                               │
│ ┌─ Spesifikasi (grid 3 kolom desktop / 2 mobile) ──────────┐ │
│ │ Luas Tanah (m²)  Luas Bangunan (m²)  Kamar Tidur          │ │
│ │ [____]           [____]              [ - 3 + ]            │ │
│ │ Kamar Mandi      Jumlah Lantai       Carport               │ │
│ │ [ - 2 + ]        [ - 1 + ]           [ - 1 + ]             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                               │
│ Fasilitas (pilih yang tersedia)                              │
│ [☑ Kolam Renang] [☐ Keamanan 24 Jam] [☐ Taman] [+ Lainnya]  │
│                                                               │
│ Deskripsi                                                    │
│ [Rich text area, 6 baris]                                    │
├──────────────────────────────────────────────────────────┤
│ [← Kembali]                                    [Lanjut →]    │
└──────────────────────────────────────────────────────────┘
```
**Interaksi:** stepper Kamar Tidur/Mandi/Lantai/Carport pakai kontrol `-`/`+` (bukan input angka polos) — mencegah input tidak wajar di mobile. Field harga format ribuan otomatis saat mengetik (`Rp 2.500.000.000`). Field Judul menampilkan counter karakter (`120/200`) di pojok kanan bawah saat mendekati batas.

### 5.2 Kalkulator DBR — Template E

```
┌───────────────────────────┬─────────────────────────────┐
│  KALKULATOR DBR             │   HASIL SIMULASI              │
├───────────────────────────┤ ┌───────────────────────────┐ │
│ Penghasilan Bersih/Bulan *   │ │      ● LAYAK                │ │
│ [Rp ______________]          │ │   (badge besar, warna       │ │
│                               │ │    --success, count-up)     │ │
│ Cicilan Berjalan *            │ └───────────────────────────┘ │
│ [Rp ______________]          │                                │
│                               │ DBR%          : 28.4%          │
│ Harga Properti *              │ Plafon KPR    : Rp 850.000.000 │
│ [Rp ______________]          │ Angsuran/Bulan: Rp 8.245.000    │
│                               │                                │
│ Uang Muka (DP) *              │ ⓘ Hasil ini estimasi awal,      │
│ [Rp ______________]          │   keputusan final oleh bank.    │
│                               │                                │
│ Tenor *      Suku Bunga *     │ [Simpan sbg Prospek]           │
│ [_] [Tahun▾] [___%]           │ [Export ke PDF]  (aktif jika    │
│                               │  sudah tersimpan sbg prospek)   │
│           [Hitung]            │                                │
└───────────────────────────┴─────────────────────────────┘
```
**Interaksi:** panel kanan **kosong/skeleton** sebelum tombol "Hitung" pertama kali ditekan (bukan menampilkan 0 yang membingungkan). Setelah hasil pertama muncul, perubahan field mana pun langsung memicu re-kalkulasi panel kanan tanpa perlu klik ulang — transisi angka pakai count-up 400ms (§2.5). Badge warna: hijau `--success` (Layak), kuning `--warning` (Perlu Review), merah `--destructive` (Tidak Layak).

### 5.3 Dashboard Agen — Template C

```
┌────────┬───────────────────────────────────────────┐
│ 🏠Dsbrd │ Selamat datang, Budi          🔔3  [Avatar] │
│ 📋List  ├───────────────────────────────────────────┤
│ 👤Profil│ ┌────────┐┌────────┐┌────────┐┌────────┐  │
│ 🎓Kursus│ │Listing  ││Lead     ││Kursus   ││Event    │  │
│ 📅Event │ │Aktif: 5 ││Baru: 3  ││85% sel. ││2 mendtg │  │
│ 🧮DBR   │ └────────┘└────────┘└────────┘└────────┘  │
│ 🏢Org   │ ┌───────────────────────────────────────┐ │
│ 🤖AI    │ │ Listing Terbaru Anda                    │ │
│         │ │ [ListingCard] [ListingCard] [ListingCard]│ │
│         │ └───────────────────────────────────────┘ │
│         │ ┌───────────────────────────────────────┐ │
│         │ │ Lead Masuk Terbaru (tabel ringkas)       │ │
│         │ └───────────────────────────────────────┘ │
└────────┴───────────────────────────────────────────┘
```
**Mobile:** sidebar berubah jadi bottom navigation bar (5 ikon utama + menu "Lainnya"), cards statistik jadi horizontal-scroll, bukan grid 4 kolom dipaksa menyempit.

---

## 6. Pemetaan 43 Layar ke Template

| Modul | Layar | Template | Catatan Khusus |
|---|---|---|---|
| M01 | Registrasi Agen | D (mini-wizard 1 step) | Lanjut ke Verifikasi OTP tanpa reload |
| M01 | Login | — (form sederhana, tidak perlu template khusus) | Card terpusat, tanpa sidebar |
| M01 | Verifikasi OTP | — (form sederhana) | 6 kotak input digit terpisah |
| M01 | Upload Dokumen Legalitas | D (step 2 dari onboarding) | |
| M01 | Lupa/Reset Password | — (form sederhana) | |
| M01 | Status Akun Pending | — (status page, tanpa form) | Ilustrasi tunggu + progress |
| M02 | Profil Publik Agen | B | |
| M02 | Edit Profil Saya | C (konten form dalam dashboard) | |
| M02 | Submit Review Agen | — (komponen Dialog di Template B) | `AgentReviewForm` dalam `Dialog` |
| M02 | Moderasi Review | F | |
| M03 | **Form Listing** | **D** | Wireframe §5.1 |
| M03 | Listing Saya | C | Tabel/card hybrid (card di mobile, table di desktop) |
| M03 | Detail Listing Publik | B | |
| M03 | Pencarian & Filter | A | + toggle List/Map View (peta full-width alternatif) |
| M03 | Moderasi Listing | F | |
| M04 | Katalog Kursus | A | |
| M04 | Detail Kursus & Enroll | B | |
| M04 | Player Materi & Kuis | C (varian: sidebar=daftar lesson) | |
| M04 | Sertifikat Saya | C | Grid kartu sertifikat, bukan tabel |
| M04 | Kelola Kursus | F | |
| M05 | Kalender Event | A (varian kalender, pakai `Calendar`) | |
| M05 | Detail Event & RSVP | B | |
| M05 | Pengajuan Event | D (1 step) | |
| M05 | Kelola Event | F | |
| M06 | Katalog Proyek Developer | A | |
| M06 | Detail Proyek & Klaim | B | |
| M06 | Kelola Developer & Proyek | F | |
| M07 | **Kalkulator DBR** | **E** | Wireframe §5.2 |
| M07 | Daftar Prospek Saya | C | |
| M08 | **Dashboard Agen** | **C** | Wireframe §5.3 |
| M08 | Dashboard Admin | C (varian: statistik scope global) | |
| M08 | Pusat Notifikasi | C | List sederhana, tanpa cards statistik |
| M09 | Manajemen User | F | |
| M09 | Konfigurasi Sistem | C (form panjang per section, bukan tabel) | |
| M10 | Kelola Role | F (read-only variant) | |
| M10 | Permission Matrix Editor | F (grid khusus, bukan tabel baris standar) | `PermissionMatrixGrid` |
| M12 | Buat Organization | D (2 step) | |
| M12 | Organization Dashboard | C | Mirip Dashboard Agen, scope Organization |
| M12 | Undang/Kelola Anggota | C | |
| M12 | Cari & Ajukan Gabung | A (varian search-only, tanpa filter kompleks) | |
| M12 | Halaman Publik Organization | B (varian: tanpa CTA WhatsApp, ada daftar member) | |
| M13 | Kelola Koneksi AI Provider | C | Grid `AiConnectionCard` |
| M13 | Chat AI Assistant | E (varian: kiri=daftar thread per-provider) | |

---
## 7. Aturan Responsif

| Breakpoint (Tailwind default) | Perilaku Umum |
|---|---|
| `< 640px` (mobile) | Sidebar Template C/F → bottom nav bar; Grid Template A → 1 kolom; Template D step indicator → dot progress tanpa label teks; Template E → panel hasil pindah ke bawah form, sticky saat scroll |
| `640–1024px` (tablet) | Grid Template A → 2 kolom; Sidebar Template C/F tetap collapse jadi drawer (`Sheet`), dibuka via tombol hamburger |
| `> 1024px` (desktop) | Layout penuh sesuai wireframe §5 |

**Aturan wajib tambahan:**
- Tabel Template F (Admin) di mobile **tidak** di-scroll horizontal sebagai solusi utama — kolom non-esensial disembunyikan, aksi baris dipindah ke menu titik-tiga (`Popover`), kolom kunci (nama/status) tetap terlihat.
- Form Listing (Template D) di mobile: 1 kolom penuh per field, grid spesifikasi §5.1 turun jadi 2 kolom.

---

## 8. Aksesibilitas & Kualitas Baku

Mengikuti prinsip `frontend-design` skill "quality floor" — dibangun tanpa diumumkan, bukan fitur tambahan:

1. **Keyboard focus terlihat** di seluruh elemen interaktif (`focus-visible` ring memakai `--accent`, bukan dihilangkan demi estetika).
2. **Kontras warna** — kombinasi `--foreground`/`--background` dan `--primary-foreground`/`--primary` diverifikasi memenuhi WCAG AA (4.5:1 teks normal) sebelum implementasi; `--muted-foreground` di atas `--background` khusus dipakai untuk teks sekunder non-esensial (bukan informasi wajib).
3. **`prefers-reduced-motion`** dihormati untuk seluruh animasi §2.5 (count-up, transisi step wizard).
4. **Label form eksplisit** — setiap `Input`/`Select` di seluruh wireframe §5 memiliki `<label>` terasosiasi, bukan hanya placeholder (placeholder tidak pernah dipakai sebagai pengganti label, konsisten prinsip "errors don't apologize, labels don't hide").
5. **Empty state & error** mengikuti nada Bagian 5-6 Functional Specification v1.0 — instruktif, bukan generik ("Tidak ditemukan" + saran, bukan hanya "Kosong").
6. **Alt text gambar** — foto listing wajib `alt` deskriptif otomatis (mis. "Foto {tipe_properti} di {kota}"), bukan nama file.

---

## 9. Traceability & Quality Gate

| Check | Hasil |
|---|---|
| Seluruh 43 layar Functional Spec v1.0 dipetakan ke template (Bagian 6) | ✅ 43/43 |
| Design token tidak mengganti library yang sudah final (shadcn/ui, Tailwind) | ✅ — token murni override CSS variable |
| Form mengikuti React Hook Form + Zod (tidak diusulkan alternatif) | ✅ |
| State management mengikuti Zustand (UI)/TanStack Query (server) yang sudah final | ✅ |
| Komponen kustom mengikuti konvensi penamaan `development-playbook.md` §8.3 | ✅ — lihat Bagian 4.2 |
| 2 layar prioritas Functional Spec mendapat wireframe detail | ✅ — Bagian 5.1 & 5.2 |
| Aksesibilitas dasar (focus, kontras, reduced motion) didefinisikan | ✅ — Bagian 8 |
| Palet warna menghindari default AI generik yang ditandai `frontend-design` skill | ✅ — dijelaskan rasional §2.1–2.2 |

**Gap non-blocking:** high-fidelity mockup piksel-presisi (Figma/desain grafis penuh) **belum** dibuat — di luar cakupan dokumen governance ini (§1), direkomendasikan sebagai pekerjaan implementasi terpisah begitu Module Planning per-sprint dimulai.

---

## 10. Langkah Berikutnya

Dengan Functional Specification v1.0 dan UI Specification v1.0 selesai, seluruh 3 dokumen yang sebelumnya berstatus **Not Ready**/`Planned` (`foundation-validation-report.md` §17: Functional Spec, UI Spec, dan Technical Spec) kini tinggal **Technical Specification** — statusnya sudah **Ready** sejak sebelum siklus ini (bahan baku lengkap: SYSTEM-ARCHITECTURE, API Spec v1.2, ERD v1.3, Entity Mapping v1.0, Authorization Spec v1.0), murni pekerjaan konsolidasi. Setelah ketiganya selesai, **Module Planning** (per `foundation-validation-report.md` Bagian 16 langkah 9) dapat dimulai penuh tanpa blocker apa pun.

---

*Dokumen ini adalah UI Specification resmi proyek. Perubahan mengikuti lifecycle `document-governance-baseline-register.md` Bab 4 — versi lama tidak dihapus, perubahan dicatat sebagai versi baru.*
