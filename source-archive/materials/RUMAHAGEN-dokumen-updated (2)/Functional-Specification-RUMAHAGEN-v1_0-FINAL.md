# FUNCTIONAL SPECIFICATION
## Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 5 Agustus 2026
**Status:** ✅ Baseline (BERLAKU) — naik dari Draft, 5 Agustus 2026, disahkan Owner (Mujtahid Aktanto)
**Riwayat Versi:** v1.0 Draft (5 Agustus 2026, menunggu pengesahan) → v1.0 Baseline (5 Agustus 2026, disahkan Owner). Tidak ada perubahan konten antara kedua status ini — murni transisi lifecycle dokumen.
**Owner:** Senior Business Analyst / Product Manager — Mujtahid Aktanto (Solo Project Owner, AI-Assisted)
**Dokumen sumber:** PRD v1.2, User-Flow v1.2, API-Specification v1.2, ERD v1.3, Entity-Mapping v1.0

> **Dasar penyusunan:** Dokumen ini **belum pernah ada sebelumnya** di proyek — dikonfirmasi eksplisit lewat `document-governance-baseline-register.md` Governance Notes poin 4 dan `foundation-validation-report.md` §17 (status **Not Ready**, gap Tinggi). Disusun sesuai urutan `foundation-validation-report.md` Bagian 16 langkah 6 ("Disintesis dari PRD + User Flow + API yang sudah final"). **Tidak bergantung pada Open Decision teknis apa pun** — seluruh 6 kondisi CTO (`executive-architecture-review.md` §14) sudah terpenuhi sejak 4 Agustus 2026, dan PRD/User Flow/API Spec yang menjadi basisnya kini di versi v1.2 (mencakup Modul 12/13).

> **Posisi dokumen ini dalam hierarki:** PRD menjawab **APA** yang dibutuhkan bisnis (requirement level). User Flow menjawab **ALUR** apa yang dilalui pengguna (proses/urutan). **Dokumen ini menjawab BAGAIMANA setiap layar bekerja secara presisi** — field input apa saja, validasi apa, tombol/aksi apa, output/perilaku sistem apa, dan state error/kosong apa — level detail yang menurut `foundation-validation-report.md` §17 tidak sepenuhnya tercakup oleh PRD+User Flow saja. Dokumen ini **tidak mengubah** requirement PRD atau alur User Flow — murni menerjemahkan keduanya ke level layar yang presisi. UI Specification (dokumen berikutnya) akan menerjemahkan spesifikasi fungsional ini menjadi wireframe/desain visual.

> **Traceability:** setiap layar mencantumkan `REQ-XXX` (PRD v1.2) dan `ENT-XXX` (Entity Mapping v1.0) yang relevan. Field input mengikuti definisi kolom persis dari `ERD-Skema-Database-...v1.3.md` — tidak ada field baru yang diciptakan di luar skema yang sudah disepakati.

---

## 1. Ruang Lingkup & Cara Membaca Dokumen

### 1.1 Ruang Lingkup
Mencakup **seluruh 13 modul** PRD v1.2 (M01–M13). Modul 11 (SEO & Analytics) **tidak memiliki layar antarmuka tersendiri** — bersifat teknis/backend (meta tag, sitemap, tracking), konsisten dengan `User-Flow-...v1.2.md` yang juga tidak memberi diagram alur untuk modul ini. Modul 11 tetap direferensikan di layar-layar publik yang relevan (mis. meta title/description otomatis di Halaman Detail Listing).

### 1.2 Level Detail per Layar
Mengikuti rekomendasi prioritas `executive-architecture-review.md` §11 poin 6 ("prioritaskan modul paling berisiko jika ditunda"), dua layar mendapat spesifikasi **presisi penuh** (field-per-field beserta validasi): **Form Listing Multi-Step (M03)** dan **Kalkulator DBR (M07)** — keduanya form kompleks dengan banyak validasi bersyarat. Layar lain mendapat spesifikasi **standar** (tujuan, aktor, input utama, aksi, perilaku sistem, state kosong/error) — cukup presisi untuk UI Specification tanpa mengulang seluruh detail field yang sudah eksplisit di ERD v1.3.

### 1.3 Notasi
- **Wajib** = field harus diisi sebelum submit berhasil.
- **Opsional** = field boleh dikosongkan.
- **REQ-XXX** = requirement PRD v1.2 yang dipenuhi layar ini.
- **ENT-XXX** = entity Entity Mapping v1.0 yang dibaca/ditulis layar ini.
- Validasi field mengikuti tipe & constraint kolom ERD v1.3 — bukan aturan baru.

---

## 2. Screen Inventory (Master)

Daftar seluruh layar antarmuka proyek, dikelompokkan per modul. Kolom **Prioritas Spesifikasi** menandai layar dengan detail presisi penuh (bagian 3) vs standar (bagian 3).

