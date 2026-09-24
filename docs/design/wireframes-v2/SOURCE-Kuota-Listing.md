# Dokumen Sumber — Kuota Penerbitan Listing (M03 x M14)

Dibuat 2026-09-24. Backend: migration `0140` (mesin kuota), `0141` (addon `listing_slot`, job kedaluwarsa), API `GET /agents/me/listing-quota` dan 409 `listing_quota_exhausted`.
Layar yang disentuh (desktop + mobile): Agent `M03-Create-Listing-Wizard`, `M03-Listing-Saya`, `M12-Organisasi-Dashboard`; Admin `M09-Konfigurasi-Sistem` (tab baru "Kuota Listing").

## Aturan produk (keputusan pemilik produk)
- Kuota dikonsumsi saat listing menjadi `published`. Penuh -> penerbitan ditolak, listing tetap draf.
- Dua pemilik kuota: **pribadi** dan **organisasi** (dibagi seluruh anggota aktif). Agen memilih pemilik di langkah 1 wizard; organisasi tidak bisa diganti selama jatah aktif.
- Sumber, dipakai berurutan: **Gratis** (25 pribadi / 50 organisasi per bulan kalender, reset tgl 1 pukul 00:00 WIB) -> **Pro** (75 / 100, di atas Gratis, reset per siklus bulanan langganan, juga Pro Tahunan; beli baru = reset) -> **Slot beli** (tidak reset, tidak kedaluwarsa sebelum dipakai). Tanpa carry over. Gratis tidak ikut reset Pro.
- Satu jatah: tayang 90 hari + 7 hari masa tenggang (tetap tampil), lalu kembali ke draf; terbit ulang memakai jatah baru. Jatah hilang bila listing dicabut, kecuali diterbitkan ulang selama jatahnya masih berlaku (mis. turun ke draf untuk edit).
- Semua angka (`listing_quota.*`) dapat diubah Superadmin di Konfigurasi Sistem.

## Perubahan layar
| Layar | Perubahan |
|---|---|
| Wizard, langkah 1 | Pilihan Personal / Organisasi menampilkan sisa kuota masing-masing; pilih organisasi (hanya anggota aktif; keadaan "belum bergabung" + tautan Buat Organisasi); banner kuota hampir habis / penuh / gagal dimuat |
| Wizard, langkah 9 | Blok "Kuota & Masa Tayang" (jatah yang dipakai, 90+7 hari, urutan pemakaian); keadaan kuota penuh: banner + Beli Slot Listing + Lihat Paket Pro, tombol Terbitkan nonaktif, "Simpan sebagai Draf"; halaman sukses menampilkan sisa kuota dan tanggal tayang |
| Listing Saya | Kartu "Kuota Penerbitan" (Gratis / Pro / Slot beli, bilah pemakaian, tanggal reset, memuat / gagal / penuh / hampir habis); catatan per listing (tayang sampai, masa tenggang, draf tak bisa terbit); konteks pribadi/organisasi dari pemilih konteks |
| Organisasi Dashboard | Kartu kuota organisasi yang sama, terlihat semua anggota |
| Admin Konfigurasi Sistem | Tab "Kuota Listing": 6 angka + kode produk Pro, validasi (bilangan bulat 0-999999, masa tayang >= 1, format kode), simpan (tersimpan / gagal / menyimpan); keterangan aturan tetap; teks tab System diperbarui (7 kunci seed 0140) |

## Prop skenario baru
`konteks`, `kuota` (tersedia / hampir_habis / penuh / gagal_muat / memuat), `organisasi` (ada / belum_bergabung), `paket` (gratis / pro), `slotBeli` (tidak / ada), Konfigurasi: `tabAwal`, `simpan`.

## Catatan
- Angka pada layar adalah contoh (mis. 18 dari 25 tersisa); nilai sebenarnya dari `GET /agents/me/listing-quota`.
- **Addon slot listing (diselesaikan setelahnya):** Admin `M14-Form-Addon` menawarkan jenis kapasitas Slot Listing (bilangan bulat, masa berlaku add-on tidak dipakai untuk slot, catatan aturan slot) dan `M14-Katalog-Addon` memuat contoh `SLOT_10`; Agent `M14-Katalog-Komersial` memasarkan paket slot (lencana Kuota Listing, banner penjelasan, pilihan pemilik slot Pribadi / Organisasi saat membeli, keadaan belum bergabung organisasi).
