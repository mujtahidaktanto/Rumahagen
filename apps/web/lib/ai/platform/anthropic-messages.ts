// lib/ai/platform/anthropic-messages.ts — adapter gaya "anthropic_messages" (Anthropic Claude --
// docs/platform-ai-spec.md "Adapter provider"). Header otentikasi beda dari dua adapter lain:
// x-api-key (bukan Authorization: Bearer) plus anthropic-version wajib.
import { classifyHttpError, fetchWithTimeout, safeJson, unknownError } from "./errors";
import type { GenerateInput, GenerateResult, ProviderAdapter } from "./types";

const ANTHROPIC_VERSION = "2023-06-01";

function headers(apiKey: string): Record<string, string> {
  return { "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION, "Content-Type": "application/json" };
}

async function validateKey(baseUrl: string, apiKey: string): Promise<void> {
  const res = await fetchWithTimeout(`${baseUrl}/models`, { method: "GET", headers: headers(apiKey) });
  if (!res.ok) throw classifyHttpError(res.status, await safeJson(res));
}

async function listModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const res = await fetchWithTimeout(`${baseUrl}/models`, { method: "GET", headers: headers(apiKey) });
  const body = await safeJson(res);
  if (!res.ok) throw classifyHttpError(res.status, body);
  const list = (body as { data?: { id?: string }[] } | null)?.data ?? [];
  return list.map((m) => m.id).filter((id): id is string => typeof id === "string");
}

async function generate(baseUrl: string, apiKey: string, model: string, input: GenerateInput): Promise<GenerateResult> {
  const res = await fetchWithTimeout(`${baseUrl}/messages`, {
    method: "POST",
    headers: headers(apiKey),
    body: JSON.stringify({
      model,
      system: input.system,
      messages: [{ role: "user", content: input.user }],
      max_tokens: input.maxOutputTokens,
      temperature: input.temperature,
    }),
  });
  const body = await safeJson(res);
  if (!res.ok) throw classifyHttpError(res.status, body);

  const b = body as { content?: { type?: string; text?: string }[]; usage?: { input_tokens?: number; output_tokens?: number } } | null;
  const text = (b?.content ?? [])
    .filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text)
    .join("");
  if (!text) throw unknownError(new Error("Respons provider tidak berisi konten pesan yang diharapkan."));
  return { text, inputTokens: b?.usage?.input_tokens ?? null, outputTokens: b?.usage?.output_tokens ?? null };
}

export const anthropicMessagesAdapter: ProviderAdapter = { validateKey, listModels, generate };
