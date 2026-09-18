# apps/web

Scaffold Next.js (App Router + TypeScript) untuk RumahAgen. Ini hasil **Step 2**
dari rencana eksekusi (Tahap 0 checklist: item D13-16 s.d. D13-23).

## Yang sudah ada (nyata, bisa dijalankan)

- `lib/supabase/client.ts`, `server.ts`, `admin.ts` — 3 varian client sesuai konteks
  (browser, server component/route handler biasa, admin/service-role terbatas).
- `lib/api/` — middleware global:
  - `errors.ts` — `ApiError` + status code baku (D13-17)
  - `response.ts` — bentuk response sukses seragam (D13-18)
  - `validate.ts` — validasi Zod untuk body & query (D13-18)
  - `pagination.ts` — default/maks limit-offset (D13-19)
  - `rate-limit.ts` — header `X-RateLimit-*` + `Retry-After` (D13-20)
  - `idempotency.ts` — dukungan header `Idempotency-Key`, tersimpan di tabel
    `api_idempotency_keys` (migration `0010`) (D13-16, D13-21)
  - `content-type.ts` — validasi `Content-Type` untuk request mutasi (D13-22)
  - `handler.ts` — `withApiHandler()`, pembungkus wajib semua route API
- `app/api/authorization/roles/route.ts` — **contoh route nyata** (`GET /api/authorization/roles`)
  yang memakai semua middleware di atas DAN benar-benar query ke tabel `roles`
  dari migration Step 1 — bukti kedua step ini sudah nyambung.
- **M03 Listing + M14 Refresh** (STEP11-B2, API-025/026/027/028/029/035/237) —
  route nyata pertama di luar M10:
  - `app/api/listings/route.ts` — `POST /listings` (API-025), `GET /listings` (list dasar)
  - `app/api/listings/[id]/route.ts` — `GET` (API-026), `PUT` (API-027, ordinary edit), `DELETE` (API-029)
  - `app/api/listings/[id]/status/route.ts` — `PATCH .../status` (API-028, lifecycle/publish)
  - `app/api/listings/[id]/refresh/route.ts` — `POST .../refresh` (API-237, membungkus
    fungsi `refresh_listing()` dari migration `0020` — menutup D13-01 di lapisan HTTP)
  - `app/api/agents/me/listings/route.ts` — `GET /agents/me/listings` (API-035)
  - `lib/validation/listings.ts` — skema Zod, field persis mengikuti kolom `listings` (0018)
  - `lib/api/handler.ts` diperluas: `withApiHandler()` sekarang meneruskan `params`
    dynamic segment Next.js 15 (`[id]`) ke `ApiContext` — perubahan non-breaking,
    dibutuhkan supaya route `/listings/{id}` bisa baca `:id` dari URL.
  - Otorisasi TIDAK diduplikasi di route manapun — sepenuhnya RLS/trigger dari
    `0018`/`0020` (R-02). Endpoint mutasi (`POST`/`PATCH .../status`/`POST .../refresh`)
    mewajibkan header `Idempotency-Key` (D13-21) karena menyentuh kuota/lifecycle.
  - **Diuji nyata** terhadap project Supabase (bukan cuma compile): `GET /listings`,
    `GET /listings/{id}` (404 untuk id tidak ada), validasi Idempotency-Key wajib,
    dan `401` untuk endpoint yang butuh login tanpa sesi — semua merespons sesuai
    kontrak. `POST`/`PATCH`/`refresh` butuh `SUPABASE_SERVICE_ROLE_KEY` terisi
    (dipakai `lib/api/idempotency.ts`) untuk diuji penuh — belum diisi di environment
    pengujian ini karena secret harus diambil manual dari Dashboard, bukan lewat MCP.
  - Route M03 lain di STEP11-B2 (media, price-history, from-project, admin
    pending/approve/reject — API-030-034/036-038) BELUM diimplementasi karena
    tabel pendukungnya (listing media, price history) belum ada di migration
    manapun — di luar scope batch ini, bukan diam-diam diabaikan.

- **M09 Admin Console** (STEP11-A API-129/149/238/239 + M11 API-135/136) —
  batch route kedua:
  - `app/api/admin/config/system/route.ts` + `[key]/route.ts` — `GET`/`PUT`
    `/admin/config/system` (API-238/239), dimodelkan per-key (bukan satu objek
    besar) mengikuti bentuk tabel `system_configs` (0011)
  - `app/api/admin/config/dbr/route.ts` — `GET`/`PUT /admin/config/dbr`
    (API-129) atas `dbr_config` (0008)
  - `app/api/admin/audit-logs/route.ts` — `GET /admin/audit-logs` (API-149),
    read-only murni — TIDAK ADA route POST/PUT/DELETE (menegakkan
    append-only; satu-satunya jalur tulis tetap `log_audit_event()` dari 0012)
  - `app/api/admin/notification-templates/route.ts` + `[type]/route.ts` —
    `GET` list/satu + `PUT` update (ADD-NEW, tidak ada route evidenced di
    STEP11-A untuk resource ini — tidak ada `POST` karena 6 nilai `type`
    sudah dikunci CHECK constraint & di-seed penuh sejak 0013)
  - `app/api/banners/route.ts` — `GET /banners/promotions` publik (API-135,
    M11 discovery), filter `status='active'` + jendela `schedule_at`/`expires_at`
    eksplisit di kode (bukan cuma RLS) supaya staf yang panggil route publik
    ini tetap dapat kontrak "hanya yang aktif"
  - `app/api/admin/banners/route.ts` + `[id]/route.ts` — `POST /admin/banners`
    (API-136) + `GET`/`PUT`/`DELETE` pelengkap CRUD, atas
    `public_announcement_promotion`, RLS lewat permission `m11.announcement_promotion.publish`
    (koreksi 0028 — BUKAN `m09.public_announcement_promotion.manage` yang deprecated)
  - `lib/validation/admin.ts` — skema Zod untuk kelima resource di atas
  - **Diuji nyata** end-to-end sebagai Superadmin sungguhan (akun test
    dibuat/dihapus lewat Admin API, bukan RLS di-bypass): create/read/update
    system config, update dbr_config, baca audit log, update notification
    template, siklus penuh banner draft→active→publik-terlihat→delete. Semua
    sesuai kontrak; data uji dibersihkan total setelahnya.
  - `GET /admin/reports/export` (API-138) dan `GET/POST/PUT /admin/internal-users`
    (API-139-142) SENGAJA tidak diimplementasi — STEP11-A tidak memberi
    dataset/skema evidenced untuk keduanya (export: tidak jelas data apa yang
    diekspor; internal-users: butuh akses `auth.users.email` yang belum ada
    pola aksesnya di repo ini) — bukan diam-diam diabaikan.

- **M08 Notifications** (STEP11-A API-131/132/133/134/137) — batch route ketiga:
  - `app/api/notifications/route.ts` — `GET /notifications` (API-131), inbox
    milik sendiri, scoped eksplisit `user_id = ctx.userId` (pola sama seperti
    `agents/me/listings`) walau RLS Superadmin/Admin/Manager sebenarnya
    scope-nya 'all' — endpoint ini semantiknya inbox pribadi, bukan browse-all
  - `app/api/notifications/[id]/read/route.ts` — `PUT .../read` (API-132)
  - `app/api/notifications/[id]/dismiss/route.ts` — `PUT .../dismiss` (ADD-NEW,
    tidak ada di STEP11-A baseline — menutup D13-07 di lapisan HTTP; tanpa
    route ini kolom `dismissed_at` dari 0036 tidak punya jalur pakai dari luar)
  - `app/api/notifications/read-all/route.ts` — `PUT /notifications/read-all`
    (API-133), scoped eksplisit ke user sendiri dengan alasan yang sama
  - `app/api/admin/notifications/push/route.ts` — `POST /admin/notifications/push`
    (API-134), bungkus `create_notification()` (0036) — otorisasi
    Superadmin/Admin-only ditegakkan DI DALAM fungsi, bukan diduplikasi di route
  - `app/api/dashboard/summary/route.ts` — `GET /dashboard/summary` (API-137),
    SENGAJA dipersempit ke ringkasan notifikasi (`total`/`unread`) milik
    sendiri — STEP11-A tidak memberi dataset dashboard yang lebih luas
    (pola sama seperti alasan skip `/admin/reports/export` di M09)
  - `lib/validation/notifications.ts` — skema Zod untuk resource di atas
  - **Diuji nyata**: push notifikasi ditolak untuk Agent (403 FORBIDDEN, benar
    — hanya Superadmin/Admin), berhasil untuk Superadmin (201), lalu siklus
    penuh sebagai Agent: list → dashboard unread=1 → read → dashboard
    unread=0 → dismiss → hilang dari list default → muncul lagi dengan
    `?include_dismissed=true` → push 2 lagi → read-all (`updated_count:2`) →
    dashboard `total:2, unread:0` (baris yang di-dismiss tidak dihitung).
    Data uji dibersihkan total setelahnya.

