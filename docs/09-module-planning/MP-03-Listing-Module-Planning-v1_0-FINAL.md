# MODULE PLANNING
## MP-03 — Manajemen Listing Properti
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 3 (Listing) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.4-2.10 + migration `0008`) | ERD v1.3 |
| 8 | API Specification | v1.2 |
| 9 | Functional Specification | v1.0 |
| 10 | UI Specification | v1.0 |
| 11 | ERD | v1.3 |
| 12 | PRD | v1.2 |
| 13 | User Flow | v1.2 |
| *(tambahan)* | Authorization & Access Control Specification | v1.1 *(naik dari v1.0, audit Issue Register Batch 3, 6 Agustus 2026)* |
| *(tambahan)* | Entity Mapping | v1.0 |
| *(tambahan)* | SEO & Analytics Specification | v1.1 |

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (9 Agustus 2026) berdasarkan 3 snapshot yang tersedia + 1 paket perubahan tambahan (P6) — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **⚠️ Konflik penomoran** (pola sama seperti MP-01/MP-02/SYSTEM-ARCHITECTURE/AI Development Blueprint): ketiga snapshot historis berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik, namun merepresentasikan 3 keadaan berbeda secara kronologis-progresif. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b/1.0c di bawah semata untuk audit.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 3 Konflik terbuka: (1) RLS `listings_select_public` memblokir akses publik ke listing `sold`/`rented` (bertentangan SEO Spec, ditandai "wajib diperbaiki"); (2) RLS child-table (foto/video/amenity) tidak konsisten dengan parent table soal Organization Leader; (3) Authorization Spec vs RLS `amenities_manage` (Manager/Admin bisa vs tidak bisa manage Amenity), perlu klarifikasi Owner. |
| 1.0b | 6 Agu 2026 | Konflik #1 **diklaim** Diperbaiki — migration `0008` diklaim diubah (`status IN ('published','sold','rented')`). Konflik #2 **diklaim** Diperbaiki — klausa Org Leader diklaim ditambahkan ke 3 RLS policy child table. Konflik #3 **Resolved** (OD-22 Opsi A) — Superadmin-only dipertahankan, Authorization Spec §2.4 dikoreksi (Manager/Admin: all→none). |

---

## 🟢 Catatan Verifikasi Silang (ditambahkan & diselesaikan 10 Agustus 2026, siklus lanjutan)

> **REGRESI KELIMA & KEENAM TERKONFIRMASI** — ditemukan saat audit MP-11 mengutip ulang klaim T1-02, memicu verifikasi balik terhadap `0008_m03_listing.sql` yang **belum pernah saya cek independen** saat audit MP-03 awal (9 Agustus). Kedua klaim "Diperbaiki [2026-08-06]" untuk Konflik #1 dan Konflik #2 **TIDAK TERBUKTI**:
> - **Konflik #1** — `listings_select_public` masih `status = 'published'` saja, sold/rented tetap 404 untuk publik.
> - **Konflik #2** — `listing_photos_manage`/`listing_videos_manage`/`listing_amenities_manage` masih tanpa klausa Organization Leader sama sekali.
>
> Juga dicatat sebagai "Fixed" secara keliru di `CHANGELOG-v0.7.1.md`/`v0.7.2.md` — regresi ini lolos dari governance tracking selama ~4 hari.
>
> **✅ DIPERBAIKI [2026-08-10]** — atas instruksi Owner, kedua policy benar-benar diperbaiki di `0008_m03_listing-FIXED.sql`: (1) `listings_select_public` sekarang `status IN ('published','sold','rented')`; (2) ketiga child-table policy sekarang memuat klausa Org Leader (pola sama `listings_update_own_or_org_leader`). **Status kedua konflik sekarang benar-benar Resolved.** File migration terbaru harus menggantikan `0008_m03_listing.sql` di project.
| 1.0c | 6 Agu 2026 | Referensi tabel Dokumen Acuan diperbarui — Authorization Spec naik ke v1.1 (audit Issue Register Batch 3). |
| **1.0c + P6** | 9 Agu 2026 | **Digabung dalam siklus konsolidasi ini.** Perubahan dari `P6-Hasil-MP03-ModulePlanning-DuplicateDetection.md` (deteksi duplikat foto, `ADR-047`/`OD-25`): +1 User Story (`US-M03-15`), +1 Functional Requirement (`REQ-M03-016`, exact hash + perceptual hash, blocking/warning berjenjang), +2 Edge Case (foto yang sudah dihapus dari listing lain; false-positive perceptual hash), +1 baris Risk Analysis (kalibrasi threshold Hamming Distance belum diuji data produksi). **Versi terkini** — basis dokumen final di bawah. |

---

# 1. Executive Summary

Modul 3 adalah **aggregate root inti transaksi** platform — 8 entity (`listings`, `listing_photos`, `listing_videos`, `amenities`, `listing_amenities`, `listing_price_history`, `listing_leads`, `listing_views`), 15 REQ (terbanyak di seluruh proyek), dan **hub dependency tertinggi** (MDM/MIS: bergantung M01, M02, M06, M10; dibutuhkan M07, M08, M11, M12). Migration `0008` **sudah ditulis lengkap** (terbesar, 198 baris) dan sudah cukup canggih — mendukung kepemilikan ganda personal/Organization (RLS `listings_update_own_or_org_leader`), FTS+trigram search (ADR-005), late-binding FK ke `agent_reviews`. **Ditemukan 1 konflik paling signifikan dari seluruh MP yang sudah dibuat**: RLS `listings_select_public` **hanya** mengizinkan status `published` untuk publik — padahal SEO Specification eksplisit mensyaratkan listing `sold`/`rented` **tetap dapat diakses publik** dengan `index,follow` aktif untuk menjaga nilai SEO. Ini adalah **bug migration nyata** yang bertentangan langsung dengan requirement SEO yang sudah Baseline (lihat Bagian 51). Go/No-Go: ✅ **GO** *(setelah M02+M06 selesai, sesuai MIS)* — namun **Tier 1 Issue baru wajib diperbaiki sebelum modul dianggap selesai**.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 3 sebagai rujukan tunggal — scope fungsional, kontrak API, aturan bisnis, matriks permission, kriteria selesai — termasuk resolusi konflik RLS-vs-SEO yang ditemukan lewat pemeriksaan silang migration dan SEO Specification.

