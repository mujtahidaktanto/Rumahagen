// lib/validation/developer-projects.ts
// Skema Zod untuk M06 Developer Project (STEP11-B3 API-116/117/118/119/121/122).
// Field persis mengikuti kolom `public.developer_projects` di
// supabase/migrations/0034_m06_developer_projects.sql.
//
// CATATAN SCOPE (baca sebelum menambah endpoint lain untuk M06): STEP11-B3
// v1.1 SECARA EKSPLISIT DAN BERULANG menyatakan "do not invent" untuk:
//   - Developer Partner self-service CRUD (F11-B3-001/013 — "/developer-partners"
//     CRUD, "OPEN CONTROLLED")
//   - Marketing Kit route apa pun (F11-B3-006 — "No route/table invention")
//   - Claim lifecycle route selain create (F11-B3-007 — "no invented lifecycle
//     routes"; hanya API-118 create yang evidenced)
//   - Project Media route (F11-B3-004 — "Do not use API-030-032 as Project
//     Media routes", tidak ada route Project Media lain yang evidenced)
//   - Approval Claim PDF Generate/View/Download (F11-B3-016)
// Berbeda dari M09 (banners/notification-templates) yang bahasa sumbernya
// "tidak evidenced" (netral), di sini bahasanya eksplisit "do not invent" —
// jadi batch ini SENGAJA hanya menutup 7 route yang benar-benar di-evidence
// (API-116, 117, 118, 119, 120, 121, 122), tidak lebih.

import { z } from "zod";

const propertyTypeEnum = z.enum(["rumah", "apartemen", "ruko", "tanah", "gudang", "kavling", "lainnya"]);
const priceUnitEnum = z.enum(["total", "per_bulan", "per_tahun"]);
const waterSourceEnum = z.enum(["pdam", "sumur", "lainnya"]);
const furnishingEnum = z.enum(["unfurnished", "semi_furnished", "fully_furnished"]);
const certificateTypeEnum = z.enum(["shm", "hgb", "girik", "ppjb", "strata_title", "lainnya"]);
const imbStatusEnum = z.enum(["ada", "tidak_ada", "dalam_proses"]);

// POST /admin/developer-projects (API-119) — nama route mengikuti kontrak
// evidenced apa adanya ("administrative Project creation"), TAPI callable
// bukan cuma Superadmin: RLS developer_projects_insert (0034) juga
// mengizinkan Developer Partner scope OWN membuat project miliknya sendiri
// (has_permission dicek lewat developer_id -> developer_partners.user_id) —
// tidak dibuat route path terpisah untuk "self-service" karena itu justru
// yang dilarang eksplisit di atas (menciptakan path baru yang tidak
// evidenced); RLS yang menentukan siapa boleh apa lewat SATU path yang sama.
export const createDeveloperProjectSchema = z.object({
  developer_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(220).optional(),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  category: z.enum(["primary", "secondary"]),
  transaction_type: z.enum(["sale", "rent"]),
  property_type: propertyTypeEnum.optional(),
  location: z.string().max(255).optional(),
  province_id: z.string().uuid(),
  city_id: z.string().uuid(),
  district_id: z.string().uuid(),
  area_keyword: z.string().max(20).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  price_min: z.coerce.number().nonnegative().optional(),
  price_max: z.coerce.number().nonnegative().optional(),
  price_unit: priceUnitEnum.optional(),
  is_negotiable: z.boolean().optional(),
  unit_availability: z.coerce.number().int().nonnegative().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  land_area: z.coerce.number().nonnegative().optional(),
  building_area: z.coerce.number().nonnegative().optional(),
  floors: z.coerce.number().int().nonnegative().optional(),
  carport_capacity: z.coerce.number().int().nonnegative().optional(),
  electrical_power: z.coerce.number().int().nonnegative().optional(),
  water_source: waterSourceEnum.optional(),
  furnishing: furnishingEnum.optional(),
  year_built: z.coerce.number().int().optional(),
  certificate_type: certificateTypeEnum.optional(),
  certificate_transferred: z.boolean().optional(),
  imb_status: imbStatusEnum.optional(),
  dispute_free_declared: z.boolean().optional(),
  commission_scheme: z.string().max(255).optional(),
  extra_commission: z.string().optional(),
  is_exclusive_by_region: z.boolean().optional(),
});
export type CreateDeveloperProjectInput = z.infer<typeof createDeveloperProjectSchema>;

// PUT /admin/developer-projects/{id} (API-121) — SATU route generic mencakup
// update biasa MAUPUN transisi status ke 'active' (publish/activate), sama
// seperti pola Event (0031/0039) — trigger enforce_developer_project_publish_permission
// (0034) yang menegakkan permission m06.developer_project.publish khusus
// untuk transisi itu, tidak diduplikasi di sini (R-02). STEP11-B3 F11-B3-015:
// "ordinary Project Update does not imply activation/publish" — ditegakkan
// fisik oleh trigger, bukan oleh pemisahan route.
export const updateDeveloperProjectSchema = createDeveloperProjectSchema
  .omit({ developer_id: true, slug: true })
  .partial()
  .extend({
    status: z.enum(["active", "coming_soon", "sold_out", "inactive"]).optional(),
  });
export type UpdateDeveloperProjectInput = z.infer<typeof updateDeveloperProjectSchema>;

export const listDeveloperProjectsQuerySchema = z.object({
  category: z.enum(["primary", "secondary"]).optional(),
  transaction_type: z.enum(["sale", "rent"]).optional(),
  province_id: z.string().uuid().optional(),
  city_id: z.string().uuid().optional(),
  district_id: z.string().uuid().optional(),
});
export type ListDeveloperProjectsQuery = z.infer<typeof listDeveloperProjectsQuerySchema>;
