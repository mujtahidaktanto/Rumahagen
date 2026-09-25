# Persiapan hosting staging RumahAgen di Vercel

## Status (diperbarui 2026-09-25)

**Proyek Vercel `rumahagen-staging` sudah dibuat dan sehat.** Frontend belum ada (baru wireframe di `docs/design/wireframes-v2`), jadi yang berjalan di staging
hanyalah backend: rute `/api/*`, halaman publik `/verifikasi` dan `/verifikasi/{kode}`, `robots.txt`, dan sitemap. Halaman `/` masih scaffold.

| Hal | Nilai |
|---|---|
| Proyek | `rumahagen-staging` (`prj_F0GZBL629Ztz7mRIMh46W2nALqnJ`), akun pribadi `aktanto`, paket Hobby |
| Sumber | GitHub `mujtahidaktanto/Rumahagen`, cabang `main` (push otomatis di-deploy; terbukti 2026-09-25), Root Directory `apps/web`, **Node 24.x** (Node 20 EOL: Vercel menonaktifkan build baru Node 20 mulai 1 Okt 2026; `engines.node` di `apps/web/package.json` = `24.x`, build Node 24 terbukti READY) |
| Alamat | `https://rumahagen-staging-aktanto.vercel.app` (produksi proyek); domain kustom `staging.rumahagen.com` belum ditambahkan |
| Proteksi | Vercel Authentication untuk **semua** deployment (alamat produksi `*.vercel.app` pun dialihkan ke login Vercel) |
| Environment variables | 10 variabel terisi (Production dan Preview); rahasia bertipe Sensitive, dibuat sendiri oleh pemilik |
| Uji sehat | `/verifikasi` menampilkan formulir; `/api/certificates/verify/AAAA-0000-0000` = 404 JSON `NOT_FOUND`; `/api/ref-provinces` = 38 provinsi; `robots.txt` benar |

Pelajaran saat setup:
- `NEXT_PUBLIC_*` tertanam saat build: setelah mengubah nilainya **wajib Redeploy**. Nilai `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` yang salah membuat semua rute yang membaca
  Supabase menjawab 500 `INTERNAL_ERROR`, sementara halaman yang tidak memakainya (`/verifikasi`, `robots.txt`) tetap normal. Pembanding: URL persis `https://<ref>.supabase.co`
  (tanpa `/` di akhir); kunci anon legacy 208 karakter.
- Koneksi Vercel dari sesi Claude Code hanya berlaku untuk cakupan pribadi: pembuatan proyek, deployment, dan pembacaan daftar env berhasil, tetapi log build/runtime
  ditolak (403 untuk cakupan tim `aktanto`). Log dibaca lewat dashboard Vercel.
- Pembuatan proyek lewat API tidak menampilkan status tautan Git; deployment awal dipicu dari `gitSource` GitHub. Verifikasi bahwa push ke `main` memicu deployment otomatis.
  Bila tidak, hubungkan repo di Settings > Git.

Sisa: tambah domain staging (bagian 4 dan catatan DNS di percakapan: CNAME `staging` di NEO DNS Biznet), Fase 0 keamanan (`audit/FASE0_SECURITY_PLAN.md`), cron snapshot analytics.

---

*Catatan awal (sebelum proyek dibuat):* build produksi lokal (`npm run build` di `apps/web`) sudah lulus.

## 1. Fakta proyek

| Hal | Nilai |
|---|---|
| Repo | `github.com/mujtahidaktanto/Rumahagen`, cabang `main` |
| Root Directory di Vercel | `apps/web` (tidak ada `package.json` di root repo) |
| Framework | Next.js 15 (terdeteksi otomatis), React 19, Node 20 |
| Package manager | npm (`apps/web/package-lock.json`) |
| Perintah | Install `npm install`, build `npm run build` (bawaan; tidak perlu `vercel.json` untuk build) |
| Akun Vercel | `mujtahidaktanto`, paket Hobby (non-komersial), tanpa tim |
| Database | Supabase `jawywzavznjekxxlhwqo` (dipakai sebagai DB staging; produksi nanti proyek Supabase terpisah) |
| Middleware | `middleware.ts` membaca `url_redirects` lewat REST anon (butuh dua variabel `NEXT_PUBLIC_SUPABASE_*`) |

## 2. Environment variables (Production dan Preview)

