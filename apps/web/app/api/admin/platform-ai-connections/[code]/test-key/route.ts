// app/api/admin/platform-ai-connections/[code]/test-key/route.ts
// POST { api_key } -- validasi key ke provider TANPA menyimpan apa pun (docs/platform-ai-spec.md
// "Function 1: platform-ai-admin" action test_key, diadaptasi jadi route REST biasa, bukan
// dispatcher action tunggal). Kegagalan provider (key salah, rate limit, dst.) dibalas 200
// { ok:false, error } -- bukan galat HTTP -- karena permintaan ke endpoint KITA berhasil, provider
// yang menolak. Superadmin-only; key tidak pernah ikut tersimpan di log/response selain 4 karakter
// terakhir yang memang sudah ada di body permintaan (tidak diulang di response).
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { requireSuperadmin } from "@/lib/api/require-superadmin";
import { testPlatformKeySchema } from "@/lib/validation/platform-ai";
import { loadPlatformProvider } from "@/lib/admin/platform-ai-connect";
import { AdapterCallError, type AdapterError } from "@/lib/ai/platform/types";
import { createClient } from "@/lib/supabase/server";

type TestKeyResult = { ok: true; models: string[] } | { ok: false; error: AdapterError };

export const POST = withApiHandler<TestKeyResult>({}, async (ctx) => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);
  const body = await validateJsonBody(ctx.request, testPlatformKeySchema);
  const provider = await loadPlatformProvider(supabase, ctx.params.code ?? "");

  try {
    await provider.adapter.validateKey(provider.baseUrl, body.api_key);
    const models = await provider.adapter.listModels(provider.baseUrl, body.api_key).catch(() => []);
    return { data: { ok: true, models } };
  } catch (e) {
    const err = e instanceof AdapterCallError ? e.toAdapterError() : { kind: "unknown" as const, message: "Terjadi kesalahan tak terduga saat menghubungi provider." };
    return { data: { ok: false, error: err } };
  }
});
