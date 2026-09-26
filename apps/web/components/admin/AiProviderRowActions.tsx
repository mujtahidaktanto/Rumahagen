"use client";

// components/admin/AiProviderRowActions.tsx — "Edit" per baris Provider AI (Superadmin-only): PUT /ai-providers/{id}. `code` tidak bisa diubah (updateAiProviderSchema.omit({code}))
// — ditampilkan baca-saja di dialog, tidak dikirim di body.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { AiProviderAdminRow } from "@/lib/admin/ai-provider-admin-data";
import { AI_BILLING_LABEL, type AiBillingType } from "@/lib/agent/ai-rules";
import { ApiClientError, api } from "@/lib/api-client";

const BILLING_OPTIONS: AiBillingType[] = ["free_tier_ongoing", "paid_only", "trial_then_paid"];

export function AiProviderRowActions({ provider }: { provider: AiProviderAdminRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(provider.displayName);
  const [billingType, setBillingType] = useState(provider.billingType);
  const [setupUrl, setSetupUrl] = useState(provider.setupInstructionsUrl);
  const [usageNote, setUsageNote] = useState(provider.usageTermsNote ?? "");
  const [requiresExpiryWarning, setRequiresExpiryWarning] = useState(provider.requiresExpiryWarning);
  const [status, setStatus] = useState(provider.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setDisplayName(provider.displayName);
    setBillingType(provider.billingType);
    setSetupUrl(provider.setupInstructionsUrl);
    setUsageNote(provider.usageTermsNote ?? "");
    setRequiresExpiryWarning(provider.requiresExpiryWarning);
    setStatus(provider.status);
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put(
        `/ai-providers/${provider.id}`,
        {
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
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={openDialog}>
        Edit
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Edit — ${provider.displayName}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={displayName.trim().length === 0 || setupUrl.trim().length === 0} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Kode" hint="Tidak bisa diubah setelah dibuat.">
            {(a) => <Input {...a} value={provider.code} disabled readOnly />}
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
            {(a) => <Input {...a} value={setupUrl} onChange={(e) => setSetupUrl(e.target.value)} />}
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
