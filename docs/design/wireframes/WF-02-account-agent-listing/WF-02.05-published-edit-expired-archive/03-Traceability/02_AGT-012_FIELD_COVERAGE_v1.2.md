# AGT-012 Core Field Coverage v1.2

| Core field | UX treatment | Required / conditional / dependency |
|---|---|---|
| listing_context | visible selector | required; Organization context conditional |
| category | editable selector | required |
| transaction_type | editable selector | required; drives dependent semantics |
| title | editable text | required; distinct from SEO meta_title |
| property_type | locked field | required semantic field; locked after first Publish |
| description | editable long text | optional; distinct from SEO meta_description |
| price | editable numeric/currency field | required |
| price_unit | conditional selector | transaction-dependent |
| is_negotiable | editable selector/toggle | required |
| address | locked field | required semantic field; locked after first Publish |
| province_id | location field | required; hierarchical |
| city_id | location field | required; depends on Province |
| district_id | location field | required; depends on City/Kabupaten |
| area_keyword | editable text | optional |
| latitude / longitude | optional map point | supplemental; address remains canonical |
| land_area | locked field | locked after first Publish |
| building_area | locked field | locked after first Publish |
| bedrooms | editable | optional unless authoritative rule makes required |
| bathrooms | editable | optional unless authoritative rule makes required |
| floors | editable | optional |
| carport_capacity | editable | optional |
| electrical_power | editable | optional |
| water_source | editable selector | optional |
| furnishing | editable selector | optional |
| year_built | editable | optional |
| amenities | structured selection/content | optional |
| certificate_type | editable where applicable | legal applicability |
| certificate_transferred | editable where applicable | legal applicability |
| imb_status | editable where applicable | legal applicability |
| dispute_free_declared | affirmation | required |
| whatsapp_number | editable | required |
| Listing photos/videos | media section | cover/order/alt-text semantics preserved |
| meta_title / meta_description | not conflated | SEO semantics remain distinct |
| id / slug / status / counters / timestamps / rejection_reason / last_refreshed_at | system/projection | not ordinary edit inputs |

## Coverage rule
A Core field is not required to be an editable control merely because it exists physically/logically. The wireframe must truthfully represent its user-facing semantic role, editability, requiredness, conditionality and dependencies.
