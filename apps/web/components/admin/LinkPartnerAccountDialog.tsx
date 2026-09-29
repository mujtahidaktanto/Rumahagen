"use client";

// components/admin/LinkPartnerAccountDialog.tsx — Hubungkan Akun (Proyek Developer, tab Developer Partner): PUT /developer-partners/{id} { user_id }. Hanya akun ber-role Developer Partner yang
// belum terhubung ke perusahaan mana pun bisa dipilih (unlinkedDeveloperPartnerUsers). Kalau PIC belum punya role itu, admin mengubahnya dulu lewat Direktori Pengguna > "Ubah Role".
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Field";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import { ApiClientError, api } from "@/lib/api-client";

export function LinkPartnerAccountDialog({ partnerId, companyName, candidates, trigger }: { partnerId: string; companyName: string; candidates: DirectoryUserRow[]; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DirectoryUserRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates.slice(0, 20);
    return candidates.filter((u) => u.name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)).slice(0, 20);
  }, [candidates, query]);

  function openDialog() {
    setQuery("");
    setSelected(null);
    setError(null);
    setOpen(true);
  }

  async function link() {
    if (!selected) {
      setError("Pilih akun terlebih dahulu.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.put(`/developer-partners/${partnerId}`, { user_id: selected.id }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil terhubung. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Hubungkan Akun — ${companyName}`}
        description="Pilih akun ber-role Developer Partner yang belum terhubung ke perusahaan mana pun. Kalau PIC belum punya role itu, ubah dulu lewat Direktori Pengguna > &quot;Ubah Role&quot; (Agent → Developer Partner), baru kembali ke sini."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!selected} onClick={() => void link()}>
              Hubungkan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <Input placeholder="Cari akun (role Developer Partner, belum terhubung)…" value={selected ? `${selected.name} · ${selected.email ?? "—"}` : query} onChange={(e) => { setQuery(e.target.value); setSelected(null); }} />
          {!selected ? (
            <ul className="max-h-48 overflow-y-auto rounded-sm border border-ink-100">
              {filtered.length === 0 ? (
                <li className="p-2.5 text-caption text-ink-500">{candidates.length === 0 ? "Tidak ada akun Developer Partner yang belum terhubung." : "Tidak ditemukan."}</li>
              ) : (
                filtered.map((u) => (
                  <li key={u.id}>
                    <button type="button" className="flex w-full flex-col items-start gap-0.5 p-2.5 text-left hover:bg-ink-50" onClick={() => setSelected(u)}>
                      <span className="text-body-md">{u.name}</span>
                      <span className="text-caption">{u.email ?? "—"}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
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
