// lib/validation/courses.ts
// Skema Zod untuk Course + Course Lesson (M04 Learning Catalog, migration
// 0056). STEP11-B4 API-051/052/057/058/059.

import { z } from "zod";

export const courseCategoryEnum = z.enum(["sales_skill", "legal_regulasi", "produk_developer", "financial_kpr", "lainnya"]);
export const courseStatusEnum = z.enum(["draft", "pending_review", "published", "archived"]);

export const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  category: courseCategoryEnum.optional(),
  description: z.string().optional(),
  prerequisite_course_id: z.string().uuid().optional(),
  passing_grade: z.coerce.number().int().min(0).max(100).optional(),
  created_by: z.string().uuid().optional(),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: courseCategoryEnum.optional(),
  description: z.string().optional(),
  prerequisite_course_id: z.string().uuid().nullable().optional(),
  passing_grade: z.coerce.number().int().min(0).max(100).optional(),
});
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const courseStatusSchema = z.object({
  status: courseStatusEnum,
});

export const listCoursesQuerySchema = z.object({
  category: courseCategoryEnum.optional(),
  status: courseStatusEnum.optional(),
  owner: z.enum(["me"]).optional(),
  q: z.string().trim().max(100).optional(),
});

// Keputusan tinjauan kursus (migration 0136): menolak wajib menyertakan catatan.
export const courseReviewDecisionSchema = z
  .object({
    decision: z.enum(["approve", "reject"]),
    note: z.string().trim().max(2000).optional(),
  })
  .refine((v) => v.decision === "approve" || (v.note !== undefined && v.note.length > 0), {
    message: "Menolak pengajuan wajib menyertakan catatan.",
    path: ["note"],
  });

export const createCourseLessonSchema = z.object({
  title: z.string().max(200).optional(),
  content_type: z.enum(["video", "pdf", "slide"]).optional(),
  content_url: z.string().max(500).optional(),
  sort_order: z.coerce.number().int().optional(),
});
export type CreateCourseLessonInput = z.infer<typeof createCourseLessonSchema>;

export const updateCourseLessonSchema = createCourseLessonSchema.partial();
