// lib/api/pagination.ts
// Menutup D13-19 — default & maksimum pagination + parameter filter standar,
// dipakai semua endpoint list/search, bukan didefinisikan ulang per route.

import { z } from "zod";
import { ApiError } from "./errors";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  offset: z.coerce.number().int().min(0).default(0),
});

export interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export function parsePagination(searchParams: URLSearchParams) {
  const parsed = paginationQuerySchema.safeParse({
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    throw new ApiError("VALIDATION_ERROR", "Parameter pagination tidak valid", parsed.error.flatten());
  }

  return parsed.data;
}

export function buildPaginationMeta(limit: number, offset: number, total: number): PaginationMeta {
  return { limit, offset, total, hasMore: offset + limit < total };
}
