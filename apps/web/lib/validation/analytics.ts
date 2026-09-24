// lib/validation/analytics.ts
// Skema query untuk Dashboard Analytics Admin (docs/analytics/
// METRIC_DEFINITIONS_v1.md). Tanggal = tanggal kalender WIB (YYYY-MM-DD).
// Preset rentang (7/14/30 hari, bulan ini) diselesaikan di klien menjadi
// from/to -- API hanya mengenal rentang eksplisit.

import { z } from "zod";

const MAX_DAYS = 366;

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "Tanggal tidak valid");

const rangeShape = {
  from: dateString,
  to: dateString,
  compare: z.enum(["true", "false"]).optional(), // default true; dipakai lewat compareOf()
};

function rangeOk(v: { from: string; to: string }): boolean {
  const days = (Date.parse(`${v.to}T00:00:00Z`) - Date.parse(`${v.from}T00:00:00Z`)) / 86400000 + 1;
  return days >= 1 && days <= MAX_DAYS;
}
const rangeMessage = { message: `Rentang harus 1 sampai ${MAX_DAYS} hari dan 'from' tidak boleh setelah 'to'.` };

export const analyticsRangeQuerySchema = z.object(rangeShape).refine(rangeOk, rangeMessage);
export type AnalyticsRangeQuery = z.infer<typeof analyticsRangeQuerySchema>;

export const analyticsExportQuerySchema = z
  .object({ ...rangeShape, format: z.enum(["xlsx", "pdf"]) })
  .refine(rangeOk, rangeMessage);
export type AnalyticsExportQuery = z.infer<typeof analyticsExportQuerySchema>;

/** Perbandingan periode aktif kecuali eksplisit compare=false. */
export const compareOf = (q: { compare?: "true" | "false" | undefined }): boolean => q.compare !== "false";
