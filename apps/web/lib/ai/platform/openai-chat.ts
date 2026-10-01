// lib/ai/platform/openai-chat.ts — adapter gaya "openai_chat" (Gemini, Groq, Cerebras, Mistral,
// OpenRouter -- lihat docs/platform-ai-spec.md "Adapter provider"). Semua lima provider berbagi
// implementasi ini lewat base_url berbeda (ai_providers.base_url); OpenRouter dikenali dari
// baseUrl (bukan parameter terpisah) untuk dua pengecualiannya: validasi key lewat GET /key
// (endpoint /models OpenRouter tidak butuh key sama sekali, jadi tidak memvalidasi apa pun), dan
// header HTTP-Referer/X-Title opsional yang mereka minta untuk atribusi aplikasi.
import { SITE_URL } from "@/lib/seo/sitemap";
import { classifyHttpError, fetchWithTimeout, safeJson, unknownError } from "./errors";
import type { GenerateInput, GenerateResult, ProviderAdapter } from "./types";

const isOpenRouter = (baseUrl: string) => baseUrl.includes("openrouter.ai");

function authHeaders(baseUrl: string, apiKey: string): Record<string, string> {
  const h: Record<string, string> = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  if (isOpenRouter(baseUrl)) {
    h["HTTP-Referer"] = SITE_URL;
    h["X-Title"] = "RumahAgen";
  }
  return h;
}

async function validateKey(baseUrl: string, apiKey: string): Promise<void> {
  const url = isOpenRouter(baseUrl) ? "https://openrouter.ai/api/v1/key" : `${baseUrl}/models`;
  const res = await fetchWithTimeout(url, { method: "GET", headers: authHeaders(baseUrl, apiKey) });
  if (!res.ok) throw classifyHttpError(res.status, await safeJson(res));
}

async function listModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const res = await fetchWithTimeout(`${baseUrl}/models`, { method: "GET", headers: authHeaders(baseUrl, apiKey) });
  const body = await safeJson(res);
  if (!res.ok) throw classifyHttpError(res.status, body);
  const list = (body as { data?: { id?: string }[] } | null)?.data ?? [];
  return list.map((m) => m.id).filter((id): id is string => typeof id === "string");
}

async function generate(baseUrl: string, apiKey: string, model: string, input: GenerateInput): Promise<GenerateResult> {
  const res = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: authHeaders(baseUrl, apiKey),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      max_tokens: input.maxOutputTokens,
      temperature: input.temperature,
    }),
  });
  const body = await safeJson(res);
  if (!res.ok) throw classifyHttpError(res.status, body);

  const b = body as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } } | null;
  const text = b?.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw unknownError(new Error("Respons provider tidak berisi konten pesan yang diharapkan."));
  return { text, inputTokens: b?.usage?.prompt_tokens ?? null, outputTokens: b?.usage?.completion_tokens ?? null };
}

export const openaiChatAdapter: ProviderAdapter = { validateKey, listModels, generate };
