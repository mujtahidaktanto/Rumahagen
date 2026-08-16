# User Flow — Platform Web RUMAHAGEN

**Dokumen pendamping:** PRD-RUMAHAGEN.md v1.2
**Versi:** 1.2 (Sinkronisasi REQ-XXX + alur Modul 12/13)
**Tanggal:** 5 Agustus 2026
**Status:** Approved (kandidat Baseline — belum berubah status pada revisi ini)

> **Catatan Revisi v1.2 (siklus Engineering Alignment, 5 Agustus 2026):** Perubahan **MINOR** — aditif, tidak mengubah alur v1.1 yang sudah ada. Rincian: (1) setiap modul existing kini mencantumkan baris **Requirement Terkait** merujuk `REQ-M0X-NNN` di PRD v1.2; (2) ditambahkan alur penuh **Modul 12 (Organization Management System)** — 3 diagram: buat Organization, undang/gabung anggota (2 arah), keluar/bubar; (3) ditambahkan alur penuh **Modul 13 (AI Assistant BYOK)** — 2 diagram: koneksi provider, chat; (4) Peta Navigasi Lintas Modul diperbarui menyertakan M12/M13. **Modul 11 (SEO & Analytics) tetap tidak memiliki diagram alur tersendiri** — dikonfirmasi ini konsisten dengan pola v1.1 (modul teknis/backend tanpa journey pengguna diskret), bukan gap yang terlewat.

> **Catatan Revisi v1.1 (dipertahankan sebagai riwayat):** Alur Modul 9 & 10.3 diperbaiki — sebelumnya keliru menyebut Manager dibatasi "tim/wilayah" dan memperkenalkan level izin "Scoped (tim/wilayah)" yang tidak pernah ada di skema RBAC (ERD hanya mengenal `all`/`own`/`none`). Kini diselaraskan dengan PRD Modul 10 & ERD: **Manager selalu global (`all`)**, tanpa pengecualian tim/wilayah.

Dokumen ini menjabarkan alur pengguna (user flow) langkah-demi-langkah untuk setiap modul, termasuk titik keputusan (decision point), percabangan (branching), dan kondisi error/edge case utama.

---

## MODUL 1 — Registrasi & Autentikasi Agen

**Aktor:** Calon Agen, Admin  
**Requirement Terkait:** REQ-M01-001 s.d. 006

```
[Start] Buka halaman "Daftar sebagai Agen"
   │
   ▼
Isi form registrasi (nama, email, no. HP, password)
   │
   ▼
Submit form ──► Sistem kirim OTP ke email/HP
   │
   ▼
Input kode OTP
   │
   ├─ OTP salah/kadaluarsa ──► Tampilkan error → opsi "Kirim ulang OTP" → kembali ke step verifikasi
   │
   ▼ OTP benar
Akun terbuat dengan status "Menunggu Kelengkapan Data"
   │
   ▼
Lengkapi profil wajib: KTP, NPWP (opsional), area operasional, nama kantor/brokerage (jika ada), upload sertifikasi (opsional)
   │
   ▼
Submit ──► Status berubah "Pending Review"
   │
   ▼
[Sistem] Kirim notifikasi ke Admin: "Ada agen baru menunggu review"
   │
   ▼
Admin buka detail pengajuan agen ──► Review dokumen
   │
   ├─ Reject ──► Isi alasan penolakan ──► Notifikasi ke agen (email/in-app) ──► Agen dapat revisi & submit ulang → kembali ke "Pending Review"
   │
   ▼ Approve
Status agen → "Active" (resolusi T4-07 — "Verified" bukan status terpisah)
   │
   ▼
Notifikasi ke agen: "Akun Anda telah aktif" ──► Agen dapat login penuh
   │
   ▼
[End] Redirect ke Dashboard Agen (Modul 8)
```

**Alur Login (existing user):**
```
[Start] Buka halaman Login
   │
   ▼
Input email/HP + password (atau SSO Google — **SSO Apple belum diimplementasikan**, roadmap masa depan, resolusi T4-06)
   │
   ├─ Kredensial salah ──► Tampilkan error, opsi "Lupa Password"
   │
   ▼ Berhasil
Cek status akun
   ├─ Status "Pending Review" ──► Redirect ke halaman "Menunggu Approval Admin" (fitur terbatas)
   ├─ Status "Suspended" ──► Tampilkan pesan akun ditangguhkan + kontak support
   │
   ▼ Status "Active"
[End] Masuk ke Dashboard Agen
```