| # | Modul | Nama Layar | Route (indikatif) | Aktor Utama | Prioritas Spesifikasi |
|---|---|---|---|---|---|
| 1 | M01 | Registrasi Agen | `/register` | Guest | Standar |
| 2 | M01 | Login | `/login` | Guest | Standar |
| 3 | M01 | Verifikasi OTP | `/verify-otp` | Guest | Standar |
| 4 | M01 | Upload Dokumen Legalitas | `/onboarding/documents` | Agen (baru) | Standar |
| 5 | M01 | Lupa/Reset Password | `/forgot-password`, `/reset-password` | Guest | Standar |
| 6 | M01 | Status Akun (Pending Review) | `/onboarding/pending` | Agen (baru) | Standar |
| 7 | M02 | Profil Publik Agen | `/agent/[slug]` | Public | Standar |
| 8 | M02 | Edit Profil Saya | `/dashboard/profile` | Agen | Standar |
| 9 | M02 | Submit Review Agen | (komponen di Profil Publik) | Buyer | Standar |
| 10 | M02 | Moderasi Review | `/admin/agent-reviews` | Admin/Manager/Superadmin | Standar |
| 11 | M03 | **Form Tambah/Edit Listing** | `/dashboard/listings/new`, `/dashboard/listings/[id]/edit` | Agen | **Presisi Penuh** |
| 12 | M03 | Listing Saya | `/dashboard/listings` | Agen | Standar |
| 13 | M03 | Detail Listing Publik | `/listing/[slug]` | Public | Standar |
| 14 | M03 | Pencarian & Filter Listing | `/listings` (List/Map View) | Public | Standar |
| 15 | M03 | Moderasi Listing | `/admin/listings` | Admin/Manager/Superadmin | Standar |
| 16 | M04 | Katalog Kursus | `/learning-center` | Agen | Standar |
| 17 | M04 | Detail Kursus & Enroll | `/learning-center/[slug]` | Agen | Standar |
| 18 | M04 | Player Materi & Kuis | `/learning-center/[slug]/learn` | Agen | Standar |
| 19 | M04 | Sertifikat Saya | `/dashboard/certificates` | Agen | Standar |
| 20 | M04 | Kelola Kursus | `/admin/courses` | Instructor/Admin/Manager/Superadmin | Standar |
| 21 | M05 | Kalender Event | `/events` | Agen/Public | Standar |
| 22 | M05 | Detail Event & RSVP | `/events/[slug]` | Agen | Standar |
| 23 | M05 | Pengajuan Event | `/dashboard/events/submit` | Developer Partner | Standar |
| 24 | M05 | Kelola Event | `/admin/events` | Admin/Manager/Superadmin | Standar |
| 25 | M06 | Katalog Proyek Developer | `/developer-projects` | Agen/Public | Standar |
| 26 | M06 | Detail Proyek & Klaim | `/developer-projects/[slug]` | Agen | Standar |
| 27 | M06 | Kelola Developer & Proyek | `/admin/developer-projects` | Admin/Manager/Superadmin | Standar |
| 28 | M07 | **Kalkulator DBR** | `/dashboard/calculator` | Agen | **Presisi Penuh** |
| 29 | M07 | Daftar Prospek Saya | `/dashboard/prospects` | Agen | Standar |
| 30 | M08 | Dashboard Agen | `/dashboard` | Agen | Standar |
| 31 | M08 | Dashboard Admin | `/admin/dashboard` | Admin/Manager/Superadmin | Standar |
| 32 | M08 | Pusat Notifikasi | `/dashboard/notifications` | Semua role internal | Standar |
| 33 | M09 | Manajemen User | `/admin/users` | Admin/Manager/Superadmin | Standar |
| 34 | M09 | Konfigurasi Sistem | `/admin/settings` | Superadmin (+ Manager sebagian) | Standar |
| 35 | M10 | Kelola Role | `/admin/roles` | Superadmin/Manager (terbatas) | Standar |
| 36 | M10 | Permission Matrix Editor | `/admin/roles/permissions` | Superadmin (penuh)/Manager (terbatas) | Standar |
| 37 | M12 | Buat Organization | `/dashboard/organization/create` | Agen (Individual) | Standar |
| 38 | M12 | Organization Dashboard | `/dashboard/organization` | Leader/Member | Standar |
| 39 | M12 | Undang/Kelola Anggota | `/dashboard/organization/members` | Leader | Standar |
| 40 | M12 | Cari & Ajukan Gabung | `/organizations/search` | Agen (Individual) | Standar |
| 41 | M12 | Halaman Publik Organization | `/organization/[slug]` | Public | Standar |
| 42 | M13 | Kelola Koneksi AI Provider | `/dashboard/ai-assistant/connections` | Semua role internal berakun | Standar |
| 43 | M13 | Chat AI Assistant | `/dashboard/ai-assistant/chat` | Semua role internal berakun | Standar |

**Total: 43 layar** terdaftar lintas 12 modul (M11 tanpa layar khusus).

---
## 3. Spesifikasi Presisi Penuh (Layar Prioritas Tinggi)

### 3.1 Form Tambah/Edit Listing (M03)

**Route:** `/dashboard/listings/new` (tambah), `/dashboard/listings/[id]/edit` (edit)
**Aktor:** Agen (pemilik) — Superadmin/Manager/Admin dapat mengedit listing agen mana pun (scope `all`)
**REQ Terkait:** REQ-M03-001, 002, 008, 009, 013, 014 | **ENT Terkait:** `ENT-M03-Listing`, `ENT-M03-ListingPhoto`, `ENT-M03-ListingVideo`, `ENT-M03-RefProvince/City/District`, `ENT-M03-Amenity`
**Endpoint API:** `POST /listings`, `PUT /listings/{id}`, `POST /listings/{id}/media` (API Spec v1.2 Bagian 2)

Form bersifat **multi-step** (wizard), mengikuti alur `User-Flow-...v1.2.md` §3.1. Setiap step dapat disimpan sebagai Draft sebelum lengkap (REQ-M03-008).

#### Step 1 — Kategori & Tujuan
| Field | Tipe Input | Wajib/Opsional | Validasi | Sumber Kolom (ERD) |
|---|---|---|---|---|
| Kategori | Radio button: `Primary` / `Secondary` | Wajib | Harus salah satu | `listings.category` |
| Tautkan ke Proyek Developer? | Toggle (muncul hanya jika Kategori=Primary) | Opsional | — | `listings.developer_project_id` |
| Pilih Proyek Developer | Dropdown search (muncul jika toggle=Ya) | Wajib jika toggle=Ya | Harus ID proyek valid & berstatus `Aktif` | `listings.developer_project_id` |
| Tujuan Transaksi | Radio button: `Dijual` / `Disewakan` | Wajib | Harus salah satu | `listings.transaction_type` |

