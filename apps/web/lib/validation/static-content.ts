// lib/validation/static-content.ts — skema Zod static_public_content (M11 Konten Publik, migration 0037). Lifecycle draft/published/unpublished/archived persis CHECK constraint;
// slug persis format yang dibaca /konten/[slug] (lib/public/content-data.ts).
import { z } from "zod";

const slug = z
  .string()
  .min(1)
  .max(220)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung (mis. syarat-ketentuan).");

export const staticContentSchema = z.object({
  title: z.string().min(1).max(200),
  slug,
  content: z.string().max(50000).optional(),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  canonical_url: z.string().url().max(500).optional(),
  indexability: z.enum(["index", "noindex"]).optional(),
  sitemap_participation: z.boolean().optional(),
  status: z.enum(["draft", "published", "unpublished", "archived"]).optional(),
});
export type StaticContentInput = z.infer<typeof staticContentSchema>;
