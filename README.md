# RumahAgen SaaS — Repository Gabungan (Spesifikasi + Wireframe + Kode)

Repo ini menggabungkan dua sumber upload asli menjadi satu struktur GitHub, dan kini
sudah mulai berisi **kode implementasi nyata** untuk menutup residual yang ditemukan
saat deep scan (lihat `audit/WIREFRAME_DEEP_SCAN_REPORT.md` dan
`CHECKLIST_RESIDUAL_IMPLEMENTASI.md`).

1. **`Core_baru_RumahAgen-SaaS-GitHub-Ready.zip`** → spesifikasi/governance lengkap
   (STEP 00–14 + P1–P16).
2. **`WF_Wire.zip`** → 27 paket wireframe (WF-00 s.d. WF-11), direorganisasi ke satu
   skema folder konsisten.

## Status implementasi (per modul)

| Area | Status | Keterangan |
|---|---|---|
| **M10 — Authorization (RBAC/Permission/RLS)** | ✅ **Kode nyata** | `supabase/migrations/0001`–`0010`, generate otomatis dari `STEP12-01_ROLE_PERMISSION_MASTER_MATRIX.csv` (90 permission, 345 grant) — menutup residual D13-06, D13-15, R-02, D13-04 |
| **Konvensi API global** | ✅ **Kode nyata** | `apps/web/lib/api/*` — menutup D13-16 s.d. D13-23 |
| **Scaffold Next.js** | ✅ **Kode nyata** | `apps/web/` — `package.json`, Supabase client, 1 contoh route nyata (`GET /api/authorization/roles`) yang sudah query ke migration M10 |
| **M09 — Admin Console** | ✅ **Kode nyata + REST API** | `supabase/migrations/0011`–`0014` — `system_configs`, `audit_logs`, `notification_templates` (baru), `public_announcement_promotion` (baru) — menutup residual R-06, D13-05, D13-08, D13-13; D13-12 tertutup di level permission, D13-14 CLOSED (lihat M13). **STEP11-A (API-129/149/238/239) + M11 (API-135/136)**: `apps/web/app/api/admin/config/**`, `admin/audit-logs`, `admin/notification-templates/**`, `banners`/`admin/banners/**` — diuji end-to-end sebagai Superadmin nyata. `admin/reports/export` (API-138) dan `admin/internal-users` (API-139-142) belum ada — dataset/skemanya tidak evidenced |
| **M13 — Provider Catalogue / BYOK** | ✅ **Kode nyata + REST API** | `supabase/migrations/0015`–`0016` — `ai_providers`, `agent_ai_connections` (status 5-state + trigger lifecycle), fungsi `admin_force_provider_connection()` — menutup R-07, D13-11 penuh, D13-09/D13-10 penuh di lapisan HTTP. **STEP11-B10 + kelengkapan penuh**: `apps/web/app/api/ai-providers/**`, `ai-connections/**`, `admin/ai-connections/**` + `lib/crypto/byok.ts` (enkripsi AES-256-GCM baru, sebelumnya belum ada pola enkripsi di repo) — diuji end-to-end menyeluruh (create/rotate/test/force-disable/reverse/soft-disconnect, termasuk verifikasi `encrypted_api_key` benar-benar ter-enkripsi di DB). `POST /ai-assistant/chat` (invokasi AI sungguhan) belum ada — butuh adapter provider nyata |
| **M03 — Listing** + **M14 — Refresh Allowance/Entitlement** | ✅ **Kode nyata + REST API** | `supabase/migrations/0017`–`0020` — `listings` (skema penuh + trigger lifecycle), rantai kuota M14 (5 tabel), fungsi `refresh_listing()` memanggil `consume_refresh_allowance()` — menutup R-04, D13-01 penuh. **STEP11-B2 (API-025/026/027/028/029/035/237)**: `apps/web/app/api/listings/**` + `apps/web/app/api/agents/me/listings/**` — route REST nyata kedua di repo ini (setelah M10), diuji langsung ke project Supabase. Media/price-history/from-project/admin-queue (API-030–034/036–038) belum diimplementasi (tabelnya belum ada) |
| **M04 — Learning Session/Evidence/LP Economy/Partnership** + **M15 — Qualification/Award** | ✅ **Kode nyata + REST API penuh** | `supabase/migrations/0021`–`0027` — 8 tabel Session/Evidence M04, LP economy, Partnership Learning Result (baru), 5 tabel Qualification/Award M15, fungsi `grant_learning_points_from_purchase()` + `capture_qualification_evidence_from_session()`/`evaluate_qualification()` — menutup R-08, D13-02, D13-03 (lihat catatan gap terbuka: mesin awarding path/rule belum dibangun). **STEP11-B5 (API-086-115)**: `apps/web/app/api/learning/**` + `integrations/learning-session/**` — 21 route file, diuji end-to-end menyeluruh. Migration `0042` menutup gap RLS DELETE; `0043`+`0044`+`0045` memperbaiki **3 bug fungsional RLS/trigger** (scope 'own' Instructor tidak pernah terpenuhi di attendance/completion). **STEP11-B4 LP Economy + Partnership Learning Result (Gate PRE-00-F §51)**: `apps/web/app/api/agents/me/learning-points/**`, `admin/learning-point-adjustments`, `partnership-learning-results/**` — 7 route file, diuji end-to-end menyeluruh. Migration `0046` menutup gap RLS INSERT LP (fungsi `adjust_learning_points()`); fix mapping error 409 baru (Postgres `23514`) di `lib/api/handler.ts` berlaku untuk semua endpoint mutasi. **STEP11-B8 M15 Qualification/Evidence/Awarding (API-200-236)**: `apps/web/app/api/titles/**`, `title-authority-scopes/**`, `qualification-evaluations/**`, `qualification-evidence/**`, `awards/**` — 20 route file, saat dibangun hanya di atas 5 dari 14 tabel M15 (9 tabel "mesin konfigurasi jalur/aturan" belum ada migration-nya); diuji end-to-end menyeluruh termasuk pipeline M04→M15 evidence→evaluation→award penuh untuk pertama kalinya. M04 Learning Catalog/Activity (Fase 2) dan M15 Awarding Engine 9 tabel (Fase 3, lihat baris "100% tabel" di bawah) kini SUDAH punya migration+RLS lengkap TAPI belum punya REST API — menyusul batch terpisah |
| **M02 — Profile** | ✅ **Kode nyata** | `supabase/migrations/0029`–`0030` — `agent_profiles`, `agent_reviews` (auto-approve sesuai Gate PRE-00-D, bukan default literal STEP10-D) — di luar 31 residual asli, dikerjakan atas permintaan eksplisit |
| **M05 — Event** | ✅ **Kode nyata + REST API** | `supabase/migrations/0031`–`0032` — `events`, `event_provider_bindings`, `event_registrations` (termasuk Guest Registration) — di luar 31 residual asli, dikerjakan atas permintaan eksplisit. **STEP11-A (API-079-084)**: `apps/web/app/api/events/**` — diuji end-to-end penuh (create→publish→RSVP self/guest→delete). Migration `0039` menutup gap RLS DELETE yang hilang di `0031`; perbaikan mapping error 403 di `lib/api/handler.ts` berlaku untuk semua endpoint mutasi |
| **M06 — Developer/Project/Marketing Kit/Claim** | ✅ **Kode nyata + REST API penuh** | `supabase/migrations/0033`–`0035` — `developer_partners`, `developer_projects` (+ FK retroaktif ke `listings`/`events`), `marketing_kit`, `agent_project_claims` — menutup **R-05**. **STEP11-B3 (API-116-122) + kelengkapan penuh**: `apps/web/app/api/developer-projects/**`, `developer-partners/**`, `marketing-kit/**`, `project-media/**`, `claims/**`, `admin/developer-projects/**` — diuji end-to-end menyeluruh (self-service create, moderation-gate publish, media, marketing kit, klaim+review+approve, delete). Migration `0040` menutup gap RLS DELETE (pola sama seperti M05); migration `0041` memperbaiki **bug fungsional** RLS review-klaim yang ditemukan saat testing (Developer Partner tidak bisa approve klaim di project miliknya sendiri). Hanya Approval Claim PDF yang belum ada (tidak ada tabel/mekanisme fisik) |
| **M08 — Dashboard/Notification State** | ✅ **Kode nyata + REST API** | `supabase/migrations/0036` — `notifications` (+ dismiss/delivery-state) + fungsi `create_notification()` sebagai satu-satunya jalur insert — menutup **D13-07**. **STEP11-A (API-131/132/133/134/137)**: `apps/web/app/api/notifications/**`, `admin/notifications/push`, `dashboard/summary` — diuji end-to-end (push ditolak untuk Agent, diterima untuk Superadmin; read/dismiss/read-all/dashboard summary semua sesuai kontrak) |
| **M11 — Public Discovery/SEO** | ✅ **Kode nyata** | `supabase/migrations/0037` + koreksi `0028` (permission `public_announcement_promotion` dari Tahap 2 dipindah ke M11 yang benar) — `static_public_content`. **Fase 1 "100% tabel"**: `0051_m11_url_redirects.sql` menambah `url_redirects` (SEO 301/302 redirect) |
| **Fase 1 "100% tabel"** (hasil deep-scan `STEP10-D_ENTITY_TO_PHYSICAL_TABLE_RECONCILIATION.csv` — 94 entitas logis di spec, 54 tabel sudah ada sebelum fase ini) | ✅ **Kode nyata (migration saja, belum REST API)** | `supabase/migrations/0047`–`0053` — 13 tabel PRESERVE/ADD-NEW spec yang belum pernah dibangun: M03 (`listing_photos`/`videos`/`views`/`leads`/`price_history`/`amenities`/`listing_amenities`), `ref_villages`, M01 (`agent_verification_documents`, permission baru `m01.verification_document.manage`), M12 (`organization_invitations`, `organization_document`), M11 (`url_redirects`), M07 (`dbr_simulations`). Diuji nyata langsung lewat PostgREST (bukan route Next.js — belum dibangun); **2 bug ditemukan & ditutup**: `0054` (RLS listing child tables salah cek `status='active'`, seharusnya `'published'`) dan `0055` (Agent bisa self-approve `agent_verification_documents` miliknya sendiri — RLS scope 'own' tidak membedakan kolom). Lihat `supabase/migrations/README.md` untuk rincian penuh dan catatan arsitektural `INSERT...RETURNING` vs RLS publik |
| **Fase 2 "100% tabel"** — M04 Learning Catalog/Activity/Assessment | ✅ **Kode nyata (migration saja, belum REST API)** | `supabase/migrations/0056`–`0063` — 13 tabel domain self-paced/katalog (TERPISAH dari `learning_sessions` M04 Session/live): `courses`+`course_lessons`, `learning_paths`+`learning_path_versions`, `learning_activities`+`learning_activity_completions`+`learning_unlock_progressions`, `enrollments` (Course Enrollment, distinct dari Session Enrollment), `quizzes`+`quiz_questions`+`quiz_options`+`quiz_attempts`, `certificates`. 7 permission baru (`m04.course.manage`, `m04.learning_path.manage`, `m04.learning_activity.manage`, `m04.learning_activity_completion.create`, `m04.course_enrollment.create`/`.view`, `m04.certificate.manage`) — master matrix 50-baris TIDAK PUNYA satu baris pun untuk Course/Learning Catalog. `0062` menutup FK `learning_sessions.course_id` yang ditunda sejak 0021. Diuji nyata lewat PostgREST menyeluruh (draft/publish visibility, quiz answer-key hidden dari Agent, self-issue certificate diblokir, no-client-mutation untuk unlock progression) — **tidak ada bug ditemukan**, desain tervalidasi sejak percobaan pertama |
| **Fase 3 "100% tabel"** — M15 Awarding Engine | ✅ **Kode nyata (migration saja, belum REST API)** | `supabase/migrations/0064`–`0070` — 9 tabel "mesin konfigurasi jalur/aturan kelulusan" yang ditunda sejak 0026: `awarding_paths`+`awarding_path_versions`, `awarding_rule_versions`+`awarding_path_rules` (junction N:N), `awarding_condition_groups`+`awarding_conditions`+`awarding_prerequisites`, `award_qualifying_paths` (provenance), `title_presentations`. Dengan ini **seluruh 14 tabel M15** (STEP11-B8 §13) lengkap. 2 permission baru (`m15.awarding_path_rule.configure` Superadmin/Admin/Manager saja, `m15.title_presentation.manage` Agent=own). `0069` menutup FK `qualification_evaluations`/`award_instances` → `awarding_path_versions`/`awarding_rule_versions` yang ditunda sejak 0026. Diuji nyata lewat PostgREST membangun satu rantai config engine utuh ujung-ke-ujung — tidak ada bug ditemukan |
| **Fase 4 "100% tabel"** — M14 Commercial (Midtrans sebagai payment gateway MVP) | ✅ **Kode nyata (migration saja, belum REST API)** | `supabase/migrations/0071`–`0078` — 8 tabel terakhir: `promotions` (staff-only), `addons` (katalog publik), `subscriptions` (privat), `commercial_orders`, `payment_transactions` (`payment_state` DIKUNCI ke vocabulary status Midtrans resmi — pending/capture/settlement/deny/cancel/expire/failure/refund/partial_refund/chargeback/partial_chargeback/authorize), `payment_provider_results` (webhook mentah, TIDAK ADA jalur INSERT untuk siapa pun termasuk staf), `commercial_fulfillments` (juga tanpa jalur INSERT klien), `reconciliation_cases` (status dikunci ke lifecycle STEP11-B7 §13). TIDAK ADA permission baru (4 permission M14 sudah ada sejak seed 0009). `0077` menutup 3 FK `commercial_entitlements.source_*` yang ditunda sejak 0019. **Keputusan keamanan terpenting**: `commercial_orders`/`payment_transactions` sengaja TIDAK PUNYA UPDATE untuk pemilik sama sekali — dikonfirmasi lewat test bahwa Agent mencoba self-approve `payment_state` ke `settlement` gagal total (baris tidak berubah). Dengan Fase 1-4 selesai, **seluruh 97 tabel target sudah ada di Supabase** |
| `packages/ui`, `packages/config` | ⏳ Belum ada kode | Placeholder |

