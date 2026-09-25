# Celah backend yang ditemukan saat membangun frontend

Dicatat sesuai aturan: UI tidak mengubah migration/API; celah dicatat di sini lalu diputuskan pemilik produk. Format: tanggal, layar, celah, dampak, usulan.

## 2026-09-25 — Fase 2, M01 Auth

1. **Register tidak menerima nama lengkap dan nomor WhatsApp.**
   Wireframe `M01-Register` memiliki "Nama Lengkap (sesuai KTP)" dan "Nomor WhatsApp", tetapi `POST /api/auth/register` (`registerSchema`) hanya `email` + `password`.
   Dampak: halaman Daftar hanya memuat email + kata sandi + persetujuan. Nama dan nomor WA dikumpulkan nanti di Profil Saya (M02) atau perlu diperluas API (simpan ke `user_metadata`/`agent_profiles` saat signup).
   Usulan: putuskan apakah nama/WA wajib saat daftar. Bila ya, perluas `registerSchema` + trigger `on_auth_user_created`.

2. **OTP lewat email, bukan WhatsApp.**
   Wireframe `M01-OTP` berjudul "Verifikasi Nomor WhatsApp"; backend memakai OTP email Supabase (`verify-otp` `type: "signup"`). UI memakai teks "email". Verifikasi nomor WA tidak ada di backend (butuh penyedia WA/SMS).

3. **`/api/auth/callback` membuka pengalihan ke situs lain.**
   `redirect_to` diproses `new URL(redirectTo, origin)`, sehingga URL absolut (mis. `https://situs-lain.com`) diterima. `forgot-password` dan `oauth/google` meneruskan `redirect_to` dari body tanpa saringan. Risiko: tautan reset/OAuth yang dibuat penyerang mengalihkan korban ke situs pihak ketiga setelah sesi dipasang.
   Usulan: saring dengan `safeNext()` (`lib/auth/safe-next.ts`) di callback. UI sudah hanya mengirim jalur relatif.

4. **`/api/auth/callback` tidak membedakan kode gagal.**
   Kode kedaluwarsa/terpakai tetap dialihkan ke `redirect_to` tanpa penanda galat. UI mengakalinya dengan memeriksa sesi di server pada `/lupa-password?tahap=reset` (tanpa sesi -> "Link Reset Tidak Berlaku").

5. **Halaman Syarat & Ketentuan / Kebijakan Privasi belum ada.** Teks persetujuan di Daftar belum berupa tautan; akan ditautkan saat halaman Konten Publik (M11) dibangun.

6. **Google OAuth bergantung pada pengaturan dashboard Supabase** (provider Google + redirect URL staging) — belum dikonfirmasi aktif.
