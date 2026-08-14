# Prompt: Drift Detection Audit — architecture-decision-records.md vs Dokumen Lain

> Jalankan prompt ini secara periodik (disarankan: setiap kali menyelesaikan satu
> siklus OD/ADR baru, atau setiap beberapa minggu jika ada banyak sesi kerja
> menumpuk). Ini murni AUDIT — tidak mengedit dokumen apa pun, hanya melaporkan
> temuan untuk kamu putuskan tindak lanjutnya.

## Dokumen yang Wajib Diupload

1. `architecture-decision-records.md` (versi yang kamu punya sekarang)
2. `decision-log.md` (versi terbaru)
3. `project-manifest.md` (versi terbaru)
4. `CURRENT-PROJECT-STATE.md` (versi terbaru)
5. `document-governance-baseline-register.md` (versi terbaru)
6. `CHANGELOG.md` (versi terbaru)

## Prompt (salin-tempel setelah upload dokumen di atas)

```
Anda bertindak sebagai auditor Engineering Alignment Framework untuk proyek
Platform Web RUMAHAGEN, menjalankan Tahap 9 (Monitoring & Drift
Detection, EAF §10.2) dan Synchronization Rules (EAF §23).

TUGAS: Audit murni — TIDAK mengedit dokumen apa pun. Bandingkan
architecture-decision-records.md terhadap decision-log.md, project-manifest.md,
CURRENT-PROJECT-STATE.md, document-governance-baseline-register.md, dan
CHANGELOG.md yang saya lampirkan. Laporkan SETIAP ketidaksinkronan yang
ditemukan, sekecil apa pun (EAF §8.3 — Prinsip Transparansi Penuh: tidak boleh
"diperbaiki diam-diam" tanpa jejak audit).

Periksa secara spesifik:

1. NOMOR ADR TERTINGGI
   - Berapa nomor ADR tertinggi yang benar-benar tercatat sebagai entry resmi
     di architecture-decision-records.md (bukan disebut di teks lain)?
   - Apakah ada ADR yang disebut/dirujuk di decision-log.md, project-manifest.md,
     CHANGELOG.md, atau CURRENT-PROJECT-STATE.md dengan nomor yang TIDAK ada
     sebagai entry resmi di architecture-decision-records.md? Sebutkan semua.

2. STATUS ADR
   - Apakah ada ADR yang statusnya berbeda antara architecture-decision-records.md
     dan dokumen lain (mis. dicatat "Approved" di satu tempat, "Proposed"/"OPEN"
     di tempat lain)?

3. VERSI DOKUMEN
   - Apakah field "Version"/"Last Updated" di header architecture-decision-records.md
     konsisten dengan referensi versi yang disebut project-manifest.md dan
     document-governance-baseline-register.md?

4. JUMLAH TOTAL ADR
   - Apakah klaim "X dari X ADR Approved" di header architecture-decision-records.md
     masih akurat dibanding jumlah entry yang benar-benar ada di Bagian 4?

5. OD YANG SUDAH RESOLVED TAPI ADR MIRROR-NYA BELUM DICATAT
   - Untuk setiap Open Decision di decision-log.md §11 yang berstatus Resolved
     dan seharusnya punya ADR terkait (arsitektur/teknis), apakah ADR tsb
     benar-benar ada di architecture-decision-records.md?

6. GAP NOMOR
   - Sebutkan semua nomor ADR yang TIDAK memiliki entry resmi di antara nomor
     terendah dan tertinggi yang ada — ini kandidat nomor kosong yang aman
     dipakai untuk ADR baru berikutnya.

FORMAT OUTPUT:
Tabel temuan dengan kolom: No. | Jenis Ketidaksinkronan | Dokumen Terlibat |
Deskripsi | Tingkat Keparahan (Critical/Major/Minor/Informational, sesuai
EAF §24.2) | Rekomendasi Tindak Lanjut.

ATURAN KERAS:
- JANGAN mengedit dokumen apa pun di sesi ini.
- JANGAN memperbaiki temuan sendiri, walau kelihatan sepele.
- JANGAN menyimpulkan nomor ADR kosong yang aman kecuali Anda sudah membaca
  SELURUH Bagian 4 architecture-decision-records.md secara berurutan dari
  entry pertama sampai terakhir — bukan hanya potongan yang kebetulan relevan.
- Jika dokumen yang saya upload ternyata tidak cukup untuk menjawab salah satu
  poin di atas, sebutkan eksplisit dokumen tambahan apa yang Anda butuhkan.
```

## Setelah Audit Selesai

Temuan hasil audit ini didaftarkan sebagai **Engineering Alignment Issue** (`EAI-XXX`, format EAF §24.3) jika ada — lalu diperbaiki lewat task/prompt terpisah (seperti pola P1-P13 sebelumnya), bukan langsung diedit di sesi audit yang sama. Ini menjaga jejak audit tetap bersih (EAF §29.3 — Audit Trail sebagai Mitigasi Struktural).

---

*Prompt ini adalah alat operasional — bukan bagian dari dokumen sumber proyek.
Disimpan untuk dipakai berulang setiap siklus audit drift-detection berikutnya.*
