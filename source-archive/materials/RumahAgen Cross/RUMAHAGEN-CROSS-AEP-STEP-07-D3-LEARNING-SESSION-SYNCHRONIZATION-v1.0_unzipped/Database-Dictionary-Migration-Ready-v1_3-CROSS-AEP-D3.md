# DATABASE DICTIONARY — VERSI MIGRATION-READY
## Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 5 Agustus 2026
**Status:** Draft — menunggu pengesahan Owner & eksekusi Sprint S0
**Owner:** Database Architect — Mujtahid Aktanto (Solo Project Owner, AI-Assisted)
**Dokumen sumber:** `ERD-Skema-Database-RUMAHAGEN-v1.4.md` (Baseline), `Entity-Mapping-...v1.0.md`, `Authorization-Access-Control-Specification-v1.0.md`, `PROJECT-CONSTITUTION.md` §12-13

> **Dasar penyusunan:** `foundation-validation-report.md` Bagian 15 (Missing Documents) secara eksplisit menandai **"Database Dictionary (versi migration-ready)"** sebagai gap — ERD v1.3 lengkap secara desain, namun belum diterjemahkan ke **tipe data presisi PostgreSQL, constraint SQL eksplisit, dan RLS policy SQL** siap dieksekusi Supabase. Dokumen ini menutup gap tersebut.

> **Prinsip:** Murni **penerjemahan 1:1** ERD v1.3 ke DDL PostgreSQL — **tidak ada** entity/kolom/keputusan bisnis baru. Setiap tabel, tipe, dan constraint di sini dapat ditelusuri balik ke baris spesifik ERD v1.3. Perbedaan notasi yang disengaja: `ENUM` di ERD diterjemahkan sebagai `TEXT + CHECK constraint` (bukan native PostgreSQL `ENUM TYPE`) — dipilih karena Postgres native enum menyulitkan migrasi tambah-nilai di kemudian hari (`ALTER TYPE ... ADD VALUE` punya batasan transaksi), sementara `CHECK` mudah diubah lewat migration biasa. Ini keputusan **implementasi teknis murni**, tidak mengubah makna field.

---

## 1. Struktur File Migrasi

15 file migration bernomor urut, mengikuti **urutan dependency** (bukan urutan modul PRD) — konsisten `DEVELOPMENT-ROADMAP.md` "Module Order" (RBAC & referensi wilayah dulu, baru modul bisnis):

| # | File | Isi | Tabel |
|---|---|---|---|
| 1 | `0001_extensions_helpers.sql` | Extension (`pgcrypto`, `pg_trgm`), trigger `set_updated_at()`, 3 helper function RLS (`auth_role_code`, `auth_is_superadmin`, `auth_has_scope_all`) | — |
| 2 | `0002_m10_rbac_foundation.sql` | Modul 10 — fondasi, dibangun pertama | `roles` (seed 7), `permissions`, `role_permissions` |
| 3 | `0003_m01_auth.sql` | Modul 1 + safety guard Superadmin terakhir | `users`, `agent_verification_documents` |
| 4 | `0004_region_reference.sql` | Referensi Wilayah (shared kernel) | `ref_provinces/cities/districts/villages` |
| 5 | `0005_m02_agent_profile.sql` | Modul 2 | `agent_profiles`, `agent_reviews` |
| 6 | `0006_m06_developer.sql` | Modul 6 (dibangun sebelum M03 — FK `listings.developer_project_id`) | `developer_partners/projects/project_media`, `agent_project_claims` |
| 7 | `0007_m12_organization.sql` | Modul 12 (dibangun sebelum M03 — FK `listings.organization_id`) | `organizations`, `organization_members`, `organization_invitations` |
| 8 | `0008_m03_listing.sql` | Modul 3 — tabel inti | `listings` + 7 tabel anak |
| 9 | `0009_m04_learning_center.sql` | Modul 4 | `courses` + 6 tabel anak |
| 10 | `0010_m05_events.sql` | Modul 5 | `events`, `event_registrations` |
| 11 | `0011_m07_dbr.sql` | Modul 7 | `dbr_simulations`, `dbr_config` (seed 1 baris) |
| 12 | `0012_m08_notifications.sql` | Modul 8 | `notifications` |
| 13 | `0013_m09_admin.sql` | Modul 9 | `system_configs`, `audit_logs` |
| 14 | `0014_m11_seo.sql` | Modul 11 + trigger `url_redirects` otomatis | `url_redirects` |
| 15 | `0015_m13_ai_assistant.sql` | Modul 13, seed 4 provider | `ai_providers`, `agent_ai_connections` |

