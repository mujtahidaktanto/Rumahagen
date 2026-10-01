// app/api/ai/generate-meta-seo/route.ts
// POST -- "Generate MetaSEO" (docs/ai-description-rules.md, prompt meta-seo.v1). TERPISAH dari
// generate-description: input deskripsi SAAT INI di form (bukan data properti penuh ulang) + maks
// 3 fakta kawasan dari cache, TANPA riset web baru -- biaya kecil. Aturan panjang/karakter BEDA
// dari deskripsi (lihat text-sanitizer.ts mode "seo").
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { generateMetaSeoSchema } from "@/lib/validation/ai-generate";
import { authorizeEntity, loadFeatureSettings, resolveModelConnection, resolveNames } from "@/lib/ai/platform/generate-context";
import { checkUsageLimits, estimateCostUsd, logAiUsage } from "@/lib/ai/platform/usage-limits";
import { filterBlockedSentences, stripContactInfo, type BlockedTerm } from "@/lib/ai/platform/content-filter";
import { applyMetaDescriptionSuffix, sanitizeSeoText } from "@/lib/ai/platform/text-sanitizer";
import { stripFooter } from "@/lib/ai/platform/footer";
import { buildDataFormBlock, type DescriptionWhitelistInput } from "@/lib/ai/platform/whitelist";
import { META_SEO_SYSTEM, buildMetaSeoUserPrompt, type MetaSeoAiResponse } from "@/lib/ai/platform/prompts/meta-seo.v1";
import { extractJsonBlock, metaSeoAiResponseSchema } from "@/lib/ai/platform/response-schemas";
import { resolvePlatformAdapter } from "@/lib/ai/platform/resolve";
import { AdapterCallError } from "@/lib/ai/platform/types";
import { decryptApiKey } from "@/lib/crypto/byok";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type MetaSeoResult = { ok: true; meta_title: string; meta_description: string; warnings: string[] } | { ok: false; error: { kind: string; message: string } };

const META_TITLE_MAX = 60;
const META_DESC_CORE_MIN = 108;
const META_DESC_CORE_MAX = 143;

async function loadBlockedTerms(): Promise<BlockedTerm[]> {
  const { data } = await createAdminClient().from("ai_blocked_terms").select("kind, value, match_type").eq("is_active", true).returns<{ kind: BlockedTerm["kind"]; value: string; match_type: BlockedTerm["matchType"] }[]>();
  return (data ?? []).map((t) => ({ kind: t.kind, value: t.value, matchType: t.match_type }));
}

async function loadAreaFactsBlock(cityId: string | undefined, areaKeywordRaw: string | null | undefined, districtName: string | null, limit: number): Promise<string> {
  if (!cityId) return "";
  const keyword = (areaKeywordRaw?.trim() || districtName || "").toLowerCase().replace(/\s+/g, " ").slice(0, 60);
  if (!keyword) return "";
  const { data } = await createAdminClient().from("area_insights").select("facts, status, expires_at").eq("city_id", cityId).eq("area_keyword_norm", keyword).maybeSingle<{ facts: unknown; status: string; expires_at: string }>();
  if (!data || data.status === "rejected" || new Date(data.expires_at) < new Date()) return "";
  const facts = (Array.isArray(data.facts) ? data.facts : []) as { id: string; kategori: string; teks: string }[];
  return facts
    .slice(0, limit)
    .map((f) => `${f.id} [${f.kategori}] ${f.teks}`)
    .join("\n");
}

function validateMetaOutput(title: string, descCore: string): string[] {
  const warnings: string[] = [];
  if (title.length > META_TITLE_MAX) warnings.push(`Meta title melebihi ${META_TITLE_MAX} karakter, dipotong.`);
  if (descCore.length < META_DESC_CORE_MIN || descCore.length > META_DESC_CORE_MAX) warnings.push("Panjang inti meta description di luar rentang ideal 108-143 karakter.");
  return warnings;
}