**Alur Lupa Password:**
```
Klik "Lupa Password" → Input email → Sistem kirim link reset →
Klik link → Input password baru → Konfirmasi → Redirect ke Login
```

---

## MODUL 2 — Profil Agen

**Aktor:** Agen (owner), Calon Pembeli (viewer publik), Admin  
**Requirement Terkait:** REQ-M02-001 s.d. 007

```
[Start - Agen] Login → Buka menu "Profil Saya"
   │
   ▼
Tampilkan data profil saat ini (foto, bio, spesialisasi, area, statistik, badge)
   │
   ▼
Klik "Edit Profil"
   │
   ▼
Ubah field (foto, bio, spesialisasi, area, privasi kontak)
   │
   ▼
Simpan
   │
   ├─ Field sensitif (nama, no. lisensi) diubah ──► Status "Menunggu Approval Admin" ──► Admin review → Approve/Reject → Notifikasi ke agen
   │
   ▼ Field non-sensitif
Perubahan langsung tersimpan & tampil real-time
   │
   ▼
[End] Profil ter-update, badge/statistik otomatis sinkron dari Modul 3 & 4
```

**Alur Publik (Calon Pembeli):**
```
[Start] Klik nama agen dari listing / buka link profil publik (domain.com/agen/nama-agen)
   │
   ▼
Tampilkan halaman profil publik: foto, bio, spesialisasi, area, listing aktif agen, badge, rating (hanya review berstatus `approved` yang dihitung/ditampilkan)
   │
   ▼
Klik listing agen ──► ke Detail Listing (Modul 3)
   atau
Klik tombol WhatsApp/Email agen ──► CTA kontak langsung
   atau
Klik "Beri Ulasan" (khusus akun **Buyer** yang login) ──► Isi rating (1-5) & komentar ──► Submit
   │
   ▼
[End]
```

**Alur Submit & Moderasi Review Agen (v1.1 — baru):**
```
[Start - Buyer] Login sbg Buyer → Buka profil agen → Klik "Beri Ulasan"
   │
   ▼
Isi rating (1-5 bintang) & komentar opsional ──► Submit
   │
   ▼
Sistem simpan review dengan status "Pending" ──► BELUM tampil di profil publik
   │
   ▼
[Sistem] Kirim notifikasi ke Admin/Manager/Superadmin: "Ada review baru menunggu moderasi"
   │
   ▼
Admin/Manager/Superadmin buka antrean moderasi review ──► Baca isi review
   │
   ├─ Reject (mis. spam/tidak relevan) ──► Review tidak tampil, tidak ada notifikasi ke Buyer
   │
   ▼ Approve
Review berstatus "Approved" ──► Tampil di profil publik agen & masuk perhitungan rating rata-rata
   │
   ▼
[End]
```

---

## MODUL 3 — Manajemen Listing Properti

**Aktor:** Agen, Admin, Calon Pembeli (Guest)  
**Requirement Terkait:** REQ-M03-001 s.d. 015

### 3.1 Alur Agen — Membuat Listing Baru
```
[Start] Login → Dashboard → Klik "+ Tambah Listing"
   │
   ▼
Pilih Kategori: Primary / Secondary
   │
   ├─ Primary ──► Tampilkan opsi "Tautkan ke Proyek Developer?" (Modul 6)
   │      ├─ Ya ──► Pilih proyek dari katalog ──► Auto-fill harga, spesifikasi, materi marketing (field terkunci/read-only)
   │      └─ Tidak ──► Lanjut input manual (tetap berkategori Primary)
   │
   └─ Secondary ──► Lanjut input manual sepenuhnya
   │
   ▼
Pilih Tujuan Transaksi: Dijual / Disewakan
   │
   ▼
Isi form: Judul, Lokasi (alamat + pin peta), Harga, Deskripsi, Spesifikasi Rumah, Status Legalitas
   │
   ▼
Upload foto (min. 3) + video/virtual tour (opsional) → pilih foto cover
   │
   ▼
Konfirmasi/edit nomor WhatsApp CTA (auto-terisi dari Profil Agen)
   │
   ▼
Preview listing
   │
   ├─ Ada field wajib kosong ──► Tampilkan validasi error → kembali ke form
   │
   ▼ Lengkap
Pilih: "Simpan sebagai Draft" atau "Submit untuk Review"
   │
   ├─ Simpan Draft ──► Status "Draft" → Agen bisa lanjutkan kapan saja
   │
   ▼ Submit Review
Status → "Menunggu Review" ──► Notifikasi ke Admin
   │
   ▼
Admin moderasi (cek konten, legalitas, kewajaran harga)
   │
   ├─ Reject ──► Alasan penolakan ──► Notifikasi ke agen ──► Agen revisi → submit ulang
   │
   ▼ Approve
Status → "Published" ──► Listing tayang di katalog publik
   │
   ▼
[End]
```

