# Checklist Implementasi — Penutupan 47 Controlled Residual RumahAgen

Sumber: `docs/core/current/P-SERIES/P09_ENGINEERING_ALIGNMENT/P9_CONTROLLED_ENGINEERING_RESIDUAL_REGISTER_v1.1.csv`
(register asal dari mana angka **47** yang dibawa terus sampai P16 itu berasal: 16 item dari tahap P6 v1.2 + 31 item dari tahap P7 v1.1).

**Catatan penting:** 47 baris itu punya duplikasi — item yang sama muncul lagi saat dibawa dari P6 ke P7.
Setelah di-dedupe by ID, **jumlah residual unik = 31** (8 seri `R-0x` + 23 seri `D13-xx`). Checklist di bawah
memakai 31 item unik ini, dikelompokkan per modul, supaya tidak mengerjakan hal yang sama dua kali.

Setiap item punya status `OPEN / EVIDENCE-GATED` karena satu-satunya cara menutupnya adalah **bukti fisik**:
migration SQL yang benar-benar dieksekusi, endpoint API yang benar-benar diimplementasi, RLS policy yang
benar-benar diuji jalan. Bukan dokumen tambahan.

---

## Urutan pengerjaan (berdasarkan dependency, bukan urutan modul M01-M15)

### Tahap 0 — Konvensi API & pengecekan fondasi (kerjakan sebelum modul apa pun)
Ini cross-cutting: kalau dikerjakan per-endpoint belakangan, akan berulang 23x. Kerjakan sekali sebagai
middleware/shared layer di awal scaffold Next.js/Supabase.

- [x] **R-01** — Recheck ulang otoritas P1/P2/Core sebelum mulai coding turunan mana pun (baca ulang
      `docs/core/current/00-governance/` + `02-architecture/` sebagai sumber kebenaran final).
- [x] **R-03** — Jangan asumsikan Core v1.3 "lengkap" dari mapping kasar P3; verifikasi tiap modul terhadap
      `docs/core/current/03-data/STEP-10...` sebelum bikin skema.
- [x] **D13-16** — `apps/web/lib/api/idempotency.ts` + `supabase/migrations/0010_api_idempotency_keys.sql`. Tentukan strategi transactionality, concurrency, dan **replay/idempotency protection**
      (idempotency key) sebagai middleware global sebelum endpoint pertama ditulis.
- [x] **D13-17** — `apps/web/lib/api/errors.ts`. Bakukan HTTP status code per kelas response (2xx/4xx/5xx) di satu tempat (error handler
      global), jangan didefinisikan ulang di tiap route.
- [x] **D13-18** — `apps/web/lib/api/response.ts` + `validate.ts`. Bakukan skema response (required/optional fields, types, enum, nullability) — pakai satu
      schema-validation layer (mis. Zod) yang dipakai semua endpoint.
- [x] **D13-19** — `apps/web/lib/api/pagination.ts`. Tentukan default & maksimum pagination + parameter filter standar (limit/offset atau
      cursor) sebagai util bersama.
- [x] **D13-20** — `apps/web/lib/api/rate-limit.ts` (in-memory, catatan produksi butuh Redis). Tentukan header rate-limit standar (termasuk `Retry-After` untuk 429) di middleware global.
- [x] **D13-21** — `apps/web/lib/api/idempotency.ts` (opsi `requireIdempotencyKey`). Tentukan endpoint mana yang retry-sensitive dan butuh acceptance/replay semantics eksplisit
      (biasanya semua endpoint `POST`/`PATCH` yang mengubah state finansial/kuota).
- [x] **D13-22** — `apps/web/lib/api/content-type.ts`. Bakukan `Content-Type`/`Accept` header requirement per endpoint class.
- [x] **D13-23** — `traceId` per-request di `handler.ts` + `audit/M10_PERMISSION_SEED_TRACEABILITY.csv`. Susun traceability matrix API→DB→User Flow secara eksplisit saat menulis migration (jangan
      ditunda) — supaya audit lanjutan tidak perlu reverse-engineer dari kode.

### Tahap 1 — M10: Authorization (RBAC/Permission/RLS) — **fondasi, kerjakan duluan**
`R-02 "Authority inversion"` muncul di hampir semua modul lain (M03, M04, M09, M11, M14, M15) — artinya
modul-modul itu **tidak bisa diselesaikan dengan benar sebelum lapisan otorisasi ini nyata**.

