// lib/validation/listings.ts
// Skema Zod untuk M03 Listing (API-025-029, API-237 — STEP11-B2). Field persis
// mengikuti kolom `public.listings` di supabase/migrations/0018_m03_listings.sql
// — tidak menambah field yang tidak ada di skema DB.
//
// `agent_id` SENGAJA opsional di body create: kalau tidak dikirim, route
// default ke pemanggil sendiri (Agent bikin listing miliknya sendiri). Kalau
// dikirim beda dari pemanggil, RLS `listings_insert` (has_permission dengan
// scope 'own') yang menolak untuk Agent — hanya Superadmin/Admin/Manager
// (scope 'all') yang benar-benar bisa membuatkan listing untuk agent lain.
// Ini menegakkan R-02: keputusan akses tetap dari RLS, bukan dari validasi ini.

import { z } from "zod";

const propertyTypeEnum = z.enum([
  "rumah",
  "apartemen",
  "ruko",
  "tanah",
  "gudang",
  "kavling",
  "lainnya",
]);
const priceUnitEnum = z.enum(["total", "per_bulan", "per_tahun"]);
const waterSourceEnum = z.enum(["pdam", "sumur", "lainnya"]);
const furnishingEnum = z.enum(["unfurnished", "semi_furnished", "fully_furnished"]);
const certificateTypeEnum = z.enum(["shm", "hgb", "girik", "ppjb", "strata_title", "lainnya"]);
const imbStatusEnum = z.enum(["ada", "tidak_ada", "dalam_proses"]);

export const createListingSchema = z.object({
  agent_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  developer_project_id: z.string().uuid().optional(),
  listing_context: z.enum(["personal", "organization"]).optional(),
  category: z.enum(["primary", "secondary"]),
  transaction_type: z.enum(["sale", "rent"]),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(220).optional(), // kosong -> di-generate server dari title
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  description: z.string().optional(),
  property_type: propertyTypeEnum,
  price: z.coerce.number().positive(),
  price_unit: priceUnitEnum.optional(),
  is_negotiable: z.boolean().optional(),
  address: z.string().min(1).max(500),
  province_id: z.string().uuid(),
  city_id: z.string().uuid(),
  district_id: z.string().uuid(),
  area_keyword: z.string().max(20).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  land_area: z.coerce.number().nonnegative().optional(),
  building_area: z.coerce.number().nonnegative().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
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
  whatsapp_number: z.string().min(1).max(20),
});
export type CreateListingInput = z.infer<typeof createListingSchema>;

// Update biasa (API-027, PUT /listings/{id}) — TIDAK termasuk agent_id/status/
// slug/last_refreshed_at. Trigger trg_listing_lifecycle_rules (0018) yang
// menegakkan penguncian address/property_type/land_area/building_area
// setelah publish pertama secara fisik di DB — route ini tidak menduplikasi
// pengecekan itu, cukup meneruskan payload dan membiarkan DB menolak kalau
// melanggar (R-02: satu sumber aturan).
export const updateListingSchema = createListingSchema
  .omit({ agent_id: true, slug: true })
  .partial();
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

// PATCH /listings/{id}/status (API-028) — transisi lifecycle. `rejection_reason`
// hanya relevan untuk status 'rejected', tapi tidak dipaksa lewat refine() di
// sini supaya konsisten dengan pola CHECK constraint DB yang juga tidak
// mensyaratkan itu secara struktural.
export const listingStatusSchema = z.object({
  status: z.enum(["draft", "pending_review", "published", "sold", "rented", "expired", "rejected", "suspended"]),
  rejection_reason: z.string().optional(),
});
export type ListingStatusInput = z.infer<typeof listingStatusSchema>;

// PUT /admin/listings/{id}/reject — API-038 (M03 Admin Listing Review,
// STEP11-A, admin-surface gap #1). rejection_reason dipakai ulang dari
// kolom yang sudah ada (0018) -- tetap optional, sama seperti
// listingStatusSchema di atas.
export const rejectListingSchema = z.object({
  rejection_reason: z.string().max(1000).optional(),
});
export type RejectListingInput = z.infer<typeof rejectListingSchema>;

// GET /listings — filter dasar (bukan full geo-search seperti API-039
// properties/search yang butuh tabel/infra terpisah, di luar scope batch ini).
export const listListingsQuerySchema = z.object({
  category: z.enum(["primary", "secondary"]).optional(),
  transaction_type: z.enum(["sale", "rent"]).optional(),
  property_type: propertyTypeEnum.optional(),
  province_id: z.string().uuid().optional(),
  city_id: z.string().uuid().optional(),
  district_id: z.string().uuid().optional(),
  min_price: z.coerce.number().nonnegative().optional(),
  max_price: z.coerce.number().nonnegative().optional(),
});
export type ListListingsQuery = z.infer<typeof listListingsQuerySchema>;
