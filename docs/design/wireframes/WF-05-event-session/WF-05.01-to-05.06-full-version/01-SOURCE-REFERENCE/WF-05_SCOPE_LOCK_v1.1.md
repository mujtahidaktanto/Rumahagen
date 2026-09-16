# WF-05 Scope Lock v1.1 — Corrected

WF-05 = Event + Session within the single Integrated Core Master Wireframe.

### Substeps
- WF-05.01 Event Calendar + Discovery
- WF-05.02 Event Detail + Registration
- WF-05.03 Event Administration, including Event Provider Configuration
- WF-05.04 Session Participant Experience
- WF-05.05 Session Administration + Host/Instructor Assignment
- WF-05.06 Session Provider + Attendance + Evidence + Completion + Artifacts

### Explicit non-scope
- Create Listing belongs WIRE-02. WF-05 does not duplicate the 13 required Create Listing fields.
- Commercial payment/entitlement mutation belongs WIRE-06.
- Qualification/Award/Title issuance belongs WIRE-07.
- Detailed authorization administration belongs WIRE-08.
- System/provider catalogue/BYOK administration belongs WIRE-09.
- Shared cross-screen audit belongs WIRE-10/11.

### Client/admin separation
Client coverage: EVT-001..003, SES-001..003.
Admin/operational coverage: ADM-EVT-001..005, ADM-SES-001..005.

### Event ↔ Session boundary
Event is calendar/discovery/registration context; Learning Session remains M04 semantic authority. Event association does not transfer Session authority.

### Listing cross-package dependency
Create Listing requiredness/conditionality/semantic behavior is preserved in WIRE-02. WF-05 only consumes Project/Event contextual references where source-defined; it does not collect Listing creation data.