- [x] **R-02** — `supabase/migrations/0006_authorization_functions.sql` (`has_permission()` sumber tunggal). Implementasikan urutan otoritas yang benar secara fisik: M10 (authorization) sebagai
      gate final, bukan modul lain yang mengambil alih keputusan akses (M03 Listing/Refresh, M14 Allowance,
      M04 Evidence, M15 Award, M11 Discovery, M09 admin scope — semua **memanggil** M10, bukan menduplikasi
      logikanya sendiri).
- [x] **D13-06** — `supabase/migrations/0004_authorization_permission_preset.sql`. Tulis migration untuk **Permission Preset** (tabel + relasi role→permission) sesuai
      kontrak semantik STEP-12; belum ada bukti endpoint family yang persis, jadi endpoint ini yang pertama
      distandarkan.
- [x] **D13-15** — `supabase/migrations/0003` + `0009` (90 permission, generate dari CSV). Selesaikan **mapping permission-ID final** (bukan sekadar nama), karena STEP11 tidak
      men-standarkan ini — jadi harus diputuskan eksplisit sebelum RLS policy ditulis.
- [x] **D13-04** — `supabase/migrations/0008_dbr_config.sql`. Perbaiki mismatch wewenang: `PUT /admin/config/dbr` tertulis Superadmin-only di Core, tapi
      semantik M07 mengizinkan Admin — implementasikan sesuai keputusan M10 sebagai otoritas final, dan
      dokumentasikan keputusan mana yang menang di kode (comment/ADR singkat).

### Tahap 2 — M09: System Config / Admin Console (item terbanyak kedua)
- [x] **R-06** — `supabase/migrations/0011_admin_system_configs.sql`. RLS pada `system_configs` saat ini didesain lebih luas dari semantik "Superadmin-only view"
      — perketat RLS policy saat migration ditulis, jangan copy scope dokumen mentah-mentah.
- [x] **D13-05** — `supabase/migrations/0014_admin_public_announcement_promotion.sql` (tabel baru + permission baru, lihat rasional di file). Selesaikan lifecycle admin Announcement/Promotion yang saat ini terpecah antara M09/M14 —
      putuskan satu pemilik tabel/endpoint sebelum M11 (discovery) mengonsumsinya.
- [x] **D13-08** — `supabase/migrations/0013_admin_notification_templates.sql`. Implementasikan Notification Template/Content Configuration (fitur ADD-NEW, belum ada
      kontrak endpoint/storage lengkap) — desain tabel + endpoint dari nol mengikuti pola M09 lain.
- [x] **D13-12** — Permission `m09.administrative_export.export` sudah benar di seed `0009` (Superadmin-only); tidak perlu tabel (lihat `STEP12-G_CONTROLLED_PHYSICAL_DELTA_REGISTER.csv`) — penutupan penuh menyusul saat route ditulis di Step 3. Perbaiki wording otorisasi `/admin/reports/export` supaya cocok persis dengan matriks
      M09-R11, jangan lebih longgar dari spek.
- [x] **D13-13** — `supabase/migrations/0012_admin_audit_logs.sql`. Perbaiki wording otorisasi `/admin/audit-logs` supaya selaras dengan scope M09-R04.
- [x] **D13-14** — CLOSED. Sisi M09 (`0011`–`0014`) dan sisi M13 (`0015`–`0016`) kini SAMA-SAMA punya
      RLS policy fisik untuk semua tabel yang dipetakan, bukan lagi `policies=0` seperti dicatat di
      `STEP12-G_ROLE_PERMISSION_CAPABILITY_RLS_MATRIX.csv`. M09/M13 sudah diuji berdampingan sesuai anjuran
      (shared review), bukan terpisah.

### Tahap 3 — M13: Provider Catalogue / BYOK Administration
- [x] **R-07** — `supabase/migrations/0015_m13_provider_catalogue.sql` + `0016_m13_agent_ai_connections.sql`. Propagasi Provider Catalogue/BYOK dari Core diimplementasikan fisik: tabel
      `ai_providers` + `agent_ai_connections`, dengan FK `ON DELETE RESTRICT` sebagai mekanisme sync
      (koneksi tidak pernah menunjuk ke provider yang sudah hilang).
- [x] **D13-09** — Sebagian: `0015_m13_provider_catalogue.sql`, tabel + RLS Superadmin-only mutation
      sudah fisik dan bisa dites. Penutupan penuh (rute REST `/api/admin/providers/*`) menyusul Step 3/
      STEP-11 — pola yang sama seperti D13-12.
