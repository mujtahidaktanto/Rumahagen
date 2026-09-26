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
2. **(DIKOREKSI 2026-09-26, pemeriksaan ulang Fase 2) Ulasan dan peringkat agen ADA datanya** (tabel `agent_reviews`, migration 0030; anon membaca yang `approved`, API `GET /api/agents/{id}/reviews`). Catatan lama "tidak punya tabel/API" salah. Sekarang tampil: rata-rata + jumlah di kartu agen (daftar `/agen`, kartu agen di Detail Listing) dan bagian "Ulasan" + statistik bintang di Detail Agen (10 ulasan terbaru; `lib/public/agent-reviews.ts`). Menulis ulasan (`POST /api/agents/{id}/reviews`, butuh login) belum punya layar. Data uji: 4 ulasan tayang + 1 pending + 1 dihapus (sengaja tersembunyi).
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

> **KEPUTUSAN pemilik produk 2026-09-26: butir 1 (materi terbuka) DIBIARKAN TERBUKA** — `course_lessons.content_url` tetap terbaca anon; tidak ada perubahan yang direncanakan. Butir dipertahankan sebagai catatan risiko yang diterima. Title otomatis dari kelulusan course: migration 0155 (lihat README migrations).

1. **(DITERIMA, dibiarkan terbuka) materi kursus terbaca anonim.** Policy `course_lessons_select` mengizinkan siapa pun (termasuk `anon`) membaca SEMUA kolom `course_lessons` untuk course `published`, termasuk `content_url` (video/PDF/slide). Dibuktikan lewat `SET LOCAL ROLE anon` di DB live (5 URL uji terbaca). Halaman publik hanya menampilkan judul dan jenis materi, tetapi siapa pun dapat memanggil REST Supabase dengan kunci anon dan mengambil tautan materi tanpa enroll. Bila materi dianggap eksklusif untuk peserta, batasi baca `content_url` (mis. view publik tanpa `content_url` + policy baca penuh hanya untuk peserta terdaftar/pemilik/staf, atau simpan materi di storage dengan URL bertanda tangan). Butuh keputusan pemilik produk; migration belum ditulis.
2. **Learning Session tidak terlihat pengunjung sama sekali:** `learning_sessions_select` mensyaratkan `auth.uid() IS NOT NULL` walau visibilitas `public`. Pengunjung melihat panel "Sesi Ini Bersifat Terbatas / Masuk untuk Cek Akses" (sesuai wireframe). Bila sesi publik seharusnya bisa dilihat/ditemukan mesin pencari tanpa login, policy perlu diubah.
3. **`learning_sessions` tidak punya kolom judul/deskripsi.** Judul memakai judul course terkait (atau "Sesi {tipe}" bila tanpa course); "Tentang Sesi Ini" memakai deskripsi course. Bila sesi butuh judul/deskripsi sendiri, perlu kolom baru. Tautan "Bagian dari event" tidak ditampilkan (tidak ada halaman Event; event_id belum dirujuk).
4. **Tautan gabung sesi live dan rekaman on-demand** tidak ditampilkan di halaman publik (butuh API terpisah untuk peserta: provider binding/artifacts). Sesi live menampilkan catatan; sesi selesai menampilkan tombol nonaktif.
5. **"Mulai Belajar" hanya mendaftarkan** (POST /api/courses/{id}/enroll); layar belajar (`/agent/belajar`) baru dibangun di Fase 3, jadi pesan setelah daftar mengarahkan ke menu Pembelajaran tanpa tautan.
6. **Belum diuji dengan pengguna login:** tombol Mulai Belajar, Daftar Sesi Ini, dan daftar/detail sesi hanya diuji sisi pengunjung (kata sandi akun uji tidak dimiliki Claude). Perlu uji manual oleh pemilik produk memakai akun Agent.
7. **Pengujian data contoh:** 3 course (2 terbit, 1 draft), lengkap dengan kuis 1 soal agar lolos aturan penerbitan, dan 3 sesi (publik terjadwal, publik selesai on-demand, privat terjadwal).

## 2026-09-26 — Fase 2, M11 Organisasi

1. **Anggota tim diambil dari view profil agen publik, dicocokkan lewat `organization_id`** (migration 0156, keputusan 2026-09-26; sebelumnya lewat nama yang tidak unik). `organization_members` hanya terbaca anggota/admin (RLS), jadi pengunjung tidak bisa membacanya. Peran (leader/member) tidak ada di view sehingga lencana peran di wireframe tidak ditampilkan; menambahkannya butuh perluasan view lagi.
2. **Organisasi ditutup bertahap/ditutup/dibekukan tidak terlihat publik** (RLS `organizations_select_active_public` hanya `active`): spanduk status di wireframe hanya terlihat anggota/admin; bagi pengunjung "Organisasi tidak ditemukan".
3. **Kontak organisasi (telepon, alamat, situs, media sosial) publik** sesuai keputusan 2026-09-25. Situs dan media sosial hanya diterima bila https; kunci `social_media` yang dikenal: instagram, facebook, tiktok, youtube, linkedin, x/twitter (format jsonb bebas, belum ada kontrak).
4. **Data contoh:** organisasi "Kantor Uji RumahAgen" (tipe kantor, aktif; anggota Andi Pratama = leader dan Sari Wulandari; listing uji1 dijadikan listing organisasi) dan satu organisasi `suspended` yang sengaja tidak tampil.

## 2026-09-26 — Fase 2, M11 Developer (daftar, detail proyek, kemitraan)

> **KEPUTUSAN pemilik produk 2026-09-26:** butir 1 (komisi terbaca anon) **DIBIARKAN TERBUKA untuk sekarang** (risiko diterima, ditinjau ulang sebelum produksi); butir 2 (deskripsi) **tetap memakai `meta_description` 160 karakter untuk sekarang**. Tidak ada migration untuk keduanya.

