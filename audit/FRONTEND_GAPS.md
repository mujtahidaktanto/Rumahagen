# Celah backend yang ditemukan saat membangun frontend

## Keputusan pemilik produk 2026-09-26 (menutup sebagian celah di bawah)
- **Alamat profil publik Agen = `/agen/{slug}`** (sitemap-agents diubah; `/agent` tetap area aplikasi Agent). Daftar Agen di `/agen`. Menutup butir "bentrok `/agent/{slug}`" (Homepage #1).
- **Register: nama lengkap WAJIB, WhatsApp TIDAK wajib** (diisi di Profil Saya). Diimplementasikan tanpa migration: `registerSchema.full_name` -> `signUp options.data.full_name` (user_metadata) -> `lib/auth/session.ts` memakainya (atau `name` dari Google) sebagai nama tampilan bila profil agen belum ada. `agent_profiles.whatsapp_number` NOT NULL, jadi profil agen belum dibuat saat daftar. Menutup sebagian butir M01 #1.
- **Kontak dukungan sementara = mujtahidaktanto@gmail.com** (`lib/config.ts`, ganti dengan env `NEXT_PUBLIC_SUPPORT_EMAIL` atau ubah kode saat email resmi rumahagen.com ada). Menutup butir M01 #7.
- **Jual dan sewa tidak dicampur:** Discovery memakai tab Dijual/Disewa (bawaan Dijual, `?transaksi=rent`); Homepage "Properti Pilihan" hanya Dijual. Urutan harga kini dalam satu jenis transaksi. Catatan: dalam Disewa, satuan `per_bulan` dan `per_tahun` masih bisa bercampur di urutan harga.
- **Listing sold/rented tidak terlihat publik; expired = tetap `published` selama masa tenggang 7 hari lalu kembali ke draft** (sudah berlaku di DB: `expire_listing_slots`), jadi spanduk status di Detail Listing hanya terlihat pemilik/staf; tidak perlu perubahan RLS. Menutup butir Detail Listing #1.

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
## 2026-09-26 — Fase 2, M11 Detail Listing

1. **Spanduk "Sudah Terjual / Disewa / Kedaluwarsa / Sedang Ditinjau" tidak akan terlihat pengunjung.** RLS listings hanya mengizinkan anon membaca status `published`; listing sold/rented/expired/suspended menjawab "Listing tidak ditemukan" bagi pengunjung (hanya pemilik dan staf yang melihat spanduk). Wireframe menggambarkan pengunjung melihat spanduk itu. Perbaikan butuh keputusan: perluas policy SELECT (mis. sold/rented/expired boleh dibaca publik, suspended tidak) atau terima perilaku sekarang.
2. **Peringkat dan ulasan agen ("4.8 (126 ulasan)") tidak punya tabel/API.** Kartu agen menampilkan nama, organisasi, lencana Terverifikasi, dan jumlah listing aktif saja.
3. **Tombol "Telepon Agent" tidak ditampilkan:** kontak publik agen hanya WhatsApp (keputusan privasi 2026-09-25); tidak ada nomor telepon terpisah di view `public_agent_profiles`.
4. **Tautan "Cek kelayakan KPR dengan Kalkulator DBR" tidak ditampilkan:** kalkulator DBR ada di area Agent (butuh login) dan belum dibangun; tautan publik belum punya tujuan.
5. **Peta lokasi:** wireframe hanya placeholder. Sekarang alamat teks + tautan "Buka di Google Maps" bila latitude/longitude ada; peta tertanam menunggu keputusan penyedia peta.
6. **Slug agen** = slugify(nama) + 8 karakter pertama user_id (`app/api/users/profile/route.ts`), unik (constraint `agent_profiles_public_slug_key`). Tautan "Lihat profil agen" memakai `/agen/{public_slug}` (halaman belum ada; lihat butir bentrok `/agent/{slug}` di atas).
7. **Pesan WhatsApp** (`lib/public/whatsapp-message.ts`) memuat nama agen, judul, harga, lokasi, tipe, kode listing (`RA-` + 8 karakter pertama id), dan tautan. Tautan memakai `NEXT_PUBLIC_SITE_URL`: harus diubah ke `https://staging.rumahagen.com` di Vercel (item Fase 0 yang belum selesai) agar tautan di pesan benar. Belum ada pencarian agen berdasarkan kode listing.
8. **Verifikasi memakai data contoh:** database staging belum punya listing terbit, profil agen, atau fasilitas, sehingga tampilan lengkap dicek lewat `/komponen/listing` (`?status=sold|suspended|...`, `?kosong=1`), bukan data nyata.

## 2026-09-26 — Fase 2, M11 Promo dan Konten Publik

1. **Tidak ada layar Admin untuk mengelola Konten Publik dan Promo** (Fase 5). Sampai itu ada, isi diubah lewat SQL. Tiga artikel footer (`syarat-ketentuan`, `kebijakan-privasi`, `hubungi-kami`) sudah ada sebagai DRAF CONTOH bertanda "belum ditinjau ahli hukum": **harus diganti teks resmi sebelum peluncuran.**
2. **Promo tidak punya slug, jenis, atau relasi proyek.** URL memakai uuid (`/promo/{id}`); label kampanye diambil dari `campaign_reference`; "Proyek terkait promo ini" di wireframe tidak punya kolom relasi ke `developer_projects`, jadi tidak ditampilkan. `cta_reference` hanya diterima bila jalur situs sendiri atau https (`safeHref`).
3. **Status promo yang belum mulai/berakhir/diarsipkan tidak terlihat pengunjung** (RLS `select_public` hanya active dalam jendela jadwal), jadi tiga keadaan spanduk di wireframe Promo-Detail tidak pernah tampil ke publik; diperlakukan sebagai "Promo tidak ditemukan" (konsisten dengan keputusan sold/expired listing).
4. **Format isi:** kolom `content` diperlakukan teks biasa: baris kosong = paragraf, `## Judul` = subjudul, `- butir` = daftar (tanpa HTML mentah, aman dari XSS). Bila Admin kelak ingin teks kaya (tebal, tautan, gambar), format ini perlu diperluas.
5. **Sitemap `static_public_content`** (`sitemap_participation`, `indexability`) belum punya rute sitemap; `indexability = noindex` sudah dihormati lewat meta robots.

## 2026-09-26 — Fase 2, M11 Learning dan Learning Session

1. **KEAMANAN: materi kursus terbaca anonim.** Policy `course_lessons_select` mengizinkan siapa pun (termasuk `anon`) membaca SEMUA kolom `course_lessons` untuk course `published`, termasuk `content_url` (video/PDF/slide). Dibuktikan lewat `SET LOCAL ROLE anon` di DB live (5 URL uji terbaca). Halaman publik hanya menampilkan judul dan jenis materi, tetapi siapa pun dapat memanggil REST Supabase dengan kunci anon dan mengambil tautan materi tanpa enroll. Bila materi dianggap eksklusif untuk peserta, batasi baca `content_url` (mis. view publik tanpa `content_url` + policy baca penuh hanya untuk peserta terdaftar/pemilik/staf, atau simpan materi di storage dengan URL bertanda tangan). Butuh keputusan pemilik produk; migration belum ditulis.
2. **Learning Session tidak terlihat pengunjung sama sekali:** `learning_sessions_select` mensyaratkan `auth.uid() IS NOT NULL` walau visibilitas `public`. Pengunjung melihat panel "Sesi Ini Bersifat Terbatas / Masuk untuk Cek Akses" (sesuai wireframe). Bila sesi publik seharusnya bisa dilihat/ditemukan mesin pencari tanpa login, policy perlu diubah.
3. **`learning_sessions` tidak punya kolom judul/deskripsi.** Judul memakai judul course terkait (atau "Sesi {tipe}" bila tanpa course); "Tentang Sesi Ini" memakai deskripsi course. Bila sesi butuh judul/deskripsi sendiri, perlu kolom baru. Tautan "Bagian dari event" tidak ditampilkan (tidak ada halaman Event; event_id belum dirujuk).
4. **Tautan gabung sesi live dan rekaman on-demand** tidak ditampilkan di halaman publik (butuh API terpisah untuk peserta: provider binding/artifacts). Sesi live menampilkan catatan; sesi selesai menampilkan tombol nonaktif.
5. **"Mulai Belajar" hanya mendaftarkan** (POST /api/courses/{id}/enroll); layar belajar (`/agent/belajar`) baru dibangun di Fase 3, jadi pesan setelah daftar mengarahkan ke menu Pembelajaran tanpa tautan.
6. **Belum diuji dengan pengguna login:** tombol Mulai Belajar, Daftar Sesi Ini, dan daftar/detail sesi hanya diuji sisi pengunjung (kata sandi akun uji tidak dimiliki Claude). Perlu uji manual oleh pemilik produk memakai akun Agent.
7. **Pengujian data contoh:** 3 course (2 terbit, 1 draft), lengkap dengan kuis 1 soal agar lolos aturan penerbitan, dan 3 sesi (publik terjadwal, publik selesai on-demand, privat terjadwal).

## Catatan performa

6. **Pencarian kata kunci listing lambat di skala besar (bukan mendesak).** `ILIKE '%kata%'` di bawah RLS tidak bisa memakai indeks trigram (ILIKE tidak leakproof): ±100 ms di 30.000 listing, tumbuh linear. Perbaikan bila perlu: fungsi `SECURITY DEFINER` `search_published_listing_ids(q, ...)` (hanya membaca listing published, boleh dipanggil anon) + indeks pg_trgm parsial; atau mesin pencari khusus. Diukur saat menulis migration 0154 (indeks harga/tipe/terbaru, tanpa trigram).
5. **Foto listing memakai URL apa adanya** (`listing_photos.url`); bila bucket storage bukan publik, gambar tidak tampil. Perlu dipastikan saat listing pertama terbit.
