# WIRE-03 v1.1 Change Log

## v1.0 → v1.1 controlled correction

### F-0301
ORG-005 changed from generic “Organization details” to explicit semantic inputs: Organization name (required) and Organization type (required), with optional profile fields separately identified.

### F-0302
DEV-001 now includes Company name (required), PIC name, PIC contact, Company logo, and “Tentang Developer”. The Developer description remains distinct from Project.meta_description and Listing.description.

### F-0303
DEV-003 now contains Price min and Price max as separate Project fields. Price semantics remain dependent on transaction type/price unit.

### F-0304
Documentation now explicitly classifies user inputs, context/inherited fields, generated/system fields and lifecycle fields, preventing system metadata from becoming ordinary form inputs.

### Scope protection
No M03 Listing Create/Edit/Publish/Refresh/Quota/Performance fields were duplicated into WIRE-03.

### Evidence boundary
No physical/runtime/production proof is claimed or required for WIRE-03 wireframe execution.
