# MODULE PLANNING
## MP-11 — SEO, Analytics & Tracking
### Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Architect / Solution Architect / Product Manager / Technical Product Owner / Engineering Manager / Technical Lead / Senior Backend Engineer / Senior Frontend Engineer / Senior QA Engineer / Senior Database Architect / DevOps Architect (peran gabungan)
**Tujuan Dokumen:** Acuan resmi implementasi Modul 11 (SEO & Analytics) via Bolt.new maupun developer manual. Tidak berisi kode, tidak berisi UI mockup, tidak berisi sprint.

### Dokumen Acuan & Prioritas
| # | Dokumen | Versi Dipakai |
|---|---|---|
| 1 | Module Implementation Strategy (MIS) | v1.1 |
| 2 | Module Dependency Matrix (MDM) | v1.0 |
| 3 | Engineering Guidelines (`PROJECT-CONSTITUTION.md`) | — |
| 4 | Technical Specification | v1.0 |
| 5 | System Architecture | v1.6 |
| 6 | Technology Decisions | v1.5 |
| 7 | Database Schema (ERD §2.37 + migration `0014`) | ERD v1.3 |
| 8 | API Specification | v1.2 |
| 9 | Functional Specification | v1.0 |
| 10 | UI Specification | v1.0 |
| 11 | ERD | v1.3 |
| 12 | PRD | v1.2 |
| 13 | User Flow | v1.2 |
| *(tambahan)* | Authorization & Access Control Specification | v1.1 *(naik dari v1.0, audit Issue Register Batch 3, 6 Agustus 2026)* |
| *(tambahan)* | Entity Mapping | v1.0 |
| *(tambahan)* | SEO & Analytics Specification | v1.1 (dokumen sumber detail teknis utama) |

---

## Riwayat Versi

> Tabel ini disusun retroaktif pada siklus konsolidasi ini (9-10 Agustus 2026) berdasarkan 2 snapshot yang tersedia — dokumen sebelumnya tidak memiliki tabel Riwayat Versi eksplisit.
>
> **⚠️ Konflik penomoran** (pola sama seperti MP-01 s.d. MP-10): kedua snapshot berlabel **"Versi 1.0" dan tanggal "6 Agustus 2026"** yang identik. Nomor versi publik **dipertahankan "1.0"** — identifier 1.0a/1.0b di bawah semata untuk audit. File final ini setara **1.0b**.

| Versi | Tanggal | Ringkasan Perubahan Utama |
|---|---|---|
| 1.0a | 6 Agu 2026 | Rilis awal — 2 temuan: (1) Authorization Spec §2.12 `View-UrlRedirect` Superadmin-only, padahal RLS mengizinkan akses publik penuh (perlu untuk middleware redirect); (2) konfirmasi tambahan T1-02 (MP-03) — PRD Modul 11 jadi sumber independen keempat yang menuntut listing sold/rented tetap terindeks. |
| 1.0b | 6 Agu 2026 | Temuan #1 **Closed** (audit v1.1/**T4-15**) — Authorization Spec §2.12 dikoreksi jadi seluruh role `all` termasuk publik/anon. Temuan #2 **diklaim** Diperbaiki mengutip status T1-02 dari MP-03 (*"lihat `0008_m03_listing.sql` versi terbaru"*). **Versi terkini** — basis dokumen final di bawah. |

---

## 🟢 Catatan Verifikasi Silang (ditambahkan & diselesaikan 9-10 Agustus 2026, siklus konsolidasi ini)

> **T4-15 TERVERIFIKASI BENAR** — `Authorization-Access-Control-Specification-v1.1-FINAL.md` §2.12 dikonfirmasi memuat `View-UrlRedirect` = seluruh role `all` (termasuk anon), persis klaim.
>
> **🔴 T1-02 (dikutip dari MP-03) TERBUKTI REGRESI** — audit MP-11 ini memicu verifikasi balik ke `0008_m03_listing.sql`, mengungkap klaim "Diperbaiki [2026-08-06]" yang dikutip di sini (dan aslinya di MP-03) **tidak pernah benar-benar dieksekusi**. Migration masih memblokir akses publik ke listing `sold`/`rented`, bertentangan langsung dengan requirement M11 sendiri. **✅ DIPERBAIKI [2026-08-10]** — atas instruksi Owner, `listings_select_public` sekarang benar-benar mengizinkan `status IN ('published','sold','rented')` via `0008_m03_listing-FIXED.sql`. Detail lengkap regresi & resolusi dicatat di file final `MP-03-Listing-Module-Planning-v1.0-FINAL.md` (diperbarui ulang pada tanggal yang sama).
>
> Modul ini menjadi **titik penemuan** regresi kelima & keenam dalam pola sistemik — bukan karena MP-11 sendiri bermasalah, tapi karena mengutip ulang klaim dari MP-03 yang belum pernah diverifikasi independen sebelumnya.

