// lib/validation/quizzes.ts
// Skema Zod untuk Quiz/Quiz Question/Quiz Option/Quiz Attempt (M04
// Learning Catalog, migration 0060). STEP11-B4 API-055/060.

import { z } from "zod";

export const createQuizSchema = z.object({
  title: z.string().max(200).optional(),
});
export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const createQuizQuestionSchema = z.object({
  question_text: z.string().min(1),
  question_type: z.enum(["single_choice", "multi_choice"]),
});
export type CreateQuizQuestionInput = z.infer<typeof createQuizQuestionSchema>;

export const createQuizOptionSchema = z.object({
  option_text: z.string().min(1).max(500),
  is_correct: z.boolean().optional(),
});
export type CreateQuizOptionInput = z.infer<typeof createQuizOptionSchema>;

// POST /quizzes/{id}/submit — jawaban per pertanyaan: satu question_id bisa
// punya 1 option_id (single_choice) atau banyak (multi_choice), jadi
// selected_option_ids selalu array supaya satu bentuk payload menangani
// keduanya (single_choice tinggal array beranggota 1).
export const submitQuizAttemptSchema = z.object({
  enrollment_id: z.string().uuid(),
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      selected_option_ids: z.array(z.string().uuid()).min(1),
    }),
  ).min(1),
});
export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;

// PUT — ubah kuis/soal/opsi (migration 0135: struktur terkunci setelah ada percobaan peserta; teks tetap bisa diperbaiki).
export const updateQuizSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),
});
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

export const updateQuizQuestionSchema = z.object({
  question_text: z.string().trim().min(1).optional(),
  question_type: z.enum(["single_choice", "multi_choice"]).optional(),
});
export type UpdateQuizQuestionInput = z.infer<typeof updateQuizQuestionSchema>;

export const updateQuizOptionSchema = z.object({
  option_text: z.string().trim().min(1).max(500).optional(),
  is_correct: z.boolean().optional(),
});
export type UpdateQuizOptionInput = z.infer<typeof updateQuizOptionSchema>;
