# MODULE PLANNING
## MP-12 — Organization Management System
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 12 (Organization Management) via Bolt.new maupun developer manual — **Module Planning terakhir dari 13 modul**. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.
**Status Gate:** ✅ **TERBUKA** — dikonfirmasi eksplisit oleh Owner pada 7 Agustus 2026, menggantikan status Hold yang tercatat sebelumnya di `PROJECT-CONSTITUTION.md` §24 poin 10 dan `development-playbook.md` Golden Rule 40 (kedua dokumen mensyaratkan "paket sinkronisasi PRD/ERD/API Spec dieksekusi **dan** disahkan" — syarat dokumen terpenuhi 5 Agustus, RLS `org_invitations_insert` & T3-06 diperbaiki 6 Agustus, dan gate kode dinyatakan terbuka eksplisit oleh Owner 7 Agustus). **`CURRENT-PROJECT-STATE.md` (rev. 8) telah diperbarui mencerminkan keputusan ini.**

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.38-2.40 + migration `0007`) | ERD v1.3 |
| 8 | API Specification | v1.2 |
| 9 | Functional Specification | v1.0 |
| 10 | UI Specification | v1.0 |
| 11 | ERD | v1.3 |
| 12 | PRD | v1.2 |
| 13 | User Flow | v1.2 |
| *(tambahan)* | Authorization & Access Control Specification | v1.1 *(naik dari v1.0, audit Issue Register Batch 3, 6 Agustus 2026)* |
| *(tambahan)* | Entity Mapping | v1.0 |
| *(tambahan)* | Architecture Evolution Proposal — Organization Management System v0.9 (dokumen sumber ADR-026/027) |

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (10 Agustus 2026) berdasarkan 4 snapshot yang tersedia — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **⚠️ Konflik penomoran + duplikasi file:** keempat snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik. Selain itu, **`__2_` dan `__3_` identik 100% byte-per-byte** — kemungkinan file terduplikasi saat upload, bukan revisi baru. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah (duplikat `__3_` tidak diberi identifier terpisah). File final ini setara **1.0c**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 2 Konflik terbuka: (1) T1-04, RLS `org_invitations_insert` tidak verifikasi keanggotaan Leader sungguhan (spoofing risk); (2) dependency T3-06 (MP-03) belum diperbaiki. Gate governance kode M12 **belum dikonfirmasi terbuka** (beda dari M13). |
| 1.0b | 6 Agu 2026 | T1-04 **diklaim** Diperbaiki — `WITH CHECK` diklaim jadi kondisional per `initiated_by_type`. T3-06 **diklaim** Diperbaiki. +T4-22 (audit v1.1) — Authorization Spec §2.13 Create-Organization Manager/Admin: all→none. |
| 1.0c | 6 Agu 2026 (isi) / 7 Agu 2026 (gate) | **Gate governance kode M12 dikonfirmasi TERBUKA** oleh Owner (7 Agustus) — status Go/No-Go naik dari "GO bersyarat" jadi **GO penuh**, setara M13. `CURRENT-PROJECT-STATE.md` rev. 8 diperbarui. **Versi terkini** — basis dokumen final di bawah. |

---

## 🟢 Catatan Verifikasi Silang (ditambahkan & diselesaikan 10 Agustus 2026, siklus konsolidasi ini)

> **REGRESI KETUJUH TERKONFIRMASI — T1-04.** Klaim "Diperbaiki [2026-08-06]" untuk `org_invitations_insert` (verifikasi kondisional per `initiated_by_type`) **TIDAK TERBUKTI** — `0007_m12_organization.sql` yang diupload Owner langsung (10 Agustus 2026) membuktikan policy masih persis versi 1.0a: `WITH CHECK (agent_id = auth.uid() OR leader_id = auth.uid())`, tanpa verifikasi keanggotaan Leader sama sekali. Siapa pun authenticated user masih bisa spoof undangan `leader_invite` atas nama Organization mana pun.
>
> **✅ DIPERBAIKI [2026-08-10]** — atas instruksi Owner, `org_invitations_insert` sekarang benar-benar kondisional: `agent_request` cukup `agent_id=auth.uid()`; `leader_invite` wajib `EXISTS` check keanggotaan Leader aktif — persis spesifikasi §51 Conflict Analysis dokumen ini sendiri. Lihat `0007_m12_organization-FIXED.sql`.
>
> **T4-22 TERVERIFIKASI BENAR** — `Authorization-Access-Control-Specification-v1.1-FINAL.md` §2.13 dikonfirmasi cocok persis dengan klaim.
>
> **T3-06 (dikutip dari MP-03)** — sudah diverifikasi regresi & diperbaiki di siklus audit MP-03/MP-11 sebelumnya (lihat `MP-03-Listing-Module-Planning-v1.0-FINAL.md`), `0008_m03_listing-FIXED.sql` sudah menutup gap ini.
>
> **Ini regresi ketujuh** dalam pola sistemik yang sama — seluruhnya berasal dari klaim "Diperbaiki [2026-08-06]" di `TASK-HOTFIX-20260806-001` yang tidak pernah benar-benar tersimpan ke file migration.

---

# 1. Executive Summary

