// lib/validation/auth.ts
// Skema Zod untuk M01 Identity/Auth (STEP11-A/STEP11-B1, 10 endpoint terkunci:
// register/verify-otp/resend-otp/login/oauth google/refresh/logout/
// logout-all/forgot-password/reset-password). Sebelumnya gap penuh (0/10
// dibangun) -- lihat audit/CORE_DOCX_ZIP_VS_MIGRATED_BACKEND_AUDIT.md.
//
// Password minimal 8 karakter -- Core tidak mengunci kebijakan password
// spesifik (tidak ada aturan kompleksitas di STEP11-B1/STEP13-B), 8 dipakai
// sebagai minimum wajar sekaligus batas bawah default Supabase Auth sendiri.

import { z } from "zod";

const emailSchema = z.string().email().max(255);
const passwordSchema = z.string().min(8).max(72);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  email: emailSchema,
  token: z.string().min(6).max(8),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  email: emailSchema,
});
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});
export type LoginInput = z.infer<typeof loginSchema>;

// redirect_to boleh path relatif ("/dashboard") ATAU URL absolut -- diteruskan
// apa adanya ke app/api/auth/callback/route.ts yang me-resolve keduanya lewat
// `new URL(redirectTo, origin)`, jadi TIDAK divalidasi sebagai .url() murni.
export const oauthGoogleSchema = z.object({
  redirect_to: z.string().min(1).max(2048).optional(),
});
export type OauthGoogleInput = z.infer<typeof oauthGoogleSchema>;

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  redirect_to: z.string().min(1).max(2048).optional(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  new_password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
