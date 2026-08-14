# Product Requirements Document (PRD)
# Platform Web RUMAHAGEN

**Versi:** 1.3 (naik dari 1.2 — Business Rule baru Modul 3: deteksi duplikat foto, `ADR-047`/`OD-25`)
**Tanggal:** 8 Agustus 2026 — tidak ada modul PRD lain yang diubah pada siklus ini
**Status:** Baseline (BERLAKU) — status tidak berubah, hanya versi konten naik

> **Catatan Revisi v1.1 (dipertahankan sebagai riwayat):** Dokumen ini direvisi untuk menyelaraskan dengan ERD, API Specification, User Flow, dan SEO & Analytics Specification setelah audit konflik lintas dokumen (lihat `PROJECT-CONSTITUTION.md`). Perubahan utama: (1) role **Instructor** dan **Buyer** diformalkan di tabel role Bagian 1; (2) ditegaskan **Manager selalu global, tanpa mode "scoped tim/wilayah"**; (3) satuan **tenor DBR diklarifikasi selalu bulan** di kontrak data; (4) fitur **review/rating agen diaktifkan Fase 1**; (5) **framework Next.js ditetapkan** sebagai keputusan default.
>
> **Catatan Revisi v1.2 (siklus Engineering Alignment, 5 Agustus 2026):** Perubahan bersifat **MINOR** (Bab 5 `document-governance-baseline-register.md`) — penambahan konten baru, tidak mengubah keputusan v1.1 yang sudah ada. Rincian:
> 1. **Retrofit skema ID EAF** (`Engineering-Alignment-Framework-v1.0.md` Bab 16) — seluruh 11 modul existing kini memiliki **Requirement Index (REQ-M0X-NNN)** eksplisit, didaftarkan dari requirement yang sudah ada (retrofit, bukan requirement baru/berubah).
> 2. **Modul 12 — Organization Management System** dan **Modul 13 — AI Assistant Integration (BYOK)** ditambahkan penuh, mengeksekusi cakupan yang sebelumnya sengaja ditunda (`document-governance-baseline-register.md` Governance Notes poin 13) — berdasarkan `ADR-026`/`ADR-027` (Organization, =`ADR-043`/`ADR-044`) dan `ADR-028` (AI Assistant, =`ADR-045`), seluruhnya **Approved/Approved With Notes**.
> 3. **Dasar ADR eksplisit**: setiap requirement baru mencantumkan ADR sumber, sesuai `document-governance-baseline-register.md` Bab 11 aturan #2.
> 4. **Tidak ada requirement v1.1 yang diubah substansinya** — retrofit ID murni struktural, konsisten larangan TUGAS 4 "tidak boleh membuka kembali keputusan yang sudah final".
> 5. **BR-XXX (Business Rule ID, EAF Bab 17) belum diregistrasi pada revisi ini** — dicatat sebagai gap tersisa untuk siklus berikutnya, bukan diasumsikan selesai (di luar instruksi eksplisit siklus ini yang hanya meminta REQ-XXX definitif).

---

## 1. Latar Belakang & Tujuan Produk

Platform ini dibangun untuk mendigitalisasi operasional agensi properti, mulai dari onboarding agen, manajemen listing, edukasi/pelatihan agen, kolaborasi dengan developer, hingga alat bantu penjualan berupa kalkulator kelayakan KPR (DBR Scoring) untuk calon pembeli.

### Tujuan Utama
1. Memudahkan perekrutan & administrasi agen properti secara mandiri (self-service registration).
2. Memberikan agen sarana untuk mengelola profil profesional dan listing properti.
3. Meningkatkan kapabilitas agen melalui Learning Center gratis (sertifikasi/pelatihan).
4. Memfasilitasi kolaborasi bisnis agen dengan developer melalui katalog kerja sama proyek.
5. Membantu agen melakukan kualifikasi awal calon pembeli KPR melalui sistem scoring DBR sesuai standar perbankan Indonesia.

### Target Pengguna (User Roles)

Platform menerapkan skema **multirole (Role-Based Access Control/RBAC)** yang dapat dikonfigurasi. Hierarki akses internal dari tertinggi ke terendah: **Superadmin → Manager → Admin → Instructor → Agen**, ditambah role eksternal (Developer Partner, Buyer) dan pengunjung publik tanpa akun (Guest/Lead).

| Role | Level | Deskripsi |
|---|---|---|
| **Superadmin** | Internal — tertinggi | Satu-satunya role dengan akses penuh ke **seluruh fitur web tanpa batasan**, termasuk konfigurasi sistem inti/keamanan web dan hak untuk mengatur permission seluruh role lain (Manager, Admin, Instructor, Agen). Role ini tidak dapat dibatasi/dinonaktifkan. |
| **Manager** | Internal — di atas Admin | Memiliki **seluruh fungsi/akses role Admin** ditambah **akses global** untuk melihat listing dan data seluruh agen — **akses global ini berlaku penuh tanpa pengecualian tim/wilayah dalam bentuk apa pun**; tidak ada mode "scoped per tim/wilayah" untuk Manager di sistem ini. Manager juga dapat **mengubah permission role Agen**. Manager **tidak dapat** mengubah pengaturan keamanan web atau konfigurasi/fitur inti sistem, dan **tidak dapat** mengubah permission role Admin, Instructor, Manager, atau Superadmin — kewenangan tersebut khusus milik Superadmin. |
| **Admin** | Internal — standar | Menjalankan operasional harian: approval agen, moderasi listing, kelola konten Event/Developer, laporan. Cakupan akses berada di bawah Manager, dan **tidak** dapat mengubah konfigurasi sistem inti atau hak akses role lain. |
| **Instructor** | Internal — terbatas ke Modul 4 | Role formal setara Admin **khusus** untuk mengelola konten Learning Center (buat/edit/nonaktifkan kursus, kelola bank soal, pantau progress). Tidak memiliki akses moderasi listing, RBAC, atau konfigurasi sistem inti. Superadmin/Manager/Admin tetap dapat mengelola Learning Center juga (lihat Modul 4). |
| **Agen (Member)** | Internal — standar dasar | Individu terdaftar yang mengelola profil & listing miliknya **sendiri**, ikut pelatihan, dan menggunakan tools scoring. **Tidak dapat** melihat, mengedit, atau menghapus listing maupun data profil milik agen lain. |
| **Developer Partner** | Eksternal — terbatas | Pihak developer yang proyeknya ditampilkan untuk kerja sama agen; akses terbatas ke portal pengajuan proyek/event miliknya sendiri. Login bersifat opsional (partner tanpa login tetap bisa dikelola manual oleh Admin). |
| **Buyer** | Eksternal — akun ringan, opsional login | Akun terdaftar ringan (registrasi mandiri via email/HP atau Google OAuth) untuk pencari properti yang ingin menyimpan listing favorit dan melacak riwayat inquiry/lead pribadinya. **Bukan** prasyarat untuk melihat listing atau menghubungi agen — fungsi tersebut tetap terbuka penuh untuk Guest tanpa akun (lihat baris berikutnya). |
| **Calon Pembeli (Guest/Lead)** | Publik — tanpa login | Melihat listing publik, berinteraksi dengan agen (CTA WhatsApp), dan submit form inquiry tanpa perlu akun sama sekali. |

> Detail lengkap matriks hak akses per modul dijabarkan di **Modul 10 — Manajemen Role & Hak Akses**.

---

## 2. Ringkasan Modul

| No | Kode EAF | Modul | Prioritas | Jumlah REQ Terdaftar |
|---|---|---|---|---|
| 1 | M01 | Registrasi & Autentikasi Agen | Must Have | 8 |
| 2 | M02 | Profil Agen | Must Have | 7 |
| 3 | M03 | Manajemen Listing Properti | Must Have | 15 |
| 4 | M04 | Learning Center (Pelatihan Agen) | Must Have | 6 |
| 5 | M05 | Kalender Event | Should Have | 5 |
| 6 | M06 | Direktori Kerjasama Developer | Must Have | 6 |
| 7 | M07 | Sistem Scoring DBR (Kalkulator KPR) | Must Have | 6 |
| 8 | M08 | Dashboard & Notifikasi (pendukung) | Should Have | 5 |
| 9 | M09 | Admin Panel / CMS | Must Have | 6 |
| 10 | M10 | Manajemen Role & Hak Akses (RBAC) | Must Have | 10 |
| 11 | M11 | SEO, Analytics & Tracking | Must Have | 9 |
| 12 | M12 | Organization Management System **(baru, v1.2)** | Should Have | 19 |
| 13 | M13 | AI Assistant Integration — BYOK **(baru, v1.2)** | Should Have | 12 |

> **Total 114 REQ-XXX terdaftar** pada revisi v1.2 (83 retrofit dari 11 modul existing + 31 baru dari Modul 12/13). Modul 12/13 diberi prioritas **Should Have** (bukan Must Have) karena merupakan penambahan scope Fase 2 sesuai `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` — tidak menggantikan prioritas 11 modul inti Fase 1.

---

## MODUL 1 — Registrasi & Autentikasi Agen

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M01-001 | Registrasi mandiri agen via email/no. HP dengan verifikasi OTP |
| REQ-M01-002 | Login email/password, opsional SSO Google (**SSO Apple: belum diimplementasikan — roadmap masa depan**, resolusi T4-06, audit v1.1, 6 Agustus 2026; tidak ada endpoint/ADR pendukung saat ini) |
| REQ-M01-003 | Upload dokumen legalitas agen (KTP, NPWP, sertifikat REI/AREBI) |
| REQ-M01-004 | Status akun bertahap: Pending Review → Active/Suspended/Rejected (resolusi T4-07: "Verified" bukan status terpisah, disamakan dengan "Active" — 4 nilai `users.status` di skema: `pending_review`, `active`, `suspended`, `rejected`) |
| REQ-M01-005 | Approval manual registrasi oleh Superadmin/Admin/Manager |
| REQ-M01-006 | Reset password & manajemen sesi (logout semua device) |
| REQ-M01-007 | Role & level agen opsional (Junior/Senior/Team Leader) — Fase 2 |
| REQ-M01-008 | Enkripsi data KTP/NPWP tersimpan (compliance data pribadi) |


### Deskripsi
Alur pendaftaran mandiri agen baru, verifikasi, dan login/keamanan akun.

### Fitur
- Registrasi via email/no. HP (OTP verification)
- Login dengan email/password, opsional Google SSO (**SSO Apple: belum diimplementasikan**, lihat REQ-M01-002)
- Upload dokumen legalitas agen (KTP, NPWP, sertifikat REI/AREBI jika ada)
- Status akun: `Pending Review` → `Active` / `Suspended` / `Rejected` (istilah "Verified" disamakan dengan "Active", resolusi T4-07 — lihat skema `users.status`, 4 nilai)
- Approval manual oleh Admin sebelum agen dapat menaikkan listing
- Reset password & manajemen sesi (logout semua device)
- Role & level agen (mis. Junior, Senior, Team Leader) — opsional untuk fase 2

### Data yang Dikumpulkan
Nama lengkap, email, no. HP, KTP, NPWP (opsional), nama kantor/brokerage (jika bernaung), area operasional (kota/kecamatan), dokumen sertifikasi.

### Business Rules
- Agen tidak bisa posting listing sebelum status `Active`.
- Admin mendapat notifikasi setiap ada registrasi baru.
- Data KTP/NPWP disimpan terenkripsi (compliance data pribadi).
- Approval registrasi dapat dilakukan oleh **Superadmin**, **Admin**, atau **Manager** (jika diberi izin) — lihat matriks akses di Modul 10. Role **Agen** hanya dapat mengajukan pendaftaran untuk dirinya sendiri.

