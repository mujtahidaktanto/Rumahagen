// app/api/ai/generate-description/route.ts
// POST -- "Bantu tulis deskripsi (AI)" (docs/ai-description-rules.md, prompt description.v3).
// Alur 3 tahap sesuai dokumen, TAHAP 1 (riset kawasan web) BELUM dibangun (lihat migration 0175
// catatan "Cakupan sengaja tidak disentuh") -- area_insights dipakai kalau sudah ada cache (dari
// panel Info Kawasan yang menyusul), kalau belum ada, deskripsi tetap dibuat TANPA fakta kawasan
// (docs: "Gagal atau timeout -> deskripsi tetap dibuat tanpa fakta kawasan" -- kondisi "belum ada
// cache sama sekali" diperlakukan sama). Generate TIDAK PERNAH menyimpan ke listings/
// developer_projects -- hasil cuma draft, agen/developer yang menekan Pakai lalu Simpan sendiri.
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { ApiError } from "@/lib/api/errors";
import { generateDescriptionSchema } from "@/lib/validation/ai-generate";
import { authorizeEntity, loadFeatureSettings, resolveModelConnection, resolveNames } from "@/lib/ai/platform/generate-context";
import { checkUsageLimits, estimateCostUsd, logAiUsage, remainingToday } from "@/lib/ai/platform/usage-limits";
import { filterBlockedSentences, stripContactInfo, type BlockedTerm } from "@/lib/ai/platform/content-filter";
import { checkNumberConsistency } from "@/lib/ai/platform/number-consistency";
import { applyFooter, stripFooter } from "@/lib/ai/platform/footer";
import { buildDataFormBlock, type DescriptionWhitelistInput } from "@/lib/ai/platform/whitelist";
import { DESCRIPTION_PROMPT_VERSION, DESCRIPTION_SYSTEM, buildDescriptionUserPrompt, type DescriptionAiResponse } from "@/lib/ai/platform/prompts/description.v3";
import { descriptionAiResponseSchema, extractJsonBlock } from "@/lib/ai/platform/response-schemas";
import { filterPureValidSuggestions, type RawSuggestion } from "@/lib/ai/platform/field-suggestions";
import { sanitizeSeoText } from "@/lib/ai/platform/text-sanitizer";
import { extractAreaSentences, findCopiedRun, loadReferenceCandidates, removeSentencesWithCopiedRuns } from "@/lib/ai/platform/reference-listings";
import { resolvePlatformAdapter } from "@/lib/ai/platform/resolve";
import { AdapterCallError } from "@/lib/ai/platform/types";
import { decryptApiKey } from "@/lib/crypto/byok";
import { FIELD_LIMITS, maxAiChars } from "@/lib/ai/platform/field-limits";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type GenerateResult = {
  ok: true;
  judul_saran: string | null;
  deskripsi: string;
  poin_unggulan: string[];
  poin_area: { id: string; teks: string }[];
  saran_field: RawSuggestion[];
  catatan_verifikasi: string[];
  usage: { remaining_today: number | null };
} | { ok: false; error: { kind: string; message: string } };

async function loadBlockedTerms(): Promise<BlockedTerm[]> {
  const { data } = await createAdminClient().from("ai_blocked_terms").select("kind, value, match_type").eq("is_active", true).returns<{ kind: BlockedTerm["kind"]; value: string; match_type: BlockedTerm["matchType"] }[]>();
  return (data ?? []).map((t) => ({ kind: t.kind, value: t.value, matchType: t.match_type }));
}

async function loadAreaFacts(cityId: string | undefined, areaKeywordRaw: string | null | undefined, districtName: string | null): Promise<{ block: string; facts: { id: string; kategori: string; teks: string; jarak_km: number | null; jarak_dari: string | null }[] }> {
  if (!cityId) return { block: "", facts: [] };
  const keyword = (areaKeywordRaw?.trim() || districtName || "").toLowerCase().replace(/\s+/g, " ").slice(0, 60);
  if (!keyword) return { block: "", facts: [] };
  const admin = createAdminClient();
  const { data } = await admin.from("area_insights").select("facts, status, expires_at").eq("city_id", cityId).eq("area_keyword_norm", keyword).maybeSingle<{ facts: unknown; status: string; expires_at: string }>();
  if (!data || data.status === "rejected" || new Date(data.expires_at) < new Date()) return { block: "", facts: [] };
  const facts = (Array.isArray(data.facts) ? data.facts : []) as { id: string; kategori: string; nama_tempat: string; teks: string; jarak_km: number | null; jarak_dari: string | null }[];
  const block = facts.map((f) => `${f.id} [${f.kategori}] ${f.teks}${f.jarak_km !== null ? ` · sekitar ${f.jarak_km} km dari ${f.jarak_dari ?? "kawasan"}` : ""}`).join("\n");
  return { block, facts };
}

