# RumahAgen — Metric Definitions v1

**Status:** v1.1 DISETUJUI (seluruh usulan default diterima pengguna, 2026-09-25; take rate dikeluarkan)
**Berlaku untuk:** Dashboard Analytics (Admin/Superadmin; sisi Agent menyusul), export Excel/PDF, materi investor.
**Aturan perubahan:** definisi tidak diubah diam-diam. Setiap perubahan dicatat di bagian "Riwayat versi" dengan tanggal berlaku, dan disetujui Superadmin. Riwayat lama tidak direstate.

## 1. Waktu

| Item | Definisi |
|---|---|
| Zona waktu | WIB (Asia/Jakarta). Hari berganti pukul 00:00 WIB. |
| Preset rentang | 7 hari, 14 hari, 30 hari bergulir ("1 bulan terakhir"), bulan kalender, rentang kustom (dari–sampai). |
| Awal minggu | Senin |
| Rentang kustom | Inklusif di kedua ujung |
| Periode pembanding | Rentang sama panjang, tepat sebelum periode terpilih |
| Tanggal transaksi | `paid_at` (bukan `created_at`) |

## 2. Pengguna dan agen

- **Agen terdaftar:** akun berperan Agent, `deleted_at` kosong. Status `pending_review` tetap dihitung (sistem tidak membatasi fitur mereka).
- **Agen aktif:** minimal satu aktivitas bermakna dalam 30 hari terakhir: login, membuat/mengubah/refresh listing, atau menerima lead. Login saja tidak cukup.
- **Agen baru:** dihitung dari tanggal daftar, bukan tanggal verifikasi.
- **Agen dormant/churn:** tidak ada aktivitas bermakna lebih dari 90 hari.
- **Suspended:** dua angka. Stok = jumlah yang sedang suspended pada akhir hari. Arus = kejadian suspend baru per hari.
- **Total per role:** Agent, Instructor, Buyer, Developer Partner, dan staf dilaporkan terpisah.

## 3. Listing

- **Listing baru:** dihitung saat pertama kali dipublikasikan, bukan saat draft dibuat.
- **Listing aktif:** status `active` dan belum kedaluwarsa menurut aturan freshness.
- **Refresh:** satu baris konsumsi jenis refresh di ledger `quota_usage`. Dilaporkan terpisah: dari kuota gratis vs dari add-on berbayar.

## 4. Views dan leads

- **Lead:** satu klik CTA WhatsApp (`listing_leads`). Ini klik, bukan pertanyaan yang pasti nyata.
- **Lead total dan lead unik:** keduanya ditampilkan. Lead unik didedup per pengunjung (IP + user agent) per listing per hari.
- **Filter:** klik dari pemilik listing sendiri dan bot dikeluarkan dari kedua angka.

## 5. Proyek developer dan klaim

- **Proyek baru:** dihitung saat dipublikasikan staf (`active`), bukan saat dibuat developer partner.
- **Klaim proyek:** hanya klaim berstatus disetujui. Klaim ditarik (`withdrawn`) atau ditolak dikeluarkan.

## 6. Organisasi

- **Baru:** tanggal dibuat.
- **Aktif:** status `active`, tidak dalam proses penutupan dan tidak suspended.
- **Ditutup:** dihitung saat penutupan final (setelah konfirmasi OTP), bukan saat masa tunggu dimulai.
- **Pertumbuhan bersih:** organisasi baru dikurangi organisasi ditutup.

## 7. Learning

- **Pendaftar:** dua angka, pengguna unik dan jumlah pendaftaran.
- **Menyelesaikan:** hanya hasil completion yang memenuhi syarat (qualifying), bukan sekadar hadir.
- **Completion rate:** per kohort pendaftaran (dari yang mendaftar di bulan X, berapa persen selesai). Bukan rasio antar angka bulan yang sama.

## 8. Komersial

- **Transaksi sukses:** `payment_state` `settlement` atau `capture`, dan `verification_state = verified`. `pending`, `expire`, `deny`, `cancel` tidak dihitung.
- **Nilai transaksi:** gross dan net ditampilkan. Net = gross dikurangi refund dan chargeback. Biaya gateway dilaporkan terpisah.
- **Subscriber:** langganan berbayar aktif pada tanggal tertentu. Free membership tidak dihitung. Dilaporkan per pengguna dan per organisasi.
- **Pembeli add-on:** pengguna unik dengan minimal satu order add-on sukses pada periode.
- **MRR:** langganan tahunan dibagi 12. **ARR** = MRR × 12.
- **ARPU:** dua angka, dibagi pengguna berbayar dan dibagi semua agen aktif, dengan label jelas.
- **Churn langganan:** berakhir tanpa perpanjangan setelah masa tenggang 7 hari.

## 9. Retensi dan funnel

