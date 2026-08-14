# API Specification — Platform Web RUMAHAGEN

**Dokumen pendamping:** PRD v1.2, User Flow v1.2, ERD & Skema Database v1.3, Entity Mapping v1.0
**Versi:** 1.3 (naik dari 1.2 — kontrak deteksi duplikat foto di `POST /listings/{id}/media` dan `PATCH /listings/{id}/status`, `ADR-047`/`OD-25`; ditambah pemulihan 4 endpoint `/admin/internal-users` OD-20 yang sempat hilang tanpa jejak resmi di file sumber v1.2 "Baseline")
**Tanggal:** 8 Agustus 2026 (kontrak duplikat foto) — dilengkapi pemulihan endpoint OD-20 pada 9 Agustus 2026 setelah audit konsolidasi versi menemukan endpoint tsb hilang tanpa jejak resmi antara v1.2 dan v1.2 "Baseline"; tidak ada endpoint lain yang diubah pada kedua siklus ini
**Base URL:** `https://api.<domain-anda>.id/api/v1`
**Status:** Baseline (BERLAKU) — status tidak berubah, hanya versi konten naik

> **Catatan Revisi v1.2 (siklus Engineering Alignment, 5 Agustus 2026):** Perubahan **MINOR** — aditif & korektif-sinkronisasi terhadap ADR yang sudah Approved, tidak membuka kembali keputusan bisnis. Rincian:
> 1. **Sinkronisasi ke `ADR-008` (=`ADR-041`, Approved v2)** — Bagian 9.1 sebelumnya masih menyebut "Google Maps Platform / Mapbox" dan Bagian 13 masih mendaftarkan provider Maps sebagai "belum dikonfirmasi", padahal `ADR-008` v2 sudah Approved dengan keputusan **Leaflet + OpenStreetMap + LocationIQ (primary) + Geoapify (failover)**. Ini **bukan keputusan baru** — murni memperbaiki dokumen yang belum mengikuti ADR yang sudah final (Bab 23 Synchronization Rules), dipindah dari "belum dikonfirmasi" ke Bagian 12 "Keputusan Disepakati".
> 2. **Sinkronisasi ke `ADR-005` (=`ADR-039`, Approved)** — Bagian 3 sebelumnya menulis rekomendasi generik "Typesense/Elasticsearch"; diperjelas menjadi **PostgreSQL Full-Text Search + pg_trgm sebagai MVP Fase 1**, dengan ambang migrasi eksplisit ke Typesense (Hybrid Bertahap, Alternatif E).
> 3. **Retrofit traceability** — setiap bagian modul kini mencantumkan **REQ Terkait** dan **ENT Terkait**, merujuk PRD v1.2 dan Entity Mapping v1.0 (Bab 12.2).
> 4. **2 bagian API baru**: Bagian 5A (Organization Management API, Modul 12) dan Bagian 5B (AI Assistant API, Modul 13) — setiap endpoint mencantumkan `REQ-XXX` dan `ENT-XXX` eksplisit sesuai instruksi TUGAS 3 langkah 6.
> 5. **Tidak ada endpoint v1.1 yang dihapus/diubah kontraknya** — seluruh endpoint existing dipertahankan verbatim.

> **Catatan Revisi v1.1 (dipertahankan sebagai riwayat):** (1) Role `buyer` kini formal di tabel `roles` (ERD v1.1) — seluruh endpoint berlabel Auth `Buyer` di dokumen ini merujuk role tsb; (2) endpoint review agen diperluas dengan alur submit & moderasi; (3) `GET /developer-projects` kini menerima `city_id` (bukan freetext `city`), selaras migrasi ERD v1.1; (4) tenor pada `POST /calculator/dbr` ditegaskan **selalu dalam satuan bulan** (`tenor_months`) — lihat Bagian 6.

---

## 0. Konvensi Umum

### 0.1 Autentikasi
- **JWT Bearer Token** untuk seluruh endpoint yang butuh login: header `Authorization: Bearer {access_token}`.
- **Access token**: umur pendek (mis. 15–60 menit). **Refresh token**: umur panjang (mis. 30 hari), disimpan sbg httpOnly cookie atau secure storage di client.
- **OAuth2 Google Login** didukung sebagai alternatif registrasi/login (lihat 1.3) — hasil akhirnya tetap menerbitkan JWT internal platform, sehingga seluruh endpoint lain tidak perlu tahu apakah user login via password atau Google.
- Setiap endpoint di dokumen ini diberi label **Auth**: `Public` (tanpa login), `Authenticated` (butuh login, role apa pun), atau **role spesifik** (`Superadmin`, `Manager`, `Admin`, `Agen`, `Buyer`, `Developer Partner`) sesuai matriks RBAC di PRD Modul 10.

### 0.2 Format Response Standar
```json
// Sukses
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "per_page": 20, "total": 134 }
}

// Gagal
{
  "success": false,
  "error": {
    "code": "LISTING_NOT_FOUND",
    "message": "Listing tidak ditemukan atau Anda tidak memiliki akses.",
    "details": null
  }
}
```

### 0.3 Kode Status HTTP Utama
| Kode | Arti |
|---|---|
| 200 / 201 | Sukses (GET/PUT/PATCH) / Sukses dibuat (POST) |
| 400 | Bad Request — validasi input gagal |
| 401 | Unauthorized — token tidak ada/invalid/expired |
| 403 | Forbidden — token valid tapi tidak punya permission (lihat Modul 10 RBAC) |
| 404 | Resource tidak ditemukan (atau ditemukan tapi bukan milik user → disamarkan jadi 404 untuk data privat) |
| 409 | Konflik (mis. email sudah terdaftar, klaim proyek duplikat) |
| 422 | Unprocessable Entity — validasi bisnis gagal (mis. DBR melebihi threshold saat submit final) |
| 429 | Too Many Requests — rate limit |

### 0.4 Pagination & Filtering
Query param standar untuk semua endpoint list: `?page=1&per_page=20&sort=created_at&order=desc`. Filter spesifik dijelaskan per endpoint.

### 0.5 Rate Limiting
- Publik (unauthenticated): 60 req/menit/IP.
- Authenticated: 300 req/menit/user.
- Endpoint sensitif (login, register, OTP, forgot-password): 5 req/menit/IP+identifier untuk mencegah brute-force.
- **Mekanisme implementasi:** native PostgreSQL (tabel `rate_limit_log` + query window), **bukan** Redis/layanan cache eksternal — sesuai `ADR-018` (=`ADR-042`, Approved, Caching & Rate Limiting Strategy).

### 0.6 Penegakan RBAC di Level API
Setiap request diverifikasi middleware terhadap tabel `role_permissions` (lihat ERD Modul 10) sebelum handler dijalankan:
1. Cek token valid → identifikasi `user.role_id`.
2. Cek permission untuk kombinasi `module_code + action_code` dari endpoint yang diakses.
3. Jika `granted_scope = own`, query otomatis difilter `WHERE agent_id = current_user.id`.
4. Jika `granted_scope = all`, tidak ada filter kepemilikan (berlaku Superadmin/Manager/Admin).
5. Role `superadmin` selalu bypass (lihat catatan ERD).

