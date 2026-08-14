# Bootstrap Superadmin — `seed-superadmin.ts`

**OD-18 (Issue Register Batch 2, sumber T3-01)** — jawaban direvisi dari Opsi A
(SQL manual) menjadi **Opsi B (script/CLI)**, atas permintaan Owner agar bisa
dijalankan dengan satu perintah + parameter email/nama/password.

## Kapan dijalankan
Sekali, saat Sprint S0, **setelah** migration `0001`–`0015` dieksekusi ke
project Supabase live, **sebelum** ada agen mendaftar. Ini memutus
*chicken-and-egg problem*: approval registrasi agen (M01) membutuhkan
Superadmin yang sudah eksis, tapi tidak ada mekanisme lain untuk membuat
Superadmin pertama.

## Prasyarat
1. Project Supabase sudah dibuat, migration sudah dijalankan (tabel `roles`,
   `users` sudah ada).
2. Dependency `@supabase/supabase-js` terinstall di monorepo (`pnpm add @supabase/supabase-js`).
3. `.env.local` (root monorepo, **jangan pernah commit ke git**) berisi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
   Ambil `SUPABASE_SERVICE_ROLE_KEY` dari Supabase Dashboard → Project
   Settings → API → **service_role** (bukan `anon`/`public` key — key ini bisa
   bypass RLS sepenuhnya, jangan pernah dipakai di kode client/browser).

## Cara pakai

```bash
pnpm tsx scripts/seed-superadmin.ts \
  --email owner@example.com \
  --name "Mujtahid Aktanto" \
  --password "isi-password-kuat-di-sini"
```

Atau tanpa `--password` di command (lebih aman, tidak tersimpan di shell
history) — script akan minta input tersembunyi:

```bash
pnpm tsx scripts/seed-superadmin.ts --email owner@example.com --name "Mujtahid Aktanto"
```

## Yang dilakukan script

1. Cek apakah sudah ada Superadmin aktif — jika ya, **berhenti tanpa membuat
   duplikat** (idempotent).
2. Buat akun di Supabase Auth (`auth.users`) via Admin API — email langsung
   `confirmed`, tidak perlu klik link verifikasi.
3. Insert satu baris ke `public.users` — `role_id` = superadmin, `status='active'`,
   **bypass** alur `pending_review`/verifikasi dokumen agen normal (sesuai
   sifat akun bootstrap).
4. Nama (`full_name`) disimpan di **Supabase Auth `user_metadata`**, bukan di
   `public.users` — lihat catatan governance di bawah.

## Catatan governance (transparan, bukan keputusan sepihak)

- **`public.users` tidak punya kolom nama** untuk role internal (Superadmin/
  Manager/Admin/Instructor) — kolom `full_name` hanya ada di `agent_profiles`,
  yang skema-nya khusus role Agen (`specialization`, `coverage_area`, dll. —
  tidak relevan untuk Superadmin). Solusi di script ini: nama disimpan di
  Supabase Auth `user_metadata`, **tidak** dibuatkan baris `agent_profiles`
  palsu. Jika suatu saat internal user (Manager/Admin/Instructor) perlu
  ditampilkan nama-nya di UI, ini kemungkinan jadi gap tambahan yang perlu
  diputuskan Owner terpisah — dicatat di sini sebagai temuan, bukan
  diselesaikan di script ini.
- **`password_hash`** di `public.users` diisi placeholder tetap
  (`'managed_by_supabase_auth'`) untuk memenuhi constraint `NOT NULL` — kolom
  ini **bukan** sumber kebenaran, Supabase Auth yang mengelola hash asli
  (sesuai komentar eksplisit di `0003_m01_auth.sql`).
- Script ini **idempotent** untuk kasus umum (sudah ada Superadmin aktif →
  berhenti), tapi **tidak** transactional penuh lintas dua sistem (Supabase
  Auth + `public.users` adalah dua panggilan API terpisah) — jika insert
  `public.users` gagal setelah akun Auth berhasil dibuat, script memberi
  instruksi eksplisit untuk hapus manual akun Auth yang "orphan" sebelum
  retry (lihat pesan error di script).

## Setelah dijalankan

Update `CURRENT-PROJECT-STATE.md` mencatat bahwa Superadmin pertama sudah
dibuat (tanggal, email — **jangan catat password**), dan `ISSUE-REGISTER-Konsolidasi-FINAL.md`
menandai T3-01 → Closed dengan referensi OD-18.
