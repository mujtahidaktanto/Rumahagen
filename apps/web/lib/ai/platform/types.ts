// lib/ai/platform/types.ts — kontrak adapter Koneksi AI Platform (migration 0174, M13).
// Modul TERPISAH dari lib/ai/adapters.ts (dipakai POST /ai-assistant/chat, BYOK Agent) --
// kebutuhan beda: di sini perlu validateKey/listModels/generate terpisah (dipakai tombol
// Tes Koneksi/Muat Model/Simpan berbeda-beda di UI superadmin), hitungan token (ai_usage_logs),
// dan AdapterError terklasifikasi (pesan ramah ke UI + keputusan fallback). Satu adapter per
// ai_providers.api_style ('openai_chat'/'openai_responses'/'anthropic_messages'), BUKAN per
// provider code -- supaya Groq/Cerebras/Mistral/OpenRouter (semua 'openai_chat') berbagi satu
// implementasi lewat base_url yang berbeda, bukan diduplikasi 6 adapter terpisah.

export type GenerateInput = {
  system: string;
  user: string;
  maxOutputTokens: number;
  temperature: number;
};

export type GenerateResult = {
  text: string;
  inputTokens: number | null;
  outputTokens: number | null;
};

export type AdapterErrorKind = "auth" | "forbidden" | "model_not_found" | "rate_limit" | "no_credit" | "timeout" | "server" | "bad_request" | "unknown";

// message SUDAH dipotong maks 300 karakter dan TIDAK PERNAH berisi header/kredensial --
// ditegakkan di errors.ts (classifyError), bukan tanggung jawab tiap adapter.
export type AdapterError = { kind: AdapterErrorKind; status?: number; message: string };

export class AdapterCallError extends Error {
  readonly kind: AdapterErrorKind;
  readonly status?: number;
  constructor(err: AdapterError) {
    super(err.message);
    this.kind = err.kind;
    this.status = err.status;
  }
  toAdapterError(): AdapterError {
    return { kind: this.kind, status: this.status, message: this.message };
  }
}

export interface ProviderAdapter {
  /** Lempar AdapterCallError bila key tidak valid; tidak mengembalikan apa pun bila valid. */
  validateKey(baseUrl: string, apiKey: string): Promise<void>;
  listModels(baseUrl: string, apiKey: string): Promise<string[]>;
  generate(baseUrl: string, apiKey: string, model: string, input: GenerateInput): Promise<GenerateResult>;
}
