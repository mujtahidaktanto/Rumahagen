"use client";

// components/agent/AiConnectionRowActions.tsx — "Test Koneksi" (POST /ai-connections/{id}/test) dan "Putuskan" (DELETE /ai-connections/{id}, soft-disconnect) per baris di Koneksi AI Saya.
// Tanpa dialog konfirmasi (langsung, sesuai wireframe M13-Koneksi-AI) — router.refresh() setelah sukses supaya status/badge ambil data terbaru dari server.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiClientError, api } from "@/lib/api-client";

export function AiConnectionRowActions({ connectionId, canTest, canDisconnect }: { connectionId: string; canTest: boolean; canDisconnect: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"test" | "disconnect" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function test() {
    setBusy("test");
    setError(null);
    try {
      await api.post(`/ai-connections/${connectionId}/test`, undefined, { idempotency: true });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Test belum berhasil. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect() {
    setBusy("disconnect");
    setError(null);
    try {
      await api.delete(`/ai-connections/${connectionId}`, { idempotency: true });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil memutuskan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  if (!canTest && !canDisconnect) return null;

  return (
    <div className="flex flex-none flex-col items-end gap-1">
      <div className="flex gap-2">
        {canTest ? (
          <Button variant="secondary" size="sm" loading={busy === "test"} disabled={busy !== null && busy !== "test"} onClick={() => void test()}>
            Test Koneksi
          </Button>
        ) : null}
        {canDisconnect ? (
          <Button variant="secondary" size="sm" loading={busy === "disconnect"} disabled={busy !== null && busy !== "disconnect"} onClick={() => void disconnect()}>
            Putuskan
          </Button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-caption text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