### 3.2 Alur Agen — Mengelola Listing Aktif
```
[Start] Buka "Listing Saya" → Lihat daftar listing (dengan status masing-masing)
   │
   ▼
Pilih listing ──► Aksi yang tersedia:
   ├─ Edit ──► Ubah field ──► Jika field harga/spesifikasi pada listing Primary tertaut developer: field terkunci
   ├─ Perpanjang masa tayang ──► Reset tanggal expired
   ├─ Ubah status manual → "Sold" / "Rented" ──► Listing off dari katalog publik, tercatat sbg riwayat closing (statistik ke Profil Agen)
   ├─ Nonaktifkan/Hapus ──► Konfirmasi ──► Listing off dari katalog publik
   └─ Lihat statistik (jumlah view, klik CTA WA)
   │
   ▼
[End]
```

### 3.3 Alur Publik — Pencarian & Detail Listing
```
[Start] Buka halaman Katalog Listing (Home/Search)
   │
   ▼
Terapkan filter: Kategori, Tujuan Transaksi, Tipe Properti, Lokasi, Range Harga, Range Luas, Kamar, Legalitas
   │
   ▼
Pilih Sort: Terbaru / Harga Terendah / Harga Tertinggi / Terpopuler
   │
   ▼
Toggle tampilan: List View / Map View
   │
   ▼
Sistem tampilkan hasil (card listing)
   │
   ├─ Tidak ada hasil ──► Tampilkan pesan "Tidak ditemukan" + saran ubah filter
   │
   ▼ Ada hasil
Klik salah satu card ──► Buka Halaman Detail Listing
   │
   ▼
Tampilkan: galeri foto/video, deskripsi, spesifikasi, lokasi (peta), status legalitas, profil ringkas agen
   │
   ▼
Klik tombol "Chat via WhatsApp"
   │
   ▼
Sistem catat lead event (listing_id, timestamp) ──► Buka wa.me dengan pesan template terisi otomatis
   │
   ▼
[End] Percakapan berlanjut di WhatsApp (di luar sistem)
```

---

## MODUL 4 — Learning Center (Pelatihan Agen)

**Aktor:** Agen, Instruktur/Admin  
**Requirement Terkait:** REQ-M04-001 s.d. 006

### 4.1 Alur Agen — Mengikuti Kursus
```
[Start] Login → Buka menu "Learning Center"
   │
   ▼
Lihat katalog kursus (filter kategori: Sales Skill, Legal, Produk Developer, Financial/KPR)
   │
   ▼
Pilih kursus ──► Lihat detail (silabus, durasi, prasyarat)
   │
   ├─ Ada prasyarat belum lulus ──► Tombol "Daftar" nonaktif, tampilkan info prasyarat
   │
   ▼ Tidak ada prasyarat / sudah terpenuhi
Klik "Daftar Gratis" ──► Langsung terdaftar (tanpa approval)
   │
   ▼
Akses materi (video/PDF/slide) secara berurutan atau bebas
   │
   ▼
Progress tersimpan otomatis per sesi materi
   │
   ▼
Selesai semua materi ──► Buka Kuis Evaluasi
   │
   ▼
Kerjakan & submit kuis
   │
   ├─ Skor < passing grade ──► Tampilkan hasil, opsi "Ulangi Kuis"
   │
   ▼ Skor ≥ passing grade
Sistem generate Sertifikat Digital (PDF)
   │
   ▼
Sertifikat & badge otomatis muncul di Profil Agen (Modul 2)
   │
   ▼
[End] Agen dapat unduh sertifikat / lanjut ke kursus berikutnya
```

### 4.2 Alur Instruktur/Admin — Kelola Konten
```
[Start] Login sbg Admin/Instruktur → Buka "Kelola Learning Center"
   │
   ▼
Pilih: Buat Kursus Baru / Edit Kursus Existing
   │
   ▼
Isi metadata kursus (judul, kategori, deskripsi, prasyarat)
   │
   ▼
Upload materi (video/PDF/slide) per sesi
   │
   ▼
Buat bank soal kuis + tentukan passing grade
   │
   ▼
Jika kursus punya sesi live ──► Buat jadwal ──► Otomatis muncul di Kalender Event (Modul 5)
   │
   ▼
Publish kursus
   │
   ▼
[End] Kursus tampil di katalog Learning Center untuk agen
```