### Acceptance Criteria
- Agen baru dapat submit form registrasi lengkap dengan validasi field wajib.
- Sistem mengirim email/SMS OTP dan konfirmasi status ke agen.
- Admin dapat approve/reject dengan alasan penolakan.

---

## MODUL 2 — Profil Agen

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M02-001 | Profil publik & privat agen (foto, bio, spesialisasi, area jangkauan) |
| REQ-M02-002 | Statistik performa otomatis (listing aktif/terjual, rating) |
| REQ-M02-003 | Badge pencapaian (hasil Learning Center, Top Agent) |
| REQ-M02-004 | Link share profil publik |
| REQ-M02-005 | Kontak agen dengan opsi privasi tampil/sembunyi |
| REQ-M02-006 | Review/rating agen oleh Buyer dengan moderasi Admin/Manager/Superadmin |
| REQ-M02-007 | Edit profil dengan approval untuk field sensitif (nama, no. lisensi) |


### Deskripsi
Halaman publik & privat berisi informasi profesional agen, dipakai juga sebagai "kartu nama digital".

### Fitur
- Foto profil, bio singkat, spesialisasi (residensial/komersial/tanah/sewa)
- Area jangkauan pemasaran
- Statistik performa: jumlah listing aktif, listing terjual/tersewa, rating/review dari klien (**diputuskan aktif di Fase 1** — lihat tabel `agent_reviews` di ERD; submit review hanya dapat dilakukan oleh Buyer yang teridentifikasi lewat email/HP, tunduk pada moderasi Admin sebelum tampil publik)
- Badge pencapaian (mis. hasil kelulusan pelatihan di Learning Center, "Top Agent")
- Link share profil publik (mis. `domain.com/agen/nama-agen`)
- Kontak (WA, email) dengan opsi privasi (tampil/sembunyi)

### Data
ID agen, foto, bio, spesialisasi, area, no. lisensi (jika ada), riwayat pelatihan (terhubung ke Modul 4), badge.

### Business Rules
- Statistik listing terjual dihitung otomatis dari Modul 3 (status closing).
- Badge pelatihan otomatis muncul setelah agen lulus kursus terkait di Learning Center.
- **Superadmin**, **Manager**, dan **Admin** dapat melihat & mengedit profil seluruh agen secara global (mis. untuk keperluan approval data sensitif); **Agen** hanya dapat mengelola profilnya sendiri dan **tidak dapat** melihat atau mengedit profil agen lain — lihat matriks lengkap di Modul 10.
- Review/rating agen dapat disubmit oleh **Buyer** (akun terdaftar) — **bukti interaksi/lead sebelumnya tidak diwajibkan** (resolusi **OD-23**, 6 Agustus 2026). Setiap review Buyer berstatus `pending` dan **wajib dimoderasi** Admin/Manager/Superadmin (approve/reject) sebelum tampil di profil publik & sebelum dihitung ke `aggregateRating`. **1 Buyer maksimal 1 review aktif per Agen** — submit kedua ke Agen yang sama **me-replace** review sebelumnya (bukan menambah baris baru); Buyer boleh review banyak Agen berbeda, masing-masing dibatasi 1. **Agen juga dapat submit self-review** untuk profilnya sendiri, dengan batasan yang sama (1 aktif, submit berikutnya me-replace) — **berbeda dari review Buyer, self-review Agen auto-approved langsung tanpa moderasi**, dan **ikut dihitung ke `aggregateRating`** publik sama seperti review Buyer. `aggregateRating` hanya ditampilkan jika minimal 1 review approved ada (baik dari Buyer maupun self-review Agen).

### Acceptance Criteria
- Profil dapat diedit oleh agen ybs, perubahan tertentu (nama, no. lisensi) butuh approval Superadmin/Admin.
- Profil publik dapat diakses tanpa login oleh calon pembeli.

---

## MODUL 3 — Manajemen Listing Properti

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M03-001 | Kategorisasi listing (Primary/Secondary × Dijual/Disewakan) |
| REQ-M03-002 | Form input listing lengkap (lokasi cascading, harga, spesifikasi, legalitas, media) |
| REQ-M03-003 | Auto-link listing Primary ke katalog proyek developer (Modul 6) |
| REQ-M03-004 | CTA "Hubungi via WhatsApp" dengan template pesan otomatis |
| REQ-M03-005 | Pencatatan lead event dari klik CTA WhatsApp |
| REQ-M03-006 | Filter & pencarian listing publik (kombinasi AND) |
| REQ-M03-007 | Mode tampilan List dan Peta (Map View) |
| REQ-M03-008 | Lifecycle status listing (Draft→Menunggu Review→Published→Sold/Rented→Expired) |
| REQ-M03-009 | Ownership listing per-agen (CRUD terbatas milik sendiri) |
| REQ-M03-010 | Auto-expired listing setelah X hari tanpa perpanjangan |
| REQ-M03-011 | Moderasi/approval listing oleh Superadmin/Manager/Admin |
| REQ-M03-012 | Riwayat perubahan harga listing tersimpan |
| REQ-M03-013 | Validasi field wajib sebelum submit review (min. 3 foto, dsb) |
| REQ-M03-014 | Field lokasi wajib dari database referensi wilayah (cascading Provinsi/Kota/Kecamatan) |
| REQ-M03-015 | Pembatasan maksimal listing aktif per agen (opsional, fase lanjutan) |
| REQ-M03-016 | Deteksi kemiripan foto antar-listing milik agen yang sama (exact + perceptual hash), blocking jika identik, warning jika mirip 90–99% |


### Deskripsi
Inti transaksi platform: setiap listing dimiliki dan dikelola oleh masing-masing agen (per-agen ownership), dengan kategori Primary/Secondary dan tujuan Jual/Sewa, dilengkapi CTA kontak langsung ke WhatsApp agen serta pencarian publik dengan filter.

### 3.1 Kategorisasi Listing
Setiap listing wajib memilih kombinasi berikut saat dibuat:

| Kategori Properti | Tujuan Transaksi |
|---|---|
| **Primary** (properti baru dari developer, biasanya terhubung ke Modul 6) | **Dijual** |
| **Secondary** (properti bekas/milik perorangan, non-developer) | **Disewakan** |

- Jika agen memilih **Primary**, sistem dapat menyarankan/menautkan ke katalog proyek developer (Modul 6) agar data legalitas & harga konsisten dengan data resmi.
- Jika agen memilih **Secondary**, seluruh data diinput mandiri oleh agen (tidak terikat data developer).
- Kombinasi yang tidak lazim (mis. Primary disewakan) tetap dapat diakomodasi sistem sebagai opsi, namun default flow diarahkan ke kombinasi umum di atas.

### 3.2 Field Form Input Listing (Umum)

| Kelompok | Field | Keterangan |
|---|---|---|
| Informasi Dasar | Judul listing | Wajib, mis. "Rumah Minimalis 2 Lantai di BSD" |
| | Kategori | Primary / Secondary |
| | Tujuan Transaksi | Dijual / Disewakan |
| | Tipe Properti | Rumah, Apartemen, Ruko, Tanah, Gudang, Kavling, dll |
| Lokasi | Provinsi | **Dropdown**, dipilih dari database wilayah Indonesia (bukan isi bebas) |
| | Kota / Kabupaten | **Dropdown**, opsi mengikuti Provinsi yang dipilih (cascading) |
| | Kecamatan | **Dropdown**, opsi mengikuti Kota/Kabupaten yang dipilih (cascading) |
| | Nama wilayah / kawasan | Opsional, **freetext maks. 20 karakter** — keyword tambahan untuk kawasan spesifik (mis. "BSD City", "Alam Sutera") yang tidak tercakup di data administratif resmi |
| | Alamat lengkap | Freetext, jalan & nomor |
| | Titik peta (lat/long) | Pin lokasi di Maps |
| | Patokan/landmark terdekat | Opsional, membantu pencarian |
| Harga | Harga jual / harga sewa | Wajib; jika sewa: tentukan satuan (per tahun/per bulan) |
| | Nego / Fixed | Toggle |
| | Biaya tambahan | PBB, IPL/maintenance (opsional, untuk apartemen) |
| Deskripsi | Deskripsi listing | Free text, rich text editor |
| | Highlight/keunggulan | Poin-poin singkat (mis. dekat tol, bebas banjir) |
| Spesifikasi Rumah | Luas tanah (m²) | |
| | Luas bangunan (m²) | |
| | Jumlah kamar tidur | |
| | Jumlah kamar mandi | |
| | Jumlah lantai | |
| | Carport/garasi | Jumlah mobil |
| | Daya listrik | Watt |
| | Sumber air | PDAM/sumur |
| | Kondisi furnishing | Unfurnished/Semi/Fully furnished |
| | Tahun bangun/renovasi | Opsional |
| | Fasilitas sekitar | Kolam renang, taman, keamanan 24 jam, dsb (checklist multi-select) |
| Status Legalitas | Jenis sertifikat | SHM, HGB, Girik, PPJB, Strata Title, dll |
| | Status sertifikat | Sudah balik nama / Belum |
| | Kondisi IMB/PBG | Ada/Tidak, nomor (opsional) |
| | Bebas sengketa | Checkbox pernyataan agen |
| Media | Upload foto | Multi-upload, minimal 3 foto, foto utama (cover) dapat dipilih |
| | Upload video/virtual tour | Opsional |
| | Upload dokumen legalitas | Opsional, khusus untuk verifikasi internal (tidak tayang publik) |
| Kontak & CTA | Nomor WhatsApp agen | Auto-terisi dari Profil Agen (Modul 2), dapat override per listing |
| Lainnya | Tags/keyword tambahan | Untuk optimasi pencarian |

### 3.3 Fitur CTA "Hubungi via WhatsApp"
- Tombol **"Chat via WhatsApp"** tampil menonjol di setiap halaman detail listing.
- Saat diklik, membuka WhatsApp (`wa.me/{nomor_agen}`) dengan template pesan otomatis, contoh:
  > "Halo [Nama Agen], saya tertarik dengan listing **[Judul Listing]** di [Lokasi] (Link: [URL Listing]). Apakah masih tersedia?"
- Sistem mencatat setiap klik CTA sebagai **lead event** (untuk analitik: jumlah minat per listing, per agen) — data ini dapat masuk ke Dashboard (Modul 8).
- Fallback: jika nomor WA agen tidak valid/tidak diisi, tombol otomatis nonaktif dan menampilkan alternatif (mis. tombol "Telepon" atau form kontak).

### 3.4 Filter & Pencarian Listing Publik
Filter yang tersedia di halaman pencarian/katalog listing:

| Filter | Detail |
|---|---|
| Kategori | Primary / Secondary |
| Tujuan Transaksi | Dijual / Disewakan |
| Tipe Properti | Rumah, Apartemen, Ruko, Tanah, dll (multi-select) |
| Lokasi | Provinsi/Kota/Kecamatan, atau radius dari titik peta |
| Range Harga | Slider/input min–max harga |
| Range Luas Tanah/Bangunan | Min–max m² |
| Jumlah Kamar Tidur & Kamar Mandi | Min value |
| Status Legalitas | SHM/HGB/dll |
| Urutan (Sort) | Terbaru, Harga Terendah–Tertinggi, Harga Tertinggi–Terendah, Terpopuler (paling banyak klik CTA) |
| Kata kunci bebas | Search box judul/lokasi/deskripsi |

- Hasil pencarian menampilkan card listing (foto cover, judul, lokasi singkat, harga, badge Primary/Secondary, badge Dijual/Disewa) dan dapat ditampilkan dalam mode List atau Peta (Map View).
- Filter dapat dikombinasikan (AND logic) dan disimpan sebagai URL query agar dapat dibagikan.

