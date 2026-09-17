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

## Yang BELUM ada (menyusul di Step 3 dan seterusnya)

Route untuk modul lain (M04 Learning, M06 Developer/Project, M13
Provider/BYOK, M14 Commercial di luar Refresh, M15 Qualification) — mengikuti
urutan Tahap 2–6 di `CHECKLIST_RESIDUAL_IMPLEMENTASI.md`, setiap route WAJIB
dibungkus `withApiHandler()` dari sini, tidak menulis middleware sendiri.
`packages/ui`/`packages/config` masih placeholder kosong. `event_provider_bindings`
(M05) belum ada route — tidak ada kontrak evidenced di STEP11-A untuknya.

## Menjalankan

```bash
cd apps/web
cp .env.example .env.local   # isi dari Supabase Dashboard
npm install
npm run dev
```

Butuh migration di `supabase/migrations/` sudah di-push ke project Supabase
Anda terlebih dulu (lihat `supabase/migrations/README.md`).