**Perilaku sistem:** Jika Tautkan Proyek=Ya, field Harga/Spesifikasi di Step 3 otomatis terisi dari data proyek dan **dikunci read-only** (sesuai User Flow §3.1). Jika Kategori=Secondary, toggle tautan proyek disembunyikan sepenuhnya (bukan disabled).

#### Step 2 — Lokasi
| Field | Tipe Input | Wajib/Opsional | Validasi | Sumber Kolom |
|---|---|---|---|---|
| Provinsi | Dropdown (dari `GET /regions/provinces`) | Wajib | Harus ID valid | `listings.province_id` |
| Kota/Kabupaten | Dropdown cascading (mengikuti Provinsi) | Wajib | Harus ID valid & anak dari Provinsi terpilih | `listings.city_id` |
| Kecamatan | Dropdown cascading (mengikuti Kota) | Wajib | Harus ID valid & anak dari Kota terpilih | `listings.district_id` |
| Nama Kawasan (opsional) | Text, max 20 karakter | Opsional | Max 20 char | `listings.area_keyword` |
| Alamat Lengkap | Textarea, max 500 karakter | Wajib | Tidak boleh kosong | `listings.address` |
| Pin Lokasi Peta | Map picker (Leaflet+OSM, lihat API Spec §9.1) | Opsional | Jika diisi, harus lat/long valid Indonesia | `listings.latitude`, `listings.longitude` |

**Perilaku sistem:** Dropdown Kota dan Kecamatan **disabled** sampai parent-nya dipilih (cascading). Jika field alamat diisi tanpa pin peta, sistem menawarkan geocoding otomatis (LocationIQ, ADR-008) sebagai draft pin yang dapat digeser manual.

#### Step 3 — Detail & Spesifikasi
| Field | Tipe Input | Wajib/Opsional | Validasi | Sumber Kolom |
|---|---|---|---|---|
| Judul Listing | Text, max 200 karakter | Wajib | Min 10 karakter, max 200 | `listings.title` |
| Tipe Properti | Dropdown: Rumah/Apartemen/Ruko/Tanah/Gudang/Kavling/Lainnya | Wajib | Harus salah satu enum | `listings.property_type` |
| Harga | Number (Rupiah, format ribuan otomatis) | Wajib (kecuali terkunci dari proyek) | Harus > 0 | `listings.price` |
| Satuan Harga | Dropdown: Total/Per Bulan/Per Tahun (muncul jika Disewakan) | Wajib jika Disewakan | — | `listings.price_unit` |
| Harga Dapat Ditawar | Checkbox | Opsional | — | `listings.is_negotiable` |
| Luas Tanah (m²) | Number | Opsional | Harus > 0 jika diisi | `listings.land_area` |
| Luas Bangunan (m²) | Number | Opsional | Harus > 0 jika diisi | `listings.building_area` |
| Kamar Tidur | Number stepper | Opsional | Integer ≥ 0 | `listings.bedrooms` |
| Kamar Mandi | Number stepper | Opsional | Integer ≥ 0 | `listings.bathrooms` |
| Jumlah Lantai | Number stepper | Opsional | Integer ≥ 0 | `listings.floors` |
| Kapasitas Carport | Number stepper | Opsional | Integer ≥ 0 | `listings.carport_capacity` |
| Daya Listrik (Watt) | Number | Opsional | Integer > 0 jika diisi | `listings.electrical_power` |
| Sumber Air | Dropdown: PDAM/Sumur/Lainnya | Opsional | — | `listings.water_source` |
| Kondisi Furnishing | Dropdown: Unfurnished/Semi/Fully Furnished | Opsional | — | `listings.furnishing` |
| Tahun Dibangun | Number (4 digit) | Opsional | 1900 ≤ tahun ≤ tahun berjalan | `listings.year_built` |
| Fasilitas (Amenities) | Multi-select checkbox (dari `ENT-M03-Amenity`) | Opsional | — | `listing_amenities` |
| Deskripsi | Rich text / textarea | Opsional | Max sesuai kolom TEXT | `listings.description` |

#### Step 4 — Legalitas
| Field | Tipe Input | Wajib/Opsional | Validasi | Sumber Kolom |
|---|---|---|---|---|
| Jenis Sertifikat | Dropdown: SHM/HGB/Girik/PPJB/Strata Title/Lainnya | Opsional | — | `listings.certificate_type` |
| Sudah Balik Nama? | Radio: Ya/Belum | Opsional (wajib jika Jenis Sertifikat diisi) | — | `listings.certificate_transferred` |
| Status IMB | Dropdown: Ada/Tidak Ada/Dalam Proses | Opsional | — | `listings.imb_status` |
| Pernyataan Bebas Sengketa | Checkbox, teks: "Saya menyatakan properti ini bebas dari sengketa hukum" | Opsional, default tidak tercentang | — | `listings.dispute_free_declared` |

#### Step 5 — Media
| Field | Tipe Input | Wajib/Opsional | Validasi | Sumber Kolom |
|---|---|---|---|---|
| Foto Listing | Multi-upload drag-and-drop (JPG/PNG/WebP) | **Wajib minimal 3 foto** | Min 3, max 20 file; ukuran per file sesuai batas storage | `listing_photos` |
| Pilih Foto Cover | Klik salah satu foto ter-upload untuk ditandai cover | Wajib jika ≥1 foto ter-upload | Harus salah satu dari foto yang di-upload | `listing_photos.is_cover` |
| Video/Virtual Tour | Upload video atau URL YouTube/embed | Opsional | Format video umum atau URL valid | `listing_videos` |