### Status Listing (Lifecycle)
`Draft` → `Menunggu Review` → `Published` → `Sold` / `Rented` → `Expired`

### Data
ID listing, agen pemilik, kategori (Primary/Secondary), tujuan transaksi (Jual/Sewa), tipe properti, judul, deskripsi, lokasi (alamat + lat/long), harga, spesifikasi rumah (lengkap sesuai tabel 3.2), status legalitas, foto/video, nomor WA CTA, status listing, tanggal posting, tanggal expired, sumber (mandiri/dari katalog developer), jumlah klik CTA WhatsApp.

### Business Rules
- Listing selalu terikat ke satu agen sebagai pemilik (ownership per-agen); agen lain tidak dapat mengedit listing milik agen lain.
- Listing otomatis expired setelah X hari jika tidak diperpanjang (mis. 30/60 hari, dikonfigurasi admin).
- Listing kategori Primary yang ditautkan ke proyek developer (Modul 6) wajib mengikuti harga & spesifikasi resmi dari developer (tidak bisa diubah bebas oleh agen); field lain (deskripsi tambahan, foto pribadi) tetap bisa disesuaikan agen.
- Listing kategori Secondary sepenuhnya diinput dan menjadi tanggung jawab data oleh agen; pernyataan "bebas sengketa" & legalitas menjadi representasi agen.
- Setiap listing wajib memiliki nomor WhatsApp aktif untuk CTA sebelum dapat berstatus `Published`.
- Sistem approval listing oleh admin sebelum tayang publik (moderasi konten, kelengkapan legalitas, dan kewajaran harga).
- Riwayat perubahan harga listing tersimpan (untuk transparansi & analitik tren harga).
- Maksimal jumlah listing aktif per agen dapat dibatasi sesuai tier keanggotaan (opsional, fase lanjutan).
- Moderasi/approval listing dapat dilakukan oleh **Superadmin**, **Manager**, atau **Admin** — ketiganya memiliki akses global ke seluruh listing semua agen (lihat matriks akses di Modul 10). Role **Agen** hanya dapat CRUD listing miliknya sendiri, **tidak dapat mengedit/menghapus listing agen lain**, dan tidak memiliki akses moderasi.
- Field Provinsi, Kota/Kabupaten, dan Kecamatan **wajib dipilih dari database referensi wilayah Indonesia** (bukan isi bebas) agar data lokasi konsisten dan dapat difilter/diagregasi secara akurat; ketiganya bersifat cascading (opsi Kota/Kabupaten mengikuti Provinsi terpilih, opsi Kecamatan mengikuti Kota/Kabupaten terpilih). Field "Nama wilayah/kawasan" bersifat freetext terbatas (maks. 20 karakter) sebagai keyword pelengkap saja, tidak menggantikan data administratif resmi.
- **(v1.3, baru)** Sistem melakukan pengecekan kemiripan foto (exact hash + perceptual hash) terhadap foto listing aktif (`Published`/`Menunggu Review`) milik agen yang sama, saat agen submit listing untuk review. Foto identik (similarity 100%) memblokir submit; kemiripan 90–99% menampilkan peringatan non-blocking (submit tetap dapat dilanjutkan); di bawah 90% tidak ditandai. Pengecekan dibatasi ke listing milik agen yang sama — tidak lintas agen, agar tidak mengganggu penggunaan foto proyek Primary yang sah dipakai berulang oleh agen berbeda. Lihat `ADR-047`, `REQ-M03-016`.

### Acceptance Criteria
- Agen dapat CRUD listing miliknya sendiri, memilih kategori (Primary/Secondary) dan tujuan transaksi (Jual/Sewa) sejak awal input.
- Form listing memvalidasi seluruh field wajib (judul, lokasi, harga, minimal 3 foto, status legalitas, nomor WA) sebelum dapat disubmit untuk review.
- Tombol CTA WhatsApp berfungsi membuka chat dengan pesan template otomatis dan tercatat sebagai lead event.
- Halaman katalog listing dapat difilter menggunakan seluruh filter pada tabel 3.4 secara kombinasi, serta ditampilkan dalam mode List dan Peta.
- Admin dapat melakukan moderasi (approve/reject/take down) listing sebelum tayang publik.

---

## MODUL 4 — Learning Center (Pelatihan Agen)

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M04-001 | Katalog kursus/pelatihan dengan kategori |
| REQ-M04-002 | Self-enroll kursus gratis tanpa approval |
| REQ-M04-003 | Konten kursus (video, PDF/slide, kuis evaluasi) |
| REQ-M04-004 | Sertifikat digital otomatis setelah lulus (passing grade) |
| REQ-M04-005 | Progress tracking per agen |
| REQ-M04-006 | Pengelolaan konten kursus oleh Superadmin/Admin/Instructor |


### Deskripsi
Portal edukasi agen berbasis kursus, gratis, untuk meningkatkan kompetensi (produk knowledge, teknik closing, legal properti, penggunaan sistem DBR, dsb).

### Fitur
- Katalog kursus/pelatihan dengan kategori (Sales Skill, Legal & Regulasi, Produk Developer, Financial/KPR Literacy, dsb)
- Pendaftaran kursus gratis (self-enroll), tanpa perlu approval
- Konten kursus: video, materi PDF/slide, kuis evaluasi
- Sertifikat digital otomatis setelah lulus (progress ≥ 100% & lulus kuis)
- Progress tracking per agen (modul selesai, skor kuis)
- Jadwal kelas live/webinar (terhubung ke Modul 5 – Kalender Event)
- Leaderboard/gamifikasi (opsional, fase 2)

### Data
ID kursus, judul, kategori, konten (link video/file), kuis & bank soal, durasi, status kelulusan agen, sertifikat.

### Business Rules
- Sertifikat hanya terbit jika skor kuis ≥ passing grade (dikonfigurasi per kursus, mis. 70%).
- Kursus dapat memiliki prasyarat (harus lulus kursus A dulu sebelum kursus B) — opsional.
- Sertifikat & badge otomatis sinkron ke Profil Agen (Modul 2).
- Pembuatan/pengelolaan konten kursus (buat, edit, nonaktifkan, kelola bank soal) hanya dapat dilakukan oleh **Superadmin**, **Admin**, dan **Instructor** (role formal tersendiri — lihat tabel role di Bagian 1, setara Admin namun terbatas ke Modul 4 saja); role **Manager** memiliki akses Full (mengikuti hak Admin secara global) namun **tidak wajib** aktif mengelola konten harian — dapat didelegasikan ke Instructor; role **Agen** hanya dapat mendaftar (self-enroll) dan mengerjakan kursus, tidak memiliki akses kelola konten sama sekali.

### Acceptance Criteria
- Agen dapat mendaftar kursus tanpa biaya dan tanpa approval admin.
- Sistem otomatis mengeluarkan sertifikat digital (PDF/gambar) setelah lulus.
- Superadmin, Admin, Instructor, dan **Manager** dapat membuat, mengedit, dan menonaktifkan kursus (Manager memiliki akses Full mengikuti hak Admin secara global, konsisten Business Rule di atas — **resolusi OD-16, 6 Agustus 2026**, sebelumnya baris ini keliru menyatakan Manager tidak punya akses, bertentangan langsung dengan Business Rule di dokumen yang sama); Agen tidak dapat mengakses menu kelola konten ini.

---

## MODUL 5 — Kalender Event

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M05-001 | Kalender event dengan kategori (Pelatihan/Launching/Open House/Gathering) |
| REQ-M05-002 | RSVP/pendaftaran event oleh agen |
| REQ-M05-003 | Reminder notifikasi H-1 dan H-1 jam sebelum event |
| REQ-M05-004 | Pengajuan event oleh Developer Partner dengan approval Admin |
| REQ-M05-005 | Auto waiting list saat kuota peserta penuh |


### Deskripsi
Kalender terpusat untuk event internal (pelatihan live, gathering agen) maupun event eksternal (launching proyek developer, open house/pameran properti).

### Fitur
- Tampilan kalender bulanan/mingguan dengan kategori event (Pelatihan, Launching Proyek, Open House, Gathering)
- Detail event: judul, deskripsi, lokasi (offline/online + link meeting), pembicara/host, kuota peserta
- RSVP/pendaftaran event oleh agen
- Reminder notifikasi (email/push) H-1 dan H-1 jam sebelum event
- Integrasi dengan Learning Center untuk event berbentuk webinar/kelas
- Integrasi dengan Modul 6: developer partner dapat mengajukan event launching proyek untuk ditampilkan (dengan approval admin)

### Data
ID event, judul, kategori, tanggal & waktu, lokasi, penyelenggara, kuota, daftar peserta terdaftar.

### Business Rules
- Event dari developer partner harus melalui approval admin sebelum tayang.
- Jika kuota penuh, sistem otomatis menutup pendaftaran / membuat waiting list.
- **Superadmin**, **Manager**, dan **Admin** dapat membuat & mempublikasikan event secara langsung tanpa approval tambahan; **Agen** dan **Developer Partner** hanya dapat melakukan RSVP atau mengajukan event (khusus Developer Partner untuk event launching proyek miliknya), tanpa hak publikasi langsung.

### Acceptance Criteria
- Agen dapat melihat kalender event dan mendaftar (RSVP).
- Superadmin, Admin, dan **Manager** dapat membuat event baru langsung tayang tanpa approval tambahan (konsisten Business Rule di atas — **resolusi OD-17, 6 Agustus 2026**, sebelumnya baris ini keliru menempatkan Manager di grup wajib-approval, bertentangan langsung dengan Business Rule di dokumen yang sama); Developer Partner hanya dapat mengajukan event yang memerlukan approval.
- Sistem mengirim reminder otomatis ke peserta terdaftar.

---

## MODUL 6 — Direktori Kerjasama Developer (Marketing Gallery)

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M06-001 | Katalog proyek developer (nama, lokasi, tipe, harga, brosur) |
| REQ-M06-002 | Klaim proyek oleh agen → auto-generate listing (Modul 3) |
| REQ-M06-003 | Skema komisi per proyek ditampilkan ke agen |
| REQ-M06-004 | Materi marketing kit dapat diunduh agen |
| REQ-M06-005 | Status proyek (Aktif/Coming Soon/Sold Out/Non-Aktif) |
| REQ-M06-006 | Tracking agen yang memasarkan proyek (untuk komisi/reporting) |


### Deskripsi
Katalog resmi proyek-proyek developer yang bekerja sama dengan agensi, sebagai "bahan jualan" yang bisa dipilih agen untuk dipasarkan.

### Fitur
- Daftar proyek developer: nama proyek, developer, lokasi, tipe (rumah tapak/apartemen/komersial), rentang harga, brosur/e-katalog, unit availability
- Agen dapat "klaim/pilih" proyek untuk dijadikan listing pemasaran pribadi (auto-generate listing sesuai Modul 3, dengan data resmi dari developer)
- Skema komisi per proyek (persentase/nominal) ditampilkan ke agen
- Materi marketing kit (foto HD, video, brosur PDF, price list) dapat diunduh agen
- Status proyek: `Aktif`, `Coming Soon`, `Sold Out`, `Non-Aktif`
- Tracking agen mana saja yang memasarkan proyek tsb (untuk keperluan komisi/reporting)

### Data
ID proyek, nama developer, PIC developer, lokasi, tipe unit, price list, skema komisi, status, materi marketing, daftar agen yang klaim.

