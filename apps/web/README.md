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

## Yang BELUM ada (menyusul di Step 3 dan seterusnya)

Route untuk modul lain (M04 Learning, M05 Event, M06 Developer/Project, M13
Provider/BYOK, M14 Commercial di luar Refresh, M15 Qualification) — mengikuti
urutan Tahap 2–6 di `CHECKLIST_RESIDUAL_IMPLEMENTASI.md`, setiap route WAJIB
dibungkus `withApiHandler()` dari sini, tidak menulis middleware sendiri.

## Menjalankan

```bash
cd apps/web
cp .env.example .env.local   # isi dari Supabase Dashboard
npm install
npm run dev
```

Butuh migration di `supabase/migrations/` sudah di-push ke project Supabase
Anda terlebih dulu (lihat `supabase/migrations/README.md`).