---

# 3. Scope

- Tabel `listings`, `listing_photos`, `listing_videos`, `amenities`, `listing_amenities`, `listing_price_history`, `listing_leads`, `listing_views` (ERD v1.3 §2.4-2.10) beserta RLS.
- Endpoint CRUD listing, media, status, price-history, auto-generate dari proyek developer (API Spec §2).
- Endpoint pencarian & filter (`/properties/search`, `/properties/map-bounds`, `/properties/nearby`, `/properties/autocomplete`, `/properties/{id}/similar` — API Spec §3).
- Layar: Form Listing (wizard 6-step), Listing Saya, Detail Listing Publik, Pencarian & Filter, Moderasi Listing (UI Spec §6).
- Search engine PostgreSQL FTS + `pg_trgm` (ADR-005 Fase 1).
- Integrasi Maps (Leaflet+OSM+LocationIQ/Geoapify, ADR-008) untuk pin lokasi & Map View.
- Lifecycle status listing penuh (7 status: `draft`→`pending_review`→`published`→`sold`/`rented`/`expired`/`rejected`).
- Pencatatan lead event dari CTA WhatsApp.
- Dukungan kepemilikan ganda personal/Organization (`organization_id`, `listing_context` — **field & RLS dikonsumsi**, logic bisnis Organization penuh milik M12).

---

# 4. Out of Scope

- **Logic bisnis penuh Organization** (invite/join/leave, dashboard Organization) — milik M12; M03 hanya **mengonsumsi** kolom `organization_id`/`listing_context` dan RLS Leader-access yang sudah disiapkan di migration `0008`.
- **Detail proyek developer & klaim** — milik M06; M03 hanya **mengonsumsi** `developer_project_id` untuk listing kategori Primary.
- **Kalkulator DBR** — tombol "Cek Kelayakan KPR" di Detail Listing hanya **memicu** M07 dengan harga auto-terisi, tidak menghitung apa pun di sini.
- **Regenerasi sitemap & structured data JSON-LD** — dipicu event-driven ke M11, implementasi teknis sitemap/JSON-LD milik M11.
- **Migrasi ke Typesense** — di luar cakupan Fase 1, terjadwal otomatis saat ambang tercapai (ADR-005 Tahap 6).
- **Pembatasan maksimal listing aktif per agen** (REQ-M03-015) — eksplisit "opsional, fase lanjutan" di PRD, tidak ada kolom/mekanisme terkait di skema saat ini.
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Menjadi mesin transaksi inti platform — memungkinkan agen memasarkan properti dengan data terstruktur & lengkap, memastikan calon pembeli dapat menemukan listing relevan lewat pencarian multi-filter, dan menghubungkan minat (lead) langsung ke agen lewat WhatsApp tanpa friksi.

---

# 6. Business Value

