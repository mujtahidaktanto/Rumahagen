// lib/admin/platform-ai-rules.ts — label murni untuk tab "Koneksi AI RumahAgen" (migration 0174).
// Kunci persis nilai CHECK constraint platform_ai_connections.status dan ai_models.tier.
import type { BadgeTone } from "@/components/ui/Badge";
import type { PlatformConnectionStatus, PlatformModelTier } from "./platform-ai-data";

export const PLATFORM_CONNECTION_STATUS_LABEL: Record<PlatformConnectionStatus, string> = {
  unverified: "Belum Diverifikasi",
  active: "Terhubung",
  invalid: "Gagal",
  disabled: "Belum Terhubung",
};

export const PLATFORM_CONNECTION_STATUS_TONE: Record<PlatformConnectionStatus, BadgeTone> = {
  unverified: "warning",
  active: "success",
  invalid: "danger",
  disabled: "neutral",
};

export const PLATFORM_MODEL_TIER_LABEL: Record<PlatformModelTier, string> = {
  hemat: "Hemat",
  seimbang: "Seimbang",
  kualitas: "Kualitas",
};
