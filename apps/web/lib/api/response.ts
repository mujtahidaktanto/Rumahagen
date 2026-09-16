// lib/api/response.ts
// Menutup D13-18 — skema response sukses seragam untuk semua endpoint:
//   { data: <payload>, meta?: { pagination?: ..., traceId } }
// D13-22 — semua response JSON pakai Content-Type: application/json; charset=utf-8.

import { NextResponse } from "next/server";
import type { PaginationMeta } from "./pagination";

export interface ApiSuccessBody<T> {
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    traceId: string; // D13-23 — traceability per-request
  };
}

export function jsonSuccess<T>(
  data: T,
  opts?: { status?: number; pagination?: PaginationMeta; traceId: string; headers?: HeadersInit },
) {
  const body: ApiSuccessBody<T> = {
    data,
    meta: { traceId: opts?.traceId ?? "unknown", ...(opts?.pagination ? { pagination: opts.pagination } : {}) },
  };

  return NextResponse.json(body, {
    status: opts?.status ?? 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(opts?.headers ?? {}),
    },
  });
}
