-- TECH-28 FINAL AUTHORIZATION STATIC VERIFICATION v1.0
-- Review-only. Run only in authorized non-production/staging environment.

-- A. Permission catalogue
SELECT module_code, action_code, scope_type, description
FROM permissions
WHERE module_code='M04'
  AND action_code IN (
    'Create-LearningSession','View-LearningSession','Update-LearningSession',
    'Delete-LearningSession','Manage-LearningSession',
    'Create-SessionEnrollment','View-SessionEnrollment',
    'View-SessionEvidence','Manage-SessionAttendance',
    'Manage-SessionCompletion','View-SessionArtifact',
    'Assign-LearningSession','Manage-SessionProvider',
    'Manage-SessionVisibility'
  )
ORDER BY action_code;

-- B. Role mapping
SELECT r.code AS role_code, p.action_code, rp.granted_scope
FROM role_permissions rp
JOIN roles r ON r.id=rp.role_id
JOIN permissions p ON p.id=rp.permission_id
WHERE p.module_code='M04'
  AND p.action_code LIKE '%LearningSession%'
   OR (p.module_code='M04' AND p.action_code IN (
    'Create-SessionEnrollment','View-SessionEnrollment',
    'View-SessionEvidence','Manage-SessionAttendance',
    'Manage-SessionCompletion','View-SessionArtifact'
   ))
ORDER BY r.code,p.action_code;

-- C. Instructor must NOT receive assignment/provider mutation
SELECT r.code,p.action_code,rp.granted_scope
FROM role_permissions rp
JOIN roles r ON r.id=rp.role_id
JOIN permissions p ON p.id=rp.permission_id
WHERE r.code='instructor'
  AND p.module_code='M04'
  AND p.action_code IN ('Assign-LearningSession','Manage-SessionProvider');

-- D. Agent must not receive Session management
SELECT r.code,p.action_code,rp.granted_scope
FROM role_permissions rp
JOIN roles r ON r.id=rp.role_id
JOIN permissions p ON p.id=rp.permission_id
WHERE r.code='agent'
  AND p.module_code='M04'
  AND p.action_code IN (
    'Create-LearningSession','Update-LearningSession',
    'Delete-LearningSession','Manage-LearningSession',
    'Assign-LearningSession','Manage-SessionProvider',
    'Manage-SessionVisibility'
  );

-- E. Assignment integrity
SELECT session_id, actor_id, capability, count(*)
FROM learning_session_assignments
WHERE status='ACTIVE'
GROUP BY session_id,actor_id,capability
HAVING count(*)>1;

-- F. Host/Instructor capability values
SELECT DISTINCT capability
FROM learning_session_assignments
ORDER BY capability;

-- G. Existing Course/Event permissions remain distinct
SELECT module_code, action_code
FROM permissions
WHERE module_code IN ('M04','M05')
  AND action_code IN ('Create-Course','Create-Enrollment','Create-Event','Create-EventRegistration')
ORDER BY module_code,action_code;

-- H. Scope vocabulary
SELECT DISTINCT granted_scope
FROM role_permissions
ORDER BY granted_scope;

-- Expected:
-- C returns zero rows.
-- D returns zero rows.
-- E returns zero rows.
-- F contains only HOST / INSTRUCTOR where assignments exist.
-- H contains only all / own / none.
