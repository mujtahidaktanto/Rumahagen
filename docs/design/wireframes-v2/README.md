# RumahAgen Wireframe v2 — Salinan Ekspor dari Claude Design

Ini adalah **salinan cadangan/arsip** dari wireframe interaktif yang sedang dikerjakan di
Claude Design (Artifact "Design" — canvas dengan artboard hidup, state loading/empty/error,
dan komponen interaktif nyata). Wireframe ini menggantikan pendekatan lama di
`docs/design/wireframes/` (WF-00–WF-11, PNG statis) karena divalidasi langsung terhadap
skema Supabase live (`jawywzavznjekxxlhwqo`, migration #0001–#0115), bukan cuma dokumen spesifikasi.

**Kanvas hidup (sumber kebenaran, bisa diedit & diklik interaktif):**
https://claude.ai/artifact/E2exTSy32okUjjacqMqB2Q

## ⚠️ Keterbatasan penting

File `.dc.html` di folder ini **bukan halaman web statis biasa** — ini format "Design
Component" milik Claude (pakai custom element `<x-dc>`, script runtime `support.js`, dan
placeholder `{{ }}` yang cuma di-render oleh editor Claude Design). Kalau dibuka langsung di
browser (double-click / `file://`), **file ini TIDAK akan tampil dengan benar** — tidak ada
mesin templating, `support.js` tidak akan ditemukan, dan gambar logo (`/_blob/...`) tidak akan
resolve (itu URL internal ke asset store Artifact, bukan URL publik).

**Kegunaan folder ini**: cadangan versi/riwayat source code yang bisa di-diff lewat git,
dan referensi kode kalau canvas hidup di atas tidak bisa diakses. Untuk melihat/klik-klik
wireframe sungguhan, selalu buka link canvas di atas.

## Struktur

Aturan penamaan: **`<Platform>/<Persona>/<KodeModul>-<Nama-Layar>.dc.html`**
— lihat [`MODULES.md`](MODULES.md) untuk legenda lengkap kode modul (M01–M15) dan persona.

