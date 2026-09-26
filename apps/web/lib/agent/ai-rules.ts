// lib/agent/ai-rules.ts — aturan murni layar Koneksi AI dan AI Assistant (M13 BYOK): label/nada status dan billing, kelayakan aksi per baris koneksi, validasi formulir Tambah Koneksi.
// Kunci kedua Record status/billing persis nilai CHECK constraint agent_ai_connections.status (0016/0093) dan ai_providers.billing_type (0015) — jangan menambah nilai yang tidak ada di constraint.
import type { BadgeTone } from "@/components/ui/Badge";

export type AiConnectionStatus = "unverified" | "active" | "disconnected" | "invalid" | "disabled" | "revoked";
export type AiBillingType = "free_tier_ongoing" | "paid_only" | "trial_then_paid";

export const AI_CONNECTION_STATUS_LABEL: Record<AiConnectionStatus, string> = {
  unverified: "Belum Diverifikasi",
  active: "Aktif",
  disconnected: "Terputus",
  invalid: "Tidak Valid",
  disabled: "Dinonaktifkan Admin",
  revoked: "Dicabut",
};

export const AI_CONNECTION_STATUS_TONE: Record<AiConnectionStatus, BadgeTone> = {
  unverified: "warning",
  active: "success",
  disconnected: "neutral",
  invalid: "danger",
  disabled: "danger",
  revoked: "neutral",
};

export const AI_BILLING_LABEL: Record<AiBillingType, string> = {
  free_tier_ongoing: "Ada tingkat gratis",
  paid_only: "Berbayar",
  trial_then_paid: "Trial lalu berbayar",
};

/** "Test Koneksi" (POST /ai-connections/{id}/test) — endpoint juga menerima 'active' untuk uji ulang (0093), tapi tombol hanya ditampilkan untuk 'unverified' supaya tidak menyarankan menguji ulang koneksi yang sudah berjalan. */
export function canTestConnection(status: string): boolean {
  return status === "unverified";
}

/** "Putuskan" (DELETE /ai-connections/{id}, soft-disconnect) — hanya koneksi yang masih bisa dipakai/diuji milik sendiri. Bukan yang sudah disconnected/revoked (final) atau invalid/disabled (perlu rotate kunci atau tindakan admin, bukan disconnect biasa). */
export function canDisconnectConnection(status: string): boolean {
  return status === "active" || status === "unverified";
}

export type AddConnectionForm = { providerId: string; apiKey: string; publicIdentifier: string; secondaryKey: string };
export type AddConnectionErrors = Partial<Record<"providerId" | "apiKey", string>>;

export function validateAddConnection(f: AddConnectionForm): AddConnectionErrors {
  const errors: AddConnectionErrors = {};
  if (!f.providerId) errors.providerId = "Pilih provider AI dulu.";
  if (!f.apiKey.trim()) errors.apiKey = "API key wajib diisi.";
  return errors;
}

/** provider_id + api_key wajib; public_identifier/secondary_key (0080, provider multi-kredensial) opsional dan tidak dikirim bila kosong. */
export function toCreateConnectionPayload(f: AddConnectionForm): { provider_id: string; api_key: string; public_identifier?: string; secondary_key?: string } {
  const body: { provider_id: string; api_key: string; public_identifier?: string; secondary_key?: string } = {
    provider_id: f.providerId,
    api_key: f.apiKey.trim(),
  };
  if (f.publicIdentifier.trim()) body.public_identifier = f.publicIdentifier.trim();
  if (f.secondaryKey.trim()) body.secondary_key = f.secondaryKey.trim();
  return body;
}

export type AiModelOption = { value: string; label: string };

/**
 * Model yang bisa dipilih di AI Assistant, per keluarga provider — dicocokkan dengan cara yang sama seperti
 * resolveAdapter (lib/ai/adapters.ts): kode provider dicek substring "gemini"/"google", "openai", "anthropic"/"claude".
 * Provider tanpa adapter chat (mis. Cloudinary, dipakai untuk media bukan chat) mengembalikan array kosong — UI
 * menyembunyikan pemilih model untuk koneksi itu. Baris pertama tiap keluarga = default server bila `model` tidak
 * dikirim (lihat komentar default di masing-masing fungsi call* pada adapters.ts).
 */
export function aiModelOptionsFor(providerCode: string): AiModelOption[] {
  const code = providerCode.toLowerCase();
  if (code.includes("gemini") || code.includes("google")) {
    return [
      { value: "gemini-flash-latest", label: "Gemini Flash (bawaan — cepat, seimbang)" },
      { value: "gemini-flash-lite-latest", label: "Gemini Flash-Lite (paling hemat/cepat)" },
      { value: "gemini-pro-latest", label: "Gemini Pro (paling kuat)" },
    ];
  }
  if (code.includes("openai")) {
    return [
      { value: "gpt-4o-mini", label: "GPT-4o mini (bawaan — cepat, hemat)" },
      { value: "gpt-4o", label: "GPT-4o (paling kuat)" },
    ];
  }
  if (code.includes("anthropic") || code.includes("claude")) {
    return [
      { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (bawaan — cepat, hemat)" },
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (paling kuat)" },
    ];
  }
  return [];
}
