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

7. **Akun Dibatasi: kontak dukungan belum ditetapkan.** Tombol "Hubungi Dukungan" memakai env opsional `NEXT_PUBLIC_SUPPORT_EMAIL` (mailto); tanpa env, tombol disembunyikan. Status yang ditangani = CHECK `users.status`: pending_review, suspended, rejected (wireframe hanya menggambar suspended dan rejected; pending_review memakai tata letak yang sama).

## 2026-09-25 — Fase 2, M11 Homepage

1. **Pola URL kanonik `/agent/{slug}` bentrok dengan area aplikasi `/agent`** (`lib/seo/sitemap.ts` dan sitemap-agents memakai `/agent/{slug}`; `/agent` adalah area Agent yang dijaga sesi). Profil publik Agen tidak bisa berada di `/agent/[slug]` tanpa melewati penjaga. Sementara: daftar Agen di `/agen`; keputusan: pindahkan URL publik ke `/agen/{slug}` (ubah sitemap) atau pindahkan area aplikasi Agent. Tunggu keputusan sebelum membangun Detail Agen.
2. **Pengumuman & Promo tidak punya jenis (Promo/Pengumuman/Event).** Wireframe menampilkan label berwarna per jenis; tabel `public_announcement_promotion` tidak punya kolom jenis. Homepage menampilkan judul + tanggal saja.
3. **Kursus tidak punya harga/gratis dan tingkat (Pemula/Menengah).** Tabel `courses` tidak memuatnya; kartu kursus menampilkan jumlah materi dan kategori, tanpa lencana "Gratis".
4. **Favorit listing (ikon hati) belum ada API/tabel.** Tombol favorit di kartu properti tidak ditampilkan.
5. **Foto listing memakai URL apa adanya** (`listing_photos.url`); bila bucket storage bukan publik, gambar tidak tampil. Perlu dipastikan saat listing pertama terbit.
