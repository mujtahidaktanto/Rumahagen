# MODULE DEPENDENCY MATRIX (MDM)
## Platform Web RUMAHAGEN

**Versi:** 1.0 (Dokumen Baru)
**Tanggal:** 6 Agustus 2026
**Disusun sebagai:** CTO / Enterprise Solution Architect / Domain Architect / Software Architect / Technical Lead / Senior Backend Architect / Senior Frontend Architect (peran gabungan)
**Tujuan:** Acuan resmi implementasi seluruh modul — mengidentifikasi dependency antar modul (bukan task development, bukan kode, bukan UI, bukan sprint).

### Dokumen Acuan & Urutan Prioritas
| # | Dokumen | Versi Dipakai | Peran dalam MDM |
|---|---|---|---|
| 1 | Engineering Guidelines | `PROJECT-CONSTITUTION.md` | Konvensi arsitektur, layering, larangan teknis |
| 2 | Technology Decisions | dikutip via `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §4 (rujukan `technology-decisions.md` v1.5) | Stack per layer & status ADR |
| 3 | System Architecture | `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` (v1.6, file kanonik hasil konsolidasi 9 Agustus 2026) | **Sumber utama tabel dependency antar modul** (§5) |
| 4 | Technical Specification | `Technical-Specification-...v1.0.md` | Technical brief per modul (cross-check dependency) |
| 5 | Database Schema (fisik) | ERD v1.3 §2A (digabung migration fisik) | Entity & FK per modul |
| 6 | ERD | `ERD-Skema-Database-...v1.3.md` | Struktur relasi & shared kernel |
| 7 | API Specification | `API-Specification-...v1.2.md` | Endpoint group & external service integration |
| 8 | PRD | `PRD-RUMAHAGEN-v1.2.md` | Cakupan modul, prioritas bisnis, requirement index |
| 9 | User Flow | `User-Flow-...v1.2.md` | Validasi arah interaksi lintas modul |

> **Catatan metodologi:** Karena `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5 ("Tabel Dependency Antar Modul") adalah dokumen prioritas tertinggi yang secara eksplisit memuat matriks dependency, tabel tersebut dijadikan **rujukan utama** arah dependency di seluruh dokumen ini. `Technical-Specification.md` dipakai sebagai validasi silang per modul. Perbedaan/redaksi ambigu di antara keduanya dicatat di Bagian 10 — **Conflict Analysis**, bukan diselesaikan sepihak.

---

## Riwayat Versi

> Tabel ini disusun pada siklus konsolidasi ini (10 Agustus 2026). Hanya **1 versi** diupload untuk audit ini — tidak ada snapshot historis lain untuk dibandingkan, sehingga tabel ini berisi 1 baris saja.

