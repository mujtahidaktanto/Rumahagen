"use client";

// components/admin/UserDirectoryView.tsx — Direktori Pengguna (M09, wireframe 02-Admin/M09-Direktori-Pengguna): daftar SEMUA pengguna (Superadmin/Admin lihat semua role termasuk staf lewat
// RLS users_select_self_or_admin 0007; Manager otomatis dipersempit ke agent/instructor/buyer/developer_partner lewat RLS users_select_manager_agent_rows 0121/0122 — bukan filter di UI).
// Filter status dan pencarian nama/email murni di klien atas data yang sudah dimuat sekali (tidak ada endpoint GET /admin/users berhalaman — celah dicatat di audit/FRONTEND_GAPS.md).
import { useMemo, useState } from "react";
import { DirectoryRowActions } from "@/components/admin/DirectoryRowActions";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import { SearchIcon } from "@/components/ui/icons";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import { USER_STATUS_FILTER_LABEL, USER_STATUS_TONE, canChangeUserRole, canManageAgentActions, type AdminViewerRole, type UserStatus } from "@/lib/admin/admin-rules";
import type { Part } from "@/lib/agent/dashboard-data";
import { ROLE_LABEL } from "@/lib/auth/roles";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

const STATUS_ORDER: UserStatus[] = ["active", "pending_review", "suspended", "rejected"];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

export function UserDirectoryView({ viewerRole, users }: { viewerRole: AdminViewerRole; users: Part<DirectoryUserRow[]> }) {
  const [filter, setFilter] = useState<"all" | UserStatus>("all");
  const [q, setQ] = useState("");

  const rows = users.ok ? users.data : [];
  const bySearch = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((u) => u.name.toLowerCase().includes(needle) || (u.email ?? "").toLowerCase().includes(needle));
  }, [rows, q]);

  const counts = useMemo(() => {
    const c: Record<"all" | UserStatus, number> = { all: bySearch.length, active: 0, pending_review: 0, suspended: 0, rejected: 0 };
    for (const u of bySearch) c[u.status]++;
    return c;
  }, [bySearch]);

  const filtered = filter === "all" ? bySearch : bySearch.filter((u) => u.status === filter);
  const canManage = canManageAgentActions(viewerRole);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-headline">Direktori Pengguna</h1>
          {viewerRole === "manager" ? (
            <p className="max-w-[520px] text-caption text-ink-300">
              Manager hanya melihat akun Agent &amp; mitra (Instructor/Buyer/Developer Partner) — baris staf lain (Admin/Manager/Superadmin) benar-benar tersembunyi di level database (RLS,
              bukan cuma disaring UI).
            </p>
          ) : null}
        </div>
        <div className="relative w-full max-w-[280px]">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-300">
            <SearchIcon size={16} />
          </span>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email…" className="pl-10" />
        </div>
      </div>

      {!users.ok ? (
        <ErrorState title="Direktori gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2.5">
            {(["all", ...STATUS_ORDER] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-pill border px-3.5 py-1.5 text-label-lg transition-colors ${
                  filter === key ? "border-blue-600 bg-blue-50 text-blue-700" : "border-ink-100 bg-white text-ink-500 hover:bg-ink-50"
                }`}
              >
                {key === "all" ? "Semua" : USER_STATUS_FILTER_LABEL[key]} <span className="text-ink-300">·{counts[key]}</span>
              </button>
            ))}
          </div>

          <Table>
            <THead>
              <TR>
                <TH>Nama</TH>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Terdaftar</TH>
                <TH>Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {filtered.length === 0 ? (
                <TR>
                  <TD colSpan={6} className="py-12 text-center text-body-md text-ink-300">
                    Tidak ada pengguna dengan status &quot;{filter === "all" ? "Semua" : USER_STATUS_FILTER_LABEL[filter]}&quot;
                  </TD>
                </TR>
              ) : (
                filtered.map((u) => (
                  <TR key={u.id}>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-100 text-[12px] font-bold text-blue-600">{initialsOf(u.name)}</div>
                        <span className="text-label-lg">{u.name}</span>
                        {u.ktpVerified ? <Badge tone="success">KTP ✓</Badge> : null}
                      </div>
                    </TD>
                    <TD className="text-body-md text-ink-500">{u.email ?? "—"}</TD>
                    <TD>
                      <span className="inline-flex rounded-pill bg-ink-50 px-2.5 py-1 text-[12px] font-bold text-ink-700">{ROLE_LABEL[u.roleCode as keyof typeof ROLE_LABEL] ?? u.roleCode}</span>
                    </TD>
                    <TD>
                      <Badge tone={USER_STATUS_TONE[u.status]}>{USER_STATUS_FILTER_LABEL[u.status]}</Badge>
                    </TD>
                    <TD className="text-body-md text-ink-500">{dtf.format(new Date(u.createdAt))}</TD>
                    <TD>
                      <DirectoryRowActions
                        userId={u.id}
                        name={u.name}
                        viewerRole={viewerRole}
                        canKtp={canManage && u.roleCode === "agent"}
                        canSuspend={canManage && u.roleCode === "agent" && u.status === "active"}
                        canChangeRole={canChangeUserRole(viewerRole, u.roleCode)}
                      />
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
          <span className="text-caption">Menampilkan {filtered.length} dari {rows.length} pengguna.</span>
        </>
      )}
    </div>
  );
}