- Listing terstruktur (bukan freetext) memungkinkan filter presisi — meningkatkan relevansi hasil pencarian bagi calon pembeli.
- Moderasi sebelum tayang menjaga kualitas & mencegah listing fraud/tidak lengkap.
- Riwayat harga & lead tracking mendukung analitik performa agen (Dashboard M08).
- Listing adalah aset SEO utama platform — 1 dari 5 halaman wajib SSR/SSG.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M01, M02 (WA default), Referensi Wilayah (shared kernel), M06 (listing Primary), M10** — MDM Bagian 3: baris M03 bertanda ● di kolom M01/M02/M06/M10. |
| **Dibutuhkan Oleh** | **M07** (opsional, auto-fill harga), **M08** (agregasi dashboard), **M11** (SEO, sumber halaman publik), **M12** (kepemilikan ganda) — MDM Dependency Matrix Bagian 3. |
| **Hub Dependency Tertinggi** | MDM Bagian 5 (Critical Path): "M03 adalah **hub** paling kritis — 5 dari 13 modul bergantung padanya baik langsung maupun tidak langsung. Keterlambatan M03 berdampak paling luas dibanding modul manapun selain M01/M10." |
| **Circular Dependency (M02↔M03)** | Diperiksa MDM Bagian 11 — valid secara arsitektural, bukan circular sungguhan (2 relasi baca arah berbeda: M03→M02 untuk kontak WA saat create, M02→M03 untuk statistik read-only). |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Core Business** |
| Urutan Implementasi (MIS §3) | **#8 dari 13** |
| Layer (MIS §13) | **Layer 3 — Transactional Core** |
| Prioritas (MIS §14) | **P1 — Hub Kritis** |
| Batch Paralel (MIS §6) | **Batch 3** — bersama M05, namun MIS merekomendasikan **fokus tunggal** ke M03 jika kapasitas terbatas (§12: "M03 jauh lebih berat... jika kapasitas terbatas, prioritaskan M03 murni") |
| Kompleksitas (MIS §11.2) | **Tertinggi di seluruh proyek** — "Search (FTS+pg_trgm), geocoding (MapsProvider abstraction + fallback 3 lapis), lifecycle status, media upload, moderasi — 4 sub-sistem teknis dalam satu modul" |
| Risiko (MIS §11.1) | **Tertinggi** — "Hub dependency terbanyak; perubahan skema di sini beriak ke M07, M08, M11, M12" |
| Go/No-Go (MIS §15) | ✅ **GO** *(setelah M02+M06 selesai)* — "jangan mulai sebelum prasyarat urutan 4-5 selesai, risiko rework tertinggi jika dipaksakan lebih awal" |

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Agen | Pemilik & pengelola listing |
| Superadmin, Manager, Admin | Moderator listing |
| Organization Leader (M12) | Pengelola listing berkonteks Organization anggotanya |
| Calon pembeli (Guest/Buyer) | Konsumen utama — pencarian & kontak agen |
| M07, M08, M11, M12 | Konsumen data listing |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Agen | CRUD listing miliknya (`own`) |
| Organization Leader | Update listing anggota Organization-nya (RLS khusus, konsumsi M12) |
| Superadmin, Manager, Admin | Moderasi & akses penuh (`all`) |
| Guest | Browsing, klik CTA WhatsApp (tanpa akun) |
| Buyer | Browsing, klik CTA, tracking lead miliknya |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M03-01 | Sebagai Agen, saya ingin memilih kategori Primary/Secondary saat buat listing, agar sistem tahu alur data yang sesuai. | REQ-M03-001 |
| US-M03-02 | Sebagai Agen, saya ingin mengisi form listing lengkap dengan lokasi cascading, agar data terstruktur dan akurat. | REQ-M03-002 |
| US-M03-03 | Sebagai Agen, saat pilih Primary saya ingin menautkan ke proyek developer, agar data resmi otomatis terisi. | REQ-M03-003 |
| US-M03-04 | Sebagai calon pembeli, saya ingin klik tombol WhatsApp dengan pesan otomatis, agar mudah menghubungi agen. | REQ-M03-004 |
| US-M03-05 | Sebagai Agen, saya ingin tahu berapa lead yang masuk dari listing saya, agar saya bisa ukur performa. | REQ-M03-005 |
| US-M03-06 | Sebagai calon pembeli, saya ingin memfilter listing dengan berbagai kriteria sekaligus, agar hasil sesuai kebutuhan saya. | REQ-M03-006 |
| US-M03-07 | Sebagai calon pembeli, saya ingin melihat listing dalam mode peta, agar saya paham sebaran lokasi. | REQ-M03-007 |
| US-M03-08 | Sebagai Agen, saya ingin listing saya melalui alur draft→review→published, agar kualitas terjaga sebelum tayang. | REQ-M03-008 |
| US-M03-09 | Sebagai Agen, saya hanya ingin bisa CRUD listing milik saya sendiri, agar data saya aman dari agen lain. | REQ-M03-009 |
| US-M03-10 | Sebagai Admin, saya ingin listing otomatis expired setelah X hari, agar katalog tetap relevan. | REQ-M03-010 |
| US-M03-11 | Sebagai Admin, saya ingin memoderasi listing sebelum tayang, agar kualitas & legalitas terjaga. | REQ-M03-011 |
| US-M03-12 | Sebagai Agen, saya ingin riwayat perubahan harga tersimpan, agar transparan ke calon pembeli. | REQ-M03-012 |
| US-M03-13 | Sebagai sistem, saya perlu validasi field wajib (min 3 foto, dst) sebelum listing bisa direview, agar kualitas data terjaga. | REQ-M03-013 |
| US-M03-14 | Sebagai Agen, saya wajib memilih lokasi dari data wilayah resmi, agar data lokasi dapat diagregasi akurat. | REQ-M03-014 |
| US-M03-15 | Sebagai sistem, saya perlu mendeteksi foto duplikat antar-listing milik agen yang sama, agar kualitas katalog terjaga dan kecurangan re-post foto identik dicegah. | REQ-M03-016 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M03-001 s.d. 014 | Seluruh requirement inti listing | In Scope |
| REQ-M03-015 | Pembatasan maksimal listing aktif per agen | **Out of Scope** — eksplisit opsional fase lanjutan |
| REQ-M03-016 | Deteksi kemiripan foto antar-listing milik agen yang sama (exact hash + perceptual hash) — blocking jika identik (100%), warning non-blocking jika mirip 90-99%, tidak di-flag jika <90% | **In Scope** — `ADR-047` |

---

# 13. Non Functional Requirement

| Kategori | Requirement | Sumber |
|---|---|---|
| Search engine | PostgreSQL FTS + `pg_trgm` (Fase 1) — `idx_listings_fts` (GIN, kolom `title`+`description`, bahasa `indonesian`), `idx_listings_area_keyword_trgm` | ADR-005, migration `0008` |
| Index performa filter | `idx_listings_search` (`status, category, transaction_type, city_id, price`) — kombinasi filter paling umum | Migration `0008` |
| Rate limiting Autocomplete | 20/menit/IP | API Spec §0.5, ADR-008 |
| Rate limiting Geocode | 10/menit/IP | API Spec §0.5, ADR-008 |
| Rendering | SSR/SSG/ISR wajib untuk Search & Detail Listing (2 dari 5 halaman wajib) | SEO Spec §1.1 |
| Core Web Vitals | LCP<2.5s, CLS<0.1, INP<200ms, TTFB<600ms | SEO Spec §5 |

---

# 14. Business Rule

Dari PRD Modul 3 (14 poin, dirangkum):

1. Ownership per-agen ketat — agen lain tidak dapat edit listing agen lain.
2. Auto-expired setelah X hari (dikonfigurasi admin, `system_configs`).
3. Listing Primary tertaut developer: harga/spesifikasi resmi **read-only** bagi Agen; field lain (deskripsi tambahan, foto) tetap bisa disesuaikan.
4. Listing Secondary: sepenuhnya tanggung jawab data agen, termasuk pernyataan bebas sengketa.
5. Nomor WhatsApp aktif **wajib** sebelum status `Published`.
6. Approval Admin wajib sebelum tayang publik.
7. Riwayat perubahan harga tersimpan.
8. Moderasi oleh Superadmin/Manager/Admin (`all`), Agen hanya `own`, tidak ada akses moderasi.
9. Lokasi (Provinsi/Kota/Kecamatan) wajib dari database referensi wilayah, cascading; `area_keyword` freetext pelengkap maks 20 karakter.

---

# 15. Workflow Summary

**Alur 3.1 — Agen Membuat Listing (User Flow):** Login → Dashboard → "+ Tambah Listing" → pilih Kategori (Primary/Secondary) → jika Primary: opsi tautkan proyek developer (Ya→auto-fill field terkunci; Tidak→input manual tetap Primary) → pilih Tujuan Transaksi → isi form lengkap → upload foto (min 3)+video opsional, pilih cover → konfirmasi/edit WA CTA → Preview → validasi (field kosong→kembali ke form) → "Simpan Draft" atau "Submit Review" → jika Submit: status `Menunggu Review` → notifikasi Admin → Admin moderasi → Reject (alasan→notifikasi agen→revisi→submit ulang) atau Approve → status `Published` → tayang publik.

