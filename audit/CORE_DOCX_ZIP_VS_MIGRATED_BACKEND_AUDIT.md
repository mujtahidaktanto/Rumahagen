# Audit: Core `.docx`/`.zip` Corpus (STEP-09/11/12) vs Backend Supabase yang Sudah Dimigrasi

## Konteks

Lanjutan `audit/CORE_VS_MIGRATED_BACKEND_AUDIT.md` (yang meng-cover 580 file
`.md`/`.csv` langsung terbaca dan menutup 12 temuan lewat migration
`0084`-`0093`). Pass itu SENGAJA melewatkan 65 file `.docx`/`.zip` (STEP-09
Architecture, STEP-11 API Synchronization, STEP-12 Authorization/RBAC)
karena butuh diekstrak dulu. File-file itu sekarang diekstrak (unzip +
strip XML `.docx` → teks polos) ke scratchpad dan dibaca penuh oleh 5 agent
paralel:

- **STEP-09 Architecture** (Project Constitution, System Architecture,
  Technical Decisions Q01-Q66, Dependency Manifest)
- **STEP-11 API Sync bagian 1** (00, A baseline inventory, B1-B5 — M01/M02/
  M03/M04/M06)
- **STEP-11 API Sync bagian 2** (B8/B9/B10 — M15/M11/M13, plus C/D/E/F/G/H
  cross-cutting HTTP/webhook/governance)
- **STEP-12 RBAC bagian 1** (00/01/B — termasuk `STEP12-01_ROLE_PERMISSION_
  MASTER_MATRIX.csv`, matriks role-permission yang selama ini cuma bisa
  dirujuk tidak langsung lewat gate lain)
- **STEP-12 RBAC bagian 2** (C/D/E/F/G/H — scope/ownership/physical RLS/
  cross-module/API-traceability/final gate)

## Ringkasan

| Kategori | Jumlah | Status |
|---|---|---|
| **Konflik antar-dokumen Core, ditemukan & diresolusi** | 1 (2 permission) | ✅ Diperbaiki `0094` |
| **Kontradiksi arsitektur (ADR dilanggar implementasi)** | 1 | ✅ Diperbaiki `0095` |
| **Gap fitur/endpoint besar (belum dibangun, bukan bug)** | 6 | Didokumentasikan, perlu keputusan produk |
| **Dokumentasi Core sendiri basi (bukan bug kode)** | 2 | Tidak perlu aksi kode |
| **Konvensi berbeda dari kontrak tapi berfungsi setara** | 3 | Tidak direkomendasikan diubah (blast radius besar, manfaat kecil) |

---

## ✅ Diperbaiki: Konflik STEP12-01 Master Matrix vs Gate PRE-00-K (migration `0094`)

Migration `0084` (batch perbaikan Tier 1 sebelumnya) memperbaiki 3 bug
permission berdasarkan `PRE-00-K_M09_ADMINISTRATION_AUTHORITY_GATE_FULL_
v1.0.md` (STEP-00, gate lebih awal). Setelah `STEP12-01_ROLE_PERMISSION_
MASTER_MATRIX.csv` (STEP-12, granular, lebih baru) akhirnya bisa dibaca
penuh, ditemukan **2 dari 3 perbaikan itu ternyata terbalik**:

- **Audit Log** (`m09.administrative_audit_log.view`): Master Matrix row 31
  + `STEP12-01_ROLE_PERMISSION_CONFLICT_REGISTER.csv` finding S12-01-001
  mengunci Superadmin=ALL, **Admin=ALL, Manager=NONE**. `0084` menerapkan
  KEBALIKANNYA (Manager=ALL, Admin=NONE) mengikuti PRE-00-K.
- **Provider Catalogue** (`m09.provider_catalogue.mutation` +
  `m13.provider_catalogue.create/edit/enable/disable/retire`): Master
  Matrix + Conflict Register S12-01-001 eksplisit: *"Provider Catalogue
  mutation is Superadmin-only ... Admin/Manager do not receive mutation
  authority"*. `0084` menerapkan Admin=ALL mengikuti PRE-00-K. Dikonfirmasi
  independen oleh AGENT KEDUA yang membaca dokumen berbeda sama sekali
  (`STEP12-C_CROSS_MODULE_AUTHORIZATION_CONFLICT_REGISTER.csv` C-006 dan
  `STEP12-D_CROSS_MODULE_RLS_CONFLICT_REGISTER.csv` D-006 — keduanya
  menyimpulkan hal yang sama).
- **Reconciliation Manual Correction** (perbaikan ke-3 di `0084`): TIDAK
  dipertentangkan Master Matrix (tidak ada baris yang membahasnya) — tetap
  benar, tidak disentuh.

**Keputusan resolusi**: STEP12-01 menang atas PRE-00-K. Ini BUKAN
preferensi baru yang saya buat — ini PRESEDEN yang proyek ini sendiri sudah
tetapkan di `0008_dbr_config.sql`: *"STEP12-01 dieksekusi setelah STEP11
handoff, hasilnya secara eksplisit menang atas versi lama ... 'Later
current M10 granular matrix governs operational delegation; older umbrella
wording retained only as provenance'"*. PRE-00-K (STEP-00) adalah
"umbrella wording" yang kalah terhadap STEP12-01 (STEP-12, matrix granular
+ Conflict Register yang secara eksplisit memutuskan pertentangan ini).

