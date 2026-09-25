# Dokumen Sumber — Persona Developer Partner (Fase F)

Dibuat 2026-09-24 dari pemindaian penuh repo `Rumahagen` + database live Supabase
(`jawywzavznjekxxlhwqo`, migration #0001–#0125). Dokumen ini adalah **satu-satunya
acuan** untuk wireframe `03-Developer-Partner/`: apa saja yang boleh dan tidak boleh
dilakukan Developer Partner, data apa yang ada, dan celah backend yang memengaruhi desain.
Yang ditandai **[DIUJI]** dibuktikan langsung pada DB live lewat transaksi rollback.

## 1. Sumber yang dipindai

| Lapisan | Sumber |
|---|---|
| Gate governance | `PRE-00-H` (M06 Developer/Project/Marketing/Claim), `PRE-00-G` §15 (event Developer Partner), `PRE-00-F` §51 (Partnership Learning), `PRE-00-K/O/Q` |
| Spesifikasi produk | STEP13-A (PRD §M06), STEP13-B (§ role), STEP13-C (User Flow §8), STEP13-E (UI/UX §17 M06, §36 matriks role) |
| Data | migration `0033`–`0035`, `0040`, `0041`, `0085` (M06), `0024` (partnership learning), `0031` (event), `0115` (izin event), `0120`/`0122` (onboarding role) |
| Otorisasi | seed `0009` + query `role_permissions` DB live untuk role `developer_partner` |
| Backend | route `developer-partners`, `developer-projects`, `admin/developer-projects`, `project-media`, `marketing-kit`, `claims`, `listings/from-project`, `partnership-learning-results`, `events` + skema validasi |
| Wireframe lama | `docs/design/wireframes/WF-03` (DEV-001…008), audit `audit/*` |
| Wireframe v2 | layar Agent/Admin/Publik yang menyentuh M06 (M06-Klaim-Proyek, M06-Developer-Project-Admin, M05-Ajukan-Event, M11-Detail-Developer-Project) |

## 2. Siapa Developer Partner

- Role `developer_partner` ("mitra eksternal untuk kolaborasi developer/proyek"). Bukan staf, bukan Agent.
- **Akun dibuat lewat onboarding staf**: Manager/Superadmin mengubah role Agent → Developer Partner (0120/0122). Tidak ada registrasi mandiri.
- **Perusahaan (`developer_partners`) terpisah dari akun login**: baris perusahaan dibuat staf; `user_id` NULLABLE dan dihubungkan staf belakangan ("Hubungkan Akun", layar Admin). Akun yang belum terhubung **tidak punya proyek sama sekali** (semua RLS proyek mengikuti `developer_partners.user_id`).
- Tidak ada Organization/Context Switcher untuk Developer Partner: `organization_members` bertipe `agent_id`, jadi konteks organisasi tidak berlaku (izin `m12...manage_within_authorized_context` ada di seed tetapi tidak ada tabel yang memakainya untuk mitra).

## 3. Izin (live DB, semua scope `own`)

| Domain | Izin | Catatan |
|---|---|---|
| M06 Proyek | `developer_project.manage` | buat/ubah/hapus **proyek milik sendiri**. **TIDAK** punya `developer_project.publish` |
| M06 Marketing Kit | `create, upload, edit, delete, view, download` | CRUD penuh pada kit proyek sendiri |
| M06 Klaim | `review, approve, reject, revoke` | untuk klaim pada **proyek sendiri**. Tidak punya `withdraw` (itu milik Agent) |
| M05 Event | `event.create`, `event.update` | submit + ubah submission sendiri. **Tanpa** `publish/lifecycle/cancellation` → selalu `pending_approval` |
| M04 | `partnership_learning_result.manage` | CRUD hasil kemitraan milik sendiri; **tidak boleh** mengubah `validation_status` |
| M08 | `dashboard_projection.read/project`, `notification_state.read/update_state` | hanya proyeksi notifikasi (lihat §6) |
| M02 | `agent_profile.view/update`, `profile_photo.*` | foto/akun dasar |
| M13 | `own_byok_connection.*` (8 aksi) | koneksi AI milik sendiri |
| M14 | `commercial_purchase_access.own_purchase/access` | pembelian/akses komersial milik sendiri |
| M15 | `qualification.administer/evaluate` | kualifikasi milik sendiri |
| **Tidak ada** | listing (`m03.*`), kalkulator DBR (`m07.*`), ekspor statistik (`m08...export`), kelola direktori perusahaan (`developer_partner.manage`) | |

Aturan lintas modul yang dikunci (PRE-00-H §19): **kepemilikan proyek atau persetujuan klaim
TIDAK memberi hak Create/Update/Publish/Refresh Listing.** Wireframe tidak boleh mengesankan
Developer Partner bisa mengelola listing agen.

## 4. Model data

### developer_partners (perusahaan) — 0033
`company_name*`, `company_logo`, `description` ("**Tentang Developer**"), `pic_name`, `pic_contact`, `user_id?`, `status active|inactive`.
RLS: SELECT publik untuk `active`; pemilik (`user_id = auth.uid()`) melihat barisnya; kelola hanya staf.
→ **[DIUJI] Sebelum 0126 Developer Partner TIDAK bisa mengubah profil perusahaannya sendiri** (UPDATE = 0 baris).
**Keputusan produk 2026-09-24: mitra BOLEH mengedit profil sendiri** (nama, logo, Tentang Developer, PIC) → migration `0126` (izin baru `m06.developer_partner.update_own_profile`; `user_id`, `status`, `deleted_at` tetap hanya staf).
Spesifikasi (STEP13-C §8.1, STEP13-E §17.1) menyebut Developer "mengelola company_logo dan Tentang Developer",
dan DB kini mengikuti lewat 0126 (diuji rollback; belum diterapkan ke DB live sampai disetujui). Wireframe `Profil Developer` default = bisa diedit; tweak `izinEdit` = false hanya menampilkan keadaan hanya-baca.

### developer_projects — 0034
Identitas: `name*`, `slug` (unik, sistem), `meta_title` (≤70, sumber judul listing), `meta_description` (≤160, **satu-satunya** sumber deskripsi listing; tidak ada `description` proyek).
Klasifikasi: `category* primary|secondary`, `transaction_type* sale|rent`, `property_type`, `status` (`coming_soon` default | `active` | `sold_out` | `inactive`).
Lokasi: `location`, `province_id*`, `city_id*`, `district_id*`, `area_keyword` (≤20), `latitude`, `longitude`.
Harga: `price_min`, `price_max` (dua field terpisah), `price_unit total|per_bulan|per_tahun`, `is_negotiable`, `unit_availability`.
Spesifikasi (identik listing): `bedrooms`, `bathrooms`, `land_area`, `building_area`, `floors`, `carport_capacity`, `electrical_power`, `water_source pdam|sumur|lainnya`, `furnishing`, `year_built`.
Legalitas: `certificate_type shm|hgb|girik|ppjb|strata_title|lainnya`, `certificate_transferred`, `imb_status ada|tidak_ada|dalam_proses`, `dispute_free_declared`.
Komersial: `commission_scheme` (≤255), `extra_commission` (teks bebas), `is_exclusive_by_region` (**tidak boleh** dipresentasikan sebagai fitur eksklusivitas wilayah: non-eksklusivitas dikunci).
Lifecycle: **update biasa ≠ publish**. Transisi ke `active` hanya oleh pemegang `developer_project.publish` (staf) — trigger DB (UPDATE) dan trigger INSERT (0127).
**Keputusan produk 2026-09-24:** proyek `coming_soon` **boleh tampil publik** ("Segera hadir") selagi menunggu persetujuan tim untuk `active`. RLS memang mengizinkan publik melihat `coming_soon`/`active`/`sold_out` (perusahaan aktif); `inactive` tidak tampil publik. Tidak ada mekanisme "minta aktivasi" di backend; mitra menghubungi tim.

### developer_project_media — 0034
`type photo|video`, `url`. **Bukan** brosur/price list (itu Marketing Kit). Unggah jamak.

### marketing_kit — 0035
`file_type brochure|price_list`, `file_name`, `file_url`, `file_id?`. Hanya PDF brosur dan price list; bukan penyimpanan dokumen bebas.
Lihat: Developer Partner (milik sendiri), staf, **semua Agent** (tidak digerbangi status klaim). Buyer/Partner lain: tidak ada.

### agent_project_claims — 0035/0085
`agent_id`, `project_id`, `status pending|approved|rejected|revoked|withdrawn`, `reviewed_by/at` (otomatis), `claimed_at`, unik `(agent, proyek)`.
Siklus (PRE-00-H §17): `pending → approved → revoked`; `pending → rejected`; `pending → withdrawn` (Agent).
Approval Record = PDF on-demand `GET /claims/{id}/approval-pdf` (bukan izin manusia; tersedia untuk Agent pemilik klaim, Developer Partner pemilik proyek, staf).
Visibilitas Agent bagi Developer Partner: **nama + profil publik saja** (bukan dokumen/identitas privat).

### events — 0031 (submission mitra)
`title*`, `category* training|launching_proyek|open_house|gathering`, `description`, `is_online`, `location`, `meeting_link`, `host`, `quota`, `related_project_id` (**harus proyek milik pemanggil**, divalidasi route), `visibility public|organization|private`, `registration_approval_mode`, `start_at*`, `end_at`, `status` default `pending_approval`.
`POST /developer-partners/events` mengisi `submitted_by` = pemanggil. Publikasi hanya staf.

### partnership_learning_results — 0024
`result_type*`, `result_summary`, `result_payload` (json), `provenance_source*`, `provenance_reference*`, `session_id?`, `validation_status pending|validated|rejected` (hanya Superadmin yang bisa mengubah; INSERT selalu `pending`), `validated_by/at`.
Hanya Superadmin dan pemilik yang melihat (Admin/Manager tidak). "Partner Learning" terpisah dari Learning Economy internal.

## 5. Alur inti (dari STEP13-C §8 + PRE-00-H)

1. Staf onboarding: role → Developer Partner; staf membuat/menghubungkan perusahaan.
2. Developer Partner: lengkapi profil (jika diizinkan) → buat proyek (`coming_soon`) → unggah Media (foto/video) → unggah Marketing Kit (brosur/price list) → **staf mengaktifkan proyek** (`active`).
3. Agent mengklaim proyek → Developer Partner meninjau (setujui/tolak) → Approval Record → Agent membuat listing dari proyek (`POST /listings/from-project`, listing baru **selalu draft**, milik Agent).
4. Developer Partner dapat mencabut klaim yang sudah disetujui (revoke).
5. Event kolaborasi (launching/open house) diajukan → `pending_approval` → staf menerbitkan.
6. Hasil pembelajaran kemitraan dicatat → validasi Superadmin.

## 6. Endpoint yang ada (dan yang belum)

| Kebutuhan layar | Endpoint | Status |
|---|---|---|
| Profil perusahaan sendiri | `GET /developer-partners` (RLS: aktif + milik sendiri), `GET/PUT /developer-partners/{id}` | Ada, tetapi tidak ada filter "milik saya" dan `PUT` ditolak RLS untuk Developer Partner (§9-A) |
| Daftar proyek sendiri | `GET /developer-projects` | Ada, tetapi tanpa filter `developer_id`/mine (mengembalikan semua proyek publik + milik sendiri) → **perlu filter** |
| Buat/ubah/hapus proyek | `POST /admin/developer-projects`, `PUT/DELETE …/{id}` | Ada (nama route "admin", RLS mengizinkan pemilik) |
| Media | `GET/POST /developer-projects/{id}/media`, `project-media/{id}` | Ada |
| Marketing Kit | `GET/POST /developer-projects/{id}/marketing-kit`, `marketing-kit/{id}` | Ada; **mekanisme unggah file belum ada** (hanya `file_url`, tidak ada bucket storage di migration) |
| Klaim per proyek | `GET /developer-projects/{id}/claims`, `GET/PUT /claims/{id}` | Ada; **tidak ada agregat "semua klaim masuk lintas proyek"** dan tidak ada nama Agent di baris klaim (perlu join profil publik) |
| Approval PDF | `GET /claims/{id}/approval-pdf` | Ada |
| Event | `POST /developer-partners/events`, `GET/PUT /events/{id}` | Ada; tidak ada "daftar submission saya" khusus |
| Hasil kemitraan | `GET/POST /partnership-learning-results`, `[id]` | Ada |
| Dashboard | `GET /dashboard/summary` | **Hanya jumlah notifikasi**; angka proyek/klaim harus dihitung dari daftar di atas |
| Notifikasi | `GET /notifications`, `read-all` | Ada |

## 7. Batas yang wajib tergambar di UI

- Publish/aktivasi proyek **bukan** aksi Developer Partner: tombolnya tidak ada; status `active` ditampilkan sebagai "Diaktifkan oleh tim RumahAgen".
- Marketing Kit ≠ Project Media (dua tab/resource terpisah).
- Approved Claim ≠ hak listing (PRE-00-H §19): layar klaim menampilkan jelas bahwa listing dibuat dan dimiliki Agent.
- Event submission selalu "Menunggu persetujuan staf" (tidak ada tombol Terbitkan).
- Hasil kemitraan: status validasi hanya bisa dilihat, tidak bisa diubah.
- Nama, kontak (WhatsApp + email) dan tautan profil publik Agent yang mengklaim (keputusan produk 2026-09-25: mitra harus bisa menghubungi Agent, termasuk Agent berprofil privat; migration 0147); dokumen dan data pribadi lain tidak.
- Non-eksklusivitas: tidak ada UI "eksklusif wilayah".

## 8. Temuan celah backend (dibuktikan) — perbaikan: migration `0127` (ditulis + diuji rollback; status penerapan di README migration)

1. **[DIUJI] Agent bisa menyetujui klaimnya sendiri.** Policy `agent_project_claims_review` memakai `has_permission('m06.claim.approve', agent_id)` dan role `agent` punya scope `own` untuk approve/reject/revoke/review → Agent lolos untuk klaim miliknya (UPDATE mengembalikan 1 baris). Akibatnya hard-gate `POST /listings/from-project` bisa dilewati tanpa persetujuan Developer Partner. Tugas perbaikan sudah diantrekan (chip "Tutup 3 celah RLS di M06 & M05").
2. **[DIUJI] Developer Partner bisa INSERT proyek langsung berstatus `active`** (trigger publish-gate hanya `BEFORE UPDATE`). Lewat API tidak bisa (skema tidak menerima `status`), tetapi lewat REST langsung bisa. Termasuk di tugas perbaikan yang sama.
   **[DIUJI] Hal serupa pada event:** Developer Partner bisa INSERT `events` langsung berstatus `published` (trigger lifecycle hanya `BEFORE UPDATE`), sehingga "subject to approval" (PRE-00-G §15) hanya berlaku lewat route API, bukan di DB.
3. **Transisi klaim tidak dibatasi di DB**: siapa pun yang lolos policy bisa mengubah status ke nilai apa saja (mis. `rejected → approved`).
4. **Hanya status `active` yang tidak bisa dicapai mitra.** Proyek nonaktif tetap bisa dikembalikan mitra ke `coming_soon` (tampil publik lagi) atau `sold_out`. Wireframe memberi peringatan sebelum "Nonaktifkan".
5. Tidak ada filter "milik saya" pada daftar proyek/perusahaan, tidak ada agregat klaim masuk, tidak ada unggah file (semua dicatat di §6).

## 9. Keputusan produk yang tertunda (wireframe menyiapkan kedua sisi)

**A. (SELESAI 2026-09-24) Developer Partner boleh mengedit profil perusahaannya — diputuskan ya, lihat 0126.**
STEP13-C/E mengatakan ya; DB saat ini mengatakan tidak (staf saja). Wireframe `Profil Developer` memakai
skenario `izinEditProfil` (default = **tidak**, mengikuti DB). Kalau jawabannya ya, perlu migration
kecil (policy UPDATE terbatas kolom logo/description/pic untuk pemilik).

**B. Bolehkah Developer Partner memakai layar Agent yang sudah ada?** Izin M13 (AI), M14 (komersial), M15 (kualifikasi)
sudah ada di seed. Fase F **tidak** menduplikasi layar itu; navigasi Developer Partner hanya memuat fitur khas mitra.
Kalau nanti dibutuhkan, layar Agent yang sama bisa dibuka untuk role ini.

## 10. Cakupan layar Fase F (hasil pemindaian → wireframe)

| Kode | Layar | Asal kebutuhan |
|---|---|---|
| M08 | Dashboard Developer | notifikasi + ringkasan proyek/klaim (§6) |
| M06 | Profil Developer | DEV-001, `company_logo`, "Tentang Developer" |
| M06 | Kelola Proyek (daftar) | DEV-002 |
| M06 | Form Proyek (wizard) | DEV-003 |
| M06 | Detail Proyek + Media | DEV-004, DEV-005 |
| M06 | Marketing Kit | DEV-006 |
| M06 | Review Klaim | DEV-007 + Approval Record |
| M05 | Ajukan Event (mitra) | PRE-00-G §15, `0115` |
| M04 | Hasil Kemitraan | `0024`, PRE-00-F §51 |
| M06 (Agent) | Klaim Proyek — tambahan | DEV-008: "Buat Listing dari Proyek" + Unduh Approval PDF (belum ada di layar Agent) |
