// lib/api/content-type.ts
// Menutup D13-22 — konvensi Content-Type/Accept dibakukan satu tempat.
// Semua endpoint mutasi (POST/PATCH/PUT) WAJIB terima
// `Content-Type: application/json`; semua endpoint WAJIB bisa merespons
// `Accept: application/json` (satu-satunya format yang didukung saat ini).

import { ApiError } from "./errors";

export function assertJsonContentType(request: Request) {
  if (["POST", "PATCH", "PUT"].includes(request.method)) {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Content-Type harus application/json untuk request ini.",
      );
    }
  }
}