Modul 12 adalah modul **paling kompleks secara aturan bisnis** dari 13 modul (19 REQ, terbanyak) — lapisan kolaborasi tim *dual-sided identity* (mirip Shopee Customer→Seller): satu akun Agen dapat menjadi Individual, Leader, atau Member sebuah Organization, **tanpa akun kedua** dan **tanpa mengubah role platform**. Migration `0007` **sudah ditulis dengan kualitas race-condition-aware tinggi** (UNIQUE constraint `1 agen = 1 Organization aktif`, guard cross-cancellation didokumentasikan eksplisit untuk level aplikasi). **Namun ditemukan 1 gap RLS baru (T1-04)**: policy `org_invitations_insert` mengizinkan **siapa pun** mengklaim diri sebagai `leader_id` untuk `organization_id` mana pun tanpa verifikasi keanggotaan Leader sungguhan — berpotensi spoofing undangan palsu atas nama Organization yang bukan miliknya. Modul ini juga **secara langsung bergantung pada perbaikan T3-06 (MP-03)** — RLS child table listing (foto/video/amenity) belum mendukung akses Organization Leader. Go/No-Go: ✅ **GO** — dependency MDM/MIS terpenuhi **dan** gate governance kode kini terbuka (dikonfirmasi Owner 7 Agustus 2026), setara status M13.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 12 — scope fungsional, kontrak API, aturan bisnis (yang sangat detail dan presisi soal race condition), matriks permission, dan kriteria selesai — termasuk 1 temuan keamanan baru dan penegasan 2 dependency silang ke MP-03 yang sudah tercatat sebelumnya.

---

# 3. Scope

- Tabel `organizations`, `organization_members`, `organization_invitations` (ERD v1.3 §2.38-2.40) beserta RLS.
- Endpoint penuh API Spec §5A: create, branding, halaman publik, search, dashboard, invitations, join-requests, accept/reject, member management, close.
- Layar: Buat Organization (2 step), Organization Dashboard, Undang/Kelola Anggota, Cari & Ajukan Gabung, Halaman Publik Organization.
- Race-condition guard (re-check status Individual tepat sebelum commit accept).
- Cross-cancellation logic (accept 1 invitation → cancel seluruh `agent_request` pending lain).
- Cooldown 24 jam pasca-reject.
- Reset listing ke Draft Pribadi saat keluar/bubar Organization (**konsumsi** kolom `listings.organization_id`/`listing_context`, milik M03).

---

# 4. Out of Scope

- **Modul Chat/messaging** — eksplisit "di luar lingkup" PRD Business Rules.
- **Transfer kepemimpinan** — eksplisit dilarang (REQ-M12-004), Leader keluar = Organization bubar total.
- **Multi-organization membership** — eksplisit dilarang, 1 agen maksimal 1 Organization aktif.
- **Diferensiasi fungsi per `organization_type`** — eksplisit murni label kosmetik (REQ-M12-007), tanpa percabangan logika.
- **Moderasi/approval Admin untuk pembuatan Organization** — eksplisit self-service penuh (REQ-M12-008).
- **Organization Subscription/billing aktif** — *future-ready* saja, `POST /billing/*` tetap placeholder non-fungsional.
- **Perbaikan RLS child-table listing (foto/video/amenity) untuk Org Leader** — sudah dicatat sebagai T3-06 di MP-03, **prasyarat teknis** modul ini, bukan bagian scope MP-12 sendiri (kepemilikan perbaikan tetap di migration `0008`, M03).
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Memfasilitasi kolaborasi tim agen (brokerage/tim/komunitas) di dalam platform tanpa mengubah model kepemilikan aset individual — memungkinkan branding bersama dan visibilitas performa kolektif, sambil tetap menjaga integritas data listing personal tiap agen.

---

# 6. Business Value