---

# 1. Executive Summary

Modul 11 adalah **modul lintas-halaman tanpa UI sendiri** (dikonfirmasi eksplisit: tidak ada bagian di Functional Specification maupun User Flow untuk M11) — murni backend/build-time yang memastikan seluruh halaman publik (Listing, Profil Agen, Proyek Developer, Homepage, Search) terindeks optimal. Satu-satunya entity database: `url_redirects`. Bergantung M02, M03, M06 (sumber halaman publik yang di-SEO-kan). Migration `0014` **sudah ditulis dan berkualitas tinggi** — memuat trigger otomatis pencatatan redirect saat slug listing/proyek developer berubah, memenuhi REQ-M11-002 di level database tanpa perlu logic aplikasi tambahan. **Konfirmasi silang penting:** PRD Modul 11 sendiri (bukan hanya SEO Spec pendamping) secara eksplisit menyatakan *"Listing berstatus sold/rented tetap tayang... untuk mempertahankan nilai SEO"* — **memperkuat lebih lanjut** temuan T1-02 (MP-03) bahwa RLS `listings_select_public` yang memblokir status tsb adalah bug nyata, kini dikonfirmasi oleh **4 sumber independen** (SEO Spec, Functional Spec M03, PRD Modul 3, dan sekarang PRD Modul 11 sendiri). Go/No-Go: ✅ **GO** *(setelah M02+M03+M06 punya data nyata)*.

---

# 2. Purpose

Menyediakan spesifikasi implementasi lengkap Modul 11 — scope fungsional, kontrak API, aturan bisnis, matriks permission, kriteria selesai — sebagai rujukan tunggal bagi keputusan rendering, structured data, sitemap, dan tracking yang wajib diambil sejak awal (tidak dapat ditambal belakangan).

---

# 3. Scope

- Tabel `url_redirects` (ERD v1.3 §2.37) beserta trigger otomatis & RLS.
- Endpoint sitemap (`/sitemap-index.xml`, `/sitemap-listings.xml`, `/sitemap-agents.xml`, `/sitemap-developer-projects.xml`), `/robots.txt`, `/admin/seo/reindex`, `/admin/config/seo` (API Spec §10).
- Field SEO yang **diperluas** di response `GET /listings/{id}`, `/agents/{id}`, `/developer-projects/{id}` (`slug`, `meta_title`, `meta_description`, `canonical_url`, `structured_data`).
- Strategi rendering SSR/SSG untuk 5 halaman publik wajib.
- Structured data (JSON-LD: `Product`, `Organization`, `BreadcrumbList`, `Person`, `WebSite`+`SearchAction`).
- GTM/GA4 integration (snippet layout, event `generate_lead`), Cookie Consent + Google Consent Mode.
- Core Web Vitals optimization guideline.

---

# 4. Out of Scope

- **Konten halaman itu sendiri** (listing, profil agen, proyek developer) — milik M03/M02/M06; M11 hanya menambahkan lapisan SEO di atasnya (meta tag, structured data, sitemap entry).
- **Konten blog/artikel SEO** — eksplisit "Fase Lanjutan" di SEO Spec §6, tidak termasuk cakupan wajib rilis awal.
- **Kepemilikan akun organisasi GSC/GTM/GA4** — keputusan operasional, bukan teknis (SEO Spec §7, dicatat "Perlu Dikonfirmasi").
- Pembuatan kode, wireframe visual, dan sprint breakdown.

---

# 5. Business Objective

Memastikan platform **terindeks Google secepat dan seakurat mungkin sejak hari pertama rilis** — bukan ditambal belakangan — karena keputusan rendering & struktur URL sangat mahal diubah setelah traffic organik terbentuk (SEO Spec, tujuan dokumen).

---

# 6. Business Value

