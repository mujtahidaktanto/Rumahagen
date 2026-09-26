"use client";

// components/admin/MatrixCellEditor.tsx — satu sel Matriks Baseline (M10): PUT /admin/permissions/matrix { role_id, permission_id, granted_scope }. Hanya dirender sebagai <select> saat
// `editable` true (admin-rules.canEditMatrixColumn) — selain itu teks baca-saja bertona sesuai granted_scope (persis .scope-all/.scope-own/.scope-none wireframe).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { grantedScopeLabel, type GrantedScope } from "@/lib/admin/admin-rules";
import { api } from "@/lib/api-client";

const TONE_CLASS: Record<GrantedScope, string> = { all: "text-success-600", own: "text-warning-600", none: "text-ink-300" };

export function MatrixCellEditor({ roleId, permissionId, initialScope, editable }: { roleId: string; permissionId: string; initialScope: GrantedScope; editable: boolean }) {
  const router = useRouter();
  const [scope, setScope] = useState(initialScope);
  const [busy, setBusy] = useState(false);

  async function onChange(next: GrantedScope) {
    const prev = scope;
    setScope(next);
    setBusy(true);
    try {
      await api.put("/admin/permissions/matrix", { role_id: roleId, permission_id: permissionId, granted_scope: next }, { idempotency: true });
      router.refresh();
    } catch {
      setScope(prev);
    } finally {
      setBusy(false);
    }
  }

  if (!editable) {
    return <span className={`text-[12px] font-bold ${TONE_CLASS[scope]}`}>{grantedScopeLabel(scope)}</span>;
  }

  return (
    <select
      disabled={busy}
      value={scope}
      onChange={(e) => void onChange(e.target.value as GrantedScope)}
      className={`rounded-sm border border-ink-100 bg-white px-2 py-1 text-[12px] font-bold ${TONE_CLASS[scope]}`}
    >
      <option value="all">ALL</option>
      <option value="own">OWN</option>
      <option value="none">NONE</option>
    </select>
  );
}