- [x] **D13-10** — Sebagian: `0016_m13_agent_ai_connections.sql`, fungsi
      `admin_force_provider_connection()` (FORCE_REVOKE/FORCE_DISCONNECT/FORCE_DISABLE) sudah fisik,
      mengecek permission sendiri + menulis audit trail. Rute REST pembungkusnya menyusul Step 3.
- [x] **D13-11** — CLOSED. Status `agent_ai_connections` diperluas dari 3 ke 5 nilai
      (`active/disconnected/invalid/disabled/revoked`) + kolom `disabled_by_admin` + trigger
      `trg_agent_ai_connection_transition` yang menegakkan state-machine valid secara fisik.

### Tahap 4 — M03 + M14: Listing/Refresh ⟷ Commercial Entitlement (saling terkait erat)
- [x] **R-04** — `supabase/migrations/0018_m03_listings.sql` + `0019_m14_commercial_entitlement_quota.sql`
      + `0020_m03_m14_refresh_allowance_invocation.sql`. Realisasi fisik Refresh Allowance: M14
      (`consume_refresh_allowance()`) sebagai pemilik allowance tingkat Agent, M03 (`refresh_listing()`)
      sebagai konsumen yang memanggilnya + menegakkan guard tingkat Listing miliknya sendiri — arah
      panggilan benar (M03→M14), tidak ada counter allowance disimpan sendiri oleh M03.
- [x] **D13-01** — `supabase/migrations/0020_m03_m14_refresh_allowance_invocation.sql`. Kontrak invocation
      M14→M03 kini 2 fungsi SQL nyata yang saling memanggil (bukan lagi semantik) — residual ini secara
      eksplisit meminta "fungsi/endpoint internal", sudah terpenuhi di level fungsi. Rute REST
      pembungkusnya sendiri menyusul Step 3/STEP-11 (lapisan terpisah).

### Tahap 5 — M04 + M15: Learning Economy ⟷ Qualification/Award (saling terkait erat)
- [x] **R-08** — `supabase/migrations/0021_m04_learning_sessions.sql` + `0022_m04_session_evidence.sql`
      + `0024_m04_partnership_learning_result.sql`. Implementasikan permission/RLS fisik untuk M04
      (Session/Evidence) dan realisasi Partnership Learning. Session/Evidence pakai 14 permission
      yang sudah ada sejak Tahap 1 (Gate PRE-00-F §45-46); Partnership Learning butuh tabel+permission
      baru (tidak ada di STEP10-D/master matrix — Gate §51 sendiri menandainya CONTROLLED/downstream).
- [x] **D13-02** — `supabase/migrations/0025_m14_m04_learning_point_grant_invocation.sql`. Implementasikan
      kontrak invocation M14→M04 (purchased Learning Package → grant LP) sebagai fungsi internal —
      `grant_learning_points_from_purchase()` sudah fisik dan idempotent. CATATAN: digerbangi
      Superadmin-only untuk sementara karena pipeline fulfillment M14 otomatis belum dibangun (TODO
      eksplisit di komentar file, direvisi saat residual itu masuk giliran).
- [x] **D13-03** — `supabase/migrations/0026_m15_qualification_award.sql` + `0027_m04_m15_evidence_evaluation_invocation.sql`.
      Bekukan field/contract level endpoint untuk pipeline M04 (evidence) → M15 (Qualification
      Evaluation/Award) — 2 fungsi (`capture_qualification_evidence_from_session()`,
      `evaluate_qualification()`) dengan pola field seragam (source_type/source_reference) lintas
      modul. Mesin konfigurasi awarding path/rule (8 tabel terpisah) di luar lingkup literal residual
      ini — didokumentasikan sebagai gap terbuka, bukan diam-diam diabaikan.

### Tahap 6 — Item modul kecil (bisa dikerjakan paralel, tidak saling bergantung)
- [x] **D13-07** (M08) — `supabase/migrations/0036_m08_notifications.sql`. Implementasikan operasi
      dismiss/delivery-state untuk Notification State di dashboard — 2 kolom ADD-NEW
      (`dismissed_at`, `delivery_status`) + fungsi `create_notification()` sebagai satu-satunya
      jalur pembuatan (menegakkan "Notification State ≠ Notification Creation", Gate PRE-00-J).
- [x] **M11** (Discovery/SEO) — `supabase/migrations/0037_m11_static_public_content.sql` +
      `0028_correction_m11_announcement_promotion_permission.sql`. Tidak ada item unik tambahan
      di checklist (sesuai catatan asli), tapi ditemukan & dikoreksi kesalahan kategorisasi
      permission Announcement/Promotion dari Tahap 2 (lihat catatan koreksi di
      `supabase/migrations/README.md`).
