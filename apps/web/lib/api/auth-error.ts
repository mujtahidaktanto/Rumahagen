// lib/api/auth-error.ts
// Satu tempat memetakan error Supabase Auth (AuthError/AuthApiError) ke
// ApiError seragam (R-02) -- dipakai oleh semua route M01 Auth supaya
// status/pesan konsisten, bukan di-mapping ulang berbeda-beda per route.

import { ApiError } from "./errors";

export function mapAuthError(error: { message: string } | null | undefined): never {
  const message = error?.message ?? "Autentikasi gagal.";
  const lower = message.toLowerCase();

  if (lower.includes("already registered") || lower.includes("already exists")) {
    throw new ApiError("CONFLICT", "Email sudah terdaftar.");
  }
  if (lower.includes("rate limit") || lower.includes("for security purposes")) {
    throw new ApiError("RATE_LIMITED", "Terlalu banyak percobaan, coba lagi nanti.");
  }
  if (lower.includes("invalid login credentials")) {
    throw new ApiError("UNAUTHENTICATED", "Email atau kata sandi salah.");
  }
  if (lower.includes("email not confirmed")) {
    throw new ApiError("FORBIDDEN", "Email belum diverifikasi.");
  }
  if (lower.includes("token has expired") || lower.includes("otp") || lower.includes("token is invalid")) {
    throw new ApiError("VALIDATION_ERROR", "Kode OTP salah atau sudah kedaluwarsa.");
  }
  if (lower.includes("email link") || lower.includes("session") || lower.includes("expired")) {
    throw new ApiError("VALIDATION_ERROR", "Tautan/sesi sudah tidak berlaku, minta ulang.");
  }

  throw new ApiError("VALIDATION_ERROR", message);
}
