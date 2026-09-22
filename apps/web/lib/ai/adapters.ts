// lib/ai/adapters.ts
// Adapter provider AI untuk POST /ai-assistant/chat (STEP11-B10 §3/§11):
// "Provider-specific payloads remain adapter/provider-internal" — kontrak
// route (lib/validation/ai-providers.ts: aiChatSchema, messages[] gaya
// OpenAI) tetap generik/provider-agnostic, translasi ke bentuk request/
// response asli tiap provider terjadi HANYA di sini.
//
// Tidak ada daftar provider kanonik di Core (ai_providers.code diisi bebas
// oleh Superadmin secara operasional, 0015) -- resolveAdapter() mencocokkan
// berdasarkan substring nama provider yang UMUM dipakai di industri
// (openai/anthropic/gemini), BUKAN mengarang data bisnis. Provider yang
// code-nya tidak cocok salah satu ini mengembalikan null -- route
// menolaknya dengan pesan jelas, bukan menebak/memaksakan salah satu
// adapter.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatAdapterInput {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  messages: ChatMessage[];
}

export interface ChatAdapterResult {
  content: string;
  model: string;
}

export class AiProviderCallError extends Error {
  constructor(
    public readonly providerCode: string,
    message: string,
  ) {
    super(message);
  }
}

async function callOpenAi(input: ChatAdapterInput): Promise<ChatAdapterResult> {
  const model = input.model || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: input.messages,
      max_tokens: input.maxTokens ?? 1024,
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new AiProviderCallError("openai", body?.error?.message || `OpenAI merespons status ${res.status}`);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new AiProviderCallError("openai", "Respons OpenAI tidak berisi konten pesan yang diharapkan.");
  }

  return { content, model: body?.model ?? model };
}

async function callAnthropic(input: ChatAdapterInput): Promise<ChatAdapterResult> {
  const model = input.model || "claude-3-5-haiku-20241022";
  const systemMessages = input.messages.filter((m) => m.role === "system").map((m) => m.content);
  const conversation = input.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: input.maxTokens ?? 1024,
      ...(systemMessages.length ? { system: systemMessages.join("\n\n") } : {}),
      messages: conversation,
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new AiProviderCallError("anthropic", body?.error?.message || `Anthropic merespons status ${res.status}`);
  }

  const content = body?.content?.[0]?.text;
  if (typeof content !== "string") {
    throw new AiProviderCallError("anthropic", "Respons Anthropic tidak berisi konten pesan yang diharapkan.");
  }

  return { content, model: body?.model ?? model };
}

async function callGemini(input: ChatAdapterInput): Promise<ChatAdapterResult> {
  // "gemini-flash-latest" (bukan versi berangka tetap seperti "gemini-1.5-flash")
  // -- dikonfirmasi lewat tes nyata (GET /v1beta/models) bahwa versi berangka
  // lama sudah di-retire Google per 2026-09; alias "-latest" dipakai sebagai
  // default supaya tidak basi lagi saat provider merilis versi baru.
  const model = input.model || "gemini-flash-latest";
  const systemMessages = input.messages.filter((m) => m.role === "system").map((m) => m.content);
  const contents = input.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      ...(systemMessages.length
        ? { systemInstruction: { parts: [{ text: systemMessages.join("\n\n") }] } }
        : {}),
      generationConfig: { maxOutputTokens: input.maxTokens ?? 1024 },
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new AiProviderCallError("gemini", body?.error?.message || `Gemini merespons status ${res.status}`);
  }

  const content = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof content !== "string") {
    throw new AiProviderCallError("gemini", "Respons Gemini tidak berisi konten pesan yang diharapkan.");
  }

  return { content, model };
}

export type ChatAdapter = (input: ChatAdapterInput) => Promise<ChatAdapterResult>;

export function resolveAdapter(providerCode: string): ChatAdapter | null {
  const code = providerCode.toLowerCase();
  if (code.includes("openai")) return callOpenAi;
  if (code.includes("anthropic") || code.includes("claude")) return callAnthropic;
  if (code.includes("gemini") || code.includes("google")) return callGemini;
  return null;
}