> Modul-modul yang belum dikerjakan **masih murni dokumentasi/wireframe** —
> jangan asumsikan seluruh repo sudah bisa jalan penuh. **Seluruh 31 residual
> unik di `P9_CONTROLLED_ENGINEERING_RESIDUAL_REGISTER_v1.1.csv` sudah tertutup
> di level migration/RLS/fungsi (Tahap 1-6)**, ditambah 5 modul (M02/M05/M06
> lengkap/M08/M11) yang diminta eksplisit di luar checklist asli.
> Route REST (STEP-11) baru 10 slice (M10, M03 Listing + M14 Refresh, M09
> Admin Console, M08 Notifications, M05 Event, M06 Developer/Project/Media/
> Marketing Kit/Claim, M13 Provider/BYOK, M04 Learning Session/Evidence, M04
> LP Economy + Partnership Learning Result, dan M15 Qualification/Evidence/
> Awarding — semua lengkap atas skema yang ada). M04 Learning Catalog/Activity
> (Fase 2, 13 tabel), M15 Awarding Engine (Fase 3, 9 tabel — melengkapi
> SELURUH 14 tabel M15), dan M14 Commercial (Fase 4, 8 tabel, Midtrans
> sebagai gateway MVP) kini SEMUA punya migration+RLS lengkap TAPI belum
> punya REST API — menyusul batch terpisah. **Dengan Fase 1-4 "100% tabel"
> selesai, seluruh 94 entitas logis STEP10-D + 3 tabel ADD-NEW di luar
> STEP10-D (api_idempotency_keys, notification_templates,
> partnership_learning_results) = 97 tabel total sudah ada di Supabase.**