function buildAgentText(mode: "new" | "improve", title: string | undefined, name: string | undefined, description: string | undefined, keunggulan: string | undefined, terms: BlockedTerm[]): { text: string; hadInjection: boolean } {
  const raw = [title ?? name, mode === "improve" ? stripFooter(description ?? "") : null, keunggulan].filter(Boolean).join("\n\n");
  const filtered = filterBlockedSentences(raw, terms);
  return { text: filtered.clean, hadInjection: filtered.removedSentences.length > 0 };
}

export const POST = withApiHandler<GenerateResult>({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, generateDescriptionSchema);
  const featureCode = body.entity_type === "listing" ? "listing_description" : "project_description";
  const supabase = await createClient();

  await authorizeEntity(supabase, ctx.userId, body.entity_type, body.entity_id);

  const feature = await loadFeatureSettings(featureCode);
  if (!feature || !feature.isEnabled) throw new ApiError("CONFLICT", "Fitur ini belum diaktifkan superadmin.", { code: "feature_unavailable" });

  const limitCheck = await checkUsageLimits(featureCode, ctx.userId, feature);
  if (!limitCheck.ok) {
    await logAiUsage({ featureCode, userId: ctx.userId, providerCode: "-", modelId: "-", entityType: body.entity_type, entityId: body.entity_id ?? null, wasFallback: false, status: "blocked", errorCode: limitCheck.reason });
    const messages: Record<string, string> = {
      per_user_daily: "Batas harian AI Anda sudah tercapai. Coba lagi besok.",
      global_daily: "Fitur AI sedang mencapai batas harian. Coba lagi besok.",
      budget: "Fitur AI sementara tidak tersedia.",
      burst: "Terlalu cepat. Tunggu sebentar.",
    };
    throw new ApiError("RATE_LIMITED", messages[limitCheck.reason] ?? "Batas pemakaian tercapai.");
  }

  const primary = await resolveModelConnection(feature.primaryModelId);
  if (!primary) throw new ApiError("CONFLICT", "Belum ada provider AI yang terhubung untuk fitur ini.", { code: "feature_unavailable" });
  const fallback = await resolveModelConnection(feature.fallbackModelId);

  const names = await resolveNames(ctx.userId, body.entity_type, body.fields);
  const terms = await loadBlockedTerms();
  const { text: agentText } = buildAgentText(body.mode, body.fields.title, body.fields.name, body.fields.description, body.fields.keunggulan_tambahan, terms);

  const dataFormInput: DescriptionWhitelistInput = {
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
  };
  const dataFormBlock = buildDataFormBlock(dataFormInput);

  const area = await loadAreaFacts(body.fields.city_id, body.fields.area_keyword, names.districtName);
  const refCandidates = body.fields.city_id ? await loadReferenceCandidates(body.fields.city_id, (body.fields.area_keyword?.trim() || names.districtName || "").toLowerCase().replace(/\s+/g, " ").slice(0, 60), body.fields.district_id ?? null, body.entity_id ?? null) : [];
  const areaSentences = extractAreaSentences(
    refCandidates.map((c) => ({ text: c.description, areaKeyword: body.fields.area_keyword ?? null, districtName: names.districtName })),
    8,
  );
  const referenceBlock = areaSentences.map((s, i) => `r${i + 1} ${s}`).join("\n");

  const maksJudul = maxAiChars(FIELD_LIMITS.title);
  const maksDeskripsi = maxAiChars(FIELD_LIMITS.description);
  const userPrompt = buildDescriptionUserPrompt({
    kind: dataFormInput.kind,
    mode: body.mode,
    dataFormBlock,
    agentText,
    areaFacts: area.block,
    referenceSentences: referenceBlock,
    maksKarakterJudul: maksJudul,
    maksKarakterDeskripsi: maksDeskripsi,
  });
  const systemPrompt = DESCRIPTION_SYSTEM.replace("{maks_karakter_deskripsi}", String(maksDeskripsi));
  // Disalin ke const primitif supaya closure callModel() di bawah tidak bergantung pada TS menyempitkan
  // `feature`/`primary` lewat batas fungsi bersarang (tidak konsisten -- lebih aman pakai nilai, bukan referensi objek nullable).
  const maxOutputTokens = feature.maxOutputTokens;
  const temperature = feature.temperature;

  async function callModel(model: NonNullable<typeof primary>): Promise<{ parsed: DescriptionAiResponse; inputTokens: number | null; outputTokens: number | null; latencyMs: number }> {
    const adapter = resolvePlatformAdapter(model.apiStyle);
    if (!adapter) throw new AdapterCallError({ kind: "server", message: "Gaya API provider tidak dikenali." });
    const apiKey = decryptApiKey(model.encryptedApiKey);
    const start = Date.now();
    const result = await adapter.generate(model.baseUrl, apiKey, model.modelId, { system: systemPrompt, user: userPrompt, maxOutputTokens, temperature });
    const latencyMs = Date.now() - start;
    let parsed: DescriptionAiResponse;
    try {
      parsed = descriptionAiResponseSchema.parse(extractJsonBlock(result.text)) as DescriptionAiResponse;
    } catch {
      // Satu kali coba ulang kalau JSON tidak valid -- docs "Parse JSON. Gagal parse -> satu kali coba ulang".
      try {
        const retry = await adapter.generate(model.baseUrl, apiKey, model.modelId, { system: `${systemPrompt}\n\nKembalikan JSON valid saja, sesuai skema.`, user: userPrompt, maxOutputTokens: maxOutputTokens, temperature: temperature });
        parsed = descriptionAiResponseSchema.parse(extractJsonBlock(retry.text)) as DescriptionAiResponse;
      } catch {
        throw new AdapterCallError({ kind: "server", message: "AI tidak bisa menghasilkan format yang valid. Coba lagi." });
      }
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
      await logAiUsage({ featureCode, userId: ctx.userId, providerCode: primary.providerCode, modelId: primary.modelId, entityType: body.entity_type, entityId: body.entity_id ?? null, wasFallback: false, status: "error", errorCode: err.kind });
      return { data: { ok: false, error: { kind: err.kind, message: err.message } } };
    }
    try {
      callResult = await callModel(fallback);
      modelUsed = fallback;
      wasFallback = true;
    } catch (e2) {
      const err2 = e2 instanceof AdapterCallError ? e2 : new AdapterCallError({ kind: "unknown", message: "Terjadi kesalahan tak terduga." });
      await logAiUsage({ featureCode, userId: ctx.userId, providerCode: fallback.providerCode, modelId: fallback.modelId, entityType: body.entity_type, entityId: body.entity_id ?? null, wasFallback: true, status: "error", errorCode: err2.kind });
      return { data: { ok: false, error: { kind: err2.kind, message: err2.message } } };
    }
  }

  let { parsed } = callResult;
  const catatan = [...parsed.catatan_verifikasi];

  // Penyaring output: pola injection/pesaing/kata terlarang -- buang kalimat yang kena, bukan tolak seluruh draft.
  let deskripsi = sanitizeSeoText(stripContactInfo(parsed.deskripsi), "description");
  const outputFilter = filterBlockedSentences(deskripsi, terms);
  deskripsi = outputFilter.clean;

  // Cek kemiripan dengan referensi (8 kata berurutan) -- percobaan kedua: buat ulang; masih kena: buang kalimatnya.
  if (areaSentences.length > 0 && findCopiedRun(deskripsi, areaSentences).length > 0) {
    try {
      const retryResult = await callModel(modelUsed);
      const retryDeskripsi = sanitizeSeoText(stripContactInfo(retryResult.parsed.deskripsi), "description");
      const retryFiltered = filterBlockedSentences(retryDeskripsi, terms).clean;
      if (findCopiedRun(retryFiltered, areaSentences).length > 0) {
        deskripsi = removeSentencesWithCopiedRuns(retryFiltered, areaSentences);
      } else {
        deskripsi = retryFiltered;
        parsed = retryResult.parsed;
      }
    } catch {
      deskripsi = removeSentencesWithCopiedRuns(deskripsi, areaSentences);
    }
  }

  // Cek konsistensi angka -- percobaan kedua: buat ulang; masih selisih: tolak draft.
  let mismatches = checkNumberConsistency(deskripsi, { bedrooms: body.fields.bedrooms ?? null, bathrooms: body.fields.bathrooms ?? null, landArea: body.fields.land_area ?? null, buildingArea: body.fields.building_area ?? null, electricalPower: body.fields.electrical_power ?? null });
  if (mismatches.length > 0) {
    try {
      const retryResult = await callModel(modelUsed);
      const retryDeskripsi = filterBlockedSentences(sanitizeSeoText(stripContactInfo(retryResult.parsed.deskripsi), "description"), terms).clean;
      mismatches = checkNumberConsistency(retryDeskripsi, { bedrooms: body.fields.bedrooms ?? null, bathrooms: body.fields.bathrooms ?? null, landArea: body.fields.land_area ?? null, buildingArea: body.fields.building_area ?? null, electricalPower: body.fields.electrical_power ?? null });
      if (mismatches.length === 0) {
        deskripsi = retryDeskripsi;
        parsed = retryResult.parsed;
      }
    } catch {
      // biarkan mismatches apa adanya, ditolak di bawah.
    }
  }
  if (mismatches.length > 0) {
    await logAiUsage({ featureCode, userId: ctx.userId, providerCode: modelUsed.providerCode, modelId: modelUsed.modelId, entityType: body.entity_type, entityId: body.entity_id ?? null, wasFallback, status: "error", errorCode: "number_mismatch" });
    return { data: { ok: false, error: { kind: "bad_request", message: "AI menghasilkan angka yang tidak sesuai. Silakan coba lagi." } } };
  }

  if (outputFilter.removedSentences.length > 0) catatan.push("Sebagian teks berisi perintah untuk AI diabaikan.");
  if (area.facts.length > 0) catatan.push("Fakta kawasan berasal dari web; pastikan masih sesuai.");

  // Panjang: potong ke batas 3/4 field (sudah termasuk penutup) -- di akhir kalimat terakhir yang muat.
  const footerPreview = applyFooter("", feature.footerTemplate ?? "Dipasarkan oleh {nama_agen} · RumahAgen", names.ownerName);
  const footerLen = footerPreview.length;
  const budget = Math.max(0, maksDeskripsi - footerLen);
  if (deskripsi.length > budget) {
    const cut = deskripsi.slice(0, budget);
    const lastStop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("!"), cut.lastIndexOf("\n"));
    deskripsi = lastStop > budget * 0.5 ? cut.slice(0, lastStop + 1) : cut;
  }
  deskripsi = applyFooter(deskripsi, feature.footerTemplate ?? "Dipasarkan oleh {nama_agen} · RumahAgen", names.ownerName);

  const judulSaran = body.entity_type === "listing" && parsed.judul_saran ? sanitizeSeoText(parsed.judul_saran, "description").slice(0, maksJudul) : null;

  // poin_area: hanya ID yang benar-benar ada di FAKTA_KAWASAN yang dikirim.
  const validFactIds = new Set(area.facts.map((f) => f.id));
  const poinArea = parsed.poin_area.filter((p) => validFactIds.has(p.id));

  const pureSuggestions = filterPureValidSuggestions(parsed.saran_field as RawSuggestion[], agentText);
  const dbValidatedSuggestions: RawSuggestion[] = [];
  for (const s of pureSuggestions) {
    if (s.field === "district_id") {
      if (body.fields.city_id && typeof s.nilai === "string") {
        const { data } = await createAdminClient().from("ref_districts").select("id").eq("city_id", body.fields.city_id).ilike("name", s.nilai).maybeSingle<{ id: string }>();
        if (data) dbValidatedSuggestions.push({ ...s, nilai: data.id });
      }
      continue;
    }
    if (s.field === "amenities") continue; // fasilitas disarankan via poin_unggulan, bukan saran_field terstruktur di v1 ini.
    dbValidatedSuggestions.push(s);
  }

  const cost = estimateCostUsd(callResult.inputTokens, callResult.outputTokens, modelUsed.inputPricePerMtok, modelUsed.outputPricePerMtok);
  await logAiUsage({ featureCode, userId: ctx.userId, providerCode: modelUsed.providerCode, modelId: modelUsed.modelId, entityType: body.entity_type, entityId: body.entity_id ?? null, wasFallback, status: "success", inputTokens: callResult.inputTokens, outputTokens: callResult.outputTokens, estCostUsd: cost, latencyMs: callResult.latencyMs, flags: outputFilter.removedSentences.length > 0 ? ["input_injection_removed"] : [] });

  const remaining = await remainingToday(featureCode, ctx.userId, feature.perUserDailyLimit);
  return { data: { ok: true, judul_saran: judulSaran, deskripsi, poin_unggulan: parsed.poin_unggulan, poin_area: poinArea, saran_field: dbValidatedSuggestions, catatan_verifikasi: catatan, usage: { remaining_today: remaining } } };
});