**Perilaku sistem:** Tombol "Lanjut" pada Step 5 dinonaktifkan sampai minimal 3 foto ter-upload sukses (REQ-M03-013). Upload menampilkan progress bar per file; file gagal upload ditandai merah dengan opsi retry.

#### Step 6 — Kontak & Preview
| Field | Tipe Input | Wajib/Opsional | Validasi | Sumber Kolom |
|---|---|---|---|---|
| Nomor WhatsApp CTA | Text (auto-terisi dari Profil Agen, dapat diubah) | Wajib | Format nomor telepon Indonesia valid | `listings.whatsapp_number` |

**Panel Preview:** menampilkan seluruh data Step 1–6 dalam tampilan seperti Halaman Detail Listing publik (read-only), agar agen dapat memeriksa sebelum submit.

**Aksi Akhir (tombol):**
| Tombol | Perilaku Sistem |
|---|---|
| **Simpan sebagai Draft** | `listings.status = draft`. Field wajib yang belum lengkap **tidak diblok** — draft boleh parsial. |
| **Submit untuk Review** | Validasi **seluruh** field wajib Step 1–6 dijalankan. Jika ada yang kosong/invalid → sistem scroll ke step bermasalah + tampilkan pesan error inline per field (bukan alert generik). Jika lengkap → `listings.status = pending_review`, notifikasi terkirim ke Admin (REQ-M03-011). |

**Error & Empty States:**
- Gagal upload foto (koneksi terputus) → toast error + tombol retry per file, form tidak ter-reset.
- Field harga negatif/nol → pesan inline "Harga harus lebih dari 0" saat field kehilangan fokus (blur validation).
- Dropdown wilayah gagal load (API error) → tampilkan pesan "Gagal memuat data wilayah, coba lagi" + tombol reload, field tetap disabled sampai berhasil.

---

### 3.2 Kalkulator DBR (M07)

**Route:** `/dashboard/calculator` (mandiri), atau dibuka dari tombol "Cek Kelayakan KPR" di Halaman Detail Listing (Harga Properti auto-terisi)
**Aktor:** Agen
**REQ Terkait:** REQ-M07-001 s.d. 006 | **ENT Terkait:** `ENT-M07-DbrSimulation`, `ENT-M07-DbrConfig`
**Endpoint API:** `POST /calculator/dbr` (API Spec v1.2 Bagian 6)

#### Form Input
| Field | Tipe Input | Wajib/Opsional | Validasi | Sumber Kolom (ERD) |
|---|---|---|---|---|
| Penghasilan Bersih Bulanan | Number (Rupiah) | Wajib | Harus > 0 | `dbr_simulations.net_income` |
| Total Cicilan Berjalan | Number (Rupiah) | Wajib (boleh 0) | Harus ≥ 0 | `dbr_simulations.existing_installments` |
| Harga Properti | Number (Rupiah), auto-terisi jika dibuka dari listing | Wajib | Harus > 0 | `dbr_simulations.property_price` |
| Uang Muka (DP) | Number (Rupiah) | Wajib | Harus ≥ 0 dan < Harga Properti | `dbr_simulations.down_payment` |
| Tenor | Number + toggle satuan **Tahun/Bulan** (UI-only, lihat catatan) | Wajib | Harus > 0; hasil konversi bulan harus integer | `dbr_simulations.tenor_months` |
| Estimasi Suku Bunga (%/tahun) | Number, default dari `dbr_config.default_interest_rate` | Wajib | Harus > 0 | `dbr_simulations.interest_rate_annual` |

> **Catatan kontrak data (kritis, dari API Spec v1.2 Bagian 6):** field Tenor di UI **boleh** menampilkan toggle Tahun/Bulan untuk kenyamanan pengguna, tetapi nilai yang dikirim ke `POST /calculator/dbr` **selalu** dalam field `tenor_months` (satuan bulan) — konversi `tahun × 12` **wajib** dilakukan di sisi client sebelum submit. API tidak menerima satuan tahun dalam bentuk apa pun.

#### Aksi & Output
| Aksi | Perilaku Sistem |
|---|---|
| Klik **"Hitung"** | Sistem memanggil `POST /calculator/dbr`, menghitung: Plafon KPR (`property_price - down_payment`), Estimasi Angsuran Bulanan (formula anuitas), DBR% (`(existing_installments + estimasi_angsuran) / net_income × 100`). Hasil tampil di panel bawah form **tanpa reload halaman**. |
| Ubah field apa pun setelah hasil tampil | Sistem hitung ulang **real-time** (tanpa perlu klik "Hitung" lagi) — sesuai `User-Flow-...v1.2.md` §7 "Sistem hitung ulang real-time". |
| Klik **"Simpan sebagai Prospek/Lead"** | Muncul sub-form: Nama Calon Pembeli (wajib), No. HP Calon Pembeli (wajib, format nomor Indonesia). Setelah submit → `dbr_simulations` tersimpan, muncul di "Daftar Prospek Saya". |
| Klik **"Export ke PDF"** | Sistem generate PDF ringkasan hasil (tersedia setelah disimpan sebagai Prospek). Field `pdf_export_url` terisi. |

