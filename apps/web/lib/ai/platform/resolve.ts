// lib/ai/platform/resolve.ts — pilih adapter dari ai_providers.api_style (kolom DB, migration
// 0174), BUKAN dari provider code seperti lib/ai/adapters.ts (resolveAdapter di sana cocokkan
// substring code untuk fitur AI Assistant Agent yang terpisah) -- enam provider platform berbagi
// tiga gaya API ini (lihat docs/platform-ai-spec.md "Adapter provider").
import { anthropicMessagesAdapter } from "./anthropic-messages";
import { openaiChatAdapter } from "./openai-chat";
import { openaiResponsesAdapter } from "./openai-responses";
import type { ProviderAdapter } from "./types";

export type ApiStyle = "openai_chat" | "openai_responses" | "anthropic_messages";

const ADAPTERS: Record<ApiStyle, ProviderAdapter> = {
  openai_chat: openaiChatAdapter,
  openai_responses: openaiResponsesAdapter,
  anthropic_messages: anthropicMessagesAdapter,
};

/** null bila api_style = 'none' (provider non-AI seperti Cloudinary) atau nilai tak dikenal. */
export function resolvePlatformAdapter(apiStyle: string): ProviderAdapter | null {
  return (ADAPTERS as Record<string, ProviderAdapter>)[apiStyle] ?? null;
}

export type { ProviderAdapter, GenerateInput, GenerateResult, AdapterError, AdapterErrorKind } from "./types";
export { AdapterCallError } from "./types";
