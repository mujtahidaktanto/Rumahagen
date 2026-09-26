# RumahAgen Wireframe v2 — Salinan Ekspor dari Claude Design

Ini adalah **salinan cadangan/arsip** dari wireframe interaktif yang sedang dikerjakan di
Claude Design (Artifact "Design" — canvas dengan artboard hidup, state loading/empty/error,
dan komponen interaktif nyata). Wireframe ini menggantikan pendekatan lama di
`docs/design/wireframes/` (WF-00–WF-11, PNG statis) karena divalidasi langsung terhadap
skema Supabase live (`jawywzavznjekxxlhwqo`, migration #0001–#0151 per 2026-09-25; 0146 dicadangkan, belum ada), bukan cuma dokumen spesifikasi.
Isi saat ini: **186 layar** (93 Desktop + 93 Mobile) + `Design-System.dc.html`. Canvas hidup versi 111.

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
├── Desktop/                    # 1440×900, breakpoint desktop (93 layar)
│   ├── 00-Publik/              # 19: M01 Login/OTP/Recovery/Register; M02 Beri-Ulasan; M04 Verifikasi-Sertifikat (/verifikasi/{kode});
│   │                           #     M11 Homepage, Discovery, Detail-Listing, Detail-Agen/Organisasi/Developer-Project/Event/
│   │                           #     Learning/Learning-Session, Konten-Publik (+Detail), Promo (+Detail)
│   ├── 01-Agent/               # 25: M01 Akun-Dibatasi; M02 Profil-Saya; M03 Listing-Saya, Create-Listing-Wizard, Listing-Detail;
│   │                           #     M04 Pembelajaran, Belajar-Course; M05 Event-Saya, Ajukan-Event; M06 Klaim-Proyek;
│   │                           #     M07 Kalkulator-DBR, Riwayat-DBR; M08 Dashboard, Statistik-Saya;
│   │                           #     M12 Organisasi-Dashboard (+kartu "Undangan untuk Anda"), Buat-Organisasi, Kelola-Anggota;
│   │                           #     M13 Koneksi-AI, AI-Assistant; M14 Katalog-Komersial, Pesanan-Kuota, Langganan-Saya;
│   │                           #     M15 Evidence, Evaluasi, Title-Award-Presentation
│   ├── 02-Admin/               # 29: M03 Moderasi-Listing; M04 Kelola-Kursus, Form-Kursus, Detail-Kursus, Editor-Kuis,
│   │                           #     Learning-Economy-Config, Konfigurasi-Belajar, Sertifikat-Kursus; M06 Developer-Project-Admin;
│   │                           #     M07 Bank-Master; M09 Dashboard-Analytics, Form-Banner, Form-Konten-Publik, Direktori-Pengguna, Staf-Internal, Konten-Notifikasi,
│   │                           #     Konfigurasi-Sistem, Audit-Oversight; M10 Matriks-Izin; M11 Pengalihan-URL; M13 Provider-Catalogue;
│   │                           #     M14 Komersial-Admin, Katalog-Addon, Form-Addon, Promosi-Admin, Form-Promosi, Katalog-Paket;
│   │                           #     M15 Award-Appeal, Awarding-Path-Admin
│   ├── 03-Developer-Partner/   # 9: M04 Hasil-Kemitraan; M05 Ajukan-Event-Mitra; M06 Detail-Proyek, Form-Proyek, Kelola-Proyek,
│   │                           #    Marketing-Kit, Profil-Developer, Review-Klaim; M08 Dashboard-Developer
│   ├── 04-Instructor/          # 10: M02 Profil-Instruktur; M04 Kursus-Saya, Form-Kursus, Detail-Kursus, Editor-Kuis, Sesi-Saya,
│   │                           #     Form-Sesi, Detail-Sesi; M05 Event-Instruktur; M08 Dashboard-Instruktur
│   └── 06-Bersama/             # 1: M08 Pusat-Notifikasi (satu layar untuk semua peran)
└── Mobile/                     # 390×844, breakpoint mobile — 90 layar, struktur folder cermin Desktop/
                                # Nama file sama persis, KECUALI 00-Publik: layar M01 dan M11 (selain Homepage, Discovery,
                                # Detail-Listing) dan M04-Verifikasi-Sertifikat berakhiran -Mobile, bukan -Desktop.
```

Tidak ada folder `05-*` (dulu direncanakan untuk Buyer; dibatalkan 2026-09-24).

**Kenapa modul dulu baru fase, bukan sebaliknya**: kode fase (A–F) di tabel status di bawah
cuma urutan kerja saya membangunnya — begitu semua selesai, label itu tidak bermakna lagi buat
yang mencari layar tertentu. Kode modul (M01–M15) itu kosakata permanen proyek ini (dipakai di
permission, migration, audit) jadi itu yang dipakai sebagai struktur folder, bukan fase.

## Cara baca untuk AI coding agent / developer yang membangun app

1. Baca `MODULES.md` dulu — tahu modul mana yang sedang dikerjakan dari kode M-xx di nama file.
2. Baca `Design-System.dc.html` — token warna/tipografi/badge status WAJIB dipakai persis,
   jangan mengarang warna atau status baru.
3. Untuk satu layar, **selalu bandingkan Desktop/ dan Mobile/ berdampingan** (nama file sama
   di kedua folder, kecuali akhiran -Desktop/-Mobile di `00-Publik`) — keduanya harus punya destinasi/fungsi yang identik, cuma tata
   letak yang beda (lihat breakpoint di `MODULES.md`).
4. Isi teks Indonesia di dalam `.dc.html` adalah **contoh/placeholder**, bukan salinan final —
   yang mengikat adalah struktur, state (loading/empty/error), dan field yang dipakai (semua
   sudah diverifikasi ke skema Supabase live, lihat komentar di dalam tiap file).
5. Setiap file yang belum ada = belum didesain sama sekali (bukan "sedang dikerjakan diam-diam") —
   cek tabel status di bawah sebelum asumsi sesuatu sudah final.

6. **Format `.dc.html` tidak bisa dibaca alat yang tidak menjalankan runtime Claude Design** (mis. Bolt).
   Untuk serah-terima ke alat semacam itu, ekspor tiap layar ke PNG dari canvas hidup dan sertakan daftar
   layar serta kontrak API; jangan berikan berkas `.dc.html` mentah.

## Status pengerjaan (Fase A–F dan tambahan)

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
| **Fase G — Instructor + Pusat Notifikasi** | 7 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Instructor.md`): `04-Instructor/` = Dashboard, Sesi Saya, Form Sesi, Detail Sesi (ringkasan/peserta & kehadiran/penyelesaian/artefak/tim), Event Instruktur, Profil; `06-Bersama/` = Pusat Notifikasi (satu layar untuk semua peran). **Bergantung pada celah backend yang belum diperbaiki**: daftar peserta sesi (pemilik tak bisa melihat), akses instruktur yang ditugaskan, daftar pendaftar event, dan pemicu notifikasi bisnis (hanya push manual Admin) | ✅ Celah backend ditutup migration 0129 (diterapkan); pemicu notifikasi bisnis bertambah di 0151 (lihat baris M04 MVP) |
| **Fase H — Buyer** | — | ⛔ DIBATALKAN 2026-09-24 atas keputusan pemilik produk: role Buyer tidak mendapat persona/shell sendiri; pembeli diperlakukan sebagai pengunjung Publik (`00-Publik`) atau Agent. Role `buyer` masih ada di database (belum dihapus/dinonaktifkan) | — |
| **Fase D-lanjutan — Admin** | 5 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Admin-Kursus-Redirect.md`): `02-Admin/` = M04 Kelola Kursus, Form Kursus, Detail Kursus (ringkasan/status, pelajaran, kuis, peserta), Editor Kuis, dan M11 Pengalihan URL. Nav Admin +2 item (Kelola Kursus, Pengalihan URL) ditambahkan ke 15 layar Admin lama. **Celah backend ditutup migration 0130 (diterapkan)**: self-complete enrollment, Instructor self-publish, skor kuis palsu/dinilai per soal terjawab, validasi jalur pengalihan. **Masih terbuka**: tidak ada API ubah/hapus kuis-soal-opsi dan baca opsi, daftar peserta per kursus untuk staf, PUT pengalihan, dan url_redirects belum dipakai aplikasi publik | ✅ 2026-09-24: layar Instruktur "Kursus Saya" (4 layar, `SOURCE-Instructor-Kursus.md`), alur minta terbit/tinjau, API kuis, dan pengalihan URL aktif ditulis; **migration 0135–0137 diterapkan 2026-09-24** |
| **Fase C-lanjutan — Agent** | 1 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Agent-Langganan.md`): `01-Agent/M14-Langganan-Saya` (hanya baca) + tombol "Langganan Saya" di Katalog Komersial dan Pesanan & Kuota. **Temuan**: pembelian/perpanjangan/pembatalan langganan dan API baca belum ada (layar dirancang baca-saja); **harga pesanan ditentukan klien** (diuji: amount=1 diterima untuk addon berharga 500.000) | Harga pesanan ditutup 0131; route `GET /agents/me/subscriptions` ditambahkan (2026-09-24). Belum: pembelian/perpanjangan/pembatalan langganan, langganan organisasi |
| **Katalog Add-on (Admin M14)** | 2 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Admin-Addon.md`): `02-Admin/M14-Katalog-Addon`, `M14-Form-Addon`; nav Admin +1 item (Katalog Add-on) di semua layar Admin. Route baru: `/admin/commercial/addons` (+ `[id]`, `[id]/status`) dan `/admin/commercial/promotions`. **Migration 0132 diterapkan** (kunci syarat setelah ada pesanan, CHECK katalog). Temuan: add-on "slot listing" tak punya konsumen di sistem | Belum: pembuatan/pengubahan promosi |
| **Promosi (Admin M14)** | 2 layar × desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: bagian 5 `SOURCE-Admin-Addon.md`): `02-Admin/M14-Promosi-Admin`, `M14-Form-Promosi`; nav Admin +1 item (Promosi) di semua layar Admin. Memakai API `/admin/commercial/promotions` dan migration 0133 (diterapkan) | Pilihan promosi di Form Add-on kini memakai daftar promosi asli (kartu pilihan + status efektif, keadaan memuat/kosong/gagal). Aturan kelayakan promosi digambar (Form Promosi, kolom Kelayakan/Pemakaian, ringkasan di Form Add-on); **migration 0134 diterapkan**. `rule_configuration` diterapkan lewat migration 0145 (kartu Aturan tambahan di Form Promosi) |
| **Kuota Listing (M03 x M14)** | 4 layar Agent/Admin × desktop+mobile diperbarui | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Kuota-Listing.md`): wizard langkah 1 & 9, Listing Saya, Organisasi Dashboard, Admin Konfigurasi Sistem tab Kuota Listing. Backend: migration 0140–0141 (diterapkan) + API listing-quota | Selesai juga: jenis kapasitas `listing_slot` di Form/Katalog Add-on Admin dan pemasaran slot di Katalog Komersial Agent |
| **Langganan Pro (M14)** | Langganan Saya diperbarui + Katalog Paket (Admin) baru, desktop+mobile | ✅ Wireframe selesai 2026-09-24 (sumber: `SOURCE-Langganan-Pro.md`): beli paket Pro dengan pilihan pemilik (pribadi/organisasi, leader saja), katalog paket admin (harga per cakupan, aktifkan). Backend: migration 0142 (diterapkan) + API plans/orders | Selesai juga: item menu Admin "Paket Langganan" di semua layar Admin. Selesai juga: promosi untuk paket (migration 0143) |
| **M04 MVP — Sertifikat & Konfigurasi Belajar** | 8 layar × desktop+mobile baru/diperbarui | ✅ Wireframe selesai 2026-09-25: `02-Admin/M04-Konfigurasi-Belajar` (tab Umum, Kuis & Kelulusan, Sertifikat & LP: template, logo, nama/jabatan/tanda tangan penandatangan) dan `M04-Sertifikat-Kursus` (template + logo mitra per kursus, terbitkan/cabut); nav "Konfigurasi Belajar" di semua layar Admin; `01-Agent/M04-Pembelajaran` (kartu Sertifikat Saya) dan `M04-Belajar-Course` (unduh PDF); `00-Publik/M04-Verifikasi-Sertifikat` (tujuan QR). Backend: **migration 0150 diterapkan** (nomor `RA-{tahun}-{6 digit}`, kode verifikasi, 4 template PDF: Klasik/Modern/Korporat/Premium, aturan kuis pihak ketiga, LP awal 25), API `/admin/learning/settings`, `/courses/{id}/certificate*`, `/certificates/*`, `/agents/me/certificates`, dan halaman Next.js `/verifikasi/{kode}` | Konsol M04 penuh (18 bagian di luar MVP) belum dibangun |
| **Notifikasi organisasi & sertifikat (M08/M12)** | `01-Agent/M12-Organisasi-Dashboard`, `06-Bersama/M08-Pusat-Notifikasi` diperbarui | ✅ 2026-09-25: kartu "Undangan untuk Anda" (terima/tolak, kedaluwarsa, skenario lambat/gagal) pada keadaan belum tergabung organisasi; Pusat Notifikasi memuat contoh "Undangan bergabung organisasi" dan "Sertifikat dicabut". **Migration 0151 diterapkan**: trigger notifikasi undangan/permohonan organisasi dan notifikasi saat sertifikat dicabut | — |
| **Penyelarasan M11 Discovery + Detail Agen (2026-09-26)** | 2 layar × desktop+mobile diperbarui | ✅ `M11-Discovery`: pemisah Dijual/Disewa (bawaan Dijual), jumlah per jenis, urutan 3 pilihan (Terbaru, Harga terendah, Harga tertinggi), dua keadaan kosong (belum ada listing vs filter terlalu ketat), keadaan gagal dan tab Organisasi di mobile, lencana jumlah filter di mobile. `M11-Detail-Agen`: profil privat = "tidak ditemukan" (tidak dibedakan), keadaan profil gagal dimuat, nomor WhatsApp tampil, baris Kantor dihapus (organisasi berupa teks di kepala profil), peringkat hanya bila ada ulasan, catatan 10 ulasan terbaru, galat per bagian (portofolio/ulasan). **Tidak diubah atas keputusan pemilik produk:** `M11-Detail-Listing` (peta, Telepon Agent, Kalkulator DBR, listing serupa) dan `M11-Detail-Event`/`Detail-Developer-Project` (kuota terisi, daftar tunggu, komisi) dikerjakan setelah semua layar dibuat | — |
| **Penyelarasan M01 Auth (2026-09-26)** | 4 layar × desktop+mobile diperbarui | ✅ `M01-Register` (hanya nama lengkap, tanpa WhatsApp; ditambah Ulangi Password), `M01-OTP` (Verifikasi Email: kode 6 digit ke email, cek folder spam, Ubah email), `M01-Login` (label Email saja; "Ingat saya" dihapus karena tidak ada di implementasi), `01-Agent/M01-Akun-Dibatasi` (skenario baru `pending_review`, lencana peringatan). Mengikuti keputusan pemilik produk 2026-09-26 dan halaman yang sudah dibangun | — |
| **Pembaruan Fase 2 — Ulasan, CTA promo, Konten Publik, Title kursus (2026-09-26)** | 3 layar baru + 3 diperbarui × desktop+mobile | ✅ Wireframe selesai 2026-09-26: `00-Publik/M02-Beri-Ulasan` (rating 1–5, tampil sebagai nama/anonim, komentar; keadaan belum login, peran tak berizin, profil sendiri, kirim/gagal/dibatasi/sukses; tautan "Tulis Ulasan" ditambahkan di `M11-Detail-Agen`); `02-Admin/M09-Form-Banner` (jenis CTA + pemilih isi: proyek/kursus/event dari data, halaman tetap, WhatsApp, tautan luar; jadwal, prioritas, status, pratinjau Detail Promo); `02-Admin/M09-Form-Konten-Publik` (judul, slug, isi, SEO, indeks, sitemap, siklus status; halaman footer dikunci); `M09-Konten-Notifikasi` diperbarui (banner diedit di layar Form, tab baru "Konten Publik", keadaan memuat/kosong/gagal); `M04-Sertifikat-Kursus` diperbarui (kartu "Title setelah lulus": pilih title aktif, backfill lulusan, title nonaktif, ditolak 409; baris Title di pratinjau; tombol Hapus tanda tangan kini terhubung). **Bergantung pada**: format `cta_reference` terstruktur (`lib/public/cta.ts`, sudah dipakai halaman publik) dan `awards_title_definition_id` (migration 0155). **Celah backend**: belum ada API admin untuk `static_public_content` (hanya RLS Admin/Superadmin), belum ada validasi `cta_reference` di `POST/PUT /admin/banners`, belum ada unggah gambar banner, API ulasan belum melarang ulasan ke profil sendiri atau membatasi satu ulasan per pengulas | — |

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
*Diekspor dari canvas Claude Design pada 2026-09-24, disinkronkan dan diperbarui sampai 2026-09-25. Untuk update terbaru, selalu
rujuk link canvas hidup di atas — folder ini bisa jadi ketinggalan kalau canvas terus diedit
tanpa export ulang.*