- Menjangkau segmen brokerage/tim (bukan hanya agen independen) — memperluas pasar platform.
- Branding Organization meningkatkan kredibilitas kolektif di mata calon pembeli.
- Dashboard performa tim mendukung Leader mengelola operasional timnya tanpa tools eksternal.
- Arsitektur *future-ready* untuk monetisasi (OD-11) tanpa perlu migrasi skema besar nanti.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M01, M10 (gate RBAC platform lolos dulu, ADR-027), M03 (kepemilikan ganda)** — MDM Bagian 3, Technical Spec §M12. |
| **Dibutuhkan Oleh** | **M08** (statistik Organization di Dashboard) — MDM Dependency Matrix Bagian 3. |
| **Circular Dependency** | Tidak ditemukan — namun ada **dependency migration fisik terbalik** (M12 dibangun di migration `0007`, **sebelum** M03 di `0008`, karena `listings.organization_id` mereferensikan `organizations`) — murni kebutuhan integritas FK skema, **bukan** berarti urutan implementasi aplikasi M12 mendahului M03 (sudah dicatat di MP-10/CURRENT-PROJECT-STATE, konsisten di sini). |
| **Dependency fungsional tambahan (baru, ditemukan di MP-03)** | **T3-06**: RLS child-table listing (`listing_photos_manage` dkk.) belum mendukung Organization Leader — modul M12 **tidak dapat mencapai Definition of Done penuh** untuk fitur "Leader kelola listing anggota" tanpa perbaikan ini di M03. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Supporting** |
| Urutan Implementasi (MIS §3) | **#12 dari 13** (kondisional pada gate) |
| Layer (MIS §13) | **Layer 4 — Derived/Value-Added** |
| Prioritas (MIS §14) | **P3 — sebelumnya "Implementation-Blocked"** |
| Batch Paralel (MIS §6) | **Batch 4** — bersama M07, M11 |
| Risiko (MIS §11.1) | **Tinggi** — "Memodifikasi kolom tabel `listings` yang sudah ada; race-condition guard eksplisit disyaratkan; status Implementation-Blocked menambah risiko *timing*" |
| Go/No-Go (MIS §15) | ✅ **GO** — **status gate: TERBUKA, dikonfirmasi Owner 7 Agustus 2026**, setara M13. Dependency MDM/MIS teknis **terpenuhi** (M01, M10, M03 semua sudah punya MP), dan **implementasi kode kini diizinkan**, konsisten `PROJECT-CONSTITUTION.md` §24 poin 10 (revisi). |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Agen (calon Leader) | Pembuat & pengelola Organization |
| Agen (calon Member) | Peserta kolaborasi tim |
| Superadmin, Manager, Admin | Oversight (all-scope), bukan approval (self-service) |
| M03 | Penyedia kolom `organization_id`/`listing_context` yang dikonsumsi |
| M08 | Konsumen statistik Organization |
| M09 | Pemilik `audit_logs` (kolom `organization_id` nullable dikonsumsi di sini) |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Agen (Individual) | Buat Organization (jadi Leader) atau ajukan gabung (jadi calon Member) |
| Leader | CRUD penuh Organization miliknya, undang/keluarkan Member, CRUD Organization Listing |
| Member | View Organization, CRUD listing sendiri, read-only listing anggota lain, keluar sendiri |
| Superadmin, Manager, Admin | `all`-scope oversight (moderasi/dukungan, bukan approval pembuatan) |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M12-01 | Sebagai Agen Individual, saya ingin membuat Organization dengan 2 field wajib, agar saya bisa langsung mulai berkolaborasi tanpa proses panjang. | REQ-M12-001, 006, 008 |
| US-M12-02 | Sebagai Leader, saya ingin mengundang agen lain, agar tim saya bertambah. | REQ-M12-010, 011 |
| US-M12-03 | Sebagai Agen Individual, saya ingin mencari & mengajukan gabung ke Organization, agar saya bisa memilih tim yang cocok. | REQ-M12-010 |
| US-M12-04 | Sebagai sistem, saya perlu mencegah 1 agen aktif di 2 Organization sekaligus, agar model data tetap konsisten. | REQ-M12-003 |
| US-M12-05 | Sebagai Leader, saya ingin melihat Dashboard performa tim (member, listing, leads), agar saya bisa mengelola operasional. | REQ-M12-018 |
| US-M12-06 | Sebagai Member yang keluar, saya ingin listing Organization saya kembali jadi milik pribadi, agar aset saya tidak hilang. | REQ-M12-015 |
| US-M12-07 | Sebagai calon pembeli, saya ingin melihat halaman publik Organization dengan branding & member-nya, agar saya percaya pada tim tsb. | REQ-M12-019 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M12-001 s.d. 019 | Seluruh requirement inti Organization Management | In Scope (dokumentasi) — implementasi kode menunggu gate |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| **Race condition** | Re-check status Individual **tepat sebelum** commit transaksi accept (bukan hanya validasi awal request) — wajib backend, bukan hanya UI | REQ-M12-003, PRD Business Rule, API Spec §5A |
| Constraint level-database | UNIQUE `(agent_id) WHERE status='active'` — 1 agen 1 Organization aktif ditegakkan **di database**, bukan hanya aplikasi | Migration `0007` |
| Constraint pending unik | UNIQUE `(organization_id, agent_id, initiated_by_type) WHERE status='pending'` — cegah duplikat invitation pending | Migration `0007` |
| Cooldown | 24 jam pasca-reject, per (organization, agent, arah) — **level aplikasi**, bukan constraint DB (dicatat eksplisit di ERD sebagai business rule level-aplikasi) | ERD v1.3 §2.40 |
| Auto-expire invitation | `expires_at` → transisi `expired` via job existing (ADR-006, Vercel Cron) | ERD v1.3 §2.40 |

---

# 14. Business Rule

Dari PRD Modul 12 (paling rinci dari seluruh modul):

1. Entitas Organization berdiri sendiri, bukan role akun — role platform (`agent`, dst.) tidak berubah.
2. 1 Agen maksimal 1 Organization aktif (Leader **atau** Member, tidak keduanya) — level database.
3. **Tidak ada transfer kepemimpinan** — Leader keluar/tutup → Organization bubar otomatis.
4. Leader tidak boleh invite/di-invite Leader lain selagi masih memimpin.
5. `organization_type` murni label, tanpa percabangan logika.
6. Self-service penuh, tanpa approval Admin.
7. Race condition re-check wajib tepat sebelum commit `accepted` (Accept Invite maupun Approve Join Request).
8. Cross-cancellation: 1 `agent_request` accepted → seluruh `agent_request` pending lain milik agen sama otomatis `cancelled`; `leader_invite` pending dari Leader lain **tidak** disentuh.
9. Otorisasi Organization-scoped **independen** dari RBAC platform (ADR-024) — tidak mengamandemen `all/own/none` yang sudah ada.
10. Eksplisit di luar lingkup: Chat, transfer kepemimpinan, multi-membership, diferensiasi per tipe, approval Admin.

---

# 15. Workflow Summary

