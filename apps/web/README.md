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

## Yang BELUM ada (menyusul di Step 3 dan seterusnya)

Route untuk modul lain (M03 Listing, M04 Learning, M09 Admin Console, M13
Provider/BYOK, M14 Commercial, M15 Qualification) — mengikuti urutan Tahap 2–6
di `CHECKLIST_RESIDUAL_IMPLEMENTASI.md`, setiap route WAJIB dibungkus
`withApiHandler()` dari sini, tidak menulis middleware sendiri.

## Menjalankan

```bash
cd apps/web
cp .env.example .env.local   # isi dari Supabase Dashboard
npm install
npm run dev
```

Butuh migration di `supabase/migrations/` sudah di-push ke project Supabase
Anda terlebih dulu (lihat `supabase/migrations/README.md`).
