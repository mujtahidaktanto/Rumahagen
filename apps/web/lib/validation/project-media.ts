// lib/validation/project-media.ts
// Skema Zod untuk Project Media (foto/video resmi developer project). Field
// persis mengikuti kolom `public.developer_project_media` di
// supabase/migrations/0034_m06_developer_projects.sql.

import { z } from "zod";

export const createProjectMediaSchema = z.object({
  type: z.enum(["photo", "video"]),
  url: z
    .string()
    .min(1)
    .max(500)
    .refine((v) => /^https?:\/\//.test(v), { message: "Harus URL http(s); untuk file unggahan pakai file_url dari POST /developer-projects/{id}/uploads." }),
});
export type CreateProjectMediaInput = z.infer<typeof createProjectMediaSchema>;