**Migration `0094`** membalik 2 dari 3 grant `0084` kembali ke versi
STEP12-01: Audit Log kembali Admin=ALL/Manager=NONE; Provider Catalogue
kembali Superadmin-only (RLS `ai_providers_write_superadmin` dikembalikan
ke hardcode `is_superadmin()`). Diuji nyata: Admin `GET /admin/audit-logs`
→ **200 dengan baris** (dikembalikan), Manager → **200, 0 baris**; Admin
`POST /ai-providers` → **403** (dikembalikan Superadmin-only), Superadmin →
**201**. Data uji dibersihkan.

---

## ✅ Diperbaiki: Rate limiting in-memory melanggar ADR-018 (migration `0095`)

`docs/core/current/02-architecture/STEP-09-C/.../TECHNICAL_DECISIONS...docx`
ADR-018 (LOCKED, "EXISTING APPROVED ADRs — PRESERVED"): *"Rate limiting /
application cache = Supabase Postgres `rate_limit_log`"* — baris tepat di
atasnya eksplisit: *"No new backend service, database engine, **cache
vendor**, queue worker, session vendor, AI platform or other core platform
is introduced by this synchronization."*

`apps/web/lib/api/rate-limit.ts` (versi lama) memakai in-memory `Map` —
komentar migration-nya sendiri sudah mengakui "TIDAK reliable di deployment
serverless multi-instance" dan menyarankan solusi produksi "ganti store
dengan backend bersama (mis. **Upstash Redis**)" — persis jenis "cache
vendor baru" yang dilarang ADR-018 di atasnya sendiri.

**Migration `0095`**: tabel `rate_limit_log` (satu baris per key, upsert
atomik) + fungsi `check_and_increment_rate_limit()` (SECURITY DEFINER,
`GRANT EXECUTE` ke `anon`+`authenticated` supaya request tanpa sesi login
pun tetap kena rate limit berbasis IP). `lib/api/rate-limit.ts` diganti
total memanggil RPC ini (fungsi jadi `async`), `lib/api/handler.ts`
disesuaikan `await`. Diuji nyata: request biasa → header `X-RateLimit-*`
benar, baris tersimpan di Postgres (dikonfirmasi lewat query langsung,
BUKAN in-memory); 65 request cepat berturut-turut → **429 tepat di request
ke-60** (limit 60/menit) dengan `retryAfterSeconds` benar; counter di DB
bertambah sesuai jumlah request. Data uji dibersihkan.

---

## Gap fitur/endpoint besar — didokumentasikan, BUKAN bug, perlu keputusan produk

Ini semua kasus "locked sebagai endpoint yang sudah ada/harus dipertahankan"
di STEP-11, tapi belum pernah dibangun sama sekali di `apps/web/app/api/**`.
Beda dari Tier 1/2/3 sebelumnya (yang semuanya bug/gap DB), ini murni
pekerjaan REST API + kadang tabel baru yang belum dikerjakan:

1. ~~**M01 Identity/Auth — seluruh permukaan API kosong total.**~~
   **SELESAI (migration `0096`, 2026-09-19).** 10 endpoint dibangun + trigger
   sinkronisasi `auth.users`↔`public.users`. Google OAuth dan template OTP
   kode diverifikasi dengan login/email asli. Detail: `migrations/README.md`
   bagian `0096`.
2. ~~**M11 SEO/discovery — seluruh keluarga endpoint kosong.**~~
   **SELESAI (migration `0097`, 2026-09-19).** 7 route dibangun (4 sitemap +
   robots.txt + admin config + reindex), tabel baru `seo_config`. Static
   Public Content & Announcement/Promotion lifecycle SENGAJA tidak dibangun
   (Core §8/§9/§13 melarang invent route untuk keduanya — tetap
   "CONTROLLED API GAP" by design, bukan sisa pekerjaan). Detail:
   `migrations/README.md` bagian `0097`.
3. ~~**M13 `POST /ai-assistant/chat` — belum ada.**~~
   **SELESAI (2026-09-19/22, tanpa migration SQL baru).** Adapter
   OpenAI/Anthropic/Gemini (`lib/ai/adapters.ts`) + route
   `app/api/ai-assistant/chat/route.ts`. Diverifikasi dengan panggilan
   Gemini ASLI (API key Google AI Studio milik user) — balasan sungguhan
   diterima, direproduksi 2x. Detail: `migrations/README.md` bagian
   "M13 AI Invocation".
4. **M15 Award Appeal — endpoint DAN tabel fisik kosong total.**
   `POST/GET /awards/{id}/appeals`, `POST .../{appeal_id}/decide`
   (STEP11-B8 §14, "PRESERVE EXACT CURRENT CONTRACT") — tidak ada tabel
   `award_appeals` di migration manapun, tidak ada route. Restore
   (`awards/{id}/restore`) sudah ada tapi tanpa appeal di depannya, alur
   jadi tidak konsisten dengan kontrak yang dikunci.
