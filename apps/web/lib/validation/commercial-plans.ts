// lib/validation/commercial-plans.ts
// Skema Zod untuk katalog paket langganan M14 (subscription_plans, migration 0142). Harga per cakupan (pribadi / organisasi) diisi staf dan
// menjadi satu-satunya sumber harga order langganan (dihitung server oleh trigger harga). code = subscriptions.product_code.

import { z } from "zod";

export const planStatusEnum = z.enum(["draft", "active", "inactive"]);

const price = z.coerce.number().positive().max(999999999999).nullable().optional();

const planBase = z.object({
  code: z.string().trim().min(1).max(100).regex(/^[a-z0-9_]+$/, "Kode hanya huruf kecil, angka, dan garis bawah."),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  duration_months: z.coerce.number().int().min(1).max(36),
  price_personal: price,
  price_organization: price,
  currency: z.string().length(3).optional(),
  promotion_id: z.string().uuid().nullable().optional(),
  status: planStatusEnum.optional(),
});

function checkPlan(v: { status?: string; price_personal?: number | null; price_organization?: number | null }, ctx: z.RefinementCtx) {
  if (v.status === "active" && v.price_personal == null && v.price_organization == null) {
    ctx.addIssue({ code: "custom", path: ["price_personal"], message: "Paket aktif wajib punya minimal satu harga (pribadi atau organisasi)." });
  }
}

export const createPlanSchema = planBase.superRefine(checkPlan);
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

// PUT: form penuh; status diubah lewat PATCH /status.
export const updatePlanSchema = planBase.omit({ status: true });
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

export const planStatusSchema = z.object({ status: planStatusEnum });
export const listPlansQuerySchema = z.object({ status: planStatusEnum.optional() });
