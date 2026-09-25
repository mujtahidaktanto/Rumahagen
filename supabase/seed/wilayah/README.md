# Seed wilayah (Kepmendagri 2025 + kode pos)

Sumber: `wilayah_kepmendagri_2025_dengan_kodepos.xlsx` (sheet "Wilayah + Kode Pos", 83.762 baris), diberikan pemilik produk 2026-09-25.

| Berkas | Isi | Baris |
|---|---|---|
| `provinces.csv` | `code,name` | 38 |
| `cities.csv` | `province_code,code,name,type` | 514 (98 kota, 416 kabupaten) |
| `districts.csv` | `city_code,code,name` | 7.285 |
| `villages.csv` | `district_code,code,name,postal_code` | 83.762 (65.779 berkode pos) |
| `load.sql` | skrip psql (upsert per `code`, idempoten) | |

## Aturan transformasi

- **Kode tanpa titik**: `11.01.01.2001` menjadi `1101012001` (provinsi 2, kab/kota 4, kecamatan 6, desa 10 digit; kolom `code` varchar(10)). Sama dengan format seed lama (`31`, `3171`, `317101`).
- **Kode kab/kota dan kecamatan diturunkan dari KODE DESA**, bukan dari kolom sumbernya: kolom "KODE KABUPATEN" rusak di xlsx karena Excel menganggapnya angka (`11.10` menjadi `11.1`, `12.109999…`). Awalan kode desa konsisten untuk semua baris.
- **Nama kab/kota memakai nama resmi lengkap** (`Kota Bandung` dan `Kabupaten Bandung` adalah dua wilayah berbeda). Awalan `Kab ` (2 baris: Timor Tengah Selatan, Pegunungan Bintang) dinormalkan menjadi `Kabupaten `. `type` = `kota` bila nama berawalan Kota, selain itu `kabupaten`.
- Spasi ganda dan spasi tepi pada nama dibersihkan (1.147 baris).
- **Kolom "METODE PENCOCOKAN" tidak dipakai.** Kode pos yang ada diimpor apa adanya; kode pos **opsional** (kosong = NULL, tidak wajib terisi).
- Ketergantungan alamat ditegakkan database (migration 0152): kota/kabupaten harus milik provinsi yang dipilih, kecamatan harus milik kota/kabupaten yang dipilih.

## Memuat ke database

```bash
cd supabase/seed/wilayah
psql "$DATABASE_URL" -f load.sql
```

Upsert per `code` menjaga `id` baris yang sudah ada (mis. seed lama DKI Jakarta yang sudah dipakai listing), hanya namanya yang diperbarui.