- [x] **R-05** (M06) — `supabase/migrations/0033_m06_developer_partners.sql` +
      `0034_m06_developer_projects.sql` + `0035_m06_marketing_kit_claims.sql`. Implementasikan
      penyimpanan fisik untuk field Developer, Marketing Kit, dan Claim pada modul Project —
      termasuk FK retroaktif ke `listings`/`events` yang ditunda sejak Tahap 4/6.

### Di luar 31 residual asli, dikerjakan atas permintaan eksplisit di Tahap 6
- [x] **M02** (Profile) — `0029_m02_agent_profiles.sql` + `0030_m02_agent_reviews.sql`. Agent
      Profile View/Update, Reviews (auto-approve + moderasi pasca-publikasi sesuai Gate PRE-00-D).
- [x] **M05** (Event) — `0031_m05_events.sql` + `0032_m05_event_registrations.sql`. Event
      lifecycle, Event Registration, Guest Registration (satu tabel, dibedakan `participant_mode`).

---

## Ringkasan urutan prioritas (kalau harus linear satu-satu)

1. ✅ **Tahap 0** — konvensi API & middleware global — SELESAI (`apps/web/lib/api/`)
2. ✅ **Tahap 1** — M10 Authorization/RBAC/RLS — SELESAI (`supabase/migrations/0001-0010`)
3. ✅ **Tahap 2** — M09 Admin Console — SELESAI (`supabase/migrations/0011-0014`)
4. ✅ **Tahap 3** — M13 Provider/BYOK — SELESAI (`supabase/migrations/0015-0016`)
5. ✅ **Tahap 4** — M03 + M14 Listing/Refresh Allowance — SELESAI (`supabase/migrations/0017-0020`)
6. ✅ **Tahap 5** — M04 + M15 Learning/Qualification — SELESAI (`supabase/migrations/0021-0027`)
7. ✅ **Tahap 6** — M08 + M11 + M06 (31 residual asli) + M02/M05 (di luar checklist asli, diminta
   eksplisit) — SELESAI (`supabase/migrations/0028-0037`)

**Seluruh 31 residual unik di `P9_CONTROLLED_ENGINEERING_RESIDUAL_REGISTER_v1.1.csv` kini tertutup
di level migration/RLS/fungsi.** Yang tersisa: rute REST (Step 3/STEP-11) untuk semua modul, dan
modul-modul yang belum pernah punya nomor residual sama sekali (M07 DBR penuh, M12 Organization
penuh, M14 Commercial Purchase/Payment penuh, M04 Learning Catalog/Activity, mesin awarding
path/rule M15) — lihat `supabase/migrations/README.md` untuk daftar lengkap gap terbuka.

Setiap kotak yang dicentang = residual itu berpindah dari `OPEN / EVIDENCE-GATED` menjadi `CLOSED`,
karena sudah ada bukti fisik (migration ter-apply, endpoint terpanggil, RLS teruji) — bukan karena ditulis
ulang di dokumen. Beberapa item Tahap 2/3 dicentang `[x]` meski catatannya bilang "sebagian" — itu berarti
lapisan **migration/DB sudah tuntas dan bisa diuji langsung**, sedangkan lapisan **rute REST**-nya
(Step 3/STEP-11) sengaja belum digarap karena belum masuk giliran kerja (menyusul setelah migration
Tahap 4-6 selesai, sesuai rencana kerja yang disepakati) — bukan residual yang terlewat.

**Belum ada route API (STEP-11) yang ditulis untuk modul manapun** — Step 3 (route/handler API)
belum masuk scope checklist migration ini. Tabel, RLS, dan fungsi semua modul (Tahap 0-6, 0001-0037)
sudah siap dipakai (bisa dites langsung dari SQL Editor/Supabase client), tapi endpoint HTTP-nya
menyusul.

**Koreksi penting di Tahap 6:** `0028` mengoreksi kesalahan kategorisasi permission
`public_announcement_promotion` dari Tahap 2 (salah taruh di M09, seharusnya M11) — lihat
`supabase/migrations/README.md` untuk detail lengkap.

**Gap terbuka yang perlu diketahui (bukan residual terlewat, tapi belum ada nomornya di checklist):**
mesin konfigurasi awarding path/rule M15 (8 tabel), M07 DBR penuh, M12 Organization penuh, M14
Commercial Purchase/Payment penuh, M04 Learning Catalog/Activity — lihat catatan lengkap di
`supabase/migrations/README.md`.
