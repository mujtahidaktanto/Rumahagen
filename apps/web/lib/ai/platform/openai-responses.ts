// lib/ai/platform/openai-responses.ts — adapter gaya "openai_responses" (OpenAI GPT, model
// reasoning gpt-6-luna/gpt-6.1-sol -- docs/platform-ai-spec.md "Adapter provider"). BEDA dari
// lib/ai/adapters.ts (AI Assistant Agent) yang memakai /v1/chat/completions biasa -- model
// reasoning OpenAI terbaru butuh endpoint /v1/responses dengan parameter reasoning.effort, dan
// TIDAK menerima temperature sama sekali (dikirim -> 400). effort "none" khusus gpt-6-luna (model
// hemat, tanpa reasoning tambahan), "low" untuk model lain -- nama model dicek via substring karena
// katalog model (ai_models) tidak punya kolom terpisah untuk ini (keputusan: cukup aturan sederhana
// di kode, tidak perlu kolom DB baru untuk satu bit ini).
import { classifyHttpError, fetchWithTimeout, safeJson, unknownError } from "./errors";
import type { GenerateInput, GenerateResult, ProviderAdapter } from "./types";

async function validateKey(baseUrl: string, apiKey: string): Promise<void> {
  const res = await fetchWithTimeout(`${baseUrl}/models`, { method: "GET", headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw classifyHttpError(res.status, await safeJson(res));
}

async function listModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const res = await fetchWithTimeout(`${baseUrl}/models`, { method: "GET", headers: { Authorization: `Bearer ${apiKey}` } });
  const body = await safeJson(res);
  if (!res.ok) throw classifyHttpError(res.status, body);
  const list = (body as { data?: { id?: string }[] } | null)?.data ?? [];
  return list.map((m) => m.id).filter((id): id is string => typeof id === "string");
}

async function generate(baseUrl: string, apiKey: string, model: string, input: GenerateInput): Promise<GenerateResult> {
  const effort = model.includes("luna") ? "none" : "low";
  const res = await fetchWithTimeout(`${baseUrl}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: input.system,
      input: input.user,
      max_output_tokens: input.maxOutputTokens,
      reasoning: { effort },
    }),
  });
  const body = await safeJson(res);
  if (!res.ok) throw classifyHttpError(res.status, body);

  const b = body as { output?: { type?: string; content?: { type?: string; text?: string }[] }[]; usage?: { input_tokens?: number; output_tokens?: number }; status?: string } | null;
  const message = b?.output?.find((o) => o.type === "message");
  const text = message?.content?.find((c) => c.type === "output_text")?.text;
  if (typeof text !== "string") {
    const reason = b?.status === "incomplete" ? "Hasil terpotong karena batas token tercapai." : "Respons provider tidak berisi konten pesan yang diharapkan.";
    throw unknownError(new Error(reason));
  }
  return { text, inputTokens: b?.usage?.input_tokens ?? null, outputTokens: b?.usage?.output_tokens ?? null };
}

export const openaiResponsesAdapter: ProviderAdapter = { validateKey, listModels, generate };