- **M05 Event** (STEP11-A API-079/080/081/082/083/084) — batch route keempat:
  - `app/api/events/route.ts` — `GET /events` (API-079, list), `POST /events`
    (API-082, create)
  - `app/api/events/[id]/route.ts` — `GET` (API-080), `PUT` (API-083, SATU
    route generic mencakup update biasa MAUPUN transisi status
    published/cancelled/rejected — beda dari Listing yang punya route
    `.../status` terpisah, mengikuti bentuk kontrak STEP11-A untuk Event),
    `DELETE` (API-084)
  - `app/api/events/[id]/rsvp/route.ts` — `POST .../rsvp` (API-081), satu
    endpoint untuk pendaftaran self MAUPUN guest (`participant_mode`), sesuai
    desain tabel gabungan `event_registrations` (0032)
  - `lib/validation/events.ts` — skema Zod untuk resource di atas
  - **GAP DITEMUKAN & DITUTUP**: migration `0031_m05_events.sql` tidak pernah
    membuat RLS policy untuk command `DELETE` di tabel `events` (diverifikasi
    lewat `pg_policies` — hanya select/insert/update yang ada), padahal
    STEP11-A meng-evidence `API-084 DELETE /events/{id}` sebagai route yang
    harus dipertahankan. Tanpa policy itu, endpoint delete TIDAK BISA
    berfungsi sama sekali untuk siapa pun (RLS default-deny, bukan
    Superadmin-bypass-otomatis). Ditutup lewat migration BARU
    `supabase/migrations/0039_events_delete_policy.sql` — memakai permission
    `m05.event.update` yang sudah ada (tidak ada `m05.event.delete` di master
    matrix 50-baris frozen, jadi tidak mengarang permission baru).
  - **PERBAIKAN LINTAS-ROUTE** di `lib/api/handler.ts`: ditemukan saat test
    RSVP guest sebagai Agent (yang scope-nya memang tidak mencakup
    `m05.guest_registration.create`) — INSERT yang ditolak RLS `WITH CHECK`
    melempar error Postgres asli (`42501`) yang sebelumnya jatuh ke 500
    generik, bukan 403. Sekarang di-mapping ke `FORBIDDEN`/403 secara
    terpusat di `withApiHandler()` — otomatis berlaku untuk SEMUA endpoint
    mutasi yang sudah ada (M03/M08/M09), tidak perlu ditambal satu-satu.
  - **Diuji nyata**: create (status default `pending_approval`, tidak publik
    terlihat) → update biasa → publish (`status=published`, langsung terlihat
    publik) → RSVP self (201) → RSVP guest tanpa email (422, validasi) →
    RSVP guest sebagai Agent (403, benar — bukan lagi 500) → RSVP guest
    sebagai Instructor yang punya izin (201, benar) → DELETE (200, menutup
    gap) → GET setelahnya (404). Data uji dibersihkan total.

- **M06 Developer/Project/Media/Marketing Kit/Claim** (STEP11-B3
  API-116-122 + kelengkapan penuh atas apa yang sudah dibangun di migration
  0033-0035) — batch route kelima.
  - `app/api/developer-projects/route.ts` — `GET /developer-projects`
    (API-116, publik/scoped)
  - `app/api/developer-projects/[id]/route.ts` — `GET .../{id}` (API-117)
  - `app/api/developer-projects/[id]/claim/route.ts` — `POST .../claim`
    (API-118)
  - `app/api/admin/developer-projects/route.ts` — `POST`/`GET
    /admin/developer-projects` (API-119/120) — nama path mengikuti kontrak
    evidenced ("administrative") apa adanya, TAPI RLS `developer_projects_insert`
    (0034) juga mengizinkan Developer Partner scope OWN membuat project
    miliknya sendiri lewat path yang SAMA — RLS yang membedakan wewenang,
    bukan route
  - `app/api/admin/developer-projects/[id]/route.ts` — `PUT`/`DELETE`
    (API-121/122), `PUT` SATU route generic mencakup update biasa MAUPUN
    publish/activate (trigger `enforce_developer_project_publish_permission`
    dari 0034 — F11-B3-015 "ordinary Update does not imply Publish/Activate")
  - `app/api/developer-partners/route.ts` + `[id]/route.ts` — `GET`/`POST`/
    `PUT`/`DELETE`, direktori Developer Partner staf-dikelola (RLS
    `developer_partners_manage`, 0033)
  - `app/api/developer-projects/[id]/marketing-kit/route.ts` +
    `app/api/marketing-kit/[id]/route.ts` — CRUD Marketing Kit (PDF
    brochure/pricelist) per project (RLS `marketing_kit_manage`/`_select`, 0035)
  - `app/api/developer-projects/[id]/media/route.ts` +
    `app/api/project-media/[id]/route.ts` — CRUD Project Media (foto/video
    resmi) per project (RLS `developer_project_media_manage`/`_select`, 0034)
  - `app/api/developer-projects/[id]/claims/route.ts` (list klaim per
    project, untuk Developer Partner/staf review) + `app/api/agents/me/claims/route.ts`
    (klaim milik sendiri) + `app/api/claims/[id]/route.ts` (`GET`/`PUT`
    transisi status approve/reject/revoke)
  - `lib/validation/developer-projects.ts`, `developer-partners.ts`,
    `marketing-kit.ts`, `claims.ts`, `project-media.ts` — skema Zod
  - **2 GAP DITEMUKAN & DITUTUP lewat migration**:
    1. `supabase/migrations/0040_developer_projects_delete_policy.sql` —
       `0034` tidak pernah membuat RLS `DELETE` untuk `developer_projects`
       (pola sama seperti events/0039), padahal API-122 evidenced.
    2. `supabase/migrations/0041_fix_agent_project_claims_review_policy.sql`
       — **bug fungsional** (bukan gap dokumentasi): RLS
       `agent_project_claims_review` (0035) mengecek kepemilikan HANYA lewat
       `agent_id` (si pengklaim), padahal Developer Partner juga punya scope
       'own' di permission `m06.claim.review/approve/reject/revoke` (seed
       0009) untuk me-review klaim di PROJECT MILIKNYA — beda rantai
       kepemilikan yang tidak pernah dicek policy lama. Dikonfirmasi lewat
       test nyata: Developer Partner approve klaim di project sendiri
       ditolak RLS (404) sebelum diperbaiki. Ditambahkan klausul OR yang
       mengecek lewat `project_id -> developer_projects.developer_id ->
       developer_partners.user_id` (pola sama seperti `marketing_kit_select`).
  - **Diuji nyata secara menyeluruh**: Superadmin buat Developer Partner
    (201) → Developer Partner buat project sendiri (201, RLS 'own') → publik
    lihat `coming_soon` → DP tambah Project Media (201) → publik lihat media
    → DP tambah Marketing Kit (201) → anon TIDAK bisa lihat kit (kosong,
    benar) → Agent klaim project (201) → Agent lihat klaim sendiri (200) →
    DP lihat klaim di project-nya (200) → **DP approve klaim → 404 (bug
    ditemukan)** → migration 0041 diterapkan → **DP approve klaim → 200
    (benar, `reviewed_by`/`reviewed_at` otomatis terisi trigger)** → DP coba
    publish project → 403 (benar, moderation-gated) → Superadmin publish →
    200 → Agent coba buat marketing kit project orang lain → 403 (benar) →
    Superadmin update+delete kit → 200 → delete media → 200 → delete project
    (menutup gap 0040) → 404 setelahnya. Data uji dibersihkan total.

