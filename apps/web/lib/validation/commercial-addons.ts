// lib/validation/commercial-addons.ts
// Skema Zod untuk katalog add-on M14 (admin). Harga (addons.price) adalah satu-satunya sumber harga pesanan (migration 0131);
// aturan bentuk katalog (status, masa berlaku, jenis kapasitas) ditegakkan juga oleh CHECK di migration 0132.

import { z } from "zod";

export const addonStatusEnum = z.enum(["draft", "active", "inactive"]);
export const addonValidityTypeEnum = z.enum(["days", "unlimited"]);
// Hanya jenis yang benar-benar dikonsumsi sistem (0079/0081 dan refresh listing).
export const addonCapacityTypeEnum = z.enum(["listing_refresh", "learning_point", "listing_slot"]);

const capacitySchema = z.object({
  capacity_type: addonCapacityTypeEnum,
  capacity_value: z.coerce.number().positive(),
});

const addonBase = z.object({
  code: z.string().trim().min(1).max(100).regex(/^[A-Za-z0-9_.-]+$/, "Kode hanya huruf, angka, titik, garis bawah, dan strip."),
  name: z.string().trim().min(1).max(200),
  price: z.coerce.number().positive().max(999999999999).nullable().optional(),
  currency: z.string().length(3).optional(),
  validity_type: addonValidityTypeEnum,
  validity_days: z.coerce.number().int().positive().nullable().optional(),
  capacity_type: addonCapacityTypeEnum.nullable().optional(),
  capacity_value: z.coerce.number().positive().nullable().optional(),
  additional_capacities: z.array(capacitySchema).max(10).optional(),
  promotion_id: z.string().uuid().nullable().optional(),
  status: addonStatusEnum.optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
});

type AddonShape = z.infer<typeof addonBase>;

function checkAddon(v: Omit<AddonShape, "status"> & { status?: AddonShape["status"] }, ctx: z.RefinementCtx) {
  if (v.validity_type === "days" && !v.validity_days) {
    ctx.addIssue({ code: "custom", path: ["validity_days"], message: "Masa berlaku (hari) wajib untuk tipe 'days'." });
  }
  if (v.validity_type === "unlimited" && v.validity_days) {
    ctx.addIssue({ code: "custom", path: ["validity_days"], message: "Tipe 'unlimited' tidak memakai hari." });
  }
  if ((v.capacity_type == null) !== (v.capacity_value == null)) {
    ctx.addIssue({ code: "custom", path: ["capacity_value"], message: "Jenis dan nilai kapasitas harus diisi bersamaan." });
  }
  if (v.status === "active") {
    if (!(Number(v.price) > 0)) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Addon aktif wajib punya harga lebih dari 0." });
    }
    if (v.capacity_type == null) {
      ctx.addIssue({ code: "custom", path: ["capacity_type"], message: "Addon aktif wajib punya kapasitas." });
    }
  }
}

export const createAddonSchema = addonBase.superRefine(checkAddon);
export type CreateAddonInput = z.infer<typeof createAddonSchema>;

// PUT: form penuh dikirim lengkap; status diubah lewat PATCH /status.
export const updateAddonSchema = addonBase.omit({ status: true }).superRefine(checkAddon);
export type UpdateAddonInput = z.infer<typeof updateAddonSchema>;

export const addonStatusSchema = z.object({ status: addonStatusEnum });

export const listAddonsQuerySchema = z.object({
  status: addonStatusEnum.optional(),
  q: z.string().trim().max(100).optional(),
});
