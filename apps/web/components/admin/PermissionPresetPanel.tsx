"use client";

// components/admin/PermissionPresetPanel.tsx — tab Preset (M10, wireframe M10-Matriks-Izin): daftar preset untuk role target terpilih + dialog Buat/Edit (PUT /admin/permissions/matrix/agent)
// dan Tugaskan ke Akun (PUT /admin/users/{id}/permission-preset). Item preset dipilih dari katalog penuh (~80 izin, lib/admin/permission-matrix-data.ts) lewat pencarian teks — wireframe
// sendiri menandai daftar contohnya "hanya untuk ilustrasi", jadi di sini benar-benar dari katalog nyata, bukan daftar tetap.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { PermissionCatalogItem } from "@/lib/admin/permission-matrix-data";
import type { PresetAssignCandidate, PresetItem, PresetRow } from "@/lib/admin/permission-preset-data";
import type { GrantedScope } from "@/lib/admin/admin-rules";
import { ApiClientError, api } from "@/lib/api-client";

type FormItem = { permissionId: string; actionCode: string; grantedScope: GrantedScope };

export function PermissionPresetPanel({
  targetRoleId,
  presets,
  candidates,
  permissionCatalog,
  canManagePreset,
}: {
  targetRoleId: string;
  presets: PresetRow[];
  candidates: PresetAssignCandidate[];
  permissionCatalog: PermissionCatalogItem[];
  canManagePreset: boolean;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [items, setItems] = useState<FormItem[]>([]);
  const [itemQuery, setItemQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignPreset, setAssignPreset] = useState<{ id: string; name: string } | null>(null);
  const [assignQuery, setAssignQuery] = useState("");
  const [assignBusyUserId, setAssignBusyUserId] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setName("");
    setItems([]);
    setItemQuery("");
    setError(null);
    setFormOpen(true);
  }

  function openEdit(p: PresetRow) {
    setEditingId(p.id);
    setName(p.name);
    setItems(p.items.map((it: PresetItem) => ({ ...it })));
    setItemQuery("");
    setError(null);
    setFormOpen(true);
  }

  const itemMatches = useMemo(() => {
    const q = itemQuery.trim().toLowerCase();
    if (!q) return [];
    const already = new Set(items.map((i) => i.permissionId));
    return permissionCatalog.filter((p) => !already.has(p.permissionId) && p.actionCode.toLowerCase().includes(q)).slice(0, 8);
  }, [itemQuery, items, permissionCatalog]);

  function addItem(p: PermissionCatalogItem) {
    setItems((prev) => [...prev, { permissionId: p.permissionId, actionCode: p.actionCode, grantedScope: "all" }]);
    setItemQuery("");
  }

  function removeItem(permissionId: string) {
    setItems((prev) => prev.filter((i) => i.permissionId !== permissionId));
  }

  function setItemScope(permissionId: string, scope: GrantedScope) {
    setItems((prev) => prev.map((i) => (i.permissionId === permissionId ? { ...i, grantedScope: scope } : i)));
  }

  async function savePreset() {
    if (name.trim().length === 0 || items.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await api.put(
        "/admin/permissions/matrix/agent",
        { preset_id: editingId ?? undefined, target_role_id: targetRoleId, name: name.trim(), items: items.map((i) => ({ permission_id: i.permissionId, granted_scope: i.grantedScope })) },
        { idempotency: true },
      );
      setFormOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Preset belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const filteredCandidates = useMemo(() => {
    const q = assignQuery.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) => c.name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q));
  }, [assignQuery, candidates]);

  async function assign(userId: string, presetId: string | null) {
    setAssignBusyUserId(userId);
    try {
      await api.put(`/admin/users/${userId}/permission-preset`, { preset_id: presetId }, { idempotency: true });
      router.refresh();
    } catch {
      // pesan galat ringkas lewat alert bawaan browser dihindari; baris tetap terlihat, pengguna bisa coba lagi
    } finally {
      setAssignBusyUserId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-[600px] text-body-md text-ink-500">Preset tidak pernah menjadi role baru — hanya varian konfigurasi izin dari role target yang dipilih.</p>
        {canManagePreset ? (
          <Button onClick={openCreate} className="flex-none">
            + Buat Preset
          </Button>
        ) : null}
      </div>

      {presets.length === 0 ? (
        <p className="py-10 text-center text-body-md text-ink-300">Belum ada preset untuk role target ini.</p>
      ) : (
        <div className="divide-y divide-ink-50 rounded-md border border-ink-100 bg-white">
          {presets.map((p) => (
            <div key={p.id} className="flex items-center gap-3.5 p-3.5">
              <div className="min-w-0 flex-1">
                <span className="text-label-lg">{p.name}</span>
                <p className="text-caption">
                  {p.itemCount} izin dikonfigurasi · ditugaskan ke {p.assignedCount} akun
                </p>
              </div>
              {canManagePreset ? (
                <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                  Edit
                </Button>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAssignPreset({ id: p.id, name: p.name });
                  setAssignQuery("");
                }}
              >
                Tugaskan ke Akun
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onClose={() => (busy ? undefined : setFormOpen(false))} title={editingId ? `Edit Preset — ${name}` : "Buat Preset Baru"}>
        <div className="flex flex-col gap-3.5">
          <Field label="Nama preset" required>
            {(a) => <Input {...a} value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Agent Senior — Akses Klaim" />}
          </Field>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-lg text-ink-900">Izin di luar baseline role target</label>
            {items.length === 0 ? <p className="text-caption">Belum ada izin ditambahkan.</p> : null}
            {items.map((it) => (
              <div key={it.permissionId} className="flex items-center justify-between gap-2 border-b border-ink-50 py-2">
                <span className="font-mono text-[12.5px]">{it.actionCode}</span>
                <div className="flex items-center gap-2">
                  <Select value={it.grantedScope} onChange={(e) => setItemScope(it.permissionId, e.target.value as GrantedScope)} className="h-9 w-24 px-2 text-[12px]">
                    <option value="all">ALL</option>
                    <option value="own">OWN</option>
                    <option value="none">NONE</option>
                  </Select>
                  <button type="button" className="text-caption text-danger-600" onClick={() => removeItem(it.permissionId)}>
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            <div className="relative">
              <Input value={itemQuery} onChange={(e) => setItemQuery(e.target.value)} placeholder="Cari action_code untuk ditambahkan…" />
              {itemMatches.length > 0 ? (
                <div className="absolute z-10 mt-1 w-full rounded-sm border border-ink-100 bg-white shadow-2">
                  {itemMatches.map((m) => (
                    <button key={m.permissionId} type="button" className="block w-full px-3 py-2 text-left font-mono text-[12.5px] hover:bg-ink-50" onClick={() => addItem(m)}>
                      {m.actionCode}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <p className="text-caption">Item tidak boleh melebihi baseline role target (ditegakkan trigger DB) — penyimpanan akan ditolak dengan pesan jelas bila melebihi.</p>
          </div>

          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" disabled={busy} onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={name.trim().length === 0 || items.length === 0} onClick={() => void savePreset()}>
              Simpan Preset
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={assignPreset != null} onClose={() => setAssignPreset(null)} title={`Tugaskan "${assignPreset?.name ?? ""}"`}>
        <div className="flex flex-col gap-3.5">
          <Field label="Cari akun">{(a) => <Input {...a} value={assignQuery} onChange={(e) => setAssignQuery(e.target.value)} placeholder="Nama atau email…" />}</Field>
          <div className="max-h-72 divide-y divide-ink-50 overflow-y-auto rounded-md border border-ink-100">
            {filteredCandidates.length === 0 ? (
              <p className="p-4 text-center text-caption text-ink-300">Tidak ada akun yang cocok.</p>
            ) : (
              filteredCandidates.map((c) => {
                const isAssigned = c.currentPresetId === assignPreset?.id;
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <span className="block text-label-lg">{c.name}</span>
                      <span className="block text-caption text-ink-500">{c.email ?? "—"}</span>
                      {c.currentPresetName ? <Badge tone={isAssigned ? "success" : "neutral"}>{c.currentPresetName}</Badge> : null}
                    </div>
                    <Button
                      variant={isAssigned ? "secondary" : "primary"}
                      size="sm"
                      loading={assignBusyUserId === c.id}
                      onClick={() => void assign(c.id, isAssigned ? null : (assignPreset?.id ?? null))}
                    >
                      {isAssigned ? "Lepas Preset" : "Tugaskan"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          <p className="text-caption">Role akun harus cocok dengan role target preset ini (ditegakkan trigger DB). Lepas Preset mengembalikan akun ke baseline Role Default.</p>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setAssignPreset(null)}>
              Tutup
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
