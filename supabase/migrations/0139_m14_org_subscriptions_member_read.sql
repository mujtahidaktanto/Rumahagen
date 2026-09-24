-- 0139_m14_org_subscriptions_member_read.sql
-- Langganan milik organisasi (subscriptions.organization_id) tidak terbaca anggotanya: policy subscriptions_select hanya memeriksa izin own_purchase
-- atas `user_id`, jadi baris berisi organization_id tanpa user_id hanya terlihat staf (SOURCE-Agent-Langganan.md §3, §4 butir 3).
-- Perbaikan: anggota AKTIF organisasi boleh MEMBACA (SELECT) langganan organisasinya. Tidak ada hak tulis baru (tulis tetap staf).
-- Catatan privasi: kolom historical_purchase_snapshot (rincian pembelian) tetap terbaca pada level baris; route GET /agents/me/subscriptions
-- menyembunyikannya untuk baris yang bukan milik pemanggil. Tabel subscriptions kosong saat ditulis (dicek live).

DROP POLICY IF EXISTS subscriptions_select_org_member ON public.subscriptions;
CREATE POLICY subscriptions_select_org_member ON public.subscriptions
  FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(organization_id));