---

## MODUL 5 — Kalender Event

**Aktor:** Agen, Admin, Developer Partner  
**Requirement Terkait:** REQ-M05-001 s.d. 005

### 5.1 Alur Agen — RSVP Event
```
[Start] Buka menu "Kalender Event"
   │
   ▼
Lihat tampilan kalender (bulanan/mingguan) dengan kategori event berwarna beda
   │
   ▼
Filter kategori: Pelatihan / Launching Proyek / Open House / Gathering
   │
   ▼
Klik event ──► Lihat detail (deskripsi, lokasi/link, host, kuota tersisa)
   │
   ▼
Klik "Daftar/RSVP"
   │
   ├─ Kuota penuh ──► Tawarkan masuk "Waiting List"
   │
   ▼ Kuota tersedia
Konfirmasi pendaftaran ──► Status "Terdaftar"
   │
   ▼
Sistem kirim reminder H-1 dan H-1 jam sebelum event (email/push/in-app)
   │
   ▼
[End] Agen hadir di event (offline/online link tersedia saat H-jam)
```

### 5.2 Alur Admin — Membuat Event
```
[Start] Buka "Kelola Event" → Klik "+ Buat Event Baru"
   │
   ▼
Isi form: judul, kategori, tanggal & waktu, lokasi/link, host, kuota
   │
   ▼
Publish langsung (event internal admin)
   │
   ▼
[End] Event tayang di Kalender Event agen
```

### 5.3 Alur Developer Partner — Ajukan Event Launching
```
[Start] Developer Partner login ke portal terbatas → "Ajukan Event"
   │
   ▼
Isi form event (terkait proyek di Modul 6)
   │
   ▼
Submit ──► Status "Menunggu Approval Admin"
   │
   ▼
Admin review
   ├─ Reject ──► Notifikasi alasan ke developer partner
   ▼ Approve
Event tayang di Kalender Event agen
   │
   ▼
[End]
```

---

## MODUL 6 — Direktori Kerjasama Developer

**Aktor:** Admin, Agen, Developer Partner (opsional akses terbatas)  
**Requirement Terkait:** REQ-M06-001 s.d. 006

### 6.1 Alur Admin — Menambahkan Proyek Developer
```
[Start] Buka "Kelola Developer & Proyek" → "+ Tambah Proyek"
   │
   ▼
Isi data developer (nama perusahaan, PIC, kontak)
   │
   ▼
Isi data proyek: nama, lokasi, tipe unit, price list, unit availability, skema komisi
   │
   ▼
Upload materi marketing kit (foto HD, video, brosur PDF)
   │
   ▼
Set status proyek: Aktif / Coming Soon / Sold Out / Non-Aktif
   │
   ▼
Publish
   │
   ▼
[End] Proyek tampil di Katalog Kerjasama Developer untuk agen
```

### 6.2 Alur Agen — Klaim Proyek untuk Dipasarkan
```
[Start] Buka menu "Katalog Kerjasama Developer"
   │
   ▼
Filter/cari proyek (lokasi, tipe, developer)
   │
   ▼
Klik proyek ──► Lihat detail lengkap (price list, komisi, materi marketing)
   │
   ▼
Klik "Klaim Proyek Ini"
   │
   ├─ Proyek bersifat eksklusif wilayah & sudah diklaim agen lain ──► Tampilkan notifikasi tidak tersedia
   │
   ▼ Tersedia
Sistem catat agen sbg salah satu pemasar proyek
   │
   ▼
Tawarkan opsi: "Buat Listing dari Proyek Ini?"
   │
   ├─ Ya ──► Redirect ke form Tambah Listing (Modul 3) dengan data auto-filled (kategori Primary)
   │
   ▼ Tidak
Agen cukup mengunduh materi marketing untuk promosi manual (mis. share ke medsos/WA)
   │
   ▼
[End]
```

---

## MODUL 7 — Sistem Scoring DBR (Kalkulator KPR)

**Aktor:** Agen  
**Requirement Terkait:** REQ-M07-001 s.d. 006

