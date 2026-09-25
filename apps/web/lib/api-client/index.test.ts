// Uji api-client: envelope sukses/galat, Idempotency-Key, 401, 429 + Retry-After, galat jaringan, query string.
import { describe, expect, it, vi, beforeEach } from "vitest";
import { api, apiRequest, ApiClientError, configureApiClient, newIdempotencyKey } from "./index";

function reply(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

const onUnauthenticated = vi.fn();
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  onUnauthenticated.mockReset();
  fetchMock = vi.fn();
  configureApiClient({ baseUrl: "/api", onUnauthenticated, fetchImpl: fetchMock as unknown as typeof fetch });
});

describe("apiRequest", () => {
  it("membuka envelope sukses { data, meta }", async () => {
    fetchMock.mockResolvedValue(reply(200, { data: [{ id: "1" }], meta: { traceId: "t1", pagination: { limit: 20, offset: 0, total: 1, hasMore: false } } }));
    const res = await api.get<{ id: string }[]>("/ref-provinces", { q: "jawa", limit: 20, kosong: "", tidakAda: undefined });
    expect(res.data).toEqual([{ id: "1" }]);
    expect(res.meta?.pagination?.total).toBe(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/ref-provinces?q=jawa&limit=20");
    expect(init.credentials).toBe("same-origin");
    expect(init.method).toBe("GET");
  });

  it("mengirim badan JSON dan Idempotency-Key baru untuk idempotency: true", async () => {
    fetchMock.mockResolvedValue(reply(201, { data: { id: "x" } }));
    await api.post("/commercial/orders", { addon_id: "a" }, { idempotency: true });
    const init = fetchMock.mock.calls[0]![1];
    expect(init.body).toBe(JSON.stringify({ addon_id: "a" }));
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers["Idempotency-Key"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("memakai kunci yang diberikan agar percobaan ulang aksi yang sama membawa kunci sama", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(reply(200, { data: null }))); // Response baru tiap panggilan (badan hanya bisa dibaca sekali)
    const key = newIdempotencyKey();
    await api.post("/x", {}, { idempotency: key });
    await api.post("/x", {}, { idempotency: key });
    expect(fetchMock.mock.calls[0]![1].headers["Idempotency-Key"]).toBe(key);
    expect(fetchMock.mock.calls[1]![1].headers["Idempotency-Key"]).toBe(key);
  });

  it("memetakan galat server ke ApiClientError (kode, pesan, details, traceId)", async () => {
    fetchMock.mockResolvedValue(reply(422, { error: { code: "VALIDATION_ERROR", message: "Data tidak valid", details: { fieldErrors: { email: ["salah"] } } }, meta: { traceId: "t9" } }));
    const err = await apiRequest("/auth/register", { method: "POST", body: {} }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiClientError);
    expect(err).toMatchObject({ code: "VALIDATION_ERROR", status: 422, message: "Data tidak valid", traceId: "t9" });
    expect(err.details).toEqual({ fieldErrors: { email: ["salah"] } });
  });

  it("memanggil onUnauthenticated pada 401 dan tetap melempar galat", async () => {
    fetchMock.mockResolvedValue(reply(401, { error: { code: "UNAUTHENTICATED", message: "Login diperlukan" } }));
    await expect(api.get("/users/me")).rejects.toMatchObject({ code: "UNAUTHENTICATED", status: 401 });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it("membaca Retry-After pada 429 tanpa retry otomatis", async () => {
    fetchMock.mockResolvedValue(reply(429, { error: { code: "RATE_LIMITED", message: "Terlalu banyak permintaan" } }, { "Retry-After": "30" }));
    await expect(api.get("/x")).rejects.toMatchObject({ code: "RATE_LIMITED", retryAfterSeconds: 30 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("mengubah kegagalan fetch menjadi NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(api.get("/x")).rejects.toMatchObject({ code: "NETWORK_ERROR", status: 0 });
  });

  it("badan galat bukan JSON menjadi UNKNOWN_ERROR dengan status asli", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 }));
    await expect(api.get("/x")).rejects.toMatchObject({ code: "UNKNOWN_ERROR", status: 502 });
  });
});
