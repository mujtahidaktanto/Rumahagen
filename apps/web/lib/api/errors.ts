// lib/api/errors.ts
// Menutup D13-17 (status code dibakukan di satu tempat) & D13-18 (skema response
// error seragam). Semua route handler HARUS throw ApiError, bukan Response
// custom sendiri-sendiri — supaya bentuk error selalu sama di seluruh API.

export type ApiErrorCode =
  | "UNAUTHENTICATED"     // 401
  | "FORBIDDEN"           // 403 — dipakai saat has_permission() dari RLS/route gagal
  | "NOT_FOUND"           // 404
  | "VALIDATION_ERROR"    // 422
  | "CONFLICT"            // 409
  | "RATE_LIMITED"        // 429
  | "IDEMPOTENCY_MISMATCH"// 409 — key sama tapi payload beda
  | "INTERNAL_ERROR";     // 500

const STATUS_MAP: Record<ApiErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  IDEMPOTENCY_MISMATCH: 409,
  INTERNAL_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.status = STATUS_MAP[code];
    this.details = details;
  }
}

// Bentuk body error seragam untuk SEMUA endpoint (D13-18).
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export function errorBody(err: ApiError): ApiErrorBody {
  return {
    error: {
      code: err.code,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    },
  };
}