**Alur 3.2 — Agen Kelola Listing Aktif:** Buka "Listing Saya" → pilih listing → Edit (field harga/spek Primary tertaut: terkunci) / Perpanjang masa tayang (reset expired) / Ubah status manual Sold/Rented (off dari katalog **pencarian**, tercatat riwayat closing ke Profil Agen) / Nonaktifkan/Hapus (konfirmasi) / Lihat statistik.

**Alur 3.3 — Publik Cari & Detail:** Buka Katalog → filter+sort → toggle List/Map → hasil (kosong→saran ubah filter) → klik card → Detail (galeri, deskripsi, spek, peta, legalitas, profil agen ringkas) → klik "Chat via WhatsApp" → catat lead event → buka `wa.me` dengan template.

---

# 16. Screen List

| Kode Layar | Nama | Template (UI Spec §6) | Prioritas Wireframe |
|---|---|---|---|
| SCR-M03-01 | Form Listing | D (wizard 6-step) | ✅ Wireframe §5.1 |
| SCR-M03-02 | Listing Saya | C (tabel/card hybrid) | — |
| SCR-M03-03 | Detail Listing Publik | B | — |
| SCR-M03-04 | Pencarian & Filter | A (+ toggle List/Map) | — |
| SCR-M03-05 | Moderasi Listing | F | — |

---

# 17. Screen Detail

### SCR-M03-01 — Form Listing (`/dashboard/listings/new`, `/dashboard/listings/[id]/edit`)
- **Template:** D, wizard 6-step (mengikuti pengelompokan field PRD 3.2: Informasi Dasar → Lokasi → Harga → Deskripsi → Spesifikasi → Media/Legalitas/CTA).
- **Komponen:** `ListingForm` (Smart, orkestrasi React Hook Form + Zod), `RegionCascadeSelect` (Smart, 3 `Select` cascading), `ListingMap` (Presentational, wrapper Leaflet).
- **Validasi submit-for-review:** min 3 foto, judul, lokasi, harga, status legalitas, nomor WA (REQ-M03-013).
- **Field terkunci (Primary tertaut developer):** harga, spesifikasi resmi — read-only, styling visual berbeda dari field editable.

### SCR-M03-02 — Listing Saya (`/dashboard/listings`)
- **Template:** C. Card di mobile, table di desktop (hybrid responsif eksplisit dari UI Spec, berbeda dari mayoritas modul lain yang "Not Defined").
- **Aksi per baris:** Edit, Perpanjang, Ubah Status, Nonaktifkan/Hapus, Lihat Statistik.
- **State kosong:** CTA besar "+ Tambah Listing Pertama Anda".

### SCR-M03-03 — Detail Listing Publik (`/listing/[slug]`)
- **Template:** B. Komponen `ListingGallery` (lightbox), `ListingMap`.
- **Aksi:** "Chat via WhatsApp" (catat lead→redirect `wa.me`), "Cek Kelayakan KPR" (buka M07 auto-terisi).
- **Non-published:** banner "sudah tidak tersedia" + listing serupa — **lihat Bagian 51 Konflik #1 untuk nuansa penting status `sold`/`rented` vs `expired`**.

### SCR-M03-04 — Pencarian & Filter (`/listings`)
- **Template:** A + toggle List/Map View (peta full-width alternatif).
- **State kosong:** "Tidak ditemukan" + saran longgarkan filter.

### SCR-M03-05 — Moderasi Listing (`/admin/listings`)
- **Template:** F.
- **Aksi:** Setujui/Tolak (alasan wajib) per listing `pending_review`.

---

# 18. Navigation Flow

```
/dashboard/listings/new (wizard 6-step) → Preview → Simpan Draft | Submit Review
     └─ Submit → status pending_review → (async) Admin approve/reject
           ├─ Approve → published → tayang di /listings & /listing/[slug]
           └─ Reject → rejected + alasan → agen edit → submit ulang

/listings (katalog) → filter/sort/toggle Map → /listing/[slug] (detail)
     └─ "Chat via WhatsApp" → catat lead → wa.me (keluar sistem)
     └─ "Cek Kelayakan KPR" → /calculator/dbr?price={auto-fill} (M07)

/dashboard/listings (Listing Saya) → Edit/Perpanjang/Ubah Status/Hapus/Statistik
```
Sumber: User Flow §3.1-3.3; Functional Spec §4.3.

---

# 19. API Summary

14 endpoint CRUD/moderasi (API Spec §2) + 5 endpoint pencarian (API Spec §3):