1. **KEAMANAN/BISNIS: skema komisi proyek terbaca anonim.** Wireframe menyatakan komisi hanya untuk Agent yang login ("Info Kemitraan Agen"; pengunjung melihat "Masuk sebagai Agen"), tetapi RLS `developer_projects_select` mengizinkan `anon` membaca SEMUA kolom proyek publik, termasuk `commission_scheme` dan `extra_commission`. Dibuktikan lewat `SET LOCAL ROLE anon` di DB live (komisi ketiga proyek uji terbaca). Halaman web tidak menampilkan komisi kepada pengunjung, tetapi siapa pun dapat mengambilnya lewat REST Supabase dengan kunci anon. Bila komisi rahasia: pisahkan lewat view publik tanpa kolom komisi + cabut baca kolom itu dari anon/authenticated (baca penuh hanya untuk agen/developer pemilik/staf). Butuh keputusan pemilik produk (sebelumnya materi kursus terbuka diterima sebagai risiko).
2. **`developer_projects` tidak punya kolom deskripsi.** "Deskripsi" di wireframe hanya bisa memakai `meta_description` (maks. 160 karakter, teks SEO). Bila developer butuh deskripsi panjang, perlu kolom baru.
3. **Tidak ada halaman profil developer sendiri.** Wireframe hanya memuat kartu "Tentang Developer" di halaman proyek; nama developer di kartu daftar tidak berupa tautan. `pic_contact` ditampilkan sebagai WhatsApp bila berupa nomor telepon (kontak PIC publik sesuai keputusan 2026-09-25).
4. **Klaim Proyek** memakai `POST /api/developer-projects/{id}/claim` (satu klaim per agen per proyek, UNIQUE); status klaim (pending/approved/rejected/revoked/withdrawn) ditampilkan bila ada. Klaim yang ditolak/dicabut/ditarik tidak bisa diajukan ulang dari halaman ini (constraint unik); butuh alur pengajuan ulang. Layar Klaim Proyek Agent ada di Fase 4.
5. **Proyek `inactive` dan proyek milik developer nonaktif tidak terlihat publik** (RLS); pengunjung menerima "Proyek tidak ditemukan". Spanduk hanya untuk `sold_out` dan `coming_soon` (yang memang terlihat).
6. **Belum diuji dengan Agent yang login:** panel "Info Kemitraan Agen" dan tombol Klaim Proyek Ini (kata sandi akun uji tidak dimiliki Claude); hanya sisi pengunjung yang diuji.
7. **Data contoh:** developer "PT Kanaya Group Developer (data uji)" (PIC nomor fiktif 081200000001), proyek `active` (dengan komisi dan 3 foto + 1 video), `coming_soon`, `sold_out`, dan satu `inactive` serta satu proyek dari developer nonaktif yang sengaja tidak tampil.

## 2026-09-26 — Fase 2, M11 Event (daftar dan detail)

1. **Kuota terisi dan daftar tunggu tidak bisa dihitung publik.** RLS `event_registrations` hanya membuka baris milik sendiri, jadi bilah "terisi/kuota" dan status penuh/daftar tunggu di wireframe tidak bisa ditampilkan; halaman hanya menampilkan kuota total (`events.quota`). Bila perlu: fungsi/view agregat publik (jumlah pendaftar per event).
2. **Kuota tidak ditegakkan database.** Kolom `events.quota` tidak dipakai constraint/trigger; pendaftaran melewati kuota tidak ditolak di level DB (diserahkan ke API rsvp/penyelenggara).
3. **Pendaftaran wajib login sebagai Agent** (`POST /api/events/{id}/rsvp`); tidak ada pendaftaran tamu publik. Pengunjung diarahkan ke "Masuk untuk Mendaftar".
4. **`meeting_link` tidak ditampilkan** di halaman publik (dibagikan penyelenggara setelah pendaftaran).
5. **Tidak terlihat publik (RLS):** event `pending_approval`, `rejected`, `cancelled`, visibility `organization`/`private`, dan yang sudah dihapus; pengunjung menerima "Event tidak ditemukan".
6. **`events.related_course_id` tidak punya foreign key ke `courses`** (hanya `related_project_id` yang punya), sehingga course terkait dibaca dengan query terpisah (hanya course `published`); tanpa FK, ID course yatim tidak dicegah DB.
7. **Belum diuji dengan Agent yang login:** tombol Daftar Sekarang / Ajukan Pendaftaran dan status pendaftaran (kata sandi akun uji tidak dimiliki Claude).
8. **Data contoh:** 7 event uji (3 akan datang: workshop online auto_confirm terkait course, open house manual_approval terkait proyek, gathering closed; 1 training lalu; 3 sengaja tersembunyi: pending_approval, private, cancelled).

## 2026-09-26 — Pemeriksaan ulang Fase 2 (wireframe, API, permission route)

1. **Ulasan agen** ditambahkan (lihat Detail Listing butir 2 yang dikoreksi).
2. **Verifikasi Sertifikat** (`/verifikasi`, `/verifikasi/[kode]`) dibangun ulang sesuai wireframe M04: memakai Global Public Shell (`app/verifikasi/layout.tsx`) dan komponen dasar; keadaan valid/dicabut/tidak ditemukan/gagal/terlalu banyak percobaan; "Salin tautan halaman ini", "Periksa kode lain", "Hubungi bantuan" (mailto), "Cara kerja verifikasi". Pembatas percobaan halaman memakai `rate_limit_log` yang sama dengan API (60/menit, kunci `verify:{ip}`, `lib/certificates/verify-rate.ts`); kegagalan pembatas tidak memblokir verifikasi. Folder tetap `app/verifikasi` (bukan `app/(publik)/verifikasi`) karena penghapusan folder lama ditolak; hasilnya sama.
3. **Detail Learning Session** kini menampilkan "Bagian dari event" (event terbit+publik) dan "Lihat profil organisasi" (organisasi aktif), serta lencana "Live Sekarang". `learning_sessions.event_id` tidak punya foreign key ke `events` (dibaca dengan query terpisah). Tombol "Gabung Sekarang" dan "Tonton Rekaman" tetap belum ada (butuh API tautan sesi/rekaman; belum diuji dengan pengguna login).
4. **TERBUKA (perlu keputusan, ubah API): sitemap** hanya memuat listings, agents, developer-projects (kontrak API-150 mengunci 4 berkas). Organisasi, event, learning, konten, dan promo belum masuk sitemap.
5. **`robots.txt`** hanya memblokir `/api/` dan `/admin/`; `/agent`, `/partner`, `/instructor`, `/portal` tidak diblokir (halaman butuh login, jadi tidak terindeks nyata).

