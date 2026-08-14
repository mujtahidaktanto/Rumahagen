# Manifest — Rename & Arsip Migration (Tier 1 Issue Register)

**Tanggal:** 10 Agustus 2026
**Alasan:** `ISSUE-REGISTER-Konsolidasi-FINAL__3_.md` mencatat T1-01 s.d. T1-04 sebagai
Closed sejak 6 Agustus 2026, dan `document-governance-baseline-register` (Governance
Notes poin 27-29) merekomendasikan eksplisit "ganti ke versi `-FIXED`" — namun versi
lama (pra-perbaikan) masih ada di folder project berdampingan dengan versi yang benar,
tanpa penanda status. Tindakan di bawah ini murni **rename & pemindahan file**, tidak
ada satu baris kode pun yang diubah isinya.

---

## 1. File Kanonik (pakai ini ke depan — folder `migrations-canonical/`)

| Nama Baru (kanonik) | Sumber | Isu yang Diperbaiki |
|---|---|---|
| `0007_m12_organization.sql` | `0007_m12_organization-FIXED.sql` | T1-04 — celah spoofing `leader_id` pada `org_invitations_insert` |
| `0008_m03_listing.sql` | `0008_m03_listing-FIXED.sql` | T1-02 (blokir akses publik listing `sold`/`rented`) + T3-06 (RLS child table Org Leader) |
| `0009_m04_learning_center.sql` | `0009_m04_learning_center-FIXED.sql` | T1-01 — RLS `quiz_questions_manage`/`quiz_options_manage` tanpa klausa ownership |
| `0010_m05_events.sql` | `0010_m05_events-FIXED.sql` | T1-03 — `events_manage` mengizinkan self-publish tanpa approval |

## 2. File Diarsipkan (pra-perbaikan — folder `migrations-archive/`, JANGAN dieksekusi ke database)

| Nama Baru (arsip) | Sumber Asli (project folder) |
|---|---|
| `0007_m12_organization-PRA-FIX-T1-04.sql` | `0007_m12_organization__1_.sql` |
| `0008_m03_listing-PRA-FIX-T1-02-T3-06.sql` | `0008_m03_listing__1_.sql` |
| `0009_m04_learning_center-PRA-FIX-T1-01.sql` | `0009_m04_learning_center__1_.sql` |
| `0010_m05_events-PRA-FIX-T1-03.sql` | `0010_m05_events__1_.sql` |

---

## 3. Yang MASIH perlu Anda lakukan secara manual (di luar kemampuan saya)

1. **Upload ulang folder `migrations-canonical/` ke lokasi migration resmi Anda**
   (mis. `supabase/migrations/`), menggantikan file lama bernama sama.
2. **Eksekusi/re-eksekusi migration ke database live** — per Governance Notes poin 37
   Baseline Register, ini **belum pernah dilakukan sepanjang proyek**. Rename file saja
   tidak mengubah skema database yang sudah berjalan.
3. **Update `project-manifest.md`** jika ada rujukan eksplisit ke nama file lama
   (`__1_`/tanpa suffix) — di luar cakupan audit saya sejauh ini (`project-manifest.md`
   sudah dilaporkan punya drift terpisah, lihat sesi audit Baseline Register sebelumnya).
4. Setelah migration live dijalankan, pertimbangkan minta saya update
   `CURRENT-PROJECT-STATE.md` (kalau ada di project Anda) untuk mencatat migration
   sudah dieksekusi — dokumen itu belum saya audit di sesi ini.

---

*Manifest ini dibuat sebagai bagian dari audit konsolidasi dokumen — jejak transparansi
penuh (EAF §8.3) atas tindakan rename/arsip yang dilakukan.*
