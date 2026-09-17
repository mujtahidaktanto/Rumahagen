-- 0069_fix_qualification_award_awarding_fk.sql
-- Penutup 2 pasang FK yang SENGAJA ditunda sejak migration 0026 (lihat
-- komentar aslinya: "kedua kolom itu DILEBARKAN jadi NULLABLE tanpa FK di
-- sini... Mesin konfigurasi awarding path/rule adalah RESIDUAL TERPISAH
-- untuk masa depan"). Sekarang `awarding_path_versions`/
-- `awarding_rule_versions` sudah ada (0064/0065), FK retroaktif ini
-- ditutup — pola PERSIS sama seperti `learning_sessions.course_id`/0062.
--
-- Kolom TETAP NULLABLE (bukan diubah NOT NULL) — NULL tetap berarti
-- "belum terikat ke path/rule versi formal" yang sah, sesuai catatan
-- keputusan asli 0026: evaluasi/award manual (lewat POST langsung, bukan
-- lewat mesin konfigurasi) tetap valid tanpa path/rule version.
--
-- ON DELETE RESTRICT (bukan CASCADE/SET NULL): path/rule version yang
-- masih dirujuk qualification_evaluations/award_instances manapun TIDAK
-- BOLEH terhapus begitu saja — riwayat evaluasi/award adalah catatan
-- historis yang tidak boleh kehilangan jejak ke path/rule version
-- sumbernya (pola sama seperti awarding_path_rules.awarding_rule_version_id
-- RESTRICT di 0065).

ALTER TABLE public.qualification_evaluations
  ADD CONSTRAINT qualification_evaluations_awarding_path_version_id_fkey
  FOREIGN KEY (awarding_path_version_id) REFERENCES public.awarding_path_versions(id) ON DELETE RESTRICT,
  ADD CONSTRAINT qualification_evaluations_awarding_rule_version_id_fkey
  FOREIGN KEY (awarding_rule_version_id) REFERENCES public.awarding_rule_versions(id) ON DELETE RESTRICT;

ALTER TABLE public.award_instances
  ADD CONSTRAINT award_instances_awarding_path_version_id_fkey
  FOREIGN KEY (awarding_path_version_id) REFERENCES public.awarding_path_versions(id) ON DELETE RESTRICT,
  ADD CONSTRAINT award_instances_awarding_rule_version_id_fkey
  FOREIGN KEY (awarding_rule_version_id) REFERENCES public.awarding_rule_versions(id) ON DELETE RESTRICT;
