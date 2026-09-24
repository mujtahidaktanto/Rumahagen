# Dokumen Sumber — Agent "Langganan Saya" (Fase C-lanjutan)

Dibuat 2026-09-24 dari pemindaian repo `Rumahagen` + database live Supabase (`jawywzavznjekxxlhwqo`, migration #0001–#0130).
**[DIUJI]** = dibuktikan pada DB live lewat transaksi rollback. **[KODE]** = terbaca dari kode/migration.

## 1. Sumber yang dipindai
Migration `0071` (subscriptions, addons, promotions), `0072`–`0079`, `0081` (order, pembayaran, fulfillment), route `commercial/*`,
`agents/me/entitlements`, `agents/me/quota`, skema `lib/validation/commercial-*.ts`, policy live, wireframe Agent `M14-Katalog-Komersial` dan `M14-Pesanan-Kuota`.

## 2. Yang ada dan yang tidak
- **Ada:** tabel `subscriptions`, izin, dan RLS baca. **Tidak ada:** route `/subscriptions` atau `/agents/me/subscriptions`, katalog paket langganan, pembelian, fulfillment,
  perpanjangan, pembatalan. `fulfill_commercial_order` menolak order bukan-addon ("fulfillment subscription belum dibangun"). `GET /commercial/catalog` hanya `addons`.
- Free/Pro Bulanan/Pro Tahunan (3 dari 8 permukaan komersial MVP, STEP11-B7 §5) hanya berupa `product_code` bebas; tidak ada tabel paket atau harga.
- Tabel kosong saat ini (subscriptions, addons, promotions, orders, entitlements = 0 baris).

## 3. Model data dan akses
`subscriptions`: `user_id?`, `organization_id?`, `product_code*`, `status*` (TEXT bebas, **tanpa CHECK**), `starts_at`, `ends_at`, `renews_at`, `historical_purchase_snapshot` (jsonb, bentuk tidak ditentukan).
Baca: `m14.commercial_purchase_access.own_purchase` (Agent/Buyer/Developer Partner/Admin/Manager = own; Superadmin = all) berdasarkan `user_id`, atau staf `configure`.
Tulis: hanya staf `m14.commercial_administration.configure` (Superadmin/Admin). **[DIUJI]** pemilik melihat 1 baris miliknya, agent lain 0 baris; UPDATE oleh pemilik 0 baris; INSERT oleh pemilik ditolak (42501).
Catatan: langganan milik organisasi (`organization_id` tanpa `user_id`) tidak terbaca oleh anggota lewat policy ini (baca berdasarkan `user_id`); yang tampil di layar hanya baris dengan `user_id` = pengguna.

## 4. Temuan
1. **[DIUJI] Harga pesanan ditentukan klien.** `POST /commercial/orders` mengambil `amount` dari body dan DB menerima INSERT `commercial_orders` dengan `amount=1` untuk addon yang harganya 500.000 (tanpa tabel harga otoritatif; webhook hanya mencocokkan gross_amount dengan `amount` order itu sendiri). Wireframe Katalog menulis "Harga ditentukan platform, bukan diisi manual", yang **tidak ditegakkan backend**. Ini celah pembayaran, di luar layar Langganan tetapi ditemukan di sini.
2. **[DIUJI]** `commercial_orders.subscription_id` menerima id langganan sembarang (mis. milik orang lain) pada INSERT; tidak ada tautan bermakna karena pembelian langganan belum dibangun.
3. **[KODE] Tidak ada API baca langganan**; layar butuh `GET /agents/me/subscriptions` (paginasi, `user_id = pengguna`).
4. **[KODE]** `renews_at` hanya kolom; tidak ada perpanjangan otomatis, sehingga layar menyebutnya "jadwal perpanjangan", bukan janji tagihan.
5. **[KODE]** `status` bebas: layar memetakan `active`, `pending`, `expired`, `cancelled`, ditambah "segera berakhir" (aktif dan berakhir dalam 7 hari), dan menampilkan status tak dikenal apa adanya dengan peringatan.

## 5. Keputusan desain
- Tidak ada baris aktif = paket **Free** (tanpa baris `free` khusus).
- Layar **hanya membaca**: tidak ada tombol beli, perpanjang, atau berhenti; diberi penjelasan dan tautan ke Katalog dan Pesanan & Kuota. Ketika pembelian langganan dibangun, layar ini yang menjadi pusatnya.
- Isi `historical_purchase_snapshot` ditampilkan sebagai daftar kunci-nilai; contoh isi di wireframe hanyalah ilustrasi karena bentuknya belum ditentukan.
- Layar berada di bawah destinasi **Komersial**, dijangkau dari header Katalog dan Pesanan & Kuota (tombol "Langganan Saya" ditambahkan ke kedua layar itu).

## 6. Cakupan layar (Agent, desktop + mobile)
| Kode | Layar | Isi |
|---|---|---|
| M14 | Langganan Saya | paket saat ini, semua langganan (pribadi/organisasi), masa berlaku, jadwal perpanjangan, ringkasan pembelian, keadaan kosong (Free), gagal muat, status tak dikenal |
