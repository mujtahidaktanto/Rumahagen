// app/api/commercial/orders/route.ts
// API-178 POST /commercial/orders — Authenticated buyer/agent. `status`/
// `confirmed_at` selalu dipaksa 'pending'/NULL oleh trigger DB (0079). HARGA
// (amount, currency, promotion_id) dan commercial_snapshot dihitung server oleh
// trigger trg_price_commercial_order (0131/0142) dari addons.price atau subscription_plans.price_*; nilai placeholder
// di bawah hanya memenuhi NOT NULL dan SELALU ditimpa. Klien tidak mengirim harga.
// Tepat satu dari addon_id atau subscription_plan_id (paket langganan Pro). Langganan organisasi hanya untuk leader aktif organisasi aktif.

import crypto from "node:crypto";
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createCommercialOrderSchema } from "@/lib/validation/commercial-orders";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membuat order.");
  }

  const body = await validateJsonBody(ctx.request, createCommercialOrderSchema);
  const supabase = await createClient();

  if (body.subscription_plan_id) {
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("id, status, price_personal, price_organization")
      .eq("id", body.subscription_plan_id)
      .maybeSingle();
    if (planError) {
      throw planError;
    }
    if (!plan) {
      throw new ApiError("NOT_FOUND", "Paket langganan tidak ditemukan atau tidak aktif.");
    }
    const price = body.organization_id ? plan.price_organization : plan.price_personal;
    if (plan.status !== "active" || !(Number(price) > 0)) {
      throw new ApiError("CONFLICT", "Paket ini belum bisa dibeli (tidak aktif atau belum punya harga untuk cakupan ini).");
    }
  } else {
    const { data: addon, error: addonError } = await supabase
      .from("addons")
      .select("*")
      .eq("id", body.addon_id as string)
      .maybeSingle();

    if (addonError) {
      throw addonError;
    }
    if (!addon) {
      throw new ApiError("NOT_FOUND", "Addon tidak ditemukan atau tidak aktif.");
    }
    if (addon.status !== "active" || !(Number(addon.price) > 0)) {
      throw new ApiError("CONFLICT", "Addon ini belum bisa dibeli (tidak aktif atau belum punya harga).");
    }
  }

  const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  const { data, error } = await supabase
    .from("commercial_orders")
    .insert({
      order_number: orderNumber,
      user_id: ctx.userId,
      organization_id: body.organization_id ?? null,
      addon_id: body.addon_id ?? null,
      subscription_plan_id: body.subscription_plan_id ?? null,
      promotion_id: body.promotion_id ?? null,
      amount: 0, // placeholder, ditimpa trigger dengan harga server
      currency: "IDR", // placeholder, ditimpa trigger
      status: "pending",
      commercial_snapshot: {}, // placeholder, ditimpa trigger dengan snapshot server
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23514") {
      // Ditolak trigger harga (0131/0134/0142): promosi tidak berlaku, tidak layak, kuota habis, paket/organisasi tidak aktif. Pesan sudah berbahasa pengguna.
      throw new ApiError("VALIDATION_ERROR", error.message.replace(/^commercial_orders: /, ""));
    }
    if (error.code === "42501" && error.message?.startsWith("commercial_orders: ")) {
      // Mis. bukan leader organisasi saat membeli langganan organisasi, atau bukan anggota organisasi (0138).
      throw new ApiError("FORBIDDEN", error.message.replace(/^commercial_orders: /, ""));
    }
    throw error;
  }

  return { data, status: 201 };
});