```
[Start] Buka menu "Kalkulator DBR" (dapat diakses dari Dashboard atau langsung dari Detail Listing)
   │
   ▼
Jika dibuka dari Listing ──► Harga properti otomatis ter-input
   │
   ▼
Isi data calon pembeli:
   - Penghasilan bersih bulanan
   - Total cicilan berjalan (kartu kredit, KTA, kendaraan, KPR lain)
   - Harga properti (auto/manual)
   - Uang muka (DP)
   - Tenor (UI dapat menampilkan input dalam tahun untuk kenyamanan pengguna, namun sistem selalu mengonversi & menyimpan dalam satuan bulan — lihat ERD `dbr_simulations.tenor_months`)
   - Estimasi suku bunga (default dari konfigurasi admin, dapat disesuaikan)
   │
   ▼
Klik "Hitung"
   │
   ▼
Sistem hitung:
   - Plafon KPR = Harga - DP
   - Estimasi angsuran bulanan (formula anuitas)
   - DBR% = (Cicilan berjalan + Estimasi angsuran baru) / Penghasilan bersih × 100%
   │
   ▼
Tampilkan hasil + indikator: Layak / Perlu Review / Tidak Layak (berdasarkan threshold DBR)
   │
   ▼
Tampilkan disclaimer: "Hasil ini estimasi awal, keputusan final oleh bank"
   │
   ▼
Agen ingin coba skenario lain?
   │
   ├─ Ya ──► Ubah DP/Tenor/Suku Bunga ──► Sistem hitung ulang real-time ──► kembali ke tampilan hasil
   │
   ▼ Tidak, hasil final
Klik "Simpan sebagai Prospek/Lead"
   │
   ▼
Isi data kontak calon pembeli (nama, no. HP) jika belum ada
   │
   ▼
Sistem simpan riwayat simulasi ke "Daftar Prospek Saya"
   │
   ▼
Opsi: "Export ke PDF" ──► Sistem generate PDF hasil simulasi (untuk dilampirkan agen ke bank)
   │
   ▼
[End]
```

**Alur Lihat Riwayat Prospek:**
```
Buka "Daftar Prospek Saya" → Lihat list simulasi tersimpan (nama, tanggal, hasil DBR) →
Klik salah satu → Lihat detail/edit ulang parameter → Update hasil (jika ada perubahan data)
```

---

## MODUL 8 — Dashboard & Notifikasi

**Aktor:** Agen, Admin  
**Requirement Terkait:** REQ-M08-001 s.d. 005

### 8.1 Alur Agen
```
[Start] Login ──► Landing di Dashboard Agen
   │
   ▼
Tampilkan ringkasan:
   - Jumlah listing aktif & status masing-masing
   - Jumlah lead (klik CTA WA) 7/30 hari terakhir
   - Progress kursus Learning Center berjalan
   - Event mendatang yang sudah di-RSVP
   - Daftar prospek DBR terbaru
   │
   ▼
Klik notifikasi (bell icon) ──► Lihat daftar notifikasi (approval status, reminder event, listing akan expired, sertifikat baru)
   │
   ▼
Klik salah satu notifikasi ──► Redirect ke modul terkait
   │
   ▼
[End]
```

### 8.2 Alur Admin
```
[Start] Login sbg Admin ──► Landing di Dashboard Admin
   │
   ▼
Tampilkan statistik: agen baru menunggu approval, listing pending review, engagement Learning Center, ringkasan proyek developer per agen
   │
   ▼
Klik salah satu widget ──► Redirect ke halaman kelola terkait (mis. "Listing Pending" → Modul 3 moderasi)
   │
   ▼
[End]
```

---

## MODUL 9 — Admin Panel / CMS

**Aktor:** Superadmin, Admin, Manager (sesuai izin)  
**Requirement Terkait:** REQ-M09-001 s.d. 006