### Business Rules
- Hanya admin yang dapat menambahkan/mengubah data proyek developer (data resmi, sensitif terhadap harga).
- Satu proyek dapat diklaim oleh banyak agen sekaligus (non-eksklusif) kecuali dikonfigurasi eksklusif per wilayah. **Cakupan "wilayah" = per Kota (`city_id`)** — resolusi **OD-19**, 6 Agustus 2026: jika `is_exclusive_by_region=true`, sistem menolak/memberi notifikasi konflik saat ada `developer_projects` lain aktif dengan `is_exclusive_by_region=true` di `city_id` yang sama. Tidak perlu kolom skema baru — memakai `developer_projects.city_id` yang sudah ada (`0006_m06_developer.sql`), konsisten pola filter `listings`.
- Perubahan harga/unit availability dari developer harus tercermin real-time ke semua listing turunan agen.

### Acceptance Criteria
- Admin dapat CRUD data proyek developer & materi marketing.
- Agen dapat browsing katalog dan "klaim" proyek untuk dijadikan listing.
- Perubahan data resmi proyek otomatis ter-update di listing turunan.

---

## MODUL 7 — Sistem Scoring DBR (Debt to Burden Ratio) untuk Kelayakan KPR

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M07-001 | Kalkulator DBR dengan input data calon pembeli |
| REQ-M07-002 | Konversi satuan tenor tahun→bulan (kontrak data selalu bulan) |
| REQ-M07-003 | Kalkulasi otomatis plafon KPR, angsuran, DBR% |
| REQ-M07-004 | Indikator hasil (Layak/Perlu Review/Tidak Layak) berbasis threshold configurable |
| REQ-M07-005 | Simulasi skenario interaktif & simpan sebagai Lead/Prospek |
| REQ-M07-006 | Export hasil simulasi ke PDF & riwayat simulasi per agen |


### Deskripsi
Kalkulator yang membantu agen melakukan kualifikasi awal (pre-screening) kemampuan bayar angsuran calon pembeli sebelum diajukan ke bank, mengacu pada standar perhitungan DBR/DSR perbankan Indonesia.

### Konsep Perhitungan (perlu dikonfirmasi ke tim bisnis/legal sebelum go-live, karena kebijakan tiap bank berbeda)
```
DBR (%) = (Total Angsuran Kredit Berjalan + Estimasi Angsuran KPR Baru)
          -------------------------------------------------------------  x 100%
                         Penghasilan Bersih per Bulan

Estimasi Angsuran KPR Baru dihitung dengan formula anuitas:
Angsuran = P x (r x (1+r)^n) / ((1+r)^n - 1)
P = Plafon kredit (Harga Properti - Uang Muka/DP)
r = suku bunga per bulan (suku bunga tahunan / 12)
n = jumlah bulan tenor
```
Standar umum perbankan Indonesia: batas DBR maksimal biasanya **30%–40%** dari penghasilan bersih (angka pasti bervariasi per bank/OJK, harus dikonfigurasi sebagai parameter, bukan hard-code).

### Fitur
- Input data calon pembeli: penghasilan bersih bulanan (gaji/usaha), total cicilan berjalan (kartu kredit, KTA, kendaraan, KPR lain), harga properti, DP, tenor, estimasi suku bunga
- **Satuan tenor**: UI form boleh menampilkan input tenor dalam **tahun** untuk kenyamanan pengguna, namun nilai tersebut **wajib dikonversi ke bulan (tahun × 12) di sisi client sebelum dikirim ke API** — kontrak data (`tenor_months` di ERD & payload API) selalu dalam satuan **bulan**, bukan tahun. Ini satu-satunya sumber kebenaran satuan tenor di seluruh sistem.
- Kalkulasi otomatis: plafon KPR, estimasi angsuran bulanan, DBR %
- Indikator hasil: `Layak`, `Perlu Review`, `Tidak Layak` berdasarkan threshold DBR yang dikonfigurasi admin
- Simulasi skenario (ubah DP/tenor untuk melihat perubahan DBR secara interaktif)
- Simpan hasil simulasi sebagai "Lead/Prospek" yang terhubung ke agen ybs
- Export hasil ke PDF (untuk dilampirkan agen ke bank saat pengajuan KPR)
- Riwayat simulasi per agen/klien
- (Opsional Fase 2) Integrasi API BI Checking/SLIK untuk validasi cicilan berjalan otomatis

### Data
ID simulasi, agen, data calon pembeli (nama, penghasilan, cicilan berjalan), harga properti, DP, tenor, suku bunga, hasil DBR%, status kelayakan, timestamp.

### Business Rules
- Parameter threshold DBR (mis. 35%) dan suku bunga default hanya dapat dikonfigurasi oleh **Superadmin** (konfigurasi sistem inti), karena aturan bisa berubah/berbeda per bank rekanan — **Admin tidak memiliki akses ubah parameter ini secara default**, kecuali diberi izin eksplisit oleh Superadmin.
- Data finansial calon pembeli adalah data sensitif → wajib enkripsi & akses dibatasi: **Agen** hanya dapat melihat simulasi miliknya sendiri; **Superadmin**, **Manager**, dan **Admin** dapat melihat seluruh simulasi milik semua agen (global) untuk keperluan audit/support.
- Hasil dari fitur ini bersifat **estimasi/simulasi awal**, bukan keputusan final bank — disclaimer wajib ditampilkan di setiap hasil.

### Acceptance Criteria
- Agen dapat menginput data dan mendapat hasil DBR% beserta status kelayakan secara instan.
- Agen dapat mengubah parameter (DP/tenor) dan melihat hasil ter-update real-time.
- Sistem dapat mengekspor hasil simulasi ke PDF.
- Disclaimer legal tampil jelas pada setiap hasil perhitungan.
- Hanya Superadmin yang dapat mengubah threshold DBR & suku bunga default di seluruh sistem; percobaan akses oleh role lain tanpa izin menghasilkan response ditolak.

---

## MODUL 8 — Dashboard & Notifikasi (Pendukung Lintas Modul)

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M08-001 | Dashboard agen (ringkasan listing, lead, progress, event) |
| REQ-M08-002 | Dashboard admin (statistik global agen, listing, engagement) |
| REQ-M08-003 | Notifikasi in-app/email/push (opsional WA Business API) |
| REQ-M08-004 | Cakupan data dashboard sesuai role (global vs milik sendiri) |
| REQ-M08-005 | Notifikasi personal per user, tanpa bocor lintas-scope |


### Fitur
- Dashboard agen: ringkasan listing aktif, jumlah lead/simulasi DBR, progress pelatihan, event mendatang
- Dashboard admin: statistik agen baru, listing pending approval, engagement Learning Center, laporan proyek developer per agen
- Notifikasi in-app, email, dan push (opsional WA Business API) untuk: approval status, reminder event, listing akan expired, sertifikat baru terbit

### Cakupan Data Dashboard per Role
- **Superadmin**, **Manager**, dan **Admin**: melihat data **global** (seluruh agen, seluruh listing, seluruh transaksi/simulasi di sistem) — ketiganya setara dalam hal cakupan visibilitas data.
- **Agen**: hanya melihat data **miliknya sendiri** (listing sendiri, lead sendiri, progress kursus sendiri, prospek DBR sendiri).
- Notifikasi selalu bersifat personal per user (mis. notifikasi approval hanya dikirim ke agen ybs dan ke role yang berwenang approve sesuai Modul 10), tidak ada notifikasi lintas-scope yang bocor ke role tanpa akses terkait.

---

## MODUL 9 — Admin Panel / CMS

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M09-001 | Manajemen user (agen, admin, manager, developer partner, instruktur) |
| REQ-M09-002 | Moderasi listing & konten |
| REQ-M09-003 | Manajemen konten Learning Center |
| REQ-M09-004 | Manajemen data developer & proyek |
| REQ-M09-005 | Konfigurasi parameter sistem (threshold DBR, suku bunga, masa expired listing) |
| REQ-M09-006 | Laporan & analitik (export Excel/PDF) |


### Fitur
- Manajemen user (agen, admin, manager, developer partner, instruktur)
- Moderasi listing & konten
- Manajemen konten Learning Center (kursus, kuis, sertifikat template)
- Manajemen data developer & proyek
- Konfigurasi parameter sistem (threshold DBR, suku bunga default, masa expired listing, dsb)
- Laporan & analitik (export ke Excel/PDF)

### Catatan Akses Multirole
Seluruh fitur di atas tunduk pada matriks hak akses di **Modul 10**. Sebagai gambaran umum: **Superadmin** memiliki akses penuh ke seluruh sub-menu termasuk konfigurasi sistem inti & keamanan web; **Manager** memiliki seluruh akses operasional Admin (moderasi, kelola konten, kelola akun Admin/Agen) ditambah akses "Kelola Permission Agen" di Modul 10, namun **tidak dapat** membuka menu konfigurasi sistem inti/keamanan web maupun permission Admin/Manager/Superadmin; **Admin** memiliki akses operasional standar namun tidak dapat mengelola akun Admin/Manager/Superadmin lain maupun mengubah konfigurasi sistem inti; **Agen** tidak memiliki akses ke Admin Panel sama sekali.

---

## MODUL 10 — Manajemen Role & Hak Akses (RBAC)

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M10-001 | Manajemen Role (lihat daftar role & jumlah user per role) |
| REQ-M10-002 | Permission Matrix Editor penuh (khusus Superadmin) |
| REQ-M10-003 | Permission Editor Terbatas untuk role Agen (khusus Manager) |
| REQ-M10-004 | Assign Role ke User (dengan batasan hierarki) |
| REQ-M10-005 | Role Kustom di luar default (opsional, fase lanjutan) |
| REQ-M10-006 | Preview Akses ("lihat sebagai role X") |
| REQ-M10-007 | Audit Trail perubahan permission (siapa, kapan, apa) |
| REQ-M10-008 | Proteksi role Superadmin (tidak dapat dihapus, minimal 1 akun aktif) |
| REQ-M10-009 | Real-time enforcement perubahan matriks akses |
| REQ-M10-010 | Response "Akses Ditolak" informatif untuk akses tanpa izin |


### Deskripsi
Modul pusat pengaturan multirole dengan hierarki **Superadmin → Manager → Admin → Agen**. **Superadmin** adalah satu-satunya role dengan akses penuh ke seluruh fitur web, termasuk pengaturan keamanan/konfigurasi inti sistem. **Manager** memiliki seluruh kapabilitas operasional Admin ditambah visibilitas global atas seluruh data agen, serta kewenangan terbatas untuk menyesuaikan hak akses role **Agen** — namun tidak dapat menyentuh pengaturan keamanan web, konfigurasi fitur inti, maupun permission role Admin/Manager/Superadmin.

### Fitur
- **Manajemen Role**: lihat daftar role (Superadmin, Manager, Admin, Agen, Developer Partner) beserta jumlah user per role.
- **Permission Matrix Editor (Superadmin)**: akses penuh mengatur toggle akses (Full Access / View Only / Own Data Only / No Access) untuk **semua** kombinasi Role × Modul × Aksi, termasuk permission Manager, Admin, dan pengaturan keamanan/fitur inti web.
- **Permission Editor Terbatas (Manager)**: sub-menu khusus yang **hanya menampilkan & mengizinkan perubahan permission untuk role Agen** (mis. membatasi/melonggarkan fitur mana saja yang boleh diakses Agen). Menu pengaturan permission untuk role Admin, Manager, dan Superadmin, serta menu keamanan/konfigurasi sistem, **tidak tampil sama sekali** bagi Manager (bukan sekadar disabled, agar tidak membocorkan struktur konfigurasi inti).
- **Assign Role ke User**: Superadmin dapat mengubah role user apa pun (termasuk menjadikan seseorang Manager/Admin). Manager dapat mempromosikan/menurunkan role antara **Agen ↔ Admin** (karena berada di bawahnya dalam hierarki), namun **tidak dapat** membuat, mengubah, atau menghapus akun ber-role Manager atau Superadmin.
- **Role Kustom (opsional, fase lanjutan)**: hanya Superadmin yang dapat membuat role baru di luar 4 default.
- **Preview Akses**: Superadmin dapat "lihat sebagai role X" untuk memverifikasi tampilan/menu yang akan dilihat role tsb.
- **Audit Trail Perubahan Permission**: setiap perubahan matriks akses (oleh Superadmin maupun Manager) tercatat (siapa, kapan, perubahan apa) — terhubung ke `audit_logs`.
- **Proteksi Role Superadmin**: role Superadmin tidak dapat dihapus/diubah oleh siapa pun selain Superadmin lain, dan minimal harus ada 1 akun aktif berstatus Superadmin di sistem (safety guard).

