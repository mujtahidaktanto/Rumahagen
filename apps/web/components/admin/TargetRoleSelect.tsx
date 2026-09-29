"use client";

// components/admin/TargetRoleSelect.tsx — pemilih "Role target" preset (M10, Superadmin-only): navigasi murni (?tab=preset&target_role=...), tidak ada state lokal — data preset di-refetch
// server saat URL berubah (pola sama seperti NotificationControls.tsx).
// PRESET_TARGET_ROLE_OPTIONS didefinisikan di lib/admin/admin-rules.ts (BUKAN di sini, dan JANGAN diimpor ulang dari sini oleh Server Component) — file ini "use client", dan Server Component yang
// mengimpor NILAI dari file "use client" menerima client-reference proxy, bukan array sungguhan, sehingga `.includes()` gagal di runtime (lihat komentar di admin-rules.ts).
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { PRESET_TARGET_ROLE_OPTIONS } from "@/lib/admin/admin-rules";
import { ROLE_LABEL, type RoleCode } from "@/lib/auth/roles";

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