Tempel sendiri di Vercel > Project > Settings > Environment Variables. Jangan commit, jangan kirim lewat chat.

| Variabel | Sumber / catatan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Idem (publik, tapi tetap lewat env) |
| `SUPABASE_SERVICE_ROLE_KEY` | Idem. **Rahasia**, hanya server (bypass RLS). Tandai Sensitive |
| `BYOK_ENCRYPTION_KEY` | **Buat baru** untuk staging: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Jangan pakai ulang antar environment; bila hilang, semua koneksi AI Agent tak bisa didekripsi |
| `LEARNING_SESSION_WEBHOOK_SECRET` | String acak panjang baru |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_MERCHANT_ID` | Dari dashboard.sandbox.midtrans.com. Kode selalu memakai sandbox |
| `APP_BASE_URL` | URL staging (mis. `https://<proyek>.vercel.app`). Dipakai QR dan tautan verifikasi sertifikat; bila kosong jatuh ke `NEXT_PUBLIC_SITE_URL`, lalu `https://rumahagen.com` |
| `NEXT_PUBLIC_SITE_URL` | URL staging yang sama (dipakai sitemap dan cadangan QR) |
| `CRON_SECRET` | Nanti, saat cron snapshot analytics dibuat (bagian 5) |

Catatan: variabel `NEXT_PUBLIC_*` tertanam saat build, jadi ubah nilainya berarti perlu redeploy.

## 3. Gerbang sebelum staging dibuka ke internet

1. **Migration 0146 (keamanan RPC anon).** Tiga celah masih terbuka di DB live: `create_notification`, `log_audit_event`, dan `check_and_increment_rate_limit`
   bisa dipanggil tanpa login memakai anon key (yang ikut ke bundel publik). Kodenya tersimpan di `git stash@{0}`. Urutan wajib:
   pulihkan stash dan uji ulang → commit dan push **kode** → deploy → baru terapkan **migration 0146**. Migration lebih dulu dari kode membuat semua request API gagal.
2. **Vercel Authentication (Deployment Protection) tetap aktif** agar staging tidak terbuka untuk umum. Pengecualian yang perlu dibuka:
   `POST /api/integrations/payments/providers/{provider}/webhook` (Midtrans), `POST .../learning-session/providers/{provider}/events` (memakai header
   `X-Webhook-Secret`), dan `/verifikasi/*` bila QR ingin dicoba dari ponsel tanpa login Vercel. Cara termudah: Protection Bypass for Automation, atau domain staging terpisah.
3. **Supabase Auth:** tambahkan URL staging ke Site URL dan Redirect URLs (Auth > URL Configuration). Aktifkan leaked password protection (advisor Supabase).
4. **Midtrans sandbox:** isi Payment Notification URL dengan URL webhook staging di atas.

## 4. Langkah pembuatan (saat siap)

1. Vercel > Add New > Project > impor repo `Rumahagen`, Root Directory `apps/web`.
2. Isi environment variables bagian 2 sebelum deploy pertama.
3. Deploy dari `main`. Setiap push ke `main` akan men-deploy ulang; cabang lain menjadi Preview.
4. Uji cepat: `/api/certificates/verify/AAAA-0000-0000` harus 404 berformat JSON; `/verifikasi` menampilkan formulir; `/robots.txt` dan `/sitemap-index.xml` terbuka.
5. Setel `APP_BASE_URL` ke URL final, redeploy, lalu unduh satu PDF sertifikat dan pindai QR-nya.

## 5. Yang belum ada (sengaja ditunda)

- **Frontend** (semua halaman selain `/verifikasi`): menunggu keputusan jalur UI (bangun di repo, atau prototipe dengan Bolt dari PNG wireframe).
- **Cron snapshot analytics harian:** tabel `metrics_daily_snapshot` dan endpoint dashboard sudah ada, tetapi belum ada pemanggil harian. Hobby membolehkan satu cron per hari,
  cukup untuk ini. Butuh rute cron baru (dilindungi `CRON_SECRET`) dan `vercel.json` berisi `crons`. Dibuat setelah proyek Vercel ada.
- **Domain kustom** dan email transaksional (Resend) untuk staging.
- **Batas Hobby:** non-komersial dan batas durasi fungsi; PDF sertifikat (pdf-lib + sharp) cukup ringan, tetapi pantau saat uji unduhan.
