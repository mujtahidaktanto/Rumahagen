# WIRE-03 Field / Semantic Matrix v1.1

## Organization — ORG-005
| Field | Classification | Requiredness / dependency | UX behavior |
|---|---|---|---|
| organization_name | user input | NOT NULL / required | explicit labeled text field; validation on missing value |
| organization_type | user input | NOT NULL / required | explicit governed selection |
| logo_url | user input/resource | optional | upload/manage |
| banner_url | user input/resource | optional | upload/manage |
| description | user input | optional | free text |
| website | user input | optional | text/URL field |
| social_media | user input | optional | governed text/URL presentation |
| address | user input | optional | text field |
| contact_phone | user input | optional | contact field |
| slug | generated/system | generated/unique | display only where relevant; not an ordinary create input |
| created_by | context/inherited | system-derived | not editable as ordinary input |
| status | lifecycle/system | system-controlled | represented as state, not free input |
| id/created_at/updated_at/deleted_at | system | generated | not ordinary inputs |

## Developer — DEV-001
| Field | Classification | Requiredness / dependency | UX behavior |
|---|---|---|---|
| company_name | user input | NOT NULL / required | explicit labeled identity field |
| pic_name | user input | optional | contact field |
| pic_contact | user input | optional | contact field |
| company_logo | user input/resource | semantic locked Developer field | upload/manage; Developer-level only |
| description (“Tentang Developer”) | user input | optional free-text profile field | distinct from Project.meta_description and Listing.description |
| user_id | context/inherited | system relationship | not ordinary editable input |
| status/deleted_at/created_at | lifecycle/system | system-controlled | state/metadata only |

## Project — DEV-003
| Field | Classification | Requiredness / dependency | UX behavior |
|---|---|---|---|
| name | user input | NOT NULL | explicit Project identity field |
| category | user input | M03-compatible project/listing content | governed selection |
| transaction_type | user input | M03-compatible; drives dependent price semantics | governed selection |
| price_unit | user input | conditional by transaction semantics | only applicable options shown |
| price_min | user input | optional source field | distinct minimum price input |
| price_max | user input | optional source field | distinct maximum price input |
| is_negotiable | user input | M03-compatible project/listing content | governed boolean/selection |
| property_type | user input | optional | governed selection |
| unit_availability | user input | optional | numeric/project availability field |
| bedrooms/bathrooms | user input | optional M03-compatible | numeric fields |
| land_area/building_area | user input | optional M03-compatible | preserve canonical names; source-compatible with M03 |
| floors/carport_capacity | user input | optional | property data |
| electrical_power/water_source/furnishing/year_built | user input | optional | property data |
| certificate_type/imb_status/certificate_transferred/dispute_free_declared | user input | source/legal semantics; dispute-free declaration required where Core requires it | structured legal section; validation as applicable |
| location/province_id/city_id/district_id/area_keyword | user input | city required; hierarchy preserved | dependent geographic selectors; no invented limits |
| latitude/longitude | user input | supplemental | optional map coordinate fields |
| commission_scheme/extra_commission | user input | optional | commercial/project context |
| is_exclusive_by_region | user input/source field | NOT NULL in current physical corroboration; MVP UI must not imply territory exclusivity | represent as governed project field only; no exclusivity feature implied |
| meta_title | user input/source metadata | optional | distinct from Listing title; source for controlled initialization |
| meta_description | user input/source metadata | optional | sole canonical initial source for Listing description |
| slug/developer_id/status/id/timestamps | generated/context/lifecycle/system | system-controlled | not ordinary form inputs |

## Project Media
- Photo
- Video
No brochure/pricelist in Project Media.

## Marketing Kit
- PDF brochure
- PDF pricelist
Separate governed resource.

## Create Listing boundary
M03 required Create Listing fields remain WIRE-02. WIRE-03 does not duplicate WhatsApp, Listing address, Listing publish, Listing refresh, quota, performance, or other M03 workflow fields merely because Project fields are compatible with Listing.