## 2026-09-26 — CTA promo terstruktur (KEPUTUSAN pemilik produk: pilihan jenis CTA di form admin)

1. **Format `cta_reference` terstruktur** (tanpa perubahan skema; kolom tetap teks 500 karakter): `project:{slug}`, `course:{uuid}`, `event:{uuid}`, `page:{kunci}` (kunci tetap `CTA_PAGES` di `lib/public/cta.ts`), `whatsapp:{nomor}[?text=pesan]`, `url:https://...`. Nilai lama (jalur situs atau https) tetap diterima. Sisi publik sudah selesai: `parseCta`, `resolveCta` (project/course/event hanya jadi tombol bila terlihat publik), label tombol per jenis, dan bagian "Proyek/Kursus/Event terkait promo ini" di Detail Promo (menutup butir Promo #2 soal proyek terkait). Diuji 14 kasus + verifikasi di halaman.
2. **HARUS DIKERJAKAN di Fase Admin (layar Banner & Promosi M09):** ganti kolom teks CTA dengan dropdown jenis + pemilih isi (proyek/kursus/event ditarik dari API daftar dengan pencarian nama; halaman = daftar `CTA_PAGES`; WhatsApp = nomor + pesan; tautan luar = URL https). Wireframe `M09-Konten-Notifikasi` perlu dilengkapi field CTA, gambar, dan kampanye (saat ini hanya Judul, Isi, Mulai, Berakhir, Status).
3. **API admin `POST/PUT /api/admin/banners` (`bannerSchema` di `lib/validation/admin.ts`) belum memvalidasi `cta_reference`** (hanya string maks. 500). Usul: validasi dengan `parseCta` agar hanya format sah yang tersimpan. Butuh izin karena mengubah API.
4. **Data uji diperbaiki:** promo Cashback Kanaya -> `project:cluster-kanaya-residence-uji`; promo agen baru -> `page:daftar` (nanti bisa ke halaman langganan Agent setelah Fase 3-4; kunci halaman baru ditambahkan ke `CTA_PAGES`).

## 2026-09-26 — Wireframe baru: Beri Ulasan, Form Banner, Form Konten Publik, Title di Sertifikat-Kursus

1. **Layar Admin Konten Publik butuh API baru:** tidak ada route admin untuk `static_public_content` (hanya RLS `m11.static_public_content.publish` untuk Admin/Superadmin). Usul: `GET/POST /api/admin/static-content`, `GET/PUT /api/admin/static-content/{id}` (siklus status draft → published → unpublished → archived; slug unik 409). Usul produk yang digambar: halaman footer (syarat-ketentuan, kebijakan-privasi, hubungi-kami) dikunci slug dan statusnya; belum ada aturan seperti itu di database.
2. **Form Banner:** `POST/PUT /admin/banners` belum memvalidasi `cta_reference` (usul: `parseCta` dari `lib/public/cta.ts`); tidak ada unggah gambar banner (hanya tautan); status `scheduled` tidak otomatis menjadi tampil (RLS publik hanya membaca status active dalam jadwal). Pemilih proyek/kursus/event memakai API daftar yang sudah ada.
3. **Beri Ulasan:** API ulasan mengizinkan ulasan ke profil sendiri (buyer_id NULL = self-review) dan tidak membatasi satu ulasan per pengulas; wireframe memblokir profil sendiri sebagai usul produk. Ulasan tayang langsung dan tidak bisa diedit pengulasnya (RLS).
4. **Sertifikat-Kursus:** kartu "Title setelah lulus" memakai `awards_title_definition_id` (PUT certificate-config); daftar title = title aktif dengan cakupan otoritas aktif (API daftar Jalur Penghargaan M15).

## 2026-09-26 — Wireframe M01 diselaraskan

Register/OTP/Login/Akun Dibatasi diperbarui mengikuti keputusan dan implementasi (lihat README wireframe). Celah lama yang ditutup: nomor WhatsApp di Register, OTP via WhatsApp, "Email atau Nomor HP" di Login, dan keadaan pending_review di Akun Dibatasi. Verifikasi nomor WhatsApp tetap tidak ada di backend (butuh penyedia WA/SMS); bila kelak dibuat, wireframe OTP perlu langkah tambahan.

## 2026-09-26 — Fase 3a, M08 Dashboard Agent

1. **Belum diuji dengan Agent yang login** (kata sandi akun uji tidak dimiliki Claude): kode dan pembacaan data belum dijalankan terhadap akun nyata. Tampilan diperiksa lewat galeri `/komponen/agent?dashboard=normal|kosong|gagal|ktp` (data contoh), tsc, dan uji Vitest untuk fungsi murni. Perlu uji manual: buka `/agent` setelah login.
2. **Wireframe menyebut banner "pending_review" untuk verifikasi identitas**, padahal itu bukan `users.status` (akun pending_review tidak bisa masuk area, dialihkan ke /akun-dibatasi). Implementasi memakai `agent_profiles.ktp_requirement_state = 'submitted'` (deferred/verified tidak menampilkan spanduk); lencana diberi teks "submitted".
3. **"Leads Baru" = klik CTA WhatsApp bulan ini** (definisi agent_statistics_daily, migration 0125), bukan jumlah pesan WA yang benar-benar masuk; tercantum di keterangan kartu. Rentang = awal bulan sampai hari ini (WIB).
4. **Pintasan Kalkulator DBR, Klaim Proyek, Kualifikasi & Penghargaan, Statistik Saya nonaktif ("Segera hadir")** sampai halamannya dibangun (Fase 4); ganti `href` di `QUICK_ACTIONS`.
5. **Belum ada:** pengalih konteks Personal/Organisasi (M12), kolom cari, dan lonceng notifikasi di bilah atas (wireframe); tautan "Lihat semua" Listing Terbaru dan Notifikasi menunggu Listing Saya (Fase 3c) dan Pusat Notifikasi (Fase 6). Ringkasan memakai RPC agent_statistics_* (sekaligus memanggil perbandingan anonim yang tak dipakai dashboard).
6. Badge status listing memakai teks nilai CHECK apa adanya (`components/ui/StatusBadge.tsx`) sesuai aturan desain; agent awam melihat "pending_review" dll.

## 2026-09-26 — Fase 3b, M02 Profil Saya (+ verifikasi KTP)

1. **Belum diuji dengan Agent yang login** (kata sandi akun uji tidak dimiliki Claude): simpan profil (`PUT /users/profile`), unggah foto KTP (upload-url -> PUT bertanda tangan -> `PUT /agents/me/ktp`), dan pemuat provinsi/kota belum dijalankan terhadap akun nyata. Tampilan diperiksa lewat galeri `/komponen/agent?layar=profil&profil=terisi|baru&ktp=belum|terverifikasi`, tsc, dan 9 uji Vitest untuk validasi (`lib/validation/profile-form.ts`). Perlu uji manual di staging: simpan profil baru, unggah KTP dengan NIK sah, NIK ganda (409), NIK dengan kode wilayah salah (galat server).
2. **Tidak ada API unggah foto profil.** `avatar_url` hanya string; tombol "Ganti Foto" dinonaktifkan dengan keterangan. Butuh bucket + upload-url seperti KTP.
3. **Provinsi/kota tidak bisa dikosongkan:** `upsertAgentProfileSchema` menerima uuid opsional, bukan null (form hanya mengirim bila dipilih).
4. **Profil pertama mewajibkan nomor WhatsApp** (Register kini tidak memintanya, sesuai keputusan); `PUT /users/profile` menolak tanpa WhatsApp, jadi form menandainya wajib dan menjelaskan di spanduk "Lengkapi profil Anda". KTP baru bisa diunggah setelah profil ada (API upload-url mensyaratkan).
5. **Nama Kantor (`office_name`)** ditambahkan sebagai isian (ada di API dan tampil di profil publik) walau tidak tergambar di wireframe; wireframe hanya punya kartu Organisasi.
6. **Kelola Presentasi title dan Ajukan Bukti Kualifikasi** (M15) nonaktif "segera hadir" sampai Fase 4. Title yang tampil dibaca dari `title_presentations` aktif.
7. **Foto/nomor KTP tidak pernah dikirim ke halaman:** hanya nomor tersamar (`maskNik`); "Ganti Data KTP" menimpa data lama (foto lama dihapus server). Status `submitted` (data lama) diperlakukan sebagai belum terverifikasi.

## 2026-09-26 — Fase 3c, M03 Listing Saya, Detail Listing, Wizard Buat/Edit

1. **Belum diuji dengan Agent yang login** (kata sandi akun uji tidak dimiliki Claude): daftar, detail, aksi (terbitkan, terjual/tersewa, hapus, refresh), dan Wizard belum dijalankan terhadap akun nyata. Tampilan diperiksa lewat galeri `/komponen/agent?layar=listing|listing-detail|wizard`, tsc, dan uji Vitest untuk logika (kuota, aturan aksi, validasi/pembuat badan Wizard). Perlu uji manual: buat listing dari nol, simpan draf, terbitkan (kuota berkurang), edit, tandai terjual, refresh, hapus draf.
2. **[SELESAI 2026-09-26: migration 0158 + API upload-url, lihat bagian unggah foto] Sebelumnya BLOKIR: tidak ada API unggah foto/video listing.** (Video tetap hanya tautan.) `POST /listings/{id}/media` hanya menyimpan `url` teks (maks 500); tidak ada bucket/upload-url seperti KTP. Wizard memakai TAUTAN https (foto pertama = sampul) dan menjelaskannya ke pengguna. Agar Agent bisa mengunggah dari HP/komputer perlu: bucket privat/publik `listing-media`, route `POST /listings/{id}/media/upload-url` (JPEG/PNG/WebP, batas ukuran, maks 20 file), dan pemeriksaan kepemilikan. Butuh izin karena menambah API.
3. **API tidak bisa menyimpan draf parsial:** `POST /listings` mewajibkan judul, kategori, transaksi, tipe, harga, alamat, provinsi/kota/kecamatan, dan WhatsApp. Wizard menyimpan ke server hanya di akhir ("Simpan sebagai Draf"/"Terbitkan"); progres per langkah hilang bila halaman ditutup (belum ada simpan otomatis lokal).
4. **Konteks organisasi belum ada** (kartu Organisasi di langkah 1 nonaktif "Fase 3f"): listing selalu `listing_context=personal`; kuota organisasi/pemilih organisasi menunggu M12. Titik peta belum ada (peta belum terhubung), sesuai keputusan.
5. **Terbit tanpa moderasi** (Gate PRE-00-E): `PATCH /listings/{id}/status published` langsung tayang dan memakai kuota; kuota habis -> 409 `listing_quota_exhausted` (listing tetap draf, pesan khusus). Listing `rejected` diperbaiki lalu "Simpan & Ajukan Ulang" memakai publish yang sama (tidak ada endpoint ajukan-ulang ke review; transisi ke/dari pending_review hanya staf), jadi menerbitkan ulang tidak menunggu tinjauan ulang staf.
6. **Hapus Listing hanya untuk draft/rejected/expired/sold/rented** (keputusan UI; listing tayang harus ditandai terjual/tersewa atau dibiarkan kedaluwarsa). `DELETE /listings/{id}` adalah hapus permanen (bukan soft delete) dan dikonfirmasi lewat dialog.
7. **Duplikat Listing** = Wizard dengan isian disalin (`/agent/listing/baru?salin={id}`), tanpa foto/video dan judul diberi "(salinan)"; bukan endpoint duplikasi.
8. **Kolom terkunci sejak publikasi pertama** (alamat, tipe properti, luas tanah/bangunan; trigger DB): Wizard edit menonaktifkan dan tidak mengirimnya; ditandai ikon gembok di Detail.
9. **Kuota refresh harian** dibaca dari `agent_statistics_summary` (quota.allowance/used_today); tanpa kolam kuota terbaca tombol tetap dicoba dan server memutuskan. Slug listing dibuat server (`slugify(title)` + akhiran acak).
10. **Fitur wireframe yang belum ada:** menu ⋮ per baris, filter/cari di Listing Saya, tautan Beli Slot/Paket Pro (Fase 4, tampil "segera hadir"), Leads penuh (hanya 5 terbaru; layar Leads belum ada).

## 2026-09-26 — Alamat profil publik bisa diganti + Bagikan Profil

1. **Alamat profil (`/agen/{slug}`) sebelumnya permanen** (dibuat sekali dari nama + 8 karakter user_id; `PUT /users/profile` tidak menerimanya). Keputusan pemilik produk: bisa diganti Agent, dengan cek ketersediaan sebelum simpan dan maksimal 1x per bulan kalender WIB. Migration 0157 (DITERAPKAN 2026-09-26), `GET /api/agents/me/slug-availability?slug=`, `public_slug` di `PUT /users/profile` (galat aturan -> 409 berpesan), dan bidang "Alamat Profil Publik" di Profil Saya (cek otomatis setelah berhenti mengetik, konfirmasi sebelum ganti, keterangan kapan boleh ganti lagi). 0157 sudah diterapkan sebelum kode dideploy.
2. **Perbaikan**: trigger pengalihan slug agen memakai `/agent/` (area aplikasi) bukan `/agen/`; diganti di 0157.
3. **Tombol "Bagikan Profil"** ditambahkan di kepala profil publik Agen (`ShareButton` berlabel: lembar bagikan perangkat, atau salin tautan). **Wireframe belum diperbarui**: `M02-Profil-Saya` (kartu Alamat Profil Publik) dan `M11-Detail-Agen` (tombol Bagikan Profil).

## 2026-09-26 — Fase 3d, M04 Pembelajaran dan Belajar-Course

Layar: `/agent/belajar` (LP + riwayat, Course Saya, Sertifikat Saya, Sesi Belajar Saya) dan `/agent/belajar/[id]` (materi, kuis, Course Selesai). Galeri: `/komponen/agent?layar=belajar&belajar=normal|kosong|gagal` dan `?layar=course&course=normal|selesai|tanpa-kuis`. Belum diuji dengan login Agent (uji manual pemilik produk: daftar course dari `/learning/[id]`, tandai materi, kerjakan kuis, unduh sertifikat).

1. **Progres per pelajaran tidak tersimpan.** Server hanya punya `enrollments.progress_percent` (peserta maks 99; 100 hanya lewat kuis lulus, migration 0130). UI menyandikan k dari n pelajaran selesai sebagai round(k/n x 90)% dan mewajibkan pelajaran diselesaikan berurutan (`lib/agent/learning-rules.ts`). Konsekuensi: tidak bisa menandai pelajaran acak, dan mengubah jumlah pelajaran course di tengah jalan menggeser tanda selesai. Bila ingin per-pelajaran sungguhan: tabel `course_lesson_completions` + API (perlu izin mengubah migration/API).
2. **Course tanpa kuis tidak bisa selesai oleh peserta** (penyelesaian hanya lewat kuis lulus atau staf). UI menampilkan catatan; keputusan produk: wajibkan minimal 1 kuis saat terbit, atau beri jalur selesai untuk course tanpa kuis.
3. **Kartu "Learning Path" di wireframe M04-Pembelajaran tidak ditampilkan.** Wireframe berisi contoh statis ("Jalur Karier Agen Profesional, 4 dari 10 aktivitas"); `GET /agents/me/learning/progress` hanya mengembalikan `learning_unlock_progressions` (state per versi jalur, tanpa nama jalur atau jumlah aktivitas) sehingga tidak bisa diisi tanpa mengarang. Perlu API ringkasan jalur (nama, aktivitas selesai/total) atau keputusan menghapus kartu dari wireframe.
4. **"+LP didapat" di layar Course Selesai (wireframe) tidak ditampilkan.** Tidak ada API yang menyatakan berapa LP yang diberikan saat course selesai; saldo dan riwayat ada di Pembelajaran. Riwayat LP memakai label dari `transaction_type` (earned/purchased/redeemed/used/adjustment/reversal) karena `source_type` tidak punya daftar nilai baku.
5. **Materi PDF/slide dibuka di tab baru** (bukan disematkan) karena `content_url` bisa berupa tautan apa saja (Drive, Canva, dsb.) yang sering menolak disematkan. Video: YouTube disematkan (youtube-nocookie), berkas mp4/webm diputar langsung, selain itu tab baru. Hanya tautan https yang dipakai.
6. **Sesi belajar:** `learning_sessions` tidak punya judul, jadi memakai judul course terkait (atau "Sesi belajar"); kartu mengarah ke `/learning-session/[id]` publik.
7. **Halaman course publik** `/learning/[id]`: setelah "Mulai Belajar" kini ada tombol "Buka Materi" ke `/agent/belajar/[id]` (`EnrollButton` menerima `doneHref`).

## 2026-09-26 — Unggah foto profil dan foto listing (0158 DITERAPKAN)

Keputusan pemilik produk: pilih berkas hingga 25 MB, dikecilkan di browser, batas simpan 3 MB, tiga varian ukuran web (400/1080/2048 px). **Migration 0158 (bucket `avatars` dan `listing-photos`) DITERAPKAN 2026-09-26**, sebelum kode dideploy.
1. **Menggantikan** temuan lama: "tidak ada API unggah foto profil" (Profil Saya) dan "BLOKIR: tidak ada API unggah foto listing" (Wizard). Profil Saya: `AvatarUploader` (pangkas lingkaran: geser, zoom 1-4x, putar 90 derajat, 512x512). Wizard langkah Media: "+ Tambah Foto" (banyak berkas), pratinjau lokal, unggah saat Simpan/Terbitkan setelah listing dibuat; foto gagal terunggah dapat dicoba ulang tanpa mengunggah ulang yang sudah berhasil.
2. **Verifikasi tanpa login:** `/komponen/media` menunjukkan ukuran hasil pengecilan dengan kode asli (foto uji 27 MP berderau 6,4 MB menjadi 47 KB / 213 KB / 477 KB dan avatar 83 KB, 2,9 detik). Alur unggah asli belum diuji (butuh 0158 diterapkan dan login Agent): uji manual pemilik produk.
3. **Berkas yatim:** foto yang sudah terunggah tetapi listing gagal disimpan/ditinggalkan tetap ada di bucket (tidak ada pembersih). Dampaknya kecil (sekitar 0,5-1 MB per foto); pembersih terjadwal bisa ditambahkan kelak.
4. **HEIC:** Chrome di komputer tidak bisa membuka HEIC; pesan menyarankan JPEG (Safari iPhone mengubah otomatis saat memilih dari galeri).
5. **Tautan foto eksternal lama** masih diterima API (`POST /listings/{id}/media` dengan URL https) demi kompatibilitas; UI tidak lagi menawarkannya. Varian ukuran hanya untuk foto hasil unggah; tautan lama ditampilkan apa adanya.
6. **Foto profil lama** (`avatar_url` bebas) kini ditolak oleh `PUT /users/profile` kecuali milik bucket sendiri; belum ada data seperti itu dari UI.

## 2026-09-26 — Fase 3e, M05 Event Saya, Ajukan Event, Kelola Event

**Pembaruan (migration 0160 DITERAPKAN 2026-09-26):** butir 1 (peserta mengubah status sendiri), 2 (tombol Batalkan) dan 3 (layar pendaftar penyelenggara) di bawah ditutup oleh 0160 + `DELETE /events/{id}/rsvp` + `GET|PATCH /events/{id}/registrations`; UI: tombol Batalkan di Event Saya dan kartu Pendaftar di Kelola Event (Setujui/Tolak/Tandai Hadir/Batalkan). Temuan tambahan yang ikut ditutup: pendaftaran ganda, ke event belum tayang atau privat, dan status awal bebas. **Wireframe M05-Ajukan-Event belum memuat kartu Pendaftar** (perlu ditambahkan). Kuota tetap informasi saja (tidak ditegakkan).

Layar: `/agent/event` (Event Saya), `/agent/event/baru` (Ajukan Event), `/agent/event/[id]` (Kelola Event). Galeri: `/komponen/agent?layar=event&event=normal|kosong|gagal` dan `?layar=event-form&mode=baru|belum|tayang|ditolak|batal`. Belum diuji dengan login Agent (uji manual pemilik produk: ajukan event, terbitkan, edit, lihat di `/event`).
1. **[KEAMANAN, perlu keputusan] Peserta bisa mengubah status pendaftarannya sendiri.** `event_registrations_update` mengizinkan pemilik baris (izin agent `m05.event_registration.update` lingkup own) dan trigger `enforce_event_registration_organizer_rules` langsung membiarkan pemilik lolos (`OLD.agent_id = auth.uid()`). Lewat REST langsung, peserta bisa menyetujui diri sendiri (`pending_approval` -> `registered`) atau menandai `attended`. Perbaikan yang disarankan (migration): peserta hanya boleh `registered|waitlist|pending_approval` -> `cancelled`.
2. **Tombol "Batalkan" pendaftaran (wireframe M05-Event-Saya) belum ada.** Tidak ada API pembatalan pendaftaran (hanya `POST /events/{id}/rsvp`). Bergantung pada butir 1: tambah `DELETE /events/{id}/rsvp` (atau PATCH status) setelah pembatasan pemilik.
3. **Penyelenggara tidak punya layar pendaftar.** Tidak ada API daftar pendaftar per event dan tidak ada API setujui/tolak (RLS `event_registrations_select_organizer/update_organizer` sudah ada, route belum). Event dengan mode "Perlu Persetujuan" belum bisa diproses Agent penyelenggara; wireframe M05 Agent tidak memuat layar ini (hanya Instruktur/Developer punya rujukan).
4. **Bidang opsional yang sudah tersimpan tidak bisa dikosongkan** lewat `PUT /events/{id}`: `end_at`, `quota`, `related_course_id`, `related_project_id` (skema Zod tidak menerima null). Teks bebas (deskripsi, lokasi, tautan, host) bisa dikosongkan dengan string kosong.
5. **Alasan penolakan event tidak disimpan** (tidak ada kolom), jadi banner Ditolak hanya bertuliskan "Perbaiki informasi lalu ajukan kembali". Event ditolak diajukan kembali lewat PUT status `pending_approval` (bukan diterbitkan langsung).
6. **Agent tidak bisa membatalkan event** (perlu `m05.event.cancellation`, hanya staf); status `cancelled` tampil tanpa aksi.
7. **Kuota tidak ditegakkan** dan status `waitlist` tidak pernah dibuat sistem (belum ada aturan); kuota hanya informasi.
8. Waktu diisi dan ditampilkan WIB (datetime-local <-> ISO UTC, `lib/agent/event-rules.ts`, diuji).

## 2026-09-26 — Jatah Refresh Listing harian (migration 0159 DITERAPKAN 2026-09-26)

Laporan pemilik: klik Refresh selalu "kuota harian habis" dan jatahnya tidak terlihat. Penyebab: 0 Agent punya kolam kuota refresh (hanya dibuat Superadmin atau add-on, tidak otomatis) dan pesan galat menyamakan "belum punya jatah" dengan "habis". Keputusan pemilik: semua Agent otomatis punya jatah gratis harian (bawaan 5), bisa diubah Superadmin, plus tambahan per orang. Detail aturan, uji, dan API di `supabase/migrations/README.md` (0159).
1. Kartu Refresh Detail Listing kini punya keadaan "Belum Ada Jatah Refresh" (jatah efektif 0) dan pesan sendiri untuk alasan `agent_refresh_allowance_none`; menampilkan "Jatah gratis X + tambahan Y" bila ada tambahan.
2. **Keputusan pemilik:** paket refresh dari add-on = SALDO tanpa masa berlaku dan tanpa reset, dipakai setelah jatah gratis harian dan bonus. Form katalog add-on (Fase Admin) sebaiknya menyembunyikan/mengunci masa berlaku untuk kapasitas `listing_refresh` dan menjelaskan artinya "jumlah refresh" (bukan per hari); DB sudah memaksa tanpa masa berlaku.
3. Layar admin untuk angka bawaan dan bonus per orang belum ada (API-nya ada); dikerjakan di Fase Admin. Sementara angka bawaan diubah lewat `PUT /admin/config/system/refresh_allowance.default_daily`.
4. Halaman "kuota refresh" khusus Agent (riwayat pemakaian) belum ada; `GET /agents/me/refresh-allowance` tersedia untuk Dashboard/Statistik nanti.

## 2026-09-26 — Fase 3f, M12 Organisasi, Buat Organisasi, Kelola Anggota (0161 DITERAPKAN 2026-09-26)

Layar: `/agent/organisasi` (belum tergabung: Undangan untuk Anda + Buat/Cari; sudah tergabung: dashboard), `/agent/organisasi/baru`, `/agent/organisasi/anggota`; kartu "Bergabung" di `/organisasi/[slug]`. Galeri: `/komponen/agent?layar=organisasi&org=tanpa|undangan|gagal|leader|member|closing|ditutup|dibekukan|kuota-gagal`, `?layar=org-baru`, `?layar=org-anggota&peran=leader|member`. Belum diuji dengan login Agent (uji manual: buat organisasi, undang, terima/tolak, permohonan, keluarkan, Edit Branding, tutup 2 langkah + OTP).
1. **[KEAMANAN] Celah undangan organisasi (Agent bisa masuk organisasi mana pun tanpa undangan lewat REST)** ditutup migration 0161 (lihat README migrations). **0161 sudah diterapkan sehingga celah tertutup.**
2. **Wireframe dan data:** logo/banner tidak diunggah saat Buat Organisasi (butuh id organisasi untuk jalur unggah); ditambahkan lewat Edit Branding setelah dibuat. Logo (persegi, 512 px) dan banner (memanjang **4:1**, 1600x400 px; wireframe menyebut 3:1) dipangkas dengan `components/media/CropDialog` (bingkai mengikuti rasio hasil; geser, zoom 1-4x, putar 90 derajat, seperti foto profil). Banner tampil dengan rasio 4:1 yang sama di halaman Organisasi dan halaman publik agar tidak terpotong lagi. Foto yang sudah tersimpan belum bisa dipangkas ulang dari berkas tersimpan: pilih ulang foto aslinya lewat Ganti & Atur.
3. **Satu organisasi:** wireframe mengasumsikan satu organisasi; DB mengizinkan keanggotaan aktif di beberapa organisasi. Layar menampilkan keanggotaan terbaru; pemilih organisasi belum ada.
4. **Pencarian undangan** hanya menemukan Agent dengan profil publik (nama atau nomor lisensi, minimal 2 huruf). Undangan berlaku 7 hari (bawaan UI; API menerima `expires_at`).
5. **Keluar dari organisasi** hanya untuk anggota biasa; keluarnya leader menutup organisasi (trigger `org_closing_on_lead_exit`), jadi leader memakai Tutup Organisasi. Tidak ada pengalihan leader (transfer kepemimpinan) di API.
6. **Kuota organisasi** memakai kartu kuota yang sama dengan Listing Saya (lingkup organisasi); tautan "Beli Slot" dan "Lihat Paket Pro" tetap "segera hadir" sampai layar Komersial ada.
7. ~~Konteks organisasi di Wizard Listing~~ SELESAI 2026-09-26 (lihat bagian "Konteks organisasi pada Listing" di bawah).
8. **Dashboard Agent:** angka/notifikasi undangan organisasi belum tampil di Dashboard; undangan baru terlihat di Organisasi dan Pusat Notifikasi (Fase 4).

## 2026-09-26 — Topbar desktop Agent (cari, Context Switcher, lonceng notifikasi)

`components/shell/{AgentTopbar,TopbarSearch,NotificationBell,ContextSwitcher,use-dismiss}`, data `lib/agent/shell-data.ts` (dimuat di `app/agent/layout.tsx`), aturan murni `lib/agent/{context,notification-link,search-scope}.ts` (diuji). Kerangka `AppShell` menerima `desktopTop`, `mobileTop`, `drawerTop`. Contoh: `/komponen/shell?notif=ada|kosong|gagal&org=ada|tanpa|aktif`. Belum diuji dengan login Agent.
1. **Cari:** cakupan Listing / Agen / Event yang membuka halaman publik dengan `?q=` (bukan pencarian global lintas entitas dan bukan pencarian listing milik sendiri; belum ada API pencarian global).
2. **Lonceng:** angka belum dibaca + panel 6 notifikasi terbaru; klik = tandai dibaca lalu buka tujuan bila ada (event, listing, sesi, sertifikat, organisasi); "Tandai semua dibaca". **Halaman Pusat Notifikasi (semua notifikasi, filter) belum ada** (Fase 4), jadi tidak ada tautan "Lihat semua". Angka dimuat ulang tiap pindah halaman, tanpa polling atau push realtime.
3. **Context Switcher:** Pribadi + organisasi yang diikuti (active atau closing), disimpan di cookie `ra_ctx` dan divalidasi server terhadap keanggotaan. Mempengaruhi layar Organisasi dan Listing Saya (kuota dan daftar), serta pemilik kuota bawaan Wizard (organisasi yang ditampilkan). Daftar dan kuota Listing Saya tetap pribadi karena Wizard belum menawarkan listing organisasi (kuota organisasi memang tidak dipakai listing pribadi); wireframe menginginkan daftar, izin, dan kuota ikut berganti: dikerjakan bersama pilihan konteks di Wizard.
4. **Judul halaman tidak di topbar:** tiap layar sudah memuat judulnya sendiri, jadi topbar tidak mengulang judul seperti wireframe. Avatar menuju Profil Saya (menu Keluar tetap di rel).
5. **Layar sempit:** lonceng di bilah atas, Context Switcher di laci, kolom Cari belum ada di mobile.
6. **Persona lain (Admin, Partner, Instructor) belum punya topbar;** komponen lonceng dan Cari bisa dipakai ulang, Context Switcher hanya untuk Agent (wireframe Partner tanpa Context Switcher).

## 2026-09-26 — Konteks organisasi pada Listing (Wizard + Listing Saya)

Tanpa migration (0140 sudah menyediakan kolom, trigger keanggotaan, dan kuota per pemilik). Kode: `lib/agent/listing-data.ts` (`getMyListingsData(userId, search, context)`), `listing-wizard.ts` (`organizationId`), `ListingWizard.tsx` (langkah Mulai), `MyListingsView.tsx`. Belum diuji dengan login Agent.
1. **Wizard:** langkah Mulai kini memilih Pribadi / Organisasi (bawaan = konteks aktif; pemilih organisasi bila diikuti >1). Kuota dimuat ulang per pilihan (`?organization_id=`), ringkasan memakai "Pemilik kuota". Terkunci saat edit (organisasi listing tidak dipindah lewat UI; DB juga menolak bila jatah aktif).
2. **Listing Saya:** daftar, jumlah per status, dan kartu kuota mengikuti konteks aktif (Pribadi = `organization_id` kosong; organisasi = listing yang dibuat sendiri atas nama organisasi itu; kuota = kuota bersama organisasi).
3. ~~Batasan RLS~~ SELESAI (migration 0162, diterapkan): pemimpin melihat semua listing organisasi (baca saja), tidak pernah listing pribadi anggota; anggota tetap hanya miliknya.
4. **Organisasi berstatus closing** masih muncul di pilihan (trigger DB hanya memeriksa keanggotaan). Bila penerbitan di organisasi yang sedang ditutup harus dilarang, perlu aturan DB.
5. ~~Dashboard dan detail listing belum menyaring konteks~~ SELESAI: Dashboard (angka + Listing Terbaru) mengikuti konteks (pemimpin = angka organisasi; anggota = listing organisasinya, angka tetap pribadi karena statistik organisasi hanya untuk pemimpin); Detail Listing menampilkan pemilik kuota dan mode Hanya lihat untuk pemimpin (tanpa aksi, leads, refresh).
6. Halaman Statistik penuh (/agent/statistik, Fase 4) belum ada; RPC statistik organisasi sudah diperbaiki di 0162 agar tidak membuka listing pribadi anggota.

## 2026-09-26 — Fase 4a: Komersial Agent (Katalog, Pesanan & Kuota, Langganan Saya)

Tanpa migration dan tanpa perubahan API. Rute `/agent/komersial` (Katalog add-on), `/agent/komersial/pesanan`, `/agent/komersial/langganan`; kode: `lib/agent/commercial-{rules,data}.ts` (diuji), `components/agent/{CommercialTabs,CatalogView,CatalogGrid,PurchaseDialog,OrdersView,OrderActions,SubscriptionsView,PlanGrid}.tsx`. Contoh: `/komponen/agent?layar=katalog|pesanan|langganan&keadaan=...`. Alur beli/bayar BELUM diuji dengan login dan Midtrans sandbox (uji manual pemilik).
1. **Alamat kembali setelah bayar (perlu keputusan pemilik):** `createSnapTransaction` tidak mengirim `callbacks.finish`, jadi setelah membayar pengguna berhenti di halaman Midtrans kecuali "Finish Redirect URL" diisi di dashboard Midtrans. Usul: isi ke `https://staging.rumahagen.com/agent/komersial/pesanan` (dashboard, tanpa kode) atau tambahkan `callbacks.finish` di `lib/payments/midtrans.ts` (perubahan API kecil, tanya dulu). Sementara halaman Pesanan memberi catatan "muat ulang" dan tidak ada polling.
2. **Sisa per entitlement tidak dibuka API:** kartu Entitlement menampilkan kapasitas diberikan, status, dan masa berlaku; saldo yang sah hanya untuk Refresh add-on (`stock_remaining`) dan slot beli pribadi (`purchased.balance`). Slot milik organisasi tidak dijumlahkan di layar ini.
3. **Jumlah kuota Pro tidak ditampilkan** di kartu paket (wireframe menulis "75 jatah"): angkanya di `system_configs` `listing_quota.*` yang belum dibaca Agent. Kartu memakai teks umum "menambah kuota penerbitan di atas kuota Gratis".
4. **Katalog hanya add-on aktif berharga > 0; saat ini 0 add-on, 2 paket Pro berstatus draf tanpa harga**, jadi di staging keadaan kosong tampil sampai staf mengisi dari layar Admin (belum dibangun, Fase 5; API admin ada).
5. **Add-on non-slot selalu masuk kuota pribadi** (fungsi `grant_addon_capacity` hanya memberi organisasi untuk slot listing), jadi pilihan Organisasi hanya muncul untuk add-on berisi slot. Paket organisasi hanya leader; anggota biasa melihat alasan.
6. **Promosi organisasi:** kartu menampilkan promosi cakupan pribadi; dialog memuat ulang penawaran saat organisasi dipilih (aturan `applies_to` bisa berbeda).
7. Status pesanan `expired` dari wireframe tidak ditulis database (tanpa CHECK, hanya pending/confirmed/cancelled); nilai tak dikenal tampil apa adanya.

## Catatan performa

6. **Pencarian kata kunci listing lambat di skala besar (bukan mendesak).** `ILIKE '%kata%'` di bawah RLS tidak bisa memakai indeks trigram (ILIKE tidak leakproof): ±100 ms di 30.000 listing, tumbuh linear. Perbaikan bila perlu: fungsi `SECURITY DEFINER` `search_published_listing_ids(q, ...)` (hanya membaca listing published, boleh dipanggil anon) + indeks pg_trgm parsial; atau mesin pencari khusus. Diukur saat menulis migration 0154 (indeks harga/tipe/terbaru, tanpa trigram).
5. **Foto listing memakai URL apa adanya** (`listing_photos.url`); bila bucket storage bukan publik, gambar tidak tampil. Perlu dipastikan saat listing pertama terbit.