### Matriks Hak Akses per Modul (Default)

| Modul / Fitur | Superadmin | Manager | Admin | Agen |
|---|:---:|:---:|:---:|:---:|
| M1 — Approval registrasi agen | Full | Full | Full | Ajukan diri sendiri |
| M2 — Profil Agen | Full (semua agen) | Full (semua agen, global) | Full (semua agen) | Kelola profil sendiri — **tidak dapat lihat/edit profil agen lain** |
| M3 — Listing: buat/edit | Full | View semua agen (global), tidak membuat listing atas nama agen | View semua, tidak buat | Kelola listing sendiri — **tidak dapat mengedit/menghapus listing agen lain** |
| M3 — Listing: moderasi/approve | Full | Full (seluruh listing, semua agen) | Full | Tidak ada |
| M4 — Learning Center: ikut kursus | Full | Full | Full | Full (self-enroll) |
| M4 — Learning Center: kelola konten | Full | Full | Full | Tidak ada |
| M5 — Kalender Event: RSVP | Full | Full | Full | Full |
| M5 — Kalender Event: buat/kelola | Full | Full | Full | Tidak ada |
| M6 — Katalog Developer: kelola proyek | Full | Full | Full | View + klaim proyek |
| M7 — Scoring DBR: input simulasi | Full | Full | Full | Full (data milik sendiri) |
| M7 — Scoring DBR: lihat semua simulasi | Full | Full (global, seluruh agen) | Full | Hanya milik sendiri |
| M8 — Dashboard | Global (semua data) | Global (semua data) | Global (semua data) | Data milik sendiri |
| M9 — Admin Panel: kelola user | Full (termasuk kelola Manager/Admin) | Full untuk kelola **Admin & Agen** (promote/demote/suspend); **tidak bisa** kelola akun Manager/Superadmin | Terbatas (tidak bisa kelola Admin/Manager/Superadmin lain) | Tidak ada |
| M9 — Admin Panel: konfigurasi sistem & keamanan web | Full | **Tidak ada** | Tidak ada | Tidak ada |
| M10 — Kelola Permission role Agen | Full | **Full** (dapat mengubah batasan fitur untuk role Agen) | Tidak ada | Tidak ada |
| M10 — Kelola Permission role Admin/Manager & konfigurasi RBAC inti | Full | **Tidak ada** | Tidak ada | Tidak ada |

### Business Rules
- **Superadmin selalu full-access** ke seluruh fitur web tanpa kecuali — termasuk satu-satunya role yang dapat mengubah pengaturan keamanan web dan konfigurasi/fitur inti sistem. Permission untuk role ini tidak muncul sebagai opsi yang bisa di-toggle/dibatasi (hardcoded di level aplikasi).
- **Manager memiliki seluruh fungsi operasional Admin secara otomatis** (bukan permission terpisah yang perlu dikonfigurasi ulang) ditambah **akses global** untuk melihat listing dan data seluruh agen tanpa batasan tim/wilayah.
- **Manager hanya berwenang mengubah permission/batasan fitur untuk role Agen.** Manager **tidak memiliki akses** ke: (a) pengaturan keamanan web, (b) konfigurasi/fitur inti sistem (mis. threshold DBR, masa expired listing — kecuali secara eksplisit didelegasikan Superadmin), dan (c) permission role Admin, Manager, atau Superadmin.
- **Agen tidak pernah dapat melihat, mengedit, atau menghapus listing maupun data profil milik agen lain**, terlepas dari perubahan permission apa pun yang dilakukan Manager — batasan ini bersifat *hard rule* di level aplikasi/ownership data (`agent_id` pemilik), bukan sekadar permission yang bisa dilonggarkan.
- Perubahan matriks akses (oleh Superadmin maupun Manager, dalam kewenangannya masing-masing) **berlaku langsung (real-time)** ke seluruh user dengan role terkait pada request berikutnya.
- Setiap endpoint/aksi di backend wajib melakukan pengecekan permission terhadap matriks ini (middleware/guard) berdasarkan hierarki **Superadmin → Manager → Admin → Agen**, bukan hanya menyembunyikan tombol di UI.
- User dengan role yang di-nonaktifkan aksesnya ke suatu modul akan menerima halaman/response "Akses Ditolak" yang informatif, bukan error generik.

### Acceptance Criteria
- Superadmin dapat membuka Permission Matrix Editor penuh dan mengubah akses Manager/Admin/Agen per modul-aksi, termasuk pengaturan keamanan web; perubahan tersimpan dan langsung berlaku.
- Manager dapat membuka menu "Kelola Permission Agen" dan mengubah batasan fitur untuk role Agen; Manager **tidak melihat** menu pengaturan keamanan web, konfigurasi sistem inti, atau permission Admin/Manager/Superadmin di UI maupun API.
- Manager dapat melakukan seluruh aksi yang bisa dilakukan Admin (approval, moderasi, kelola konten) ditambah melihat listing & profil seluruh agen tanpa batasan.
- Agen yang mencoba mengakses/mengedit listing atau profil milik agen lain (baik lewat UI maupun manipulasi request API) selalu menerima response ditolak (HTTP 403), terlepas dari konfigurasi permission apa pun.
- Percobaan Manager mengakses endpoint konfigurasi sistem/keamanan atau permission Admin/Manager/Superadmin menghasilkan response ditolak (HTTP 403) yang konsisten.
- Perubahan role seorang user tercatat di audit log dan permission baru berlaku pada login/request berikutnya.
- Minimal 1 akun Superadmin selalu ada di sistem; sistem mencegah penghapusan/downgrade akun Superadmin terakhir oleh siapa pun, termasuk Manager.
- User dengan role yang di-nonaktifkan aksesnya ke suatu modul akan menerima halaman/response "Akses Ditolak" yang informatif, bukan error generik.

---

## MODUL 11 — SEO, Analytics & Tracking

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M11-001 | Rendering SSR/SSG untuk seluruh halaman publik |
| REQ-M11-002 | Slug URL deskriptif dengan pencatatan redirect otomatis |
| REQ-M11-003 | Meta title/description/Open Graph/Twitter Card per halaman publik |
| REQ-M11-004 | Structured data (JSON-LD/Schema.org) |
| REQ-M11-005 | XML Sitemap otomatis + integrasi Google Indexing API |
| REQ-M11-006 | robots.txt & meta robots (noindex halaman privat) |
| REQ-M11-007 | Integrasi Google Tag Manager & GA4 dengan event generate_lead |
| REQ-M11-008 | Cookie consent banner & Google Consent Mode |
| REQ-M11-009 | Optimasi Core Web Vitals |


### Deskripsi
Modul lintas-halaman yang memastikan seluruh halaman publik (listing, profil agen, proyek developer, homepage) dapat **terindeks mesin pencari secepat dan seakurat mungkin**, serta terhubung ke Google Tag Manager/Analytics untuk mengukur performa marketing. Detail teknis lengkap ada di dokumen terpisah **SEO & Analytics Specification**.

### Fitur
- **Rendering SSR/SSG** untuk seluruh halaman publik (bukan CSR murni) agar konten penuh terbaca crawler mesin pencari sejak request pertama.
- **Slug URL deskriptif** untuk listing, profil agen, dan proyek developer — auto-generate dari judul/nama, dapat diubah manual dengan pencatatan redirect otomatis agar tidak menimbulkan broken link.
- **Meta title, meta description, Open Graph, dan Twitter Card** per halaman publik — auto-generate dari template, dapat ditimpa manual oleh agen/admin.
- **Structured data (JSON-LD/Schema.org)** untuk listing, profil agen, dan breadcrumb — meningkatkan peluang tampil sebagai rich result di Google.
- **XML Sitemap otomatis** (terpisah per tipe: listing, agen, proyek developer, statis) yang ter-update setiap ada perubahan status listing, plus integrasi **Google Indexing API** untuk permintaan crawl-ulang cepat.
- **robots.txt & meta robots** yang membedakan halaman publik (indexable) dari halaman privat (dashboard, chat, hasil kalkulator DBR — wajib `noindex`).
- **Integrasi Google Tag Manager & Google Analytics 4** di seluruh halaman publik, dengan event tracking konversi utama (`generate_lead` dari klik CTA WhatsApp/form inquiry) sebagai metrik keberhasilan marketing.
- **Cookie consent banner** & Google Consent Mode untuk kepatuhan privasi.
- **Optimasi Core Web Vitals** (kecepatan gambar via CDN, lazy-load, caching edge untuk halaman publik).

### Business Rules
- Keputusan rendering SSR/SSG **wajib diambil sejak awal development** (bagian dari Fase 1/MVP), karena mengganti strategi rendering setelah aplikasi besar sangat mahal dan berisiko menghilangkan traffic organik yang sudah terbentuk.
- Perubahan `slug` pada listing/proyek developer, atau penghapusan permanen, **wajib** mencatat entri redirect (301) — tidak boleh langsung menghasilkan 404 pada URL yang sudah terlanjur diindeks Google.
- Listing berstatus `sold`/`rented` **tetap tayang** (tidak dihapus/di-noindex) untuk mempertahankan nilai SEO yang sudah terbangun; hanya listing `expired` tanpa perpanjangan yang di-*noindex* setelah 30 hari.
- Data yang dikirim ke Google Analytics **tidak boleh menyertakan PII** (nama, no. HP, email calon pembeli) — hanya event & parameter agregat, konsisten dengan batasan data sensitif di ERD.
- Konfigurasi GTM Container ID, GA4 Measurement ID, dan verifikasi GSC hanya dapat diubah oleh **Superadmin** (bagian dari konfigurasi sistem inti, sesuai RBAC Modul 10).

### Acceptance Criteria
- Halaman Homepage, Search, Detail Listing, Profil Agen, dan Detail Proyek Developer menghasilkan HTML lengkap (bukan halaman kosong) saat diakses tanpa JavaScript aktif (indikator SSR berhasil).
- Setiap listing publik memiliki slug unik, meta title/description (auto atau manual), dan structured data valid (dapat diverifikasi lewat Google Rich Results Test).
- Sitemap XML dapat diakses publik dan ter-update otomatis maksimal beberapa menit setelah listing baru dipublikasikan.
- Halaman dashboard/admin/chat/hasil DBR tidak muncul di hasil pencarian Google (terverifikasi via `site:` search atau Google Search Console setelah go-live).
- Event `generate_lead` tercatat di GA4 setiap kali CTA WhatsApp diklik, dapat diverifikasi lewat GA4 DebugView.

---

## MODUL 12 — Organization Management System *(baru, v1.2)*

