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
| **M13 — Provider Catalogue / BYOK** | ✅ **Kode nyata** (DB layer) | `supabase/migrations/0015`–`0016` — `ai_providers`, `agent_ai_connections` (status 5-state + trigger lifecycle), fungsi `admin_force_provider_connection()` — menutup R-07, D13-11 penuh; D13-09/D13-10 sebagian (rute REST menyusul Step 3) |
| **M03 — Listing** + **M14 — Refresh Allowance/Entitlement** | ✅ **Kode nyata + REST API** | `supabase/migrations/0017`–`0020` — `listings` (skema penuh + trigger lifecycle), rantai kuota M14 (5 tabel), fungsi `refresh_listing()` memanggil `consume_refresh_allowance()` — menutup R-04, D13-01 penuh. **STEP11-B2 (API-025/026/027/028/029/035/237)**: `apps/web/app/api/listings/**` + `apps/web/app/api/agents/me/listings/**` — route REST nyata kedua di repo ini (setelah M10), diuji langsung ke project Supabase. Media/price-history/from-project/admin-queue (API-030–034/036–038) belum diimplementasi (tabelnya belum ada) |
| **M04 — Learning Session/Evidence** + **M15 — Qualification/Award** | ✅ **Kode nyata** | `supabase/migrations/0021`–`0027` — 8 tabel Session/Evidence M04, LP economy, Partnership Learning Result (baru), 5 tabel Qualification/Award M15, fungsi `grant_learning_points_from_purchase()` + `capture_qualification_evidence_from_session()`/`evaluate_qualification()` — menutup R-08, D13-02, D13-03 (lihat catatan gap terbuka: mesin awarding path/rule belum dibangun) |
| **M02 — Profile** | ✅ **Kode nyata** | `supabase/migrations/0029`–`0030` — `agent_profiles`, `agent_reviews` (auto-approve sesuai Gate PRE-00-D, bukan default literal STEP10-D) — di luar 31 residual asli, dikerjakan atas permintaan eksplisit |
| **M05 — Event** | ✅ **Kode nyata + REST API** | `supabase/migrations/0031`–`0032` — `events`, `event_provider_bindings`, `event_registrations` (termasuk Guest Registration) — di luar 31 residual asli, dikerjakan atas permintaan eksplisit. **STEP11-A (API-079-084)**: `apps/web/app/api/events/**` — diuji end-to-end penuh (create→publish→RSVP self/guest→delete). Migration `0039` menutup gap RLS DELETE yang hilang di `0031`; perbaikan mapping error 403 di `lib/api/handler.ts` berlaku untuk semua endpoint mutasi |
| **M06 — Developer/Project/Marketing Kit/Claim** | ✅ **Kode nyata + REST API penuh** | `supabase/migrations/0033`–`0035` — `developer_partners`, `developer_projects` (+ FK retroaktif ke `listings`/`events`), `marketing_kit`, `agent_project_claims` — menutup **R-05**. **STEP11-B3 (API-116-122) + kelengkapan penuh**: `apps/web/app/api/developer-projects/**`, `developer-partners/**`, `marketing-kit/**`, `project-media/**`, `claims/**`, `admin/developer-projects/**` — diuji end-to-end menyeluruh (self-service create, moderation-gate publish, media, marketing kit, klaim+review+approve, delete). Migration `0040` menutup gap RLS DELETE (pola sama seperti M05); migration `0041` memperbaiki **bug fungsional** RLS review-klaim yang ditemukan saat testing (Developer Partner tidak bisa approve klaim di project miliknya sendiri). Hanya Approval Claim PDF yang belum ada (tidak ada tabel/mekanisme fisik) |
| **M08 — Dashboard/Notification State** | ✅ **Kode nyata + REST API** | `supabase/migrations/0036` — `notifications` (+ dismiss/delivery-state) + fungsi `create_notification()` sebagai satu-satunya jalur insert — menutup **D13-07**. **STEP11-A (API-131/132/133/134/137)**: `apps/web/app/api/notifications/**`, `admin/notifications/push`, `dashboard/summary` — diuji end-to-end (push ditolak untuk Agent, diterima untuk Superadmin; read/dismiss/read-all/dashboard summary semua sesuai kontrak) |
| **M11 — Public Discovery/SEO** | ✅ **Kode nyata** | `supabase/migrations/0037` + koreksi `0028` (permission `public_announcement_promotion` dari Tahap 2 dipindah ke M11 yang benar) — `static_public_content` |
| M07 (di luar `dbr_config`), M12 (di luar organizations dasar), M14 (di luar Refresh Allowance), M04 (di luar Session) | ⏳ Belum ada kode | Belum punya nomor residual — lihat `supabase/migrations/README.md` |
| `packages/ui`, `packages/config` | ⏳ Belum ada kode | Placeholder |

> Modul-modul yang belum dikerjakan **masih murni dokumentasi/wireframe** —
> jangan asumsikan seluruh repo sudah bisa jalan penuh. **Seluruh 31 residual
> unik di `P9_CONTROLLED_ENGINEERING_RESIDUAL_REGISTER_v1.1.csv` sudah tertutup
> di level migration/RLS/fungsi (Tahap 1-6)**, ditambah 5 modul (M02/M05/M06
> lengkap/M08/M11) yang diminta eksplisit di luar checklist asli.
> Route REST (STEP-11) baru 6 slice (M10 `GET /api/authorization/roles`, M03
> Listing + M14 Refresh, M09 Admin Console, M08 Notifications, M05 Event, dan
> M06 Developer/Project/Media/Marketing Kit/Claim — lengkap) — modul lain
> baru punya migration+RLS+fungsi, belum punya endpoint HTTP.

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
│   ├── migrations/                # 0001–0041: M10 + M09 + M13 + M03/M14 + M04/M15 + M02/M05/M06/M08/M11 + 0038 index performa + 0039/0040 fix RLS DELETE events/developer_projects + 0041 fix RLS review-klaim (lihat migrations/README.md)
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
Event, M06 Developer/Project/Media/Marketing Kit/Claim (keenamnya lapisan
database + REST API), M13 Provider/BYOK (lapisan database), dan fondasi API
yang sudah ada implementasinya. Modul bisnis lain (learning, commercial di
luar Refresh Allowance, dst.) menyusul sesuai urutan di
`CHECKLIST_RESIDUAL_IMPLEMENTASI.md`. Route REST (STEP-11) untuk M13 masih
menyusul — tabel, RLS, dan fungsinya sudah bisa diuji langsung dari SQL
Editor/Supabase client, tapi belum ada endpoint HTTP.
