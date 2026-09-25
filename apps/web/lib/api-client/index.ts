// lib/api-client/index.ts
// Klien API bertipe untuk kode BROWSER (komponen client). Semua mutasi dan pembacaan data aplikasi lewat /api/* (aturan CLAUDE.md), tidak pernah langsung ke Supabase.
// Kontrak server (lib/api/response.ts, errors.ts): sukses { data, meta?: { pagination?, traceId } }, galat { error: { code, message, details? } }.
//  - Cookie sesi Supabase dikirim otomatis (credentials: same-origin).
//  - 401 UNAUTHENTICATED -> `onUnauthenticated` (bawaan: arahkan ke /login?next=...; ganti lewat configureApiClient saat rute login final).
//  - 429 RATE_LIMITED -> galat dengan `retryAfterSeconds` dari header Retry-After; TIDAK ada retry otomatis (biarkan UI menampilkan pesan tunggu).
//  - Aksi yang mengubah uang, kuota, poin, atau status: `idempotency: true` membuat Idempotency-Key uuid BARU; untuk mengulang aksi yang sama (coba lagi setelah galat jaringan)
//    buat kunci sekali dengan newIdempotencyKey() dan berikan string yang sama pada setiap percobaan (kunci per aksi pengguna, bukan per percobaan).

import type { ApiErrorCode } from "@/lib/api/errors";
import type { PaginationMeta } from "@/lib/api/pagination";

/** Kode galat dari server ditambah dua kode sisi klien. */
export type ApiClientErrorCode = ApiErrorCode | "NETWORK_ERROR" | "UNKNOWN_ERROR";

export class ApiClientError extends Error {
  readonly code: ApiClientErrorCode;
  readonly status: number;
  readonly details?: unknown;
  readonly traceId?: string;
  /** Diisi untuk RATE_LIMITED bila server mengirim header Retry-After (detik). */
  readonly retryAfterSeconds?: number;

  constructor(init: { code: ApiClientErrorCode; message: string; status: number; details?: unknown; traceId?: string; retryAfterSeconds?: number }) {
    super(init.message);
    this.name = "ApiClientError";
    this.code = init.code;
    this.status = init.status;
    this.details = init.details;
    this.traceId = init.traceId;
    this.retryAfterSeconds = init.retryAfterSeconds;
  }
}

export interface ApiResult<T> {
  data: T;
  meta?: { pagination?: PaginationMeta; traceId?: string };
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Parameter query; nilai undefined/null/"" dilewati. */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Badan JSON. */
  body?: unknown;
  /** true = buat Idempotency-Key baru; string = pakai kunci yang diberikan (untuk mengulang aksi yang sama). */
  idempotency?: boolean | string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

interface ClientConfig {
  baseUrl: string;
  onUnauthenticated: () => void;
  fetchImpl?: typeof fetch;
}

const config: ClientConfig = {
  baseUrl: "/api",
  onUnauthenticated: () => {
    if (typeof window === "undefined") return;
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?next=${next}`);
  },
};

export function configureApiClient(partial: Partial<ClientConfig>) {
  Object.assign(config, partial);
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

function buildUrl(path: string, query?: ApiRequestOptions["query"]): string {
  const base = `${config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResult<T>> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json", ...(options.headers ?? {}) };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.idempotency) headers["Idempotency-Key"] = typeof options.idempotency === "string" ? options.idempotency : newIdempotencyKey();

  const doFetch = config.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await doFetch(buildUrl(path, options.query), {
      method,
      headers,
      credentials: "same-origin",
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });
  } catch (cause) {
    if (options.signal?.aborted) throw cause; // pembatalan oleh pemanggil bukan galat jaringan
    throw new ApiClientError({ code: "NETWORK_ERROR", message: "Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.", status: 0, details: cause });
  }

  let json: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (res.ok) {
    const body = (json ?? {}) as { data?: T; meta?: ApiResult<T>["meta"] };
    return { data: body.data as T, meta: body.meta };
  }

  const errBody = (json as { error?: { code?: ApiErrorCode; message?: string; details?: unknown }; meta?: { traceId?: string } } | null) ?? null;
  const code: ApiClientErrorCode = errBody?.error?.code ?? "UNKNOWN_ERROR";
  const retryAfter = Number(res.headers.get("Retry-After"));
  const error = new ApiClientError({
    code,
    message: errBody?.error?.message ?? "Terjadi kesalahan tak terduga.",
    status: res.status,
    details: errBody?.error?.details,
    traceId: errBody?.meta?.traceId,
    retryAfterSeconds: code === "RATE_LIMITED" && Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
  });
  if (code === "UNAUTHENTICATED") config.onUnauthenticated();
  throw error;
}

export const api = {
  get: <T>(path: string, query?: ApiRequestOptions["query"], opts?: Omit<ApiRequestOptions, "method" | "query" | "body">) => apiRequest<T>(path, { ...opts, method: "GET", query }),
  post: <T>(path: string, body?: unknown, opts?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<ApiRequestOptions, "method" | "body">) => apiRequest<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: Omit<ApiRequestOptions, "method">) => apiRequest<T>(path, { ...opts, method: "DELETE" }),
};
