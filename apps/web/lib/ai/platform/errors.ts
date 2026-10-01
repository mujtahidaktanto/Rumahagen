// lib/ai/platform/errors.ts — klasifikasi error provider jadi AdapterError (pesan ramah ke UI,
// kind dipakai keputusan fallback di route). Aturan wajib (docs/platform-ai-spec.md "Keamanan API
// key"): pesan TERPOTONG maks 300 karakter dan TIDAK PERNAH menyalin header/body mentah (yang bisa
// memuat jejak key) -- hanya field "message"/"error" umum yang diekstrak dari body JSON provider.
import { AdapterCallError, type AdapterErrorKind } from "./types";

const MAX_MESSAGE = 300;

function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const err = b.error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const m = (err as Record<string, unknown>).message;
    if (typeof m === "string") return m;
  }
  if (typeof b.message === "string") return b.message;
  return null;
}

function truncate(s: string): string {
  return s.length > MAX_MESSAGE ? `${s.slice(0, MAX_MESSAGE - 1)}…` : s;
}

/** Klasifikasi dari status HTTP + body (lihat tabel pemetaan error di docs/platform-ai-spec.md). */
export function classifyHttpError(status: number, body: unknown): AdapterCallError {
  const raw = extractMessage(body) ?? `Provider merespons status ${status}.`;
  const lower = raw.toLowerCase();
  let kind: AdapterErrorKind;
  let message: string;

  if (status === 401) {
    kind = "auth";
    message = "API key tidak valid atau sudah dicabut.";
  } else if (status === 403) {
    kind = "forbidden";
    message = "Key ini tidak punya akses ke model atau fitur tersebut.";
  } else if (status === 404 || lower.includes("model not found") || lower.includes("does not exist") || lower.includes("model_not_found")) {
    kind = "model_not_found";
    message = "Model tidak ditemukan. Muat ulang daftar model dari provider.";
  } else if (status === 429) {
    kind = "rate_limit";
    message = "Batas pemakaian provider tercapai. Coba lagi nanti atau pakai provider cadangan.";
  } else if (status === 402 || lower.includes("credit") || lower.includes("billing") || lower.includes("quota")) {
    kind = "no_credit";
    message = "Kredit atau kuota habis. Isi ulang di dashboard provider.";
  } else if (status >= 500) {
    kind = "server";
    message = "Server provider sedang bermasalah.";
  } else if (status >= 400) {
    kind = "bad_request";
    message = truncate(raw);
  } else {
    kind = "unknown";
    message = truncate(raw);
  }

  return new AdapterCallError({ kind, status, message });
}

export function timeoutError(): AdapterCallError {
  return new AdapterCallError({ kind: "timeout", message: "Provider tidak merespons." });
}

export function unknownError(e: unknown): AdapterCallError {
  if (e instanceof AdapterCallError) return e;
  const message = e instanceof Error ? truncate(e.message) : "Terjadi kesalahan tak terduga saat memanggil provider.";
  return new AdapterCallError({ kind: "unknown", message });
}

const TIMEOUT_MS = 30_000;

/** fetch() dengan batas waktu 30 detik (AbortController) -- throw AdapterCallError{kind:'timeout'} bila lewat. */
export async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw timeoutError();
    throw unknownError(e);
  } finally {
    clearTimeout(timer);
  }
}

/** Ambil JSON body dengan aman; respons non-JSON (mis. halaman error HTML) jadi null, bukan melempar. */
export async function safeJson(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}