- **M13 Provider/BYOK** (STEP11-B10 §4 evidenced routes + kelengkapan penuh
  atas migration 0015-0016) — batch route keenam.
  - `app/api/ai-providers/route.ts` — `GET` (evidenced) + `POST` (ADD-NEW,
    B10-C02: "mutation is Superadmin-only semantically, but exact mutation
    routes are not evidenced" — RLS `ai_providers_write_superadmin` sudah
    mendukung penuh sejak 0015)
  - `app/api/ai-providers/[id]/route.ts` — `GET`/`PUT`/`DELETE` (edit/enable/
    disable/retire, satu action code menutup kelimanya sesuai catatan 0015)
  - `app/api/ai-connections/route.ts` — `POST` (evidenced) — buat koneksi
    BYOK, hanya bisa dipanggil role dengan permission
    `m13.own_byok_connection.create` (**Developer Partner**, BUKAN Agent —
    dikonfirmasi lewat test nyata: Agent ditolak 403, Developer Partner
    berhasil 201)
  - `app/api/agents/me/ai-connections/route.ts` — `GET` (evidenced)
  - `app/api/ai-connections/[id]/route.ts` — `GET`, `PUT` (rotate key/ubah
    status), `DELETE` (evidenced di kontrak HTTP, TAPI diimplementasikan
    sebagai **soft-disconnect** `status='disconnected'`, BUKAN SQL DELETE
    nyata — migration 0016 sengaja tidak membuat RLS DELETE demi jejak audit;
    keputusan desain itu lebih diutamakan daripada mengubah RLS)
  - `app/api/ai-connections/[id]/test/route.ts` — `POST .../test`
    (evidenced) — validasi bahwa koneksi ada/aktif/`encrypted_api_key` bisa
    didekripsi; **TIDAK** memanggil API provider AI eksternal sungguhan
    (butuh adapter per-provider, kredensial asli dikirim ke pihak ketiga,
    potensi biaya nyata — di luar scope REST-API-layer batch ini)
  - `app/api/admin/ai-connections/[id]/force/route.ts` — ADD-NEW (B10-C03:
    "FORCE_REVOKE/FORCE_DISCONNECT/FORCE_DISABLE... not evidenced"), TAPI
    fungsi SQL `admin_force_provider_connection()` sudah lengkap sejak 0016
    — endpoint ini membungkusnya (pola sama seperti listings/refresh)
  - `lib/crypto/byok.ts` — **ADD-NEW infrastruktur enkripsi** (AES-256-GCM)
    untuk `encrypted_api_key` — belum ada pola enkripsi apa pun di repo
    sebelum M13. Key dari env var `BYOK_ENCRYPTION_KEY` (wajib, tidak ada
    fallback tertanam). `api_key` mentah TIDAK PERNAH keluar lagi dari route
    manapun (field `encrypted_api_key` selalu di-strip dari response,
    termasuk hasil RPC `admin_force_provider_connection()` yang
    me-return seluruh baris)
  - `lib/validation/ai-providers.ts` — skema Zod untuk kelima resource di atas
  - **Diuji nyata secara menyeluruh**: Superadmin buat provider (201) →
    Agent coba buat koneksi BYOK → **403** (benar, `m13.own_byok_connection.create`
    hanya Developer Partner) → Developer Partner buat koneksi (201,
    `encrypted_api_key` terverifikasi ter-enkripsi di DB, bukan plaintext) →
    list milik sendiri (200) → test koneksi (200, `last_validated_at` terisi)
    → rotate key (200) → Developer Partner coba force-disable → **403**
    (benar, bukan wewenangnya) → Superadmin force-disable (200,
    `disabled_by_admin=true`) → Developer Partner coba reaktivasi sendiri →
    **409 CONFLICT** (benar, trigger 0016 menolak — awalnya 500 generik,
    diperbaiki jadi mapping error yang jelas) → Superadmin membalikkan
    `disabled_by_admin` (200) → Developer Partner soft-disconnect (200,
    `status=disconnected`, baris TETAP ada di DB — bukan hard delete). Data
    uji dibersihkan total.