**Total: 44 tabel** — cocok persis dengan 44 `ENT-XXX` di `Entity-Mapping-...v1.0.md` (validasi silang otomatis, bukan kebetulan).

---

## 2. Keputusan Desain Kunci

1. **PK seluruh tabel:** `UUID DEFAULT gen_random_uuid()` — sesuai ERD ("UUID/BIGINT", UUID dipilih karena tidak membocorkan urutan/jumlah baris di URL publik, mis. `/listing/{id}`).
2. **`users.id` = `auth.uid()`** — konvensi Supabase standar, 1:1 dengan `auth.users`. Dicatat eksplisit di `0001` karena ERD tidak secara literal menyebutkan ini (implikasi dari `PROJECT-CONSTITUTION.md` §12).
3. **Soft-delete 9 tabel** (`deleted_at TIMESTAMPTZ`): 8 tabel `ADR-046` (`users`, `listings`, `developer_projects`, `agent_profiles`, `agent_reviews`, `courses`, `events`, `developer_partners`) + `organizations` (prinsip sama diterapkan ke tabel baru, ERD v1.3 §2.38).
4. **RLS 2-lapis** (defense-in-depth, `PROJECT-CONSTITUTION.md` §12): middleware aplikasi tetap jadi pengecekan utama; RLS di sini adalah **lapisan kedua** — bahkan bila middleware punya bug, database menolak akses lintas-scope.
5. **Pengecualian RLS disengaja — `agent_ai_connections`:** **tidak** memakai `auth_is_superadmin()`/`auth_has_scope_all()` — murni `user_id = auth.uid()`, termasuk untuk Superadmin. Ini konsisten `REQ-M13-004`/Authorization Spec §2.15 poin 5 (tidak ada bypass untuk koneksi/percakapan AI Assistant siapa pun).
6. **`audit_logs`:** tidak ada RLS policy `INSERT` untuk role `authenticated` biasa — penulisan audit log hanya lewat `service_role` key di backend (`PROJECT-CONSTITUTION.md`: "service role key hanya dipakai backend server-side untuk operasi admin"), mencegah user memalsukan audit trail miliknya sendiri.
7. **Trigger otomatis `url_redirects`:** ditambahkan di `0014` agar penulisan redirect saat `slug` berubah **tidak bisa terlewat** secara manual — menegakkan ERD v1.3 Bagian 4 poin 12 ("wajib, bukan opsional") di level database, bukan hanya harapan di level aplikasi.
8. **Safety guard Superadmin terakhir:** diimplementasikan sebagai trigger `prevent_last_superadmin_removal()` (bukan constraint SQL statis, karena logikanya kondisional) — menegakkan ERD v1.3 Bagian 4 poin 9.
9. **Index full-text search:** `GIN (to_tsvector('indonesian', ...))` + `pg_trgm` pada `listings` — implementasi konkret `ADR-005` (Postgres FTS + pg_trgm, Fase 1).
10. **Kolom deteksi duplikat foto (`ADR-047`, `OD-25`):** `listing_photos.file_hash` (VARCHAR(64), SHA-256 hex digest) dan `listing_photos.photo_hash` (VARCHAR(64), perceptual hash 64-bit via library `image-hash`) — keduanya NULLABLE, dihitung server-side saat upload foto (`POST /listings/{id}/media`). Diterjemahkan sebagai `VARCHAR(64)` biasa (bukan tipe `BYTEA`/native hash type) agar konsisten pola penyimpanan hash-as-hex-string yang mudah di-index dan dibandingkan lewat operator string standar Postgres, tanpa memerlukan ekstensi tambahan. Index non-unique direkomendasikan pada kedua kolom (lihat ERD v1.4 Bagian 4 poin 15) — mendukung query pembanding saat submit listing untuk review, dibatasi ke listing aktif milik `agent_id` yang sama.

---