> **Dasar ADR:** `ADR-026` (entitas Organization, Approved With Notes) & `ADR-027` (otorisasi Organization-scoped, Approved) \u2014 disinkronkan `decision-log.md` sebagai `ADR-043`/`ADR-044`. Sumber: `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` \u00a71\u201317.

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M12-001 | Entitas Organization berdiri sendiri (bukan role akun); role akun (`agent`, dst.) tidak berubah |
| REQ-M12-002 | Dimensi baru **Organization Status**: `Individual`/`Leader`/`Member`, terpisah dari `roles.code` platform |
| REQ-M12-003 | Satu Agen maksimal 1 Organization aktif (sebagai Leader atau Member, tidak keduanya) \u2014 ditegakkan level database |
| REQ-M12-004 | Tidak ada Transfer Kepemimpinan \u2014 Leader keluar/menutup Organization \u2192 Organization otomatis bubar |
| REQ-M12-005 | Leader tidak boleh invite/di-invite Leader lain selagi masih memimpin Organization-nya |
| REQ-M12-006 | Form Create Organization 2 tahap: (1) `organization_name` + `organization_type` wajib \u2192 langsung aktif; (2) 7 field branding opsional menyusul |
| REQ-M12-007 | `organization_type` (Agency/Kantor/Tim/Komunitas) murni label kosmetik, tanpa percabangan logika |
| REQ-M12-008 | Moderasi pembuatan Organization: self-service penuh, tanpa approval Admin |
| REQ-M12-009 | Label nama Organization tetap tampil di halaman profil publik agen individu (`/agent/[slug]`) |
| REQ-M12-010 | Fitur Join Request (Agen \u2192 Leader): cari nama Organization, ajukan "Minta Gabung", Leader approve/tolak |
| REQ-M12-011 | Join Request & Leader Invite reuse tabel `organization_invitations` yang sama, dibedakan `initiated_by_type` |
| REQ-M12-012 | Agen boleh punya banyak `agent_request` pending sekaligus; approve salah satu membatalkan otomatis sisanya |
| REQ-M12-013 | Cooldown 24 jam simetris per arah & per pasangan (organization, agen, arah) setelah penolakan |
| REQ-M12-014 | Listing terpisah: Personal Listing vs Organization Listing, satu listing = satu baris data |
| REQ-M12-015 | Keluar/bubar Organization \u2192 listing kembali ke pemilik asal sebagai Draft Pribadi (butuh review manual) |
| REQ-M12-016 | Permission: Leader CRUD penuh Organization Listing; Member CRUD listing sendiri + Read-only listing anggota lain |
| REQ-M12-017 | Organization Activity Log (audit trail) \u2014 halaman Activity Timeline publik-internal |
| REQ-M12-018 | Organization Dashboard: jumlah member, listing, leads, performa member, top agent |
| REQ-M12-019 | Organization Branding & halaman publik `/organization/[slug]` (logo, banner, deskripsi, website, media sosial, alamat, kontak) |

### Deskripsi

Lapisan organisasi (Organization) sebagai unit kolaborasi tim \u2014 satu akun Agen dapat bekerja sebagai **Agen Individu** atau sebagai **Leader/Member** dari sebuah Organization (tim/kantor/komunitas), tanpa membuat akun kedua. Setara secara konseptual dengan pola *dual-sided identity* (Shopee Customer\u2192Seller, GitHub User\u2192Organization).

### Fitur
- Create Organization (form 2 tahap: inti wajib, branding opsional menyusul)
- Organization Dashboard, Branding, Activity Log
- Invite (Leader\u2192Agen) dan Join Request (Agen\u2192Leader) \u2014 dua arah lewat satu tabel
- Personal Listing vs Organization Listing dengan kepemilikan ganda
- Organization Subscription \u2014 *future-ready* (gratis saat ini, arsitektur disiapkan untuk monetisasi `OD-11`)

### Data
`organizations`, `organization_members`, `organization_invitations` (field lengkap: lihat ERD hasil Langkah 3), perluasan `listings` (kolom `organization_id`, `listing_context`), perluasan `audit_logs` (`organization_id` nullable).

### Business Rules
- Race condition re-check status Individual agen wajib dilakukan tepat sebelum transisi ke `accepted` (baik Accept Invite maupun Approve Join Request).
- Cross-cancellation: `agent_request` accepted \u2192 seluruh `agent_request` pending lain milik agen yang sama otomatis `cancelled`; `leader_invite` pending dari Leader lain **tidak** disentuh.
- Tidak ada payment gateway aktif untuk Organization Subscription pada fase ini (tetap `POST /billing/*` placeholder).
- **Eksplisit di luar lingkup** (jangan diimplementasikan): Modul Chat/messaging, transfer kepemimpinan, multi-organization membership, differensiasi fungsi per `organization_type`, moderasi/approval Admin untuk pembuatan Organization.
- Otorisasi Organization-scoped berjalan **independen** dari RBAC platform (`ADR-024`) \u2014 tidak mengamandemen aturan `all/own/none` role platform yang sudah ada.

### Acceptance Criteria
- Agen dengan `organization_status = individual` dapat membuat Organization lewat form 2 field, langsung menjadi Leader aktif.
- Agen dapat mengajukan Join Request ke Organization lain dan Leader dapat approve/reject dari Organization Dashboard.
- Leader yang menutup Organization menyebabkan seluruh Member kembali `individual` dan listing Organization kembali sebagai Draft Pribadi milik masing-masing.
- Percobaan agen membuat/join Organization kedua saat masih aktif di Organization lain selalu ditolak (re-check di level aplikasi & constraint database).
- Halaman publik `/organization/[slug]` menampilkan branding, member, dan listing Organization sesuai data yang diisi Leader.

---

## MODUL 13 — AI Assistant Integration (BYOK) *(baru, v1.2)*

> **Dasar ADR:** `ADR-028` (Third-Party AI Assistant Integration Strategy \u2014 BYOK, Approved With Notes) \u2014 disinkronkan `decision-log.md` sebagai `ADR-045`. Sumber: `Architecture-Evolution-Proposal-Organization-Management-System-v0.9.md` \u00a718. **Berdiri independen dari Modul 12** \u2014 tidak menyentuh entitas `organizations`.

### Requirement Index (EAF Retrofit)

| REQ ID | Ringkasan Requirement |
|---|---|
| REQ-M13-001 | Metode integrasi BYOK \u2014 API key milik agen sendiri, diproksi backend, tidak pernah dikirim ke client-side |
| REQ-M13-002 | Daftar provider dikurasi Admin (rilis awal: Google Gemini, Groq, Mistral, GitHub Models) |
| REQ-M13-003 | Riwayat percakapan tidak disimpan di server sama sekali (murni transient) |
| REQ-M13-004 | Tidak ada akses Admin/Superadmin ke isi percakapan (karena tidak pernah disimpan) |
| REQ-M13-005 | Terbuka untuk seluruh role internal berakun (Superadmin, Manager, Admin, Instructor, Agen) **dan Developer Partner** (resolusi OD-21, 6 Agustus 2026 — sebelumnya baris ini keliru mengecualikan Developer Partner, bertentangan dengan `Authorization-Access-Control-Specification-v1.0.md` §2.14 yang sejak awal sudah memberi DevPartner akses `own`) |
| REQ-M13-006 | Rate limiting tambahan dari platform, reuse mekanisme `rate_limit_log` (`ADR-018`) |
| REQ-M13-007 | Koneksi API key persisten \u2014 tersimpan terenkripsi, tidak perlu dihubungkan ulang tiap sesi |
| REQ-M13-008 | UI wajib menjelaskan syarat pemakaian tiap provider sebelum agen menghubungkan (biaya, limit, privasi) |
| REQ-M13-009 | Biaya pemakaian API sepenuhnya tanggung jawab agen \u2014 billing langsung ke akun agen di provider |
| REQ-M13-010 | Platform tidak mengklaim afiliasi/endorsement resmi dari provider terkait |
| REQ-M13-011 | Tombol "Chat Baru" wajib ada; thread paralel per-provider (pindah provider = pindah tab, bukan reset) |
| REQ-M13-012 | Label pengingat permanen di dekat kotak input chat bahwa percakapan akan hilang saat ditutup/refresh |

### Deskripsi

Agen dan seluruh role internal berakun dapat menghubungkan API key milik sendiri dari provider AI assistant pilihan, lalu chat langsung di dalam SaaS lewat chat UI custom \u2014 tanpa redirect keluar aplikasi. Model BYOK dipilih karena aplikasi chat vendor (ChatGPT/Gemini/Claude web app) tidak mengizinkan diri di-iframe (proteksi `X-Frame-Options`/CSP `frame-ancestors`).

### Fitur
- Wizard koneksi API key per provider (test call ringan sebelum simpan)
- Chat UI custom dengan thread paralel per-provider
- Endpoint proxy chat (`/ai-assistant/*`) \u2014 detail lengkap di API Specification hasil Langkah 6
- Tes ulang validitas koneksi kapan saja

### Data
`ai_providers` (tabel referensi, dikelola Admin), `agent_ai_connections` (koneksi per-user, `encrypted_api_key`, `status`). **Tidak ada tabel riwayat percakapan** \u2014 sesuai REQ-M13-003.

### Business Rules
- Bukan pengulangan/konflik dengan "\u274c Modul Chat" yang ditolak di Modul 12 \u2014 fitur berbeda total (chat dengan AI pribadi, tidak melibatkan Organization/Member/buyer).
- Field `requires_expiry_warning` pada `ai_providers` khusus bernilai `true` untuk `github_models` (PAT bisa punya masa berlaku).
- Satu user maksimal 1 koneksi aktif per provider (boleh sambungkan multi-provider berbeda secara bersamaan).

### Acceptance Criteria
- User dapat memilih provider dari daftar aktif, mengikuti wizard onboarding, dan berhasil terhubung setelah test call sukses.
- Percakapan yang sudah berjalan hilang total begitu tab ditutup/direfresh \u2014 tidak ada baris riwayat tersimpan di database mana pun.
- User dapat memutus/menghubungkan ulang koneksi kapan saja tanpa mengulang seluruh wizard jika key masih valid.
- Percobaan akses isi percakapan lewat endpoint Admin manapun selalu gagal karena data tidak pernah eksis di server.

---

## 3. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| **Keamanan** | Enkripsi data sensitif (KTP, data finansial), role-based access control, audit log |
| **Kepatuhan** | Mengacu UU PDP (Perlindungan Data Pribadi) untuk data agen & calon pembeli |
| **Performa** | Listing publik & pencarian harus responsif (<2 detik load untuk katalog) |
| **Skalabilitas** | Arsitektur mendukung penambahan modul (mis. payment gateway/komisi) di fase berikutnya |
| **Kompatibilitas** | Responsive web (desktop & mobile browser); pertimbangkan PWA untuk agen di lapangan |
| **Aksesibilitas Data** | Data proyek developer & DBR harus real-time/terkini antar-modul |
| **SEO & Discoverability** | Halaman publik wajib SSR/SSG (bukan CSR murni), memenuhi target Core Web Vitals, dan mendukung structured data — detail lengkap di dokumen SEO & Analytics Specification (Modul 11) |

---

## 4. Alur Data Antar Modul (High-Level)

### 4.1 Diagram Alur Utama