- SEO adalah kanal akuisisi lead organik berkelanjutan, mengurangi ketergantungan platform pada iklan berbayar (AI Context Pack §1, Nilai Bisnis).
- Structured data meningkatkan peluang rich result di Google — CTR lebih tinggi dari hasil pencarian biasa.
- Redirect otomatis mencegah broken link merusak SEO saat slug berubah.
- Event `generate_lead` di GA4 memberi visibilitas ROI marketing yang terukur.

---

# 7. Dependency Summary (Berdasarkan MDM)

| Arah | Isi |
|---|---|
| **Bergantung Pada** | **M03, M02, M06** (sumber halaman publik yang di-SEO-kan) — MDM Bagian 3, Technical Spec §M11. |
| **Dibutuhkan Oleh** | Tidak ada modul lain yang bergantung M11 secara hard dependency (MDM Dependency Matrix Bagian 3 — M11 bukan Provider). |
| **Circular Dependency** | Tidak ditemukan. |

---

# 8. Module Position (Berdasarkan MIS)

| Dimensi MIS | Nilai |
|---|---|
| Kategori (MIS §2) | **Integration** |
| Urutan Implementasi (MIS §3) | **#11 dari 13** — **namun fondasinya (keputusan rendering) wajib diambil sejak Fase 1/MVP** |
| Layer (MIS §13) | **Layer 4 — Derived/Value-Added** |
| Prioritas (MIS §14) | **P1** — "PRD eksplisit: fondasi SEO tidak boleh ditambal belakangan" (MIS §14, satu-satunya modul non-Foundation dengan justifikasi P1 berbasis larangan penundaan, bukan posisi graph) |
| Batch Paralel (MIS §6) | **Batch 4** — bersama M07, M12 |
| Alasan Posisi (MIS §4) | "Butuh M02, M03, M06 sebagai sumber halaman publik yang di-SEO-kan — tidak mungkin dibangun sebelum ketiganya punya data nyata untuk diuji sitemap/meta tag." |
| Go/No-Go (MIS §15) | ✅ **GO** *(setelah M02+M03+M06 punya data nyata)* — "fondasi wajib ada sejak Fase 1 per PRD, tapi implementasi penuh perlu sumber data nyata untuk diuji" |

> **Catatan penting posisi #11 vs P1:** urutan implementasi **penuh** M11 (sitemap dinamis, reindex API, dsb.) memang wajar di posisi #11 (butuh data nyata dari M02/M03/M06). Namun **keputusan arsitektur rendering (SSR/SSG)** yang mendasarinya **bukan sesuatu yang bisa ditunda** — ini sudah final sejak ADR-021, diterapkan **sejak modul pertama yang punya halaman publik dibangun** (M02, M03, M06 masing-masing sudah wajib SSR/SSG sejak MP-nya sendiri). MP-11 di sini adalah **penyempurnaan lapisan SEO** (sitemap, redirect, structured data terpusat), bukan titik pertama keputusan rendering diambil.

---

# 9. Stakeholder

| Stakeholder | Kepentingan |
|---|---|
| Superadmin | Pengelola konfigurasi GTM/GA4/GSC |
| Tim Marketing (di luar sistem) | Konsumen data GA4 untuk optimasi campaign |
| M02, M03, M06 | Sumber konten yang di-SEO-kan |
| Calon pembeli (Guest) | Penerima manfaat tidak langsung — menemukan listing lewat pencarian Google |

---

# 10. Actor

| Actor | Peran |
|---|---|
| Superadmin | Satu-satunya yang dapat ubah `/admin/config/seo` |
| Superadmin, Manager, Admin | Dapat memicu `/admin/seo/reindex` manual |
| Sistem (trigger DB, backend) | Penulis otomatis `url_redirects` saat slug berubah; pemicu Google Indexing API saat publish/hapus listing |
| Google Search Console/Bot | Konsumen eksternal sitemap/robots.txt/structured data |

---

# 11. User Story