- **M04 Learning Session/Enrollment/Provider Binding/Evidence/Attendance/
  Completion/Artifacts** (STEP11-B5 API-086-115, 37 record evidenced) —
  batch route ketujuh, yang terbesar sejauh ini (21 route file).
  - `app/api/learning/sessions/route.ts` + `[id]/route.ts` + `[id]/status/route.ts`
    — CRUD + lifecycle (API-086-091)
  - `app/api/learning/sessions/[id]/enrollments/route.ts` (API-092/094) +
    `app/api/agents/me/session-enrollments/route.ts` (API-093) +
    `app/api/learning/session-enrollments/[id]/route.ts` + `.../status/route.ts`
    (API-095/096/097)
  - `app/api/learning/sessions/[id]/provider-binding/route.ts` (API-098/099/100)
  - `app/api/integrations/learning-session/providers/[provider]/events/route.ts`
    (API-101, provider event ingress) — **ditambahkan shared-secret minimal**
    (`X-Webhook-Secret` vs env `LEARNING_SESSION_WEBHOOK_SECRET`, ADD-NEW di
    luar STEP11-B5) karena endpoint ini pakai admin client (bypass RLS) dan
    STEP11-B5 sendiri eksplisit tidak mengevidence skema signature
    per-provider — tanpa penjagaan apa pun, endpoint ini terbuka bebas di
    internet untuk menyuntik evidence palsu
  - `app/api/learning/sessions/[id]/evidence/route.ts` (API-102) +
    `app/api/learning/session-enrollments/[id]/evidence/route.ts` (API-103)
  - `app/api/learning/sessions/[id]/attendance/route.ts` (API-104) +
    `.../attendance/evaluate/route.ts` (API-105) +
    `app/api/learning/session-enrollments/[id]/attendance/route.ts` (API-106)
  - `app/api/learning/sessions/[id]/completion-outcomes/route.ts` (API-107) +
    `.../completion/evaluate/route.ts` (API-108) +
    `app/api/learning/session-enrollments/[id]/completion/route.ts` (API-109)
  - `app/api/learning/sessions/[id]/artifacts/route.ts` (API-110/111) +
    `app/api/learning/session-artifacts/[id]/route.ts` (API-112)
  - `app/api/learning/sessions/[id]/event/route.ts` (API-113/114/115)
  - `app/api/learning/sessions/[id]/assignments/route.ts` — ADD-NEW (Q-M04-G-01/G-02
    dibahas STEP11-B5 sebagai konsep, tanpa API ID; tabel+RLS
    `learning_session_assignments` sudah lengkap sejak 0021)
  - `lib/validation/learning-sessions.ts` — skema Zod untuk semua resource di atas
  - **3 GAP/BUG DITEMUKAN & DITUTUP lewat migration** (yang terbanyak dalam
    satu batch sejauh ini):
    1. `0042_session_enrollments_delete_policy.sql` — gap RLS DELETE (pola
       sama seperti 0039/0040), TAPI migration 0021 sendiri eksplisit
       melarang permission baru untuk tabel ini (Gate §26 "NO NEW
       PERMISSION") — jadi policy baru memakai ekspresi otorisasi yang SAMA
       PERSIS dengan `UPDATE` yang sudah ada (staf saja), bukan permission baru.
    2. `0043_fix_attendance_completion_manage_policy.sql` +
       `0044_fix_attendance_completion_owner_resolution.sql` — **bug
       fungsional dua lapis**: RLS `session_attendance_evaluations_manage`/
       `session_completion_outcomes_manage` (0022) memanggil `has_permission()`
       TANPA argumen owner_id sama sekali, membuat scope 'own' Instructor
       tidak pernah terpenuhi (0043 mencoba perbaiki dengan subquery
       langsung di ekspresi policy — TAPI subquery itu sendiri tunduk RLS
       actor pemanggil dan gagal juga untuk kasus yang sama; 0044
       memperbaikinya dengan benar lewat fungsi `SECURITY DEFINER` baru
       `session_owner_for_enrollment()`, pola sama seperti `has_permission()`
       sendiri).
    3. `0045_fix_completion_trigger_rls_visibility.sql` — **bug KETIGA dari
       kelas yang sama**: trigger `enforce_completion_requires_active_enrollment()`
       (0022) melakukan `SELECT` langsung ke `session_enrollments` tanpa
       `SECURITY DEFINER`, sehingga tunduk RLS dan salah menolak Instructor
       yang meng-evaluate completion enrollment milik Agent lain walau
       status baris sungguhan sudah `active`.
  - **Diuji nyata secara menyeluruh** (Instructor buat session → publish →
    Agent enroll+duplikat-ditolak → staf aktivasi enrollment (Agent
    ditolak, sesuai Gate §26) → Superadmin buat provider binding
    (Instructor ditolak, sesuai Gate §30) → webhook ingress tanpa secret
    ditolak 401 → dengan secret berhasil, duplikat idempotency_key ditolak
    409 → evidence ter-baca via join → **Instructor evaluate attendance
    ditolak 2x sampai bug RLS ketemu & diperbaiki, akhirnya berhasil** →
    **completion evaluate juga ditolak sampai bug trigger ketemu &
    diperbaiki, akhirnya berhasil** → Agent baca attendance/completion
    miliknya sendiri → assignment HOST → event association →
    delete enrollment (menutup gap 0042) → 404 setelahnya. Data uji
    dibersihkan total.

- **M04 LP Economy + Partnership Learning Result** (STEP11-B4 §LP Economy
  evidenced routes + Partnership Learning Result ADD-NEW/Gate PRE-00-F §51)
  — batch route kedelapan, terkecil sejauh ini (7 route file) karena tabel
  "Learning Catalog/Activity" (courses/learning_paths/learning_activities)
  yang dibahas luas di STEP11-B4 memang tidak pernah dibuat di migration
  manapun (lihat catatan `supabase/migrations/README.md` "Yang SENGAJA belum
  termasuk").
  - `app/api/agents/me/learning-points/route.ts` — `GET` (evidenced), saldo
    LP milik sendiri; mengembalikan objek saldo nol default kalau baris
    `learning_point_accounts` belum pernah dibuat (Agent belum pernah
    bertransaksi LP)
  - `app/api/agents/me/learning-points/transactions/route.ts` — `GET`
    (evidenced), riwayat transaksi LP milik sendiri, paginated
  - `app/api/admin/learning-point-adjustments/route.ts` — `POST` (evidenced)
    — koreksi manual saldo LP oleh staf, membungkus fungsi SQL baru
    `adjust_learning_points()` (migration 0046, pola sama seperti
    `grant_learning_points_from_purchase()` yang sudah ada)
  - `app/api/partnership-learning-results/route.ts` (`POST`/`GET`) +
    `app/api/partnership-learning-results/[id]/route.ts` (`GET`/`PUT`) —
    ADD-NEW (tidak ada di STEP11-B4, sumbernya Gate PRE-00-F §51 — lihat
    rasional di migration 0024); `POST` default `partner_user_id` ke
    pemanggil; `PUT` mengubah `validation_status` HANYA bisa Superadmin
    (ditegakkan trigger `trg_partnership_result_validation_superadmin_only`
    dari 0024, tidak diduplikasi di route)
  - `lib/validation/learning-points.ts` +
    `lib/validation/partnership-learning-results.ts` — skema Zod untuk
    kedua resource di atas
  - **1 GAP DITEMUKAN & DITUTUP lewat migration baru**:
    `0046_learning_point_adjustment_function.sql` — permission
    `m04.learning_point.adjust` sudah di-seed sejak migration 0023 khusus
    untuk koreksi manual staf, TAPI tabel `learning_point_transactions`
    hanya punya RLS `SELECT`, tidak ada jalur `INSERT` apa pun lewat client
    langsung untuk siapapun. Ditutup dengan fungsi `SECURITY DEFINER` baru
    `adjust_learning_points()` yang mengecek permission itu sendiri lalu
    insert transaksi + auto-create account kalau belum ada (pola sama
    seperti `grant_learning_points_from_purchase()`).
  - **1 BUG DITEMUKAN & DITUTUP lewat centralized handler.ts fix**:
    percobaan Superadmin melakukan adjustment yang membuat saldo negatif
    (mis. `-1000` dari saldo `70`) ditolak dengan benar oleh CHECK
    constraint DB (`learning_point_accounts_balance_projection_check`),
    TAPI hasilnya 500 generik, bukan error business-rule yang bersih.
    Ditambahkan mapping terpusat baru di `lib/api/handler.ts` untuk kode
    Postgres `23514` (check_violation) → 409 CONFLICT, supaya semua endpoint
    mutasi otomatis dapat status yang benar tanpa duplikasi per-route.
  - **Diuji nyata secara menyeluruh**: Agent baca saldo LP sebelum pernah
    bertransaksi → default nol (bukan 404) → riwayat transaksi kosong →
    Agent coba adjust saldo sendiri → **403** (benar, endpoint khusus staf)
    → Superadmin `+100` → 201, saldo jadi 100 → Superadmin `-30` → 201,
    saldo jadi 70 → Superadmin `-1000` (would go negative) → awalnya **500**
    (bug) → diperbaiki jadi **409 CONFLICT** setelah fix handler.ts, saldo
    tetap 70 (tidak berubah, benar) → Developer Partner buat partnership
    learning result → 201, `validation_status: pending` → DP coba
    validasi sendiri → **403** (benar, ditolak trigger) → Superadmin
    validasi → 200, `validated_by`/`validated_at` otomatis terisi trigger.
    Data uji dibersihkan total.

- **M15 Qualification/Evidence/Awarding** (STEP11-B8 API-200-236, 37 record
  evidenced — TAPI hanya 5 dari 14 tabel yang disebut dokumen yang benar-benar
  ada di migration 0026: `title_definitions`, `title_authority_scopes`,
  `qualification_evaluations`, `qualification_evidence`, `award_instances`.
  9 tabel lain — `awarding_paths`/`awarding_path_versions`/
  `awarding_rule_versions`/`awarding_path_rules`/`awarding_condition_groups`/
  `awarding_conditions`/`awarding_prerequisites`/`award_qualifying_paths`/
  `title_presentations` — SENGAJA tidak pernah dibuat migration 0026
  (didokumentasikan eksplisit di sana sebagai "mesin konfigurasi jalur/aturan
  kelulusan", residual terpisah untuk masa depan). Batch ini HANYA membangun
  REST layer di atas 5 tabel yang benar-benar ada; endpoint Path/Rule
  Version, Condition/Prerequisite, Appeal, dan Presentation (STEP11-B8
  sendiri menandainya CONTROLLED API GAP / tidak ada tabel) TIDAK dibangun —
  membangunnya butuh migration baru untuk 9 tabel besar itu dulu, jauh di
  luar lingkup "REST layer atas skema yang sudah ada") — batch route
  kesembilan, 20 route file.
  - `app/api/titles/route.ts` (`GET`/`POST`) + `[id]/route.ts` (`GET`/`PUT`)
    + `[id]/status/route.ts` (`PATCH`) — API-200/201/202/203/204, CRUD+status
    Title Definition
  - `app/api/titles/[id]/authority-scopes/route.ts` (`GET`/`POST`) +
    `app/api/title-authority-scopes/[id]/route.ts` (`PUT`/`DELETE`) —
    ADD-NEW (STEP11-B8 F11-B8-001: "no dedicated exact endpoint evidenced"),
    TAPI tabel+RLS `title_authority_scopes` sudah lengkap sejak 0026 dan
    **wajib ada** supaya `POST /awards` bisa berfungsi sama sekali (trigger
    `enforce_award_requires_authority_scope` menolak award tanpa scope aktif)
  - `app/api/qualification-evaluations/route.ts` (`POST`, create manual) +
    `[id]/route.ts` (`GET`) + `[id]/evidence/route.ts` (`GET`) +
    `app/api/agents/me/qualification-evaluations/route.ts` (`GET`) —
    API-216/217/222/219
  - `app/api/qualification-evidence/route.ts` (`POST`, create manual) +
    `[id]/route.ts` (`GET`) — API-220/221
  - `app/api/qualification-evidence/[id]/evaluate/route.ts` — ADD-NEW,
    membungkus fungsi `evaluate_qualification()` (0027) yang sudah fisik
    sejak Tahap 6 tapi belum pernah punya route. STEP11-B8 API-218 menulis
    path `POST /qualification-evaluations/{evaluation_id}/evaluate`, TAPI
    fungsi SQL yang benar-benar ada bertumpu pada **evidence_id** (satu
    evidence → satu evaluation BARU), bukan mengubah evaluation lama —
    endpoint di-key oleh evidence_id supaya cocok dengan fungsi SQL yang
    fisik, bukan memaksakan path dokumen yang tidak match realisasinya (pola
    sama seperti M13 ai-connections DELETE yang direalisasikan sebagai
    soft-disconnect)
  - `app/api/qualification-evidence/from-session-completion/route.ts` —
    ADD-NEW, membungkus `capture_qualification_evidence_from_session()`
    (0027) — separuh pertama pipeline D13-03 (M04
    `session_completion_outcomes` → M15 `qualification_evidence`), fisik
    sejak Tahap 6 tapi juga belum pernah punya route sampai batch ini
  - `app/api/awards/route.ts` (`GET`/`POST`) + `[id]/route.ts` (`GET`) +
    `[id]/lifecycle/route.ts` (`PATCH`, revoke) + `[id]/restore/route.ts`
    (`POST`) + `[id]/provenance/route.ts` (`GET`) +
    `app/api/agents/me/awards/route.ts` (`GET`) +
    `app/api/agents/[id]/awards/route.ts` (`GET`) — API-223/224/225/226/227/
    228/229/233. `provenance` menggabungkan `historical_snapshot` (kolom
    JSONB di `award_instances` sendiri) dengan entri `audit_logs` terkait —
    dipanggil lewat client biasa (bukan admin client) supaya RLS
    `audit_logs_select` (butuh `m09.administrative_audit_log.view`)
    otomatis menyaring: staf lihat log lengkap, non-staf otomatis dapat
    array kosong tanpa percabangan permission manual. `lifecycle` PATCH
    HANYA mengimplementasikan revoke — transisi `expired` tidak diimplementasikan
    karena tidak ada mekanisme auto-expire (cron/job) di manapun pada repo ini
  - `lib/validation/titles.ts` + `lib/validation/qualification.ts` +
    `lib/validation/awards.ts` — skema Zod untuk semua resource di atas
  - **TIDAK ADA migration baru** — kelima tabel M15 yang ada sudah punya RLS
    lengkap sejak 0026 tanpa gap (beda dari M04/M05/M06 yang masing-masing
    butuh migration fix), batch ini murni REST layer
  - **Verifikasi desain (bukan bug)**: master matrix M15 memberi Agent scope
    'own' untuk `m15.award.award`/`m15.award.revoke`/`m15.award.manage` (0009)
    — arti sesungguhnya, dikonfirmasi lewat test nyata, seorang Agent BISA
    self-award dan self-revoke selama title yang dituju punya
    `title_authority_scopes` aktif (trigger tetap menggerbangi). Ini
    keputusan permission dari master matrix (M10/STEP12 domain), bukan bug
    REST layer — tidak diubah di batch ini. Juga dikonfirmasi: award berstatus
    `restored` TIDAK otomatis terlihat publik lagi (RLS `award_instances_select`
    hanya mengecualikan status `active` untuk visibility publik, `restored`
    tetap butuh `m15.award.manage` untuk dilihat) — sesuai literal RLS 0026,
    bukan diubah.
  - **Diuji nyata secara menyeluruh** (pipeline penuh M04→M15 pertama kali
    diuji end-to-end): Superadmin buat title (201) → Agent coba buat title →
    **403** → GET title publik (200, anon) → POST award TANPA authority scope
    → **409 CONFLICT** (trigger) → Superadmin buat authority scope (201) →
    POST award lagi → **201** (berhasil) → GET award publik (200, status
    active) → Agent (pemilik award, scope 'own') revoke award sendiri → 200,
    status jadi revoked → GET award publik setelah revoke → **404** (RLS
    menyembunyikan non-active dari publik) → Superadmin restore → 200, status
    jadi restored → restore lagi → **404** (guard status='revoked' tidak
    match lagi) → GET award publik setelah restore → tetap **404** (restored
    ≠ active, sesuai RLS) → Agent POST qualification-evidence untuk diri
    sendiri (201) → Agent evaluate evidence sendiri via
    `evaluate_qualification()` → 201, `result=pending` (evidence_payload
    kosong) → Instructor buat session → publish → Agent enroll → Superadmin
    aktivasi → Instructor evaluate completion (`result=passed`) →
    **Instructor coba capture-evidence-from-session untuk Agent lain →
    403** (benar, scope 'own' Instructor tidak mencakup evaluasi murid) →
    Superadmin capture-evidence-from-session → 201, `evidence_payload`
    berisi field yang sama persis dengan `session_completion_outcomes`
    sumbernya → Superadmin evaluate evidence tersebut →
    **result=qualified** (benar, sesuai kontrak field CASE mapping
    'passed'→'qualified') — pipeline D13-03 M04→M15 terverifikasi utuh
    lewat HTTP untuk pertama kalinya. Data uji dibersihkan total.

## Batch: M04 Learning Catalog/Activity REST API (26 route file)

REST API + Zod di atas migration+RLS Fase 2 "100% tabel" (`0056`–`0063`,
lihat root `README.md`) yang sebelumnya hanya diuji lewat PostgREST mentah.
Modul ini domain self-paced/katalog — TERPISAH dari `learning_sessions`
M04 Session/live (B5) yang sudah punya REST API sejak batch sebelumnya.

- **Courses**: `courses/route.ts` (GET list publik+filter kategori, POST
  create — `created_by` default `ctx.userId`), `courses/[id]/route.ts`
  (GET detail, PUT update), `courses/[id]/status/route.ts` (PATCH transisi
  lifecycle draft→published dst.), `courses/[id]/lessons/route.ts` (GET
  list, POST create lesson), `course-lessons/[id]/route.ts` (PUT, DELETE)
- **Enrollment**: `courses/[id]/enroll/route.ts` (POST, `agent_id:
  ctx.userId`, unique-violation Postgres `23505` dipetakan ke `CONFLICT`),
  `agents/me/enrollments/route.ts` (GET milik sendiri, paginated),
  `enrollments/[id]/route.ts` (GET, PATCH `progress_percent`/`status`,
  hanya pemilik)
- **Quiz** (subsistem paling sensitif keamanan di batch ini):
  `courses/[id]/quizzes/route.ts` (GET, POST), `quizzes/[id]/questions/
  route.ts` (GET — hanya `question_text`/`question_type`, POST),
  `quiz-questions/[id]/options/route.ts` (POST **saja**, sengaja TIDAK ADA
  GET — opsi mentah beserta `is_correct` tidak boleh pernah di-list lewat
  route publik manapun)
  - `quizzes/[id]/take/route.ts` — **ADD-NEW, deviasi dari path literal
    STEP11-B4** (dikunci ke `quiz_id`, bukan `/courses/{id}/quiz/take`,
    karena skema mengizinkan multi-quiz per course). GET: verifikasi
    `enrollment_id` milik sendiri lewat client RLS biasa, lalu pakai
    `createAdminClient()` HANYA untuk membaca `quiz_options` (bypass RLS
    staff-only), field `is_correct` di-strip manual di kode (`select("id,
    question_id, option_text")`) sebelum dikirim ke Agent — pola yang sama
    dengan strip `encrypted_api_key` di M13 BYOK
  - `quizzes/[id]/submit/route.ts` — **ADD-NEW, deviasi sama**. Verifikasi
    kepemilikan enrollment via client biasa; admin client dipakai untuk baca
    `quizzes`/`courses.passing_grade`/`quiz_options.is_correct`; grading
    server-side per soal (exact-match set jawaban terpilih vs kunci jawaban),
    hitung persentase, bandingkan ke `passing_grade` untuk `passed`, lalu
    INSERT `quiz_attempts` lewat client RLS biasa (mengunci `enrollment_id`
    ke milik sendiri)
- **Certificate**: `agents/me/certificates/route.ts` (GET milik sendiri),
  `admin/certificates/route.ts` (POST issue — staff-only murni lewat RLS,
  Agent tidak pernah diberi grant `m04.certificate.manage` sama sekali,
  bukan filter di kode)
- **Learning Path/Activity**: `learning/paths/route.ts` (GET, POST —
  ADD-NEW karena STEP11-B4 menandai ini sebagai gap API terkontrol),
  `learning/paths/[id]/route.ts` (GET, PUT), `learning/paths/[id]/
  versions/route.ts` (GET, POST — duplicate `version_no` dipetakan ke
  `CONFLICT`), `learning/paths/[id]/activities/route.ts` (GET, join semua
  `learning_path_versions` milik path lalu query `learning_activities`
  via `.in()`), `learning/activities/[id]/route.ts` (GET),
  `learning/activities/[id]/start/route.ts` (POST — insert
  `learning_activity_completions` baru dengan `completion_status:
  "in_progress"`, `attempt_no` dihitung dari count baris sebelumnya —
  desain append-only, TIDAK ADA UPDATE karena memang tidak ada RLS UPDATE
  policy-nya), `learning/activities/[id]/complete/route.ts` (POST — insert
  baris completion BARU lagi dengan `attempt_no` berikutnya, bukan update
  baris start), `agents/me/learning/progress/route.ts` (GET milik sendiri,
  diperkirakan selalu kosong — tidak ada jalur mutasi klien untuk
  `learning_unlock_progressions`), `agents/me/learning/activities/route.ts`
  (GET riwayat completion milik sendiri), `admin/learning/activities/
  route.ts` (GET list semua + POST create, staff), `admin/learning/
  activities/[id]/route.ts` (PUT update)
- **TIDAK ADA migration baru** — seluruh 13 tabel Fase 2 sudah punya RLS
  lengkap tanpa gap sejak `0056`–`0063`, batch ini murni REST layer
- **Diuji nyata** dengan 4 user Supabase Auth throwaway per role
  (Superadmin/Instructor/Agent×2) lewat dev server (`npm run dev`, bukan
  PostgREST mentah): course draft tidak terlihat publik → publish →
  terlihat → enroll Agent1 (201) → enroll Agent1 lagi → **409 CONFLICT**
  (duplicate) → GET `/quizzes/{id}/take` sebagai Agent1 → opsi jawaban
  TIDAK mengandung `is_correct` sama sekali → submit jawaban benar → grading
  server benar, `passed=true` → submit jawaban salah (attempt kedua) →
  `passed=false` → **Agent2 coba submit ke enrollment_id milik Agent1 →
  403** (hijack enrollment lintas-agent diblokir) → Agent1 coba
  `admin/certificates` self-issue → **403** (tidak ada grant sama sekali,
  bukan RLS scope check) → Superadmin issue certificate untuk Agent1 → 201
  → GET `agents/me/certificates` sebagai Agent1 → hanya lihat milik sendiri
  → Instructor buat learning path (201) → Agent coba buat learning path →
  **403** → buat version kedua dengan `version_no` sama → **409 CONFLICT**
  → Agent start activity (201, `attempt_no=1`) → complete (201, baris baru
  `attempt_no=2`, bukan update baris start) → start lagi (`attempt_no=3`,
  penomoran attempt berlanjut benar) → seluruh GET/PUT sekunder (own
  enrollments, learning path detail, activity detail, Superadmin PUT
  activity, Instructor PUT lesson) — semua 200 dengan data benar.
  **Tidak ada bug ditemukan** di seluruh 26 route — desain tervalidasi
  sejak percobaan pertama, termasuk kedua skenario keamanan kritis
  (kebocoran kunci jawaban quiz dan hijack kepemilikan enrollment). Data
  uji dan 4 user test dibersihkan total setelah pengujian.

## Batch: M15 Awarding Engine REST API (9 route file, evidence-scoped)

REST API + Zod di atas migration+RLS Fase 3 "100% tabel" (`0064`–`0070`,
lihat root `README.md`) yang melengkapi 9 tabel terakhir dari 14 tabel M15
total. Batch ini **lebih kecil dari biasanya secara sengaja**: STEP11-B8
(`docs/core/current/04-api/STEP-11-API-SYNCHRONIZATION/
STEP11-B8_M15_FULL_VERSION_PACKAGE_v1.0.zip`) mendaftar 37 endpoint M15
resmi (API-200–236) dan secara eksplisit menandai 5 temuan "CONTROLLED API
GAP" (F11-B8-002 s.d. F11-B8-006) dengan instruksi tegas "Do not invent" —
jadi 4 dari 9 tabel baru **sengaja tidak dapat route REST sama sekali**,
konsisten dengan aturan proyek untuk tidak mengarang endpoint yang tidak
dievidence.

- **Awarding Path** (API-205-209): `titles/[id]/awarding-paths/route.ts`
  (GET list, POST create — staff config-engine saja lewat RLS
  `awarding_paths_manage`), `awarding-paths/[id]/route.ts` (GET, PUT),
  `awarding-paths/[id]/status/route.ts` (PATCH — `status` TEXT tanpa CHECK
  di DB, divalidasi sebagai string bebas bukan enum, mengikuti keputusan
  migration 0064 untuk tidak mengunci vocabulary yang tidak dievidence)
- **Awarding Path Version** (API-210-212): `awarding-paths/[id]/
  versions/route.ts` (GET list, POST create — duplicate `version_no`
  dipetakan ke `CONFLICT`), `awarding-path-versions/[id]/route.ts` (GET
  saja — **TIDAK ADA PUT/PATCH**, F11-B8-002 eksplisit: "no exact
  version-status transition endpoint... do not invent a PATCH route").
  `status` dikunci ke enum `draft/active/retired` di Zod — satu-satunya
  vocabulary M15 Fase 3 yang teksnya eksplisit disebut di STEP11-B8
- **Awarding Rule Version** (API-213-215): `awarding-rule-versions/
  route.ts` (POST **saja**, sengaja TIDAK ADA GET list — tidak dievidence),
  `awarding-rule-versions/[id]/route.ts` (GET, PUT — status enum sama
  `draft/active/retired`, TIDAK ADA PATCH status terpisah karena F11-B8-003
  sama persis dengan F11-B8-002)
- **Award Presentation** (API-234-236): `agents/me/awards/presentation/
  route.ts` (GET milik sendiri termasuk non-aktif, PUT replace-set — upsert
  tiap item berdasarkan `UNIQUE(user_id, title_definition_id)`, isolasi
  otomatis lintas-agent karena key komposit menyertakan `user_id`),
  `agents/[id]/awards/presentation/route.ts` (GET publik — RLS
  `title_presentations_select` yang menggerbangi, publik hanya lihat
  `active=true`, pemilik/staf lihat semua)
- **Enrichment, bukan route baru**: `awards/[id]/provenance/route.ts`
  (API-229, sudah ada sejak batch M15 pertama sebelum `award_qualifying_paths`
  ada) sekarang juga menyertakan array `qualifying_paths` dari tabel
  tersebut (M15 Fase 3/0067) — RLS `award_qualifying_paths_select` sendiri
  yang menggerbangi visibility (pemilik award atau `m15.award.manage`)
- **SENGAJA TIDAK dibangun** (STEP11-B8 F11-B8-004/005/006, instruksi "Do
  not invent" untuk ketiganya): endpoint asosiasi `awarding_path_rules`
  (N:N Path Version ↔ Rule Version), CRUD `awarding_condition_groups`/
  `awarding_conditions`, dan CRUD `awarding_prerequisites`. Keempat tabel
  ini TETAP migration+RLS-only sejak Fase 3 — RLS `_manage` staff-only
  penuh sudah ada, hanya belum ada jalur REST-nya; dikelola staff internal
  lewat Supabase langsung (Studio/PostgREST dengan service role) sampai ada
  bukti kontrak API baru
- **TIDAK ADA migration baru** — seluruh 9 tabel Fase 3 sudah punya RLS
  lengkap tanpa gap sejak `0064`–`0070`, batch ini murni REST layer
- **Diuji nyata** dengan 4 user Supabase Auth throwaway per role
  (Superadmin/Manager/Agent×2) lewat dev server: Superadmin buat title →
  Agent coba buat awarding-path di title itu → **403** → Superadmin buat
  awarding-path (201) → Manager GET detail (200) → Agent GET detail →
  **404** (RLS staff-only menyembunyikan, bukan cuma memblokir mutasi) →
  Superadmin PUT nama (200) → PATCH status ke `inactive` (200) → Agent PATCH
  status → **404** → Superadmin POST version pertama (201) → POST
  `version_no` sama lagi → **409 CONFLICT** → GET versions list (200) → GET
  version detail sebagai Superadmin (200) vs Agent (**404**) → Superadmin
  POST rule version (201) → duplicate `rule_code`+`version_no` → **409** →
  Agent POST rule version → **403** → Superadmin PUT rule version
  status→`active` (200) → Agent GET/PUT rule version → **404** keduanya →
  Superadmin buat authority scope + issue award ke Agent1 → Agent1 GET
  presentation sendiri (200, kosong) → PUT set presentation aktif (200) →
  **Agent2 PUT presentation untuk title yang SAMA meski tidak pernah
  di-award ke dirinya → berhasil (200)** — dikonfirmasi lewat test ini
  sebagai **verifikasi desain, bukan bug**: migration 0068 sendiri
  mencatat tidak ada validasi bahwa `title_definition_id` yang ditampilkan
  benar-benar sudah di-award, itu keputusan sengaja (bukan trigger DB) —
  → publik (anon) GET presentation Agent1 → terlihat (200, `active=true`)
  → Agent1 set `active=false` → publik GET lagi → **array kosong** →
  Agent1 GET sendiri → tetap terlihat (pemilik lihat semua) → **Agent2 coba
  PUT ke `agents/me/awards/presentation` dengan payload yang menyerupai
  punya Agent1 → hanya mengubah baris milik Agent2 sendiri, baris Agent1
  terverifikasi tidak berubah** (hijack lintas-agent mustahil secara
  struktural karena UNIQUE key menyertakan `user_id`) → insert manual
  `award_qualifying_paths` lewat service role (simulasi staff/internal
  engine, karena memang tidak ada POST endpoint) → GET
  `/awards/{id}/provenance` sebagai Superadmin/Agent1(pemilik) → keduanya
  melihat `qualifying_paths` terisi → Agent2 (bukan pemilik, bukan staf) →
  `qualifying_paths` kosong (RLS menyaring, bukan 403/404 di level award)
  → verifikasi endpoint yang sengaja tidak dibangun (`/awarding-path-rules`,
  `/awarding-conditions`) memang 404 Next.js murni. **Tidak ada bug
  ditemukan** di seluruh 9 route. Data uji dan 4 user test dibersihkan
  total setelah pengujian.

## Batch: M14 Commercial REST API + Integrasi Midtrans Snap API Sungguhan (25 route file)

REST API + Zod di atas migration+RLS Fase 4 "100% tabel" (`0071`–`0078`,
lihat root `README.md`), PLUS migration baru `0079` yang merealisasikan
business logic (fungsi SECURITY DEFINER) yang sengaja ditunda migration
Fase 4. **Batch ini BERBEDA dari batch REST API lain di repo ini**: bukan
sekadar CRUD di atas RLS, tapi integrasi payment gateway pihak ketiga
sungguhan (Midtrans Snap API + webhook), diuji end-to-end terhadap
**Sandbox Midtrans asli** (kredensial milik user, base URL
`app.sandbox.midtrans.com`/`api.sandbox.midtrans.com` — TIDAK PERNAH
Production, dikunci di kode `lib/payments/midtrans.ts`).

Seluruh 25 endpoint API-175–199 (STEP11-B7 §7, "Exact 25-Row Preservation")
dibangun — evidence-scoped, mengikuti persis daftar CONTROLLED API GAP yang
didokumentasikan dokumen sumber sendiri (F11-B7-002 s.d. 005): admin
CRUD `promotions`/`addons` SENGAJA TIDAK dibangun (staff kelola langsung
lewat Supabase), fulfillment untuk subscription purchase SENGAJA tidak
direalisasikan (tidak ada tabel katalog harga subscription plan yang
dievidence — `subscriptions`/0071 adalah catatan instance milik user,
bukan katalog).

- **`lib/payments/midtrans.ts`** — Payment Provider Adapter (Midtrans PDF
  §11): `createSnapTransaction()` (POST Snap API asli, Basic Auth Server
  Key), `verifyMidtransWebhookSignature()` (SHA512 order_id+status_code+
  gross_amount+ServerKey, timing-safe compare), `isValidMidtransPaymentState()`.
  Base URL Sandbox di-hardcode, bukan env-flag — mencegah risiko transaksi
  Production tidak sengaja.
- **`lib/payments/initiate-payment.ts`** — logika bersama API-181
  (`/commercial/orders/{id}/checkout`) dan API-183
  (`POST /commercial/payments`, order_id di body) — satu implementasi,
  tidak ada divergensi bisnis antar dua endpoint yang secara semantik sama.
- **Catalog (publik, baca-saja)**: `commercial/catalog` (GET, = `addons`
  aktif — satu-satunya tabel katalog harga nyata), `commercial/products/[id]`
  (GET), `commercial/offers` (GET — addons aktif dengan `promotion_id`
  terisi, TIDAK menyertakan field `promotions` apa pun karena 0071 eksplisit
  melarang representasi publik langsung dari tabel staff-only itu)
- **Order lifecycle**: `commercial/orders` (POST create — `status`/
  `commercial_snapshot` dipaksa server-side, trigger 0079 menolak nilai
  lain), `commercial/orders/[id]` (GET), `agents/me/commercial/orders`
  (GET milik sendiri), `commercial/orders/[id]/checkout` (POST, panggil
  Midtrans nyata), `commercial/orders/[id]/cancel` (POST, lewat RPC
  `cancel_commercial_order()` — tidak ada UPDATE RLS langsung)
- **Payment + webhook (paling kritis)**: `commercial/payments` (POST,
  bentuk top-level dari checkout), `commercial/payments/[id]` (GET),
  `integrations/payments/providers/[provider]/webhook` (POST) —
  verifikasi signature SHA512 SEBELUM payload dipercaya sama sekali,
  admin client untuk `payment_provider_results`/update
  `payment_transactions` (RLS staff-only, webhook tidak punya sesi user),
  amount-mismatch dan `transaction_status` tak dikenal otomatis membuka
  `reconciliation_cases` alih-alih diproses sebagai pembayaran sah,
  settlement/capture memicu `fulfill_commercial_order()` otomatis
- **Entitlement/Quota (baca RLS existing 0019 + 2 RPC baru)**:
  `commercial/entitlements`(+`/[id]`), `agents/me/entitlements`,
  `organizations/[id]/entitlements` (catatan: RLS 0019 belum ada jalur
  organization-membership, hanya user_id-based — didokumentasikan sebagai
  keterbatasan evidenced, bukan ditutup diam-diam),
  `admin/commercial/entitlements/reconcile` (POST — membuka
  `reconciliation_cases`, TIDAK memutasi `lifecycle_status` entitlement
  langsung karena F11-B7-004 controlled gap), `agents/me/quota`,
  `organizations/[id]/quota`, `commercial/quota/[id]`(+`/allocate`
  staff-only, `/consume` staff/service_role saja, `/usage`)
- **Reconciliation**: `admin/commercial/reconciliation`(+`/[id]`/`/resolve`
  — lifecycle open→investigating→resolved/rejected/escalated, dikunci
  CHECK constraint 0076)

**Diuji nyata end-to-end terhadap Sandbox Midtrans asli** dengan 3 user
throwaway (Superadmin/Agent×2): GET catalog/products/offers publik (200)
→ Agent1 buat order addon Learning Point (201, `status` dipaksa pending) →
**Agent1 coba INSERT `commercial_orders` langsung lewat PostgREST mentah
dengan `status='confirmed'` → REJECTED oleh trigger 0079** →
**Agent1 coba INSERT `payment_transactions` langsung dengan
`payment_state='settlement'` → REJECTED oleh trigger 0079** (kedua
skenario self-approval proaktif dari catatan migration, dikonfirmasi
terblokir sebelum pernah jadi bug nyata) → Agent2 GET/checkout order
milik Agent1 → **404** (isolasi lintas-agent) → Agent1 checkout →
**Snap API Sandbox ASLI dipanggil, `snap_token`+`redirect_url` sungguhan
diterima** → webhook signature invalid → **401** → webhook signature
valid TAPI `gross_amount` salah → **200, TIDAK diproses, `reconciliation_cases`
otomatis terbuka dengan bukti expected/received** (payment tetap pending,
tidak berubah) → webhook valid dengan amount benar, `transaction_status:
settlement` → **200 ok** → **payment_state=settlement,
verification_state=verified, order status=confirmed, LP Agent1 bertambah
50 (cross-module M14→M04 fulfillment otomatis via
`grant_learning_points_from_purchase()`)** → replay webhook identik →
**duplicate_ignored, LP TIDAK bertambah lagi** (idempotency, Midtrans §12)
→ ulangi alur penuh untuk addon `capacity_type='listing_refresh'` (bukan
LP) → **rantai `commercial_entitlements→quota_capacities→
operational_quota_pools` otomatis terbentuk dengan `source_order_id`/
`source_payment_transaction_id`/`source_fulfillment_id` terisi benar** →
Agent2 panggil RPC `fulfill_commercial_order` langsung lewat PostgREST
untuk payment Agent1 yang sudah settlement → **REJECTED** (bukan
staff/service_role, defense-in-depth di luar business-state check) →
uji cancel: Agent2 cancel order Agent1 → **404**, Agent1 cancel order
sendiri → **200**, cancel lagi → **409** (sudah cancelled), checkout order
yang sudah cancelled → **409** → uji quota staff: allocate ke Agent2 dari
pool Agent1 (201), consume (201), GET usage (200) → uji reconciliation:
list/detail/resolve semua 200, `reconcile` endpoint buka case baru (201)
→ webhook status tak dikenal (`totally_bogus_status`) → **200, flagged
untuk reconciliation, tidak crash** → provider selain 'midtrans' → **404**.
**2 bug ditemukan & diperbaiki langsung di kode route batch ini** (bukan
migration): (1) idempotency-key webhook awalnya hanya `order_id:status` —
notification amount-salah "mengunci" key sehingga notification BERIKUTNYA
dengan amount BENAR untuk order+status yang sama ditolak sebagai
duplicate (diperbaiki: key menyertakan `gross_amount`); (2) error
permission dari RPC `allocate_quota_capacity`/`consume_quota_capacity`
awalnya jatuh ke 500 INTERNAL_ERROR generik alih-alih 403 (ditambahkan
error-message mapping di kedua route, pola sama seperti
`cancel_commercial_order`). Data uji (2 addon, 5 order, payment, quota
chain, reconciliation cases, LP) dan 3 user test dibersihkan total setelah
pengujian.

## Batch: Fase 1 "100% tabel" + M02 Profile REST API (37 route file)

REST API + Zod di atas migration+RLS Fase 1 "100% tabel" (`0047`–`0055`,
lihat root `README.md`, 13 tabel M01/M03/M07/M11/M12) PLUS M02 Profile
(`0029`–`0030`, `agent_profiles`/`agent_reviews`) yang selama ini hanya
punya migration+RLS tanpa satu route Next.js pun. Batch terbesar kedua di
repo ini (37 route file) — evidence-scoped mengikuti STEP11-B1 (M01/M02),
STEP11-B2 (M03 media/price-history/leads), STEP11-B6 (M12 invitations),
tanpa migration baru sama sekali (murni REST layer di atas RLS yang sudah
ada, kecuali 3 bug yang diperbaiki di kode route sendiri, bukan SQL).

- **M02 Profile** (7 route): `users/me` (GET, gabungan `public.users`+
  `agent_profiles`), `users/profile` (PUT — upsert, `public_slug` di-generate
  server-side saat pertama kali dibuat, `total_listings_sold`/`rented`
  SENGAJA tidak ada di skema manapun karena murni cache M03 tanpa mekanisme
  sinkron), `agents/[id]` (GET publik, RLS `profile_visibility` menggerbangi),
  `agents/[id]/credentials` (GET — presentasi `title_presentations`/M15,
  BUKAN `certificates`/M04 yang RLS-nya tidak punya jalur publik sama
  sekali), `agents/[id]/reviews` (GET publik + POST auto-approved — Buyer
  ATAU Agent self-review, keduanya dievidence eksplisit di komentar
  migration 0030), `admin/agent-reviews/pending`+`[id]/approve`+`[id]/reject`
  (moderasi POST-PUBLIKASI, bukan gate normal — Gate PRE-00-D §13-14)
- **M01 verification documents** (1 route, SENGAJA minimal):
  `users/verification-documents` — **HANYA POST** (API-013 intake).
  STEP11-B1 F11-B1-002/003 eksplisit: "Do not invent GET/PUT/DELETE
  routes" — Agent tidak bisa cek status submisinya sendiri lewat REST,
  staf tidak bisa review lewat REST, keduanya controlled gap yang
  DISENGAJA, bukan kelalaian. Diuji: trigger `enforce_verification_
  document_staff_only_review` (0055) dikonfirmasi tetap memblokir
  self-approval lewat PostgREST mentah
- **M03 listing extensions** (15 route): `listings/[id]/media` (GET list
  gabungan photo+video, POST create — `media_type` discriminator ke
  `listing_photos`/`listing_videos`), `listings/[id]/media/[mediaId]`
  (DELETE — coba `listing_photos` dulu lalu `listing_videos`),
  `.../set-cover` (PUT — eksklusif, foto lain otomatis `is_cover=false`),
  `listings/[id]/price-history` (GET, read-only — diisi trigger
  `log_listing_price_change` sejak 0047), `listings/[id]/views` (POST,
  ADD-NEW), `listings/[id]/cta-click` + `leads` + `leads/[id]` +
  `agents/me/leads`+`/stats` + `admin/leads` (API-044-048/050 STEP11-B2 —
  API-049 PUT status SENGAJA tidak dibangun, `listing_leads` tidak punya
  kolom `status` sama sekali), `amenities`+`[id]` (katalog publik,
  Superadmin manage) + `listings/[id]/amenities`+`[amenityId]` (junction,
  ADD-NEW)
- **`ref_villages`** (2 route, ADD-NEW): `ref-villages` (GET filter
  `district_id`, POST) + `[id]` (PUT/DELETE) — provinces/cities/districts
  yang lebih lama pun belum punya REST API (gap pre-existing, dicatat,
  bukan ditutup diam-diam di batch ini)
- **`url_redirects`** (2 route, ADD-NEW): `url-redirects` (GET
  `?old_path=` lookup + POST) + `[id]` (DELETE) — tidak ada di STEP11-B9
  M11 sama sekali, dibangun karena RLS publik tabel ini sendiri
  membuktikan maksud desainnya
- **M12 `organization_invitations`** (5 route, `organization_document`
  SENGAJA TIDAK dibangun — STEP11-B6 eksplisit "not grounds for inventing
  tables"): `organizations/[id]/invitations` (leader invite, API-161),
  `organizations/[id]/join-requests` (agent request, API-162 — `leader_id`
  diresolusi server-side lewat admin client karena RLS `organization_
  members_select` memblokir calon anggota yang belum bergabung),
  `organization-invitations/[id]/accept`+`reject` (API-163/164 — trigger
  `enforce_organization_invitation_no_self_accept` dikonfirmasi memblokir
  kedua arah self-accept), `agents/me/organization-invitations` (API-165)
- **`dbr_simulations`** (3 route, ADD-NEW — tidak ada dokumen STEP11-B
  khusus M07): `dbr-simulations` (POST+GET) + `[id]` (GET). Formula
  anuitas standar (`lib/dbr/calculate.ts`) dihitung SERVER-SIDE dari
  `dbr_config` (0008, `dbr_threshold_percent`=35%/`default_interest_rate`
  =8.5% sudah ada di DB) + pita "perlu_review" 10 percentage-point
  (satu-satunya angka pita yang dievidence, PRE-00-I_M07_DOMAIN_ALIGNMENT_
  GATE) — arah pemetaan band (DBR rendah=layak) inferensi definisional
  "debt burden ratio", bukan kebijakan bisnis dikarang. Klien TIDAK BISA
  mengirim `monthly_installment`/`dbr_percent`/`eligibility_status` sendiri.
- **3 bug ditemukan & diperbaiki di kode REST** (bukan migration):
  1. `listing_views`/`listing_leads` INSERT gagal untuk pengunjung anonim
     — `.select()` setelah `.insert()` kena RLS SELECT yang lebih ketat
     (owner/staf saja, bukan publik), gotcha arsitektural yang sama persis
     dari testing migration Fase 1 (`INSERT...RETURNING` vs RLS publik,
     lihat `supabase/migrations/README.md`) — diperbaiki hapus `.select()`,
     return minimal.
  2. Lookup `dbr_config` gagal untuk Agent biasa — RLS `dbr_config_select`
     memakai `has_permission(..., updated_by)` scope 'own', tapi baris
     config global ini singleton tanpa "pemilik" yang cocok dengan
     `auth.uid()` Agent mana pun — diperbaiki pakai admin client khusus
     untuk lookup config ini saja (otorisasi sesungguhnya tetap RLS INSERT
     `dbr_simulations`).
- **Diuji nyata** dengan 4 user throwaway (Superadmin/Agent×2/Buyer):
  seluruh listing media lifecycle (upload/set-cover eksklusif/delete/cross-
  agent block), price-history trigger otomatis, view/lead tracking anonim,
  amenities katalog+junction, profil public/private toggle, review self &
  buyer + moderasi post-publikasi, verification document self-approval
  block via PostgREST mentah, ref-villages & url-redirects staff-only
  write, organization invitation kedua arah (leader-invite & agent-
  request) dengan self-accept block terverifikasi, dan simulasi DBR
  dengan hasil `layak`/`tidak_layak` diverifikasi benar secara matematis
  (formula anuitas manual dicocokkan). Data uji dan 4 user test dibersihkan
  total setelah pengujian.

## Yang BELUM ada (menyusul di Step 3 dan seterusnya)

Route untuk modul lain — mengikuti urutan Tahap 2–6 di `CHECKLIST_RESIDUAL_IMPLEMENTASI.md`,
setiap route WAJIB dibungkus `withApiHandler()` dari sini, tidak menulis
middleware sendiri. `POST /ai-assistant/chat` (M13, invokasi AI sungguhan)
SENGAJA belum ada — butuh adapter per-provider nyata, bukan sekadar CRUD atas
tabel sendiri, di luar scope kerja REST-API-layer batch ini.
`packages/ui`/`packages/config` masih placeholder kosong. `event_provider_bindings`
(M05) belum ada route — tidak ada kontrak evidenced di STEP11-A untuknya.
Approval Claim PDF Generate/View/Download (M06) belum ada — tidak ada
tabel/mekanisme fisik untuk itu di migration manapun (beda dari resource M06
lain yang tabelnya sudah ada sejak 0033-0035).

## Menjalankan

```bash
cd apps/web
cp .env.example .env.local   # isi dari Supabase Dashboard
npm install
npm run dev
```

Butuh migration di `supabase/migrations/` sudah di-push ke project Supabase
Anda terlebih dulu (lihat `supabase/migrations/README.md`).

`BYOK_ENCRYPTION_KEY` (dipakai `lib/crypto/byok.ts` untuk M13) BUKAN dari
Supabase Dashboard — generate sendiri:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

`MIDTRANS_SERVER_KEY`/`MIDTRANS_CLIENT_KEY`/`MIDTRANS_MERCHANT_ID` (M14
Commercial, `lib/payments/midtrans.ts`) dari dashboard.sandbox.midtrans.com
— kode ini SELALU memanggil base URL `*.sandbox.midtrans.com`, TIDAK PERNAH
Production, jadi aman pakai key apa pun (key tetap harus valid untuk
environment Sandbox — key yang hanya valid di Production akan gagal auth
saat dites terhadap endpoint Sandbox).
