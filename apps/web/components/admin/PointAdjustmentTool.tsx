"use client";

// components/admin/PointAdjustmentTool.tsx — "Penyesuaian Poin Manual" (Ekonomi Pembelajaran, tab Poin & Sertifikat): POST /admin/learning-point-adjustments { user_id, amount, reason? },
// membungkus adjust_learning_points() (0046) — "No Agent self-adjustment" ditegakkan RPC, bukan di sini.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import type { AgentPickerRow } from "@/lib/admin/learning-economy-data";
import { ApiClientError, api } from "@/lib/api-client";

export function PointAdjustmentTool({ agents }: { agents: AgentPickerRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AgentPickerRow | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || selected) return [];
    return agents.filter((a) => a.name.toLowerCase().includes(q) || (a.email ?? "").toLowerCase().includes(q)).slice(0, 8);
  }, [query, agents, selected]);

  const canApply = !!selected && Number(amount) !== 0 && !Number.isNaN(Number(amount));

  async function apply() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/admin/learning-point-adjustments", { user_id: selected.id, amount: Number(amount), reason: reason.trim() || undefined }, { idempotency: true });
      setSuccess(`Poin ${selected.name} berhasil disesuaikan.`);
      setSelected(null);
      setQuery("");
      setAmount("");
      setReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil diterapkan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5">
      <span className="text-title-md">Penyesuaian Poin Manual</span>
      <p className="text-caption">Bungkus adjust_learning_points() (0046) — "No Agent self-adjustment".</p>

      <Field label="Akun tujuan" required>
        {(a) => (
          <div className="relative">
            <Input
              {...a}
              value={selected ? selected.name : query}
              onChange={(e) => {
                setSelected(null);
                setQuery(e.target.value);
              }}
              placeholder="Cari nama/email agent…"
            />
            {matches.length > 0 ? (
              <div className="absolute z-10 mt-1 w-full rounded-sm border border-ink-100 bg-white shadow-2">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-[13px] hover:bg-ink-50"
                    onClick={() => {
                      setSelected(m);
                      setQuery("");
                    }}
                  >
                    {m.name} {m.email ? <span className="text-ink-300">· {m.email}</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Field>

      <Field label="Jumlah" hint="Boleh negatif untuk koreksi kurangi.">
        {(a) => <Input {...a} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="mis. 50 atau -20" />}
      </Field>
      <Field label="Alasan" hint="Opsional.">
        {(a) => <Textarea {...a} value={reason} onChange={(e) => setReason(e.target.value)} />}
      </Field>

      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
      {success ? <p className="text-body-md text-success-600">{success}</p> : null}

      <Button loading={busy} disabled={!canApply} onClick={() => void apply()}>
        Terapkan Penyesuaian
      </Button>
    </div>
  );
}
