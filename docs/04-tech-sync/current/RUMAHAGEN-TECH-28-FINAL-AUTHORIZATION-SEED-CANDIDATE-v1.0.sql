-- ============================================================================
-- RUMAHAGEN TECH-28 FINAL AUTHORIZATION SEED CANDIDATE v1.0
-- STATUS: FROZEN FOR REVIEW / NON-PRODUCTION EXECUTION ONLY
-- IMPORTANT: This file is not production authorization.
-- ============================================================================

BEGIN;

-- 1. New M04 Session permission catalogue.
-- Existing permissions are not repurposed.
INSERT INTO permissions (module_code, action_code, scope_type, description)
VALUES
('M04','Create-LearningSession','own','Create Learning Session'),
('M04','View-LearningSession','own','View Learning Session'),
('M04','Update-LearningSession','own','Update Learning Session'),
('M04','Delete-LearningSession','own','Delete Learning Session'),
('M04','Manage-LearningSession','own','Governed Learning Session management/lifecycle'),
('M04','Create-SessionEnrollment','own','Create Session Enrollment'),
('M04','View-SessionEnrollment','own','View Session Enrollment'),
('M04','View-SessionEvidence','own','View Session participation evidence'),
('M04','Manage-SessionAttendance','own','Review/evaluate Session attendance'),
('M04','Manage-SessionCompletion','own','Evaluate/finalize Session completion'),
('M04','View-SessionArtifact','own','View permitted Session artifact'),
('M04','Assign-LearningSession','all','Assign/revoke HOST or INSTRUCTOR Session capability'),
('M04','Manage-SessionProvider','all','Manage Session provider binding'),
('M04','Manage-SessionVisibility','own','Manage Session visibility')
ON CONFLICT (module_code, action_code) DO NOTHING;

-- 2. Frozen role_permissions mapping.
-- Existing role codes only. No role creation.
INSERT INTO role_permissions (role_id, permission_id, granted_scope)
SELECT r.id, p.id, x.granted_scope
FROM (VALUES
('superadmin','Create-LearningSession','all'),
('superadmin','View-LearningSession','all'),
('superadmin','Update-LearningSession','all'),
('superadmin','Delete-LearningSession','all'),
('superadmin','Manage-LearningSession','all'),
('superadmin','Create-SessionEnrollment','all'),
('superadmin','View-SessionEnrollment','all'),
('superadmin','View-SessionEvidence','all'),
('superadmin','Manage-SessionAttendance','all'),
('superadmin','Manage-SessionCompletion','all'),
('superadmin','View-SessionArtifact','all'),
('superadmin','Assign-LearningSession','all'),
('superadmin','Manage-SessionProvider','all'),
('superadmin','Manage-SessionVisibility','all'),

('manager','Create-LearningSession','all'),
('manager','View-LearningSession','all'),
('manager','Update-LearningSession','all'),
('manager','Delete-LearningSession','all'),
('manager','Manage-LearningSession','all'),
('manager','Create-SessionEnrollment','all'),
('manager','View-SessionEnrollment','all'),
('manager','View-SessionEvidence','all'),
('manager','Manage-SessionAttendance','all'),
('manager','Manage-SessionCompletion','all'),
('manager','View-SessionArtifact','all'),
('manager','Assign-LearningSession','all'),
('manager','Manage-SessionProvider','all'),
('manager','Manage-SessionVisibility','all'),

('admin','Create-LearningSession','all'),
('admin','View-LearningSession','all'),
('admin','Update-LearningSession','all'),
('admin','Delete-LearningSession','all'),
('admin','Manage-LearningSession','all'),
('admin','Create-SessionEnrollment','all'),
('admin','View-SessionEnrollment','all'),
('admin','View-SessionEvidence','all'),
('admin','Manage-SessionAttendance','all'),
('admin','Manage-SessionCompletion','all'),
('admin','View-SessionArtifact','all'),
('admin','Assign-LearningSession','all'),
('admin','Manage-SessionProvider','all'),
('admin','Manage-SessionVisibility','all'),

('instructor','Create-LearningSession','own'),
('instructor','View-LearningSession','own'),
('instructor','Update-LearningSession','own'),
('instructor','Delete-LearningSession','own'),
('instructor','Manage-LearningSession','own'),
('instructor','Create-SessionEnrollment','own'),
('instructor','View-SessionEnrollment','own'),
('instructor','View-SessionEvidence','own'),
('instructor','Manage-SessionAttendance','own'),
('instructor','Manage-SessionCompletion','own'),
('instructor','View-SessionArtifact','own'),
('instructor','Manage-SessionVisibility','own'),

('agent','Create-SessionEnrollment','own'),
('agent','View-SessionEnrollment','own'),
('agent','View-SessionEvidence','own'),
('agent','View-SessionArtifact','own')
) AS x(role_code, action_code, granted_scope)
JOIN roles r ON r.code=x.role_code
JOIN permissions p ON p.module_code='M04' AND p.action_code=x.action_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 3. Resource-level capability is intentionally NOT represented by role_permissions.
-- learning_session_assignments.capability = HOST | INSTRUCTOR remains the resource layer.
-- Assign-LearningSession controls who may mutate those assignment rows.
-- Instructor role does not imply HOST.
-- Provider permission does not imply HOST; the final runtime check must also verify
-- an active HOST assignment (or a separately authorized privileged system/admin path).

COMMIT;