## 3. Cara Eksekusi

```bash
# Via Supabase CLI (konsisten PROJECT-CONSTITUTION.md §12 "Migration dikelola lewat Supabase CLI")
supabase migration up
# atau eksekusi manual berurutan 0001 → 0015 lewat Supabase SQL Editor / psql
```

**Prasyarat sebelum eksekusi:** dataset wilayah Indonesia resmi (Kemendagri) di-seed ke `ref_provinces/cities/districts/villages` — **belum termasuk** di migration ini (item terbuka `API-Specification-...v1.2.md` §13 poin 1, di luar cakupan Database Dictionary).

---

## 4. Validation & Quality Gate

| Check | Hasil |
|---|---|
| Setiap tabel ERD v1.3 diterjemahkan (44/44, cocok Entity Mapping) | ✅ |
| Urutan file bebas forward-reference error (FK ke tabel yang belum ada) | ✅ — 2 kasus (`role_permissions.updated_by`, `agent_reviews.listing_lead_id`) ditangani via `ALTER TABLE` setelah tabel target ada |
| RLS aktif di 44/44 tabel | ✅ |
| Soft-delete 9 tabel sesuai `ADR-046` | ✅ |
| Tidak ada kolom/tipe yang menyimpang dari ERD v1.3 | ✅ — murni terjemahan tipe |
| Pengecualian RLS `agent_ai_connections` (no bypass) diterapkan benar | ✅ |
| Index prioritas ERD v1.3 Bagian 4 poin 4 diimplementasikan | ✅ |
| Kolom `file_hash`/`photo_hash` di `listing_photos` sesuai ERD v1.4 (`ADR-047`) | ✅ — ditambahkan di siklus P1-P3, lihat poin 10 Bagian 2 |

**Gap non-blocking (di luar cakupan Database Dictionary, dicatat bukan diasumsikan selesai):** seed data wilayah Indonesia aktual; RLS untuk Supabase Storage buckets (`PROJECT-CONSTITUTION.md` §12 — signed URL, dikonfigurasi di level Supabase Storage, bukan SQL migration); testing migration di environment staging sebelum Sprint S0.

---

## 5. Versioning

**Baru — v1.0**, status **Draft**. Menutup item "Database Dictionary (versi migration-ready)" di `foundation-validation-report.md` Bagian 15 (prioritas Sedang).

---

*15 file `.sql` menyertai dokumen ini (`0001_extensions_helpers.sql` s.d. `0015_m13_ai_assistant.sql`), plus `Database-Migration-Full-v1.0.sql` (gabungan seluruh migration untuk referensi/single-execution). Urutan eksekusi wajib mengikuti nomor file — tidak boleh diacak.*

---

## CONTROLLED SYNCHRONIZATION NOTICE — STEP 07
**Date:** 16 August 2026  
**AEP source:** AEP #4 Learning Session  
**Cross-AEP dependencies:** Step 05 D1 Commercial/Payment PASS; Step 06 D2 Learning Economy PASS WITH CONTROLLED RESIDUAL  
**Scope:** D3 Learning Session downstream semantic synchronization only.

This is a controlled semantic overlay. It preserves the AEP4 final decision state and does not authorize physical migration, final provider production binding, final RBAC permission IDs, automatic provider failover, or closure of MADCR-049/053/054.

### D3-DICT-01 — Logical coverage
The dictionary must eventually define physical representation for Learning Session, Session Enrollment, Provider Binding, Participation Evidence, Attendance Evaluation/Outcome, Completion Outcome, Session Artifact/Recording, and required audit/provenance.

### D3-DICT-02 — Provenance requirements
Session state changes, enrollment state transitions, provider binding changes, provider evidence ingestion, attendance evaluation and completion outcome must be reconstructable with provenance/policy context.

### D3-DICT-03 — Provider switching
Provider Binding is replaceable infrastructure association. Provider switching must preserve semantic Learning Session identity, enrollment, valid evidence and outcome history.

### D3-DICT-04 — Existing model isolation
Do not repurpose M04 `enrollments`, M05 `events`, or M05 `event_registrations`.

### D3-DICT-05 — Physical hold
No exact table/column/key/cardinality/index/state enum or migration SQL is locked by this step.
