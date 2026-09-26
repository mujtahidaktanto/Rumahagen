import { describe, expect, it } from "vitest";
import { aiModelOptionsFor, canDisconnectConnection, canTestConnection, toCreateConnectionPayload, validateAddConnection } from "./ai-rules";

describe("canTestConnection", () => {
  it("hanya unverified", () => {
    expect(canTestConnection("unverified")).toBe(true);
    for (const s of ["active", "disconnected", "invalid", "disabled", "revoked"]) expect(canTestConnection(s)).toBe(false);
  });
});

describe("canDisconnectConnection", () => {
  it("active atau unverified", () => {
    expect(canDisconnectConnection("active")).toBe(true);
    expect(canDisconnectConnection("unverified")).toBe(true);
    for (const s of ["disconnected", "invalid", "disabled", "revoked"]) expect(canDisconnectConnection(s)).toBe(false);
  });
});

describe("validateAddConnection", () => {
  it("provider dan api key wajib", () => {
    expect(Object.keys(validateAddConnection({ providerId: "", apiKey: "", publicIdentifier: "", secondaryKey: "" })).sort()).toEqual(["apiKey", "providerId"]);
    expect(validateAddConnection({ providerId: "p1", apiKey: "sk-abc", publicIdentifier: "", secondaryKey: "" })).toEqual({});
    expect(validateAddConnection({ providerId: "p1", apiKey: "   ", publicIdentifier: "", secondaryKey: "" })).toEqual({ apiKey: "API key wajib diisi." });
  });
});

describe("toCreateConnectionPayload", () => {
  it("bidang opsional kosong tidak dikirim; dipangkas spasi", () => {
    expect(toCreateConnectionPayload({ providerId: "p1", apiKey: " sk-abc ", publicIdentifier: "", secondaryKey: "" })).toEqual({ provider_id: "p1", api_key: "sk-abc" });
    expect(toCreateConnectionPayload({ providerId: "p1", apiKey: "k", publicIdentifier: "cloud1", secondaryKey: "sec1" })).toEqual({
      provider_id: "p1",
      api_key: "k",
      public_identifier: "cloud1",
      secondary_key: "sec1",
    });
  });
});

describe("aiModelOptionsFor", () => {
  it("cocok per keluarga provider (case-insensitive), termasuk Flash-Lite", () => {
    expect(aiModelOptionsFor("gemini").map((m) => m.value)).toEqual(["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-pro-latest"]);
    expect(aiModelOptionsFor("Google Gemini")[0]?.value).toBe("gemini-flash-latest");
    expect(aiModelOptionsFor("openai")[0]?.value).toBe("gpt-4o-mini");
    expect(aiModelOptionsFor("anthropic-claude")[0]?.value).toBe("claude-3-5-haiku-20241022");
  });
  it("provider tanpa adapter chat (mis. cloudinary) tidak punya pilihan model", () => {
    expect(aiModelOptionsFor("cloudinary")).toEqual([]);
  });
});
