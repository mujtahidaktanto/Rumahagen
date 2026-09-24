// lib/validation/commercial-promotions.ts
// Skema Zod untuk promosi M14 (admin). Promosi mengubah harga pesanan lewat benefit_configuration (migration 0131):
// tepat SATU dari percent_off (0 < n <= 100) atau amount_off (> 0). Aturan kelayakan (eligibility) dievaluasi server saat pesanan dibuat
// (migration 0134): kunci yang dikenal roles, first_purchase_only, max_redemptions, max_redemptions_per_user, min_list_price.
// CHECK yang sama ditegakkan database (migration 0133/0134). rule_configuration (0145) memuat aturan tambahan: max_discount_amount, applies_to,
// product_codes, days_of_week, time_from/time_to (WIB), new_user_within_days; dievaluasi server pada pesanan add-on dan paket.

import { z } from "zod";

export const promotionStatusEnum = z.enum(["draft", "active", "inactive", "expired"]);

// Role yang punya izin pembelian (m14.commercial_purchase_access.access).
export const promotionEligibleRoleEnum = z.enum(["agent", "developer_partner", "buyer", "manager", "admin", "superadmin"]);

const benefitSchema = z
  .object({
    percent_off: z.coerce.number().gt(0).lte(100).optional(),
    amount_off: z.coerce.number().gt(0).max(999999999999).optional(),
  })
  .strict()
  .refine((v) => (v.percent_off !== undefined) !== (v.amount_off !== undefined), {
    message: "Isi tepat satu: percent_off atau amount_off.",
  });

export const eligibilitySchema = z
  .object({
    roles: z.array(promotionEligibleRoleEnum).min(1).max(6).optional(),
    first_purchase_only: z.boolean().optional(),
    max_redemptions: z.coerce.number().int().min(1).max(1000000000).optional(),
    max_redemptions_per_user: z.coerce.number().int().min(1).max(1000000).optional(),
    min_list_price: z.coerce.number().gt(0).max(999999999999).optional(),
  })
  .strict();
export type PromotionEligibility = z.infer<typeof eligibilitySchema>;

// Aturan tambahan (migration 0145): batas potongan, cakupan pembeli, produk, hari/jam (WIB), dan pengguna baru.
const timeOfDay = z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Format jam HH:MM (00:00–23:59).");
export const ruleSchema = z
  .object({
    max_discount_amount: z.coerce.number().gt(0).max(999999999999).optional(),
    applies_to: z.enum(["personal", "organization"]).optional(),
    product_codes: z.array(z.string().trim().min(1).max(100)).min(1).max(50).optional(),
    days_of_week: z.array(z.number().int().min(1).max(7)).min(1).max(7).optional(),
    time_from: timeOfDay.optional(),
    time_to: timeOfDay.optional(),
    new_user_within_days: z.coerce.number().int().min(1).max(3650).optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if ((v.time_from === undefined) !== (v.time_to === undefined)) {
      ctx.addIssue({ code: "custom", path: ["time_to"], message: "Isi time_from dan time_to bersamaan." });
    } else if (v.time_from !== undefined && v.time_to !== undefined && v.time_from >= v.time_to) {
      ctx.addIssue({ code: "custom", path: ["time_to"], message: "time_to harus setelah time_from (tidak melewati tengah malam)." });
    }
    if (v.days_of_week && new Set(v.days_of_week).size !== v.days_of_week.length) {
      ctx.addIssue({ code: "custom", path: ["days_of_week"], message: "Hari tidak boleh ganda." });
    }
  });
export type PromotionRules = z.infer<typeof ruleSchema>;

const promotionBase = z.object({
  code: z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_.-]+$/, "Kode hanya huruf, angka, titik, garis bawah, dan strip."),
  name: z.string().trim().min(1).max(200),
  benefit: benefitSchema,
  eligibility: eligibilitySchema.optional(),
  valid_from: z.string().datetime({ offset: true }).nullable().optional(),
  valid_to: z.string().datetime({ offset: true }).nullable().optional(),
  rule_configuration: ruleSchema.optional(),
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

// PUT = form penuh (eligibility yang tidak dikirim dikosongkan); status diubah lewat PATCH /status.
export const updatePromotionSchema = promotionBase.superRefine(checkWindow);
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;

export const promotionStatusSchema = z.object({ status: promotionStatusEnum });

export const listPromotionsQuerySchema = z.object({
  status: promotionStatusEnum.optional(),
  q: z.string().trim().max(100).optional(),
});
