# RumahAgen — panduan untuk Claude Code

Bahasa kerja dengan pemilik produk: Indonesia. Backend: Next.js 15 di `apps/web` (281 route API), Supabase `jawywzavznjekxxlhwqo`, wireframe di `docs/design/wireframes-v2`.

## Frontend

Sebelum menyentuh UI, baca `docs/frontend/FRONTEND_HANDOFF.md` (arsitektur, kontrak API, fase, prompt), lalu `docs/design/wireframes-v2/README.md` dan `MODULES.md`. Keputusan tetap:

- Frontend dibangun di repo ini; styling **Tailwind v4** dengan `@theme` dari `docs/design/wireframes-v2/tokens.css` (`--ra-*`, font Plus Jakarta Sans).
- Semua mutasi dan pembacaan data app lewat `/api/*` (jangan `insert/update/rpc` Supabase dari browser). Kontrak `{ data, meta }` / `{ error: { code, message } }`; `Idempotency-Key` untuk aksi yang mengubah uang, kuota, poin, atau status.
- Tiap layar punya 4 keadaan (memuat, kosong, gagal, sukses). Badge status sama persis dengan CHECK constraint. Jangan mengarang field, status, atau warna.
- Jangan ubah migration atau API saat mengerjakan UI; catat celah di `audit/FRONTEND_GAPS.md` dan tanya dulu.
- Satu PR = satu modul atau satu kelompok layar.

## Aturan kerja database dan git

- Migration ditulis dan diuji rollback di DB live; **diterapkan hanya setelah pemilik produk berkata "terapkan NNNN"**. Nomor 0146 dicadangkan (perbaikan RPC anon, ada di `git stash@{0}`; jangan diterapkan sebelum kode pemanggilnya dideploy — lihat `audit/FASE0_SECURITY_PLAN.md`).
- Commit dan push hanya setelah diminta ("commit dan push"). Trailer commit: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Secret (service role, BYOK, Midtrans) tidak pernah dicetak atau dikirim lewat chat.

## Deploy

Staging Vercel: `docs/deployment/VERCEL_STAGING.md` (Root Directory `apps/web`). Belum ada proyek Vercel; jangan membuatnya tanpa persetujuan.
