-- 0115_developer_partner_event_permission.sql
-- Menutup gap agen/user TERAKHIR dari audit endpoint M01-M15: API "POST
-- /developer-partners/events" (M05), dievidensi eksplisit di Gate
-- PRE-00-G_M05_MANDATORY_DELTA_IMPACT_GATE §15 "DEVELOPER PARTNER EVENT
-- PUBLICATION":
--   "Developer Partner -> OWN / SUBMIT -> subject to approval.
--    Developer Partner does not directly publish the Event through an
--    unrestricted bypass. Core already identifies:
--    POST /developer-partners/events -- Developer Partner; subject to
--    approval." Classification: PRESERVE, No conflict.
--
-- Sebelum migration ini, `developer_partner` TIDAK PUNYA satu pun baris
-- role_permissions untuk m05.event.* (dicek: seed 0009 hanya memberi
-- m05.event.create/update/publish/lifecycle/visibility/cancellation ke
-- superadmin/admin/manager/agent/instructor) -- baik lewat route generik
-- POST /events maupun route khusus ini, Developer Partner tidak bisa
-- membuat event sama sekali.
--
-- TIDAK ADA permission baru di-mint -- reuse PERSIS 2 permission code
-- yang sudah ada sejak 0009 (m05.event.create, m05.event.update), scope
-- 'own' (submitter melihat/mengelola submission miliknya sendiri) --
-- SENGAJA TIDAK diberi m05.event.publish/lifecycle/cancellation:
-- `events.status` DEFAULT 'pending_approval' (0031) sudah menjadi
-- mekanisme approval fisik yang benar-benar ada -- trigger
-- enforce_event_lifecycle_permissions (0031) menolak transisi ke
-- 'published' tanpa m05.event.publish, yang TIDAK dimiliki Developer
-- Partner -- inilah realisasi konkret "does not directly publish...
-- subject to approval" tanpa kode baru sama sekali, murni lewat
-- ketiadaan permission itu.

INSERT INTO public.role_permissions (role_id, permission_id, granted_scope, editable_by_role_code)
SELECT r.id, p.id, 'own', 'superadmin'
FROM (VALUES ('m05.event.create'), ('m05.event.update')) AS x(action_code)
JOIN public.permissions p ON p.action_code = x.action_code
JOIN public.roles r ON r.code = 'developer_partner'
ON CONFLICT (role_id, permission_id) DO NOTHING;