```
[M1] Registrasi & Verifikasi Agen
        │  (status: Active)
        ▼
[M2] Profil Agen  ◄────────────────────────────────────────┐
        │  (nomor WA, area, spesialisasi)                   │
        ▼                                                   │ Badge & sertifikat
[M3] Listing Properti (per-agen)                             │ otomatis tampil di profil
   ├─ Kategori: Primary ──► ditautkan ke ──► [M6] Katalog Kerjasama Developer
   │                                              │ (harga & spesifikasi resmi,
   │                                              │  skema komisi, materi marketing)
   ├─ Kategori: Secondary (input mandiri agen)    │
   │                                              ▼
   ├─ Tujuan: Dijual / Disewakan          Event "Launching Proyek"
   │                                              │
   ├─ Filter & Pencarian Publik ◄── digunakan oleh Calon Pembeli (Guest)
   │                                              ▼
   └─ CTA "Chat WhatsApp" ──► tercatat sbg Lead Event ──► [M8] Dashboard (statistik minat per listing/agen)
                                                    │
                                                    ▼
                                        Agen lanjutkan komunikasi dgn calon pembeli
                                                    │
                                                    ▼
                                [M7] Sistem Scoring DBR (agen input data finansial calon pembeli)
                                                    │
                                        Hasil: Layak / Perlu Review / Tidak Layak
                                                    │
                                                    ▼
                                Simpan sbg "Lead/Prospek" milik Agen (riwayat simulasi)
                                                    │
                                                    ▼
                                        Jika Layak → Listing (M3) diajukan proses lanjut
                                        (status listing → menuju "Sold/Rented")

[M4] Learning Center (self-enroll, gratis)
        │  Kelulusan kursus & kuis
        ▼
   Sertifikat/Badge ──► otomatis sinkron ke [M2] Profil Agen
        │
        ▼
   Kelas live/webinar ──► tercantum di [M5] Kalender Event

[M5] Kalender Event (Pelatihan M4 + Launching Proyek M6 + Gathering)
        │
        ▼
   RSVP Agen ──► Reminder Notifikasi ──► [M8] Dashboard & Notifikasi

[M9] Admin Panel ──► mengelola & memoderasi seluruh data di M1, M3, M4, M5, M6
        └─ mengkonfigurasi parameter global: threshold DBR (M7), masa expired listing (M3), passing grade kursus (M4)
```

### 4.2 Tabel Pertukaran Data Antar Modul

| Dari Modul | Ke Modul | Data yang Mengalir | Trigger/Kondisi |
|---|---|---|---|
| M1 Registrasi | M2 Profil Agen | Data identitas dasar agen (nama, kontak, dokumen) | Setelah status `Active` |
| M2 Profil Agen | M3 Listing | Nomor WA default untuk CTA, nama & area agen | Saat agen membuat listing baru |
| M6 Katalog Developer | M3 Listing | Harga resmi, spesifikasi, materi marketing (untuk kategori Primary) | Agen melakukan "klaim proyek" |
| M3 Listing | M8 Dashboard | Jumlah klik CTA WhatsApp (lead event), status listing, jumlah listing aktif | Real-time setiap interaksi publik |
| M3 Listing | M7 Scoring DBR | Harga properti (auto-fill estimasi plafon KPR) | Agen membuka simulasi DBR dari halaman listing |
| M7 Scoring DBR | M3 Listing | Status kelayakan calon pembeli terkait listing tsb | Setelah simulasi selesai (opsional linking) |
| M4 Learning Center | M2 Profil Agen | Badge & sertifikat kelulusan kursus | Agen lulus kuis (skor ≥ passing grade) |
| M4 Learning Center | M5 Kalender Event | Jadwal kelas live/webinar | Kursus memiliki sesi live |
| M6 Katalog Developer | M5 Kalender Event | Jadwal event launching proyek | Developer partner mengajukan & disetujui admin |
| M5 Kalender Event | M8 Dashboard & Notifikasi | Reminder RSVP, status kehadiran | H-1 & H-1 jam sebelum event |
| M9 Admin Panel | M1, M3, M4, M6, M7 | Parameter konfigurasi (threshold DBR, masa expired listing, passing grade, approval status) | Perubahan konfigurasi oleh admin |

### 4.3 Catatan Penting Alur Data
- **Listing → Lead → DBR** adalah alur konversi inti platform: publik menemukan listing lewat filter pencarian → klik CTA WhatsApp (lead tercatat) → agen kualifikasi calon pembeli lewat simulasi DBR → hasil disimpan sebagai riwayat prospek agen.
- Data pada kategori **Primary** bersifat *read-mostly* dari M6 (agen tidak bebas mengubah harga/spesifikasi resmi), sedangkan kategori **Secondary** sepenuhnya dimiliki & diinput oleh agen di M3.
- Seluruh perubahan data sensitif (dokumen KTP di M1, data finansial calon pembeli di M7) tidak mengalir bebas antar modul lain — hanya dapat diakses oleh agen pemilik data dan Admin (M9), sesuai kebutuhan keamanan di Bagian 3.

---

## 5. User Flow per Modul

Bagian ini menjabarkan alur langkah-demi-langkah (step-by-step) untuk setiap modul, mencakup happy path dan percabangan kondisi utama (approval, gagal validasi, dsb).

### 5.1 User Flow — Modul 1: Registrasi & Autentikasi Agen

```
START (Calon Agen)
  │
  ▼
Buka halaman "Daftar sebagai Agen"
  │
  ▼
Isi form: Nama, Email, No. HP, Password
  │
  ▼
Sistem kirim OTP ke Email/No. HP
  │
  ▼
Input kode OTP ─── salah/expired ──► Tampilkan error, opsi "Kirim ulang OTP"
  │ (benar)
  ▼
Lengkapi data profil awal: KTP, NPWP (opsional), area operasional,
nama kantor/brokerage, upload dokumen legalitas
  │
  ▼
Submit registrasi → Status akun: "Pending Review"
  │
  ▼
Notifikasi ke Admin: "Ada registrasi agen baru"
  │
  ▼
   ┌───────────────┴───────────────┐
   ▼                               ▼
Admin REJECT                  Admin APPROVE
   │                               │
   ▼                               ▼
Notifikasi ke agen:            Status akun → "Active"
alasan penolakan,              Notifikasi ke agen: "Akun aktif"
opsi perbaiki & submit ulang        │
                                     ▼
                            Agen dapat login & mengakses
                            fitur penuh (Profil, Listing, dst)
  │
  ▼
END

--- Flow tambahan: LOGIN ---
Buka halaman Login → Input email/password (atau SSO Google — **SSO Apple belum diimplementasikan**, lihat REQ-M01-002)
  │
  ├─ Kredensial salah ──► Tampilkan error, opsi "Lupa Password"
  │
  └─ Kredensial benar ──► Cek status akun
                                │
                    ┌───────────┼──────────────┐
                    ▼           ▼              ▼
              "Pending"    "Suspended"     "Active"
                    │           │              │
             Tampilkan     Tampilkan       Masuk ke Dashboard
             status &      alasan          Agen (Modul 8)
             estimasi      suspend,
             review        kontak admin
```

### 5.2 User Flow — Modul 2: Profil Agen

```
START (Agen sudah login)
  │
  ▼
Buka menu "Profil Saya"
  │
  ▼
Sistem tampilkan data profil existing (dari M1 + histori)
  │
  ▼
Agen klik "Edit Profil"
  │
  ▼
Ubah: foto, bio, spesialisasi, area jangkauan, kontak (WA/email),
pengaturan privasi kontak
  │
  ▼
Simpan perubahan
  │
  ├─ Field sensitif (nama, no. lisensi) ──► Masuk antrian approval Admin
  │                                              │
  │                                    ┌─────────┴─────────┐
  │                                    ▼                   ▼
  │                               Admin Reject         Admin Approve
  │                                    │                   │
  │                          Notifikasi ke agen      Data ter-update
  │                          + alasan                di profil publik
  │
  └─ Field non-sensitif (bio, foto, dsb) ──► Langsung ter-update

  │
  ▼
Sistem auto-update statistik (jumlah listing aktif/terjual dari M3)
dan badge pelatihan (dari M4) tanpa aksi manual agen
  │
  ▼
Profil publik dapat diakses via link (domain.com/agen/nama-agen)
oleh Calon Pembeli tanpa login
  │
  ▼
END
```

### 5.3 User Flow — Modul 3: Manajemen Listing Properti

**A. Flow Agen — Membuat Listing Baru**
```
START (Agen, status akun Active)
  │
  ▼
Klik "Tambah Listing Baru"
  │
  ▼
Pilih Kategori: Primary / Secondary
  │
  ├─ Primary ──► Tampilkan opsi "Tautkan ke Proyek Developer" (dari M6)
  │                     │
  │              ┌──────┴──────┐
  │              ▼             ▼
  │         Pilih Proyek   Lewati (isi manual,
  │         → Auto-fill      tetap kategori Primary)
  │         harga & spek
  │              │             │
  │              └──────┬──────┘
  │                     ▼
  └─ Secondary ──► Isi seluruh field manual
                     │
                     ▼
        Pilih Tujuan Transaksi: Dijual / Disewakan
                     │
                     ▼
        Isi field umum: Judul, Lokasi (pin peta), Harga,
        Deskripsi, Spesifikasi Rumah, Status Legalitas
                     │
                     ▼
        Upload minimal 3 foto (+ video/tour opsional)
                     │
                     ▼
        Konfirmasi/edit Nomor WhatsApp CTA (auto dari Profil)
                     │
                     ▼
        Validasi sistem: semua field wajib terisi?
                     │
              ┌──────┴──────┐
              ▼             ▼
           Tidak          Ya
              │             │
        Tampilkan error   Submit → Status: "Menunggu Review"
        pada field         │
        yang kurang        ▼
                     Notifikasi ke Admin
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
           Admin Reject        Admin Approve
                │                   │
        Notifikasi ke agen    Status → "Published"
        + alasan (mis. harga  Listing tayang di
        tidak wajar, foto     katalog publik
        kurang jelas)              │
                │                   ▼
        Agen revisi & submit   END
        ulang
```

**B. Flow Calon Pembeli (Guest) — Cari Listing & Hubungi Agen**
```
START (Guest, tanpa login)
  │
  ▼
Buka halaman "Cari Properti"
  │
  ▼
Input filter: Kategori, Tujuan Transaksi, Tipe Properti, Lokasi,
Range Harga, Range Luas, Kamar, Legalitas, Sort (terbaru/harga)
  │
  ▼
Sistem tampilkan hasil (mode List / Map View)
  │
  ▼
Klik salah satu card listing → Buka halaman detail
  │
  ▼
Lihat detail lengkap: foto, spesifikasi, harga, lokasi, legalitas
  │
  ▼
Klik tombol "Chat via WhatsApp"
  │
  ▼
Sistem catat Lead Event (listing ID, timestamp) → kirim ke Dashboard Agen (M8)
  │
  ▼
Browser/App membuka WhatsApp dengan pesan template terisi otomatis
  │
  ▼
END (percakapan lanjut di luar sistem, antara Guest & Agen)
```

**C. Flow Sistem — Expired & Perubahan Harga**
```
Cron job harian cek tanggal expired tiap listing "Published"
  │
  ├─ Belum expired ──► Tidak ada aksi
  │
  └─ Sudah expired ──► Status → "Expired"
                              │
                              ▼
                    Notifikasi ke agen: "Perpanjang listing?"
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Agen perpanjang      Agen abaikan
                    │                   │
            Status kembali        Listing tetap
            "Published",          "Expired", tidak
            reset tanggal         tampil di publik
            expired
```

### 5.4 User Flow — Modul 4: Learning Center

