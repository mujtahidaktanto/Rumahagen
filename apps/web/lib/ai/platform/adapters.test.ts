// Uji adapter Koneksi AI Platform: ketiga gaya API (openai_chat, openai_responses,
// anthropic_messages) dengan fetch tiruan, plus pemetaan error dan kekhususan OpenRouter.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classifyHttpError } from "./errors";
import { AdapterCallError } from "./types";
import { openaiChatAdapter } from "./openai-chat";
import { openaiResponsesAdapter } from "./openai-responses";
import { anthropicMessagesAdapter } from "./anthropic-messages";
import { resolvePlatformAdapter } from "./resolve";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const INPUT = { system: "Anda penulis.", user: "Tulis sesuatu.", maxOutputTokens: 500, temperature: 0.6 };

describe("classifyHttpError", () => {
  it.each([
    [401, { error: { message: "bad key" } }, "auth"],
    [403, {}, "forbidden"],
    [404, {}, "model_not_found"],
    [429, {}, "rate_limit"],
    [402, {}, "no_credit"],
    [500, {}, "server"],
    [400, { error: { message: "invalid request" } }, "bad_request"],
  ])("status %i -> kind %s", (status, body, kind) => {
    const err = classifyHttpError(status as number, body);
    expect(err).toBeInstanceOf(AdapterCallError);
    expect(err.kind).toBe(kind);
    expect(err.status).toBe(status);
  });

  it("memotong pesan ke maksimal 300 karakter", () => {
    const err = classifyHttpError(400, { error: { message: "x".repeat(400) } });
    expect(err.message.length).toBeLessThanOrEqual(300);
  });

  it("mendeteksi kuota habis dari pesan, bukan hanya status 402", () => {
    const err = classifyHttpError(400, { error: { message: "You have exceeded your current quota" } });
    expect(err.kind).toBe("no_credit");
  });
});

describe("openaiChatAdapter", () => {
  it("generate: mengirim system+user, mengembalikan teks dan token", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { choices: [{ message: { content: "Halo dunia" } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }));
    const result = await openaiChatAdapter.generate("https://api.groq.com/openai/v1", "gsk_test", "openai/gpt-oss-120b", INPUT);
    expect(result).toEqual({ text: "Halo dunia", inputTokens: 10, outputTokens: 5 });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer gsk_test");
    const body = JSON.parse(init.body);
    expect(body.messages).toEqual([
      { role: "system", content: INPUT.system },
      { role: "user", content: INPUT.user },
    ]);
    expect(body.model).toBe("openai/gpt-oss-120b");
  });

  it("generate: melempar AdapterCallError saat key ditolak (401)", async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { error: { message: "invalid api key" } }));
    await expect(openaiChatAdapter.generate("https://api.groq.com/openai/v1", "bad", "m", INPUT)).rejects.toMatchObject({ kind: "auth" });
  });

  it("listModels: mengembalikan daftar id dari data[]", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: [{ id: "model-a" }, { id: "model-b" }] }));
    const models = await openaiChatAdapter.listModels("https://api.mistral.ai/v1", "key");
    expect(models).toEqual(["model-a", "model-b"]);
  });

  it("validateKey: provider biasa memanggil GET /models dengan Authorization Bearer", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: [] }));
    await openaiChatAdapter.validateKey("https://api.cerebras.ai/v1", "csk-test");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.cerebras.ai/v1/models");
    expect(init.headers.Authorization).toBe("Bearer csk-test");
  });

  it("validateKey: OpenRouter memakai GET /key (bukan /models) karena /models tidak butuh key", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: { limit: null } }));
    await openaiChatAdapter.validateKey("https://openrouter.ai/api/v1", "sk-or-test");
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://openrouter.ai/api/v1/key");
  });

  it("generate: OpenRouter menyertakan header HTTP-Referer dan X-Title", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { choices: [{ message: { content: "ok" } }] }));
    await openaiChatAdapter.generate("https://openrouter.ai/api/v1", "sk-or-test", "openrouter/free", INPUT);
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.headers["X-Title"]).toBe("RumahAgen");
    expect(init.headers["HTTP-Referer"]).toBeTruthy();
  });
});

describe("openaiResponsesAdapter", () => {
  it("generate: effort 'none' untuk model luna, tanpa temperature", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { output: [{ type: "message", content: [{ type: "output_text", text: "Jawaban" }] }], usage: { input_tokens: 20, output_tokens: 8 } }),
    );
    const result = await openaiResponsesAdapter.generate("https://api.openai.com/v1", "sk-test", "gpt-6-luna", INPUT);
    expect(result).toEqual({ text: "Jawaban", inputTokens: 20, outputTokens: 8 });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(init.body);
    expect(body.reasoning).toEqual({ effort: "none" });
    expect(body.temperature).toBeUndefined();
    expect(body.instructions).toBe(INPUT.system);
    expect(body.input).toBe(INPUT.user);
  });

  it("generate: effort 'low' untuk model non-luna", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { output: [{ type: "message", content: [{ type: "output_text", text: "x" }] }] }));
    await openaiResponsesAdapter.generate("https://api.openai.com/v1", "sk-test", "gpt-6.1-sol", INPUT);
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(body.reasoning).toEqual({ effort: "low" });
  });

  it("generate: status incomplete tanpa output_text melempar error dengan pesan jelas", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { output: [], status: "incomplete" }));
    await expect(openaiResponsesAdapter.generate("https://api.openai.com/v1", "sk-test", "gpt-6-luna", INPUT)).rejects.toThrow(/terpotong/i);
  });
});

describe("anthropicMessagesAdapter", () => {
  it("generate: header x-api-key dan anthropic-version, gabung blok teks", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { content: [{ type: "text", text: "Hal" }, { type: "text", text: "o" }], usage: { input_tokens: 12, output_tokens: 3 } }));
    const result = await anthropicMessagesAdapter.generate("https://api.anthropic.com/v1", "sk-ant-test", "claude-haiku-4-5-20251001", INPUT);
    expect(result).toEqual({ text: "Halo", inputTokens: 12, outputTokens: 3 });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers["x-api-key"]).toBe("sk-ant-test");
    expect(init.headers["anthropic-version"]).toBe("2023-06-01");
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("generate: melempar AdapterCallError no_credit saat kredit habis", async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { error: { message: "Your credit balance is too low" } }));
    await expect(anthropicMessagesAdapter.generate("https://api.anthropic.com/v1", "k", "m", INPUT)).rejects.toMatchObject({ kind: "no_credit" });
  });
});

describe("resolvePlatformAdapter", () => {
  it("memetakan ketiga api_style ke adapter yang benar", () => {
    expect(resolvePlatformAdapter("openai_chat")).toBe(openaiChatAdapter);
    expect(resolvePlatformAdapter("openai_responses")).toBe(openaiResponsesAdapter);
    expect(resolvePlatformAdapter("anthropic_messages")).toBe(anthropicMessagesAdapter);
  });

  it("mengembalikan null untuk 'none' atau nilai tak dikenal", () => {
    expect(resolvePlatformAdapter("none")).toBeNull();
    expect(resolvePlatformAdapter("unknown_style")).toBeNull();
  });
});
