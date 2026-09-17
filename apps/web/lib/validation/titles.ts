// lib/validation/titles.ts
// Skema Zod untuk Title Definition + Title Authority/Scope Binding (M15,
// migration 0026). STEP11-B8 API-200-204 (titles) evidenced penuh;
// title-authority-scopes ADD-NEW (B8 F11-B8-001: "no dedicated exact
// endpoint evidenced", TAPI tabel+RLS title_authority_scopes_manage sudah
// lengkap sejak 0026 — dibangun sesuai instruksi "jalankan sesuai scope
// selama sudah di dokumen [migration]").

import { z } from "zod";

export const titleStatusEnum = z.enum(["draft", "active", "inactive", "retired"]);

export const createTitleSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: titleStatusEnum.optional(),
});
export type CreateTitleInput = z.infer<typeof createTitleSchema>;

export const updateTitleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
});
export type UpdateTitleInput = z.infer<typeof updateTitleSchema>;

export const titleStatusSchema = z.object({
  status: titleStatusEnum,
});
export type TitleStatusInput = z.infer<typeof titleStatusSchema>;

export const scopeStatusEnum = z.enum(["active", "inactive"]);

export const createTitleAuthorityScopeSchema = z.object({
  scope_type: z.string().min(1).max(100),
  scope_reference: z.string().optional(),
  status: scopeStatusEnum.optional(),
});
export type CreateTitleAuthorityScopeInput = z.infer<typeof createTitleAuthorityScopeSchema>;

export const updateTitleAuthorityScopeSchema = z.object({
  scope_type: z.string().min(1).max(100).optional(),
  scope_reference: z.string().optional(),
  status: scopeStatusEnum.optional(),
});
export type UpdateTitleAuthorityScopeInput = z.infer<typeof updateTitleAuthorityScopeSchema>;