```
START (Agen, sudah login)
  │
  ▼
Buka menu "Learning Center"
  │
  ▼
Lihat katalog kursus (filter kategori: Sales Skill, Legal, Produk
Developer, Financial/KPR Literacy, dll)
  │
  ▼
Pilih kursus → Klik "Daftar/Enroll" (gratis, tanpa approval)
  │
  ▼
Akses materi: video, PDF/slide (progress tersimpan otomatis)
  │
  ▼
Selesaikan seluruh materi → Sistem aktifkan tombol "Ambil Kuis"
  │
  ▼
Kerjakan kuis evaluasi
  │
  ▼
Sistem hitung skor
  │
  ├─ Skor < passing grade ──► Tampilkan hasil "Belum Lulus"
  │                                  │
  │                          Opsi "Ulangi Kuis" / "Pelajari ulang materi"
  │
  └─ Skor ≥ passing grade ──► Tampilkan hasil "Lulus"
                                     │
                                     ▼
                        Sistem generate Sertifikat Digital (PDF)
                                     │
                                     ▼
                        Sertifikat & Badge otomatis tampil
                        di Profil Agen (Modul 2)
                                     │
                                     ▼
                        Jika kursus punya sesi live/webinar →
                        muncul otomatis di Kalender Event (Modul 5)
                                     │
                                     ▼
                                    END

--- Flow Instruktur/Admin: Kelola Kursus ---
Login sebagai Instruktur/Admin → Menu "Kelola Kursus"
  │
  ▼
Buat kursus baru: judul, kategori, upload materi, buat bank soal kuis,
set passing grade, (opsional) set prasyarat kursus
  │
  ▼
Publish kursus → tayang di katalog Learning Center
  │
  ▼
Pantau progress peserta (dashboard: jumlah enroll, lulus, rata-rata skor)
```

### 5.5 User Flow — Modul 5: Kalender Event

```
START (Agen, sudah login)
  │
  ▼
Buka menu "Kalender Event"
  │
  ▼
Lihat tampilan kalender (bulanan/mingguan), filter kategori:
Pelatihan / Launching Proyek / Open House / Gathering
  │
  ▼
Klik salah satu event → Lihat detail (deskripsi, lokasi/link, host, kuota)
  │
  ▼
Klik "Daftar/RSVP"
  │
  ▼
Cek kuota tersedia?
  │
  ├─ Penuh ──► Masuk "Waiting List" + notifikasi jika ada slot kosong
  │
  └─ Tersedia ──► Status RSVP: "Terdaftar"
                        │
                        ▼
              Sistem kirim reminder H-1 & H-1 jam
              sebelum event (email/push)
                        │
                        ▼
                  Event berlangsung
                        │
                        ▼
                  (Opsional) Agen absen/checkin
                        │
                        ▼
                       END

--- Flow Developer Partner: Ajukan Event Launching ---
Developer Partner login → "Ajukan Event Baru"
  │
  ▼
Isi detail event (proyek terkait dari M6, tanggal, lokasi, kuota)
  │
  ▼
Submit → Status "Menunggu Approval Admin"
  │
  ├─ Admin Reject ──► Notifikasi ke Developer + alasan
  │
  └─ Admin Approve ──► Event tayang di Kalender Event publik/agen
```

### 5.6 User Flow — Modul 6: Direktori Kerjasama Developer

```
START (Admin) — Input Data Proyek Developer
  │
  ▼
Menu "Kelola Developer & Proyek" → "Tambah Proyek Baru"
  │
  ▼
Isi data: nama developer, PIC, lokasi proyek, tipe unit, price list,
skema komisi, materi marketing (foto/video/brosur), status proyek
  │
  ▼
Publish → Proyek tayang di Katalog Kerjasama Developer
  │
  ▼
END (Admin)

--- Flow Agen: Klaim Proyek untuk Dipasarkan ---
START (Agen, sudah login)
  │
  ▼
Buka "Direktori Kerjasama Developer"
  │
  ▼
Browsing/filter proyek (lokasi, tipe, developer)
  │
  ▼
Buka detail proyek → lihat price list, skema komisi, materi marketing
  │
  ▼
Klik "Klaim Proyek Ini"
  │
  ▼
Sistem cek: proyek eksklusif per wilayah? (jika dikonfigurasi)
  │
  ├─ Sudah diklaim agen lain di wilayah sama (eksklusif) ──►
  │        Tampilkan notifikasi "Proyek ini sudah dipasarkan agen lain di area Anda"
  │
  └─ Tersedia untuk diklaim ──► Sistem auto-generate Listing baru
                                  di Modul 3 (kategori: Primary,
                                  data terkunci sesuai harga resmi)
                                        │
                                        ▼
                                Agen dapat unduh materi marketing kit
                                        │
                                        ▼
                                Agen lengkapi field tambahan (deskripsi
                                personal, foto tambahan) → submit review
                                        │
                                        ▼
                                       END

--- Flow Sistem: Update Data Real-time ---
Admin ubah harga/unit availability proyek
  │
  ▼
Sistem otomatis update seluruh listing turunan (M3) milik semua agen
yang mengklaim proyek tsb
  │
  ▼
Notifikasi ke agen terkait: "Ada update harga/unit pada proyek [X]"
```

### 5.7 User Flow — Modul 7: Sistem Scoring DBR

```
START (Agen, sudah login)
  │
  ▼
Buka kalkulator "Cek Kelayakan KPR (DBR)" — dapat diakses langsung
atau dari halaman detail listing (auto-fill harga properti)
  │
  ▼
Input data calon pembeli:
  - Penghasilan bersih bulanan
  - Total cicilan berjalan (KTA, kartu kredit, kendaraan, KPR lain)
  - Harga properti (auto-fill jika dari listing / manual)
  - Uang muka (DP)
  - Tenor (tahun)
  - Estimasi suku bunga (default dari konfigurasi Admin, dapat diubah)
  │
  ▼
Klik "Hitung"
  │
  ▼
Sistem hitung:
  1. Plafon KPR = Harga Properti - DP
  2. Estimasi angsuran bulanan (formula anuitas)
  3. DBR % = (Cicilan Berjalan + Estimasi Angsuran) / Penghasilan Bersih × 100%
  │
  ▼
Sistem bandingkan DBR % dengan threshold (dikonfigurasi Admin, mis. 35%)
  │
  ├─ DBR % ≤ threshold aman ──► Status: "Layak"
  ├─ DBR % mendekati threshold ──► Status: "Perlu Review"
  └─ DBR % > threshold ──► Status: "Tidak Layak"
  │
  ▼
Tampilkan hasil + disclaimer legal ("estimasi awal, bukan keputusan bank")
  │
  ▼
Agen dapat ubah parameter (DP/tenor) → sistem re-kalkulasi real-time
(simulasi skenario "what-if")
  │
  ▼
Agen klik "Simpan sebagai Prospek/Lead"
  │
  ▼
Sistem simpan data simulasi (terenkripsi) ke riwayat agen ybs
  │
  ▼
Agen klik "Export ke PDF" (opsional, untuk lampiran pengajuan KPR ke bank)
  │
  ▼
END
```

### 5.8 User Flow — Modul 8: Dashboard & Notifikasi

```
START (Agen login) → Landing di Dashboard
  │
  ▼
Sistem tampilkan ringkasan:
  - Jumlah listing aktif & status masing-masing
  - Jumlah lead (klik CTA WhatsApp) 7/30 hari terakhir
  - Progress kursus Learning Center (sedang berjalan/selesai)
  - Event mendatang yang sudah di-RSVP
  - Riwayat simulasi DBR terbaru
  │
  ▼
Klik salah satu ringkasan → diarahkan ke modul terkait (M3/M4/M5/M7)
  │
  ▼
Notifikasi masuk (in-app/email/push) untuk:
  approval status, listing akan expired, sertifikat baru,
  reminder event, update proyek developer
  │
  ▼
END

--- Flow Admin: Dashboard Operasional ---
Login Admin → Landing di Dashboard Admin
  │
  ▼
Lihat statistik: agen baru pending approval, listing pending review,
engagement Learning Center, laporan proyek per agen
  │
  ▼
Klik item → diarahkan ke halaman approval/moderasi terkait
```

### 5.9 User Flow — Modul 9: Admin Panel / CMS

```
START (Admin login)
  │
  ▼
Pilih menu: Manajemen User / Moderasi Listing / Kelola Learning Center /
Kelola Developer & Proyek / Konfigurasi Sistem / Laporan & Analitik
  │
  ▼
  ┌─────────────┬──────────────┬───────────────┬────────────────┬───────────────┐
  ▼             ▼              ▼               ▼                ▼               ▼
Manajemen    Moderasi      Kelola Learning  Kelola Developer  Konfigurasi    Laporan &
User         Listing       Center           & Proyek          Sistem         Analitik
  │             │              │               │                │               │
Approve/      Approve/      Buat/edit/       Tambah/edit      Set threshold   Generate
reject        reject/       nonaktifkan      proyek,          DBR, masa       laporan,
registrasi    takedown      kursus, kelola   materi           expired         export ke
agen,         listing       instruktur,      marketing,       listing,        Excel/PDF
suspend akun                pantau progress  skema komisi     passing grade
                                                                kursus, dsb
  │             │              │               │                │               │
  └─────────────┴──────────────┴───────────────┴────────────────┴───────────────┘
                                        │
                                        ▼
                              Semua perubahan tercatat di Audit Log
                                        │
                                        ▼
                                       END
```

---

## 6. Saran Fase Pengembangan (Roadmap)

| Fase | Cakupan |
|---|---|
| **Fase 1 (MVP)** | Modul 1, 2, 3 (dasar), 9 (admin dasar), 10 (RBAC dasar: Superadmin/Admin/Agen), **11 (fondasi SEO: rendering SSR/SSG, slug, meta tag, sitemap, GTM/GA4 dasar — bukan ditambal belakangan)** — agen bisa daftar, isi profil, posting listing, dengan pembatasan akses by role dan halaman publik siap terindeks sejak awal |
| **Fase 2** | Modul 6 (katalog developer), Modul 7 (DBR Scoring) — nilai jual utama & diferensiasi |
| **Fase 3** | Modul 4 (Learning Center), Modul 5 (Kalender Event) |
| **Fase 4** | Modul 8 (dashboard analitik lanjutan), gamifikasi, integrasi SLIK/BI Checking, payment/komisi otomatis |

---

## 7. Hal yang Perlu Dikonfirmasi Sebelum Development

1. Threshold DBR final & apakah akan berbeda per bank rekanan (perlu input tim bisnis/legal).
2. Apakah agen wajib bernaung di bawah kantor/brokerage tertentu atau bisa independen.
3. Model bisnis monetisasi (komisi transaksi, biaya keanggotaan tier, boost listing berbayar).
4. Kebutuhan integrasi pihak ketiga: payment gateway, WA Business API, peta (Google Maps/lainnya), SLIK OJK.
5. Kebijakan eksklusivitas proyek developer per wilayah/agen.
6. Kebijakan promosi/demosi role (mis. apakah Manager dapat mempromosikan Agen langsung menjadi Manager, atau hanya Superadmin yang berwenang membuat akun Manager baru) — perlu dikonfirmasi sebelum fitur "Assign Role" di Modul 10 diimplementasikan.

> **Sudah diputuskan (v1.1):**
> - Pilihan framework frontend: **Next.js (App Router)** ditetapkan sebagai keputusan arsitektur default yang memenuhi syarat SSR/SSG wajib (SEO & Analytics Specification Bagian 1.1); siapa pemegang akun organisasi Google Search Console/GTM/GA4 tetap perlu ditentukan tim operasional sebelum go-live, namun tidak lagi memblokir mulainya development Modul 11.
> - Fitur review/rating agen (Modul 2) **diaktifkan di Fase 1** dengan skema moderasi minimal (lihat Modul 2 & tabel `agent_reviews` di ERD v1.1).

---

*Dokumen ini adalah dasar untuk breakdown teknis (ERD, wireframe, dan spesifikasi API) pada tahap berikutnya sebelum development dimulai.*
