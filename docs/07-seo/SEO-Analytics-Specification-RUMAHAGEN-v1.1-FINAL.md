# SEO & Analytics Specification — Platform Web RUMAHAGEN

**Dokumen pendamping:** PRD Modul 11, ERD & Skema Database, API Specification
**Versi:** 1.1 (Revisi resolusi konflik lintas dokumen)
**Tanggal:** 26 Juli 2026

> **Catatan Revisi v1.1:** Framework frontend ditetapkan **Next.js (App Router)** sebagai keputusan default arsitektur (lihat `PROJECT-CONSTITUTION.md` Bagian 4) — memenuhi syarat SSR/SSG wajib di Bagian 1.1. Fitur review/rating agen (Bagian 3) dikonfirmasi **aktif Fase 1**, sehingga `aggregateRating` relevan sejak awal.

Tujuan dokumen: memastikan platform bisa **terindeks Google secepat dan seakurat mungkin** sejak hari pertama rilis — bukan ditambal belakangan — karena sebagian keputusan (rendering, struktur URL) sangat mahal diubah setelah traffic organik mulai terbentuk.

---

## 1. Fondasi Technical SEO

### 1.1 Strategi Rendering
| Tipe Halaman | Rendering | Alasan |
|---|---|---|
| Homepage, Search & Filter, Detail Listing, Profil Publik Agen, Detail Proyek Developer | **SSR (Server-Side Rendering) atau SSG/ISR** (mis. Next.js) | Googlebot & crawler lain harus menerima HTML berisi konten penuh saat request pertama — bukan halaman kosong yang baru terisi via JavaScript (CSR murni terbukti lambat/tidak konsisten diindeks) |
| Dashboard Agen, Admin Panel, Kalkulator DBR (hasil personal), Chat | **CSR (Client-Side Rendering) biasa** | Halaman privat, tidak butuh SEO — justru harus **dicegah** dari indeks (lihat 1.3) |
| Halaman statis (Tentang, Kebijakan Privasi, FAQ) | SSG | Konten jarang berubah, cocok di-build statis untuk performa maksimal |

> **Keputusan arsitektur ini diambil di awal development** (bukan modul terpisah yang bisa ditambah nanti) karena memilih ulang framework/rendering setelah aplikasi besar sangat mahal. **(v1.1)** Framework ditetapkan: **Next.js (App Router)**, menggunakan App Router Server Components untuk SSR dan ISR untuk halaman yang jarang berubah. Dicatat sebagai prioritas Fase 1 di PRD Modul 11.

### 1.2 Struktur URL & Slug
Menggunakan **slug deskriptif berbasis konten**, bukan hanya ID:
```
/properti/rumah-minimalis-2-lantai-bsd-city-{short_id}
/agen/{nama-agen-slug}
/developer/{nama-proyek-slug}
/cari?kategori=secondary&kota=tangerang-selatan&tipe=rumah
```
- Slug **di-generate otomatis dari judul** saat listing dibuat (lowercase, spasi → tanda hubung, hapus karakter khusus), dengan `{short_id}` di akhir untuk menjamin keunikan tanpa harus menolak slug duplikat secara kasar.
- Slug **tidak berubah otomatis** meski judul listing diedit (untuk menjaga backlink & histori ranking) — perubahan slug hanya terjadi jika agen mengubahnya secara eksplisit, dan **wajib memicu 301 redirect** dari slug lama (lihat 1.5).
- Filter pencarian memakai **query string yang human-readable** (`?kota=tangerang-selatan`, bukan `?city_id=city_3674`) di URL publik agar tetap SEO-friendly, meski secara internal tetap dipetakan ke `city_id` di layer API (lihat catatan API Bagian 12).

### 1.3 Kontrol Crawling — `robots.txt` & Meta Robots
```
User-agent: *
Disallow: /dashboard/
Disallow: /admin/
Disallow: /agents/me/
Disallow: /chats/
Disallow: /calculator/dbr/results/
Disallow: /auth/
Allow: /

Sitemap: https://<domain>.id/sitemap-index.xml
```
- Halaman privat (dashboard, hasil kalkulator DBR yang berisi data calon pembeli, chat) **wajib** diberi `<meta name="robots" content="noindex, nofollow">` di level halaman **selain** `robots.txt`, karena `robots.txt` hanya mencegah crawling — bukan mencegah indeks bila halaman tsb terlanjur ditautkan dari luar.
- Halaman listing berstatus `sold`/`rented`/`expired`: **tetap live**, diberi label visual "Sudah terjual/tersewa", **tidak** langsung dihapus/404 (agar tidak kehilangan nilai SEO yang sudah terbangun) — kebijakan detail di 1.4.