| ID | Story | Sumber |
|---|---|---|
| US-M11-01 | Sebagai tim produk, saya ingin seluruh halaman publik SSR/SSG, agar Googlebot dapat mengindeks konten penuh sejak request pertama. | REQ-M11-001 |
| US-M11-02 | Sebagai agen, saat saya ubah slug listing, saya ingin sistem otomatis buat redirect, agar link lama yang sudah dibagikan tidak menjadi broken link. | REQ-M11-002 |
| US-M11-03 | Sebagai calon pembeli yang membagikan link listing ke WA, saya ingin preview foto & harga muncul otomatis, agar link terlihat menarik. | REQ-M11-003 |
| US-M11-04 | Sebagai tim SEO, saya ingin listing muncul sebagai rich result di Google, agar CTR lebih tinggi. | REQ-M11-004 |
| US-M11-05 | Sebagai Superadmin, saya ingin sitemap ter-update otomatis saat listing baru publish, agar cepat terindeks. | REQ-M11-005 |
| US-M11-06 | Sebagai tim produk, saya ingin halaman privat (dashboard, DBR) tidak muncul di Google, agar data internal tidak bocor lewat pencarian. | REQ-M11-006 |
| US-M11-07 | Sebagai tim marketing, saya ingin event `generate_lead` tercatat di GA4, agar ROI campaign terukur. | REQ-M11-007 |
| US-M11-08 | Sebagai pengunjung, saya ingin melihat cookie consent banner, agar privasi saya dihormati. | REQ-M11-008 |

---

# 12. Functional Requirement

| REQ ID | Requirement | Status Cakupan |
|---|---|---|
| REQ-M11-001 s.d. 009 | Seluruh requirement inti SEO & Analytics | In Scope |

---

# 13. Non Functional Requirement

| Kategori | Requirement (SEO Spec §5) | Target |
|---|---|---|
| LCP | Gambar cover preload, CDN sesuai viewport | < 2.5 detik |
| CLS | Reserve width/height gambar & banner | < 0.1 |
| INP | Debounce filter, lazy-load skrip peta | < 200ms |
| TTFB | SSR/ISR + caching edge | < 600ms |
| Sitemap freshness | Regenerasi otomatis event-driven, bukan batch harian | "beberapa menit setelah publish" (Acceptance Criteria PRD) |

---

# 14. Business Rule

Dari PRD Modul 11:

1. Keputusan rendering SSR/SSG **wajib** diambil sejak awal (Fase 1/MVP) — tidak boleh ditunda.
2. Perubahan `slug` atau penghapusan permanen **wajib** mencatat redirect 301 — tidak boleh langsung 404.
3. **Listing `sold`/`rented` tetap tayang** (tidak dihapus/di-noindex) untuk mempertahankan nilai SEO; hanya `expired` tanpa perpanjangan yang di-noindex setelah 30 hari. — **Sumber independen keempat yang mengonfirmasi T1-02 (MP-03)**, lihat Bagian 51.
4. Data ke GA4 **tidak boleh** menyertakan PII.
5. Konfigurasi GTM/GA4/GSC hanya Superadmin.

---

# 15. Workflow Summary

**Tidak ada alur pengguna (User Flow) untuk M11** — modul ini murni cross-cutting/backend, dikonfirmasi tidak adanya section Modul 11 di `User-Flow-RUMAHAGEN-v1.2.md`. Alur yang relevan sepenuhnya bersifat sistem/event-driven:

**Alur Redirect Otomatis (dari migration `0014`):** Agen/Admin ubah `listings.slug` atau `developer_projects.slug` → trigger database `log_listing_slug_change`/`log_developer_project_slug_change` → INSERT otomatis ke `url_redirects` (`old_path`, `new_path`, `reason='slug_changed'`) → middleware/edge function membaca `url_redirects` saat request masuk ke path lama → 301 redirect ke path baru.

**Alur Sitemap & Indexing (event-driven, ADR-006):** Listing `published`/dihapus → Postgres Trigger/Database Webhook → regenerasi entry sitemap terkait → panggil Google Indexing API untuk URL tsb.

---

# 16. Screen List

**Tidak ada.** M11 **tidak memiliki layar sendiri** (Technical Spec §M11: "Tidak punya layar UI — murni backend/build-time"). Satu-satunya touchpoint UI adalah **field konfigurasi di dalam layar Konfigurasi Sistem milik M09** (`/admin/settings` — GTM Container ID, GA4 Measurement ID, kredensial GSC), bukan layar terpisah milik M11.

---

# 17. Screen Detail