- **Kohort retensi:** dikelompokkan per bulan daftar. "Bertahan" berarti agen aktif menurut butir 2.
- **Funnel:** daftar → verifikasi → listing pertama dipublikasikan → lead pertama → pembayaran pertama. Jendela waktu: 30 hari sejak tanggal daftar.

## 10. Pengecualian data

Selalu dikeluarkan dari semua metrik pengguna: staf internal, akun uji/demo, dan akun dengan `deleted_at` terisi.

## 11. Kesegaran dan tata kelola

- Setiap layar dan export menampilkan "data per tanggal/jam".
- Pembulatan: persen 1 desimal, rupiah tanpa desimal.
- Pemilik definisi: Superadmin menyetujui perubahan.
- Setiap export dicatat di audit log.

## 12. Batasan riwayat

Tabel `metrics_daily_snapshot` (potret harian) tetap dibuat, atas keputusan pengguna. Alasannya bukan hanya suspended dan organisasi ditutup: sistem hanya menyimpan `last_login_at` (login terakhir, bukan riwayat login), tidak menyimpan riwayat perubahan role, dan tidak menyimpan tanggal penutupan organisasi maupun tanggal refund. Karena itu agen aktif, DAU/WAU/MAU, dormant, churn agen, retensi kohort, organisasi aktif, dan total per role hanya punya riwayat akurat sejak snapshot mulai berjalan. Data sebelum itu tidak dapat direkonstruksi dan tidak boleh dijanjikan sebagai tren historis.

## 13. Metrik tambahan (v1.1, DISETUJUI pengguna 2026-09-25)

Ditambahkan atas permintaan pengguna. Seluruh butir di bawah disetujui, dengan satu pengecualian: take rate tidak dimasukkan (lihat bawah).

**Pendapatan**
- **GMV:** total nilai transaksi sukses (butir 8) sebelum refund dan chargeback.
- **Take rate: TIDAK DIPAKAI.** Karena seluruh transaksi adalah pendapatan RumahAgen sendiri (langganan dan add-on), angkanya hanya mencerminkan refund dan chargeback, bukan komisi, dan berisiko disalahbaca investor. GMV nilai jual-beli properti di luar platform tidak tercatat.
- **Pendapatan langganan vs add-on:** pendapatan net dipisah menurut jenis produk. Ditampilkan juga porsi add-on.
- **Refund rate:** (refund + chargeback) ÷ gross.

**Retensi dan aktivitas**
- **DAU/WAU/MAU:** jumlah agen aktif (butir 2) pada hari itu, 7 hari, dan 30 hari terakhir.
- **Stickiness:** rata-rata DAU ÷ MAU pada periode.
- **Churn agen:** persentase agen aktif di awal bulan yang menjadi dormant (tidak aktif lebih dari 90 hari) pada akhir bulan.

**Kesehatan marketplace**
- **Rasio listing aktif vs kedaluwarsa:** komposisi listing dipublikasikan pada tanggal itu.
- **Lead per listing aktif:** lead unik pada periode ÷ rata-rata listing aktif.
- **Waktu ke lead pertama:** median selisih waktu dari listing pertama dipublikasikan ke lead pertama per agen.
- **Konversi pengunjung ke lead:** lead unik ÷ kunjungan listing (`listing_views`) pada periode.

**Kualitas dan risiko**
- **Rasio agen suspended:** agen suspended saat ini ÷ agen terdaftar. Hanya angka terkini, tanpa tren.
- **Listing ditolak moderasi:** jumlah keputusan penolakan pada periode.
- **Banding penghargaan:** banding masuk pada periode, dan jumlah yang menunggu keputusan saat ini.
- **Kasus rekonsiliasi terbuka:** kasus pembayaran belum selesai saat ini.

**Learning**
- **Poin diterbitkan:** total learning points yang dikeluarkan pada periode.
- **Sertifikat diterbitkan:** jumlah sertifikat yang terbit pada periode.

## Cakupan Dashboard v1

Atas keputusan pengguna, dashboard Admin v1 tidak menampilkan tren agen suspended per hari maupun organisasi ditutup per hari (dan karena itu tidak menampilkan pertumbuhan bersih organisasi). Agen suspended hanya ditampilkan sebagai angka stok saat ini. Definisi "Suspended" (butir 2) dan "Ditutup"/"Pertumbuhan bersih" (butir 6) tetap berlaku jika metrik itu ditambahkan kelak.

## Riwayat versi

| Versi | Tanggal | Perubahan | Disetujui |
|---|---|---|---|
| v1 | 2026-09-25 | Versi awal, seluruh default diterima | Pengguna |
| v1.1 | 2026-09-25 | Butir 13 (metrik tambahan) ditambahkan, take rate dikeluarkan; butir 12 diperjelas (snapshot tetap dibuat) | Pengguna |