**Alur 12.1 — Buat Organization:** Agen Individual → "Organization" → "Buat Organization" → Tahap 1 (Nama+Tipe, wajib) → submit → Organization `active`, pembuat jadi Leader → Tahap 2 (branding, opsional, kapan saja) → redirect Dashboard.

**Alur 12.2 — Undang/Gabung:** Leader → Dashboard → "Undang Anggota" → cari agen → target sudah Leader/Member lain → disembunyikan; valid → kirim `leader_invite` → Pending → notifikasi. **Paralel:** Agen Individual → "Cari Organization" → "Minta Gabung" → sudah non-Individual → tombol disembunyikan; valid → `agent_request` → Pending → notifikasi ke Leader. Kedua arah → approve/reject → Reject: cooldown 24 jam; Approve: **re-check race condition** → gagal jika sudah non-Individual → berhasil: jadi Member, cross-cancel `agent_request` lain → notifikasi.

**Alur 12.3 — Keluar/Bubar:** Member "Keluar" → konfirmasi → status `left` → kembali Individual → listing Organization-nya → `listing_context` reset `personal`, status turun `Draft` (butuh review ulang). Leader "Tutup Organization" → konfirmasi (peringatan tegas: tidak ada transfer) → seluruh Member `removed` → kembali Individual → seluruh listing Organization reset ke pemilik asal masing-masing, `Draft` → `organizations.status` → `closed` (soft-delete) → notifikasi ke seluruh eks-Member.

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) |
|---|---|---|
| SCR-M12-01 | Buat Organization | D (2 step) |
| SCR-M12-02 | Organization Dashboard | C (mirip Dashboard Agen, scope Organization) |
| SCR-M12-03 | Undang/Kelola Anggota | C |
| SCR-M12-04 | Cari & Ajukan Gabung | A (varian search-only) |
| SCR-M12-05 | Halaman Publik Organization | B (varian: tanpa CTA WhatsApp, ada daftar member) |

---

# 17. Screen Detail

### SCR-M12-01 — Buat Organization (`/dashboard/organization/create`)
- Step 1 (wajib): Nama*, Tipe* (Agency/Kantor/Tim/Komunitas). Step 2 (opsional, kapan saja): Logo, Banner, Deskripsi, Website, Media Sosial, Alamat, Kontak.
- Output: submit Step 1 → `active`, Leader, redirect Dashboard.

### SCR-M12-02 — Organization Dashboard (`/dashboard/organization`)
- Aktor: Leader/Member. Tampilan: jumlah member, listing Organization, leads, performa per member, Activity Timeline.

### SCR-M12-03 — Undang/Kelola Anggota (`/dashboard/organization/members`)
- Aktor: Leader. Komponen `OrganizationInviteDialog` (Smart, modal cari-agen+kirim undangan).
- Aksi: cari agen → "Undang"; lihat daftar member; "Keluarkan Member".

### SCR-M12-04 — Cari & Ajukan Gabung (`/organizations/search`)
- Aktor: Agen Individual. Input: kata kunci nama Organization. Aksi: "Minta Gabung".

### SCR-M12-05 — Halaman Publik Organization (`/organization/[slug]`)
- Aktor: Public. Tampilan: branding, deskripsi, member, listing Organization aktif.

---

# 18. Navigation Flow

```
/dashboard/organization/create → Tahap 1 submit → /dashboard/organization (Dashboard)
     └─ (opsional, kapan saja) lengkapi Tahap 2 branding

/dashboard/organization/members (Leader) → cari agen → kirim invite → Pending
/organizations/search (Agen) → "Minta Gabung" → Pending
     └─ (async) approve/reject → Member baru ATAU cooldown 24 jam

/dashboard/organization → "Keluar"/"Tutup Organization" → konfirmasi → reset listing → Individual
```
Sumber: User Flow §12.1-12.3; Functional Spec §4.11.

---

# 19. API Summary