| Endpoint | Fungsi |
|---|---|
| `POST /listings` | Buat listing baru |
| `GET /listings/{id}` | Detail (increment `view_count`) |
| `PUT /listings/{id}` | Update |
| `PATCH /listings/{id}/status` | Ubah status |
| `DELETE /listings/{id}` | Soft-delete |
| `POST /listings/{id}/media` | Upload foto/video |
| `DELETE /listings/{id}/media/{media_id}` | Hapus media |
| `PUT /listings/{id}/media/{media_id}/set-cover` | Set cover |
| `GET /listings/{id}/price-history` | Riwayat harga |
| `POST /listings/from-project/{project_id}` | Auto-generate dari proyek developer |
| `GET /agents/me/listings` | Listing milik sendiri |
| `GET /admin/listings/pending` | Antrean moderasi |
| `PUT /admin/listings/{id}/approve` | Approve |
| `PUT /admin/listings/{id}/reject` | Reject |
| `GET /properties/search` | Pencarian multi-filter |
| `GET /properties/map-bounds` | Pencarian geospasial |
| `GET /properties/nearby` | Pencarian by GPS |
| `GET /properties/autocomplete` | Saran lokasi/keyword |
| `GET /properties/{id}/similar` | Rekomendasi serupa |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth | `granted_scope` |
|---|---|---|---|
| POST | `/listings` | Agen | `own` (`agent_id=auth.uid()`, RLS `listings_insert_own`) |
| GET | `/listings/{id}`, `/properties/*` | Public | `all` publik hanya `status='published'` — **lihat Konflik #1** |
| PUT | `/listings/{id}` | Agen (pemilik), Org Leader, Superadmin/Manager/Admin | `own` / Leader-scope / `all` |
| PATCH | `/listings/{id}/status` | idem | idem |
| DELETE | `/listings/{id}` | idem | idem |
| POST/DELETE | `/listings/{id}/media*` | Agen (pemilik) **saja** — **tidak termasuk Org Leader** | `own` — lihat Bagian 51 Konflik #2 |
| GET | `/listings/{id}/price-history` | Agen (pemilik), Superadmin/Manager/Admin | `own`/`all` |
| GET | `/admin/listings/pending`, `PUT .../approve`, `.../reject` | Superadmin, Manager, Admin | `all` |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `POST /listings` | `category`, `transaction_type`, `property_type` | Enum wajib |
| | `province_id`/`city_id`/`district_id` | Wajib, FK cascading — bukan freetext |
| | `area_keyword` | Opsional, maks 20 karakter |
| | `price` | Wajib, DECIMAL |
| | `whatsapp_number` | Wajib (NOT NULL skema) |
| Submit-for-review | Field wajib | Judul, lokasi, harga, min 3 foto, status legalitas, WA — divalidasi **sebelum** `status` boleh pindah ke `pending_review` (bukan saat `draft`, REQ-M03-013) |
| `PUT /listings/{id}` (Primary tertaut) | `price`, spesifikasi resmi | **Read-only bagi Agen** — validasi server wajib menolak percobaan override via API langsung, tidak cukup hanya UI disabled |

---

# 22. Response Structure