#### Tampilan Hasil
| Elemen | Perilaku |
|---|---|
| Indikator Kelayakan | Badge warna: **Hijau "Layak"** (DBR% ≤ threshold), **Kuning "Perlu Review"** (DBR% mendekati threshold — pita toleransi ditentukan `dbr_config`), **Merah "Tidak Layak"** (DBR% > threshold). Threshold diambil live dari `dbr_config.dbr_threshold_percent` (default 35%), bukan hardcode di frontend. |
| Disclaimer | Teks tetap tampil di bawah hasil: *"Hasil ini estimasi awal, keputusan final oleh bank"* — tidak dapat disembunyikan pengguna. |
| Rincian Angka | Plafon KPR, Estimasi Angsuran/Bulan, DBR% — ketiganya ditampilkan dengan 2 desimal, format Rupiah/persen Indonesia. |

**Error & Empty States:**
- DP ≥ Harga Properti → pesan inline "Uang muka tidak boleh melebihi atau sama dengan harga properti", tombol Hitung disabled.
- Penghasilan = 0 → pesan inline "Penghasilan harus lebih dari 0", perhitungan tidak dijalankan (mencegah divide-by-zero pada DBR%).
- Gagal simpan Prospek (network error) → toast error, data form tidak hilang, tombol retry tersedia.

---
## 4. Spesifikasi Standar (Layar Lainnya)

Format per layar: **Tujuan** · **Aktor** · **Input Utama** · **Aksi** · **Perilaku Sistem/Output** · **State Kosong/Error**.

### 4.1 Modul 1 — Registrasi & Autentikasi
**REQ Terkait:** REQ-M01-001 s.d. 008 | **ENT Terkait:** `ENT-M01-User`, `ENT-M01-AgentVerificationDocument`

**Registrasi Agen** (`/register`)
- Tujuan: pendaftaran mandiri agen baru.
- Input: Nama lengkap*, Email* atau No. HP*, Password* (min 8 karakter, kombinasi huruf+angka), Konfirmasi Password*, Nama kantor/brokerage (opsional), Area operasional (opsional).
- Aksi: "Daftar" → kirim OTP; "Daftar dengan Google/Apple" → alur SSO.
- Output: redirect ke Verifikasi OTP. Email/HP sudah terdaftar → pesan inline "Email/No. HP sudah digunakan" + link ke Login.
- Kosong/Error: password tidak cocok → pesan inline real-time saat mengetik konfirmasi.

**Login** (`/login`)
- Input: Email/No. HP*, Password*.
- Aksi: "Masuk"; "Lupa Password?"; SSO Google/Apple.
- Output: kredensial salah → pesan generik "Email/password salah" (tidak membocorkan mana yang salah); akun `Suspended` → pesan khusus dengan kontak Admin.

**Verifikasi OTP** (`/verify-otp`)
- Input: 6-digit kode OTP.
- Aksi: "Verifikasi"; "Kirim Ulang" (cooldown 60 detik).
- Output: sukses → redirect Upload Dokumen; kode salah/expired → pesan inline, hitung mundur reset otomatis.

**Upload Dokumen Legalitas** (`/onboarding/documents`)
- Input: KTP* (upload gambar/PDF), NPWP (opsional), Sertifikat REI/AREBI (opsional).
- Aksi: "Kirim untuk Verifikasi".
- Output: status akun → `Pending Review`, redirect ke halaman status; dokumen tersimpan terenkripsi (REQ-M01-008).

**Lupa/Reset Password** (`/forgot-password`, `/reset-password`)
- Input (forgot): Email/No. HP*. Input (reset): Password Baru*, Konfirmasi*.
- Output: email/SMS link reset terkirim; link expired → pesan "Link kedaluwarsa, minta ulang".

**Status Akun Pending Review** (`/onboarding/pending`)
- Tujuan: layar tunggu, tanpa aksi input — menampilkan status `Pending Review` dan estimasi waktu proses.
- Output: begitu Admin approve, notifikasi + akses dashboard penuh terbuka otomatis (tanpa perlu login ulang jika sesi masih aktif).

---

### 4.2 Modul 2 — Profil Agen
**REQ Terkait:** REQ-M02-001 s.d. 007 | **ENT Terkait:** `ENT-M02-AgentProfile`, `ENT-M02-AgentReview`

**Profil Publik Agen** (`/agent/[slug]`)
- Aktor: Public. Tujuan: kartu nama digital agen — foto, bio, spesialisasi, statistik performa, badge, daftar listing aktif, review/rating.
- Aksi: "Hubungi via WhatsApp"; "Tulis Review" (khusus Buyer login).
- Kosong: agen belum punya listing aktif → pesan "Belum ada listing aktif dari agen ini" (bukan halaman kosong polos).

**Edit Profil Saya** (`/dashboard/profile`)
- Input: Foto profil, Bio (max karakter sesuai kolom), Spesialisasi (multi-select), Area jangkauan, Kontak (toggle tampil/sembunyi), Nama & No. Lisensi (field sensitif — perubahan butuh approval Admin, REQ-M02-007).
- Aksi: "Simpan Perubahan".
- Output: field non-sensitif tersimpan langsung; field sensitif → status "Menunggu Approval" ditampilkan di sebelah field terkait.

**Submit Review Agen** (komponen di Profil Publik)
- Aktor: Buyer (harus login, dan harus punya bukti interaksi nyata via `ENT-M03-ListingLead` — Entity Mapping §2).
- Input: Rating bintang* (1–5), Komentar (opsional).
- Output: submit → status "Menunggu Moderasi", belum tampil publik.

**Moderasi Review** (`/admin/agent-reviews`)
- Aktor: Admin/Manager/Superadmin.
- Aksi: "Setujui" / "Tolak" (dengan alasan).
- Output: disetujui → tampil di Profil Publik & masuk rata-rata rating; ditolak → tidak tampil, Buyer tidak diberi tahu alasan detail (mencegah abuse).

---