5. **M09 `GET /admin/reports/export` — permission benar, route tidak ada.**
   `m09.administrative_export.export` sudah di-seed benar (superadmin-only)
   sejak `0009`, tapi tidak ada route yang memakainya.
6. **M09 Admin agent activation queue — kemungkinan sudah tidak relevan.**
   `GET /admin/agents/pending`, approve/reject/suspend dikunci STEP11-A
   sebagai endpoint yang harus dipertahankan — tapi setelah `0083`
   (menghapus gate Pending Review, akun langsung aktif pasca-OTP), alur
   "antrian aktivasi agent" ini kemungkinan besar sudah tidak relevan lagi
   secara desain produk. Bukan sesuatu yang perlu dibangun tanpa
   konfirmasi dulu.

**Rekomendasi**: jangan dibangun sekarang tanpa arahan — ini keputusan
scope/prioritas produk (mana yang mau dibangun sebelum/sesudah UI Bolt.new),
bukan "bug" yang harus segera ditutup seperti Tier 1-3 sebelumnya.

---

## Dokumentasi Core sendiri yang basi — TIDAK perlu aksi kode

- **"16 tabel RLS-enabled tanpa policy"** (`STEP12-D/G` zero-policy
  register) — dicek langsung ke `pg_policies` live: SEMUA 16 tabel itu
  (`roles, role_permissions, organizations, audit_logs, dbr_config`, dst.)
  sudah punya 1-3 policy nyata sejak migration `0007/0011/0012/0015/0035/
  0041/0071/0074/0084/0085/0089`. Snapshot Core ini dibuat SEBELUM migration
  itu semua ada — bukan celah keamanan nyata, cuma catatan Core yang
  ketinggalan zaman.
- **"M10 Permission Preset belum ada secara fisik"** (`STEP12-D/G/H`) —
  ternyata SUDAH ada sejak `0004_authorization_permission_preset.sql` +
  RLS `0007`, dan implementasinya bahkan sudah menegakkan aturan granular
  yang diminta STEP12-C sendiri (Manager=OWN dengan syarat target role
  Agent, satu preset aktif per akun, item tidak boleh melebihi baseline
  role). Core tidak pernah "melihat" migration ini — gap dokumentasi Core,
  bukan gap kode.

## Konvensi berbeda dari kontrak tertulis tapi berfungsi setara — tidak direkomendasikan diubah

- **Pagination**: Core mendokumentasikan kontrak `page/per_page/sort/order`;
  kode nyata pakai `limit/offset` konsisten di 100+ route, tanpa sort/order.
  Mengubah ini sekarang berarti breaking change ke SELURUH REST API yang
  sudah dibangun, untuk manfaat yang tidak jelas (STEP11-C sendiri
  melunakkan: kontrak per-endpoint "incomplete", bukan strict-locked).
- **Error taxonomy**: Core mendokumentasikan pemetaan error per-domain;
  kode pakai 8 kode generik (`UNAUTHENTICATED, FORBIDDEN, NOT_FOUND`, dst.)
  konsisten di semua modul. Fungsional benar, cuma tidak granular
  per-domain seperti didokumentasikan — mengubah ini juga breaking change
  besar untuk manfaat kecil.
- **Beberapa path endpoint berbeda nama** (`developer-partners/events` vs
  event umum, `/courses/{id}/quiz/submit` vs `/quizzes/{id}/submit`,
  `/admin/courses/*` vs resource course biasa) — fungsinya SAMA, RLS-nya
  benar, cuma penamaan path berbeda dari yang didokumentasikan Core. Tidak
  ada manfaat mengganti nama route yang sudah jalan dan sudah diuji.

## Bersih sepenuhnya

- Tidak ada instance BARU dari pola bug "0041" (RLS `has_permission()`
  dengan parameter owner yang salah, secara diam-diam menolak aktor yang
  seharusnya berwenang) ditemukan di seluruh migration — dicek ulang
  menyeluruh oleh agent STEP-12 Part 2.
- Tidak ada pelanggaran arah dependency antar-modul yang dikunci Dependency
  Manifest (STEP-09).
- M03 Listing/Search/Lead/Refresh, M06 Developer/Project/Media/Claim, M04
  Learning Session/Enrollment, M14 Payment/Midtrans webhook (idempotency +
  signature + reconciliation) — semua diverifikasi cocok dengan kontrak
  STEP-11 yang dikunci.

## Rekomendasi

1. ✅ **Selesai** — konflik STEP12-01 (`0094`) dan rate limiting (`0095`)
   sudah diperbaiki dan diuji nyata.
2. **Perlu keputusan Anda**: 6 gap fitur besar di atas (M01 Auth, M11 SEO,
   M13 AI chat, M15 Appeal, M09 export, M09 activation queue) — mana yang
   mau diprioritaskan, kalau ada, sebelum/sesudah UI dibangun di Bolt.new.
3. Sisanya (dokumentasi Core basi, konvensi berbeda) tidak butuh aksi apa
   pun dari sisi kode.