### 1.4 Kebijakan Listing Tidak Aktif (Sold/Expired) demi SEO
| Status | Perlakuan SEO |
|---|---|
| `sold` / `rented` | Halaman tetap dapat diakses, `<meta name="robots" content="index, follow">` tetap aktif, badge "Terjual/Tersewa" ditampilkan, plus rekomendasi "Listing serupa yang masih tersedia" agar pengunjung tidak *bounce*. |
| `expired` (agen tidak perpanjang) | Setelah 30 hari sejak expired tanpa diperpanjang → ubah jadi `<meta name="robots" content="noindex, follow">` (halaman masih ada tapi dikeluarkan dari indeks Google) sambil tetap redirect internal link ke listing serupa. |
| Dihapus permanen oleh agen/admin | **301 redirect** ke halaman kategori/pencarian terdekat (bukan 404), dicatat di `url_redirects` (lihat ERD). |

### 1.5 XML Sitemap
- Sitemap dipecah per tipe agar mudah diaudit & tidak melebihi limit 50.000 URL/file:
  - `sitemap-index.xml` (induk)
  - `sitemap-listings.xml` (hanya listing berstatus `published`/`sold`/`rented`, exclude `draft`/`pending_review`)
  - `sitemap-agents.xml`
  - `sitemap-developer-projects.xml`
  - `sitemap-static.xml` (homepage, halaman statis)
- **Regenerasi otomatis** setiap ada listing baru `published` atau berubah status — bukan proses batch harian saja, supaya listing baru bisa cepat ditemukan crawler.
- Disubmit ke **Google Search Console** (manual sekali di awal) dan sistem memanggil **Google Indexing API** (lihat Bagian 4.3) untuk permintaan crawl-ulang cepat pada perubahan penting (listing baru/dihapus).

---

## 2. On-Page SEO

### 2.1 Meta Title & Meta Description
- Setiap listing, profil agen, dan proyek developer punya field `meta_title`/`meta_description` **opsional** di database (lihat ERD) — jika agen tidak mengisi, sistem **auto-generate dari template**:
  ```
  meta_title default   : "{title} — {property_type} {transaction_type} di {city} | {nama platform}"
  meta_description default : "{property_type} {transaction_type} di {district}, {city}. LT {land_area}m², LB {building_area}m², {bedrooms} KT. Hubungi {agent_name} sekarang."
  ```
- Batas karakter: `meta_title` ≤ 60 karakter tampil optimal di SERP (field DB dilonggarkan sampai 70), `meta_description` ≤ 155–160 karakter.

### 2.2 Open Graph & Twitter Card
Setiap halaman publik menyertakan:
```html
<meta property="og:type" content="product" />
<meta property="og:title" content="{meta_title}" />
<meta property="og:description" content="{meta_description}" />
<meta property="og:image" content="{cover_photo_url}" />
<meta property="og:url" content="{canonical_url}" />
<meta name="twitter:card" content="summary_large_image" />
```
Ini memastikan link listing yang dibagikan agen ke WhatsApp/Instagram/Facebook tampil dengan preview foto & harga (bukan link polos) — penting karena kanal distribusi utama agen properti Indonesia adalah share manual ke sosial media/WA.

### 2.3 Heading & Struktur Konten
- Setiap halaman publik punya **tepat satu `<h1>`** (judul listing / nama agen / nama proyek), dengan `<h2>`/`<h3>` untuk sub-bagian (Deskripsi, Spesifikasi, Lokasi, Agen Terkait).
- Breadcrumb ditampilkan di setiap halaman detail (`Beranda > Kota > Tipe Properti > Judul Listing`) — selain membantu navigasi, juga sumber data untuk `BreadcrumbList` structured data (Bagian 3).

### 2.4 SEO Gambar
- Setiap foto listing **wajib** memiliki `alt_text` (field baru di `listing_photos`, lihat ERD) — auto-terisi dari template (`"{title} - foto {n}"`) namun dapat ditimpa agen.
- Gambar disajikan lewat CDN (Cloudinary/ImageKit, sudah dirancang di API Bagian 9.2) dengan format modern (WebP/AVIF otomatis) & lazy-loading untuk gambar di luar viewport awal — berkontribusi langsung ke Core Web Vitals (Bagian 5).

---

## 3. Structured Data (Schema.org / JSON-LD)