13 endpoint (API Spec §5A) — lihat daftar lengkap di Bagian 20.

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth | `granted_scope` |
|---|---|---|---|
| POST | `/organizations` | Agen (status Individual) | `own` |
| PUT | `/organizations/{id}/branding` | Leader | `own` (via `organization_members.role='leader'`) |
| GET | `/organizations/{id}` | Public | `all` |
| GET | `/organizations/search` | Authenticated (Agen Individual) | `all` (publik terbatas) |
| GET | `/organizations/{id}/dashboard` | Leader, Member | `own`-scope Organization |
| POST | `/organizations/{id}/invitations` | Leader | `own` — **lihat Konflik #1, gap validasi Leader sungguhan** |
| POST | `/organizations/{id}/join-requests` | Agen (status Individual) | `own` |
| PUT | `/organization-invitations/{id}/accept` | Pihak penerima | `own`, **wajib re-check race condition** |
| PUT | `/organization-invitations/{id}/reject` | Pihak penerima | `own` |
| GET | `/agents/me/organization-invitations` | Agen | `own` |
| DELETE | `/organization-members/{id}` | Member (keluar sendiri), Leader (remove) | `own` |
| DELETE | `/organizations/{id}` | Leader | `own` |
| GET | `/organizations/{id}/activity-log` | Leader, Member | `own`-scope Organization |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `POST /organizations` | `organization_name`, `organization_type` | Wajib; **backend wajib cek** `agent_id` request berstatus Individual (belum di Organization aktif manapun) |
| `POST /organizations/{id}/invitations` | `agent_id` target | **Backend wajib cek** target berstatus Individual (User Flow: "target sudah Leader/Member lain → disembunyikan") — **DAN backend wajib cek pengirim adalah Leader aktif Organization tsb** (lihat Konflik #1, gap RLS saat ini tidak menegakkan ini) |
| `PUT .../accept` | — | **Wajib** re-check status Individual tepat sebelum commit (Business Rule #7) — API Spec §5A menegaskan eksplisit ini "bukan hanya validasi UI" |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Contoh (API Spec §5A):
```json
POST /api/v1/organizations
{ "organization_name": "Griya Realty Team", "organization_type": "tim" }
201 Created
{ "success": true, "data": { "id": "org_7c1...", "slug": "griya-realty-team", "status": "active", "your_role": "leader" } }
```

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `organizations`, `organization_members`, `organization_invitations` |
| Kolom terkait di modul lain (dikonsumsi, bukan dimiliki di sini) | `listings.organization_id`/`listing_context` (M03), `audit_logs.organization_id` (M09) |
| Index | `idx_organizations_slug` (UNIQUE, partial), `idx_org_members_one_active_per_agent` (**UNIQUE, kunci REQ-M12-003**), `idx_org_invitations_pending_unique` (UNIQUE, kunci REQ-M12-011/012) |
| RLS | `organizations_select_public` (publik penuh); `organizations_insert_own`; `organizations_update_leader` (Leader aktif via join `organization_members`, atau all-scope); `org_members_select` (diri sendiri, sesama member Organization, atau all-scope); `org_members_leader_manage` (Leader aktif, atau diri sendiri untuk keluar, atau all-scope); `org_invitations_select`; `org_invitations_insert` (**GAP, lihat Konflik #1**); `org_invitations_respond` |
| Soft-delete | **`organizations`** termasuk (penerapan prinsip ADR-046 ke tabel baru, dicatat eksplisit ERD sebagai bukan keputusan arsitektur baru); `organization_members`/`organization_invitations` **tidak** (pakai status transition) |
| **Tidak ada INSERT policy eksplisit untuk `organization_members`** | Baris member baru **hanya** dapat dibuat lewat alur `accept` (kemungkinan besar via service role backend dalam satu transaksi dengan update `organization_invitations.status`, bukan INSERT langsung dari client) — **konsisten & aman by design**, bukan gap (mencegah user membuat baris keanggotaan palsu langsung) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M12-Organization` | Root | `organizations` | REQ-M12-001, 002, 006-009, 019 |
| `ENT-M12-OrganizationMember` | Child | `organization_members` | REQ-M12-003, 016 |
| `ENT-M12-OrganizationInvitation` | Child | `organization_invitations` | REQ-M12-010-013 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0007_m12_organization.sql` | **Sudah ditulis** — dibangun **sebelum** M03 (`0008`) karena FK `listings.organization_id` |
| Prasyarat | `0001`, `0003` (`users`) |
| Status eksekusi | **Belum dieksekusi** ke database live |
| **Temuan baru: gap RLS `org_invitations_insert`** | Policy `WITH CHECK (agent_id = auth.uid() OR leader_id = auth.uid())` **tidak memverifikasi** bahwa `auth.uid()` yang mengklaim `leader_id` benar-benar Leader aktif dari `organization_id` yang direferensikan — lihat Bagian 51 Konflik #1 untuk analisis & rekomendasi perbaikan lengkap. |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.13 — Superadmin/Manager/Admin `all`, Agen `own` untuk seluruh 11 permission M12. **Tidak ditemukan ketidaksesuaian arah generalisasi** seperti pola berulang di modul lain (Konflik permission modul ini murni di level RLS/gap keamanan, bukan salah baca dokumentasi Authorization Spec).

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `organizations.organization_type` | Ya | Enum | 4 nilai, murni label |
| `organizations.status` | Ya (default `active`) | Enum | `active`\|`closed` — **tanpa** `pending_review` (self-service, REQ-M12-008) |
| `organization_members.role` | Ya | Enum | `leader`\|`member` |
| `organization_invitations.initiated_by_type` | Ya | Enum | `leader_invite`\|`agent_request` |
| `organization_invitations.status` | Ya (default `pending`) | Enum | 6 nilai |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Agen non-Individual coba buat Organization kedua | 403/422 (**wajib enforced di service layer**, tidak ada constraint DB langsung mencegah INSERT ke `organizations` — hanya `organization_members` yang punya UNIQUE guard) | REQ-M12-003, Acceptance Criteria PRD |
| Race condition: 2 approval bersamaan dari Organization berbeda | Approval kedua gagal, pesan eksplisit (bukan generic error) — API Spec §5A menegaskan ini | Business Rule #7 |
| **Non-Leader kirim `leader_invite` mengklaim dirinya Leader Organization yang bukan miliknya** | **Saat ini: 201 berhasil (RLS tidak menolak)** — seharusnya 403 (Konflik #1) | — |

---

# 29. Notification

| Trigger | Penerima |
|---|---|
| Undangan/permintaan baru | Pihak penerima (agen target/Leader) |
| Approve/reject | Pihak pengaju |
| Bergabung berhasil | Agen ybs: "Anda kini bergabung dengan Organization X" |
| Organization ditutup | Seluruh eks-Member |

---

# 30-31. Activity Log / Audit Trail

**REQ-M12-017 eksplisit**: Organization Activity Log — `GET /organizations/{id}/activity-log`, memakai `ENT-M09-AuditLog` dengan filter `organization_id` (kolom nullable tambahan di `audit_logs`, milik M09, dikonsumsi di sini). Halaman "Activity Timeline publik-internal" — **istilah "publik-internal" ambigu**, kemungkinan berarti terbuka untuk Leader+Member (internal ke Organization) tapi tidak untuk publik luar — RLS `audit_logs` di migration `0013` (M09) sudah mendukung filter Organization member (dicatat di MP-09).

---

# 32-33. External Integration / AI Capability

Tidak ada integrasi eksternal langsung. Tidak ada AI capability (independen penuh dari M13, ditegaskan berulang di PRD/Technical Spec).

---

# 34. Performance Requirement

**Not Defined secara M12-spesifik** di luar index yang sudah dirancang untuk constraint kunci (Bagian 13).

---

# 35. Security Requirement

1. **(Kritis, baru)** Perbaiki `org_invitations_insert` — wajib verifikasi `leader_id` adalah Leader aktif sungguhan dari `organization_id` sebelum insert `leader_invite` diterima (Konflik #1).
2. Race condition re-check **wajib** di service layer tepat sebelum commit — bukan hanya validasi awal request (Business Rule #7).
3. Otorisasi Organization-scoped **independen** dari RBAC platform — dua lapis middleware terpisah (`rbac.middleware` lalu `organization-rbac.middleware`), tidak saling menggantikan.
4. Constraint level-database (`UNIQUE ... WHERE status='active'`) sebagai lapisan pertahanan terakhir terhadap race condition, di atas validasi aplikasi.

---

# 36-38. Accessibility / Responsive / SEO Impact

**Not Defined secara M12-spesifik.** SEO: Halaman Publik Organization (`/organization/[slug]`) **termasuk** kategori halaman publik yang relevan SSR/SSG mengikuti pola profil agen/listing (meski tidak eksplisit didaftarkan di antara 5 halaman wajib SEO Spec §1.1 — kemungkinan gap dokumentasi minor, tidak dianalisis lebih lanjut sebagai Conflict formal karena SEO Spec v1.1 mendahului Modul 12 v1.2).

---

# 39-41. Configuration / Environment Variable / Feature Flag

Tidak ada `system_configs` khusus M12. Tidak ada environment variable baru. `Organization Subscription` adalah kandidat feature flag masa depan (monetisasi OD-11), Out of Scope saat ini.

---

# 42. Acceptance Criteria

Dari PRD Modul 12 (5 poin) — seluruhnya In Scope, lihat Bagian 14-15.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Agen Individual buat Organization dengan 2 field wajib | Langsung `active`, jadi Leader |
| 2 | Agen sudah jadi Member Organization A, coba buat Organization B | Ditolak |
| 3 | 2 Leader approve join-request agen yang sama secara bersamaan (simulasi race condition) | Hanya 1 yang berhasil, yang kedua gagal dengan pesan jelas |
| 4 | Agen accept 1 undangan saat punya 3 `agent_request` pending lain | 1 accepted jadi Member, 3 lainnya otomatis `cancelled`, `leader_invite` pending (jika ada) tidak disentuh |
| 5 | Leader tutup Organization dengan 5 Member aktif | Seluruh Member kembali Individual, seluruh listing Organization jadi Draft Pribadi |
| 6 | **Agen (bukan Leader manapun) kirim `POST /organizations/{id}/invitations` untuk Organization X, mengklaim `leader_id=dirinya`** | **Saat ini: berhasil (201)** — seharusnya 403, wajib diperbaiki sebelum DoD (Konflik #1) |
| 7 | Member keluar sendiri dari Organization | Status `left`, kembali Individual, listing-nya reset Draft |

---

# 44. Edge Case

1. Leader menutup Organization tepat saat ada invitation `pending` — **Not Defined** apakah invitation pending otomatis `cancelled`/`expired`, atau tetap `pending` menunjuk Organization yang sudah `closed`.
2. Agen di-`removed` Leader (bukan keluar sendiri) — alur notifikasi & reset listing **sama seperti keluar sukarela** (Business Rule tidak membedakan), diasumsikan identik.
3. Dua permintaan `agent_request` ke Organization yang sama dari agen yang sama secara bersamaan — UNIQUE constraint `pending` mencegah duplikat, request kedua akan gagal di level constraint (409).

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| **Spoofing `leader_invite`** (Konflik #1) | Agen non-Leader dapat mengirim undangan palsu atas nama Organization manapun ke target manapun — berpotensi social engineering/kebingungan pengguna, meski tidak langsung memberi akses data | **✅ Diperbaiki [2026-08-06]** — `WITH CHECK` dibuat kondisional per `initiated_by_type`, `leader_invite` kini wajib `EXISTS` check keanggotaan Leader aktif, lihat `0007_m12_organization.sql` versi terbaru 🟢 **VERIFIKASI 10 Agustus 2026: TIDAK TERBUKTI — sekarang BENAR-BENAR diperbaiki via `0007_m12_organization-FIXED.sql`.** |
| Dependency ke T3-06 (MP-03) belum diperbaiki | Fitur "Leader kelola listing anggota" (foto/video/amenity) tidak berfungsi penuh meski field utama listing bisa diedit Leader | **✅ Diperbaiki [2026-08-06]** — T3-06 sudah diperbaiki bersamaan (Batch 1), lihat `0008_m03_listing.sql` versi terbaru |
| Race condition re-check tidak diimplementasikan benar (hanya validasi awal, bukan tepat sebelum commit) | 2 Organization berbeda bisa "berebut" 1 agen yang sama, data jadi tidak konsisten meski ada UNIQUE constraint DB sebagai jaring pengaman terakhir | Constraint DB (`idx_org_members_one_active_per_agent`) sudah jadi lapisan pertahanan akhir — risiko diturunkan ke "request kedua gagal dengan error", bukan "data korup", tapi UX tetap perlu pesan jelas |
| Gate governance belum dikonfirmasi | Implementasi kode dimulai prematur tanpa izin eksplisit Owner | Tegaskan status "Belum Terkonfirmasi" di setiap task terkait M12 (lihat Bagian 1) |

---

# 46. Known Limitation

1. ~~**Gap RLS `org_invitations_insert`**~~ — **Diperbaiki [2026-08-06]**, lihat `0007_m12_organization.sql` versi terbaru (T1-04, Issue Register). 🟢 **VERIFIKASI 10 Agustus 2026: sekarang BENAR-BENAR diperbaiki via `0007_m12_organization-FIXED.sql`.**
2. ~~**Ketergantungan pada T3-06 (MP-03)** belum diperbaiki~~ — **Diperbaiki [2026-08-06]**, lihat `0008_m03_listing.sql` versi terbaru (T3-06, Issue Register).
3. **Halaman Publik Organization tidak eksplisit didaftarkan** sebagai salah satu halaman wajib SSR/SSG di SEO Spec v1.1 (mendahului Modul 12).
4. **Istilah "Activity Timeline publik-internal"** (REQ-M12-017) ambigu, kemungkinan berarti internal-Organization saja.
5. **Constraint pencegah Organization kedua** (`organizations` table) tidak ada di level DB — hanya `organization_members` yang punya UNIQUE guard; pencegahan buat-Organization-kedua sepenuhnya bergantung validasi aplikasi.
6. **(Baru, audit v1.1/T4, temuan #22)** Authorization Spec v1.0 §2.13 sebelumnya mencantumkan `PERM-M12-Create-Organization` = `all` untuk Manager/Admin — namun RLS `organizations_insert_own` (`0007`) murni `WITH CHECK (created_by = auth.uid())`, **tanpa** klausa `auth_has_scope_all`, sehingga staf tidak punya jalur insert Organization atas nama agen. **✅ Diperbaiki [2026-08-06]** — `Authorization-Access-Control-Specification-v1.1.md` §2.13 dikoreksi (Manager/Admin: all→none untuk Create-Organization saja; Update/Delete/Manage tetap `all` karena `organizations_update_leader` memang punya bypass staf).

---

# 47. Dependency Checklist

| Item | Status |
|---|---|
| MDM: M12 bergantung M01, M10, M03 | ✅ Terpenuhi — seluruh 3 dependency sudah punya MP |
| MIS: M12 urutan #12, Batch 4 | ✅ Konsisten |
| Migration `0001`, `0003` (prasyarat `0007`) | ✅ Sudah ditulis |
| ERD v1.3 §2.38-2.40 Baseline | ✅ |
| Authorization Spec v1.0 §2.13 Baseline | ✅ |
| ADR-026 (Approved With Notes), ADR-027 (Approved) | ✅ |
| **Gate governance kode (`PROJECT-CONSTITUTION.md` §24 poin 10)** | ✅ **TERBUKA [2026-08-07]** — dikonfirmasi eksplisit Owner, setara status M13 |
| T3-06 (MP-03, RLS child-table Org Leader) | ✅ Diperbaiki [2026-08-06] — lihat `0008_m03_listing.sql` versi terbaru |

**Kesimpulan:** Dependency teknis (MDM/MIS) **seluruhnya terpenuhi** — modul ini secara arsitektur adalah yang **paling matang** dari sisi kedalaman aturan bisnis (race condition, cross-cancellation dirancang presisi). Dengan gate governance kini terbuka [2026-08-07], **M12 berstatus GO penuh, setara M13** — tidak ada syarat tambahan tersisa.

---

# 48. Definition of Ready

- [x] PRD Modul 12 Baseline (v1.2) — paling detail dari seluruh modul.
- [x] ERD §2.38-2.40 Baseline (v1.3).
- [x] Migration `0007` tertulis.
- [x] ADR-026, ADR-027 Approved.
- [x] **Perbaikan RLS `org_invitations_insert`** (Konflik #1) — **Diperbaiki [2026-08-06]**, lihat `0007_m12_organization.sql` versi terbaru. 🟢 **VERIFIKASI 10 Agustus 2026: sekarang BENAR-BENAR diperbaiki via `0007_m12_organization-FIXED.sql`.**
- [x] **Konfirmasi eksplisit Owner: gate kode M12 terbuka** — **Dikonfirmasi [2026-08-07]**, setara status M13. Lihat `CURRENT-PROJECT-STATE.md` rev. 8.
- [x] **T3-06 (MP-03) diperbaiki** — **Diperbaiki [2026-08-06]**, lihat `0008_m03_listing.sql` versi terbaru.

---

# 49. Definition of Done

- [ ] Seluruh Acceptance Criteria (Bagian 42) terverifikasi.
- [ ] Migration `0007` (setelah perbaikan RLS invitation) dieksekusi sukses.
- [ ] Unit test: race condition re-check, cross-cancellation, cooldown 24 jam, UNIQUE constraint 1-agen-1-organization.
- [ ] **Test khusus: non-Leader tidak dapat mengirim `leader_invite` mengklaim Organization manapun** (Test QA #6, gate non-negotiable).
- [ ] E2E test: alur create→invite→accept→dashboard→leave/close penuh (Playwright).
- [ ] Test integrasi dengan M03 (listing Organization-context, termasuk verifikasi T3-06 sudah teratasi).
- [ ] PR lolos CI gate.
- [ ] `CURRENT-PROJECT-STATE.md` diperbarui — termasuk status gate M12 pada saat implementasi dimulai.

---

# 50. Traceability Matrix

| REQ-XXX | ENT-XXX | Endpoint | ADR |
|---|---|---|---|
| REQ-M12-001..009, 019 | `ENT-M12-Organization` | `POST /organizations`, `PUT .../branding`, `GET /organizations/{id}`, `/search` | ADR-026 |
| REQ-M12-003, 016 | `ENT-M12-OrganizationMember` | `DELETE /organization-members/{id}` | ADR-026, ADR-027 |
| REQ-M12-010..013 | `ENT-M12-OrganizationInvitation` | `POST .../invitations`, `/join-requests`, `PUT .../accept`, `/reject` | ADR-026 |
| REQ-M12-014..016 | Konsumsi `ENT-M03-Listing` (`organization_id`, `listing_context`) | — (milik M03) | ADR-027 |
| REQ-M12-017 | Konsumsi `ENT-M09-AuditLog` | `GET .../activity-log` | — |
| REQ-M12-018 | Agregasi lintas modul | `GET .../dashboard` | — |

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | **RLS `org_invitations_insert` (migration `0007`) tidak memverifikasi bahwa `leader_id` yang diklaim adalah Leader aktif sungguhan dari `organization_id` yang direferensikan.** Policy hanya mengecek `WITH CHECK (agent_id = auth.uid() OR leader_id = auth.uid())` — siapa pun authenticated user dapat insert baris `initiated_by_type='leader_invite'` dengan `leader_id=auth.uid()` (dirinya sendiri) untuk `organization_id` **apa pun**, tanpa pernah benar-benar menjadi Leader Organization tsb. Bertentangan dengan REQ-M12-010/011 yang mengasumsikan `leader_invite` hanya dapat diinisiasi oleh Leader sungguhan. | Migration `0007` (Database Schema, prioritas #7) vs REQ-M12-010/011 (PRD), User Flow §12.2 (mengasumsikan hanya Leader yang bisa "Undang Anggota") | **Bug migration nyata** — direkomendasikan perbaikan `WITH CHECK` menjadi kondisional per `initiated_by_type`: untuk `agent_request`, cukup `agent_id=auth.uid()`; untuk `leader_invite`, **wajib tambahan** `EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id=organization_invitations.organization_id AND om.agent_id=auth.uid() AND om.role='leader' AND om.status='active')`. **Dampak:** spoofing undangan palsu atas nama Organization — tidak memberi akses data langsung, tapi berpotensi social engineering dan kebingungan pengguna. **Masuk Issue Register sebagai T1-04.** **Status: 🟢 Benar-benar Diperbaiki [2026-08-10]** (klaim awal "2026-08-06" terbukti regresi saat verifikasi 10 Agustus), `WITH CHECK` sekarang benar-benar kondisional per `initiated_by_type` via `0007_m12_organization-FIXED.sql`. |

---

# 52. Recommendation

1. **Perbaiki RLS `org_invitations_insert` SEBELUM implementasi endpoint invitation dimulai** (Konflik #1) — celah spoofing undangan, meski dampaknya lebih rendah dari T1-02/T1-03, tetap bug keamanan nyata di kode migration.
2. **Konfirmasi eksplisit gate governance M12 ke Owner** sebelum memulai implementasi kode — berbeda dari M13 yang sudah dikonfirmasi terbuka dalam percakapan ini.
3. **Koordinasikan penyelesaian T3-06 (MP-03)** bersamaan dengan implementasi M12 — kedua perbaikan RLS ini saling terkait untuk fitur Organization Leader yang utuh.
4. **Manfaatkan kualitas desain race-condition M12 sebagai referensi** — pola constraint level-database + re-check level-aplikasi di modul ini adalah salah satu implementasi paling matang di seluruh proyek, layak dijadikan acuan pola untuk modul lain yang punya kebutuhan serupa di masa depan.
5. **Update Issue Register konsolidasi (final)** dengan T1-04 — menutup seluruh 13 Module Planning dengan total temuan terkonsolidasi.
6. **Ini adalah Module Planning terakhir dari 13 modul** — rekomendasikan Owner melakukan **satu putaran review Issue Register final** (seluruh Tier 1-3) sebelum Sprint S0 dieksekusi, sesuai alur yang sudah disepakati di awal proses ini.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Modul ini menutup rangkaian 13 Module Planning dengan 1 temuan keamanan baru (gap spoofing invitation) yang ditemukan lewat pemeriksaan langsung RLS migration `0007`, melengkapi total pola sistemik yang sudah terdokumentasi di Issue Register sepanjang proses ini.*
