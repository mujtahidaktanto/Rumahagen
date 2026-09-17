-- 0070_performance_indexes_fk_phase3.sql
-- ADD-NEW — penutup Fase 3 (0064-0069), pola dan alasan PERSIS sama seperti
-- 0038/0053/0063: index B-tree untuk kolom FK yang akan ditandai
-- "Unindexed foreign keys" oleh Supabase Performance Advisor.
--
-- Tidak termasuk: `awarding_path_versions.awarding_path_id`,
-- `awarding_path_rules.awarding_path_version_id`, `title_presentations.
-- user_id` (kolom pertama pada UNIQUE komposit masing-masing, sudah
-- otomatis punya index leftmost-prefix).

CREATE INDEX IF NOT EXISTS idx_awarding_paths_title_definition_id ON public.awarding_paths (title_definition_id);

CREATE INDEX IF NOT EXISTS idx_awarding_path_rules_awarding_rule_version_id ON public.awarding_path_rules (awarding_rule_version_id);

CREATE INDEX IF NOT EXISTS idx_awarding_condition_groups_awarding_rule_version_id ON public.awarding_condition_groups (awarding_rule_version_id);

CREATE INDEX IF NOT EXISTS idx_awarding_conditions_condition_group_id ON public.awarding_conditions (condition_group_id);

CREATE INDEX IF NOT EXISTS idx_awarding_prerequisites_awarding_path_version_id ON public.awarding_prerequisites (awarding_path_version_id);

CREATE INDEX IF NOT EXISTS idx_award_qualifying_paths_award_instance_id ON public.award_qualifying_paths (award_instance_id);
CREATE INDEX IF NOT EXISTS idx_award_qualifying_paths_awarding_path_version_id ON public.award_qualifying_paths (awarding_path_version_id);
CREATE INDEX IF NOT EXISTS idx_award_qualifying_paths_qualification_evaluation_id ON public.award_qualifying_paths (qualification_evaluation_id);

CREATE INDEX IF NOT EXISTS idx_title_presentations_title_definition_id ON public.title_presentations (title_definition_id);

CREATE INDEX IF NOT EXISTS idx_qualification_evaluations_awarding_path_version_id ON public.qualification_evaluations (awarding_path_version_id);
CREATE INDEX IF NOT EXISTS idx_qualification_evaluations_awarding_rule_version_id ON public.qualification_evaluations (awarding_rule_version_id);
CREATE INDEX IF NOT EXISTS idx_award_instances_awarding_path_version_id ON public.award_instances (awarding_path_version_id);
CREATE INDEX IF NOT EXISTS idx_award_instances_awarding_rule_version_id ON public.award_instances (awarding_rule_version_id);
