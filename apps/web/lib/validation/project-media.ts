// lib/validation/project-media.ts
// Skema Zod untuk Project Media (foto/video resmi developer project). Field
// persis mengikuti kolom `public.developer_project_media` di
// supabase/migrations/0034_m06_developer_projects.sql.

import { z } from "zod";

export const createProjectMediaSchema = z.object({
  type: z.enum(["photo", "video"]),
  url: z.string().min(1).max(500),
});
export type CreateProjectMediaInput = z.infer<typeof createProjectMediaSchema>;
