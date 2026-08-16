-- TECH-26 STATIC VERIFICATION v1.0 — REVIEW ONLY
-- Verify permission namespace, action vocabulary, role codes and scope.

SELECT p.module_code, p.action_code, p.scope_type
FROM permissions p
WHERE p.module_code='M04'
  AND p.action_code IN (
    'Create-LearningSession','View-LearningSession','Update-LearningSession',
    'Delete-LearningSession','Manage-LearningSession',
    'Create-SessionEnrollment','View-SessionEnrollment',
    'View-SessionEvidence','Manage-SessionAttendance',
    'Manage-SessionCompletion','View-SessionArtifact',
    'Assign-LearningSession','Manage-SessionProvider',
    'Manage-SessionVisibility'
  )
ORDER BY p.action_code;

SELECT r.code AS role_code, p.action_code, rp.granted_scope
FROM role_permissions rp
JOIN roles r ON r.id=rp.role_id
JOIN permissions p ON p.id=rp.permission_id
WHERE p.module_code='M04'
  AND p.action_code IN (
    'Create-LearningSession','View-LearningSession','Update-LearningSession',
    'Delete-LearningSession','Manage-LearningSession',
    'Create-SessionEnrollment','View-SessionEnrollment',
    'View-SessionEvidence','Manage-SessionAttendance',
    'Manage-SessionCompletion','View-SessionArtifact',
    'Assign-LearningSession','Manage-SessionProvider',
    'Manage-SessionVisibility'
  )
ORDER BY r.code,p.action_code;

-- Invalid scope check
SELECT *
FROM role_permissions
WHERE granted_scope NOT IN ('all','own','none');

-- Assignment mutation permission must not be granted to Instructor/Agent in this candidate
SELECT r.code,p.action_code,rp.granted_scope
FROM role_permissions rp
JOIN roles r ON r.id=rp.role_id
JOIN permissions p ON p.id=rp.permission_id
WHERE p.module_code='M04'
  AND p.action_code='Assign-LearningSession'
  AND r.code IN ('instructor','agent');

-- Provider management permission must not be granted to Instructor in this candidate
SELECT r.code,p.action_code,rp.granted_scope
FROM role_permissions rp
JOIN roles r ON r.id=rp.role_id
JOIN permissions p ON p.id=rp.permission_id
WHERE p.module_code='M04'
  AND p.action_code='Manage-SessionProvider'
  AND r.code IN ('instructor','agent');

-- Existing Course/Event permissions remain distinct
SELECT p.module_code,p.action_code
FROM permissions p
WHERE p.module_code IN ('M04','M05')
  AND p.action_code IN ('Create-Course','Create-Enrollment','Create-Event','Create-EventRegistration')
ORDER BY p.module_code,p.action_code;
