# Dokumen Sumber — Pembelian Langganan Pro (M14)

Dibuat 2026-09-24. Backend: migration `0142` (diterapkan) + API `GET /commercial/plans`, `POST /commercial/orders { subscription_plan_id, organization_id? }`, admin `/admin/commercial/plans`.
Layar: Agent `M14-Langganan-Saya` (diperbarui), Admin `M14-Katalog-Paket` (baru, desktop + mobile; item menu "Paket Langganan" ditambahkan ke navigasi semua layar Admin, setelah Promosi; tombol pintasan di Katalog Add-on tetap ada).

## Aturan (keputusan pemilik produk + default yang dipilih)
- Perpanjangan = pembelian baru; tidak ada mekanisme perpanjangan. Beli lagi menumpuk masa aktif setelah masa aktif sejenis dan **mereset kuota Pro** (awal siklus = pembelian baru); kuota Gratis tidak terpengaruh. Pro Tahunan tetap reset bulanan.
- Harga per cakupan diisi staf (`price_personal`, `price_organization`); kosong = tidak dijual untuk cakupan itu. Harga dihitung server; promosi belum berlaku untuk paket.
- Langganan organisasi: hanya leader aktif dari organisasi berstatus aktif; langganan menjadi milik organisasi (berlaku untuk seluruh anggota). Pembayaran lewat Midtrans, langganan aktif setelah pembayaran terverifikasi.
- **Promosi paket (migration 0143):** satu promosi dihubungkan per paket (berlaku untuk pribadi dan organisasi); potongan dihitung dari harga cakupan yang dipesan; promosi hanya terpakai bila pembeli memilihnya dan lolos kelayakan (peran, pembelian pertama, batas pemakaian); harga akhir dihitung server.
- Kode paket harus ada di `listing_quota.pro_product_codes` (Konfigurasi Sistem) agar memberi kuota Pro; kode dan durasi terkunci setelah terjual.

## Layar
| Layar | Isi |
|---|---|
| Langganan Saya (Agent) | Bagian "Paket Pro": kartu paket (harga pribadi/organisasi, jatah Pro, beli); dialog beli: pilih pemilik Pribadi / Organisasi (Organisasi nonaktif untuk member atau tanpa organisasi, dengan alasan), harga, masa aktif, peringatan penumpukan bila masih Pro aktif, catatan reset kuota Pro, galat (paket tak bisa dibeli, bukan leader), pesanan dibuat + lanjut bayar. Keadaan paket: memuat, gagal, kosong, tanpa harga organisasi. Promosi: lencana Promo, harga coret + harga akhir, rincian di dialog beli (harga normal, promosi, total), alasan bila tidak berlaku (harga normal tetap dipakai). Teks "pembelian belum tersedia" diganti |
| Katalog Paket (Admin) | Daftar paket (durasi, harga pribadi/organisasi atau "Tidak dijual", terjual + kunci syarat, status), peringatan bila kode tak ada di daftar produk Pro, Aktifkan (nonaktif tanpa harga) / Nonaktifkan, dialog Buat/Ubah (kode hanya saat buat, durasi terkunci setelah terjual, validasi, pilihan promosi terhubung dengan keadaan kedaluwarsa/terjadwal dan pratinjau harga akhir), Manager hanya melihat |

Prop skenario baru: Langganan Saya `paket`, `peran`, `beli`, `promo`; Katalog Paket `state`, `aksi`, `dialogAwal`, `daftarPromosi`, `aktor`.

## Belum
 layar status pembayaran khusus langganan (memakai Pesanan & Kuota Saya).