## Struktur folder

```
RumahAgen-SaaS/
├── README.md                      # file ini
├── PROJECT_STRUCTURE.md           # urutan baca untuk implementation agent
├── CHECKLIST_RESIDUAL_IMPLEMENTASI.md   # 31 residual unik, dipetakan ke modul + urutan kerja
├── docs/
│   ├── core/current/              # STEP 00–14 + P-SERIES (governance, arsitektur, data, API, RBAC, PRD, dst.)
│   │   └── source-pack-index/
│   └── design/
│       └── wireframes/            # WF-00 s.d. WF-11
├── archive/
│   ├── source-packs-current/      # zip asli STEP/P-series (provenance)
│   └── wireframe-source-packs/    # 27 zip asli WF (provenance)
├── audit/
│   ├── FULL_RECURSIVE_CORPUS_MANIFEST.csv
│   ├── CURRENT_SOURCE_PACK_MANIFEST.csv
│   ├── DEEP_SCAN_REPORT.md
│   ├── WIREFRAME_DEEP_SCAN_REPORT.md
│   └── M10_PERMISSION_SEED_TRACEABILITY.csv   # lacak balik 90 permission_code ke baris asal di master matrix
├── apps/
│   └── web/                       # Next.js — scaffold + middleware API global + M10 route contoh
├── packages/
│   ├── ui/                        # KOSONG
│   └── config/                    # KOSONG
├── supabase/
│   ├── migrations/                # 0001–0078: M10 + M09 + M13 + M03/M14 + M04/M15 + M02/M05/M06/M08/M11 + 0038 index performa + 0039/0040/0042 fix gap RLS DELETE + 0041 fix RLS review-klaim + 0043-0045 fix RLS/trigger attendance-completion + 0046 fungsi adjust_learning_points + 0047-0053 Fase 1 "100% tabel" (13 tabel M01/M03/M07/M11/M12 + index) + 0054-0055 fix RLS status-check & self-approval + 0056-0063 Fase 2 "100% tabel" (13 tabel M04 Learning Catalog + FK fix + index) + 0064-0070 Fase 3 "100% tabel" (9 tabel M15 Awarding Engine + FK fix + index) + 0071-0078 Fase 4 "100% tabel" (8 tabel M14 Commercial, Midtrans MVP + FK fix + index) — SELURUH 97 tabel target selesai (lihat migrations/README.md)
│   └── functions/                 # KOSONG
└── .github/workflows/             # KOSONG
```