Mengikuti envelope standar API Spec §0.2. Response `GET /listings/{id}` menyertakan `meta_title`/`meta_description` (auto-generate dari template jika kosong, sesuai SEO Spec §2.1) — logic generate **dieksekusi di M03** (kolom ada di `listings`), namun **template string persisnya** didefinisikan SEO Spec, bukan diulang di sini (cross-reference, bukan duplikasi).

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `listings`, `listing_photos`, `listing_videos`, `amenities`, `listing_amenities`, `listing_price_history`, `listing_leads`, `listing_views` |
| Index | `idx_listings_search`, `idx_listings_slug` (UNIQUE), `idx_listings_agent`, `idx_listings_fts` (GIN, FTS Indonesia), `idx_listings_area_keyword_trgm` (GIN trigram), `idx_listing_leads_dashboard`, `idx_listing_leads_agent` |
| RLS | `listings_select_public` (**hanya `published`** — lihat Konflik #1), `listings_select_own` (pemilik + Org member + all-scope), `listings_insert_own`, `listings_update_own_or_org_leader` (mendukung Org Leader — **tapi tidak konsisten dengan RLS child table**, Konflik #2); `listing_photos_manage`/`listing_videos_manage`/`listing_amenities_manage` (**hanya** `agent_id` asli + all-scope, **tanpa** Org Leader); `amenities_manage` (**Superadmin-only**, dikonfirmasi final — OD-22 Resolved); `lph` tanpa policy INSERT untuk `authenticated` (backend/service-role only, konsisten pola `audit_logs`); `listing_leads_insert_public`/`listing_views_insert_public` (anon boleh insert, tanpa login) |
| Soft-delete | **Hanya `listings`** termasuk 8 tabel wajib; 7 tabel anak lainnya tidak |
| FK late-binding **keluar** modul | `agent_reviews.listing_lead_id` diselesaikan **di sini** (`0008`) — bukan di `0005` (M02) seperti salah tertulis di komentar `0005` (sudah dicatat di MP-02 T4-08/Issue Register) |
| FK bergantung migration lain | `developer_project_id → developer_projects` (M06, `0006`), `organization_id → organizations` (M12, `0007`) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M03-Listing` | Root | `listings` | REQ-M03-001..015 |
| `ENT-M03-ListingPhoto` | Child | `listing_photos` | REQ-M03-002 |
| `ENT-M03-ListingVideo` | Child | `listing_videos` | REQ-M03-002 |
| `ENT-M03-Amenity` | Root (reference) | `amenities` | REQ-M03-002 |
| `ENT-M03-ListingAmenity` | Association | `listing_amenities` | REQ-M03-002 |
| `ENT-M03-ListingPriceHistory` | Child | `listing_price_history` | REQ-M03-012 |
| `ENT-M03-ListingLead` | Child | `listing_leads` | REQ-M03-004, 005 |
| `ENT-M03-ListingView` | Child (log) | `listing_views` | REQ-M03-006 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0008_m03_listing.sql` | **Sudah ditulis** — 198 baris, migration terbesar |
| Prasyarat | `0001`, `0003` (`users`), `0004` (`ref_*`), `0006` (`developer_projects`), `0007` (`organizations`) — **rantai dependency migration terpanjang di seluruh proyek** |
| Status eksekusi | **Belum dieksekusi** ke database live |
| **Temuan kritis** | RLS `listings_select_public` perlu diperbaiki (Konflik #1); `listing_photos_manage`/`listing_videos_manage`/`listing_amenities_manage` perlu ditambah klausa Org Leader agar konsisten `listings_update_own_or_org_leader` (Konflik #2) |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.4 (26 baris PERM-M03-XXX, ringkasan):

| Entity | Superadmin/Manager/Admin | Agent | Buyer |
|---|---|---|---|
| `Listing`, `ListingPhoto`, `ListingVideo`, `ListingAmenity` | `all` | `own` | — |
| `Amenity` (master) | `all` (tertulis Authorization Spec) | — | — |
| `ListingPriceHistory` | `all` | `own` (view) | — |
| `ListingLead` | `all` | `own` | `own` (create/view) |
| `ListingView` | `all` | `own` (view) | — |
| `RefProvince/City/District/Village` | `all` | — | — |

> **`Amenity` Manage RLS `amenities_manage` (`0008`) tetap Superadmin-only.** **✅ Resolved [2026-08-06], OD-22 Opsi A** — Owner memilih pertahankan Superadmin-only (default lebih aman). `Authorization-Access-Control-Specification-v1.0.md` §2.4 dikoreksi agar sesuai RLS aktual (Manager/Admin diubah dari `all` menjadi `none`). Tidak ada perubahan RLS.

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `listings.province_id/city_id/district_id` | Ya | UUID | FK cascading wajib, bukan freetext |
| `listings.area_keyword` | Tidak | VARCHAR(20) | Maks 20 karakter |
| `listings.whatsapp_number` | Ya | VARCHAR(20) | NOT NULL — wajib sebelum `published` |
| `listings.status` | Ya (default `draft`) | Enum | 7 nilai — lihat Bagian 23 |
| `listing_photos` per listing | Min 3 (untuk submit review) | — | Divalidasi di service layer, **bukan** DB constraint (skema tidak punya `CHECK COUNT`) |
| `listings.dispute_free_declared` | Ya (default false) | BOOLEAN | Checkbox pernyataan agen |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Agen edit listing agen lain | 403/404 | RLS `listings_update_own_or_org_leader` |
| Submit review dengan foto <3 | 400/422 | REQ-M03-013 |
| Update field harga listing Primary tertaut (bypass UI) | 403 (validasi server wajib) | PRD Business Rule #3 |
| **Publik akses listing `sold`/`rented` via URL langsung** | **Saat ini: 404 (RLS memblokir)** — seharusnya 200 dengan badge, lihat Konflik #1 | SEO Spec §1.4 |
| Rate limit Autocomplete/Geocode terlampaui | 429 | ADR-008 |

---

# 29. Notification

| Trigger | Penerima |
|---|---|
| Listing baru submit review | Admin |
| Listing approved/rejected | Agen ybs |
| Listing mendekati expired | Agen ybs (job terjadwal, Vercel Cron) |
| Lead baru masuk | Agen ybs (opsional, konsisten M08) |

---

# 30-31. Activity Log / Audit Trail

Perubahan status (approve/reject), penghapusan listing oleh Admin — dicatat `audit_logs` (M09). `listing_price_history` **adalah** audit trail khusus harga milik M03 sendiri (bukan generic `audit_logs`).

---

# 32. External Integration

| Layanan | Fungsi |
|---|---|
| LocationIQ (Primary) / Geoapify (failover) | Geocoding alamat→lat/long |
| OpenStreetMap tiles | Rendering peta (Leaflet, tanpa API key) |
| Supabase Storage | Foto/video listing (bucket publik) |

---

# 33. AI Capability

**Tidak ada.**

---

# 34. Performance Requirement

Lihat Bagian 13 — Core Web Vitals, index FTS/trigram, rate limiting Maps.

---

# 35. Security Requirement

1. Ownership `agent_id` hard rule — ditegakkan RLS + service layer ganda.
2. Field harga/spesifikasi Primary tertaut — read-only enforcement **wajib server-side**, tidak cukup UI disabled.
3. `listing_leads`/`listing_views` insert publik (`anon`) — permukaan serangan spam; tidak ada rate limit eksplisit di level tabel ini selain rate limit umum endpoint (Open Issue).
4. API key Maps (`LOCATIONIQ_API_KEY`/`GEOAPIFY_API_KEY`) server-side only.

---

# 36-37. Accessibility & Responsive Requirement

**Sebagian Defined** — SCR-M03-02 (Listing Saya) eksplisit "card di mobile, table di desktop" (satu-satunya modul dengan spesifikasi responsif eksplisit sejauh ini). Layar lain: **Not Defined** secara rinci.

---

# 38. SEO Impact

**Paling relevan di seluruh proyek.** Search & Detail Listing = 2 dari 5 halaman wajib SSR/SSG. Structured data `Product`+`offers` (SEO Spec §3), `availability` otomatis `SoldOut` saat status `sold`/`rented` — **mensyaratkan halaman tetap ada & terindeks**, inilah akar Konflik #1.

---

# 39-41. Configuration / Environment Variable / Feature Flag

`system_configs`: masa expired listing (hari). Env: `LOCATIONIQ_API_KEY`, `GEOAPIFY_API_KEY` (shared M06). Tidak ada feature flag formal.

---

# 42. Acceptance Criteria

Dari PRD Modul 3 (5 poin) — lihat Bagian 14/15 untuk detail, seluruhnya In Scope.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Agen buat listing, submit dengan 2 foto | Ditolak, minta minimal 3 foto |
| 2 | Agen A coba edit listing Agen B | 403/404 |
| 3 | Listing Primary tertaut, Agen coba ubah `price` via API langsung | Ditolak (read-only enforcement server) |
| 4 | **Guest akses `/listing/[slug]` untuk listing berstatus `sold`** | **Saat ini: gagal/404** (RLS) — seharusnya 200 dengan badge "Terjual" (Konflik #1, wajib diperbaiki) |
| 5 | Filter kombinasi kategori+kota+range harga | Hasil sesuai AND logic seluruh filter |
| 6 | Org Leader edit listing anggota Organization-nya | Berhasil (RLS `listings_update_own_or_org_leader`) |
| 7 | **Org Leader upload foto ke listing anggota Organization-nya (bukan miliknya sendiri)** | **Saat ini: 403** (RLS child table tidak dukung Leader) — inkonsisten dengan test #6 (Konflik #2) |
| 8 | Manager coba tambah amenity baru ke master list | **403 (final, by design)** — RLS Superadmin-only dikonfirmasi Owner (OD-22 Resolved, Opsi A) |

---

# 44. Edge Case

1. Listing Primary tertaut proyek yang kemudian dihapus/`inactive` di M06 — **Not Defined** dampak ke listing turunan.
2. Agen keluar dari Organization sambil listing Organization sedang `pending_review` — interaksi dengan alur M12 (REQ-M12-015: turun ke `draft`) perlu diverifikasi lintas modul saat M12 dibangun.
3. Listing `expired` lalu diperpanjang — apakah kembali ke `published` langsung atau perlu moderasi ulang? **Not Defined** eksplisit.
4. Agen upload ulang foto yang sudah pernah dihapus dari listing lain — apakah tetap terhitung sebagai duplikat? **Ya** — pengecekan `ADR-047` berdasarkan foto yang masih melekat pada listing berstatus `published`/`pending_review` saat ini, bukan riwayat foto yang sudah dihapus dari listing manapun. Jika foto sumber sudah dihapus (baris `listing_photos` tidak ada lagi), otomatis tidak lagi jadi basis perbandingan — bukan gap, ini konsekuensi langsung dari desain "cek terhadap listing aktif", bukan "cek terhadap seluruh riwayat foto yang pernah ada".
5. Dua foto berbeda secara visual tapi kebetulan menghasilkan Hamming Distance rendah (false-positive perceptual hash) — berpotensi memicu warning non-blocking meski bukan duplikat sungguhan. **Not Defined** secara kuantitatif seberapa sering ini terjadi pada data foto properti nyata (denah rumah tipe sama, misalnya, punya risiko lebih tinggi menghasilkan hash mirip meski itu properti berbeda) — dicatat sebagai risiko yang perlu dipantau pasca-launch, bukan diasumsikan dapat diabaikan (lihat §45 Risk Analysis, baris baru).

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| **RLS `listings_select_public` memblokir listing sold/rented dari publik** (Konflik #1) | **Pelanggaran langsung requirement SEO Baseline** — kehilangan nilai SEO terbangun, `availability:SoldOut` structured data tidak pernah bisa dirender karena halaman 404 duluan | ~~**Wajib** diperbaiki sebelum modul dianggap selesai~~ 🟢 **DIPERBAIKI [2026-08-10]** — sempat diklaim fixed 6 Agustus tapi terbukti regresi saat verifikasi 9-10 Agustus; sekarang benar-benar diperbaiki via `0008_m03_listing-FIXED.sql` |
| RLS child table (photo/video/amenity) tidak konsisten dengan Org Leader access di parent table | Fitur Organization Leader edit listing anggota jadi setengah-jalan (bisa edit field utama, tidak bisa kelola foto) | Tambah klausa Org Leader ke 3 RLS policy child table, sebelum M12 diaktifkan penuh |
| Amenity management lebih ketat dari dokumentasi (Konflik #3) | Manager/Admin tidak bisa tambah amenity baru | **✅ Diperbaiki [2026-08-06]** — **✅ Resolved [2026-08-06], OD-22 Opsi A** — Owner memilih pertahankan Superadmin-only (default lebih aman). `Authorization-Access-Control-Specification-v1.0.md` §2.4 dikoreksi agar sesuai RLS aktual (Manager/Admin diubah dari `all` menjadi `none`). Tidak ada perubahan RLS. |
| False-positive/false-negative perceptual hash (`ADR-047`) — foto berbeda ter-flag mirip, atau foto identik lolos deteksi karena kompresi ekstrem mengubah hash signifikan | UX terganggu (warning tidak relevan mengganggu alur submit agen) pada false-positive; tujuan fitur gagal tercapai pada false-negative | Threshold Hamming Distance (≤6 untuk warning, =0 untuk blocking) dikalibrasi dari asumsi umum 64-bit perceptual hash, **bukan** hasil uji terhadap data foto properti nyata proyek ini — `ADR-047` Future Review eksplisit menandai ini untuk ditinjau ulang setelah data produksi tersedia. Sampai saat itu, sifat non-blocking untuk kasus 90-99% membatasi dampak false-positive (submit tetap berhasil, hanya diberi warning) |

---

# 46. Known Limitation

Lihat Bagian 51 untuk 3 konflik utama. Tambahan: field lokasi `ref_villages` disiapkan tapi belum dipakai `listings` (form hanya sampai Kecamatan, ERD v1.3 §2.36 catatan eksplisit) — bukan bug, keputusan desain sengaja.

---

# 47-50. Dependency Checklist / DoR / DoD / Traceability

**Dependency Checklist:** MDM (M01,M02,M06,M10) — ✅ seluruhnya sudah punya MP. MIS urutan #8, Batch 3 — ✅ konsisten, direkomendasikan fokus tunggal.

**Definition of Ready:** PRD/ERD/Migration/Authorization Spec Baseline ✅; ~~3 konflik RLS wajib diperbaiki sebelum dianggap Ready penuh~~ — 🟢 **[2026-08-10] Ketiga konflik sekarang benar-benar Resolved** (Konflik #1 & #2 sempat regresi dokumentasi-vs-implementasi, terverifikasi & diperbaiki via `0008_m03_listing-FIXED.sql`; Konflik #3 sudah Resolved sejak 6 Agustus, OD-22).

**Definition of Done:** tambahan khusus modul ini — test QA #4 dan #7 (Bagian 43) **wajib lolos** sebagai gate non-negotiable, mengingat dampaknya ke SEO (aset bisnis utama) dan konsistensi fitur Organization.

**Traceability:** 15 REQ-M03-XXX ↔ 8 ENT-M03-XXX ↔ 19 endpoint ↔ 26 PERM-M03-XXX ↔ ADR-001/005/008 — dipetakan penuh di Bagian 12, 24, 19-20, 26.

---

# 51. Conflict Analysis

| # | Konflik | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | **RLS `listings_select_public` (migration `0008`) hanya mengizinkan `status='published'`** untuk akses publik (`anon`/non-owner `authenticated`) — listing berstatus `sold`/`rented` menjadi **sepenuhnya tidak dapat diakses** publik (RLS mengembalikan kosong/404). Namun **`SEO-Analytics-Specification-v1.1.md` §1.4 eksplisit mensyaratkan**: *"`sold`/`rented`: Halaman tetap dapat diakses, `index,follow` tetap aktif, badge 'Terjual/Tersewa' ditampilkan"* — dan §3 (Structured Data) menyatakan `availability` berubah jadi `SoldOut`, yang **mensyaratkan halaman tetap dapat di-render** untuk menampilkan status tsb. Functional Spec §4.3 juga menyebut listing non-published tampil "banner tidak tersedia" (bukan 404). | Migration `0008` (Database Schema, prioritas #7) vs SEO Spec v1.1 §1.4/§3 (dokumen tambahan, namun berisi requirement Baseline yang jelas), Functional Spec §4.3 | **Ini adalah bug migration nyata, bukan ambiguitas dokumentasi** — SEO Spec, Functional Spec, dan logika bisnis (listing terjual tetap punya nilai SEO) semuanya konsisten menuntut akses tetap terbuka; hanya migration `0008` yang menyimpang. **Wajib diperbaiki**: `listings_select_public` perlu diubah menjadi `USING (status IN ('published','sold','rented') AND deleted_at IS NULL)`, dengan penanganan `expired` mengikuti kebijakan noindex-tapi-tetap-akses terpisah (SEO Spec §1.4: noindex setelah 30 hari, bukan diblokir RLS). **Masuk sebagai Tier 1 baru di Issue Register konsolidasi** (kode migration nyata, bukan dokumen naratif). **Status: Diperbaiki [2026-08-06], lihat `0008_m03_listing.sql` versi terbaru** (`listings_select_public` diubah menjadi `USING (status IN ('published','sold','rented') AND deleted_at IS NULL)`; penanganan `expired` noindex-tapi-tetap-akses tetap belum diimplementasikan, di luar scope perbaikan Batch 1). 🟢 **VERIFIKASI 9-10 Agustus 2026: klaim TIDAK TERBUKTI saat dicek (migration masih `status='published'` saja) — sekarang BENAR-BENAR diperbaiki via `0008_m03_listing-FIXED.sql`. Status Resolved terverifikasi.** |
| 2 | RLS `listings_update_own_or_org_leader` (parent table `listings`) **mendukung** Organization Leader mengedit listing anggota Organization-nya — namun RLS `listing_photos_manage`, `listing_videos_manage`, `listing_amenities_manage` (3 child table) **hanya** memeriksa `agent_id` pemilik asli atau `all`-scope, **tidak ada** klausa Organization Leader sama sekali. | Migration `0008` (internal, parent vs child table tidak konsisten) | Org Leader dapat mengubah field utama listing (harga, deskripsi, dsb.) tapi **tidak dapat** mengelola foto/video/amenity listing anggotanya — fitur "kelola listing Organization" jadi setengah-berfungsi. Direkomendasikan tambah klausa Org Leader yang sama ke 3 policy child table sebelum M12 diaktifkan penuh — dicatat sebagai prasyarat teknis untuk MP-12 nanti, bukan diubah sepihak di sini. **Status: Diperbaiki [2026-08-06], lihat `0008_m03_listing.sql` versi terbaru** (klausa Organization Leader — pola sama `listings_update_own_or_org_leader` — ditambahkan ke `listing_photos_manage`, `listing_videos_manage`, `listing_amenities_manage`). 🟢 **VERIFIKASI 9-10 Agustus 2026: klaim TIDAK TERBUKTI saat dicek (ketiga policy masih tanpa klausa Org Leader) — sekarang BENAR-BENAR diperbaiki via `0008_m03_listing-FIXED.sql`. Status Resolved terverifikasi.** |
| 3 | Authorization Spec §2.4 mencantumkan `PERM-M03-Manage-Amenity` = `all` untuk Superadmin **dan** Manager **dan** Admin — namun RLS `amenities_manage` (migration `0008`) **hanya** mengizinkan `auth_is_superadmin()` (fungsi khusus Superadmin, bukan `auth_has_scope_all()` yang mencakup Manager/Admin juga). | Authorization Spec v1.0 §2.4 vs migration `0008` | **Berbeda arah dari pola "generalisasi berlebih" di modul lain** — di sini migration justru **lebih ketat** dari dokumentasi, bukan lebih longgar. Karena mengelola master data amenity adalah aksi jarang & berdampak sistemik (dipakai lintas seluruh listing), pembatasan ke Superadmin-only **secara keamanan lebih aman**, kemungkinan keputusan implementasi yang sengaja lebih konservatif. Diformalkan sebagai **OD-22**. **Status: **✅ Resolved [2026-08-06], OD-22 Opsi A** — Owner memilih pertahankan Superadmin-only (default lebih aman). `Authorization-Access-Control-Specification-v1.0.md` §2.4 dikoreksi agar sesuai RLS aktual (Manager/Admin diubah dari `all` menjadi `none`). Tidak ada perubahan RLS.** |

---

# 52. Recommendation

1. **Perbaiki RLS `listings_select_public` SEBELUM modul ini dianggap selesai** (Konflik #1) — ini bug paling berdampak bisnis dari seluruh MP yang sudah dibuat sejauh ini, langsung melanggar requirement SEO Baseline. Masukkan sebagai **Tier 1** di Issue Register konsolidasi.
2. **Tambahkan konsistensi Org Leader ke RLS child table** (Konflik #2) sebagai prasyarat teknis sebelum M12 (Organization) diaktifkan penuh — catat sebagai dependency silang MP-03→MP-12.
3. ~~Klarifikasi Owner untuk kebijakan Amenity management (Konflik #3)~~ — **✅ Resolved [2026-08-06], OD-22 Opsi A** — Owner memilih pertahankan Superadmin-only (default lebih aman). `Authorization-Access-Control-Specification-v1.0.md` §2.4 dikoreksi agar sesuai RLS aktual (Manager/Admin diubah dari `all` menjadi `none`). Tidak ada perubahan RLS.
4. **M03 wajib fokus tunggal**, tidak diparalelkan dengan M05 meski sama-sama Batch 3 MIS — kompleksitas & risikonya tertinggi di seluruh proyek.
5. **Update Issue Register konsolidasi** dengan 3 temuan baru ini (T1-02 baru untuk Konflik #1, tambahan Tier 3 untuk Konflik #2/#3).
6. **Setelah M03 selesai**, lanjutkan ke M05 (Kalender Event) sesuai urutan MIS Bagian 3 urutan #9.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Konflik #1 (RLS vs SEO Spec) adalah temuan bug migration paling signifikan secara bisnis dari seluruh MP yang sudah disusun — ditemukan lewat pemeriksaan silang langsung antara migration `0008` dan SEO Specification, bukan diasumsikan.*