```
wireframes-v2/
├── README.md                   # file ini
├── MODULES.md                  # legenda kode modul M01–M15 + persona
├── tokens.css                  # design tokens tunggal (warna, tipografi, spacing, komponen)
├── Design-System.dc.html       # lembar referensi: palet warna, type scale, katalog status badge
├── assets/
│   └── rumahagen-logo.png      # logo asli (transparan), dipakai semua layar
├── Desktop/                    # 1440×900, breakpoint desktop
│   ├── 00-Publik/
│   │   ├── M11-Homepage.dc.html
│   │   ├── M11-Discovery.dc.html
│   │   ├── M11-Detail-Listing.dc.html
│   │   ├── M11-Detail-Agen-Desktop.dc.html
│   │   ├── M11-Detail-Organisasi-Desktop.dc.html
│   │   ├── M11-Detail-Developer-Project-Desktop.dc.html
│   │   ├── M11-Detail-Event-Desktop.dc.html
│   │   ├── M11-Detail-Learning-Desktop.dc.html
│   │   ├── M11-Detail-Learning-Session-Desktop.dc.html
│   │   ├── M11-Konten-Publik-Desktop.dc.html
│   │   ├── M11-Konten-Publik-Detail-Desktop.dc.html
│   │   ├── M11-Promo-Desktop.dc.html
│   │   ├── M11-Promo-Detail-Desktop.dc.html
│   │   ├── M01-Register-Desktop.dc.html
│   │   ├── M01-OTP-Desktop.dc.html
│   │   ├── M01-Login-Desktop.dc.html
│   │   └── M01-Recovery-Desktop.dc.html
│   ├── 01-Agent/
│   │   ├── M01-Akun-Dibatasi.dc.html
│   │   ├── M02-Profil-Saya.dc.html
│   │   ├── M03-Listing-Saya.dc.html
│   │   ├── M03-Create-Listing-Wizard.dc.html
│   │   ├── M03-Listing-Detail.dc.html
│   │   ├── M08-Dashboard.dc.html
│   │   ├── M08-Statistik-Saya.dc.html
│   │   ├── M12-Organisasi-Dashboard.dc.html
│   │   ├── M12-Buat-Organisasi.dc.html
│   │   ├── M12-Kelola-Anggota.dc.html
│   │   ├── M04-Pembelajaran.dc.html
│   │   ├── M04-Belajar-Course.dc.html
│   │   ├── M05-Event-Saya.dc.html
│   │   ├── M05-Ajukan-Event.dc.html
│   │   ├── M06-Klaim-Proyek.dc.html
│   │   ├── M07-Kalkulator-DBR.dc.html
│   │   ├── M07-Riwayat-DBR.dc.html
│   │   ├── M13-Koneksi-AI.dc.html
│   │   ├── M13-AI-Assistant.dc.html
│   │   ├── M14-Katalog-Komersial.dc.html
│   │   ├── M14-Pesanan-Kuota.dc.html
│   │   ├── M15-Evidence.dc.html
│   │   ├── M15-Evaluasi.dc.html
│   │   └── M15-Title-Award-Presentation.dc.html
│   ├── 02-Admin/
│   │   ├── M09-Dashboard-Analytics.dc.html
│   │   ├── M09-Direktori-Pengguna.dc.html
│   │   ├── M09-Staf-Internal.dc.html
│   │   ├── M10-Matriks-Izin.dc.html
│   │   ├── M09-Konten-Notifikasi.dc.html
│   │   ├── M09-Konfigurasi-Sistem.dc.html
│   │   ├── M09-Audit-Oversight.dc.html
│   │   ├── M03-Moderasi-Listing.dc.html
│   │   ├── M07-Bank-Master.dc.html
│   │   ├── M13-Provider-Catalogue.dc.html
│   │   ├── M04-Learning-Economy-Config.dc.html
│   │   ├── M14-Komersial-Admin.dc.html
│   │   ├── M15-Award-Appeal.dc.html
│   │   ├── M15-Awarding-Path-Admin.dc.html
│   │   └── M06-Developer-Project-Admin.dc.html
│   └── 03-Developer-Partner/
│       ├── M08-Dashboard-Developer.dc.html
│       ├── M06-Profil-Developer.dc.html
│       ├── M06-Kelola-Proyek.dc.html
│       ├── M06-Form-Proyek.dc.html
│       ├── M06-Detail-Proyek.dc.html
│       ├── M06-Marketing-Kit.dc.html
│       ├── M06-Review-Klaim.dc.html
│       ├── M05-Ajukan-Event-Mitra.dc.html
│       └── M04-Hasil-Kemitraan.dc.html
└── Mobile/                      # 390×844, breakpoint mobile — struktur cermin persis Desktop/
    └── (folder & nama file sama persis seperti Desktop/, isi disesuaikan breakpoint)
```

**Kenapa modul dulu baru fase, bukan sebaliknya**: kode fase (A–F) di tabel status di bawah
cuma urutan kerja saya membangunnya — begitu semua selesai, label itu tidak bermakna lagi buat
yang mencari layar tertentu. Kode modul (M01–M15) itu kosakata permanen proyek ini (dipakai di
permission, migration, audit) jadi itu yang dipakai sebagai struktur folder, bukan fase.

## Cara baca untuk AI coding agent / developer yang membangun app

1. Baca `MODULES.md` dulu — tahu modul mana yang sedang dikerjakan dari kode M-xx di nama file.
2. Baca `Design-System.dc.html` — token warna/tipografi/badge status WAJIB dipakai persis,
   jangan mengarang warna atau status baru.
3. Untuk satu layar, **selalu bandingkan Desktop/ dan Mobile/ berdampingan** (nama file sama
   persis di kedua folder) — keduanya harus punya destinasi/fungsi yang identik, cuma tata
   letak yang beda (lihat breakpoint di `MODULES.md`).
4. Isi teks Indonesia di dalam `.dc.html` adalah **contoh/placeholder**, bukan salinan final —
   yang mengikat adalah struktur, state (loading/empty/error), dan field yang dipakai (semua
   sudah diverifikasi ke skema Supabase live, lihat komentar di dalam tiap file).
5. Setiap file yang belum ada = belum didesain sama sekali (bukan "sedang dikerjakan diam-diam") —
   cek tabel status di bawah sebelum asumsi sesuatu sudah final.

## Status pengerjaan (Fase A–F)

