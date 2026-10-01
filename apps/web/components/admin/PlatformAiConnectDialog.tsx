"use client";

// components/admin/PlatformAiConnectDialog.tsx — modal "Hubungkan AI" / "Kelola" (Bagian 2,
// docs/platform-ai-spec.md "UI superadmin: tombol koneksi AI"), satu per kartu provider. Pilihan AI
// terkunci ke provider yang dibuka (modal dipicu dari kartunya sendiri). Alur: Tes Koneksi (opsional,
// tidak menyimpan apa pun) -> Simpan & Aktifkan (validasi + uji model + simpan sekaligus) -> Putus
// koneksi (mode Kelola saja). Key TIDAK PERNAH disimpan di state di luar komponen ini dan dikosongkan
// saat modal ditutup -- tidak ada localStorage/log konsol.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { ApiClientError, api } from "@/lib/api-client";
import type { PlatformProviderRow } from "@/lib/admin/platform-ai-data";
import { AI_BILLING_LABEL } from "@/lib/agent/ai-rules";
import { PLATFORM_MODEL_TIER_LABEL } from "@/lib/admin/platform-ai-rules";

type AdapterErrorShape = { kind: string; message: string };
type TestKeyResult = { ok: true; models: string[] } | { ok: false; error: AdapterErrorShape };
type SaveKeyResult = { ok: true; connection: { status: string; key_last4: string; latency_ms: number } } | { ok: false; error: AdapterErrorShape };

function keyFormatProblem(key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) return "API key wajib diisi.";
  if (/\s/.test(trimmed)) return "Format API key tidak valid.";
  if (trimmed.length < 20) return "Format API key tidak valid.";
  return null;
}