## Urutan baca (untuk developer atau AI coding agent)

1. `docs/core/current/00-governance/` — aturan, gate, silsilah rekonsiliasi.
2. `docs/core/current/02-architecture/` — Constitution, System Architecture, Technical Decisions.
3. `docs/core/current/03-data/` — ERD, Dictionary, Schema (Step 10).
4. `docs/core/current/04-api/STEP-11-API-SYNCHRONIZATION` — kontrak API.
5. `docs/core/current/05-authorization/STEP-12-RBAC-PERMISSION-RLS-SYNCHRONIZATION` — sumber `supabase/migrations/0001`–`0010`, `0015`–`0016`.
6. `docs/core/current/00-governance/STEP-00/PRE-00-E_M03_LISTING_REFRESH_GATE_FULL_v1.1.md` — gate khusus, sumber aturan bisnis `supabase/migrations/0018`, `0020`.
7. `docs/design/wireframes/` — referensi visual per modul.
8. **`CHECKLIST_RESIDUAL_IMPLEMENTASI.md`** — mulai dari sini untuk tahu apa yang perlu dikerjakan berikutnya dan urutannya.
9. `supabase/migrations/README.md` dan `apps/web/README.md` — detail teknis apa yang sudah jalan.

## Menjalankan yang sudah ada

