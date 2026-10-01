// lib/validation/ai-generate.ts — skema Zod untuk POST /ai/generate-description dan
// /ai/generate-meta-seo. "fields" = isian form SAAT INI dikirim klien (docs/ai-description-rules.md:
// "Tombol AI mengirim isi form saat ini dari semua step, termasuk yang belum disimpan") -- bukan
// dibaca ulang dari DB, supaya listing/project yang belum disimpan pun bisa dipakai.
import { z } from "zod";

export const generateDescriptionFieldsSchema = z.object({
  title: z.string().max(200).optional(),
  name: z.string().max(200).optional(),
  category: z.string().max(30).nullable().optional(),
  transaction_type: z.enum(["sale", "rent"]),
  property_type: z.string().max(30),
  price: z.number().positive().nullable().optional(),
  price_min: z.number().positive().nullable().optional(),
  price_max: z.number().positive().nullable().optional(),
  price_unit: z.string().max(20).nullable().optional(),
  is_negotiable: z.boolean().nullable().optional(),
  unit_availability: z.string().max(50).nullable().optional(),
  province_id: z.string().uuid().optional(),
  city_id: z.string().uuid().optional(),
  district_id: z.string().uuid().nullable().optional(),
  area_keyword: z.string().max(60).nullable().optional(),
  land_area: z.number().positive().nullable().optional(),
  building_area: z.number().positive().nullable().optional(),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  floors: z.number().int().min(0).nullable().optional(),
  carport_capacity: z.number().int().min(0).nullable().optional(),
  electrical_power: z.number().int().min(0).nullable().optional(),
  water_source: z.string().max(20).nullable().optional(),
  furnishing: z.string().max(20).nullable().optional(),
  year_built: z.number().int().nullable().optional(),
  certificate_type: z.string().max(20).nullable().optional(),
  certificate_transferred: z.boolean().nullable().optional(),
  imb_status: z.string().max(20).nullable().optional(),
  amenity_ids: z.array(z.string().uuid()).max(50).optional(),
  description: z.string().max(10_000).optional(),
  keunggulan_tambahan: z.string().max(1000).optional(),
});

export const generateDescriptionSchema = z.object({
  entity_type: z.enum(["listing", "developer_project"]),
  entity_id: z.string().uuid().nullable().optional(),
  mode: z.enum(["new", "improve"]),
  fields: generateDescriptionFieldsSchema,
});
export type GenerateDescriptionInput = z.infer<typeof generateDescriptionSchema>;

export const generateMetaSeoSchema = z.object({
  entity_type: z.enum(["listing", "developer_project"]),
  entity_id: z.string().uuid().nullable().optional(),
  fields: generateDescriptionFieldsSchema,
  current_description: z.string().max(10_000).optional(),
});
export type GenerateMetaSeoInput = z.infer<typeof generateMetaSeoSchema>;
