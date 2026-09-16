-- 0038_performance_indexes_fk.sql
-- ADD-NEW — TIDAK berasal dari dokumen sumber (STEP10-D/STEP12-*) manapun,
-- dan BUKAN bagian dari 31 residual di P9_CONTROLLED_ENGINEERING_RESIDUAL_REGISTER
-- ataupun CHECKLIST_RESIDUAL_IMPLEMENTASI.md. Migration ini murni optimasi
-- performa: menambahkan index B-tree pada 85 kolom foreign key yang ditandai
-- "Unindexed foreign keys" (INFO) oleh Supabase Performance Advisor setelah
-- migration 0001-0037 diterapkan.
--
-- KENAPA PERLU: tanpa index, setiap kali (a) RLS policy melakukan subquery
-- JOIN lewat FK (pola sangat umum di seluruh 0007-0037, mis.
-- has_permission(..., owner_id) dan EXISTS(...) ke tabel induk), atau
-- (b) row di tabel induk di-UPDATE/DELETE dan Postgres perlu memvalidasi
-- constraint ON DELETE RESTRICT/SET NULL/CASCADE ke tabel anak — Postgres
-- melakukan sequential scan penuh ke tabel anak. Index membuat operasi itu
-- O(log n) alih-alih O(n).
--
-- KENAPA TIDAK PERLU index untuk FK yang TIDAK muncul di sini: kolom FK yang
-- sudah menjadi PRIMARY KEY (mis. users.id -> auth.users.id,
-- user_permission_presets.user_id -> users.id) atau sudah jadi kolom UNIQUE
-- tunggal (mis. agent_profiles.user_id, learning_point_accounts.user_id)
-- sudah otomatis punya index dari constraint itu sendiri. Kolom FK yang jadi
-- kolom PERTAMA pada UNIQUE komposit (mis. role_permissions.role_id di
-- UNIQUE(role_id, permission_id), organization_members.organization_id di
-- UNIQUE(organization_id, agent_id)) juga sudah tercakup index tersebut lewat
-- leftmost-prefix — hanya kolom KEDUA pada UNIQUE komposit itu (permission_id,
-- agent_id) yang tetap butuh index baru dan sudah termasuk daftar di bawah.
--
-- CATATAN OPERASIONAL: seluruh tabel saat migration ini ditulis masih kosong
-- (0 baris data produksi selain seed authorization), sehingga CREATE INDEX
-- biasa (bukan CONCURRENTLY) aman dan instan. Kalau migration serupa perlu
-- dijalankan lagi di kemudian hari saat tabel sudah berisi data besar,
-- pertimbangkan CREATE INDEX CONCURRENTLY per statement di luar transaction
-- block migration supaya tidak mengunci tabel produksi.

CREATE INDEX IF NOT EXISTS idx_agent_ai_connections_provider_id ON public.agent_ai_connections (provider_id);
CREATE INDEX IF NOT EXISTS idx_agent_ai_connections_user_id ON public.agent_ai_connections (user_id);