```
[Start] Login ──► Sistem cek role & permission user
   │
   ├─ Role = Agen / Developer Partner ──► Menu Admin Panel tidak tampil, redirect ke Dashboard biasa (Modul 8)
   │
   ▼ Role = Superadmin / Admin / Manager (dengan izin)
Buka Admin Panel ──► Sistem tampilkan hanya sub-menu yang sesuai matriks akses role tsb
   │
   ▼
Pilih sub-menu (contoh untuk Superadmin — akses penuh):
   ├─ Manajemen User ──► Kelola agen/admin/manager/instruktur/developer partner (approve, suspend, edit role)
   ├─ Moderasi Listing ──► Approve/reject/take down listing (Modul 3)
   ├─ Kelola Learning Center ──► CRUD kursus, kuis, template sertifikat (Modul 4)
   ├─ Kelola Event ──► CRUD event, approve pengajuan developer (Modul 5)
   ├─ Kelola Developer & Proyek ──► CRUD data developer/proyek (Modul 6)
   ├─ Konfigurasi Sistem ──► Set threshold DBR, suku bunga default, masa expired listing, passing grade kursus (Modul 7, 3, 4)
   ├─ Kelola Role & Permission ──► Modul 10 (khusus Superadmin)
   └─ Laporan & Analitik ──► Generate & export laporan (Excel/PDF)
   │
   ├─ Jika role = Admin ──► Sub-menu "Kelola Role & Permission" dan "Konfigurasi Sistem" tidak tampil/nonaktif; tidak bisa kelola akun Admin/Superadmin lain
   ├─ Jika role = Manager ──► Seluruh sub-menu operasional (Manajemen User terbatas ke Admin/Agen, Moderasi Listing, Kelola Learning Center, Kelola Event, Kelola Developer & Proyek, Laporan & Analitik) tampil dengan akses **global/penuh** ke data seluruh agen (tidak ada pembatasan tim/wilayah); hanya sub-menu "Konfigurasi Sistem" dan bagian permission Admin/Manager/Superadmin di "Kelola Role & Permission" yang tidak tampil
   │
   ▼
Lakukan aksi (approve/edit/hapus/dsb)
   │
   ▼
Sistem validasi ulang permission di backend sebelum eksekusi
   │
   ├─ Tidak memiliki izin (mis. race condition/izin baru dicabut) ──► Tampilkan "Akses Ditolak" (403)
   │
   ▼ Diizinkan
[End] Perubahan tersimpan & berlaku sistem-wide, tercatat di audit log
```

---

## MODUL 10 — Manajemen Role & Hak Akses (RBAC)

**Aktor:** Superadmin  
**Requirement Terkait:** REQ-M10-001 s.d. 010

### 10.1 Alur Mengatur Permission Matrix
```
[Start] Superadmin login ──► Buka "Kelola Role & Permission"
   │
   ▼
Tampilkan daftar role: Superadmin, Admin, Manager, Agen (+ role kustom jika ada)
   │
   ▼
Pilih role yang ingin diatur (mis. "Manager")
   │
   ├─ Role = Superadmin dipilih ──► Tampilkan info "Superadmin selalu memiliki akses penuh, tidak dapat diubah" (read-only)
   │
   ▼ Role selain Superadmin
Tampilkan Permission Matrix Editor: daftar Modul × Aksi (create/read/update/delete/approve) dengan toggle
   │
   ▼
Ubah toggle akses sesuai kebutuhan (mis. aktifkan/nonaktifkan aksi tertentu untuk role Agen — satu-satunya role yang cakupan permission-nya dapat diubah lewat menu ini selain oleh Superadmin; cakupan Manager sendiri selalu tetap `all`/global dan tidak dapat dipersempit ke tim/wilayah tertentu)
   │
   ▼
Klik "Simpan Perubahan"
   │
   ▼
Sistem tampilkan konfirmasi ringkasan perubahan
   │
   ▼
Konfirmasi ──► Perubahan tersimpan & langsung berlaku untuk seluruh user dengan role tsb
   │
   ▼
Sistem catat perubahan ke Audit Log (siapa, kapan, apa yang diubah)
   │
   ▼
[End]
```

### 10.2 Alur Assign/Ubah Role User
```
[Start] Superadmin buka "Manajemen User" ──► Pilih user tertentu
   │
   ▼
Klik "Ubah Role" ──► Pilih role baru (mis. Agen → Manager)
   │
   ├─ User yang diubah adalah Superadmin terakhir yang aktif & role baru bukan Superadmin
   │       ──► Sistem tolak perubahan, tampilkan peringatan "Minimal harus ada 1 Superadmin aktif"
   │
   ▼ Valid
Konfirmasi perubahan
   │
   ▼
Role user ter-update ──► Sistem invalidasi/refresh sesi & permission user tsb
   │
   ▼
Notifikasi ke user ybs: "Role Anda telah diubah menjadi Manager"
   │
   ▼
Tercatat di Audit Log
   │
   ▼
[End]
```

### 10.3 Alur Pengecekan Permission (berlaku di semua modul lain)
```
[Setiap kali user mengakses fitur/endpoint apa pun]
   │
   ▼
Sistem ambil role user dari sesi/token
   │
   ▼
Cek matriks permission: apakah role ini punya izin utk Modul-X + Aksi-Y?
   │
   ├─ Tidak ada izin ──► Sembunyikan menu di UI (jika relevan) & tolak request di backend (403 Akses Ditolak)
   │
   ▼ Ada izin
   ├─ `granted_scope = "own"` ──► Filter data hanya milik user ybs (berlaku Agen)
   └─ `granted_scope = "all"` ──► Tampilkan seluruh data tanpa filter kepemilikan (berlaku Superadmin/Manager/Admin — selalu global, tidak ada level "scoped tim/wilayah" di sistem ini)
   │
   ▼
[End] Lanjutkan proses fitur seperti biasa
```

