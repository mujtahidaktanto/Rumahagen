-- 0077_fix_commercial_entitlements_source_fk.sql
-- Penutup 3 kolom FK yang SENGAJA ditunda sejak migration 0019 (lihat
-- komentar aslinya: "target tabelnya (commercial_orders/payment_
-- transactions/commercial_fulfillments) milik pipeline Commercial
-- Purchase/Payment M14 yang lebih luas, residual TERPISAH dari R-04/
-- D13-01, belum masuk Tahap 4. Pola sama seperti campaign_reference di
-- 0014 dan developer_project_id di 0018: kolom ada, FK menyusul"). Sekarang
-- ketiga tabel target sudah ada (0072/0073/0075), FK retroaktif ini
-- ditutup — pola PERSIS sama seperti learning_sessions.course_id/0062 dan
-- qualification_evaluations/award_instances.awarding_*_version_id/0069.
--
-- Kolom TETAP NULLABLE (bukan diubah NOT NULL) — sesuai desain asli 0019,
-- entitlement bisa punya sumber non-commercial (mis. diberikan manual
-- staf lewat adjust_learning_points()-style function, tanpa order/payment
-- sungguhan).
--
-- ON DELETE SET NULL (bukan RESTRICT) — beda dari FK retroaktif
-- sebelumnya (learning_sessions/qualification_evaluations pakai RESTRICT)
-- karena arah kepentingan historisnya terbalik di sini: entitlement adalah
-- catatan HAK milik user yang harus tetap ada/valid meski order/payment/
-- fulfillment sumbernya suatu saat dihapus (mis. pembersihan data
-- transaksi lama) — kehilangan JEJAK sumbernya (NULL) lebih baik daripada
-- entitlement ikut terhapus atau penghapusan order diblokir gara-gara
-- entitlement lama.

ALTER TABLE public.commercial_entitlements
  ADD CONSTRAINT commercial_entitlements_source_order_id_fkey
  FOREIGN KEY (source_order_id) REFERENCES public.commercial_orders(id) ON DELETE SET NULL,
  ADD CONSTRAINT commercial_entitlements_source_payment_transaction_id_fkey
  FOREIGN KEY (source_payment_transaction_id) REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  ADD CONSTRAINT commercial_entitlements_source_fulfillment_id_fkey
  FOREIGN KEY (source_fulfillment_id) REFERENCES public.commercial_fulfillments(id) ON DELETE SET NULL;