### 4.3 Modul 3 — Listing (layar non-prioritas)
**REQ Terkait:** REQ-M03-003, 006, 007, 010, 011, 012, 015 | **ENT Terkait:** `ENT-M03-Listing`, `ENT-M03-ListingPriceHistory`, `ENT-M03-ListingLead`

**Listing Saya** (`/dashboard/listings`)
- Aktor: Agen. Tujuan: daftar listing milik sendiri dengan status masing-masing (Draft/Menunggu Review/Published/Sold/Rented/Expired/Rejected).
- Aksi per baris: Edit, Perpanjang Masa Tayang, Ubah Status (Sold/Rented), Nonaktifkan/Hapus, Lihat Statistik (view count, klik CTA).
- Kosong: belum ada listing → CTA besar "+ Tambah Listing Pertama Anda".

**Detail Listing Publik** (`/listing/[slug]`)
- Aktor: Public. Tujuan: galeri foto/video, deskripsi, spesifikasi, peta lokasi, status legalitas, profil ringkas agen, listing serupa.
- Aksi: "Chat via WhatsApp" (mencatat `ENT-M03-ListingLead` sebelum redirect `wa.me`), "Cek Kelayakan KPR" (buka Kalkulator DBR dengan harga auto-terisi).
- Output: listing berstatus non-`published` (expired/sold) → tampil banner "Listing ini sudah tidak tersedia" + rekomendasi listing serupa, bukan 404.

**Pencarian & Filter Listing** (`/listings`)
- Input filter: Kategori, Tujuan Transaksi, Tipe Properti, Provinsi/Kota/Kecamatan, Range Harga, Range Luas, Kamar Tidur, Jenis Sertifikat.
- Aksi: Sort (Terbaru/Harga Terendah/Tertinggi/Terpopuler), Toggle List View/Map View.
- Kosong: tidak ada hasil → pesan "Tidak ditemukan" + saran longgarkan filter (bukan halaman putih kosong).

**Moderasi Listing** (`/admin/listings`)
- Aktor: Admin/Manager/Superadmin.
- Aksi: "Setujui" / "Tolak" (dengan alasan wajib diisi) per listing berstatus `pending_review`.
- Output: ditolak → status kembali ke agen sebagai `rejected` dengan `rejection_reason` tampil di Listing Saya agen.

---

### 4.4 Modul 4 — Learning Center
**REQ Terkait:** REQ-M04-001 s.d. 006 | **ENT Terkait:** `ENT-M04-Course`, `ENT-M04-Enrollment`, `ENT-M04-QuizAttempt`, `ENT-M04-Certificate`

**Katalog Kursus** (`/learning-center`)
- Aktor: Agen. Input filter: Kategori kursus.
- Aksi: klik kursus → Detail Kursus.

**Detail Kursus & Enroll** (`/learning-center/[slug]`)
- Tujuan: deskripsi kursus, silabus, estimasi durasi.
- Aksi: "Daftar Kursus" (self-enroll, tanpa approval, REQ-M04-002).
- Output: sudah pernah enroll → tombol berubah "Lanjutkan Belajar".

**Player Materi & Kuis** (`/learning-center/[slug]/learn`)
- Tujuan: konsumsi materi (video/PDF) per lesson, lalu kuis evaluasi.
- Aksi: "Tandai Selesai" per lesson, "Mulai Kuis", jawab pertanyaan, "Submit Kuis".
- Output: nilai kuis ≥ passing grade → sertifikat otomatis terbit (REQ-M04-004); di bawah passing grade → tombol "Ulangi Kuis" muncul.

**Sertifikat Saya** (`/dashboard/certificates`)
- Tujuan: daftar sertifikat yang sudah didapat, dapat diunduh PDF.
- Kosong: belum ada sertifikat → CTA ke Katalog Kursus.

**Kelola Kursus** (`/admin/courses`)
- Aktor: Instructor (kursus miliknya)/Admin/Manager/Superadmin.
- Aksi: Buat/Edit/Nonaktifkan kursus, kelola lesson & bank soal kuis, lihat progress peserta.

---

### 4.5 Modul 5 — Kalender Event
**REQ Terkait:** REQ-M05-001 s.d. 005 | **ENT Terkait:** `ENT-M05-Event`, `ENT-M05-EventRegistration`

**Kalender Event** (`/events`)
- Tampilan: kalender bulanan + list, filter Kategori (Pelatihan/Launching/Open House/Gathering).

**Detail Event & RSVP** (`/events/[slug]`)
- Aksi: "RSVP/Daftar". Kuota penuh → tombol berubah "Masuk Waiting List".
- Output: H-1 dan H-1 jam sebelum event → notifikasi reminder otomatis terkirim ke peserta terdaftar.

**Pengajuan Event** (`/dashboard/events/submit`)
- Aktor: Developer Partner. Input: Nama event*, Tanggal*, Lokasi*, Deskripsi*, Kuota*.
- Output: submit → status "Menunggu Approval Admin".

**Kelola Event** (`/admin/events`)
- Aksi: Setujui/Tolak pengajuan Developer Partner, Buat event internal langsung, kelola daftar peserta.

---

### 4.6 Modul 6 — Direktori Developer
**REQ Terkait:** REQ-M06-001 s.d. 006 | **ENT Terkait:** `ENT-M06-DeveloperProject`, `ENT-M06-AgentProjectClaim`

**Katalog Proyek Developer** (`/developer-projects`)
- Tampilan: grid proyek dengan nama, lokasi, tipe, range harga, status (Aktif/Coming Soon/Sold Out).