export function PlatformAiConnectDialog({ provider, trigger }: { provider: PlatformProviderRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isManage = provider.connection?.status === "active";
  const defaultModel = provider.models.find((m) => m.isDefault) ?? provider.models[0];

  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [modelId, setModelId] = useState(defaultModel?.id ?? "");
  const [busy, setBusy] = useState<"test" | "save" | "disconnect" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefixWarning, setPrefixWarning] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  function openDialog() {
    setApiKey("");
    setShowKey(false);
    setModelId(defaultModel?.id ?? "");
    setError(null);
    setPrefixWarning(null);
    setTestMessage(null);
    setSavedMessage(null);
    setOpen(true);
  }
  function closeDialog() {
    setApiKey("");
    setOpen(false);
  }

  function onKeyChange(v: string) {
    setApiKey(v);
    setError(null);
    setTestMessage(null);
    if (v.trim() && provider.keyPrefixHint && !v.trim().startsWith(provider.keyPrefixHint)) {
      setPrefixWarning(`Key ini tidak diawali ${provider.keyPrefixHint}. Pastikan Anda menyalin API key dari ${provider.displayName}, bukan dari langganan chat.`);
    } else {
      setPrefixWarning(null);
    }
  }

  async function testConnection() {
    const problem = keyFormatProblem(apiKey);
    if (problem) return setError(problem);
    setBusy("test");
    setError(null);
    setTestMessage(null);
    try {
      const res = await api.post<TestKeyResult>(`/admin/platform-ai-connections/${provider.code}/test-key`, { api_key: apiKey.trim() });
      if (res.data.ok) setTestMessage(`Key valid. ${res.data.models.length} model tersedia.`);
      else setError(res.data.error.message);
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Tes koneksi gagal. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function saveAndActivate() {
    const problem = isManage && !apiKey.trim() ? null : keyFormatProblem(apiKey);
    if (problem) return setError(problem);
    if (!modelId) return setError("Pilih model dulu.");
    if (isManage && !apiKey.trim()) {
      setError("Isi API key untuk mengganti koneksi, atau tutup modal ini bila tidak ingin mengubah apa pun.");
      return;
    }
    setBusy("save");
    setError(null);
    try {
      const res = await api.post<SaveKeyResult>(`/admin/platform-ai-connections/${provider.code}/save-key`, { api_key: apiKey.trim(), model_id: modelId }, { idempotency: true });
      if (res.data.ok) {
        const model = provider.models.find((m) => m.id === modelId);
        setSavedMessage(`Terhubung. ${model?.displayName ?? "Model"} merespons dalam ${(res.data.connection.latency_ms / 1000).toFixed(1)} detik.`);
        router.refresh();
        setTimeout(() => closeDialog(), 1200);
      } else {
        setError(res.data.error.message);
      }
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect() {
    setBusy("disconnect");
    setError(null);
    try {
      await api.post(`/admin/platform-ai-connections/${provider.code}/disconnect`, {}, { idempotency: true });
      setConfirmDisconnect(false);
      router.refresh();
      closeDialog();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil diputuskan. Coba lagi.");
      setConfirmDisconnect(false);
    } finally {
      setBusy(null);
    }
  }

  const grouped: Record<string, typeof provider.models> = { hemat: [], seimbang: [], kualitas: [] };
  for (const m of provider.models.filter((m) => m.status === "active")) grouped[m.tier]!.push(m);

  return (
    <>
      {trigger(openDialog)}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : closeDialog())}
        title={isManage ? `Kelola ${provider.displayName}` : `Hubungkan ${provider.displayName}`}
        footer={
          <>
            {isManage ? (
              <Button variant="secondary" className="text-danger-600" disabled={!!busy} onClick={() => setConfirmDisconnect(true)}>
                Putuskan Koneksi
              </Button>
            ) : null}
            <Button variant="secondary" disabled={!!busy} onClick={closeDialog}>
              Batal
            </Button>
            <Button variant="secondary" loading={busy === "test"} disabled={busy === "save"} onClick={() => void testConnection()}>
              Tes Koneksi
            </Button>
            <Button loading={busy === "save"} disabled={busy === "test"} onClick={() => void saveAndActivate()}>
              Simpan & Aktifkan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Pilihan AI">{(a) => <Input {...a} value={`${provider.displayName} — ${AI_BILLING_LABEL[provider.billingType]}`} disabled />}</Field>
          {provider.usageTermsNote ? <p className="text-caption">{provider.usageTermsNote}</p> : null}
          <a href={provider.setupInstructionsUrl} target="_blank" rel="noreferrer" className="text-caption text-blue-600 underline">
            Cara mendapatkan API key →
          </a>

          <Field label="Model" required>
            {(a) => (
              <Select {...a} value={modelId} onChange={(e) => setModelId(e.target.value)}>
                {(["kualitas", "seimbang", "hemat"] as const).map((tier) =>
                  grouped[tier]!.length === 0 ? null : (
                    <optgroup key={tier} label={PLATFORM_MODEL_TIER_LABEL[tier]}>
                      {grouped[tier]!.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.displayName}
                          {m.isFreeTier ? " · Gratis" : ""}
                          {m.isPreview ? " · Preview" : ""}
                        </option>
                      ))}
                    </optgroup>
                  ),
                )}
              </Select>
            )}
          </Field>

          <Field label="API Key" required={!isManage} hint={isManage ? `Key tersimpan: ••••${provider.connection?.keyLast4 ?? "----"}. Isi hanya jika ingin mengganti.` : undefined}>
            {(a) => (
              <div className="flex items-center gap-2">
                <Input {...a} type={showKey ? "text" : "password"} placeholder={`Tempel API key${provider.keyPrefixHint ? ` (biasanya diawali ${provider.keyPrefixHint}…)` : ""}`} value={apiKey} onChange={(e) => onKeyChange(e.target.value)} className="min-w-0 flex-1" />
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowKey((s) => !s)} aria-label={showKey ? "Sembunyikan key" : "Tampilkan key"}>
                  {showKey ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </Button>
              </div>
            )}
          </Field>
          {prefixWarning ? <p className="text-caption text-warning-600">{prefixWarning}</p> : null}

          {testMessage ? (
            <p role="status" className="text-body-md text-success-600">
              {testMessage}
            </p>
          ) : null}
          {savedMessage ? (
            <p role="status" className="text-body-md text-success-600">
              {savedMessage}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={confirmDisconnect}
        onClose={() => (busy ? undefined : setConfirmDisconnect(false))}
        title="Putuskan koneksi?"
        description={`Fitur yang memakai ${provider.displayName} akan beralih ke cadangan atau dinonaktifkan. Lanjutkan?`}
        footer={
          <>
            <Button variant="secondary" disabled={!!busy} onClick={() => setConfirmDisconnect(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy === "disconnect"} onClick={() => void disconnect()}>
              Ya, Putuskan
            </Button>
          </>
        }
      />
    </>
  );
}