| Fase | File yang sudah ada | Status | Menyusul |
|---|---|---|---|
| **Foundation** | `Design-System.dc.html`, `tokens.css` | ✅ Selesai | — |
| **Fase A — Publik** | `00-Publik/M11-Homepage.dc.html`, `M11-Discovery.dc.html`, `M11-Detail-Listing.dc.html`, `M11-Detail-Agen-Desktop.dc.html`, `M11-Detail-Organisasi-Desktop.dc.html`, `M11-Detail-Developer-Project-Desktop.dc.html`, `M11-Detail-Event-Desktop.dc.html`, `M11-Detail-Learning-Desktop.dc.html`, `M11-Detail-Learning-Session-Desktop.dc.html`, `M11-Konten-Publik-Desktop.dc.html`, `M11-Konten-Publik-Detail-Desktop.dc.html`, `M11-Promo-Desktop.dc.html`, `M11-Promo-Detail-Desktop.dc.html`, `M01-Register-Desktop.dc.html`, `M01-OTP-Desktop.dc.html`, `M01-Login-Desktop.dc.html`, `M01-Recovery-Desktop.dc.html` (+ padanan Mobile) | ✅ Selesai — 10 dari 10 surface M11 spec §4.1 sudah punya wireframe | — |
| **Fase B — Agent core** | `01-Agent/M08-Dashboard.dc.html`, `01-Agent/M03-Listing-Saya.dc.html`, `01-Agent/M01-Akun-Dibatasi.dc.html`, `01-Agent/M02-Profil-Saya.dc.html`, `01-Agent/M03-Create-Listing-Wizard.dc.html`, `01-Agent/M03-Listing-Detail.dc.html`, `01-Agent/M12-Organisasi-Dashboard.dc.html`, `01-Agent/M12-Buat-Organisasi.dc.html`, `01-Agent/M12-Kelola-Anggota.dc.html`, `01-Agent/M04-Pembelajaran.dc.html`, `01-Agent/M04-Belajar-Course.dc.html`, `01-Agent/M05-Event-Saya.dc.html`, `01-Agent/M05-Ajukan-Event.dc.html` | ✅ Selesai | — |
| **Fase C — Agent fitur baru** | `01-Agent/M06-Klaim-Proyek.dc.html`, `01-Agent/M07-Kalkulator-DBR.dc.html`, `01-Agent/M07-Riwayat-DBR.dc.html`, `01-Agent/M13-Koneksi-AI.dc.html`, `01-Agent/M13-AI-Assistant.dc.html`, `01-Agent/M14-Katalog-Komersial.dc.html`, `01-Agent/M14-Pesanan-Kuota.dc.html` | ✅ Selesai | — |
| **Fase D — Admin** | `02-Admin/M09-Direktori-Pengguna.dc.html`, `M09-Staf-Internal.dc.html`, `M10-Matriks-Izin.dc.html` (baseline Role×Permission + Preset Agent + assign), `M09-Konten-Notifikasi.dc.html` (Banner + Notification Templates + Push manual), `M09-Konfigurasi-Sistem.dc.html` (System Config + SEO Config, Superadmin-only), `M09-Audit-Oversight.dc.html` (Audit Log + Export + antrean Review Agent), `M03-Moderasi-Listing.dc.html` (+ tab Leads), `M07-Bank-Master.dc.html` (+ tab oversight simulasi DBR), `M13-Provider-Catalogue.dc.html` (+ tab Koneksi Agent/force-action), `M04-Learning-Economy-Config.dc.html` (+ tab Katalog Aktivitas + Poin/Sertifikat), `M14-Komersial-Admin.dc.html` (Reconciliation + Manual Correction terpisah), `M15-Award-Appeal.dc.html` (decide + restore terpisah), `M15-Awarding-Path-Admin.dc.html` (Title + Path/Versi + Cakupan Otoritas), `M06-Developer-Project-Admin.dc.html` (sisi staf, bukan self-service Developer Partner) | ✅ Selesai | — |
| **Fase E — Qualification/Award** | `01-Agent/M15-Evidence.dc.html` (ajukan bukti kualifikasi), `01-Agent/M15-Evaluasi.dc.html` (riwayat evaluasi + Penghargaan Saya), `01-Agent/M15-Title-Award-Presentation.dc.html` (atur title mana + urutan tampil di profil publik) — dijangkau dari kartu "Kualifikasi & Penghargaan" di Dashboard dan kartu "Title & Penghargaan" di Profil Saya (M02), sama seperti Kalkulator DBR/Klaim Proyek — TIDAK ada slot nav rail 8-item baru (STEP13-E §4.2 mengunci 8 destinasi, tidak diubah) | ✅ Selesai | — | **Diperbaiki 2026-09-24 (deep scan):** nav 8 tujuan yang bisa disembunyikan, keadaan memuat/gagal/kosong, jejak Bukti > Evaluasi > Award, konteks versi jalur/aturan, banding award dicabut di sisi Agent, presentasi hanya untuk award aktif/dipulihkan dengan bar simpan, dan kontrol yang bisa dipakai keyboard. Bergantung pada migration 0128 (sudah diterapkan).
| **Analytics Admin (tambahan di luar Fase A–F)** | `02-Admin/M09-Dashboard-Analytics.dc.html` — dashboard investor: filter rentang (7/14/30 hari, bulan ini, kustom) + perbandingan periode, KPI, time series pengguna/marketplace/organisasi/learning/komersial, funnel, retensi kohort, export Excel/PDF (Superadmin saja, mengikuti `m09.administrative_export.export`). Definisi angka mengikuti `docs/analytics/METRIC_DEFINITIONS_v1.md`. Tren agen suspended dan organisasi ditutup sengaja TIDAK ditampilkan (hanya angka stok suspended saat ini). Menu "Dashboard Analytics" ditambahkan sebagai item pertama nav di 14 layar Admin lain. Backend sudah ada (migration 0123–0124, route `/api/admin/analytics/dashboard` dan `/export`); satu-satunya yang menunggu: pemanggil harian snapshot (Vercel Cron) sampai proyek terhubung ke Vercel. | ✅ Wireframe selesai | Sisi Agent (analitik pribadi) |
| **Analytics Agent (tambahan di luar Fase A–F)** | `01-Agent/M08-Statistik-Saya.dc.html` — statistik pribadi agen: filter rentang (7/14/30 hari, bulan ini, kustom) + perbandingan periode; ringkasan; performa listing (dilihat, lead, konversi, listing terbaik); pipeline lead; kondisi listing; kuota refresh; learning dan kalkulator DBR; perbandingan anonim dengan agen lain (butuh minimal 30 agen pembanding); tab "Organisasi" hanya untuk pemimpin organisasi; export Excel/PDF milik sendiri. Dijangkau dari kartu Quick Action "Statistik Saya" di Dashboard (nav rail 8-item tidak diubah, STEP13-E §4.2). Data mengikuti tabel yang sudah ada (listing_views, listing_leads, quota_usage, dbr_simulations, dst.). Backend sudah ada (migration 0125, route `/api/agents/me/statistics` dan `/export`, izin baru `m08.dashboard_projection.export`, perbandingan anonim, cek pemimpin organisasi di DB). | ✅ Wireframe + backend selesai | — |
| **Fase F — Developer Partner** | `03-Developer-Partner/`: `M08-Dashboard-Developer`, `M06-Profil-Developer`, `M06-Kelola-Proyek`, `M06-Form-Proyek` (wizard 6 langkah), `M06-Detail-Proyek` (+ Media), `M06-Marketing-Kit`, `M06-Review-Klaim`, `M05-Ajukan-Event-Mitra`, `M04-Hasil-Kemitraan` (masing-masing Desktop + Mobile). Shell: nav rail 7 tujuan yang bisa disembunyikan (desktop) / drawer (mobile), tanpa Context Switcher. Sumber lengkap dan temuan celah: [`SOURCE-Developer-Partner.md`](SOURCE-Developer-Partner.md). Ditambah di layar Agent `01-Agent/M06-Klaim-Proyek` (DEV-008: Buat Listing dari Proyek + Approval PDF) dan teks penunjuk di `02-Admin/M06-Developer-Project-Admin`. | ✅ Wireframe selesai | Keputusan produk A (mitra boleh edit profil perusahaan?) dan perbaikan 3 celah RLS (klaim, proyek, event); filter "milik saya" + agregat klaim + unggah file di backend | **Dikoreksi 2026-09-24 (deep scan kedua):** teks Coming Soon (tampil publik "Segera hadir"), akun belum terhubung tidak lagi memblokir Event dan Hasil Kemitraan, tombol Simpan Draf dihapus, Ubah hasil kemitraan, keadaan memuat/gagal di Dashboard, Profil, Detail, Form, Event, dan Klaim, validasi kecamatan dan harga, saklar `aria-checked`, dialog `role=dialog`, target sentuh 44px di mobile. Layar publik `M11-Detail-Developer-Project`: badge eksklusivitas dihapus, ditambah logo dan Tentang Developer.
| **Fase G — Instructor + Pusat Notifikasi** | 7 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Instructor.md`): `04-Instructor/` = Dashboard, Sesi Saya, Form Sesi, Detail Sesi (ringkasan/peserta & kehadiran/penyelesaian/artefak/tim), Event Instruktur, Profil; `06-Bersama/` = Pusat Notifikasi (satu layar untuk semua peran). **Bergantung pada celah backend yang belum diperbaiki**: daftar peserta sesi (pemilik tak bisa melihat), akses instruktur yang ditugaskan, daftar pendaftar event, dan pemicu notifikasi bisnis (hanya push manual Admin) | Belum: migration perbaikan celah tersebut |
| **Fase H — Buyer** | — | ⛔ DIBATALKAN 2026-09-24 atas keputusan pemilik produk: role Buyer tidak mendapat persona/shell sendiri; pembeli diperlakukan sebagai pengunjung Publik (`00-Publik`) atau Agent. Role `buyer` masih ada di database (belum dihapus/dinonaktifkan) | — |
| **Fase D-lanjutan — Admin** | 5 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Admin-Kursus-Redirect.md`): `02-Admin/` = M04 Kelola Kursus, Form Kursus, Detail Kursus (ringkasan/status, pelajaran, kuis, peserta), Editor Kuis, dan M11 Pengalihan URL. Nav Admin +2 item (Kelola Kursus, Pengalihan URL) ditambahkan ke 15 layar Admin lama. **Celah backend ditutup migration 0130 (diterapkan)**: self-complete enrollment, Instructor self-publish, skor kuis palsu/dinilai per soal terjawab, validasi jalur pengalihan. **Masih terbuka**: tidak ada API ubah/hapus kuis-soal-opsi dan baca opsi, daftar peserta per kursus untuk staf, PUT pengalihan, dan url_redirects belum dipakai aplikasi publik | Belum: layar Instruktur "Kursus Saya"; mekanisme "minta terbit" |
| **Fase C-lanjutan — Agent** | 1 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Agent-Langganan.md`): `01-Agent/M14-Langganan-Saya` (hanya baca) + tombol "Langganan Saya" di Katalog Komersial dan Pesanan & Kuota. **Temuan**: pembelian/perpanjangan/pembatalan langganan dan API baca belum ada (layar dirancang baca-saja); **harga pesanan ditentukan klien** (diuji: amount=1 diterima untuk addon berharga 500.000) | Belum: migration harga pesanan; route `/agents/me/subscriptions` |
| **Katalog Add-on (Admin M14)** | 2 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Admin-Addon.md`): `02-Admin/M14-Katalog-Addon`, `M14-Form-Addon`; nav Admin +1 item (Katalog Add-on) di semua layar Admin. Route baru: `/admin/commercial/addons` (+ `[id]`, `[id]/status`) dan `/admin/commercial/promotions`. **Migration 0132 diterapkan** (kunci syarat setelah ada pesanan, CHECK katalog). Temuan: add-on "slot listing" tak punya konsumen di sistem | Belum: pembuatan/pengubahan promosi |

## Prinsip desain (ringkas)

- **Tidak ada status/field karangan** — setiap badge status di `Design-System.dc.html` diselaraskan
  persis dengan CHECK constraint tabel Supabase live.
- **Material-inspired**, warna diturunkan dari logo RumahAgen (biru = kepercayaan, emas = kemitraan),
  font tunggal Plus Jakarta Sans.
- Setiap layar app-shell (Dashboard/Listing/Admin) punya state kosong/loading/error/sukses,
  target sentuh ≥44px, navigasi hide/show tidak terkunci.
- Nav rail Agent (8 item) dan nav publik (10 item) mengikuti kontrak resmi
  `STEP13-E_SUCCESSOR_INTEGRATED_UI_UX_SPECIFICATION §4` — lihat komentar di dalam masing-masing
  file `.dc.html` untuk rujukan pasal spesifik.

---
*Diekspor otomatis dari canvas Claude Design pada 2026-09-24. Untuk update terbaru, selalu
rujuk link canvas hidup di atas — folder ini bisa jadi ketinggalan kalau canvas terus diedit
tanpa export ulang.*
