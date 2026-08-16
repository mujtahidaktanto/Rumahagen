# MODULE PLANNING
## MP-02 — Profil Agen
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 2 (Profil Agen) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.3-2.3b + migration `0005`) | ERD v1.3 |
| 8 | API Specification | v1.2 |
| 9 | Functional Specification | v1.0 |
| 10 | UI Specification | v1.0 |
| 11 | ERD | v1.3 |
| 12 | PRD | v1.2 |
| 13 | User Flow | v1.2 |
| *(tambahan)* | Authorization & Access Control Specification | v1.1 *(naik dari v1.0, audit Issue Register Batch 3, 6 Agustus 2026)* |
| *(tambahan)* | Entity Mapping | v1.0 |

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (9 Agustus 2026) berdasarkan 3 snapshot yang tersedia — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **⚠️ Konflik penomoran** (pola sama seperti MP-01, SYSTEM-ARCHITECTURE, AI Development Blueprint): ketiga snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik, namun merepresentasikan 3 keadaan berbeda secara kronologis-progresif. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah semata untuk audit. File final ini setara **1.0c**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — gap bukti lead review (Konflik #1) & tidak ada pembatasan 1-review-per-Buyer-per-Agen dieskalasi ke Owner, belum diputuskan; Authorization Spec masih v1.0 dengan Konflik #3 terbuka. |
| 1.0b | 6 Agu 2026 | **OD-23 Resolved** — bukti lead review TIDAK wajib; 1 review aktif per (reviewer, agen), replace-on-resubmit; **fitur baru** self-review Agen (auto-approved, ikut `aggregateRating`); `UNIQUE(buyer_id, agent_id)` ditambahkan ke migration `0005`. |
| 1.0c | 6 Agu 2026 | Authorization Spec §2.3 Konflik #3 **Closed** (audit T4-03) — Buyer=own untuk Approve/Delete AgentReview dikoreksi jadi none, Authorization Spec naik ke **v1.1**. **Versi terkini** — basis dokumen final di bawah. |

---

# 1. Executive Summary

Modul 2 (Profil Agen) adalah "kartu nama digital" publik & privat agen — mengelola `agent_profiles` (1:1 dengan `users`) dan `agent_reviews` (review Buyer, wajib moderasi). Modul ini **hanya bergantung M01** (MDM), dan berada di Layer 2 (Core Domain independen) bersama M04/M06/M13 di MIS Batch 2 — dapat dibangun paralel dengan ketiganya. Migration SQL (`0005_m02_agent_profile.sql`) **sudah ditulis lengkap**, termasuk RLS yang **secara konkret menegakkan** "hanya role `buyer` yang dapat submit review" — namun ditemukan **gap enforcement** antara niat bisnis (bukti interaksi/lead sebelum review) dan RLS aktual (lihat Bagian 51). Go/No-Go: ✅ **GO**.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 2 sebagai rujukan tunggal — mencakup scope fungsional, kontrak API, aturan bisnis, matriks permission, dan kriteria selesai — termasuk penyelarasan ketidaksesuaian yang ditemukan antara Business Rule PRD, skema ERD, dan RLS migration aktual.

---

# 3. Scope

- Tabel `agent_profiles`, `agent_reviews` (ERD v1.3 §2.3-2.3b) beserta RLS.
- Endpoint `GET/PUT /users/profile`, `GET /agents/{id}`, `GET /agents/{id}/credentials`, `GET/POST /agents/{id}/reviews`, `GET/PUT /admin/agent-reviews/*` (API Spec §1.2).
- Layar: Profil Publik Agen, Edit Profil Saya, Submit Review Agen (dialog), Moderasi Review (UI Spec §6).
- Statistik performa otomatis (`total_listings_sold`/`total_listings_rented`, terisi via trigger/cron dari M03 — dikonsumsi di sini, bukan diimplementasikan ulang).
- Badge pencapaian (dibaca via relasi ke `certificates`, M04 — read-only query).
- Alur approval field sensitif (nama, no. lisensi).

---

# 4. Out of Scope

- **Penghitungan statistik listing terjual/tersewa** — logika kalkulasinya milik M03 (trigger/cron pada perubahan status listing); M02 hanya membaca hasil denormalisasi di kolom `agent_profiles.total_listings_sold/rented`.
- **Penerbitan Certificate/badge** — milik M04; M02 murni **membaca** relasi (Entity Mapping §2: "M02 hanya membaca relasi ke Certificate, tidak mendefinisikan ulang").
- **Bukti lead/interaksi (`ENT-M03-ListingLead`)** sebagai prasyarat submit review — entity-nya milik M03; keterkaitan `agent_reviews.listing_lead_id` bersifat opsional-referensial di skema saat ini (lihat Bagian 51 Konflik #1).
- **CTA WhatsApp/Email dari halaman profil** ke Detail Listing — navigasi lintas modul, bukan fitur M02 sendiri.
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Menjadi **representasi profesional digital** agen yang dapat diakses publik tanpa login, sekaligus memberi kepercayaan (trust signal) via statistik performa, badge, dan review terverifikasi moderasi — mendukung fungsi platform sebagai kanal akuisisi lead organik (SEO).

---

# 6. Business Value

- Meningkatkan kepercayaan calon pembeli lewat statistik & review yang termoderasi (bukan self-report tanpa verifikasi).
- Mendukung SEO — halaman profil agen adalah salah satu 5 tipe halaman wajib SSR/SSG (SEO Spec §1.1).
- Mengurangi beban approval Admin — hanya field sensitif (nama, no. lisensi) yang butuh approval, field lain tersimpan langsung.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M01 (Auth)** saja — MDM Bagian 3: baris M02 hanya bertanda ● di kolom M01 (Provider), ○ (opsional) di M03/M04. |
| **Dibutuhkan Oleh** | M03 (WA default kontak saat create listing), M11 (SEO — sumber halaman publik) — MDM Dependency Matrix Bagian 3. |
| **Dependency opsional (○, tidak hard-block)** | M03 (statistik listing, sifatnya read-only agregat), M04 (badge, read-only) — MDM Bagian 3 catatan: "kedua relasi baca berbeda arah... bukan siklus dependency pembangunan (build-time)". |
| **Circular Dependency** | Diperiksa eksplisit di MDM Bagian 11 (M02↔M03) — **valid secara arsitektural**, bukan circular sungguhan: M03→M02 untuk kontak WA saat create listing (build-time), M02→M03 untuk statistik read-only (runtime data dependency, bukan module build dependency). |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Core Business** |
| Urutan Implementasi (MIS §3) | **#4 dari 13** |
| Layer (MIS §13) | **Layer 2 — Core Domain (independen satu sama lain)** |
| Prioritas (MIS §14) | **P1** |
| Batch Paralel (MIS §6) | **Batch 2** — bersama M04, M06, M13 (titik paralelisme tertinggi proyek) |
| Alasan Posisi (MIS §4) | "Keduanya [M02, M06] hanya bergantung M01... dapat dibangun paralel secara teori, tapi diurutkan M02 dulu karena M03 butuh M02 untuk WA default." |
| Go/No-Go (MIS §15) | ✅ **GO** — "Baseline, bergantung M01 saja" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Agen | Pemilik & pengelola profil sendiri |
| Buyer | Pengguna fitur review |
| Admin/Manager/Superadmin | Moderator review & approval field sensitif |
| Calon pembeli (Guest) | Konsumen halaman profil publik |
| M03, M11 | Konsumen data profil (kontak WA, halaman publik untuk SEO) |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Agen | Owner profil — edit, lihat statistik |
| Buyer (login) | Submit review |
| Guest | Lihat profil publik, klik CTA kontak |
| Superadmin, Manager, Admin | Moderasi review, approval field sensitif, lihat/edit semua profil (`all`) |
| Instructor, Developer Partner | `none` — tidak relevan terhadap entity M02 (Authorization Spec §2.3) |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M02-01 | Sebagai agen, saya ingin memiliki profil publik dengan foto/bio/spesialisasi/area, agar calon pembeli dapat mengenal saya secara profesional. | REQ-M02-001 |
| US-M02-02 | Sebagai agen, saya ingin statistik performa (listing aktif/terjual, rating) tampil otomatis, agar saya tidak perlu update manual. | REQ-M02-002 |
| US-M02-03 | Sebagai agen, saya ingin badge pencapaian Learning Center tampil di profil saya, agar kredibilitas saya terlihat. | REQ-M02-003 |
| US-M02-04 | Sebagai agen, saya ingin link share profil publik, agar mudah dibagikan ke calon klien. | REQ-M02-004 |
| US-M02-05 | Sebagai agen, saya ingin mengatur visibilitas kontak (tampil/sembunyi), agar saya kontrol privasi. | REQ-M02-005 |
| US-M02-06 | Sebagai Buyer, saya ingin memberi review/rating agen, agar saya bisa berbagi pengalaman ke calon klien lain. | REQ-M02-006 |
| US-M02-07 | Sebagai Admin/Manager/Superadmin, saya ingin memoderasi review sebelum tampil publik, agar konten yang tayang berkualitas. | REQ-M02-006 |
| US-M02-08 | Sebagai agen, perubahan nama/no. lisensi saya butuh approval, agar data sensitif tidak disalahgunakan. | REQ-M02-007 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M02-001 | Profil publik & privat agen | In Scope |
| REQ-M02-002 | Statistik performa otomatis | In Scope (konsumsi, kalkulasi milik M03) |
| REQ-M02-003 | Badge pencapaian | In Scope (konsumsi, milik M04) |
| REQ-M02-004 | Link share profil publik | In Scope |
| REQ-M02-005 | Kontak dengan opsi privasi | In Scope |
| REQ-M02-006 | Review/rating agen dengan moderasi | In Scope |
| REQ-M02-007 | Edit profil dengan approval field sensitif | In Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Rendering | Profil Publik Agen wajib **SSR/SSG/ISR** — salah satu 5 tipe halaman wajib di SEO Spec §1.1 | SEO Spec §1.1 |
| `aggregateRating` | Dihitung **on-the-fly** (`AVG(rating) WHERE status='approved'`) saat render, **tidak** didenormalisasi — "volume review per agen relatif kecil di Fase 1" | ERD v1.3 §2.3b catatan |
| Response time | **Not Defined** — tidak ada target ms eksplisit | Open Issue |
| Index query publik | `idx_agent_reviews_agent_status` mendukung `WHERE status='approved'` — dirancang untuk query publik cepat | Migration `0005` |

---

# 14. Business Rule

Dari PRD Modul 2 "Business Rules":

1. Statistik listing terjual dihitung **otomatis** dari M03 (status closing).
2. Badge pelatihan **otomatis** muncul setelah agen lulus kursus terkait (M04).
3. Superadmin/Manager/Admin dapat melihat & mengedit profil **seluruh** agen (`all`) — mis. untuk approval data sensitif; Agen **hanya** dapat mengelola profilnya sendiri, **tidak dapat** melihat/edit profil agen lain.
4. Review hanya dapat disubmit **Buyer** (akun terdaftar) **yang pernah memberikan lead/inquiry** ke agen ybs; status awal selalu `pending`, wajib dimoderasi Admin/Manager/Superadmin sebelum tampil publik & dihitung `aggregateRating`. `aggregateRating` hanya tampil jika minimal 1 review `approved`. — **Catatan: bagian "yang pernah memberikan lead/inquiry" tidak ditegakkan di RLS aktual, lihat Bagian 51 Konflik #1.**

---

# 15. Workflow Summary

**Alur Edit Profil (Agen, User Flow):** Login → buka "Profil Saya" → tampil data saat ini → klik "Edit Profil" → ubah field → simpan → jika field sensitif (nama/no. lisensi) diubah → status "Menunggu Approval Admin" → Admin review → Approve/Reject → notifikasi ke agen; jika field non-sensitif → tersimpan langsung & tampil real-time → badge/statistik otomatis sinkron dari M03/M04.

**Alur Publik (Calon Pembeli):** Klik nama agen dari listing / buka link profil → tampil profil publik (foto, bio, spesialisasi, area, listing aktif, badge, rating **hanya `approved`**) → klik listing → Detail Listing (M03); atau klik WA/Email → CTA kontak; atau klik "Beri Ulasan" (khusus Buyer login) → isi rating+komentar → submit.

**Alur Submit & Moderasi Review:** Buyer login → buka profil agen → "Beri Ulasan" → isi rating (1-5) + komentar opsional → submit → status `Pending`, **belum tampil publik** → notifikasi ke Admin/Manager/Superadmin → buka antrean moderasi → baca isi → **Reject** (tidak tampil, tidak ada notifikasi ke Buyer) atau **Approve** (status `Approved` → tampil publik & masuk `aggregateRating`).

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Aktor |
|---|---|---|---|
| SCR-M02-01 | Profil Publik Agen | B | Guest, semua role |
| SCR-M02-02 | Edit Profil Saya | C (form dalam dashboard) | Agen |
| SCR-M02-03 | Submit Review Agen | — (`Dialog` di Template B) | Buyer |
| SCR-M02-04 | Moderasi Review | F | Superadmin, Manager, Admin |

---

# 17. Screen Detail

### SCR-M02-01 — Profil Publik Agen (`/agent/[slug]`)
- **Template:** B.
- **Aktor:** Public.
- **Konten:** foto, bio, spesialisasi, statistik performa, badge, daftar listing aktif, review/rating.
- **Aksi:** "Hubungi via WhatsApp"; "Tulis Review" (khusus Buyer login).
- **State kosong:** agen belum punya listing aktif → "Belum ada listing aktif dari agen ini" (bukan halaman kosong polos).

### SCR-M02-02 — Edit Profil Saya (`/dashboard/profile`)
- **Template:** C.
- **Input:** Foto profil, Bio (max karakter sesuai kolom), Spesialisasi (multi-select), Area jangkauan, Kontak (toggle tampil/sembunyi), Nama & No. Lisensi (**field sensitif**, REQ-M02-007).
- **Aksi:** "Simpan Perubahan".
- **Output:** field non-sensitif tersimpan langsung; field sensitif → status "Menunggu Approval" ditampilkan di sebelah field terkait.

### SCR-M02-03 — Submit Review Agen (komponen `AgentReviewForm` dalam `Dialog`, di atas Template B)
- **Komponen:** `AgentReviewForm` (UI Spec §4.2, tipe Smart).
- **Aktor:** Buyer (login).
- **Input:** rating bintang (1-5) wajib, komentar opsional.
- **Output:** status `pending`, tidak langsung tampil.

### SCR-M02-04 — Moderasi Review (Admin Panel)
- **Template:** F.
- **Aktor:** Superadmin, Manager, Admin.
- **Aksi:** approve/reject per baris review dengan alasan (untuk reject).

---

# 18. Navigation Flow

```
/agent/[slug] (publik) ──► klik "Tulis Review" (Buyer login) ──► Dialog AgentReviewForm
                       ──► submit ──► status pending (tidak redirect halaman baru)

/dashboard/profile (Agen) ──► edit ──► simpan
     ├─ field non-sensitif ──► tersimpan, tetap di halaman yang sama
     └─ field sensitif ──► badge "Menunggu Approval" ──► (async) Admin approve/reject ──► notifikasi

(admin)/agent-reviews ──► pilih baris pending ──► approve/reject ──► kembali ke antrean (baris hilang dari daftar pending)
```
Sumber: User Flow Modul 2; Functional Spec §4.2.

---

# 19. API Summary

| Endpoint | Fungsi |
|---|---|
| `GET /users/me` | Data akun & profil user login (dikonsumsi, entity gabungan M01/M02) |
| `PUT /users/profile` | Update profil |
| `GET /agents/{id}` | Profil publik agen |
| `GET /agents/{id}/credentials` | Badge/lencana verifikasi, statistik (dikonsumsi dari M04/M03) |
| `GET /agents/{id}/reviews` | Daftar review `approved` |
| `POST /agents/{id}/reviews` | Submit review baru (Buyer) |
| `GET /admin/agent-reviews/pending` | Antrean moderasi |
| `PUT /admin/agent-reviews/{id}/approve` | Approve review |
| `PUT /admin/agent-reviews/{id}/reject` | Reject review |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth | `module_code`/`action_code` | `granted_scope` |
|---|---|---|---|---|
| GET | `/agents/{id}` | Public | `M02_profile` / `view` (`PERM-M02-View-AgentProfile`) | `all` (publik, tanpa filter kepemilikan) |
| PUT | `/users/profile` | Authenticated | `M02_profile` / `update` (`PERM-M02-Update-AgentProfile`) | `own` (Agen), `all` (Superadmin/Manager/Admin) |
| GET | `/agents/{id}/reviews` | Public | — (hanya baris `status='approved'`, ditegakkan RLS) | — |
| POST | `/agents/{id}/reviews` | Buyer | `M02_profile` / `create` (`PERM-M02-Create-AgentReview`) | `own` |
| GET | `/admin/agent-reviews/pending` | Superadmin, Manager, Admin | `M02_profile` / `view` (`PERM-M02-View-AgentReview`) | `all` |
| PUT | `/admin/agent-reviews/{id}/approve` | Superadmin, Manager, Admin | `M02_profile` / `approve` (`PERM-M02-Approve-AgentReview`) | `all` |
| PUT | `/admin/agent-reviews/{id}/reject` | Superadmin, Manager, Admin | `M02_profile` / `approve` (memakai permission yang sama, tidak ada `PERM-M02-Reject-*` terpisah) | `all` |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `PUT /users/profile` | `bio` | Max karakter — **nilai pasti tidak ditentukan** di ERD (`TEXT`, tanpa batas eksplisit); UI Spec menyebut "max karakter sesuai kolom" tanpa angka — Open Issue Bagian 46 |
| | `specialization` | Array dari enum: `residensial`, `komersial`, `tanah`, `sewa` |
| | `contact_visibility` | Enum: `public` \| `hidden` |
| | `whatsapp_number` | Wajib (NOT NULL di skema) |
| | `full_name`, `license_number` | **Field sensitif** — perubahan tidak langsung tersimpan, masuk antrean approval (REQ-M02-007) |
| `POST /agents/{id}/reviews` | `rating` | Wajib, integer 1-5 (`CHECK` constraint) |
| | `comment` | Opsional |
| | Ownership | RLS `agent_reviews_insert_buyer`: `buyer_id = auth.uid() AND auth_role_code() = 'buyer'` — **tidak ada validasi bukti lead/interaksi** (Bagian 51 Konflik #1) |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Tidak ada struktur khusus M02 di luar pola umum. Field `aggregateRating` dihitung saat response `GET /agents/{id}` di-generate (bukan tersimpan), format persisnya (di dalam `data` atau `meta`) **tidak dirinci** di API Spec — Open Issue.

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `agent_profiles`, `agent_reviews` |
| Index | `idx_agent_profiles_slug` (UNIQUE, partial `WHERE deleted_at IS NULL`), `idx_agent_reviews_agent_status` (partial, mendukung query publik) |
| RLS | `agent_profiles_select_public` (siapa saja, termasuk `anon`); `agent_profiles_update_own`; `agent_reviews_select_public` (`status='approved'` saja); `agent_reviews_select_own_moderation`; `agent_reviews_insert_buyer`; `agent_reviews_moderate` |
| Trigger | `trg_agent_profiles_updated_at` |
| Soft-delete | **Kedua tabel** termasuk 8 tabel wajib soft-delete (`deleted_at`) — `agent_profiles` **dan** `agent_reviews` |
| FK tertunda | `agent_reviews.listing_lead_id` — dibuat NULLABLE tanpa FK constraint di `0005`, **FK constraint-nya baru ditambahkan di migration `0008_m03_listing.sql`** (bukan `0007` seperti tertulis di komentar migration `0005` — lihat Bagian 51 Konflik #2, temuan technical debt) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M02-AgentProfile` | Root | `agent_profiles` | REQ-M02-001..003, 007 |
| `ENT-M02-AgentReview` | Root | `agent_reviews` | REQ-M02-006 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0005_m02_agent_profile.sql` | **Sudah ditulis** — membuat `agent_profiles`, `agent_reviews`, RLS lengkap |
| Prasyarat | `0001` (helper), `0003` (`users`) |
| FK tertunda ke luar modul | `agent_reviews.listing_lead_id` → `listing_leads.id`, diselesaikan di `0008` (M03) — **late-binding FK by design**, konsisten pola yang sama di MP-01 (`role_permissions.updated_by`) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| **Temuan technical debt** | Komentar di baris migration `0005` menyebut FK akan ditambahkan "via ALTER di migration **0007** (M03)" — **salah**, migration `0007` adalah M12 (Organization), bukan M03. FK sebenarnya ada di `0008_m03_listing.sql` (dikonfirmasi langsung dari isi file). Ini murni **kesalahan komentar dokumentasi kode**, tidak memengaruhi fungsi SQL (FK tetap dibuat benar di `0008`) — lihat Bagian 51 Konflik #2. |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.3:

| Permission ID | Entity | Aksi | Superadmin | Manager | Admin | Instructor | Agent | DevPartner | Buyer | Endpoint |
|---|---|---|---|---|---|---|---|---|---|---|
| `PERM-M02-View-AgentProfile` | `ENT-M02-AgentProfile` | View | all | all | all | none | own | none | - | `PUT /users/profile`, `GET /agents/{id}` |
| `PERM-M02-Update-AgentProfile` | `ENT-M02-AgentProfile` | Update | all | all | all | none | own | none | - | `PUT /users/profile`, `GET /agents/{id}` |
| `PERM-M02-Create-AgentReview` | `ENT-M02-AgentReview` | Create | all | all | all | none | - | none | own | `POST /agents/{id}/reviews`, ... |
| `PERM-M02-View-AgentReview` | `ENT-M02-AgentReview` | View | all | all | all | none | - | none | own | idem |
| `PERM-M02-Approve-AgentReview` | `ENT-M02-AgentReview` | Approve | all | all | all | none | - | none | own | idem |
| `PERM-M02-Delete-AgentReview` | `ENT-M02-AgentReview` | Delete | all | all | all | none | - | none | own | idem |

> **Catatan kualitas dokumen sumber:** kolom Buyer = `own` untuk **`Approve`** dan **`Delete`** AgentReview tampak sebagai artefak generalisasi tabel. **✅ Closed [2026-08-06], audit v1.1/T4-03** — `Authorization-Access-Control-Specification-v1.1.md` §2.3 dikoreksi (Approve/Delete-AgentReview, Buyer: own→none).

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `agent_profiles.whatsapp_number` | Ya | VARCHAR(20) | NOT NULL — default kontak CTA listing |
| `agent_profiles.public_slug` | Ya (auto-generate) | VARCHAR(150) | UNIQUE |
| `agent_profiles.contact_visibility` | Ya | Enum | `public`\|`hidden` |
| `agent_reviews.rating` | Ya | SMALLINT | 1-5 |
| `agent_reviews.buyer_id` | Kondisional | UUID | Wajib untuk insert normal (RLS mensyaratkan `= auth.uid()`); nullable di skema untuk kasus lain yang **tidak ada endpoint aktifnya saat ini** |
| `agent_reviews.status` | Ya (default) | Enum | `pending`→`approved`/`rejected` |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Agen mencoba lihat/edit profil agen lain | 403 (atau 404 disamarkan, mengikuti pola umum SYSTEM-ARCHITECTURE §8) | PRD Business Rule #3 |
| Non-Buyer (mis. Agen) mencoba `POST /agents/{id}/reviews` | 403 (RLS `agent_reviews_insert_buyer` menolak) | Migration `0005` |
| Reject review tanpa alasan | **Not Defined** — tidak ada field `rejection_reason` di skema `agent_reviews` (berbeda dari `agent_verification_documents` yang punya `rejection_reason`) — Open Issue Bagian 46 |
| Edit field sensitif saat masih ada pengajuan sebelumnya `pending` | **Not Defined** — apakah pengajuan baru menimpa yang lama atau ditolak? | Open Issue |

---

# 29. Notification

| Trigger | Penerima | Isi |
|---|---|---|
| Review baru disubmit | Admin/Manager/Superadmin | "Ada review baru menunggu moderasi" |
| Review approved | — | **Tidak ada notifikasi eksplisit ke Buyer** disebutkan di User Flow |
| Review rejected | — | **Eksplisit dinyatakan "tidak ada notifikasi ke Buyer"** (User Flow, by design) |
| Field sensitif profil approved/rejected | Agen ybs | Notifikasi hasil approval (User Flow) |

---

# 30. Activity Log

Perubahan berikut dicatat ke `audit_logs` (M09): approval/reject field sensitif profil, approval/reject review. **Not Defined** secara eksplisit apakah update field non-sensitif (yang tersimpan langsung tanpa approval) juga dicatat — kemungkinan besar tidak, karena tidak butuh approval, namun tidak dinyatakan eksplisit di dokumen sumber.

---

# 31. Audit Trail

M02 adalah salah satu sumber entri `audit_logs` (approval profil sensitif & review) — dikonsumsi dari M09 sebagai pemilik tabel, sama seperti pola di MP-01.

---

# 32. External Integration

**Tidak ada.** M02 tidak mengintegrasikan layanan eksternal langsung — CTA WhatsApp memakai `whatsapp_number` sebagai data (bukan integrasi API WhatsApp aktif, hanya `wa.me` link generik berdasarkan pola umum platform serupa — **tidak eksplisit dijelaskan mekanismenya** di dokumen sumber, Open Issue).

---

# 33. AI Capability

**Tidak ada.**

---

# 34. Performance Requirement

| Aspek | Target | Sumber |
|---|---|---|
| Rendering profil publik | SSR/SSG/ISR wajib | SEO Spec §1.1 |
| `aggregateRating` | Dihitung on-the-fly (bukan cache/denormalisasi di Fase 1) | ERD v1.3 §2.3b |
| Response time | **Not Defined** | Open Issue |

---

# 35. Security Requirement

1. Field sensitif (nama, no. lisensi) **tidak pernah tersimpan langsung** — wajib approval Superadmin/Admin, mencegah agen mengubah identitas legal tanpa verifikasi.
2. RLS `agent_reviews_insert_buyer` membatasi insert hanya ke `buyer_id = auth.uid()` dengan role `buyer` — mencegah spoofing review atas nama Buyer lain.
3. RLS publik hanya expose review `status='approved'` — review `pending`/`rejected` tidak bisa dibaca publik meski lewat manipulasi query langsung (ditegakkan level database, bukan hanya filter aplikasi).
4. `agent_profiles_select_public` mengizinkan role `anon` (belum login) — **konsisten disengaja** karena halaman profil publik memang harus dapat diakses tanpa login.

---

# 36. Accessibility Requirement

**Not Defined secara M02-spesifik.**

---

# 37. Responsive Requirement

**Not Defined secara M02-spesifik** — SCR-M02-01 Template B umumnya dipakai lintas modul untuk halaman detail publik, mengikuti pola responsif standar template tsb (tidak dirinci ulang khusus M02).

---

# 38. SEO Impact (Jika relevan)

**Sangat relevan** — Profil Publik Agen adalah salah satu 5 tipe halaman **wajib SSR/SSG/ISR** (SEO Spec §1.1). Structured data `Person` dengan `jobTitle: "Real Estate Agent"`, `worksFor`, dan `aggregateRating` (jika ada review `approved`) — SEO Spec §3. Meta title/description auto-generate dari template jika agen tidak mengisi (SEO Spec §2.1, meski contoh template di SEO Spec berfokus ke listing, prinsip yang sama berlaku).

---

# 39. Configuration

**Tidak ada `system_configs` khusus M02** yang terdaftar di dokumen sumber.

---

# 40. Environment Variable

**Tidak ada environment variable baru** khusus M02.

---

# 41. Feature Flag

**Tidak ada feature flag terdefinisi.** Catatan: fitur review "diputuskan aktif di Fase 1" (bukan flag, keputusan final permanen — API Spec §12 "Keputusan yang Sudah Disepakati").

---

# 42. Acceptance Criteria

Dari PRD Modul 2:

- [ ] Profil dapat diedit oleh agen ybs, perubahan tertentu (nama, no. lisensi) butuh approval Superadmin/Admin.
- [ ] Profil publik dapat diakses tanpa login oleh calon pembeli.
- [x] **(Baru, OD-23)** Buyer dapat submit review tanpa bukti lead wajib, dibatasi 1 review aktif per Agen (replace on resubmit). Agen dapat submit self-review dengan batasan sama, auto-approved.

*(Catatan: sama seperti MP-01, PRD Modul 2 memiliki Acceptance Criteria ringkas — 2 butir saja. Kriteria tambahan terkait review di Bagian 43 disintesis dari Business Rules + User Flow, ditandai sebagai turunan.)*

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Agen edit bio & spesialisasi | Tersimpan langsung, tampil real-time tanpa approval |
| 2 | Agen edit nama lengkap | Status "Menunggu Approval", belum berubah di publik sampai Admin approve |
| 3 | Guest (belum login) buka `/agent/[slug]` | Halaman tampil penuh tanpa perlu login |
| 4 | Agen mencoba `GET/PUT /users/profile` milik agen lain via manipulasi ID | 403/404 |
| 5 | Buyer submit review rating 5 + komentar | Tersimpan status `pending`, tidak langsung tampil di `/agent/[slug]` |
| 6 | Agen (bukan Buyer) mencoba `POST /agents/{id}/reviews` | 403 (RLS role check) |
| 7 | Admin approve review | Review tampil di daftar publik, `aggregateRating` ter-update pada request berikutnya |
| 8 | Buyer submit review untuk agen yang **belum pernah** ia hubungi (tanpa `listing_lead_id`) | **✅ Resolved [2026-08-06], OD-23:** berhasil tersimpan — ini **sesuai desain final** (bukti lead tidak wajib), bukan lagi bug/gap |
| 9 | Buyer submit review kedua ke Agen yang sama (rating/komentar berbeda) | **Baru, OD-23:** review lama ter-*replace* (upsert `ON CONFLICT (buyer_id, agent_id)`), status reset ke `pending`, wajib dimoderasi ulang |
| 10 | Agen submit self-review untuk profilnya sendiri | **Baru, OD-23:** tersimpan status `approved` langsung (auto-approved, tanpa moderasi), langsung tampil publik & masuk `aggregateRating` |
| 11 | Agen submit self-review kedua | **Baru, OD-23:** review lama ter-*replace* (upsert), tetap `approved` otomatis |
| 12 | Agen mencoba submit review untuk **Agen lain** (bukan dirinya) | **Baru, OD-23:** 403 — RLS `agent_reviews_insert_buyer` mensyaratkan `agent_id = auth.uid()` untuk role `agent` (self-review only, tidak bisa review Agen lain) |

---

# 44. Edge Case

1. Agen mengedit nama saat pengajuan approval sebelumnya masih `pending` — **Not Defined** perilaku (Bagian 28).
2. ~~Buyer submit review lebih dari sekali untuk agen yang sama — Not Defined~~ **✅ Resolved [2026-08-06], OD-23** — bukti lead TIDAK wajib; 1 reviewer (Buyer maupun self-review Agen) maksimal 1 review aktif per Agen, submit kedua me-replace (upsert); self-review Agen auto-approved (tanpa moderasi), ikut dihitung `aggregateRating`. Lihat `0005_m02_agent_profile.sql` versi terbaru. `UNIQUE(buyer_id, agent_id)` ditambahkan (`idx_agent_reviews_one_per_reviewer_per_agent`), submit kedua me-replace.
3. Agen dengan 0 review `approved` — `aggregateRating` tidak disertakan di structured data (dikonfirmasi ERD v1.3 §2.3b), halaman tetap tampil normal tanpa rating.
4. `public_slug` collision saat auto-generate (dua agen nama sama) — **Not Defined** strategi disambiguasi (mirip pola `{short_id}` di slug listing, SEO Spec §1.2, namun tidak eksplisit dinyatakan berlaku sama untuk `agent_profiles.public_slug`).

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Gap enforcement bukti lead untuk review (Konflik #1) | Review palsu/spam dari Buyer yang tidak pernah berinteraksi nyata dengan agen | **✅ Resolved [2026-08-06], OD-23** — bukti lead TIDAK wajib; 1 reviewer (Buyer maupun self-review Agen) maksimal 1 review aktif per Agen, submit kedua me-replace (upsert); self-review Agen auto-approved (tanpa moderasi), ikut dihitung `aggregateRating`. Lihat `0005_m02_agent_profile.sql` versi terbaru. Mitigasi risiko spam dialihkan ke limit 1-review-per-agen (bukan mewajibkan bukti lead). |
| Tidak ada pembatasan 1 review per Buyer per Agen | Spam rating dari 1 akun | **✅ Resolved [2026-08-06], OD-23** — bukti lead TIDAK wajib; 1 reviewer (Buyer maupun self-review Agen) maksimal 1 review aktif per Agen, submit kedua me-replace (upsert); self-review Agen auto-approved (tanpa moderasi), ikut dihitung `aggregateRating`. Lihat `0005_m02_agent_profile.sql` versi terbaru. |
| **(Baru, OD-23)** Self-review Agen auto-approved tanpa moderasi | Agen berpotensi memberi rating 5 ke diri sendiri tanpa filter kualitas — beda perlakuan dari review Buyer | Keputusan eksplisit Owner (OD-23) — risiko diterima sebagai trade-off UX (self-review = pernyataan agen, bukan testimoni pihak ketiga; publik tetap bisa melihat proporsi review Buyer vs self-review jika UI membedakan sumbernya, di luar scope OD ini) |
| Field `bio` tanpa batas karakter eksplisit di skema (`TEXT`) | Potensi abuse (bio sangat panjang merusak layout SSR/SEO) | Tentukan batas karakter di validasi aplikasi (Zod), meski skema DB tidak membatasi |

---

# 46. Known Limitation

1. ~~Bukti interaksi/lead sebelum review tidak ditegakkan~~ — **Diperbaiki [2026-08-06], OD-23**: dikonfirmasi memang tidak wajib by design.
2. ~~Tidak ada pembatasan 1 review per Buyer per Agen~~ — **✅ Resolved [2026-08-06], OD-23** — bukti lead TIDAK wajib; 1 reviewer (Buyer maupun self-review Agen) maksimal 1 review aktif per Agen, submit kedua me-replace (upsert); self-review Agen auto-approved (tanpa moderasi), ikut dihitung `aggregateRating`. Lihat `0005_m02_agent_profile.sql` versi terbaru.
3. **Tidak ada `rejection_reason`** untuk `agent_reviews` (berbeda dari `agent_verification_documents`).
4. **Batas karakter `bio`** tidak eksplisit di ERD/migration.
5. **Mekanisme CTA WhatsApp** (`wa.me` link atau lainnya) tidak dijelaskan detail teknis di dokumen sumber.
6. **Komentar migration `0005` salah rujuk nomor file** (menyebut "0007" padahal FK sebenarnya di "0008") — technical debt dokumentasi kode, tidak memengaruhi fungsi.

---

# 47. Dependency Checklist

| Item | Status |
|---|---|
| MDM: M02 hanya bergantung M01 | ✅ Terpenuhi (MP-01 sudah direncanakan) |
| MIS: M02 urutan #4, Batch 2 | ✅ Konsisten — dapat paralel dengan M04/M06/M13 |
| Migration `0001`, `0003` (prasyarat `0005`) | ✅ Sudah ditulis |
| ERD v1.3 §2.3-2.3b Baseline | ✅ |
| Authorization Spec v1.0 §2.3 Baseline | ✅ |
| FK `listing_lead_id` (tertunda ke `0008`/M03) | ⚠️ Tidak memblokir M02 — kolom tetap ada tanpa FK sampai M03 dibangun, konsisten late-binding pattern |

**Kesimpulan:** Dependency M01 terpenuhi. Tidak ada blocker.

---

# 48. Definition of Ready

- [x] PRD Modul 2 Baseline (v1.2).
- [x] ERD §2.3-2.3b Baseline (v1.3).
- [x] Migration `0001`, `0003`, `0005` tertulis.
- [x] Authorization Spec §2.3 Baseline.
- [ ] **Keputusan validasi bukti lead untuk review** (Bagian 45) — belum ada, direkomendasikan diselesaikan sebelum implementasi endpoint `POST /agents/{id}/reviews` selesai (bisa ditunda ke iterasi berikutnya jika disepakati sebagai known limitation sementara).
- [ ] **Keputusan pembatasan 1 review per Buyer per Agen** — belum ada.

---

# 49. Definition of Done

- [ ] Seluruh Acceptance Criteria (Bagian 42) terverifikasi.
- [ ] Migration `0005` dieksekusi sukses, RLS terverifikasi (termasuk publik hanya lihat `approved`).
- [ ] Unit test: alur approval field sensitif, submit review, moderasi.
- [ ] E2E test: alur profil publik → submit review → moderasi → tampil publik (Playwright).
- [ ] Dokumentasi ERD/API Spec disinkronkan bila ada penyesuaian (mis. jika keputusan validasi lead diambil).
- [ ] Komentar migration `0005` dikoreksi (referensi "0007"→"0008") sebagai bagian housekeeping, tidak wajib blocking tapi direkomendasikan.
- [ ] PR lolos CI gate.
- [ ] `CURRENT-PROJECT-STATE.md` diperbarui.

---

# 50. Traceability Matrix

| REQ-XXX | ENT-XXX | Endpoint | PERM-XXX | ADR |
|---|---|---|---|---|
| REQ-M02-001 | `ENT-M02-AgentProfile` | `GET/PUT /users/profile`, `GET /agents/{id}` | `PERM-M02-View/Update-AgentProfile` | — |
| REQ-M02-002 | `ENT-M02-AgentProfile` (konsumsi M03) | `GET /agents/{id}/credentials` | — | — |
| REQ-M02-003 | `ENT-M04-Certificate` (konsumsi M04) | `GET /agents/{id}/credentials` | — | — |
| REQ-M02-004 | `ENT-M02-AgentProfile` (`public_slug`) | — | — | — |
| REQ-M02-005 | `ENT-M02-AgentProfile` (`contact_visibility`) | `PUT /users/profile` | — | — |
| REQ-M02-006 | `ENT-M02-AgentReview` | `POST/GET /agents/{id}/reviews`, `PUT /admin/agent-reviews/*` | `PERM-M02-Create/View/Approve-AgentReview` | — |
| REQ-M02-007 | `ENT-M02-AgentProfile` | `PUT /users/profile` (alur approval) | `PERM-M02-Update-AgentProfile` | — |

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | PRD Modul 2 Business Rule menyatakan review hanya dapat disubmit Buyer **"yang pernah memberikan lead/inquiry ke agen ybs"**, dan Entity Mapping §2 menyatakan `ENT-M03-ListingLead` "sebagai bukti interaksi nyata **sebelum review dapat disubmit**" — namun RLS aktual di migration `0005` (`agent_reviews_insert_buyer`) **hanya** memvalidasi `buyer_id = auth.uid() AND auth_role_code() = 'buyer'`, **tidak ada** pengecekan `listing_lead_id` sama sekali. Kolom `listing_lead_id` di skema bersifat **NULLABLE** (opsional), bukan NOT NULL. | PRD v1.2 Business Rule, Entity Mapping v1.0 §2 vs ERD v1.3 §2.3b, migration `0005` (Database Schema, prioritas #7) | **Status: ✅ Resolved [2026-08-06], OD-23** — Owner memutuskan bukti lead TIDAK wajib (konsisten perilaku RLS/skema saat ini), dengan tambahan kebijakan baru: 1 review aktif per (reviewer, agen) dengan replace-on-resubmit, plus fitur self-review Agen (auto-approved, ikut `aggregateRating`). PRD Modul 2 Business Rule direvisi, migration `0005` diperbarui (`UNIQUE(buyer_id, agent_id)`, RLS insert/update baru). Lihat `OD-23-T3-02-Keputusan-Owner.md`. |
| 2 | Migration `0005_m02_agent_profile.sql` memiliki komentar yang menyatakan FK `agent_reviews.listing_lead_id` "ditambahkan via ALTER di migration **0007 (M03)**" — namun berdasarkan pemeriksaan langsung isi file, migration `0007` adalah **`0007_m12_organization.sql`** (Modul 12), dan FK tersebut sebenarnya ditambahkan di **`0008_m03_listing.sql`** (dikonfirmasi: baris "Late FK: agent_reviews.listing_lead_id (ditunda dari 0005 karena listing_leads baru ada sekarang)" ada di `0008`, bukan `0007`). | Komentar internal migration `0005` vs isi aktual migration `0007`/`0008` | **Kesalahan komentar dokumentasi kode**, bukan kesalahan fungsional — SQL tetap berjalan benar karena FK memang dibuat di `0008` terlepas dari apa yang tertulis di komentar `0005`. Direkomendasikan komentar di `0005` dikoreksi ("0007"→"0008") sebagai housekeeping non-blocking (Bagian 49). |
| 3 | Authorization Spec §2.3 mencantumkan Buyer=`own` untuk aksi **Approve** dan **Delete** pada `ENT-M02-AgentReview`, namun tidak ada endpoint/RLS yang memberi Buyer kapabilitas approve/delete review (RLS `agent_reviews_moderate` murni `auth_has_scope_all`, tidak ada policy DELETE untuk Buyer). | Authorization Spec v1.0 §2.3 vs migration `0005`, API Spec v1.2 §1.2 (tidak ada endpoint delete review) | **Mengikuti migration/API Spec** (kontrak konkret) — dianggap artefak generalisasi tabel. **✅ Closed [2026-08-06], audit v1.1/T4-03** — `Authorization-Access-Control-Specification-v1.1.md` §2.3 dikoreksi (Approve/Delete-AgentReview, Buyer: own→none). |

---

# 52. Recommendation

1. **✅ [2026-08-06] SELESAI — OD-23 dijawab Owner**, lihat `OD-23-T3-02-Keputusan-Owner.md`. Migration `0005_m02_agent_profile.sql` diperbarui (UNIQUE constraint + RLS insert/update baru), PRD Modul 2 direvisi, Authorization Spec §2.3 diperbarui (Agent = `own` untuk AgentReview).
2. **Perbaiki komentar migration `0005`** (Konflik #2) sebagai bagian housekeeping ringan — tidak blocking, tapi mencegah kebingungan AI Coding Assistant/developer yang membaca komentar tsb secara harfiah di sesi mendatang.
3. ~~Pertimbangkan menambah UNIQUE constraint~~ — **✅ Selesai** bersamaan OD-23, `UNIQUE(buyer_id, agent_id)` sudah ditambahkan (`idx_agent_reviews_one_per_reviewer_per_agent`).
4. **M02 aman dibangun paralel dengan M04, M06, M13** (Batch 2 MIS) — tidak ada blocker teknis apa pun untuk memulai.
5. **Setelah M02 selesai (atau paralel dengannya)**, lanjutkan ke M06 (Direktori Kerjasama Developer) sesuai urutan MIS Bagian 3 urutan #5.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Seluruh item bertanda "Not Defined"/Open Issue dicatat apa adanya sesuai kondisi dokumen sumber, termasuk temuan gap enforcement dan technical debt komentar kode yang ditemukan lewat pemeriksaan langsung file migration.*