---

## MODUL 12 — Organization Management System *(baru, v1.2)*

**Aktor:** Agen (calon Leader/Member), Leader Organization, Member Organization  
**Requirement Terkait:** REQ-M12-001 s.d. 019

### 12.1 Alur Membuat Organization
```
[Start] Agen dengan organization_status = Individual → Buka menu "Organization"
   │
   ▼
Klik "Buat Organization"
   │
   ▼
Tahap 1 (wajib): Isi Nama Organization + Pilih Tipe (Agency/Kantor/Tim/Komunitas)
   │
   ▼
Submit ──► Organization langsung aktif, Agen menjadi Leader (status: active)
   │
   ▼
Tahap 2 (opsional, dapat dilengkapi kapan saja): Logo, Banner, Deskripsi, Website, Media Sosial, Alamat, Kontak
   │
   ▼
[End] Redirect ke Organization Dashboard
```

### 12.2 Alur Undang Anggota (Leader → Agen) & Ajukan Gabung (Agen → Leader)
```
[Start - Leader] Buka Organization Dashboard → "Undang Anggota"
   │
   ▼
Cari agen (nama/email) ──► Kirim undangan (leader_invite)
   │
   ├─ Agen yang dicari sudah Leader/Member Organization lain ──► Tidak dapat diundang, tampilkan info
   │
   ▼ Valid
Undangan tersimpan status "Pending" ──► Notifikasi ke agen target

[Start - Agen] Buka "Cari Organization" → Ketik nama Organization → "Minta Gabung" (agent_request)
   │
   ├─ Agen sudah Leader/Member Organization lain ──► Tombol "Minta Gabung" disembunyikan
   │
   ▼ Valid
Permintaan tersimpan status "Pending" ──► Notifikasi ke Leader Organization tsb

[Leader/Agen] Buka daftar undangan/permintaan pending ──► Approve / Reject
   │
   ├─ Reject ──► Status "Rejected" ──► Cooldown 24 jam sebelum pasangan+arah yang sama dapat mengajukan ulang
   │
   ▼ Approve
Sistem re-check status Individual pihak terkait (race condition guard)
   │
   ├─ Sudah tidak Individual (di-approve organization lain lebih dulu) ──► Approval gagal, tampilkan error
   │
   ▼ Masih Individual
Agen resmi jadi Member ──► Seluruh agent_request pending lain milik agen tsb otomatis "Cancelled"
   │
   ▼
[End] Notifikasi ke agen: "Anda kini bergabung dengan Organization X"
```

### 12.3 Alur Keluar/Bubar Organization
```
[Start - Member] Buka Organization Dashboard → "Keluar dari Organization"
   │
   ▼
Konfirmasi ──► Status keanggotaan → "Left" ──► organization_status kembali Individual
   │
   ▼
Listing milik Member yang berkonteks Organization ──► listing_context reset ke "personal", status turun ke "Draft" (butuh review ulang sebelum tayang kembali)
   │
   ▼
[End]
```
```
[Start - Leader] Buka Organization Dashboard → "Tutup Organization"
   │
   ▼
Konfirmasi (peringatan: seluruh Member akan kembali Individual, tidak ada transfer kepemimpinan)
   │
   ▼
Seluruh Member → status "Removed", organization_status kembali Individual
   │
   ▼
Seluruh listing Organization ──► listing_context reset "personal", status "Draft", kembali ke masing-masing pemilik asal
   │
   ▼
Organization.status → "Closed" (soft-delete, data historis tetap tersimpan)
   │
   ▼
[End] Notifikasi ke seluruh eks-Member
```

---

## MODUL 13 — AI Assistant Integration (BYOK) *(baru, v1.2)*

**Aktor:** Seluruh role internal berakun (Superadmin, Manager, Admin, Instructor, Agen) **dan Developer Partner** (resolusi OD-21, 6 Agustus 2026)  
**Requirement Terkait:** REQ-M13-001 s.d. 012

