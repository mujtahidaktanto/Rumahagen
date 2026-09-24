# Dokumen Sumber — Pembelian Langganan Pro (M14)

Dibuat 2026-09-24. Backend: migration `0142` (diterapkan) + API `GET /commercial/plans`, `POST /commercial/orders { subscription_plan_id, organization_id? }`, admin `/admin/commercial/plans`.
Layar: Agent `M14-Langganan-Saya` (diperbarui), Admin `M14-Katalog-Paket` (baru, desktop + mobile; item menu "Paket Langganan" ditambahkan ke navigasi semua layar Admin, setelah Promosi; tombol pintasan di Katalog Add-on tetap ada).

## Aturan (keputusan pemilik produk + default yang dipilih)
- Perpanjangan = pembelian baru; tidak ada mekanisme perpanjangan. Beli lagi menumpuk masa aktif setelah masa aktif sejenis dan **mereset kuota Pro** (awal siklus = pembelian baru); kuota Gratis tidak terpengaruh. Pro Tahunan tetap reset bulanan.
- Harga per cakupan diisi staf (`price_personal`, `price_organization`); kosong = tidak dijual untuk cakupan itu. Harga dihitung server; promosi belum berlaku untuk paket.
- Langganan organisasi: hanya leader aktif dari organisasi berstatus aktif; langganan menjadi milik organisasi (berlaku untuk seluruh anggota). Pembayaran lewat Midtrans, langganan aktif setelah pembayaran terverifikasi.
- Kode paket harus ada di `listing_quota.pro_product_codes` (Konfigurasi Sistem) agar memberi kuota Pro; kode dan durasi terkunci setelah terjual.

## Layar
| Layar | Isi |
|---|---|
| Langganan Saya (Agent) | Bagian "Paket Pro": kartu paket (harga pribadi/organisasi, jatah Pro, beli); dialog beli: pilih pemilik Pribadi / Organisasi (Organisasi nonaktif untuk member atau tanpa organisasi, dengan alasan), harga, masa aktif, peringatan penumpukan bila masih Pro aktif, catatan reset kuota Pro, galat (paket tak bisa dibeli, bukan leader), pesanan dibuat + lanjut bayar. Keadaan paket: memuat, gagal, kosong, tanpa harga organisasi. Teks "pembelian belum tersedia" diganti |
| Katalog Paket (Admin) | Daftar paket (durasi, harga pribadi/organisasi atau "Tidak dijual", terjual + kunci syarat, status), peringatan bila kode tak ada di daftar produk Pro, Aktifkan (nonaktif tanpa harga) / Nonaktifkan, dialog Buat/Ubah (kode hanya saat buat, durasi terkunci setelah terjual, validasi), Manager hanya melihat |

Prop skenario baru: Langganan Saya `paket`, `peran`, `beli`; Katalog Paket `state`, `aksi`, `dialogAwal`, `aktor`.

## Belum
Promosi untuk paket; layar status pembayaran khusus langganan (memakai Pesanan & Kuota Saya).