**Detail Proyek & Klaim** (`/developer-projects/[slug]`)
- Tujuan: detail proyek, skema komisi, materi marketing kit (dapat diunduh agen).
- Aksi: "Klaim Proyek Ini" (Agen) → auto-generate draft Listing kategori Primary tertaut (REQ-M06-002).

**Kelola Developer & Proyek** (`/admin/developer-projects`)
- Aksi: CRUD data developer partner & proyek, upload materi marketing kit, ubah status proyek.

---

### 4.7 Modul 7 — Prospek (pendamping Kalkulator)
**REQ Terkait:** REQ-M07-005 | **ENT Terkait:** `ENT-M07-DbrSimulation`

**Daftar Prospek Saya** (`/dashboard/prospects`)
- Tujuan: riwayat simulasi DBR tersimpan (nama calon pembeli, tanggal, hasil DBR).
- Aksi: klik baris → buka detail/edit ulang parameter → hitung ulang.
- Kosong: belum ada prospek tersimpan → CTA ke Kalkulator DBR.

---

### 4.8 Modul 8 — Dashboard & Notifikasi
**REQ Terkait:** REQ-M08-001 s.d. 005 | **ENT Terkait:** `ENT-M08-Notification`

**Dashboard Agen** (`/dashboard`)
- Tampilan: ringkasan listing aktif, lead masuk terbaru, progress kursus, event mendatang — seluruhnya *scope* milik sendiri.

**Dashboard Admin** (`/admin/dashboard`)
- Aktor: Admin/Manager/Superadmin. Tampilan: statistik global (total agen, listing, lead, engagement) — *scope* `all`.

**Pusat Notifikasi** (`/dashboard/notifications`)
- Tampilan: list notifikasi in-app, ditandai belum/sudah dibaca.
- Kosong: "Belum ada notifikasi".

---

### 4.9 Modul 9 — Admin Panel
**REQ Terkait:** REQ-M09-001 s.d. 006 | **ENT Terkait:** `ENT-M09-SystemConfig`, `ENT-M09-AuditLog`

**Manajemen User** (`/admin/users`)
- Aktor: Admin/Manager/Superadmin. Aksi: cari/filter user, approve registrasi baru, assign role (dalam batas hierarki Bagian 1.2 Authorization Spec), suspend/aktifkan akun.

**Konfigurasi Sistem** (`/admin/settings`)
- Aktor: **Superadmin** (Manager/Admin: sub-menu ini disembunyikan, sesuai Authorization Spec §1.3).
- Input: threshold DBR, suku bunga default, masa expired listing, kredensial GTM/GA4/GSC.

---

### 4.10 Modul 10 — RBAC
**REQ Terkait:** REQ-M10-001 s.d. 010 | **ENT Terkait:** `ENT-M10-Role`, `ENT-M10-RolePermission`

**Kelola Role** (`/admin/roles`)
- Tampilan: daftar 7 role & jumlah user per role (Superadmin/Manager) — read-only.

**Permission Matrix Editor** (`/admin/roles/permissions`)
- Aktor: Superadmin (editor penuh seluruh role), Manager (editor **terbatas role Agen saja** — field role lain read-only/disabled).
- Aksi: toggle scope `all`/`own`/`none` per Entity×Action, "Preview Akses" (lihat sebagai role X), lihat Audit Trail perubahan.
- Output: perubahan tersimpan → efektif **real-time** ke seluruh sesi user aktif (REQ-M10-009), tercatat di `ENT-M09-AuditLog`.

---

### 4.11 Modul 12 — Organization Management *(baru)*
**REQ Terkait:** REQ-M12-001 s.d. 019 | **ENT Terkait:** `ENT-M12-Organization`, `ENT-M12-OrganizationMember`, `ENT-M12-OrganizationInvitation`

**Buat Organization** (`/dashboard/organization/create`)
- Aktor: Agen berstatus Individual. Step 1 (wajib): Nama Organization*, Tipe* (Agency/Kantor/Tim/Komunitas). Step 2 (opsional, dapat dilengkapi nanti): Logo, Banner, Deskripsi, Website, Media Sosial, Alamat, Kontak.
- Output: submit Step 1 → Organization langsung `active`, pembuat jadi Leader, redirect ke Organization Dashboard.

**Organization Dashboard** (`/dashboard/organization`)
- Aktor: Leader/Member. Tampilan: jumlah member, listing Organization, leads, performa per member, Activity Timeline.

**Undang/Kelola Anggota** (`/dashboard/organization/members`)
- Aktor: Leader. Aksi: cari agen → "Undang", lihat daftar member aktif, "Keluarkan Member".
- Output: agen yang dicari sudah Leader/Member organization lain → tombol undang disembunyikan dengan keterangan.

**Cari & Ajukan Gabung** (`/organizations/search`)
- Aktor: Agen Individual. Input: kata kunci nama Organization.
- Aksi: "Minta Gabung" per hasil pencarian.
- Output: sudah punya request pending ke organization yang sama → tombol berubah "Menunggu Approval".

**Halaman Publik Organization** (`/organization/[slug]`)
- Aktor: Public. Tampilan: branding, deskripsi, daftar member, listing Organization aktif.

---

### 4.12 Modul 13 — AI Assistant *(baru)*
**REQ Terkait:** REQ-M13-001 s.d. 012 | **ENT Terkait:** `ENT-M13-AiProvider`, `ENT-M13-AgentAiConnection`

**Kelola Koneksi AI Provider** (`/dashboard/ai-assistant/connections`)
- Aktor: seluruh role internal berakun. Tampilan: daftar provider aktif (Gemini/Groq/Mistral/GitHub Models) dengan status koneksi.
- Aksi: "Hubungkan" (wizard: tampilkan syarat pemakaian → tempel API key → test call → simpan terenkripsi), "Tes Ulang", "Putuskan Koneksi".

