// lib/validation/commercial-promotions.ts
// Skema Zod untuk promosi M14 (admin). Promosi mengubah harga pesanan lewat benefit_configuration (migration 0131):
// tepat SATU dari percent_off (0 < n <= 100) atau amount_off (> 0). CHECK yang sama ditegakkan database (migration 0133).
// rule_configuration/eligibility_configuration belum dievaluasi sistem, jadi API menolak isian tak kosong.

import { z } from "zod";

export const promotionStatusEnum = z.enum(["draft", "active", "inactive", "expired"]);

const benefitSchema = z
  .object({
    percent_off: z.coerce.number().gt(0).lte(100).optional(),
    amount_off: z.coerce.number().gt(0).max(999999999999).optional(),
  })
  .strict()
  .refine((v) => (v.percent_off !== undefined) !== (v.amount_off !== undefined), {
    message: "Isi tepat satu: percent_off atau amount_off.",
  });

const emptyObject = z
  .record(z.string(), z.unknown())
  .refine((v) => Object.keys(v).length === 0, { message: "Belum dievaluasi sistem; kosongkan." });

const promotionBase = z.object({
  code: z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_.-]+$/, "Kode hanya huruf, angka, titik, garis bawah, dan strip."),
  name: z.string().trim().min(1).max(200),
  benefit: benefitSchema,
  valid_from: z.string().datetime({ offset: true }).nullable().optional(),
  valid_to: z.string().datetime({ offset: true }).nullable().optional(),
  rule_configuration: emptyObject.optional(),
  eligibility_configuration: emptyObject.optional(),
});

type PromotionShape = z.infer<typeof promotionBase>;

function checkWindow(v: Pick<PromotionShape, "valid_from" | "valid_to">, ctx: z.RefinementCtx) {
  if (v.valid_from && v.valid_to && new Date(v.valid_to) <= new Date(v.valid_from)) {
    ctx.addIssue({ code: "custom", path: ["valid_to"], message: "Akhir masa berlaku harus setelah awal." });
  }
}

export const createPromotionSchema = promotionBase
  .extend({ status: promotionStatusEnum.optional() })
  .superRefine(checkWindow);
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;

// PUT = form penuh; status diubah lewat PATCH /status.
export const updatePromotionSchema = promotionBase.superRefine(checkWindow);
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;

export const promotionStatusSchema = z.object({ status: promotionStatusEnum });

export const listPromotionsQuerySchema = z.object({
  status: promotionStatusEnum.optional(),
  q: z.string().trim().max(100).optional(),
});