CREATE INDEX IF NOT EXISTS idx_agent_project_claims_project_id ON public.agent_project_claims (project_id);
CREATE INDEX IF NOT EXISTS idx_agent_project_claims_reviewed_by ON public.agent_project_claims (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_agent_reviews_agent_id ON public.agent_reviews (agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_reviews_buyer_id ON public.agent_reviews (buyer_id);
CREATE INDEX IF NOT EXISTS idx_agent_reviews_moderated_by ON public.agent_reviews (moderated_by);

CREATE INDEX IF NOT EXISTS idx_api_idempotency_keys_created_by ON public.api_idempotency_keys (created_by);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs (organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_award_instances_qualification_evaluation_id ON public.award_instances (qualification_evaluation_id);
CREATE INDEX IF NOT EXISTS idx_award_instances_title_definition_id ON public.award_instances (title_definition_id);
CREATE INDEX IF NOT EXISTS idx_award_instances_user_id ON public.award_instances (user_id);

CREATE INDEX IF NOT EXISTS idx_commercial_entitlements_organization_id ON public.commercial_entitlements (organization_id);
CREATE INDEX IF NOT EXISTS idx_commercial_entitlements_user_id ON public.commercial_entitlements (user_id);

CREATE INDEX IF NOT EXISTS idx_dbr_config_updated_by ON public.dbr_config (updated_by);

CREATE INDEX IF NOT EXISTS idx_developer_partners_user_id ON public.developer_partners (user_id);

CREATE INDEX IF NOT EXISTS idx_developer_project_media_project_id ON public.developer_project_media (project_id);

CREATE INDEX IF NOT EXISTS idx_developer_projects_city_id ON public.developer_projects (city_id);
CREATE INDEX IF NOT EXISTS idx_developer_projects_developer_id ON public.developer_projects (developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_projects_district_id ON public.developer_projects (district_id);
CREATE INDEX IF NOT EXISTS idx_developer_projects_province_id ON public.developer_projects (province_id);

CREATE INDEX IF NOT EXISTS idx_event_provider_bindings_event_id ON public.event_provider_bindings (event_id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_agent_id ON public.event_registrations (agent_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations (event_id);

CREATE INDEX IF NOT EXISTS idx_events_related_project_id ON public.events (related_project_id);
CREATE INDEX IF NOT EXISTS idx_events_submitted_by ON public.events (submitted_by);

CREATE INDEX IF NOT EXISTS idx_learning_point_transactions_account_id ON public.learning_point_transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_learning_point_transactions_user_id ON public.learning_point_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_learning_session_assignments_actor_id ON public.learning_session_assignments (actor_id);
CREATE INDEX IF NOT EXISTS idx_learning_session_assignments_created_by ON public.learning_session_assignments (created_by);
CREATE INDEX IF NOT EXISTS idx_learning_session_assignments_revoked_by ON public.learning_session_assignments (revoked_by);
CREATE INDEX IF NOT EXISTS idx_learning_session_assignments_session_id ON public.learning_session_assignments (session_id);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_organization_id ON public.learning_sessions (organization_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_owner_id ON public.learning_sessions (owner_id);

CREATE INDEX IF NOT EXISTS idx_listings_agent_id ON public.listings (agent_id);
CREATE INDEX IF NOT EXISTS idx_listings_city_id ON public.listings (city_id);
CREATE INDEX IF NOT EXISTS idx_listings_developer_project_id ON public.listings (developer_project_id);
CREATE INDEX IF NOT EXISTS idx_listings_district_id ON public.listings (district_id);
CREATE INDEX IF NOT EXISTS idx_listings_organization_id ON public.listings (organization_id);
CREATE INDEX IF NOT EXISTS idx_listings_province_id ON public.listings (province_id);

CREATE INDEX IF NOT EXISTS idx_marketing_kit_project_id ON public.marketing_kit (project_id);

CREATE INDEX IF NOT EXISTS idx_notification_templates_updated_by ON public.notification_templates (updated_by);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_operational_quota_pools_organization_id ON public.operational_quota_pools (organization_id);
CREATE INDEX IF NOT EXISTS idx_operational_quota_pools_quota_capacity_id ON public.operational_quota_pools (quota_capacity_id);
CREATE INDEX IF NOT EXISTS idx_operational_quota_pools_user_id ON public.operational_quota_pools (user_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_agent_id ON public.organization_members (agent_id);

CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations (created_by);

CREATE INDEX IF NOT EXISTS idx_partnership_learning_results_partner_user_id ON public.partnership_learning_results (partner_user_id);
CREATE INDEX IF NOT EXISTS idx_partnership_learning_results_session_id ON public.partnership_learning_results (session_id);
CREATE INDEX IF NOT EXISTS idx_partnership_learning_results_validated_by ON public.partnership_learning_results (validated_by);

CREATE INDEX IF NOT EXISTS idx_permission_preset_items_permission_id ON public.permission_preset_items (permission_id);

CREATE INDEX IF NOT EXISTS idx_permission_presets_created_by ON public.permission_presets (created_by);
CREATE INDEX IF NOT EXISTS idx_permission_presets_target_role_id ON public.permission_presets (target_role_id);
CREATE INDEX IF NOT EXISTS idx_permission_presets_updated_by ON public.permission_presets (updated_by);

CREATE INDEX IF NOT EXISTS idx_public_announcement_promotion_created_by ON public.public_announcement_promotion (created_by);
CREATE INDEX IF NOT EXISTS idx_public_announcement_promotion_updated_by ON public.public_announcement_promotion (updated_by);

CREATE INDEX IF NOT EXISTS idx_qualification_evaluations_user_id ON public.qualification_evaluations (user_id);

CREATE INDEX IF NOT EXISTS idx_qualification_evidence_qualification_evaluation_id ON public.qualification_evidence (qualification_evaluation_id);
CREATE INDEX IF NOT EXISTS idx_qualification_evidence_user_id ON public.qualification_evidence (user_id);

CREATE INDEX IF NOT EXISTS idx_quota_allocations_beneficiary_organization_id ON public.quota_allocations (beneficiary_organization_id);
CREATE INDEX IF NOT EXISTS idx_quota_allocations_beneficiary_user_id ON public.quota_allocations (beneficiary_user_id);
CREATE INDEX IF NOT EXISTS idx_quota_allocations_operational_quota_pool_id ON public.quota_allocations (operational_quota_pool_id);

CREATE INDEX IF NOT EXISTS idx_quota_capacities_entitlement_id ON public.quota_capacities (entitlement_id);

CREATE INDEX IF NOT EXISTS idx_quota_usage_operational_quota_pool_id ON public.quota_usage (operational_quota_pool_id);
CREATE INDEX IF NOT EXISTS idx_quota_usage_quota_allocation_id ON public.quota_usage (quota_allocation_id);

CREATE INDEX IF NOT EXISTS idx_ref_cities_province_id ON public.ref_cities (province_id);

CREATE INDEX IF NOT EXISTS idx_ref_districts_city_id ON public.ref_districts (city_id);

CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions (permission_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_updated_by ON public.role_permissions (updated_by);

CREATE INDEX IF NOT EXISTS idx_session_artifacts_session_id ON public.session_artifacts (session_id);

CREATE INDEX IF NOT EXISTS idx_session_attendance_evaluations_evidence_id ON public.session_attendance_evaluations (evidence_id);
CREATE INDEX IF NOT EXISTS idx_session_attendance_evaluations_session_enrollment_id ON public.session_attendance_evaluations (session_enrollment_id);

CREATE INDEX IF NOT EXISTS idx_session_completion_outcomes_attendance_evaluation_id ON public.session_completion_outcomes (attendance_evaluation_id);
CREATE INDEX IF NOT EXISTS idx_session_completion_outcomes_session_enrollment_id ON public.session_completion_outcomes (session_enrollment_id);

CREATE INDEX IF NOT EXISTS idx_session_enrollments_agent_id ON public.session_enrollments (agent_id);

CREATE INDEX IF NOT EXISTS idx_session_participation_evidence_binding_id ON public.session_participation_evidence (binding_id);
CREATE INDEX IF NOT EXISTS idx_session_participation_evidence_session_enrollment_id ON public.session_participation_evidence (session_enrollment_id);

CREATE INDEX IF NOT EXISTS idx_session_provider_bindings_session_id ON public.session_provider_bindings (session_id);

CREATE INDEX IF NOT EXISTS idx_system_configs_updated_by ON public.system_configs (updated_by);

CREATE INDEX IF NOT EXISTS idx_title_authority_scopes_title_definition_id ON public.title_authority_scopes (title_definition_id);

CREATE INDEX IF NOT EXISTS idx_user_permission_presets_assigned_by ON public.user_permission_presets (assigned_by);
CREATE INDEX IF NOT EXISTS idx_user_permission_presets_preset_id ON public.user_permission_presets (preset_id);

CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users (role_id);