**Chat AI Assistant** (`/dashboard/ai-assistant/chat`)
- Input: kotak pesan teks. Label permanen dekat input: *"Percakapan tidak disimpan — akan hilang saat ditutup/refresh"* (tidak dapat disembunyikan, REQ-M13-012).
- Aksi: "Kirim", "Chat Baru" (reset thread aktif), tab pindah provider (thread paralel, tidak reset — REQ-M13-011).
- Output: percakapan murni transient — tidak ada riwayat tersimpan di server (REQ-M13-003).

---
## 5. Aturan Lintas-Layar (Global)

Berlaku untuk seluruh 43 layar di atas, tidak diulang per layar:

1. **Loading state**: setiap aksi yang memanggil API menampilkan indikator loading pada tombol/area terkait (bukan overlay layar penuh untuk aksi kecil) — tombol dinonaktifkan selama request berjalan untuk mencegah submit ganda.
2. **Error jaringan**: kegagalan koneksi menampilkan toast "Gagal terhubung ke server, coba lagi" dengan tombol retry — form/data yang sudah diisi pengguna **tidak boleh hilang**.
3. **Akses ditolak (403)**: percobaan mengakses layar/aksi di luar permission role menampilkan halaman/pesan "Akses Ditolak" informatif (REQ-M10-010) — bukan redirect diam-diam atau 404 palsu.
4. **Sesi kedaluwarsa**: request gagal karena token expired → redirect otomatis ke Login dengan pesan "Sesi Anda berakhir, silakan masuk kembali", dan (jika teknis memungkinkan) kembali ke halaman asal setelah login ulang.
5. **Konfirmasi aksi destruktif**: Hapus/Nonaktifkan/Tutup Organization/Keluarkan Member selalu melalui dialog konfirmasi eksplisit — tidak ada aksi destruktif sekali klik.
6. **Validasi field**: validasi format (email, nomor telepon, angka) berjalan saat field kehilangan fokus (blur), validasi kelengkapan wajib berjalan saat submit — kombinasi keduanya, bukan hanya salah satu.

---

## 6. Traceability Summary

| Modul | Jumlah Layar | REQ-XXX Tercakup | ENT-XXX Tercakup |
|---|---|---|---|
| M01 | 6 | 8/8 | 2/2 |
| M02 | 4 | 7/7 | 2/2 |
| M03 | 5 | 15/15 | 8/12 (RefWilayah & log-only entities tidak punya layar mandiri) |
| M04 | 5 | 6/6 | 8/8 |
| M05 | 4 | 5/5 | 2/2 |
| M06 | 3 | 6/6 | 4/4 |
| M07 | 2 | 6/6 | 2/2 |
| M08 | 3 | 5/5 | 1/1 |
| M09 | 2 | 6/6 | 2/2 |
| M10 | 2 | 10/10 | 3/3 |
| M11 | 0 | 0/9 *(tidak ada layar — teknis/backend, lihat §1.1)* | 1/1 *(UrlRedirect, tidak user-facing)* |
| M12 | 5 | 19/19 | 3/3 |
| M13 | 2 | 12/12 | 2/2 |
| **Total** | **43** | **105/114** *(9 REQ Modul 11 tanpa layar, by design)* | **40/44** |

**Gap non-blocking dicatat, bukan diasumsikan selesai:** `BR-XXX` (Business Rule ID, EAF Bab 17) belum diregistrasi di PRD v1.2 — sehingga aturan bisnis pada Bagian 5 di atas belum memiliki ID formal untuk saling silang-referensi; akan diregistrasi pada siklus dokumentasi berikutnya.

---

## 7. Quality Gate

| Gate | Status | Catatan |
|---|---|---|
| Seluruh REQ-XXX Must Have/Should Have tercakup layar (kecuali M11 by design) | ✅ Lolos | Lihat Bagian 6 |
| Setiap layar mencantumkan Aktor & Route indikatif | ✅ Lolos | Bagian 2 |
| 2 layar prioritas (Listing, DBR) mendapat spesifikasi field-per-field | ✅ Lolos | Bagian 3 |
| Field form mengikuti kolom ERD v1.3 persis (tidak ada field baru diciptakan) | ✅ Lolos | Divalidasi silang manual field-per-field |
| Tidak ada keputusan bisnis PRD/User Flow yang diubah | ✅ Lolos | Dokumen ini murni terjemahan level-layar |
| State kosong/error didefinisikan untuk layar kompleks | ✅ Lolos | Bagian 3 & 5 |

---

## 8. Langkah Berikutnya

Sesuai urutan `foundation-validation-report.md` Bagian 16, dokumen berikutnya yang sudah bisa dikerjakan:
1. **UI Specification (+ Screen Inventory sebagai basis, Wireframe)** — Bagian 2 dokumen ini (43 layar) langsung dipakai sebagai Screen Inventory resmi; prioritaskan wireframe Form Listing & Kalkulator DBR lebih dulu (konsisten rekomendasi `executive-architecture-review.md`).
2. **Technical Specification (konsolidasi)** — dapat dikerjakan paralel, bahan baku (SYSTEM-ARCHITECTURE, API Spec v1.2, ERD v1.3, Entity Mapping v1.0, Authorization Spec v1.0) sudah lengkap dan tidak bergantung pada dokumen ini.

---

*Dokumen ini adalah Functional Specification resmi proyek — jembatan presisi antara requirement bisnis (PRD) dan desain visual (UI Specification). Perubahan pada dokumen ini mengikuti lifecycle `document-governance-baseline-register.md` Bab 4 — versi lama tidak dihapus, perubahan dicatat sebagai versi baru.*