### 13.1 Alur Menghubungkan Provider AI
```
[Start] Buka menu "AI Assistant" → "Hubungkan Provider Baru"
   │
   ▼
Pilih provider dari daftar aktif (Gemini/Groq/Mistral/GitHub Models)
   │
   ▼
Sistem tampilkan syarat pemakaian provider (biaya, limit, link cara generate API key)
   │
   ▼
User buka link resmi provider (di luar sistem) → generate API key sendiri
   │
   ▼
Kembali, tempel API key ke form koneksi ──► Submit
   │
   ▼
Sistem lakukan test call ringan ke provider
   │
   ├─ Test gagal (key invalid/expired) ──► Tampilkan error, minta cek ulang key
   │
   ▼ Test berhasil
API key disimpan terenkripsi ──► Koneksi berstatus "Active"
   │
   ▼
[End] Redirect ke Chat UI, provider siap dipakai
```

### 13.2 Alur Chat
```
[Start] Buka menu "AI Assistant" → Pilih provider yang sudah terhubung
   │
   ▼
Label permanen tampil dekat kotak input: "Percakapan tidak disimpan — akan hilang saat ditutup/refresh"
   │
   ▼
Ketik pesan → Kirim ──► Backend proxy ke provider (API key tidak pernah dikirim ke client)
   │
   ▼
Tampilkan balasan di thread (thread terpisah per-provider)
   │
   ├─ Ingin ganti provider ──► Klik tab provider lain (thread paralel, tidak reset)
   ├─ Ingin mulai ulang ──► Klik "Chat Baru" (thread berjalan direset, tanpa riwayat tersimpan)
   │
   ▼
[End - saat tab ditutup/refresh] Seluruh isi percakapan hilang permanen (tidak ada mekanisme recovery)
```

---



```
Login/Registrasi (M1)
        │
        ▼
   Dashboard (M8) ──┬──► Profil Saya (M2)
                     ├──► Listing Saya (M3) ──► Detail Listing Publik ──► CTA WhatsApp
                     ├──► Learning Center (M4) ──► Sertifikat → Profil (M2)
                     ├──► Kalender Event (M5)
                     ├──► Katalog Developer (M6) ──► Klaim → Buat Listing (M3)
                     ├──► Kalkulator DBR (M7) ──► Daftar Prospek
                     ├──► Organization (M12) ──► Undang/Gabung Member → Listing Organization (M3)
                     ├──► AI Assistant (M13) ──► Chat proxy per-provider
                     └──► Notifikasi

Admin Panel (M9) ──► mengelola & memoderasi semua modul di atas
```

---

*Dokumen ini menjadi acuan untuk tahap pembuatan wireframe visual (low-fidelity) dan spesifikasi teknis (ERD & API) pada fase berikutnya.*

---

## CONTROLLED SYNCHRONIZATION NOTICE — STEP 07
**Date:** 16 August 2026  
**AEP source:** AEP #4 Learning Session  
**Cross-AEP dependencies:** Step 05 D1 Commercial/Payment PASS; Step 06 D2 Learning Economy PASS WITH CONTROLLED RESIDUAL  
**Scope:** D3 Learning Session downstream semantic synchronization only.

This is a controlled semantic overlay. It preserves the AEP4 final decision state and does not authorize physical migration, final provider production binding, final RBAC permission IDs, automatic provider failover, or closure of MADCR-049/053/054.

### D3-FLOW-01 — Session lifecycle
`Create → DRAFT → Schedule → SCHEDULED → Execute → LIVE → End → ENDED`
with controlled `CANCELLED` / `FAILED` exceptions.

### D3-FLOW-02 — Enrollment/access
`Request Enrollment → PENDING → eligibility/entitlement/authorization evaluation → ACTIVE → session access → governed completion → COMPLETED`.

Provider attendance does not activate enrollment. Payment success alone does not define ACTIVE.

### D3-FLOW-03 — Live provider flow
`Learning Session → Provider Binding → Provider Adapter → External Provider`
and return:
`Provider Event → validation → normalization → idempotency → Participation Evidence → Attendance Evaluation → Completion Policy`.

### D3-FLOW-04 — Cross-domain outcomes
Qualifying completion → Learning Activity → Learning Economy.
Paid access consumes Commercial/Payment outcome.
Assessment/Credential/Awarding remain separate.
RBAC remains authorization authority.

### D3-FLOW-05 — Event Calendar
Event Calendar may discover/surface/schedule Learning Sessions, but Event remains presentation/integration context, not semantic Session authority. Exact Session↔Event cardinality remains open.

### D3-FLOW-06 — Provider switching
Authorized provider replacement changes Provider Binding while preserving semantic Session identity, enrollment, valid evidence and outcome history.

Automatic failover is not assumed.
