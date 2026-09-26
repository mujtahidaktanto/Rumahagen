"use client";

// components/admin/CreateAiProviderDialog.tsx — "+ Tambah Provider" (Provider AI, Superadmin-only): POST /ai-providers.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { AI_BILLING_LABEL, type AiBillingType } from "@/lib/agent/ai-rules";
import { ApiClientError, api } from "@/lib/api-client";

const BILLING_OPTIONS: AiBillingType[] = ["free_tier_ongoing", "paid_only", "trial_then_paid"];

export function CreateAiProviderDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [billingType, setBillingType] = useState<AiBillingType>("free_tier_ongoing");
  const [setupUrl, setSetupUrl] = useState("");
  const [usageNote, setUsageNote] = useState("");
  const [requiresExpiryWarning, setRequiresExpiryWarning] = useState(false);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setCode("");
    setDisplayName("");
    setBillingType("free_tier_ongoing");
    setSetupUrl("");
    setUsageNote("");
    setRequiresExpiryWarning(false);
    setStatus("active");
    setError(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.post(
        "/ai-providers",
        {
          code: code.trim(),
          display_name: displayName.trim(),
          billing_type: billingType,
          setup_instructions_url: setupUrl.trim(),
          usage_terms_note: usageNote.trim() || undefined,
          requires_expiry_warning: requiresExpiryWarning,
          status,
        },
        { idempotency: true },
      );
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Provider belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const canSave = code.trim().length > 0 && displayName.trim().length > 0 && setupUrl.trim().length > 0;

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        + Tambah Provider
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Tambah Provider"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!canSave} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Kode (unik)" required hint="mis. gemini">
            {(a) => <Input {...a} value={code} onChange={(e) => setCode(e.target.value)} placeholder="mis. gemini" />}
          </Field>
          <Field label="Nama tampilan" required>
            {(a) => <Input {...a} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />}
          </Field>
          <Field label="Model billing">
            {(a) => (
              <Select {...a} value={billingType} onChange={(e) => setBillingType(e.target.value as AiBillingType)}>
                {BILLING_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {AI_BILLING_LABEL[b]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="URL panduan setup" required>
            {(a) => <Input {...a} value={setupUrl} onChange={(e) => setSetupUrl(e.target.value)} placeholder="https://…" />}
          </Field>
          <Field label="Catatan syarat pemakaian" hint="Opsional.">
            {(a) => <Textarea {...a} value={usageNote} onChange={(e) => setUsageNote(e.target.value)} />}
          </Field>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={requiresExpiryWarning} onChange={(e) => setRequiresExpiryWarning(e.target.checked)} />
            <span className="text-body-md">Butuh peringatan kedaluwarsa (requires_expiry_warning)</span>
          </label>
          <Field label="Status">
            {(a) => (
              <Select {...a} value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </Select>
            )}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