```bash
# 1. Push migration M10 + M09 + M13 + M03/M14 + M04/M15 + M02/M05/M06/M08/M11 ke project Supabase Anda
supabase link --project-ref <project-ref>
supabase db push

# 2. Jalankan scaffold Next.js
cd apps/web
cp .env.example .env.local   # isi dari Supabase Dashboard
npm install
npm run dev
```

## Batasan implementasi runtime

Repo ini **sebagian sudah punya kode**, sebagian masih spesifikasi. Jangan
mengasumsikan seluruh SaaS sudah bisa dijalankan — hanya M10 Authorization, M09
Admin Console, M03 Listing + M14 Refresh Allowance, M08 Notifications, M05
Event, M06 Developer/Project/Media/Marketing Kit/Claim, M13 Provider/BYOK, M04
Learning Session/Evidence, M04 LP Economy + Partnership Learning Result, dan
M15 Qualification/Evidence/Awarding (kesepuluhnya lapisan database + REST
API — M15 hanya di atas 5 dari 14 tabel yang disebut STEP11-B8, sisanya
belum ada migration-nya), dan fondasi API yang sudah ada implementasinya.
Modul bisnis lain (M04 Learning Catalog/Activity — courses/learning_paths,
tidak ada tabel di migration manapun — M15 Path/Rule Version/Condition/
Prerequisite/Appeal/Presentation — 9 tabel besar juga belum ada tabelnya,
M14 commercial di luar Refresh Allowance, dst.)
menyusul sesuai urutan di `CHECKLIST_RESIDUAL_IMPLEMENTASI.md`.