export const POST = withApiHandler<MetaSeoResult>({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, generateMetaSeoSchema);
  const supabase = await createClient();

  await authorizeEntity(supabase, ctx.userId, body.entity_type, body.entity_id);

  const feature = await loadFeatureSettings("meta_seo");
  if (!feature || !feature.isEnabled) throw new ApiError("CONFLICT", "Fitur Generate MetaSEO belum diaktifkan superadmin.", { code: "feature_unavailable" });

  const limitCheck = await checkUsageLimits("meta_seo", ctx.userId, feature);
  if (!limitCheck.ok) {
    throw new ApiError("RATE_LIMITED", limitCheck.reason === "burst" ? "Terlalu cepat. Tunggu sebentar." : "Batas pemakaian MetaSEO tercapai. Coba lagi nanti.");
  }

  const primary = await resolveModelConnection(feature.primaryModelId);
  if (!primary) throw new ApiError("CONFLICT", "Belum ada provider AI yang terhubung untuk fitur ini.", { code: "feature_unavailable" });
  const fallback = await resolveModelConnection(feature.fallbackModelId);

  const names = await resolveNames(ctx.userId, body.entity_type, body.fields);
  const terms = await loadBlockedTerms();

  const dataFormBlock = buildDataFormBlock({
    kind: body.entity_type === "listing" ? "listing" : "project",
    title: body.fields.title ?? null,
    name: body.fields.name ?? null,
    category: body.fields.category ?? null,
    transactionType: body.fields.transaction_type,
    propertyType: body.fields.property_type,
    price: body.fields.price ?? null,
    priceMin: body.fields.price_min ?? null,
    priceMax: body.fields.price_max ?? null,
    priceUnit: body.fields.price_unit ?? null,
    isNegotiable: body.fields.is_negotiable ?? null,
    unitAvailability: body.fields.unit_availability ?? null,
    provinceName: names.provinceName,
    cityName: names.cityName,
    districtName: names.districtName,
    areaKeyword: body.fields.area_keyword ?? null,
    landArea: body.fields.land_area ?? null,
    buildingArea: body.fields.building_area ?? null,
    bedrooms: body.fields.bedrooms ?? null,
    bathrooms: body.fields.bathrooms ?? null,
    floors: body.fields.floors ?? null,
    carportCapacity: body.fields.carport_capacity ?? null,
    electricalPower: body.fields.electrical_power ?? null,
    waterSource: body.fields.water_source ?? null,
    furnishing: body.fields.furnishing ?? null,
    yearBuilt: body.fields.year_built ?? null,
    certificateType: body.fields.certificate_type ?? null,
    certificateTransferred: body.fields.certificate_transferred ?? null,
    imbStatus: body.fields.imb_status ?? null,
    developerName: names.ownerName,
    amenities: names.amenityNames,
  } satisfies DescriptionWhitelistInput);

  const descriptionRaw = stripFooter(body.current_description ?? "");
  const descriptionClean = filterBlockedSentences(stripContactInfo(descriptionRaw), terms).clean;
  const areaFactsBlock = await loadAreaFactsBlock(body.fields.city_id, body.fields.area_keyword, names.districtName, 3);

  const userPrompt = buildMetaSeoUserPrompt({ kind: body.entity_type === "listing" ? "listing" : "project", dataFormBlock, description: descriptionClean || "(kosong)", areaFacts: areaFactsBlock });
  // Disalin ke const primitif supaya closure callModel() di bawah tidak bergantung pada TS menyempitkan `feature` lewat batas fungsi bersarang.
  const maxOutputTokens = feature.maxOutputTokens;
  const temperature = feature.temperature;

  async function callModel(model: NonNullable<typeof primary>): Promise<{ parsed: MetaSeoAiResponse; inputTokens: number | null; outputTokens: number | null; latencyMs: number }> {
    const adapter = resolvePlatformAdapter(model.apiStyle);
    if (!adapter) throw new AdapterCallError({ kind: "server", message: "Gaya API provider tidak dikenali." });
    const apiKey = decryptApiKey(model.encryptedApiKey);
    const start = Date.now();
    const result = await adapter.generate(model.baseUrl, apiKey, model.modelId, { system: META_SEO_SYSTEM, user: userPrompt, maxOutputTokens, temperature });
    const latencyMs = Date.now() - start;
    let parsed: MetaSeoAiResponse;
    try {
      parsed = metaSeoAiResponseSchema.parse(extractJsonBlock(result.text)) as MetaSeoAiResponse;
    } catch {
      const retry = await adapter.generate(model.baseUrl, apiKey, model.modelId, { system: `${META_SEO_SYSTEM}\n\nKembalikan JSON valid saja, sesuai skema.`, user: userPrompt, maxOutputTokens, temperature });
      parsed = metaSeoAiResponseSchema.parse(extractJsonBlock(retry.text)) as MetaSeoAiResponse;
    }
    return { parsed, inputTokens: result.inputTokens, outputTokens: result.outputTokens, latencyMs };
  }

  let modelUsed = primary;
  let wasFallback = false;
  let callResult: Awaited<ReturnType<typeof callModel>>;
  try {
    callResult = await callModel(primary);
  } catch (e) {
    const err = e instanceof AdapterCallError ? e : new AdapterCallError({ kind: "unknown", message: "Terjadi kesalahan tak terduga." });
    const recoverable = ["rate_limit", "server", "timeout", "no_credit", "model_not_found"].includes(err.kind);
    if (!recoverable || !fallback) {
      await logAiUsage({ featureCode: "meta_seo", userId: ctx.userId, providerCode: primary.providerCode, modelId: primary.modelId, entityType: body.entity_type, entityId: body.entity_id ?? null, wasFallback: false, status: "error", errorCode: err.kind });
      return { data: { ok: false, error: { kind: err.kind, message: err.message } } };
    }
    try {
      callResult = await callModel(fallback);
      modelUsed = fallback;
      wasFallback = true;
    } catch (e2) {
      const err2 = e2 instanceof AdapterCallError ? e2 : new AdapterCallError({ kind: "unknown", message: "Terjadi kesalahan tak terduga." });
      await logAiUsage({ featureCode: "meta_seo", userId: ctx.userId, providerCode: fallback.providerCode, modelId: fallback.modelId, entityType: body.entity_type, entityId: body.entity_id ?? null, wasFallback: true, status: "error", errorCode: err2.kind });
      return { data: { ok: false, error: { kind: err2.kind, message: err2.message } } };
    }
  }

  const { parsed } = callResult;
  let metaTitle = sanitizeSeoText(parsed.meta_title, "seo");
  if (metaTitle.length > META_TITLE_MAX) {
    const cut = metaTitle.slice(0, META_TITLE_MAX);
    const lastSpace = cut.lastIndexOf(" ");
    metaTitle = lastSpace > META_TITLE_MAX * 0.6 ? cut.slice(0, lastSpace) : cut;
  }
  let descCore = sanitizeSeoText(parsed.meta_description_inti, "seo");
  if (descCore.length > META_DESC_CORE_MAX) {
    const cut = descCore.slice(0, META_DESC_CORE_MAX);
    const lastSpace = cut.lastIndexOf(" ");
    descCore = lastSpace > META_DESC_CORE_MAX * 0.6 ? cut.slice(0, lastSpace) : cut;
  }
  const metaDescription = applyMetaDescriptionSuffix(descCore);
  const warnings = validateMetaOutput(parsed.meta_title, parsed.meta_description_inti);
  if (!descriptionClean) warnings.push("Buat deskripsi dulu agar meta lebih akurat.");

  const cost = estimateCostUsd(callResult.inputTokens, callResult.outputTokens, modelUsed.inputPricePerMtok, modelUsed.outputPricePerMtok);
  await logAiUsage({ featureCode: "meta_seo", userId: ctx.userId, providerCode: modelUsed.providerCode, modelId: modelUsed.modelId, entityType: body.entity_type, entityId: body.entity_id ?? null, wasFallback, status: "success", inputTokens: callResult.inputTokens, outputTokens: callResult.outputTokens, estCostUsd: cost, latencyMs: callResult.latencyMs });

  return { data: { ok: true, meta_title: metaTitle, meta_description: metaDescription, warnings } };
});
