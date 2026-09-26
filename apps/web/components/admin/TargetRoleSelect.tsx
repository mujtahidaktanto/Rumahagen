"use client";

// components/admin/TargetRoleSelect.tsx — pemilih "Role target" preset (M10, Superadmin-only): navigasi murni (?tab=preset&target_role=...), tidak ada state lokal — data preset di-refetch
// server saat URL berubah (pola sama seperti NotificationControls.tsx).
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ROLE_CODES, ROLE_LABEL, type RoleCode } from "@/lib/auth/roles";

/** Role target yang bisa dipilih Superadmin di layar ini — SELURUH katalog role (trigger enforce_preset_target_role_is_agent, 0004/0102, sengaja diperbaiki supaya Superadmin bisa
 * menargetkan role apa pun, bukan cuma 3 yang kebetulan tampil sebagai contoh di dropdown wireframe M10-Matriks-Izin). Manager tetap terkunci ke Agent (ditegakkan trigger yang sama). */
export const PRESET_TARGET_ROLE_OPTIONS: RoleCode[] = [...ROLE_CODES];

export function TargetRoleSelect({ value }: { value: RoleCode }) {
  const router = useRouter();
  return (
    <select
      value={value}
      onChange={(e) => router.push(`/admin/izin?tab=preset&target_role=${e.target.value}` as Route)}
      className="rounded-sm border border-ink-100 bg-white px-2.5 py-1.5 text-[13px] font-bold"
    >
      {PRESET_TARGET_ROLE_OPTIONS.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABEL[r]}
        </option>
      ))}
    </select>
  );
}