| Halaman | Schema Type | Field Kunci |
|---|---|---|
| Detail Listing | `Product` atau `RealEstateListing` (gunakan `Product` + `offers` untuk kompatibilitas rich result yang lebih luas di Google saat ini) | `name`, `image`, `offers.price`, `offers.priceCurrency` (IDR), `address` (`PostalAddress`), `floorSize`, `numberOfRooms` |
| Semua halaman | `Organization` (site-wide, di layout utama) | `name`, `logo`, `url`, `sameAs` (link sosial media platform) |
| Halaman dengan breadcrumb | `BreadcrumbList` | Sesuai struktur navigasi di 2.3 |
| Profil Publik Agen | `Person` dengan properti tambahan (`jobTitle: "Real Estate Agent"`, `worksFor`) | `name`, `image`, `telephone`, `aggregateRating` (aktif Fase 1 — hanya disertakan jika minimal 1 review `approved` ada, lihat tabel `agent_reviews` ERD v1.1) |
| Homepage | `WebSite` + `SearchAction` (Sitelinks Search Box) | Mengaktifkan search box langsung di hasil pencarian Google untuk brand platform |

Contoh ringkas JSON-LD untuk Detail Listing:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Rumah Minimalis 2 Lantai di BSD",
  "image": ["https://cdn.../foto1.jpg"],
  "offers": {
    "@type": "Offer",
    "price": "1850000000",
    "priceCurrency": "IDR",
    "availability": "https://schema.org/InStock"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Serpong",
    "addressRegion": "Tangerang Selatan",
    "addressCountry": "ID"
  }
}
```
> Catatan: `availability` otomatis berubah menjadi `https://schema.org/SoldOut` saat status listing `sold`/`rented`, sinkron dengan kebijakan di 1.4.

---

## 4. Google Tag Manager, Analytics & Search Console

### 4.1 Google Tag Manager (GTM)
- Satu **GTM container** dipasang di seluruh halaman **publik** (bukan di dashboard privat, untuk menghindari pelacakan berlebihan pada data internal/PII agen-agen).
- GTM Container ID disimpan di `system_configs` (key `gtm_container_id`) agar bisa diubah tanpa deploy ulang kode — dikelola dari Admin Panel oleh **Superadmin** (menyentuh konfigurasi inti sistem, sesuai RBAC Modul 10).
- Seluruh tag pihak ketiga (GA4, Facebook Pixel jika ada nanti, dsb) dikelola **lewat GTM**, bukan hard-coded di halaman — memudahkan marketing menambah/mengubah tracking tanpa minta dev deploy ulang.

### 4.2 Google Analytics 4 (GA4) — Event Tracking Kunci
| Event GA4 | Trigger | Kegunaan |
|---|---|---|
| `view_item` | Buka halaman Detail Listing | Ukur listing mana yang paling dilihat |
| `search` | Submit filter pencarian | Pahami kombinasi filter populer (mis. rentang harga favorit per kota) |
| `generate_lead` | Klik CTA WhatsApp **atau** submit form inquiry | **Metrik konversi utama marketplace** — dari sinilah ROI SEO/marketing diukur |
| `sign_up` | Registrasi Buyer/Agen berhasil | |
| `login` | Login berhasil (termasuk via Google OAuth) | |
| `select_content` (custom: `claim_project`) | Agen klaim proyek developer | |
| `course_enroll` (custom) | Agen daftar kursus Learning Center | |

### 4.3 Google Search Console (GSC) & Indexing API
- Verifikasi kepemilikan domain via **meta tag** (disimpan di `system_configs`, key `gsc_verification_meta`) atau **DNS TXT record** (dikelola di luar aplikasi oleh tim infra).
- Submit `sitemap-index.xml` ke GSC sekali di awal; GSC otomatis mem-fetch ulang sitemap secara berkala.
- **Google Indexing API** dipanggil otomatis dari backend saat: listing baru `published`, listing dihapus permanen (URL_DELETED), atau slug berubah — agar Google tahu ada perubahan **tanpa menunggu crawl terjadwal**, mempercepat listing baru muncul di hasil pencarian (selaras dengan tujuan utama "naik cepat di search engine").

### 4.4 Consent & Privasi
- Tampilkan **cookie consent banner** sederhana di kunjungan pertama (menyimpan preferensi consent di local storage) — selaras dengan UU PDP dan praktik baik meski regulasi Indonesia belum seketat GDPR, sekaligus mengaktifkan **Google Consent Mode** agar data GA4 tetap terkumpul secara agregat meski pengguna menolak cookie non-esensial.
- Data yang dikirim ke GA4/GTM **tidak boleh menyertakan PII** (nama lengkap, no. HP, email calon pembeli dari form lead/DBR) — hanya event & parameter agregat (mis. `listing_id`, `city`, `price_range_bucket`), sesuai batasan data sensitif yang sudah ditetapkan di ERD/PRD.