**Update 2026-09-25 (keadaan memuat/kosong/gagal):** 13 layar yang sebelumnya tanpa keadaan itu kini punya prop `keadaan` di editor (Desktop + Mobile; tombol "Coba Lagi" kembali ke normal). Data: Admin Bank Master, Matriks Izin, Provider AI, Jalur Penghargaan, Komersial & Rekonsiliasi; Agent Katalog Komersial (kisi add-on). Halaman detail publik (Listing, Developer Project, Event, Learning, Promo) memakai `memuat` / `tidak_ditemukan` / `gagal_muat`. Formulir: Lupa Password (+ memproses, gagal kirim, link kedaluwarsa) dan Buat Organisasi (+ galat simpan). Cakupan (heuristik `audit_states`): loading 106/180, kosong 151/180, galat 123/180.

**Update 2026-09-25 (keputusan privasi profil, KTP, dan moderasi):**
- `01-Agent/M02-Profil-Saya`: kartu **Verifikasi KTP** (unggah foto KTP + isi nomor KTP/NIK, privat, verified otomatis, lencana), kontak WhatsApp selalu publik (toggle "Tampilkan Kontak" dihapus), aturan title 1 utama + 3 tambahan.
- `00-Publik/M11-Detail-Agen`: lencana Terverifikasi dari KTP, WhatsApp selalu tampil, jumlah listing aktif, nomor lisensi, nama organisasi, dan title 1+3.
- `01-Agent/M15-Title-Award-Presentation`: pilih 1 utama + 3 tambahan (0 award kosong, 1 otomatis utama, 2–4 semua tampil, lebih dari 4 pilih sendiri).
- `03-Developer-Partner/M06-Review-Klaim`: nama + kontak (WhatsApp, email) Agent yang mengklaim.
- `02-Admin/M09-Direktori-Pengguna`: tautan **KTP** per Agent (lihat nomor + foto, cabut verifikasi dengan alasan wajib; akses tercatat audit).
- `02-Admin/M03-Moderasi-Listing`: tab **Listing Terbit & Suspend** dan dialog Suspend seluruh listing (tanpa alasan pada MVP, bukan per foto) serta Aktifkan Kembali.