---

## 1. Authentication & User Management API
*(Selaras dengan PRD Modul 1 — Registrasi & Autentikasi, Modul 2 — Profil Agen, dan Modul 10 — RBAC)*
**REQ Terkait:** REQ-M01-001 s.d. 006, REQ-M02-001 s.d. 007, REQ-M10-001 s.d. 010 | **ENT Terkait:** `ENT-M01-User`, `ENT-M01-AgentVerificationDocument`, `ENT-M02-AgentProfile`, `ENT-M02-AgentReview`, `ENT-M10-Role`, `ENT-M10-Permission`, `ENT-M10-RolePermission`

> **Catatan penyesuaian peran (v1.1):** dokumen ini memakai istilah teknis yang konsisten dengan RBAC di PRD — `Public User` = **Guest** (tanpa akun), `Buyer` = akun terdaftar ringan untuk pencari properti, **kini formal sebagai baris `roles.code = 'buyer'` di ERD v1.1** (bukan lagi sekadar istilah dokumentasi) untuk mendukung fitur simpan listing/lead tracking pribadi, `Registered Agent` = **Agen**, dan `Super Admin` tetap **Superadmin**. Untuk `Agency/Principal` (kantor broker): **telah dikonfirmasi tidak menjadi role sistem tersendiri** — cukup memakai atribut `office_name` pada profil agen (lihat ERD `agent_profiles`) untuk mengelompokkan agen per kantor, tanpa perlu login/akses khusus level kantor.

### 1.1 Registrasi & Login

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/register` | Public | Registrasi akun baru dengan pilihan `role`: `buyer` atau `agent` |
| POST | `/auth/verify-otp` | Public | Verifikasi kode OTP (email/SMS) setelah registrasi |
| POST | `/auth/resend-otp` | Public | Kirim ulang OTP |
| POST | `/auth/login` | Public | Login email/HP + password → menerbitkan JWT |
| POST | `/auth/oauth/google` | Public | Login/registrasi via Google Sign-In |
| POST | `/auth/refresh` | Public (butuh refresh token valid) | Tukar refresh token → access token baru |
| POST | `/auth/logout` | Authenticated | Invalidasi refresh token (single device) |
| POST | `/auth/logout-all` | Authenticated | Invalidasi seluruh sesi/device |
| POST | `/auth/forgot-password` | Public | Kirim link reset password ke email |
| POST | `/auth/reset-password` | Public (butuh reset token) | Set password baru |

**Contoh — Registrasi:**
```json
POST /api/v1/auth/register
{
  "role": "agent",                // "buyer" | "agent"
  "full_name": "Andi Wijaya",
  "email": "andi@example.com",
  "phone": "+6281234567890",
  "password": "********"
}

201 Created
{
  "success": true,
  "data": {
    "user_id": "usr_8f2a...",
    "role": "agent",
    "status": "pending_review",     // agent → wajib approval; buyer → langsung active setelah verifikasi OTP
    "otp_sent_to": "andi@example.com"
  }
}
```

**Contoh — Login via Google (OAuth2):**
```json
POST /api/v1/auth/oauth/google
{
  "id_token": "eyJhbGciOi...",      // Google ID Token dari Google Sign-In SDK (client-side)
  "intended_role": "buyer"          // hanya dipakai jika akun belum pernah terdaftar
}

200 OK
{
  "success": true,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": { "id": "usr_...", "role": "buyer", "is_new_user": false }
  }
}
```
> Server memverifikasi `id_token` ke Google Token Info endpoint (server-side), lalu mencocokkan `email` dengan user existing (link akun) atau membuat user baru berstatus `active` (untuk role `buyer`) — role `agent` via Google tetap melalui alur `pending_review` karena wajib upload dokumen legalitas.

### 1.2 Profil & Verifikasi (Modul 2, Modul 1)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/users/me` | Authenticated | Data akun & profil user yang sedang login |
| PUT | `/users/profile` | Authenticated | Update profil (bio, foto, spesialisasi, WA, dsb) |
| POST | `/users/verification-documents` | Agen | Upload dokumen legalitas (KTP/NPWP/sertifikasi) |
| GET | `/agents/{id}` | Public | Profil publik agen (untuk halaman `domain.com/agen/{slug}`) |
| GET | `/agents/{id}/credentials` | Public | Lencana verifikasi, badge sertifikasi (Modul 4), statistik listing terjual/tersewa |
| GET | `/agents/{id}/reviews` | Public | Daftar ulasan/rating **berstatus `approved`** dari klien (fitur review aktif Fase 1 — lihat ERD `agent_reviews`) |
| POST | `/agents/{id}/reviews` | Buyer | Submit review baru untuk agen tsb (status awal selalu `pending`, belum tampil publik) |
| GET | `/admin/agent-reviews/pending` | Superadmin, Manager, Admin | Antrean moderasi review agen |
| PUT | `/admin/agent-reviews/{id}/approve` | Superadmin, Manager, Admin | Approve review → tampil publik & masuk perhitungan `aggregateRating` |
| PUT | `/admin/agent-reviews/{id}/reject` | Superadmin, Manager, Admin | Reject review (mis. spam/tidak relevan) |
| GET | `/admin/agents/pending` | Superadmin, Manager, Admin | Daftar agen menunggu approval registrasi |
| PUT | `/admin/agents/{id}/approve` | Superadmin, Manager, Admin | Approve registrasi agen |
| PUT | `/admin/agents/{id}/reject` | Superadmin, Manager, Admin | Reject dengan alasan |
| PUT | `/admin/agents/{id}/suspend` | Superadmin, Manager, Admin | Suspend akun agen |

### 1.3 Manajemen Role & Permission (Modul 10)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/admin/roles` | Superadmin, Manager | Daftar role & jumlah user per role |
| GET | `/admin/permissions/matrix` | Superadmin | Ambil seluruh matriks permission (semua role) |
| GET | `/admin/permissions/matrix/agent` | Superadmin, Manager | Ambil matriks permission **khusus role Agen** |
| PUT | `/admin/permissions/matrix` | Superadmin | Update permission role apa pun (termasuk Manager/Admin) |
| PUT | `/admin/permissions/matrix/agent` | Superadmin, Manager | Update permission **khusus role Agen** (Manager hanya boleh menyentuh baris ini — divalidasi via `editable_by_role_code`, lihat ERD) |
| PUT | `/admin/users/{id}/role` | Superadmin (semua role), Manager (khusus Agen ↔ Admin) | Ubah role seorang user |
| GET | `/admin/audit-logs` | Superadmin, Manager (khusus perubahan yg relevan) | Riwayat perubahan permission/role/data sensitif |

---

