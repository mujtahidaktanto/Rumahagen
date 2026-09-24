# Dokumen Sumber — Admin Katalog Add-on (harga addon)

Dibuat 2026-09-24 dari pemindaian repo dan DB live (migration #0001–#0131). Melengkapi migration `0131` (harga pesanan dihitung server dari `addons.price`):
tanpa layar/route ini staf tidak punya cara mengisi harga.

## 1. Yang ada dan yang tidak
- Ada: tabel `addons` (`code`, `name`, `price`, `currency`, `validity_type`, `validity_days`, `capacity_type`, `capacity_value`, `additional_capacities`, `promotion_id`, `status`, `configuration`), RLS `addons_manage` (izin `m14.commercial_administration.configure`: Superadmin/Admin) dan `addons_select` (aktif publik).
- Tidak ada (sebelum perubahan ini): route admin untuk addon, daftar promosi. Hanya `GET /commercial/catalog|offers|products` publik.
- Izin: Manager tidak punya `configure`, jadi Manager hanya melihat (layar memberi banner baca-saja).

## 2. Temuan
1. **[KODE] `fulfill_commercial_order` membaca addon SAAT INI, bukan snapshot pesanan.** Mengubah kapasitas/masa berlaku addon setelah ada pesanan membuat pembeli lama menerima syarat baru; menghapus addon membuat `commercial_orders.addon_id` NULL (FK SET NULL) dan fulfillment gagal. Ditangani migration `0132`.
2. **[KODE] `status`, `validity_type`, `capacity_type` teks bebas tanpa CHECK**; addon aktif tanpa kapasitas membuat entitlement kosong; `additional_capacities` tak divalidasi. Ditangani migration `0132`.
3. **[KODE] Jenis kapasitas yang benar-benar dikonsumsi sistem hanya `listing_refresh` dan `learning_point`.** Tidak ada penegakan "slot listing" di mana pun (dicek seluruh kode dan migration), padahal wireframe Katalog Agent menampilkan add-on "+25 slot listing aktif". Add-on jenis itu belum bisa dijual sampai konsumennya dibangun; form hanya menawarkan dua jenis di atas.
4. **[DITANGANI 2026-09-24, migration 0133 diterapkan] Definisi promosi bebas** (`benefit_configuration` jsonb). Konvensi 0131: `{"percent_off": 1..100}` atau `{"amount_off": > 0}`. API admin pembuatan/pengubahan promosi ditambahkan (`/admin/commercial/promotions`, `[id]`, `[id]/status`); layar admin promosi belum ada (pilihan promosi di Form Add-on masih contoh).
5. **[KODE] `commercial_orders.organization_id` belum diverifikasi keanggotaannya** (di luar cakupan ini).

## 3. Yang ditambahkan
- Migration `0132` (diterapkan): CHECK status/masa berlaku/jenis kapasitas/kapasitas aktif/kapasitas tambahan, kunci `code`, `validity_*`, `capacity_*`, `additional_capacities` setelah addon punya pesanan, dan larangan hapus addon yang punya pesanan.
- Route: `GET/POST /admin/commercial/addons`, `GET/PUT /admin/commercial/addons/{id}` (GET menyertakan `order_count` dan `terms_locked`), `PATCH /admin/commercial/addons/{id}/status`, `GET /admin/commercial/promotions` (baca saja). Skema: `lib/validation/commercial-addons.ts`. Tidak ada DELETE (nonaktifkan).
- Layar Admin (desktop + mobile): **M14 Katalog Add-on** (daftar, filter status, cari, aktifkan/nonaktifkan, alasan bila tak bisa diaktifkan: belum ada harga/kapasitas) dan **M14 Form Add-on** (identitas, harga, promosi, masa berlaku, kapasitas utama dan tambahan, ringkasan untuk pembeli, mode terkunci bila sudah ada pesanan). Nav Admin +1 item "Katalog Add-on" (ditambahkan ke semua layar Admin).

## 4. Keputusan
- Add-on baru selalu berstatus Draf; aktif hanya bila harga > 0 dan kapasitas utama terisi.
- Harga hanya berlaku untuk pesanan baru; kode, masa berlaku, dan kapasitas terkunci setelah ada pesanan (buat add-on baru untuk syarat berbeda).
- Mata uang dikunci IDR pada form (kolom mendukung 3 huruf, tetapi pembayaran memakai Midtrans IDR).

## 5. Layar Admin Promosi (ditambahkan 2026-09-24)
Melengkapi API `/admin/commercial/promotions` (+ migration 0133). Dua layar Admin (desktop + mobile): **M14 Promosi** (daftar; filter status efektif Draf/Aktif/Terjadwal/Kedaluwarsa/Nonaktif, cari nama/kode, aktifkan/nonaktifkan dengan konfirmasi, jumlah add-on pemakai, alasan bila tak bisa diaktifkan karena masa berlaku lewat) dan **M14 Form Promosi** (kode, nama, jenis potongan persentase atau nominal dengan validasi, contoh harga langsung pada Rp 75.000 dan Rp 200.000, masa berlaku opsional, mode "dipakai add-on", kartu Aturan kelayakan belum tersedia). Nav Admin +1 item "Promosi" (ditambahkan ke semua layar Admin).
- Status efektif mengikuti `derivePromotionState`: berstatus `active` tetapi lewat `valid_to` tampil Kedaluwarsa, sebelum `valid_from` tampil Terjadwal.
- Manager hanya melihat (izin `configure` hanya Admin/Superadmin).
- Promosi baru berstatus Draf dan tidak memberi potongan sampai diaktifkan dari daftar.
- **Pilihan promosi pada Form Add-on sekarang mengikuti daftar promosi asli** (sumber `GET /admin/commercial/promotions?status=active`, data contoh sama dengan layar Promosi): kartu pilihan dengan nama, kode, potongan, masa berlaku, dan status efektif (Aktif/Terjadwal/Kedaluwarsa). Promosi kedaluwarsa tidak bisa dipilih baru, tetapi tetap tampil bila sedang terhubung ke add-on itu dengan peringatan bahwa add-on dijual harga normal. Ada keadaan memuat, kosong (tautan Buat promosi baru), dan gagal muat (add-on tetap bisa disimpan tanpa mengubah promosi); ringkasan harga akhir mengikuti promosi terpilih, dan promosi terjadwal menyebut tanggal mulai. Tautan ke daftar dan form Promosi tersedia. Catatan backend: pesanan dengan `promotion_id` promosi yang tidak berlaku ditolak server (`compute_addon_order_price`), jadi aplikasi pembeli hanya boleh mengirim promosi add-on saat masih berlaku.