---

## 5. Performa & Core Web Vitals

| Metrik | Target | Cara Mencapai |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5 detik | Gambar cover listing di-preload, disajikan lewat CDN dengan ukuran sesuai viewport (bukan gambar resolusi penuh dipaksa kecil di CSS) |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Reserve `width`/`height` (aspect-ratio) untuk setiap gambar & iklan/banner sebelum termuat, hindari konten yang mendorong layout setelah render awal |
| **INP** (Interaction to Next Paint) | < 200ms | Filter pencarian & peta interaktif dioptimasi agar tidak memblokir main thread (debounce input filter, lazy-load skrip peta) |
| **TTFB** (Time to First Byte) | < 600ms | SSR/ISR dengan caching edge (CDN-level cache untuk halaman publik yang jarang berubah dalam hitungan menit) |

---

## 6. Strategi Konten Pendukung (Off-Page/Content SEO) — Fase Lanjutan
- Pertimbangkan seksi **artikel/blog publik** (mis. "Cara menghitung DBR sebelum ajukan KPR", "Tips memilih rumah Primary vs Secondary") — konten ini bisa menarik trafik pencarian informasional yang lebih besar volumenya dibanding pencarian transaksional listing saja, dan dapat memakai ulang materi Learning Center (Modul 4) yang disederhanakan untuk konsumsi publik.
- Internal linking otomatis: setiap Detail Listing menampilkan "Listing serupa" dan link ke profil agen — memperkuat *link equity* antar halaman tanpa perlu effort manual.
- **Tidak termasuk cakupan wajib rilis awal** — dicatat sebagai rekomendasi fase lanjutan di PRD Modul 11.

---

## 7. Tata Kelola & Kepemilikan
- **Superadmin** memegang akses konfigurasi GTM Container ID, GA4 Measurement ID, dan verifikasi GSC (bagian dari konfigurasi sistem inti, sesuai RBAC Modul 10 — Manager/Admin tidak memiliki akses ini).
- Perlu ditentukan **siapa yang memegang akun Google Search Console & GTM** secara organisasi (bukan akun pribadi individu) agar tidak terjadi kehilangan akses saat pergantian staf — dicatat di bagian "Perlu Dikonfirmasi".

---

## 8. Checklist Implementasi Ringkas

| Item | Status Desain |
|---|---|
| Rendering SSR/SSG untuk halaman publik | Dirancang (Bagian 1.1) — framework ditetapkan: Next.js (App Router) |
| Struktur slug & auto-redirect | Dirancang (Bagian 1.2, 1.5) — tabel `url_redirects` ditambahkan ke ERD |
| robots.txt & meta robots per tipe halaman | Dirancang (Bagian 1.3) |
| Sitemap XML otomatis + Indexing API | Dirancang (Bagian 1.5, 4.3) |
| Meta title/description + Open Graph | Dirancang (Bagian 2) — field ditambahkan ke ERD |
| Structured data (JSON-LD) | Dirancang (Bagian 3) |
| GTM + GA4 event tracking | Dirancang (Bagian 4) |
| Core Web Vitals target | Dirancang (Bagian 5) — implementasi bergantung pilihan framework/hosting |
| Konten blog/artikel SEO | Direkomendasikan, fase lanjutan (Bagian 6) |

---

## 9. Hal yang Perlu Dikonfirmasi

1. Siapa pemegang akun organisasi untuk Google Search Console, GTM, dan GA4 (bukan akun pribadi) — perlu ditentukan tim operasional sebelum go-live, tidak lagi memblokir mulainya development.

> **Sudah diputuskan (v1.1):**
> - Pilihan framework frontend: **Next.js (App Router)** ditetapkan sebagai keputusan default arsitektur.
> - Fitur review/rating agen: **diaktifkan di rilis awal (Fase 1)** dengan alur submit (Buyer) + moderasi (Admin/Manager/Superadmin) — lihat tabel `agent_reviews` di ERD v1.1. `aggregateRating` di structured data agen (Bagian 3) relevan sejak awal, ditampilkan hanya jika minimal 1 review berstatus `approved` ada.

---

*Dokumen ini menjadi acuan tim frontend/backend saat memilih arsitektur rendering dan bagi tim marketing saat mengonfigurasi GTM/GA4/GSC pasca-deployment.*
