// lib/validation/course-enrollments.ts
// Skema Zod untuk ENROLLMENTS — Course Enrollment (M04 Learning Catalog,
// migration 0059), TERPISAH dari session_enrollments (M04 Session).
// STEP11-B4 API-053/054.

import { z } from "zod";

export const enrollmentProgressSchema = z.object({
  progress_percent: z.coerce.number().int().min(0).max(100).optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
});
export type EnrollmentProgressInput = z.infer<typeof enrollmentProgressSchema>;