**Tidak relevan** — lihat Bagian 16. Field konfigurasi SEO ditampilkan sebagai bagian form Konfigurasi Sistem M09 (lihat MP-09 Bagian 51 Konflik #1 untuk analisis kepemilikan silang ini).

---

# 18. Navigation Flow

**Tidak relevan** — modul ini tidak memiliki halaman/rute yang dinavigasi pengguna secara langsung. Endpoint sitemap/robots.txt diakses oleh crawler mesin pencari, bukan navigasi UI pengguna.

---

# 19. API Summary

| Endpoint | Fungsi |
|---|---|
| `GET /sitemap-index.xml` | Sitemap induk |
| `GET /sitemap-listings.xml` | Sitemap listing (`published`/`sold`/`rented`) |
| `GET /sitemap-agents.xml` | Sitemap profil agen |
| `GET /sitemap-developer-projects.xml` | Sitemap proyek developer |
| `GET /robots.txt` | Disajikan statis/edge |
| `POST /admin/seo/reindex` | Trigger Google Indexing API manual (juga otomatis sistem) |
| `GET/PUT /admin/config/seo` | Kelola kredensial GTM/GA4/GSC (Superadmin only) |
| `GET /listings/{id}`, `/agents/{id}`, `/developer-projects/{id}` *(diperluas)* | Response menyertakan field SEO (`slug`, `meta_title`, `meta_description`, `canonical_url`, `structured_data`) |

---

# 20. Endpoint Mapping

| Method | Endpoint | Auth (API Spec) | `granted_scope` |
|---|---|---|---|
| GET | `/sitemap-*.xml`, `/robots.txt` | Public | `all` |
| POST | `/admin/seo/reindex` | Superadmin, Manager, Admin | `all` |
| GET/PUT | `/admin/config/seo` | **Superadmin only** | RLS via `system_configs` (milik M09, dikonsumsi di sini) |
| GET | Field SEO di `/listings/{id}` dkk. | Public | `all` — bagian dari response entity masing-masing modul (M02/M03/M06) |

---

# 21. Request Validation

| Endpoint | Field | Validasi |
|---|---|---|
| `PUT /admin/config/seo` | `gtm_container_id`, `ga4_measurement_id`, `gsc_verification_meta` | Wajib format sesuai standar Google (mis. `GTM-XXXXXXX`, `G-XXXXXXXXXX`) — **validasi format spesifik tidak dirinci** di dokumen sumber manapun, Open Issue Bagian 46 |
| — | `meta_title` | ≤ 60 karakter tampil optimal SERP (field DB dilonggarkan 70) |
| — | `meta_description` | ≤ 155-160 karakter |

---

# 22. Response Structure

Field SEO diperluas langsung di response entity terkait (bukan endpoint terpisah) — lihat contoh JSON di Bagian 19/API Spec §10. `structured_data` berisi JSON-LD siap pakai sesuai tipe halaman (`Product` untuk listing, `Person` untuk agen, dst. — SEO Spec §3).

---

# 23. Database Impact

| Aspek | Detail |
|---|---|
| Tabel baru | `url_redirects` |
| Index | `idx_url_redirects_old_path` (UNIQUE) |
| RLS | `url_redirects_select` — **publik penuh** (`anon, authenticated`, `USING (true)`) — disengaja, dipakai middleware redirect untuk seluruh pengunjung tanpa login |
| Trigger | `trg_listings_slug_redirect`, `trg_developer_projects_slug_redirect` — **otomatis mencatat redirect saat slug berubah**, memenuhi REQ-M11-002 di level database |
| **Gap kecil ditemukan** | **Tidak ada trigger serupa untuk `agent_profiles.public_slug`** — jika field ini dapat diubah agen (perlu verifikasi ke MP-02: `public_slug` auto-generate saat registrasi, tidak eksplisit dinyatakan dapat diedit ulang), redirect otomatis untuk perubahan slug profil agen tidak akan tercatat. **Dampak rendah** (public_slug agen jarang berubah, dan MP-02 tidak menyebutnya sebagai field yang di-generate ulang), dicatat sebagai Open Issue minor. |
| Konfigurasi terkait | `gtm_container_id`, `ga4_measurement_id`, `gsc_verification_meta` tersimpan di `system_configs` (tabel milik M09, bukan `url_redirects`) |

---

# 24. Entity Mapping

| ENT ID | Tipe | Tabel Fisik | REQ Terkait |
|---|---|---|---|
| `ENT-M11-UrlRedirect` | Root | `url_redirects` | REQ-M11-002 |

---

# 25. Migration Requirement

| Item | Status |
|---|---|
| `0014_m11_seo.sql` | **Sudah ditulis** — 1 tabel + 2 trigger otomatis |
| Prasyarat | `0008` (`listings`), `0006` (`developer_projects`) — untuk trigger |
| Status eksekusi | **Belum dieksekusi** ke database live |
| **Kualitas migration** | **Baik** — trigger otomatis adalah pendekatan elegan yang memenuhi REQ-M11-002 tanpa bergantung disiplin service layer aplikasi (defense in depth). Satu-satunya catatan adalah gap trigger untuk `agent_profiles` (Bagian 23). |

---

# 26. Permission Matrix

Sumber: Authorization Spec §2.12:

| Permission ID | Entity | Aksi | Superadmin | Manager/Admin/lainnya |
|---|---|---|---|---|
| `PERM-M11-View-UrlRedirect` | `ENT-M11-UrlRedirect` | View | all | none |
| `PERM-M11-Manage-UrlRedirect` | `ENT-M11-UrlRedirect` | Manage | all | none |

> **Catatan:** **Status: ✅ Closed [2026-08-06], audit v1.1/T4-15** — `Authorization-Access-Control-Specification-v1.1.md` §2.12 dikoreksi (View-UrlRedirect: seluruh role→`all`, termasuk publik/anon).

---

# 27. Validation Matrix

| Field | Wajib? | Tipe | Aturan |
|---|---|---|---|
| `url_redirects.old_path` | Ya | VARCHAR(300) | UNIQUE |
| `url_redirects.redirect_type` | Ya (default 301) | SMALLINT | `301`\|`302` |
| `url_redirects.reason` | Tidak | Enum | `slug_changed`\|`listing_deleted`\|`listing_merged`\|`lainnya` |

---

# 28. Error Handling

| Skenario | HTTP Status | Sumber |
|---|---|---|
| Akses URL lama yang sudah di-redirect | 301 → path baru | Middleware baca `url_redirects` |
| Non-Superadmin `PUT /admin/config/seo` | 403 | RLS `system_configs_manage` (M09) |
| URL lama tidak ada di `url_redirects` dan entity juga sudah tidak ada | 404 (standar, bukan tanggung jawab M11 spesifik) | — |

---

# 29-31. Notification / Activity Log / Audit Trail

**Tidak ada notifikasi M11-spesifik.** Perubahan `system_configs` terkait SEO (GTM/GA4/GSC) tercatat `audit_logs` mengikuti pola umum M09 (bukan requirement eksplisit M11 tersendiri).

---

# 32. External Integration

| Layanan | Fungsi |
|---|---|
| Google Search Console | Verifikasi domain, submit sitemap |
| Google Indexing API | Permintaan crawl-ulang cepat |
| Google Tag Manager | Container tag pihak ketiga |
| Google Analytics 4 | Event tracking (`generate_lead`, `view_item`, `search`, dll.) |
| Google Consent Mode | Kepatuhan cookie consent |

---

# 33. AI Capability

**Tidak ada.**

---

# 34. Performance Requirement

Lihat Bagian 13 — Core Web Vitals adalah requirement performa utama modul ini.

---

# 35. Security Requirement

1. Data ke GA4/GTM **tidak boleh** menyertakan PII — hanya event & parameter agregat (`listing_id`, `city`, `price_range_bucket`).
2. Kredensial GTM/GA4/GSC hanya Superadmin yang dapat ubah.
3. `url_redirects` publik-baca **disengaja**, bukan celah — data tidak sensitif.
4. Cookie consent + Google Consent Mode wajib aktif sebelum tracking non-esensial berjalan penuh.

---

# 36-37. Accessibility & Responsive Requirement

**Tidak relevan** — modul ini tidak memiliki komponen UI sendiri.

---

# 38. SEO Impact

**Modul ini ADALAH SEO Impact itu sendiri** — seluruh 9 REQ-M11-XXX secara langsung mendefinisikan strategi SEO platform.

---

# 39. Configuration

`gtm_container_id`, `ga4_measurement_id`, `gsc_verification_meta` — tersimpan di `system_configs` (tabel M09), **bukan** tabel milik M11 sendiri. Lihat MP-09 Bagian 51 Konflik #1 untuk analisis kepemilikan silang M09/M11 ini (sudah diresolusikan: tabel M09, endpoint pengelolaan tanggung jawab implementasi M11).

---

# 40. Environment Variable

**Tidak ada** — kredensial GTM/GA4/GSC disimpan sebagai data (`system_configs`), bukan environment variable, agar dapat diubah tanpa deploy ulang (tujuan eksplisit desain ini, SEO Spec §4.1).

---

# 41. Feature Flag

**Tidak ada feature flag formal.**

---

# 42. Acceptance Criteria

Dari PRD Modul 11 (5 poin) — seluruhnya In Scope, lihat Bagian 15 untuk mekanisme teknis pendukung.

---

# 43. QA Test Scenario

| # | Skenario | Hasil Diharapkan |
|---|---|---|
| 1 | Akses Detail Listing tanpa JavaScript aktif | HTML lengkap tampil (indikator SSR berhasil) |
| 2 | Agen ubah slug listing | Entri baru muncul otomatis di `url_redirects`, akses URL lama → 301 ke URL baru |
| 3 | Listing baru `published` | Muncul di `sitemap-listings.xml` dalam beberapa menit |
| 4 | Akses `/dashboard`, `/admin`, `/calculator/dbr/results` | Tidak muncul di `site:` search Google (verifikasi manual pasca go-live) |
| 5 | Klik CTA WhatsApp | Event `generate_lead` tercatat GA4 DebugView, **tanpa** data PII (nama/HP calon pembeli) |
| 6 | **Listing berubah status ke `sold`** | Halaman tetap dapat diakses publik dengan badge — **bergantung penuh pada resolusi T1-02 (MP-03)**, modul M11 sendiri tidak dapat berfungsi benar sampai bug tsb diperbaiki |
| 7 | Non-Superadmin akses `/admin/config/seo` | 403 |

---

# 44. Edge Case

1. Slug diubah 2x berturut-turut dalam waktu singkat — `url_redirects` akan punya 2 entri terpisah (A→B, B→C), bukan langsung A→C — berpotensi redirect chain 2 hop. **Not Defined** apakah ini dianggap masalah (Google umumnya mentolerir redirect chain pendek, tapi tidak ideal).
2. `agent_profiles.public_slug` berubah (jika memang bisa) — **tidak tercatat** di `url_redirects` (Bagian 23, gap trigger).

---

# 45. Risk Analysis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| **M11 tidak dapat mencapai tujuan intinya jika T1-02 (MP-03) belum diperbaiki** | Listing `sold`/`rented` yang seharusnya tetap terindeks malah 404 — seluruh strategi "pertahankan nilai SEO" (Business Rule PRD Modul 11 poin 3) gagal total, bukan sekadar terdegradasi | **✅ Diperbaiki [2026-08-06]** — T1-02 sudah diperbaiki (Batch 1), lihat `0008_m03_listing.sql` versi terbaru. M11 kini dapat diverifikasi Definition of Done penuh 🟢 **VERIFIKASI 9-10 Agustus 2026: klaim awal TIDAK TERBUKTI — sekarang BENAR-BENAR diperbaiki [2026-08-10] via `0008_m03_listing-FIXED.sql`.** |
| Redirect chain jika slug diubah berkali-kali | SEO value sedikit terdegradasi (bukan patah total, Google masih mengikuti chain pendek) | Rekomendasi: normalisasi redirect ke path asal saat insert baru (cek apakah `new_path` sudah punya redirect masuk, update langsung ke tujuan akhir) — perbaikan opsional, bukan blocking |
| Gap trigger `agent_profiles` slug change | Redirect tidak tercatat jika field ini memang dapat diedit | Verifikasi ke MP-02: apakah `public_slug` benar-benar immutable pasca-generate; jika ya, gap ini tidak relevan |

---

# 46. Known Limitation

1. ~~**Ketergantungan fungsional pada perbaikan T1-02** (MP-03)~~ — **Diperbaiki [2026-08-06]**, lihat `0008_m03_listing.sql` versi terbaru. 🟢 **VERIFIKASI 9-10 Agustus 2026: sekarang BENAR-BENAR diperbaiki [2026-08-10] via `0008_m03_listing-FIXED.sql`.**
2. **Redirect chain** tidak dinormalisasi otomatis.
3. **Gap trigger slug** untuk `agent_profiles` (perlu verifikasi apakah relevan).
4. **Validasi format** `gtm_container_id`/`ga4_measurement_id` tidak dirinci.
5. **Authorization Spec §2.12 lebih restriktif dari kebutuhan fungsional** (`url_redirects` View) — non-blocking, pola sama T4-13.

---

# 47-50. Dependency Checklist / DoR / DoD / Traceability

**Dependency Checklist:** M02 ✅, M03 ✅ (dengan catatan T1-02 belum diperbaiki), M06 ✅ — seluruh dependency modul sudah punya MP.

**Definition of Ready:** PRD/ERD/Migration Baseline ✅. **Rekomendasi kuat: pastikan T1-02 (MP-03) sudah diperbaiki sebelum M11 dianggap Ready untuk verifikasi end-to-end**, meski implementasi kode M11 sendiri dapat dimulai lebih awal.

**Definition of Done:** tambahan khusus — Test QA #6 (listing sold tetap terindeks) **wajib lolos**, dan ini secara langsung bergantung status T1-02.

**Traceability:** 9 REQ-M11-XXX ↔ 1 ENT ↔ 8 endpoint ↔ 2 PERM-M11-XXX ↔ ADR-006, ADR-021.

---

# 51. Conflict Analysis

| # | Konflik/Ambiguitas | Dokumen Terlibat | Resolusi |
|---|---|---|---|
| 1 | **Konfirmasi tambahan untuk T1-02 (MP-03):** PRD Modul 11 Business Rule poin 3 menyatakan eksplisit *"Listing berstatus sold/rented tetap tayang (tidak dihapus/di-noindex) untuk mempertahankan nilai SEO yang sudah terbangun"* — ini adalah **sumber independen keempat** (setelah SEO Spec §1.4, Functional Spec §4.3, dan PRD Modul 3 sendiri) yang menegaskan requirement yang sama, sementara RLS `listings_select_public` (migration `0008`, dianalisis di MP-03) tetap memblokir akses tsb. | PRD v1.2 Modul 11 vs migration `0008` (temuan asal di MP-03) | **Tidak ada resolusi baru diperlukan** — ini memperkuat (bukan menambah) Konflik #1 yang sudah tercatat di MP-03/T1-02. Dicatat di sini untuk menunjukkan bahwa M11 secara fungsional **tidak dapat mencapai Definition of Done** tanpa perbaikan tsb, menjadikan T1-02 lebih mendesak dari sebelumnya. **Status: 🟢 Benar-benar Diperbaiki [2026-08-10]** (klaim awal "2026-08-06" terbukti regresi saat verifikasi 9-10 Agustus — lihat catatan verifikasi di awal dokumen), `listings_select_public` sekarang mengizinkan `published`/`sold`/`rented` via `0008_m03_listing-FIXED.sql`. |
| 2 | Authorization Spec §2.12 mencantumkan `PERM-M11-View-UrlRedirect` = Superadmin-only — namun RLS `url_redirects_select` mengizinkan akses publik penuh (`anon`), yang **memang diperlukan** secara fungsional agar middleware redirect dapat melayani pengunjung tanpa login. | Authorization Spec v1.0 §2.12 vs migration `0014` | **Mengikuti RLS.** **Status: ✅ Closed [2026-08-06], audit v1.1/T4-15** — `Authorization-Access-Control-Specification-v1.1.md` §2.12 dikoreksi (View-UrlRedirect: seluruh role→`all`, termasuk publik/anon). |

---

# 52. Recommendation

1. **Prioritaskan perbaikan T1-02 (MP-03) sebelum M11 dapat dinyatakan selesai** — modul ini adalah bukti konkret dampak nyata bug tsb: 4 dokumen independen (termasuk PRD Modul 11 sendiri) menegaskan requirement yang sama, tapi tidak dapat terpenuhi tanpa perbaikan RLS listing.
2. **Verifikasi apakah `agent_profiles.public_slug` dapat diedit** — jika ya, tambahkan trigger redirect serupa; jika tidak (immutable), gap ini tidak relevan dan dapat ditutup sebagai non-issue.
3. **Pertimbangkan normalisasi redirect chain** sebagai perbaikan kualitas opsional (bukan blocking).
4. **Update Issue Register konsolidasi** — perkuat referensi T1-02 dengan sumber tambahan dari MP-11, tambahkan 1 isu Tier 4 baru (Konflik #2, pola sama T4-13).
5. **Setelah M11 selesai**, lanjutkan ke M12 (Organization) sesuai urutan MIS Bagian 3 urutan #12 — gate sudah terbuka.

---

*Module Planning ini disusun murni berdasarkan dokumen yang diupload — tidak ada requirement yang diubah/ditambah/dihapus, tidak ada perubahan arsitektur/API/skema database. Modul ini secara khusus memperkuat temuan T1-02 dari MP-03 dengan sumber independen keempat (PRD Modul 11 sendiri), menegaskan urgensi perbaikan bug tsb sebelum go-live.*