## 2. Property & Listing Management API
*(Selaras dengan PRD Modul 3)*
**REQ Terkait:** REQ-M03-001 s.d. 015 | **ENT Terkait:** `ENT-M03-Listing`, `ENT-M03-ListingPhoto`, `ENT-M03-ListingVideo`, `ENT-M03-ListingPriceHistory`

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/listings` | Agen | Buat listing baru (kategori Primary/Secondary, tujuan Jual/Sewa, seluruh field spesifikasi rumah sesuai PRD 3.2) |
| GET | `/listings/{id}` | Public | Detail listing (untuk halaman detail; jumlah `view_count` bertambah otomatis) |
| PUT | `/listings/{id}` | Agen (pemilik), Superadmin/Manager/Admin | Update listing. Untuk kategori Primary tertaut developer, field harga/spesifikasi resmi read-only bagi Agen |
| PATCH | `/listings/{id}/status` | Agen (pemilik), Superadmin/Manager/Admin | Ubah status: `draft`, `pending_review`, `sold`, `rented`, `expired` |
| DELETE | `/listings/{id}` | Agen (pemilik), Superadmin/Manager/Admin | Hapus/arsipkan (soft delete) |
| POST | `/listings/{id}/media` | Agen (pemilik) | Upload foto (multi), video/virtual tour — lihat integrasi Storage/CDN di Bagian 9 |
| DELETE | `/listings/{id}/media/{media_id}` | Agen (pemilik) | Hapus 1 foto/video |
| PUT | `/listings/{id}/media/{media_id}/set-cover` | Agen (pemilik) | Tetapkan sebagai foto cover |
| GET | `/listings/{id}/price-history` | Agen (pemilik), Superadmin/Manager/Admin | Riwayat perubahan harga |
| POST | `/listings/from-project/{project_id}` | Agen | Auto-generate listing Primary dari katalog developer (Modul 6) — men-copy harga/spesifikasi resmi |
| GET | `/agents/me/listings` | Agen | Daftar listing milik agen yang login (semua status) |
| GET | `/admin/listings/pending` | Superadmin, Manager, Admin | Antrean moderasi listing |
| PUT | `/admin/listings/{id}/approve` | Superadmin, Manager, Admin | Approve listing → `published` |
| PUT | `/admin/listings/{id}/reject` | Superadmin, Manager, Admin | Reject dengan alasan |

**Contoh — Buat Listing:**
```json
POST /api/v1/listings
{
  "category": "secondary",
  "transaction_type": "sale",
  "property_type": "rumah",
  "title": "Rumah Minimalis 2 Lantai di BSD",
  "description": "...",
  "price": 1850000000,
  "is_negotiable": true,
  "address": "Jl. Kenanga No. 12",
  "province_id": "prov_36",
  "city_id": "city_3674",
  "district_id": "dist_367403",
  "area_keyword": "BSD City",
  "latitude": -6.301,
  "longitude": 106.673,
  "land_area": 120,
  "building_area": 150,
  "bedrooms": 3,
  "bathrooms": 2,
  "floors": 2,
  "certificate_type": "shm",
  "certificate_transferred": true,
  "amenities": ["kolam_renang", "keamanan_24_jam"],
  "whatsapp_number": "+6281234567890",
  "meta_title": null,          // opsional — kosongkan agar sistem auto-generate (lihat Bagian 10)
  "meta_description": null     // opsional — idem
}
```

**Kontrak Deteksi Duplikat Foto (v1.3 — `ADR-047`/`OD-25`):**

Berlaku pada `POST /listings/{id}/media` (informational) dan `PATCH /listings/{id}/status`
saat transisi ke `pending_review` (enforcement). Cakupan pengecekan: hanya foto dari
listing berstatus `published`/`pending_review` milik `agent_id` yang sama dengan
pemilik listing yang sedang di-submit — tidak lintas agen.

*`POST /listings/{id}/media` — response menyertakan field opsional `duplicate_check`
(hanya muncul jika similarity ≥90%, bersifat informational/tidak blocking):*
```json
// POST /listings/{id}/media — 201
{
  "success": true,
  "data": {
    "photo_id": "phto_7f3a...",
    "url": "https://.../listing-photos/lst_9f21.../1723...-rumah-bsd.jpg",
    "is_cover": false,
    "sort_order": 3,
    "duplicate_check": {
      "status": "identical",
      "matched_listing_id": "lst_4b12...",
      "matched_photo_id": "phto_2c88...",
      "similarity_percent": 100
    }
  }
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `duplicate_check` | Object \| `null` | **Opsional** — hanya muncul jika `file_hash`/`photo_hash` foto yang baru diupload cocok (similarity ≥90%) dengan foto milik listing aktif dari `agent_id` yang sama. Tidak muncul jika similarity <90% |
| `duplicate_check.status` | ENUM | `identical` (100%, Hamming Distance=0/`file_hash` exact match) atau `similar` (90–99%, HD 1–6) |
| `duplicate_check.matched_listing_id` | UUID | Listing yang terdeteksi identik/mirip |
| `duplicate_check.matched_photo_id` | UUID | Foto spesifik yang cocok |
| `duplicate_check.similarity_percent` | INT | 90–100 |

*`PATCH /listings/{id}/status` — enforcement blocking saat submit ke `pending_review`:*

```json
// Skenario Blocking — foto identik (409 Conflict)
{
  "success": false,
  "error": {
    "code": "DUPLICATE_PHOTO_DETECTED",
    "message": "Listing ini memiliki foto yang identik dengan listing lain milik Anda. Silakan ganti atau hapus foto duplikat sebelum submit review.",
    "details": {
      "matched_listing_id": "lst_4b12...",
      "matched_listing_title": "Rumah Minimalis 2 Lantai di BSD",
      "matched_photo_id": "phto_2c88...",
      "similarity_percent": 100
    }
  }
}
```

```json
// Skenario Non-Blocking — kemiripan 90–99% (submit tetap berhasil, 200 OK)
{
  "success": true,
  "data": {
    "listing_id": "lst_9f21...",
    "status": "pending_review",
    "possible_duplicates": [
      {
        "listing_id": "lst_4b12...",
        "listing_title": "Rumah Minimalis 2 Lantai di BSD",
        "matched_photo_id": "phto_2c88...",
        "similarity_percent": 94
      }
    ]
  }
}
```

Field `possible_duplicates` **tidak muncul sama sekali** di response (bukan array
kosong) jika tidak ada kecocokan ≥90%.

| Kondisi | Similarity | Hamming Distance | HTTP Status | Field Response |
|---|---|---|---|---|
| Identik | 100% | 0 (atau `file_hash` exact match) | **409** | `error.code = DUPLICATE_PHOTO_DETECTED`, `error.details` |
| Sangat mirip | 90–99% | 1–6 | **200** | `data.possible_duplicates[]` |
| Cukup beda | <90% | >6 | **200** | Tidak ada field tambahan |

**Kode Error Baru:**

| Kode | HTTP Status | Kapan Dipakai |
|---|---|---|
| `DUPLICATE_PHOTO_DETECTED` | 409 | Submit listing ke `pending_review` ditolak karena foto identik terdeteksi |

---

## 3. Advanced Search & Filtering API
*(Selaras dengan PRD Modul 3.4)*
**REQ Terkait:** REQ-M03-006 | **ENT Terkait:** `ENT-M03-Listing`, `ENT-M03-RefProvince/City/District`

> **Mesin pencari (v1.2 — sinkron `ADR-005`/`ADR-039`, Approved):** rilis awal (MVP Fase 1) memakai **PostgreSQL Full-Text Search + `pg_trgm`** langsung di atas tabel `listings` (index GIN/trigram) — **bukan** Typesense/Elasticsearch generik seperti disebutkan v1.1. Keputusan ini **Hybrid Bertahap (Alternatif E)**: dipilih karena selaras penuh dengan ERD relasional (tanpa data terduplikasi) dan arsitektur serverless (`ADR-001`), zero infrastruktur tambahan, biaya nol (termasuk paket Supabase). **Migrasi ke Typesense** direncanakan otomatis terpicu saat ambang volume/latensi tertentu tercapai (kriteria detail: `ADR-005` Tahap 6) — bukan keputusan yang perlu diubah sekarang.

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/properties/search` | Public | Pencarian multi-filter (lihat query param di bawah) |
| GET | `/properties/map-bounds` | Public | Pencarian geospasial dalam kotak koordinat (NE/SW bounds) untuk render pin di peta |
| GET | `/properties/nearby` | Public | Pencarian berdasarkan titik GPS pengguna (`lat`, `lng`, `radius_km`) — lihat catatan geolokasi di Bagian 9.4 |
| GET | `/properties/autocomplete` | Public | Saran lokasi/keyword saat mengetik di search bar |
| GET | `/properties/{id}/similar` | Public | Rekomendasi listing serupa (lokasi/harga/tipe berdekatan) |

**Query Parameter `GET /properties/search`:**
```
?category=secondary
&transaction_type=sale
&property_type=rumah,apartemen
&province_id=prov_36&city_id=city_3674&district_id=dist_367403
&area_keyword=BSD                 // pencarian bebas di kolom area_keyword, mis. nama kawasan
&price_min=500000000&price_max=2000000000
&land_area_min=80&building_area_min=100
&bedrooms_min=2&bathrooms_min=1
&certificate_type=shm,hgb
&sort=newest              // newest | price_asc | price_desc | popular
&page=1&per_page=20
```

**Query Parameter `GET /properties/map-bounds`:**
```
?ne_lat=-6.20&ne_lng=106.85&sw_lat=-6.35&sw_lng=106.60&filters=... (parameter sama seperti /search)
```
Response berisi array minimal `{ id, lat, lng, price, category, cover_photo_url }` (payload ringan untuk render pin, detail lengkap diambil terpisah saat pin diklik via `GET /listings/{id}`).

---

## 4. Lead Generation & CRM Integration API
*(Selaras dengan PRD Modul 3.3 — CTA WhatsApp, diperluas dengan formulir inquiry in-app)*
**REQ Terkait:** REQ-M03-004, 005 | **ENT Terkait:** `ENT-M03-ListingLead`

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/leads` | Public / Buyer | Kirim inquiry dari form di halaman listing (alternatif selain klik CTA WA langsung) |
| POST | `/listings/{id}/cta-click` | Public | Catat event klik tombol "Chat via WhatsApp" (lead pasif, tanpa form) sebelum redirect ke `wa.me` |
| GET | `/agents/me/leads` | Agen | Daftar leads/prospek masuk milik agen yang login |
| GET | `/admin/leads` | Superadmin, Manager, Admin | Daftar leads seluruh agen (global) |
| GET | `/leads/{id}` | Agen (pemilik lead), Superadmin/Manager/Admin | Detail 1 lead |
| PUT | `/leads/{id}/status` | Agen (pemilik lead) | Update funnel: `new`, `contacted`, `site_visit_scheduled`, `closed_won`, `closed_lost` |
| GET | `/agents/me/leads/stats` | Agen | Ringkasan jumlah lead per status/periode (untuk Dashboard M8) |

**Contoh — Kirim Lead:**
```json
POST /api/v1/leads
{
  "listing_id": "lst_9f21...",
  "name": "Budi Santoso",
  "phone": "+6285712345678",
  "email": "budi@example.com",
  "message": "Apakah masih bisa nego harga?",
  "preferred_contact": "whatsapp"
}
```

---

## 5. Communication & Chat API — **[FASE LANJUTAN / NON-MVP]**
*(Disepakati: untuk rilis awal, komunikasi Buyer↔Agen cukup memakai CTA WhatsApp yang sudah tersedia di setiap listing — lihat Bagian 4. Bagian ini didokumentasikan sebagai referensi desain untuk fase berikutnya, saat platform ingin menyediakan percakapan in-app tanpa Buyer perlu membagikan nomor pribadi.)*

Mekanisme utama saat ini: setiap listing menampilkan nomor WhatsApp agen (Modul 3), dan setiap klik tombol "Chat via WhatsApp" tercatat sebagai lead event lewat `POST /listings/{id}/cta-click` (Bagian 4) sebelum pengguna diarahkan ke `wa.me/{nomor_agen}`. Seluruh percakapan lanjutan terjadi di WhatsApp, di luar sistem.

Spesifikasi berikut **baru diimplementasikan saat fase in-app chat diaktifkan**:

| Protokol/Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| WebSocket | `wss://api.<domain>.id/ws/chat` | Authenticated (token via query/header saat handshake) | Koneksi real-time untuk kirim/terima pesan instan |
| GET | `/chats/conversations` | Authenticated | Daftar percakapan aktif milik user (Buyer atau Agen) |
| GET | `/chats/conversations/{id}/messages` | Authenticated (partisipan chat) | Riwayat pesan dalam 1 percakapan (paginated) |
| POST | `/chats/conversations` | Buyer, Agen | Mulai percakapan baru terkait listing tertentu |
| POST | `/chats/schedule-visit` | Buyer, Agen | Ajukan/konfirmasi jadwal site visit langsung dari dalam chat — otomatis membuat entri di Kalender Event (Modul 5) sbg tipe `open_house` personal |
| PUT | `/chats/messages/{id}/read` | Authenticated | Tandai pesan sudah dibaca |

**Event WebSocket (contoh payload):**
```json
// Client → Server
{ "type": "send_message", "conversation_id": "cvs_...", "text": "Apakah unit ini masih tersedia?" }

// Server → Client (broadcast ke partisipan)
{ "type": "new_message", "conversation_id": "cvs_...", "message": { "id": "msg_...", "sender_id": "usr_...", "text": "...", "sent_at": "2026-07-26T10:00:00Z" } }
```
> Fallback: jika koneksi WebSocket gagal (mis. jaringan agen di lapangan tidak stabil), client dapat polling `GET /chats/conversations/{id}/messages?after={last_message_id}` sebagai mekanisme graceful degradation.

---

## 5A. Organization Management API *(baru, v1.2 — Modul 12)*
*(Dasar: `ADR-026`/`ADR-027`, =`ADR-043`/`ADR-044`, Approved)*

| Method | Endpoint | Auth | REQ | ENT | Deskripsi |
|---|---|---|---|---|---|
| POST | `/organizations` | Agen (status Individual) | REQ-M12-006 | `ENT-M12-Organization` | Buat Organization — Tahap 1 (nama + tipe), langsung aktif, pembuat jadi Leader |
| PUT | `/organizations/{id}/branding` | Leader | REQ-M12-006, 019 | `ENT-M12-Organization` | Lengkapi/ubah 7 field branding opsional (Tahap 2) |
| GET | `/organizations/{id}` | Public | REQ-M12-019 | `ENT-M12-Organization` | Halaman publik `/organization/[slug]` |
| GET | `/organizations/search?q=` | Authenticated (Agen Individual) | REQ-M12-010 | `ENT-M12-Organization` | Cari Organization untuk diajukan gabung |
| GET | `/organizations/{id}/dashboard` | Leader, Member | REQ-M12-018 | `ENT-M12-Organization`, `ENT-M03-Listing` | Ringkasan member, listing, leads, performa |
| POST | `/organizations/{id}/invitations` | Leader | REQ-M12-005, 010, 011 | `ENT-M12-OrganizationInvitation` | Undang agen (`initiated_by_type=leader_invite`) |
| POST | `/organizations/{id}/join-requests` | Agen (status Individual) | REQ-M12-010, 011 | `ENT-M12-OrganizationInvitation` | Ajukan gabung (`initiated_by_type=agent_request`) |
| PUT | `/organization-invitations/{id}/accept` | Pihak penerima (Leader atau Agen sesuai arah) | REQ-M12-003, 012 | `ENT-M12-OrganizationInvitation`, `ENT-M12-OrganizationMember` | Approve — re-check status Individual (race condition guard) sebelum commit |
| PUT | `/organization-invitations/{id}/reject` | Pihak penerima | REQ-M12-013 | `ENT-M12-OrganizationInvitation` | Reject — memicu cooldown 24 jam |
| GET | `/agents/me/organization-invitations` | Agen | REQ-M12-010 | `ENT-M12-OrganizationInvitation` | Daftar undangan/permintaan milik agen (dua arah) |
| DELETE | `/organization-members/{id}` | Member (keluar sendiri), Leader (remove member) | REQ-M12-003, 015 | `ENT-M12-OrganizationMember` | Keluar/dikeluarkan — memicu reset listing ke Draft Pribadi |
| DELETE | `/organizations/{id}` | Leader | REQ-M12-004, 015 | `ENT-M12-Organization` | Tutup Organization — bubar total, soft-delete |
| GET | `/organizations/{id}/activity-log` | Leader, Member | REQ-M12-017 | `ENT-M09-AuditLog` | Activity Timeline (filter `organization_id`) |

**Contoh — Buat Organization:**
```json
POST /api/v1/organizations
{ "organization_name": "Griya Realty Team", "organization_type": "tim" }

201 Created
{ "success": true, "data": { "id": "org_7c1...", "slug": "griya-realty-team", "status": "active", "your_role": "leader" } }
```

> **Business rule ditegakkan di backend (bukan hanya validasi UI):** setiap `PUT .../accept` **wajib** re-check `organization_members` aktif milik `agent_id` tepat sebelum commit transaksi (REQ-M12-003) — mencegah race condition 2 approval bersamaan dari Organization berbeda.

---

## 5B. AI Assistant API — BYOK *(baru, v1.2 — Modul 13)*
*(Dasar: `ADR-028`, =`ADR-045`, Approved With Notes)*

| Method | Endpoint | Auth | REQ | ENT | Deskripsi |
|---|---|---|---|---|---|
| GET | `/ai-providers` | Authenticated (seluruh role internal) | REQ-M13-002, 008 | `ENT-M13-AiProvider` | Daftar provider aktif + syarat pemakaian |
| POST | `/ai-connections` | Authenticated | REQ-M13-001, 007 | `ENT-M13-AgentAiConnection` | Hubungkan API key (melakukan test call sebelum simpan) |
| POST | `/ai-connections/{id}/test` | Authenticated (pemilik) | REQ-M13-001 | `ENT-M13-AgentAiConnection` | Tes ulang validitas koneksi kapan saja |
| DELETE | `/ai-connections/{id}` | Authenticated (pemilik) | — | `ENT-M13-AgentAiConnection` | Putuskan koneksi |
| GET | `/agents/me/ai-connections` | Authenticated | — | `ENT-M13-AgentAiConnection` | Daftar koneksi provider milik user |
| POST | `/ai-assistant/chat` | Authenticated (pemilik koneksi) | REQ-M13-001, 011 | `ENT-M13-AgentAiConnection` | Proxy chat ke provider — API key **tidak pernah** dikirim ke response/client |

> **Tidak ada endpoint riwayat percakapan** — konsisten REQ-M13-003/004, tidak ada tabel untuk disimpan sehingga tidak ada `GET /ai-assistant/history` atau sejenisnya di dokumen ini. Ini bukan endpoint yang terlewat, melainkan **sengaja tidak ada**.

**Contoh — Chat proxy:**
```json
POST /api/v1/ai-assistant/chat
{ "connection_id": "aic_4b2...", "message": "Buatkan draft deskripsi listing untuk rumah 3KT di BSD" }

200 OK
{ "success": true, "data": { "reply": "...", "provider": "gemini" } }
// Tidak ada message_id/conversation_id persisten — murni request-response transient
```

---

## 6. Financial & Valuation Calculator API
*(Selaras dengan PRD Modul 7 — Sistem Scoring DBR)*
**REQ Terkait:** REQ-M07-001 s.d. 006 | **ENT Terkait:** `ENT-M07-DbrSimulation`, `ENT-M07-DbrConfig`

> **Satuan tenor (v1.1):** field `tenor_months` pada seluruh endpoint di bagian ini **selalu dalam satuan bulan** — ini satu-satunya kontrak yang berlaku, konsisten dengan `dbr_simulations.tenor_months` di ERD. Jika UI form menampilkan input dalam tahun, konversi ke bulan (`tahun × 12`) **wajib** dilakukan di sisi client sebelum memanggil endpoint ini; API tidak menerima/menginterpretasikan satuan tahun dalam bentuk apa pun.

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/calculator/dbr` | Agen (alias lama: `/calculator/kpr`) | Hitung simulasi DBR & kelayakan KPR |
| GET | `/calculator/dbr/config` | Public | Ambil parameter aktif (threshold DBR, suku bunga default) — untuk ditampilkan sbg default di form |
| POST | `/calculator/dbr/{id}/save-as-prospect` | Agen | Simpan hasil simulasi sbg Lead/Prospek |
| GET | `/agents/me/dbr-simulations` | Agen | Riwayat simulasi milik sendiri |
| GET | `/admin/dbr-simulations` | Superadmin, Manager, Admin | Riwayat simulasi seluruh agen (global) |
| GET | `/calculator/dbr/{id}/export-pdf` | Agen (pemilik simulasi) | Export hasil ke PDF |
| PUT | `/admin/config/dbr` | **Superadmin only** | Ubah threshold DBR & suku bunga default sistem |
| GET | `/market-insights/suburb` | Public | Tren harga rata-rata per m² di suatu kecamatan/kelurahan |

**Contoh — Hitung DBR:**
```json
POST /api/v1/calculator/dbr
{
  "prospect_name": "Rina Kartika",
  "prospect_phone": "+6281298765432",
  "net_income": 15000000,
  "existing_installments": 1200000,
  "property_price": 850000000,
  "down_payment": 170000000,
  "tenor_months": 180,
  "interest_rate_annual": 8.5,
  "listing_id": "lst_9f21..."          // opsional, jika dibuka dari halaman listing
}

200 OK
{
  "success": true,
  "data": {
    "loan_amount": 680000000,
    "monthly_installment": 6698421,
    "dbr_percent": 52.66,
    "eligibility_status": "tidak_layak",
    "threshold_used": 35,
    "disclaimer": "Hasil ini estimasi awal, bukan keputusan final bank."
  }
}
```

---

## 7. Notification & Content Management API
*(Selaras dengan PRD Modul 8 — Dashboard & Notifikasi, serta banner promosi dari Modul 5/6)*
**REQ Terkait:** REQ-M08-001 s.d. 005 | **ENT Terkait:** `ENT-M08-Notification`
**REQ Terkait:** REQ-M08-001 s.d. 005 | **ENT Terkait:** `ENT-M08-Notification`

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/notifications` | Authenticated | Daftar notifikasi milik user yang login |
| PUT | `/notifications/{id}/read` | Authenticated | Tandai satu notifikasi dibaca |
| PUT | `/notifications/read-all` | Authenticated | Tandai semua dibaca |
| POST | `/admin/notifications/push` | Superadmin, Manager, Admin (sistem juga dapat memicu otomatis) | Kirim notifikasi push/email manual (mis. broadcast pengumuman) |
| GET | `/banners/promotions` | Public | Banner promosi featured listing/hot deals untuk beranda |
| POST | `/admin/banners` | Superadmin, Manager, Admin | Buat/kelola banner promosi |
| GET | `/dashboard/summary` | Authenticated | Ringkasan dashboard sesuai scope role (own untuk Agen, global untuk Superadmin/Manager/Admin) — menggabungkan data listing, lead, event, kursus (Modul 8) |

---

## 8. Wilayah Indonesia (Reference Data) API
**ENT Terkait:** `ENT-M03-RefProvince`, `ENT-M03-RefCity`, `ENT-M03-RefDistrict`, `ENT-M03-RefVillage`
**ENT Terkait:** `ENT-M03-RefProvince`, `ENT-M03-RefCity`, `ENT-M03-RefDistrict`, `ENT-M03-RefVillage`
*(Data alamat administratif Indonesia — Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan/Desa, Kode Pos)*

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/regions/provinces` | Public | Daftar 38 provinsi |
| GET | `/regions/cities?province_id={id}` | Public | Kota/kabupaten dalam 1 provinsi |
| GET | `/regions/districts?city_id={id}` | Public | Kecamatan dalam 1 kota/kabupaten |
| GET | `/regions/villages?district_id={id}` | Public | Kelurahan/desa dalam 1 kecamatan |
| GET | `/regions/postal-code?village_id={id}` | Public | Kode pos untuk kelurahan/desa tsb |
| GET | `/regions/search?q={keyword}` | Public | Pencarian bebas lintas level (mis. ketik "Serpong" → hasil kecamatan + kota induk) |

> **Rekomendasi implementasi:** data wilayah administratif Indonesia relatif statis (update resmi Kemendagri jarang berubah) — sebaiknya **di-seed & di-host sendiri** di database internal (bersumber dari dataset terbuka resmi, mis. data wilayah Kemendagri/BPS) alih-alih memanggil API pihak ketiga di setiap request pencarian, demi performa dan menghindari ketergantungan uptime layanan eksternal. Endpoint di atas sepenuhnya melayani dari database sendiri; Google Places/Maps API (Bagian 9.1) baru dipakai untuk **autocomplete alamat jalan & pin peta presisi**, bukan untuk data wilayah administratif.
>
> **Keterkaitan dengan form listing (Bagian 2):** `POST/PUT /listings` mewajibkan `province_id`, `city_id`, `district_id` yang valid (harus ada di `ref_provinces`/`ref_cities`/`ref_districts`, divalidasi via cascading dropdown yang datanya diambil dari 3 endpoint pertama di atas) — bukan menerima nama wilayah sebagai teks bebas. Field `area_keyword` (maks. 20 karakter) terpisah dari sistem ini dan tidak divalidasi terhadap data wilayah, karena fungsinya hanya sebagai keyword pelengkap kawasan spesifik (lihat ERD `listings.area_keyword`).

---

## 9. Integrasi Pihak Ketiga (External Services)

### 9.1 Maps & Geocoding — Leaflet + OpenStreetMap + LocationIQ *(v1.2 — sinkron `ADR-008`/`ADR-041` v2, Approved)*

> **Koreksi v1.2:** v1.1 masih menulis "Google Maps Platform / Mapbox" — sudah **digantikan (superseded)** oleh `ADR-008` v2 sejak sesi ARB yang sama, dengan alasan budget-friendly & Bolt.new-friendliness. Tabel di bawah mengganti isi v1.1 sepenuhnya, bukan menambah opsi baru.

| Kebutuhan | Cara Integrasi |
|---|---|
| Rendering peta (pin listing, detail, hasil pencarian) | **Leaflet + React-Leaflet** di sisi frontend, tile dari **OpenStreetMap** (gratis, tanpa API key) |
| Autocomplete alamat jalan saat isi form listing | **LocationIQ** (Nominatim-compatible, 5.000 request/hari gratis) sebagai provider primary, dipanggil server-side |
| Reverse geocoding (koordinat → alamat) saat agen pin lokasi di peta | LocationIQ (primary) → **Geoapify** (Approved Alternative/failover, sama-sama berbasis data OSM) jika LocationIQ error/timeout/kuota habis — fallback chain via abstraction layer `MapsProvider` |
| Perhitungan jarak ke fasilitas umum (sekolah, rumah sakit, tol) | LocationIQ/Geoapify Distance/Nearby endpoint (tier gratis lebih terbatas dibanding Google — dicatat sebagai trade-off yang disadari) |
| Caching hasil geocoding | Tabel teknis `geocode_cache` (key: hash alamat ternormalisasi, TTL 90 hari) — **tabel infrastruktur/cache, bukan entity domain bisnis**, sehingga tidak diregistrasikan sebagai `ENT-XXX` di Entity Mapping (konsisten perlakuan `rate_limit_log`); dicek sebelum memanggil LocationIQ/Geoapify untuk mengurangi konsumsi kuota |
| Abstraction layer | Interface `MapsProvider` dengan method `geocode()`/`reverseGeocode()` — memudahkan penggantian provider di masa depan tanpa mengubah kontrak endpoint di Bagian 2/3 |

### 9.2 Storage & CDN — AWS S3 / Cloudinary / ImageKit
| Kebutuhan | Cara Integrasi |
|---|---|
| Upload foto/video listing (Bagian 2) | `POST /listings/{id}/media` menerima file → backend upload ke bucket S3/Cloudinary → simpan URL CDN di `listing_photos.url`/`listing_videos.url` |
| Kompresi & optimasi otomatis | Dilakukan oleh layanan pihak ketiga (Cloudinary/ImageKit transformation API) saat upload — backend hanya menyimpan URL dengan parameter transformasi (mis. `?w=800&q=auto`) |
| Dokumen legalitas agen (KTP/NPWP) | Upload ke bucket **terpisah & privat** (tidak lewat CDN publik), dengan enkripsi at-rest, akses via signed URL berumur pendek saja untuk Superadmin/Admin/Manager saat review |

### 9.3 Payment Gateway — untuk Fitur Membership Premium Agen (Fase Lanjutan)
| Kebutuhan | Cara Integrasi |
|---|---|
| Langganan keanggotaan agen premium (mis. boost listing, kuota listing lebih besar) | Integrasi Midtrans/Xendit (payment gateway populer Indonesia, mendukung VA, e-wallet, kartu kredit) |
| Endpoint terkait (disiapkan sbg placeholder fase lanjutan) | `POST /billing/subscriptions`, `GET /billing/invoices`, `POST /billing/webhook` (menerima callback status pembayaran dari payment gateway) |
> Modul ini **belum termasuk cakupan wajib saat ini** — didesain sbg ekstensi non-breaking (tabel & endpoint baru) yang bisa ditambahkan tanpa mengubah struktur listing/agen yang sudah ada.

### 9.4 Geolokasi Pengguna (GPS Browser)
- **Server tidak dapat "membaca" GPS pengguna secara langsung** — pembacaan lokasi terjadi di **sisi client** melalui Browser Geolocation API (`navigator.geolocation.getCurrentPosition()`), setelah pengguna memberi izin akses lokasi.
- Setelah client mendapat `{ lat, lng }`, nilai tersebut dikirim sebagai query param ke `GET /properties/nearby?lat=...&lng=...&radius_km=5` (Bagian 3) untuk menampilkan listing terdekat.
- Fallback jika pengguna menolak izin lokasi: gunakan estimasi kota dari IP (mis. via layanan IP-geolocation) sebagai default kasar, atau minta pengguna memilih kota secara manual dari Bagian 8.

### 9.5 Google OAuth2 (Login)
- Sudah dijabarkan di Bagian 1.1 (`POST /auth/oauth/google`). Memerlukan **Google Cloud OAuth Client ID** terdaftar dengan authorized origins domain platform. Verifikasi `id_token` dilakukan **server-side** memakai Google Auth Library resmi (bukan hanya trust dari client) demi keamanan.

---

## 10. SEO & Analytics API
*(Selaras dengan dokumen SEO & Analytics Specification — dibutuhkan agar halaman publik cepat terindeks mesin pencari)*
**REQ Terkait:** REQ-M11-001 s.d. 009 | **ENT Terkait:** `ENT-M11-UrlRedirect`
**REQ Terkait:** REQ-M11-001 s.d. 009 | **ENT Terkait:** `ENT-M11-UrlRedirect`

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/sitemap-index.xml` | Public | Sitemap induk, mereferensikan sitemap per tipe di bawah |
| GET | `/sitemap-listings.xml` | Public | Sitemap listing (hanya status `published`/`sold`/`rented`) |
| GET | `/sitemap-agents.xml` | Public | Sitemap profil publik agen |
| GET | `/sitemap-developer-projects.xml` | Public | Sitemap proyek developer |
| GET | `/robots.txt` | Public | Disajikan statis/edge, isi sesuai SEO Spec Bagian 1.3 |
| POST | `/admin/seo/reindex` | Superadmin, Manager, Admin (sistem juga memicu otomatis saat publish/hapus listing) | Memicu Google Indexing API untuk 1 URL spesifik agar crawl-ulang lebih cepat |
| GET / PUT | `/admin/config/seo` | **Superadmin only** | Kelola `gtm_container_id`, `ga4_measurement_id`, `gsc_verification_meta` (tersimpan di `system_configs`) |
| GET | `/listings/{id}` *(diperluas)* | Public | Response kini menyertakan `slug`, `meta_title`, `meta_description`, `canonical_url`, dan `structured_data` (JSON-LD siap pakai) — lihat contoh di bawah |

**Contoh tambahan response `GET /listings/{id}` (field SEO):**
```json
{
  "slug": "rumah-minimalis-2-lantai-bsd-city-9f21a",
  "meta_title": "Rumah Minimalis 2 Lantai di BSD City | Dijual",
  "meta_description": "Rumah dijual di Serpong, Tangerang Selatan. LT 120m², LB 150m², 3 KT. Hubungi Andi Wijaya sekarang.",
  "canonical_url": "https://<domain>.id/properti/rumah-minimalis-2-lantai-bsd-city-9f21a",
  "photos": [
    { "url": "https://cdn.../foto1.jpg", "alt_text": "Rumah Minimalis 2 Lantai di BSD City - foto 1", "is_cover": true }
  ]
}
```

> **Catatan arsitektur:** endpoint di atas mengasumsikan halaman publik (Homepage, Search, Detail Listing, Profil Agen, Detail Proyek Developer) dirender **SSR/SSG**, bukan murni SPA yang fetch data client-side — lihat SEO Spec Bagian 1.1. GTM/GA4 dipasang sebagai snippet di layout halaman publik (bukan endpoint API tersendiri), dikonfigurasi lewat `/admin/config/seo` di atas agar Container ID dapat diubah tanpa deploy ulang.
>
> **Filter pencarian ramah-URL:** `GET /properties/search` (Bagian 3) tetap menerima `province_id`/`city_id`/`district_id` sebagai parameter internal, namun frontend bertanggung jawab memetakan slug URL publik yang human-readable (mis. `?kota=tangerang-selatan`) ke ID tsb sebelum memanggil API — menjaga URL pencarian tetap SEO-friendly tanpa mengubah kontrak API.

---

## 11. Modul Pendukung Lain (Referensi Silang PRD)

Untuk kelengkapan, berikut ringkasan endpoint modul lain yang sudah menjadi bagian PRD namun di luar 8 kelompok utama yang diminta:

### 10.1 Learning Center API (PRD Modul 4)
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/courses` | Public/Authenticated |
| GET | `/courses/{id}` | Public/Authenticated |
| POST | `/courses/{id}/enroll` | Agen |
| GET | `/agents/me/enrollments` | Agen |
| POST | `/courses/{id}/quiz/submit` | Agen |
| GET | `/agents/me/certificates` | Agen |
| POST | `/admin/courses` / `PUT /admin/courses/{id}` | Superadmin, Manager, Admin |

### 10.2 Kalender Event API (PRD Modul 5)
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/events` | Public/Authenticated |
| POST | `/events/{id}/rsvp` | Agen |
| POST | `/events` | Superadmin, Manager, Admin |
| POST | `/developer-partners/events` | Developer Partner (butuh approval) |

### 10.3 Direktori Kerjasama Developer API (PRD Modul 6)
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/developer-projects?city_id={id}&property_type=...` | Public/Authenticated |
| GET | `/developer-projects/{id}` | Public/Authenticated |
| POST | `/developer-projects/{id}/claim` | Agen |
| POST | `/admin/developer-projects` | Superadmin, Manager, Admin |

> **(v1.1)** Filter lokasi memakai `city_id` (UUID, FK ke `ref_cities`) — bukan lagi parameter `city` bertipe teks bebas — konsisten dengan migrasi skema `developer_projects.city_id` di ERD v1.1 dan pola filter `listings` di Bagian 3.

### 10.4 Admin System Configuration API (PRD Modul 9)
| Method | Endpoint | Auth |
|---|---|---|
| GET / PUT | `/admin/config/system` | **Superadmin only** (mencakup masa expired listing, passing grade default, dsb — bukan threshold DBR yang punya endpoint sendiri di Bagian 6) |
| GET | `/admin/reports/export` | Superadmin, Manager, Admin |
| GET | `/admin/internal-users` | Superadmin, Manager | Daftar akun internal (Admin, Manager, Instructor) — **baru, resolusi OD-20, 6 Agustus 2026** |
| POST | `/admin/internal-users` | Superadmin | Buat akun internal baru (Admin/Manager/Instructor) — REQ-M09-001, sebelumnya tidak ada endpoint sama sekali (T3-04, Issue Register) |
| PUT | `/admin/internal-users/{id}` | Superadmin | Edit data akun internal (nama, email, role) |
| PUT | `/admin/internal-users/{id}/deactivate` | Superadmin | Nonaktifkan akun internal (soft, bukan hard delete — konsisten `status='suspended'` di `users`) |

> **(Baru, v1.2 — resolusi OD-20; dikembalikan 9 Agustus 2026 setelah sempat hilang tanpa jejak resmi di siklus penetapan status Baseline)** Endpoint di atas menutup gap REQ-M09-001 yang sebelumnya hanya bisa dipenuhi manual/lewat mekanisme bootstrap Superadmin (`OD-18`, lihat `MP-01-Authentication-Module-Planning-v1_0.md`). Pembuatan akun via `POST /admin/internal-users` **tidak** mengirim password awal ke client — sistem generate temporary password acak dan wajib force-reset di login pertama (pola sama alur reset password normal, bukan mekanisme baru), atau kirim invite link email — **detail teknis mekanisme invite belum dirinci di sini**, akan didetailkan saat implementasi endpoint (task teknis terpisah, bukan bagian OD-20 itu sendiri).

---

## 12. Keputusan yang Sudah Disepakati

| Poin | Keputusan |
|---|---|
| Role "Agency/Principal" | **Tidak diperlukan** sebagai role sistem terpisah — cukup memakai atribut `office_name` di profil agen. |
| Chat in-app (Bagian 5) | **Ditunda ke fase lanjutan** — rilis awal cukup memakai CTA WhatsApp per listing (Bagian 4) sebagai satu-satunya jalur komunikasi Buyer↔Agen. |
| Data Wilayah Indonesia (Bagian 8) | **Di-host sendiri** di database internal (bukan panggil API pihak ketiga tiap request), karena data bersifat statis. |
| Payment Gateway (Bagian 9.3) | Didesain sesuai rekomendasi — placeholder non-breaking untuk fase membership premium agen, belum masuk cakupan wajib rilis awal. |
| Geolokasi GPS (Bagian 9.4) | Disepakati: pembacaan lokasi tetap di sisi browser (client-side), server hanya menerima koordinat lat/lng sebagai parameter. |
| Role `buyer` (v1.1) | **Diformalkan** sebagai role tersendiri di tabel `roles` (ERD v1.1) — bukan sekadar istilah dokumentasi, memiliki baris permission sendiri di `role_permissions`. |
| Framework frontend (v1.1) | **Next.js (App Router)** ditetapkan sebagai keputusan default arsitektur — memenuhi syarat SSR/SSG wajib di SEO Specification Bagian 1.1. Lihat `PROJECT-CONSTITUTION.md` Bagian 4. |
| Fitur review/rating agen (v1.1) | **Diaktifkan Fase 1** dengan alur submit (Buyer) + moderasi (Admin/Manager/Superadmin) — lihat Bagian 1.2 & tabel `agent_reviews` di ERD v1.1. |
| Satuan tenor DBR (v1.1) | **Disepakati selalu bulan** (`tenor_months`) sebagai kontrak data; UI boleh input tahun dengan konversi wajib di client. |
| Lokasi proyek developer (v1.1) | **Disepakati memakai `city_id`** (FK `ref_cities`), bukan freetext — konsisten dengan `listings`. |
| Provider Maps (v1.2) | **Leaflet + OpenStreetMap + LocationIQ (primary) + Geoapify (failover)** — `ADR-008`/`ADR-041` v2, Approved. Menggantikan opsi Google Maps/Mapbox yang sebelumnya "condong dipilih, belum final". |
| Mesin pencari listing (v1.2) | **PostgreSQL FTS + pg_trgm** untuk MVP Fase 1, migrasi terjadwal ke Typesense saat ambang volume tercapai — `ADR-005`/`ADR-039`, Approved (Hybrid Bertahap). |

## 13. Hal yang Masih Perlu Dikonfirmasi

1. Sumber dataset wilayah Indonesia resmi yang akan dipakai untuk seed data Bagian 8 (mis. dataset Kemendagri terbaru), serta siapa yang bertanggung jawab menjaga data tetap ter-update bila ada pemekaran wilayah.
2. Provider payment gateway pilihan untuk fase membership premium nanti (Midtrans/Xendit/lainnya) — memengaruhi desain detail webhook di Bagian 9.3 saat fase itu tiba. Terkait juga `OD-08` (Open Decision, threshold DBR final & model monetisasi — masih Open di `decision-log.md`).
3. Siapa pemegang akun organisasi (bukan akun pribadi) untuk Google Search Console, Google Tag Manager, dan GA4 — perlu ditentukan tim operasional sebelum go-live (tidak lagi memblokir mulainya development).

> **(v1.2)** Item "Provider Maps pilihan" **dihapus dari daftar ini** — sudah resolved via `ADR-008` v2 (lihat Bagian 12 di atas), dipindah dari "belum dikonfirmasi" ke "sudah disepakati".

---

*Dokumen ini menjadi acuan untuk implementasi backend (routing, middleware RBAC, dan integrasi pihak ketiga) pada tahap development.*