| Versi | Tanggal | Ringkasan |
|---|---|---|
| 1.0 | 6 Agu 2026 | Rilis awal (satu-satunya versi yang diupload untuk audit ini) — matriks dependency 13 modul, disusun berdasarkan `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5 sebagai rujukan utama. |

> **✅ Catatan referensi usang — DIPERBAIKI [2026-08-10]:** tabel Dokumen Acuan sebelumnya merujuk `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` sebagai **"v1.6, upload `__8_`"** — kutipan nomor upload dari siklus sebelum konsolidasi 9 Agustus 2026. Sesuai rekomendasi yang sudah dicatat di `SYSTEM-ARCHITECTURE-Consolidation-Supporting-Deliverables.md` §4, kutipan di atas **sekarang sudah diperbarui** merujuk nama file kanonik `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` (nilai versi tetap "1.6", tidak berubah).

---

# 1. MODULE CATALOG

## 1.1 Bounded Context — Modul Bisnis (dari PRD v1.2, 13 modul resmi)

| Kode | Nama Modul | Prioritas (PRD) | Fase Roadmap | Jumlah REQ |
|---|---|---|---|---|
| **M01** | Registrasi & Autentikasi Agen | Must Have | Fase 1 (MVP) | 8 |
| **M02** | Profil Agen | Must Have | Fase 1 (MVP) | 7 |
| **M03** | Manajemen Listing Properti | Must Have | Fase 1 (MVP) | 15 |
| **M04** | Learning Center | Must Have | Fase 3 | 6 |
| **M05** | Kalender Event | Should Have | Fase 3 | 5 |
| **M06** | Direktori Kerjasama Developer | Must Have | Fase 2 | 6 |
| **M07** | Sistem Scoring DBR (Kalkulator KPR) | Must Have | Fase 2 | 6 |
| **M08** | Dashboard & Notifikasi | Should Have | Fase 4 (dasar dapat lebih awal) | 5 |
| **M09** | Admin Panel / CMS | Must Have | Fase 1 (MVP, dasar) | 6 |
| **M10** | Manajemen Role & Hak Akses (RBAC) | Must Have | Fase 1 (MVP, dasar) | 10 |
| **M11** | SEO, Analytics & Tracking | Must Have | Fase 1 (MVP, fondasi) | 9 |
| **M12** | Organization Management System | Should Have | Fase 2 lanjutan (baru v1.2) | 19 |
| **M13** | AI Assistant Integration (BYOK) | Should Have | Fase 2 lanjutan (baru v1.2) | 12 |

## 1.2 Shared Kernel / Infrastructure Component (bukan bounded context berdiri sendiri)

| Komponen | Klasifikasi | Kepemilikan | Dipakai Oleh |
|---|---|---|---|
| **Referensi Wilayah** (`ref_provinces/cities/districts/villages`) | Shared kernel data referensi (Entity Mapping §2) | M03 (pendefinisi awal) | M03, M06 |
| **`rate_limit_log`** | Tabel infrastruktur (bukan entity domain, ERD v1.3 §4) | Cross-cutting (ADR-018) | Seluruh modul dengan endpoint publik/sensitif |
| **`geocode_cache`** | Tabel infrastruktur cache (ADR-008) | Cross-cutting Maps | M03, M06 |
| **`audit_logs`** | Tabel cross-cutting (M09) | M09 | M01, M02, M03, M10, M12 (aksi sensitif) |

## 1.3 Di Luar Cakupan Aktif (disebut dokumen, bukan modul resmi bernomor)

| Item | Status | Sumber |
|---|---|---|
| Payment Gateway (Midtrans/Xendit — membership premium agen) | **Fase Lanjutan, non-MVP**, placeholder endpoint saja | API Spec §9.3 |
| Communication & Chat API (chat in-app) | **[FASE LANJUTAN / NON-MVP]** | API Spec §5 |

> Sesuai aturan "jangan membuat modul baru jika tidak ada di dokumen", kedua item ini **tidak** diberi kode M-XX dan **tidak** dimasukkan ke Dependency Matrix inti (Bagian 3) — hanya dicatat di Bagian 7 (External Dependency Matrix) sebagai future dependency.

---

# 2. MODULE DESCRIPTION

> Format tiap modul: Business Responsibility · Database Dependency · API Dependency · Service Dependency · UI Dependency · External Service Dependency · Authentication Dependency · Authorization Dependency · Notification Dependency · Search Dependency · Payment Dependency · AI Dependency · Queue Dependency · Storage Dependency.
> Tanda **"—"** = tidak ada dependency pada kategori tersebut (bukan gap dokumentasi).

## M01 — Registrasi & Autentikasi Agen
| Dimensi | Detail |
|---|---|
| Business Responsibility | Identitas seluruh jenis akun (agent, buyer, internal roles) & manajemen sesi login. Aggregate root RBAC-side: penerbitan `role_id` saat registrasi. |
| Database Dependency | `users`, `agent_verification_documents` (Entity Mapping M01) |
| API Dependency | `POST /auth/register`, `/auth/verify-otp`, `/auth/login`, `/auth/oauth/google`, `/auth/refresh`, `/auth/logout(-all)`, `/auth/forgot-password`, `/auth/reset-password` |
| Service Dependency | M10 (RBAC — penerbitan `role_id` saat registrasi) |
| UI Dependency | `app/(auth)/*` — login, register, verify-otp, forgot/reset password |
| External Service Dependency | Supabase Auth, Google OAuth2 (verifikasi `id_token` server-side) |
| Authentication Dependency | Modul ini **adalah** sumber autentikasi — tidak bergantung modul lain untuk fungsi ini |
| Authorization Dependency | M10 (RBAC) — role/permission dicek ulang tiap request, tidak disimpan statis di token |
| Notification Dependency | M08 (in-app + Resend email untuk OTP, status approval) |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | Job asinkron notifikasi approval (Vercel Cron/Postgres Trigger, ADR-006) — tidak sinkron di request path |
| Storage Dependency | Supabase Storage bucket privat `agent-verification-documents` (KTP/NPWP, terenkripsi at-rest) |

## M02 — Profil Agen
| Dimensi | Detail |
|---|---|
| Business Responsibility | Kartu nama digital publik/privat agen — bio, spesialisasi, statistik, badge, review. |
| Database Dependency | `agent_profiles`, `agent_reviews` |
| API Dependency | `GET/PUT /users/profile`, `GET /agents/{id}`, `POST /agents/{id}/reviews`, `PUT /admin/agent-reviews/{id}/approve` |
| Service Dependency | M01 (identitas), M04 (badge sertifikasi, shared kernel read-only), M03 (statistik listing terjual/tersewa, denormalisasi) |
| UI Dependency | Halaman publik profil agen (SSR/SSG), form edit profil di `(dashboard)` |
| External Service Dependency | — |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 — Agen `own`; moderasi review Admin/Manager/Superadmin `all`; Buyer hanya `Create` review (butuh bukti `listing_leads`) |
| Notification Dependency | M08 — notifikasi hasil moderasi review |
| Search Dependency | Tidak menjalankan full-text search sendiri (profil ditemukan via M03/listing) |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | — |
| Storage Dependency | Foto profil — bucket publik (mengikuti pola `listing-photos`, CDN) |

## M03 — Manajemen Listing Properti
| Dimensi | Detail |
|---|---|
| Business Responsibility | Aggregate root inti transaksi — CRUD listing, lifecycle status, pencarian publik, lead capture. |
| Database Dependency | `listings` (+ `organization_id`/`listing_context`/`listing_origin` — ERD v1.3), `listing_photos`, `listing_videos`, `amenities`, `listing_amenities`, `listing_price_history`, `listing_leads`, `listing_views` |
| API Dependency | `POST/GET/PUT /listings`, `POST /listings/{id}/media`, `GET /properties/search`, `GET /properties/autocomplete`, `POST /listings/{id}/cta-click`, `PUT /admin/listings/{id}/approve` |
| Service Dependency | M01, M02 (WA default), Referensi Wilayah (shared kernel), M06 (listing kategori Primary via `developer_project_id`), M10 (moderasi), M12 (kepemilikan ganda personal/organization) |
| UI Dependency | `app/(public)/` search & detail listing (SSR/SSG), `app/(dashboard)/` form CRUD listing agen, moderasi di `(admin)` |
| External Service Dependency | LocationIQ (primary geocoding), Geoapify (failover), OpenStreetMap tiles (Leaflet, tanpa API key) |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 (Agen `own`; Superadmin/Manager/Admin `all` moderasi; Guest/Buyer `View` publik) + M12 (lapisan Organization-scoped, khusus listing berkonteks Organization) |
| Notification Dependency | M08 — approval status, listing akan expired, lead baru |
| Search Dependency | **PostgreSQL Full-Text Search + `pg_trgm`** langsung pada kolom `search_vector` (generated column + index GIN) — Fase 1; migrasi terjadwal ke Typesense Fase 2 (ADR-005) |
| Payment Dependency | — (di luar cakupan aktif) |
| AI Dependency | — |
| Queue Dependency | Vercel Cron (scan listing stale >90 hari); Postgres Trigger/Webhook (counter `cta_click_count`, regenerasi sitemap saat `published` → M11) |
| Storage Dependency | Supabase Storage bucket publik `listing-photos`/`listing-videos` (CDN); cache geocoding di `geocode_cache` |

## M04 — Learning Center
| Dimensi | Detail |
|---|---|
| Business Responsibility | Portal edukasi & sertifikasi gratis agen — kursus, kuis, sertifikat otomatis. |
| Database Dependency | `courses`, `course_lessons`, `quizzes`, `quiz_questions`, `quiz_options`, `enrollments`, `quiz_attempts`, `certificates` |
| API Dependency | CRUD `/admin/courses`, `POST /courses/{id}/enroll`, `POST /courses/{id}/quiz/submit`, `GET /agents/me/certificates` |
| Service Dependency | M01 (Agen/Instructor) |
| UI Dependency | `app/(dashboard)/` katalog kursus, video/PDF/kuis, progress tracking |
| External Service Dependency | — (hosting materi via Storage) |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 — Instructor `own` (kursusnya); Admin/Manager/Superadmin `all`; Agen `own` (progress/sertifikat sendiri) |
| Notification Dependency | M08 — sertifikat baru terbit |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | — |
| Storage Dependency | Materi kursus (video/PDF) — bucket publik/CDN mengikuti pola storage umum |

## M05 — Kalender Event
| Dimensi | Detail |
|---|---|
| Business Responsibility | Manajemen event training, launching proyek, open house, gathering. |
| Database Dependency | `events`, `event_registrations` |
| API Dependency | CRUD `/events`, `POST /events/{id}/rsvp` |
| Service Dependency | M01, M04 (event = kelas live), M06 (event launching proyek developer) |
| UI Dependency | Kalender publik/dashboard, form RSVP |
| External Service Dependency | — |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 — Admin/Manager/Superadmin `all`; Developer Partner `own` (pengajuan event); Agen `own` (RSVP) |
| Notification Dependency | M08 — reminder event H-1 |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | **Vercel Cron Jobs** (reminder H-1/H-1 jam, ADR-006) |
| Storage Dependency | — |

## M06 — Direktori Kerjasama Developer
| Dimensi | Detail |
|---|---|
| Business Responsibility | Katalog proyek developer untuk dipasarkan agen; sumber listing kategori Primary. |
| Database Dependency | `developer_partners`, `developer_projects`, `developer_project_media`, `agent_project_claims` |
| API Dependency | `GET /developer-projects`, `POST /developer-projects/{id}/claim`, CRUD `/admin/developer-projects` |
| Service Dependency | M01, Referensi Wilayah (`city_id`, shared kernel), M10 (CRUD data resmi terbatas Admin+) |
| UI Dependency | Katalog publik proyek (SSR/SSG), form klaim proyek agen, admin CRUD |
| External Service Dependency | LocationIQ/Geoapify (peta lokasi proyek) |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 — Admin/Manager/Superadmin `all` (CRUD data resmi); Developer Partner `own`; Agen `own` (klaim) |
| Notification Dependency | M08 — update proyek developer ke agen yang mengklaim |
| Search Dependency | — (tidak menjalankan full-text search terpisah dari M03) |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | — |
| Storage Dependency | Supabase Storage bucket publik `developer-project-media` (CDN) |

## M07 — Sistem Scoring DBR (Kalkulator KPR)
| Dimensi | Detail |
|---|---|
| Business Responsibility | Pre-screening kelayakan KPR calon pembeli sesuai standar DBR/DSR perbankan Indonesia. |
| Database Dependency | `dbr_simulations`, `dbr_config` |
| API Dependency | `POST /calculator/dbr` |
| Service Dependency | M01 (Agen), M03 (opsional, auto-fill harga), M09 (parameter global `dbr_config`) |
| UI Dependency | Form kalkulator + hasil simulasi what-if di `(dashboard)` |
| External Service Dependency | — |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 — Agen `own` (riwayat simulasi sendiri); `dbr_config` khusus Superadmin (`granted_scope=none` untuk Manager/Admin) |
| Notification Dependency | M08 — reminder prospek DBR (job terjadwal) |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | Vercel Cron (reminder prospek DBR) |
| Storage Dependency | Field finansial (`net_income`, `existing_installments`) terenkripsi at-rest di database (bukan file storage) |

## M08 — Dashboard & Notifikasi
| Dimensi | Detail |
|---|---|
| Business Responsibility | Titik agregasi akhir lintas modul per role + pengiriman notifikasi personal. **Tidak menyimpan data bisnis sendiri** kecuali `notifications`. |
| Database Dependency | `notifications` (satu-satunya tabel milik modul ini) |
| API Dependency | `GET /notifications` (+ agregasi read-only dari endpoint modul lain) |
| Service Dependency | M03, M04, M05, M07 (sumber data agregasi), M10 (cakupan data per role) |
| UI Dependency | Dashboard ringkasan per role di `(dashboard)`/`(admin)` |
| External Service Dependency | Resend + React Email (pengiriman notifikasi channel email) |
| Authentication Dependency | M01 (tidak langsung, via seluruh modul sumber) |
| Authorization Dependency | M10 — setiap role `own` untuk notifikasi personal; dashboard admin `all` |
| Notification Dependency | Modul ini **adalah** service notifikasi terpusat — ditulis satu service, tidak boleh ditulis langsung dari banyak tempat (ADR-020) |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | Vercel Cron + Postgres Trigger/Webhook — pengiriman notifikasi terjadwal/batch, tidak sinkron di request path |
| Storage Dependency | — |

## M09 — Admin Panel / CMS
| Dimensi | Detail |
|---|---|
| Business Responsibility | Pusat operasional internal — moderasi, konfigurasi sistem, laporan. |
| Database Dependency | `system_configs`, `audit_logs` (+ kolom `organization_id` nullable, ERD v1.3) |
| API Dependency | `PUT /admin/config/dbr`, `/admin/config/system`, `GET /admin/audit-logs`, seluruh endpoint `/admin/*` modul lain (sebagai konsumen, bukan pemilik) |
| Service Dependency | M10 (gating akses seluruh sub-menu); **seluruh modul lain** sebagai objek moderasi/konfigurasi (dependency tidak langsung/cross-cutting, bukan hard dependency pembangunan) |
| UI Dependency | `app/(admin)/*` — role-gated per sub-menu |
| External Service Dependency | — |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 — `SystemConfig` hanya Superadmin; `AuditLog` Superadmin+Manager `all`, Admin `none` |
| Notification Dependency | M08 (notifikasi admin: registrasi baru, listing pending) |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | — |
| Storage Dependency | Akses signed URL bucket privat `agent-verification-documents` untuk review dokumen |

## M10 — RBAC (Manajemen Role & Hak Akses)
| Dimensi | Detail |
|---|---|
| Business Responsibility | **Modul fondasi** — kontrol akses seluruh sistem. Tidak bergantung modul lain. |
| Database Dependency | `roles`, `permissions`, `role_permissions` |
| API Dependency | `GET /admin/roles`, `GET/PUT /admin/permissions/matrix` |
| Service Dependency | **—** (fondasi, dibutuhkan semua modul lain) |
| UI Dependency | Permission Matrix Editor (Superadmin), Permission Editor terbatas (Manager) di `(admin)` |
| External Service Dependency | — |
| Authentication Dependency | Menerima input `role_id` dari M01 saat registrasi (satu-satunya titik kopling, bukan dependency fungsional) |
| Authorization Dependency | Modul ini **adalah** sumber otorisasi platform |
| Notification Dependency | M08 (perubahan permission tercatat `audit_logs`, opsional notifikasi) |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | — |
| Storage Dependency | — |

## M11 — SEO, Analytics & Tracking
| Dimensi | Detail |
|---|---|
| Business Responsibility | Memastikan seluruh halaman publik terindeks optimal. **Tidak punya layar UI sendiri** — murni backend/build-time (Functional Spec §1.1). |
| Database Dependency | `url_redirects` |
| API Dependency | Tidak ada endpoint publik terpisah — terintegrasi di response `GET /listings/*`, `/agents/*`; `GET /sitemap-*.xml`, `/robots.txt`, `POST /admin/seo/reindex`, `/admin/config/seo` |
| Service Dependency | M03, M02, M06 (sumber halaman publik yang di-SEO-kan) |
| UI Dependency | — (murni meta tag/JSON-LD/sitemap, bukan halaman terpisah) |
| External Service Dependency | Google Search Console (Indexing API), GTM, GA4 |
| Authentication Dependency | — (halaman publik) untuk konsumsi; `/admin/config/seo` khusus Superadmin |
| Authorization Dependency | M10 — konfigurasi SEO khusus Superadmin |
| Notification Dependency | — |
| Search Dependency | Tidak menjalankan mesin pencari sendiri — berperan sebagai konsumen hasil publikasi M03/M02/M06 untuk sitemap |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | Postgres Trigger/Database Webhook — regenerasi sitemap event-driven saat listing `published` (ADR-006) |
| Storage Dependency | — |

## M12 — Organization Management System *(baru, ADR-026/027)*
| Dimensi | Detail |
|---|---|
| Business Responsibility | Kolaborasi tim agen (Organization) — branding, dashboard performa kolektif — tanpa mengubah kepemilikan aset listing individual. |
| Database Dependency | `organizations`, `organization_members`, `organization_invitations`; kolom aditif `listings.organization_id`/`listing_origin`/`listing_context`, `audit_logs.organization_id` |
| API Dependency | `POST /organizations`, `PUT /organizations/{id}/branding`, `GET /organizations/{id}/dashboard`, `POST /organizations/{id}/invitations`, `/join-requests`, `PUT /organization-invitations/{id}/accept`, `DELETE /organization-members/{id}` |
| Service Dependency | M01, M10 (gate RBAC platform lolos dulu — ADR-027), M03 (kepemilikan ganda personal/organization) |
| UI Dependency | Halaman publik `/organization/[slug]`, dashboard Organization di `(dashboard)` |
| External Service Dependency | — |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 (lapisan pertama, wajib lolos) **+** lapisan kedua independen `organization-rbac.middleware` (ADR-027) — Leader `all` CRUD Organization Listing, Member `own`+`View` |
| Notification Dependency | M08 — invite diterima/ditolak, join request, member join/keluar, Organization ditutup |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | — |
| Queue Dependency | — (belum ada job terjadwal spesifik terdokumentasi) |
| Storage Dependency | Branding/logo Organization — mengikuti pola bucket publik umum |
| **Catatan Readiness** | **Approved secara arsitektur — kode belum boleh ditulis** sampai paket sinkronisasi PRD/ERD/API Spec/User Flow dieksekusi penuh (lihat Bagian 14). |

## M13 — AI Assistant Integration (BYOK) *(baru, ADR-028)*
| Dimensi | Detail |
|---|---|
| Business Responsibility | Chat AI dengan API key milik user sendiri (Bring Your Own Key), tanpa redirect keluar aplikasi. |
| Database Dependency | `ai_providers` (referensi, dikelola Admin), `agent_ai_connections`. **Tidak ada tabel riwayat percakapan.** |
| API Dependency | `GET /ai-providers`, `POST /ai-connections`, `POST /ai-connections/{id}/test`, `POST /ai-assistant/chat` |
| Service Dependency | M01, M10 (lintas role) — **tidak bergantung M12**, dua inisiatif independen |
| UI Dependency | Chat UI custom, thread paralel per-provider (state browser, tidak dipersist server) di `(dashboard)` |
| External Service Dependency | Provider AI terkurasi (Gemini/Groq/Mistral/GitHub Models — dikonfigurasi via `ai_providers`) |
| Authentication Dependency | M01 |
| Authorization Dependency | M10 — seluruh role internal `own` untuk koneksi sendiri, **termasuk Superadmin tanpa bypass** (pengecualian sengaja karena percakapan tidak pernah disimpan) |
| Notification Dependency | M08 — koneksi provider invalid/terputus |
| Search Dependency | — |
| Payment Dependency | — |
| AI Dependency | Modul ini **adalah** integrasi AI — proksi chat server-side ke provider eksternal, API key tidak pernah dikirim ke client setelah tersimpan |
| Queue Dependency | — |
| Storage Dependency | `agent_ai_connections.encrypted_api_key` — terenkripsi at-rest di database (bukan file storage); **hard-delete** saat disconnect (bukan soft-delete, pengecualian sengaja dari ADR-004) |
| **Catatan Readiness** | **Approved secara arsitektur — kode belum boleh ditulis** sampai paket sinkronisasi PRD/ERD/API Spec/User Flow dieksekusi penuh (lihat Bagian 14). |

---

# 3. DEPENDENCY MATRIX

**Notasi:** ● = direct dependency (hard, wajib ada lebih dulu) · ○ = dependency opsional/parsial · — = tidak bergantung.
Baris = modul sumber (consumer) · Kolom = modul yang dibutuhkan (provider).

| Consumer ↓ / Provider → | M01 | M02 | M03 | M04 | M05 | M06 | M07 | M08 | M09 | M10 | M11 | M12 | M13 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **M01** Auth | — | — | — | — | — | — | — | — | — | ● | — | — | — |
| **M02** Profil Agen | ● | — | ○ | ○ | — | — | — | — | — | ● | — | — | — |
| **M03** Listing | ● | ● | — | — | — | ● | — | — | — | ● | — | ○ | — |
| **M04** Learning Center | ● | — | — | — | — | — | — | — | — | ● | — | — | — |
| **M05** Kalender Event | ● | — | — | ● | — | ● | — | — | — | ● | — | — | — |
| **M06** Direktori Developer | ● | — | — | — | — | — | — | — | — | ● | — | — | — |
| **M07** DBR Scoring | ● | — | ○ | — | — | — | — | — | ● | ● | — | — | — |
| **M08** Dashboard & Notif | — | — | ● | ● | ● | — | ● | — | — | ● | — | — | — |
| **M09** Admin Panel | — | (objek moderasi seluruh modul — cross-cutting, lihat catatan) | — | — | — | — | — | — | — | ● | — | — | — |
| **M10** RBAC | — | — | — | — | — | — | — | — | — | — | — | — | — |
| **M11** SEO & Analytics | — | ● | ● | — | — | ● | — | — | — | — | — | — | — |
| **M12** Organization | ● | — | ● | — | — | — | — | — | — | ● | — | — | — |
| **M13** AI Assistant | ● | — | — | — | — | — | — | — | — | ● | — | — | — |

> **Referensi Wilayah** (shared kernel) adalah dependency tambahan M03 dan M06 di luar matriks 13×13 di atas — tidak dimasukkan sebagai kolom karena bukan bounded context bernomor (lihat Bagian 1.2).
> **M09** secara arsitektural hanya *hard-depend* pada M10; relasinya ke modul lain bersifat **cross-cutting read/write untuk moderasi & konfigurasi**, bukan dependency pembangunan berurutan — dicatat terpisah agar tidak keliru dibaca sebagai M09 memblokir seluruh modul lain.

---

# 4. DEPENDENCY GRAPH

```
                              ┌─────────────┐
                              │  M10 — RBAC │  (fondasi, tanpa dependency)
                              └──────┬──────┘
                 ┌────────────────────┼───────────────────────┐
                 ▼                                             ▼
          ┌─────────────┐                              ┌─────────────┐
          │ M01 — Auth  │◄─────────────────────────────│ M09 — Admin │ (hanya depend M10;
          └──────┬──────┘        (role_id issuance)     │ Panel/CMS   │  cross-cutting ke semua)
     ┌────────────┼─────────────┬─────────────┬─────────┘└─────────────┘
     ▼            ▼             ▼             ▼
┌─────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐
│M02–Profil│ │M04–Learning│ │M06–Direktori│ │M13–AI Assist │ (berdiri sendiri,
│  Agen    │ │  Center    │ │  Developer  │ │   (BYOK)     │  tidak jadi prasyarat modul lain)
└────┬─────┘ └─────┬──────┘ └──────┬──────┘ └──────────────┘
     │              │               │
     │              ▼               │
     │        ┌───────────┐         │
     │        │M05–Kalender│◄───────┘
     │        │   Event    │
     │        └─────┬──────┘
     │              │
     ▼              │
┌─────────────────────────┐
│      M03 — Listing       │◄──────── Referensi Wilayah (shared kernel, seed data)
│  (aggregate root inti)   │
└────┬──────────┬─────────┘
     │          │
     ▼          ▼
┌─────────┐ ┌──────────────┐
│M07 – DBR │ │M12 –Organiza-│
│ Scoring  │ │    tion      │
└────┬─────┘ └──────┬───────┘
     │              │
     ▼              ▼
┌─────────────────────────┐        ┌──────────────────────┐
│   M08 — Dashboard &      │        │  M11 — SEO & Analytics│
│      Notifikasi          │        │  (konsumen M02/M03/M06)│
│ (titik agregasi akhir)   │        └──────────────────────┘
└──────────────────────────┘
```

**Pembacaan graph:** anak panah menunjukkan arah "dibutuhkan oleh" (provider → consumer). M10 dan M01 adalah *upstream* mutlak bagi hampir seluruh modul. M08 (Dashboard) dan M11 (SEO) adalah *sink node* — tidak ada modul lain yang bergantung pada keduanya (titik agregasi akhir). M13 (AI Assistant) adalah modul paling terisolasi — hanya bergantung M01/M10, tidak dibutuhkan modul mana pun.

---

# 5. CRITICAL PATH ANALYSIS

Jalur ketergantungan terpanjang (menentukan waktu minimum sebelum modul akhir dapat mulai dibangun secara valid):

```
M10 (RBAC) → M01 (Auth) → M06 (Direktori Developer) → M03 (Listing) → M07 (DBR Scoring) → M08 (Dashboard)
                                                                ↑
                                                    M09 (Admin Panel) — jalur paralel, wajib selesai
                                                    sebelum M07 dapat memakai dbr_config final
```

| Rank | Jalur Kritis | Panjang (jumlah modul) | Keterangan |
|---|---|---|---|
| 1 | M10 → M01 → M06 → M03 → M07 → M08 | 6 | Jalur terpanjang — menentukan waktu paling lambat modul agregasi (M08) dapat mulai |
| 2 | M10 → M01 → M02 → M03 → M07 → M08 | 6 | Jalur alternatif setara (M02 dan M06 sama-sama prasyarat M03) |
| 3 | M10 → M01 → M06 → M05 → M08 | 5 | Jalur Kalender Event menuju Dashboard |
| 4 | M10 → M01 → M06 → M03 → M11 | 5 | Jalur menuju SEO & Analytics |
| 5 | M10 → M01 → M06 → M03 → M12 | 5 | Jalur menuju Organization |

**Implikasi:** M10 dan M01 **wajib** selesai (Baseline + implementasi) sebelum modul lain mana pun mulai coding secara valid. M03 (Listing) adalah **hub** paling kritis — 5 dari 13 modul (M07, M08, M11, M12, dan tidak langsung M02) bergantung padanya baik langsung maupun tidak langsung. Keterlambatan M03 berdampak berantai ke lebih banyak modul dibanding keterlambatan modul manapun selain M01/M10.

---

# 6. PARALLEL DEVELOPMENT MATRIX

Modul yang **dapat dikerjakan bersamaan** (tidak saling bergantung langsung maupun tidak langsung) setelah fondasi (M10, M01) selesai:

| Batch | Modul yang Dapat Paralel | Prasyarat Batch Sebelumnya |
|---|---|---|
| **Batch 0 (Fondasi)** | M10 (RBAC) | — |
| **Batch 1** | M01 (Auth), M09 (Admin Panel — kerangka dasar) | Batch 0 selesai |
| **Batch 2** | M02 (Profil Agen), M04 (Learning Center), M06 (Direktori Developer), M13 (AI Assistant) | Batch 1 (M01) selesai |
| **Batch 3** | M03 (Listing), M05 (Kalender Event) | Batch 2: M03 butuh M02+M06; M05 butuh M04+M06 |
| **Batch 4** | M07 (DBR Scoring), M12 (Organization), M11 (SEO & Analytics) | Batch 3 (M03) selesai; M07 juga butuh M09 (Batch 1) |
| **Batch 5** | M08 (Dashboard & Notifikasi) | Batch 4: butuh M03, M04, M05, M07 seluruhnya selesai |

**Catatan strategi tim:**
- Dengan tim kecil/AI-assisted solo development (`PROJECT-CONSTITUTION.md`), Batch 2 adalah titik dengan **paralelisme tertinggi** (4 modul independen) — kandidat terbaik untuk percepatan jika kapasitas memungkinkan.
- M13 (AI Assistant) dapat dikerjakan **kapan saja setelah Batch 1** tanpa menunggu batch manapun setelahnya — modul paling fleksibel penjadwalannya.
- M09 (Admin Panel) kerangka dasar dapat dimulai di Batch 1, namun **fitur konfigurasi lengkap per modul** (mis. `dbr_config` untuk M07) baru bisa final setelah modul terkait ada di Batch 3/4 — dicatat sebagai *iterative dependency*, bukan blocking penuh.

---

# 7. EXTERNAL DEPENDENCY MATRIX

| Layanan Eksternal | Modul Pemakai | Fungsi | Provider/Alternatif | ADR |
|---|---|---|---|---|
| Supabase Auth | M01, seluruh modul (via JWT) | Autentikasi (email/password, OTP, Google OAuth2) | — | ADR-002 |
| Google OAuth2 | M01 | SSO login | — | — |
| Supabase Storage | M01, M03, M06, M04, M12 | Bucket publik/privat, signed URL | — | ADR-009 |
| LocationIQ | M03, M06 | Geocoding/reverse geocoding primary | Failover: Geoapify | ADR-008 |
| Geoapify | M03, M06 | Failover geocoding | — | ADR-008 |
| OpenStreetMap (tiles) | M03, M06 | Rendering peta (gratis, tanpa API key) | via Leaflet | ADR-008 |
| Resend + React Email | M01, M08 | Transactional email (OTP, notifikasi) | — | ADR-007 |
| Google Search Console / Indexing API | M11 | Reindex halaman publik | — | — |
| Google Tag Manager (GTM) / GA4 | M11 | Tracking analytics | — | — |
| Sentry | Seluruh modul (cross-cutting) | Error monitoring | — | ADR-015 |
| Provider AI (Gemini/Groq/Mistral/GitHub Models) | M13 | Chat AI Assistant (BYOK) | Dikurasi via `ai_providers` | ADR-028 |
| Vercel (Hosting + Cron) | Seluruh modul | Hosting, scheduled job | — | ADR-010, ADR-006 |
| GitHub (Repo + Actions) | Seluruh modul | CI/CD | — | ADR-010 |
| **Midtrans/Xendit (Payment Gateway)** | *(Belum ada modul aktif)* | Membership premium agen — **placeholder Fase Lanjutan** | — | Belum ADR (API Spec §9.3 non-MVP) |
| Browser Geolocation API | M03 | GPS client-side untuk `properties/nearby` (bukan server-side) | — | — |

---

# 8. INFRASTRUCTURE DEPENDENCY MATRIX

| Kapabilitas Infrastruktur | Implementasi Fase 1 | Modul Pemakai | Rencana Migrasi Fase 2 | ADR |
|---|---|---|---|---|
| **Database** | PostgreSQL via Supabase, UUID PK, soft-delete 8+1 tabel | Seluruh modul | — (tetap Postgres) | ADR-004, ADR-022 |
| **Search Engine** | PostgreSQL Full-Text Search + `pg_trgm` (`search_vector` generated column, index GIN) | M03 (utama), M11 (konsumen tidak langsung) | Typesense (migrasi terjadwal berdasarkan ambang) | ADR-005 |
| **Cache / Rate Limit** | Tabel `rate_limit_log` (Postgres, sliding window) | Seluruh modul dengan endpoint publik/sensitif (M01 terutama) | Upstash Redis (migrasi terjadwal) | ADR-018 |
| **Job Queue / Scheduled Job** | Vercel Cron Jobs + Postgres Trigger/Database Webhook | M03 (scan stale), M05 (reminder event), M07 (reminder DBR), M08 (notifikasi terjadwal), M11 (regenerasi sitemap event-driven) | QStash — Upstash (migrasi terjadwal) | ADR-006 |
| **Storage** | Supabase Storage (bucket publik vs privat terpisah) | M01, M03, M04, M06, M12 | Cloudinary/ImageKit/AWS S3+CloudFront (evaluasi masa depan **jika** kebutuhan transformasi gambar dinamis melampaui kapasitas) | ADR-009 |
| **Maps/Geocoding Cache** | Tabel `geocode_cache` (Postgres, TTL 90 hari) | M03, M06 | — | ADR-008 |
| **Maps Rate Limit (scoped)** | Tabel interim `api_rate_limits` (Postgres) | M03, M06 | Konsolidasi dengan `rate_limit_log` jika ADR-018 Fase 2 berjalan | ADR-008, ADR-018 |

---

# 9. CROSS MODULE COMMUNICATION MATRIX

| Dari Modul | Ke Modul | Mekanisme Komunikasi | Sinkron/Asinkron |
|---|---|---|---|
| M01 | M10 | Service call langsung (penerbitan `role_id` saat registrasi) | Sinkron |
| M02 | M04 | Read-only query relasi (badge sertifikasi) | Sinkron |
| M02 | M03 | Read-only agregasi (statistik listing, denormalisasi) | Sinkron (baca), Asinkron (update counter via Trigger) |
| M03 | M06 | FK `developer_project_id` (nullable) | Sinkron (baca saat render listing Primary) |
| M03 | M11 | Event-driven — Postgres Trigger/Webhook saat `listings.status = published` | Asinkron |
| M03 | M12 | FK `organization_id` (nullable) + `organization-rbac.middleware` | Sinkron |
| M05 | M04 | Referensi event = kelas live | Sinkron |
| M05 | M06 | Referensi event launching proyek | Sinkron |
| M07 | M03 | Opsional auto-fill harga listing ke kalkulator | Sinkron (baca) |
| M07 | M09 | Baca parameter global `dbr_config` | Sinkron |
| M08 | M03, M04, M05, M07 | Read-only agregasi lintas modul (bukan event bus — direct query per role) | Sinkron |
| M08 | (semua modul sumber notifikasi) | Service notifikasi terpusat (satu service tunggal, ADR-020) — modul lain **memanggil**, bukan menulis langsung ke tabel `notifications` | Sinkron (trigger call) + Asinkron (pengiriman batch/terjadwal) |
| M09 | (semua modul) | Read/Write cross-cutting untuk moderasi & konfigurasi | Sinkron |
| M10 | (semua modul) | Middleware `rbac.middleware` dipanggil setiap request | Sinkron (in-process, bukan service terpisah — ADR-001) |
| M12 | M03 | `organization-rbac.middleware` — lapisan kedua setelah RBAC platform | Sinkron |

> **Catatan arsitektural penting (ADR-001):** Karena backend adalah **Route Handlers BFF tipis di dalam `apps/web`** (bukan microservice terpisah), seluruh komunikasi "sinkron antar modul" di atas pada dasarnya adalah **pemanggilan fungsi/service layer in-process** (`lib/services/{modul}.service.ts`), bukan HTTP call antar service. Tidak ada message broker/event bus eksternal — mekanisme "asinkron" murni memakai Postgres Trigger/Database Webhook + Vercel Cron (ADR-006).

---

# 10. CONFLICT ANALYSIS

| # | Konflik | Dokumen Terlibat | Analisis | Rekomendasi Resolusi |
|---|---|---|---|---|
| 1 | **Storage & CDN provider tidak konsisten.** `API-Specification-...v1.2.md` §9.2 masih menuliskan "AWS S3 / Cloudinary / ImageKit" sebagai provider storage, sementara `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §12 dan `PROJECT-CONSTITUTION.md` menetapkan **Supabase Storage** (ADR-009, Approved) sebagai provider resmi — Cloudinary/S3 hanya dicatat sebagai *future evaluation*, bukan keputusan aktif. | System Architecture (prioritas #3) vs API Specification (prioritas #7) | Berdasarkan urutan prioritas dokumen acuan, System Architecture lebih otoritatif. API Spec §9.2 tampak belum disinkronkan sejak ADR-009 disahkan. | **Gunakan Supabase Storage** sebagai Storage Dependency resmi di seluruh MDM ini (sudah diterapkan di Bagian 2). API Spec §9.2 perlu ditandai untuk revisi editorial pada siklus governance berikutnya. |
| 2 | **Arah dependency M03↔M06 berpotensi dibaca dua arah.** `Technical-Specification.md` §3 (M06) menuliskan dependency "`M03` (listing Primary turunan)" sebagai salah satu dependency M06, sementara `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5 (tabel resmi) dan `Technical-Specification.md` §3 (M03) sama-sama menyatakan **M03 bergantung pada M06** (arah sebaliknya). | System Architecture (#3) vs Technical Specification (#4, redaksi ambigu di brief M06) | Frasa "listing Primary turunan" pada brief M06 menjelaskan *hubungan hasil kerja* (listing Primary adalah derivative dari data proyek developer), bukan pernyataan dependency arsitektural terbalik. Tidak ditemukan FK `listings → developer_project_id` yang mengarah sebaliknya di ERD, sehingga tidak ada circular dependency riil pada level skema data. | **Arah resmi: M03 bergantung pada M06** (konsisten ERD FK `listings.developer_project_id`, dan tabel dependency §5 System Architecture). Redaksi Technical Specification §3 (M06) direkomendasikan diperjelas pada revisi berikutnya agar tidak dibaca sebagai dependency terbalik. |
| 3 | **M08 (Dashboard) — cakupan dependency M10.** `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5 tabel resmi tidak mencantumkan M10 sebagai "Bergantung Pada" M08, namun `Technical-Specification.md` §3 (M08) mencantumkan "M10 (cakupan data per role)". | System Architecture vs Technical Specification | Ini bukan kontradiksi substantif — cakupan RBAC pada M08 bersifat implisit di semua modul (setiap query difilter `granted_scope`). Technical Specification memberi detail tambahan yang konsisten dengan prinsip RBAC global, bukan requirement baru. | Dicantumkan sebagai dependency eksplisit M08→M10 di Bagian 2 & 3 dokumen ini (bersifat aditif/klarifikasi, bukan mengubah keputusan). |
| 4 | **Status implementasi M12/M13 vs status "Baseline" dokumen sumber.** `document-governance-baseline-register-v1.4.md` mencatat entitas M12/M13 sudah **Baseline** di ERD/API Spec/Entity Mapping, namun `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §5.12–5.13 dan `Technical-Specification.md` masih mencantumkan catatan "**kode belum boleh ditulis**" menunggu paket sinkronisasi. | Governance Register vs System Architecture/Technical Spec (kedua sisi konsisten satu sama lain, tetapi berpotensi disalahpahami sebagai "sudah siap coding" jika hanya membaca status Baseline dokumen) | Status **Baseline dokumen** ≠ **readiness implementasi kode**. Baseline berarti isi dokumen final/tidak boleh diubah sepihak, bukan berarti gate implementasi sudah dibuka. | Ditegaskan di Bagian 14 (Module Readiness) — M12/M13 **Document-Ready** tetapi **Implementation-Blocked** sampai ada konfirmasi eksplisit pembukaan gate dari Owner, konsisten `PROJECT-CONSTITUTION.md` §24 poin 10. |

---

# 11. CIRCULAR DEPENDENCY ANALYSIS

**Hasil pemeriksaan:** **Tidak ditemukan circular dependency** pada graph 13 modul setelah resolusi Konflik #2 (Bagian 10). Graph di Bagian 4 adalah **Directed Acyclic Graph (DAG)** murni — dapat diurutkan topologis penuh (lihat Batch 0–5, Bagian 6).

| Pasangan Modul yang Diperiksa Berpotensi Circular | Hasil Pemeriksaan | Kesimpulan |
|---|---|---|
| M03 ↔ M06 | M03 depends M06 (FK `developer_project_id`); tidak ditemukan FK/service call M06→M03 di ERD/API Spec | **Tidak circular** — one-directional (lihat Konflik #2) |
| M02 ↔ M03 | M02 depends M03 (statistik, read-only); M03 tidak depends M02 secara fungsional wajib, hanya M02 untuk WA default (M03 depends M02, arah sebaliknya) — **kedua arah eksis tapi untuk data berbeda** | **Berpotensi circular secara naif**, tetapi valid secara arsitektural karena merupakan **dua relasi baca berbeda arah** (M03→M02 untuk kontak WA saat create listing; M02→M03 untuk statistik agregat saat render profil) — bukan siklus dependency pembangunan (build-time), keduanya dapat dibangun dengan urutan M02 lebih dulu tanpa blocking, statistik M02 hanya terisi setelah M03 punya data (runtime data dependency, bukan module build dependency). |
| M04 ↔ M02 | M02 depends M04 (badge, read-only); M04 tidak depends M02 | **Tidak circular** |
| M08 ↔ (M03,M04,M05,M07) | M08 depends keempatnya; tidak satupun keempatnya depends M08 | **Tidak circular** — M08 murni sink node |
| M09 ↔ (semua modul) | M09 secara fungsional membaca/menulis moderasi ke semua modul, tetapi hard dependency M09 hanya ke M10; tidak ada modul yang depends M09 untuk fungsi intinya (moderasi adalah operasi tambahan, bukan prasyarat data modul lain berfungsi) | **Tidak circular** — relasi bersifat cross-cutting satu arah fungsional |

**Kesimpulan:** Tidak diperlukan rekomendasi pemecahan circular dependency karena tidak ditemukan siklus. Satu-satunya area yang perlu kejelasan redaksional adalah Konflik #2 (M03↔M06), yang sudah diresolusikan di Bagian 10 tanpa mengubah keputusan arsitektur manapun.

---

# 12. RISK ANALYSIS

| Risiko | Modul Terdampak | Dampak | Sumber | Mitigasi (berdasarkan dokumen) |
|---|---|---|---|---|
| **M03 (Listing) sebagai single point of bottleneck** — 5+ modul bergantung padanya baik langsung/tidak langsung | M07, M08, M11, M12, M02 (parsial) | Keterlambatan M03 menunda mayoritas modul Fase 2–4 | Dependency Matrix Bagian 3 | Prioritaskan M03 segera setelah fondasi (M10, M01, M02, M06) selesai; hindari scope creep di M03 (batasi ke 15 REQ resmi PRD) |
| **M12/M13 Approved tapi Implementation-Blocked** — risiko kesalahpahaman gate coding | M12, M13 | Tim/AI Coding Assistant berpotensi mulai coding prematur karena status dokumen sudah "Baseline" | Governance Register + System Architecture §5.12–5.13 (Konflik #4) | Tegakkan pengecekan eksplisit `CURRENT-PROJECT-STATE.md` sebelum memulai task M12/M13 — bukan hanya cek status dokumen |
| **Ketergantungan pada 2 provider geocoding eksternal gratis (LocationIQ/Geoapify)** | M03, M06 | Kuota gratis terbatas (5.000 req/hari LocationIQ); degradasi ke fallback manual jika kedua provider gagal | API Spec §9.1, System Architecture §7 | `geocode_cache` (TTL 90 hari) menekan panggilan berulang; fallback 3 lapis (cascading dropdown → freetext → drag-pin manual) sudah dirancang |
| **Rate limiting & search Fase 1 murni Postgres** — potensi bottleneck performa saat traffic naik | M03 (search), M01/seluruh modul (rate limit) | Migrasi ke Typesense/Upstash Redis di Fase 2 memerlukan effort tersendiri jika ambang tercapai lebih cepat dari perkiraan | ADR-005, ADR-018 | Ambang migrasi sudah dijadwalkan (kriteria eksplisit, meski nilai ambang tidak dirinci di dokumen yang diupload — cek `technology-decisions.md` untuk detail angka) |
| **M09 (Admin Panel) cross-cutting ke seluruh modul** — risiko tight coupling implisit | M09 dan seluruh modul lain | Perubahan skema/endpoint modul manapun berpotensi memerlukan penyesuaian Admin Panel secara paralel, tidak tertangkap di Dependency Matrix formal karena bukan hard dependency | Bagian 2 (M09), Bagian 3 (catatan matrix) | Sertakan review dampak Admin Panel di setiap definition-of-done modul lain (rekomendasi proses, di luar cakupan MDM sebagai dokumen dependency murni) |
| **Enkripsi data sensitif tersebar di 3 modul berbeda dengan pola serupa tapi bukan service bersama eksplisit** | M01 (dokumen legalitas), M07 (data finansial DBR), M13 (API key AI) | Risiko drift implementasi enkripsi jika tidak disatukan sebagai satu utilitas | Technical Specification §2.5 | Sudah dicatat sebagai *cross-cutting concern* terpusat di Technical Specification — rekomendasikan satu modul utilitas enkripsi bersama saat implementasi (di luar cakupan dependency modul bisnis) |

---

# 13. RECOMMENDED MODULE LAYER

Berdasarkan posisi dalam Dependency Graph (Bagian 4) dan prinsip layering `PROJECT-CONSTITUTION.md` §22 (Architecture Principles):

| Layer | Modul | Karakteristik |
|---|---|---|
| **Layer 0 — Foundation** | M10 (RBAC) | Tanpa dependency, dibutuhkan seluruh layer di atasnya |
| **Layer 1 — Identity & Configuration** | M01 (Auth), M09 (Admin Panel — kerangka) | Hanya bergantung Layer 0 |
| **Layer 2 — Core Domain (independen satu sama lain)** | M02 (Profil Agen), M04 (Learning Center), M06 (Direktori Developer), M13 (AI Assistant) | Bergantung Layer 0–1 saja, tidak saling bergantung |
| **Layer 3 — Transactional Core** | M03 (Listing), M05 (Kalender Event) | Bergantung ≥1 modul Layer 2 |
| **Layer 4 — Derived/Value-Added** | M07 (DBR Scoring), M12 (Organization), M11 (SEO & Analytics) | Bergantung Layer 3 (M03 khususnya) |
| **Layer 5 — Aggregation** | M08 (Dashboard & Notifikasi) | Sink node — mengagregasi Layer 3–4, tidak dibutuhkan layer manapun |

> Layering ini **selaras** dengan struktur folder `apps/web` di `SYSTEM-ARCHITECTURE-v1.6-FINAL.md` §6 (`lib/services/{modul}.service.ts` per modul) — tidak memerlukan struktur folder terpisah per layer, layer di sini murni untuk urutan pembangunan & pengujian, bukan physical package boundary (konsisten ADR-001: satu aplikasi Next.js, bukan microservices).

---

# 14. MODULE PRIORITY

| Modul | Prioritas PRD | Fase Roadmap | Prioritas MDM (berbasis posisi Dependency Graph) | Justifikasi |
|---|---|---|---|---|
| M10 | Must Have | Fase 1 (MVP) | **P0 — Blocker Absolut** | Foundation, tanpa ini tidak ada modul lain yang valid secara RBAC |
| M01 | Must Have | Fase 1 (MVP) | **P0 — Blocker Absolut** | Identity, prasyarat 11 dari 13 modul |
| M09 | Must Have | Fase 1 (MVP, dasar) | **P1** | Prasyarat M07 (dbr_config); cross-cutting moderasi |
| M02 | Must Have | Fase 1 (MVP) | **P1** | Prasyarat M03 |
| M06 | Must Have | Fase 2 | **P1** | Prasyarat M03 (listing Primary) & M05 |
| M11 | Must Have | Fase 1 (fondasi SEO sejak awal) | **P1** | PRD eksplisit: fondasi SEO **tidak boleh ditambal belakangan** (Bagian 6 PRD) |
| M03 | Must Have | Fase 1 (MVP, dasar) | **P1 — Hub Kritis** | Titik dependency terbanyak (Critical Path Bagian 5) |
| M04 | Must Have | Fase 3 | **P2** | Independen (Layer 2), dapat ditunda tanpa memblokir modul lain kecuali M05 |
| M05 | Should Have | Fase 3 | **P2** | Bergantung M04+M06 |
| M07 | Must Have | Fase 2 | **P2** | Nilai jual utama (PRD §6) namun secara dependency menunggu M03+M09 |
| M08 | Should Have | Fase 4 | **P3** | Sink node, wajar dikerjakan paling akhir |
| M12 | Should Have | Fase 2 lanjutan | **P3 — Implementation-Blocked** | Approved tapi menunggu gate (Bagian 10 Konflik #4) |
| M13 | Should Have | Fase 2 lanjutan | **P3 — Implementation-Blocked** | Approved tapi menunggu gate; paling independen jika gate dibuka |

---

# 15. MODULE READINESS

| Modul | Status Dokumen (Governance Register v1.4) | Status Skema Fisik | Status Implementasi Kode | Siap Development? |
|---|---|---|---|---|
| M01–M11 | ✅ Baseline | ✅ Ada di migration fisik (`0001`–`0014`) | Mengikuti `CURRENT-PROJECT-STATE.md` (di luar cakupan dokumen yang diupload sesi ini) | **Ya**, secara dependency dokumen — cek status kode aktual terpisah |
| M12 (Organization) | ✅ Baseline (ERD v1.3, API Spec v1.2, Entity Mapping v1.0) | ⚠️ **Skema belum dieksekusi ke migration fisik** — Approved secara arsitektur, menunggu paket sinkronisasi (System Architecture §7) | **Belum boleh ditulis** (PROJECT-CONSTITUTION §24 poin 10) | **Tidak** — Document-Ready, Implementation-Blocked |
| M13 (AI Assistant) | ✅ Baseline (ERD v1.3, API Spec v1.2, Entity Mapping v1.0) | ⚠️ **Skema belum dieksekusi ke migration fisik**, sama seperti M12 | **Belum boleh ditulis** | **Tidak** — Document-Ready, Implementation-Blocked |

> **Rekomendasi eksplisit:** Sebelum memulai development M12/M13, wajib verifikasi ulang `CURRENT-PROJECT-STATE.md` (living document) untuk memastikan gate implementasi sudah dibuka Owner — dokumen governance yang diupload sesi ini (`document-governance-baseline-register-v1.4.md`) mencatat status **dokumen** Baseline, bukan konfirmasi pembukaan gate **kode**.

---

# 16. DOCUMENT TRACEABILITY

| Modul | Sumber Requirement (PRD) | Sumber Entity (ERD/Entity Mapping) | Sumber API (API Spec) | Sumber Arsitektur (System Architecture/Technical Spec) | ADR Terkait |
|---|---|---|---|---|---|
| M01 | REQ-M01-001..008 | `ENT-M01-User`, `ENT-M01-AgentVerificationDocument` | §1.1–1.2 | §5.1 / M01 | ADR-002, ADR-003 |
| M02 | REQ-M02-001..007 | `ENT-M02-AgentProfile`, `ENT-M02-AgentReview` | §1.2 | §5.2 / M02 | — |
| M03 | REQ-M03-001..015 | `ENT-M03-*` (11 entity) | §2, §3 | §5.3 / M03 | ADR-005, ADR-008 |
| M04 | REQ-M04-001..006 | `ENT-M04-*` (7 entity) | §11 (10.1) | §5.4 / M04 | — |
| M05 | REQ-M05-001..005 | `ENT-M05-Event`, `ENT-M05-EventRegistration` | §11 (10.2) | §5.5 / M05 | ADR-006 |
| M06 | REQ-M06-001..006 | `ENT-M06-*` (4 entity) | §11 (10.3) | §5.6 / M06 | ADR-008 |
| M07 | REQ-M07-001..006 | `ENT-M07-DbrSimulation`, `ENT-M07-DbrConfig` | §6 | §5.7 / M07 | — |
| M08 | REQ-M08-001..005 | `ENT-M08-Notification` | §7 | §5.8 / M08 | ADR-007, ADR-020 |
| M09 | REQ-M09-001..006 | `ENT-M09-SystemConfig`, `ENT-M09-AuditLog` | §11 (10.4) | §5.9 / M09 | — |
| M10 | REQ-M10-001..010 | `ENT-M10-Role/Permission/RolePermission` | §1.3 | §5.10 / M10 | ADR-003, ADR-024 |
| M11 | REQ-M11-001..009 | `ENT-M11-UrlRedirect` | §10 | §5.11 / M11 | ADR-006, ADR-021 |
| M12 | REQ-M12-001..019 | `ENT-M12-*` (3 entity) | §5A | §5.12 / M12 | ADR-026, ADR-027 |
| M13 | REQ-M13-001..012 | `ENT-M13-*` (2 entity) | §5B | §5.13 / M13 | ADR-028, ADR-017, ADR-018 |

---

# 17. RECOMMENDATION

1. **Mulai development sesuai urutan Layer (Bagian 13)**, bukan urutan nomor modul PRD — M10→M01 wajib selesai lebih dulu terlepas dari nomor urut PRD (M10 secara nomor "terakhir" tapi secara dependency paling fondasional).
2. **Manfaatkan Batch 2 (Bagian 6)** untuk paralelisasi maksimal — M02, M04, M06, M13 dapat dikerjakan bersamaan oleh AI Coding Assistant/kontributor berbeda tanpa risiko conflict dependency.
3. **Perlakukan M03 (Listing) sebagai modul prioritas tertinggi setelah fondasi** — bukan karena PRD memberi prioritas "Must Have" semata, tetapi karena posisinya sebagai hub kritis di Dependency Graph (Bagian 4–5). Keterlambatan di sini berdampak paling luas.
4. **Jangan mulai coding M12/M13** sampai ada konfirmasi eksplisit dari `CURRENT-PROJECT-STATE.md` bahwa gate implementasi sudah dibuka — status "Baseline" dokumen tidak sama dengan izin coding (Bagian 10 Konflik #4, Bagian 15).
5. **Selesaikan resolusi editorial 2 konflik dokumentasi** (Bagian 10, #1 dan #2) pada siklus governance berikutnya — tidak memblokir development karena sudah diresolusikan secara analitis di dokumen ini, namun sumber dokumen asli (API Spec §9.2, Technical Spec §3/M06) sebaiknya disinkronkan agar tidak menjadi sumber kebingungan di masa depan.
6. **M09 (Admin Panel) memerlukan proses kerja tambahan di luar cakupan MDM murni** — karena sifatnya cross-cutting ke seluruh modul tanpa menjadi hard dependency formal, rekomendasikan checklist "Admin Panel impact review" di setiap Definition of Done modul lain (bukan bagian dari Dependency Matrix, tapi bagian dari proses development).
7. **Tidak ditemukan circular dependency** yang memerlukan refactoring arsitektur (Bagian 11) — struktur dependency saat ini sudah sehat sebagai DAG dan dapat langsung dipakai sebagai acuan sprint/task planning di luar dokumen ini.

---

*Module Dependency Matrix ini disusun murni berdasarkan dokumen yang diupload — tidak ada modul baru yang diciptakan, tidak ada requirement yang diubah, dan tidak ada keputusan arsitektur baru yang diambil. Seluruh rekomendasi di Bagian 17 bersifat operasional/proses, bukan perubahan terhadap keputusan yang sudah Baseline/Approved.*
