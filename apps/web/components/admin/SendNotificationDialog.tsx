"use client";

// components/admin/SendNotificationDialog.tsx — Kirim Notifikasi Manual (Konten & Notifikasi): POST /admin/notifications/push, bungkus create_notification() (satu-satunya jalur fisik pembuatan
// notifikasi, 0036) — Superadmin/Admin saja, dicek DI DALAM fungsi. Kirim ke SATU akun, bukan broadcast massal. Akun tujuan dicari dari daftar Direktori Pengguna yang sudah dimuat di server
// (disaring di klien; jumlah pengguna MVP masih kecil, tidak ada endpoint pencarian akun tersendiri).
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { DirectoryUserRow } from "@/lib/admin/user-directory-data";
import { NOTIFICATION_TYPE } from "@/lib/agent/notification-rules";
import { validateSendNotification, type SendNotificationForm } from "@/lib/admin/content-notif-rules";
import { ApiClientError, api } from "@/lib/api-client";

const TYPES = Object.keys(NOTIFICATION_TYPE);
const EMPTY: SendNotificationForm = { userId: "", type: "lainnya", title: "", message: "" };

export function SendNotificationDialog({ users, trigger }: { users: DirectoryUserRow[]; trigger: (open: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<SendNotificationForm>(EMPTY);
  const [query, setQuery] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const errors = tried ? validateSendNotification(f) : {};

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 20);
    return users.filter((u) => u.name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)).slice(0, 20);
  }, [users, query]);
  const selected = users.find((u) => u.id === f.userId) ?? null;

  function openDialog() {
    setF(EMPTY);
    setQuery("");
    setTried(false);
    setError(null);
    setSent(false);
    setOpen(true);
  }

  async function send() {
    setTried(true);
    const errs = validateSendNotification(f);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(
        "/admin/notifications/push",
        { user_id: f.userId, type: f.type, ...(f.title.trim() ? { title: f.title.trim() } : {}), ...(f.message.trim() ? { message: f.message.trim() } : {}) },
        { idempotency: true },
      );
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum terkirim. Periksa koneksi Anda lalu coba lagi.");
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
        title="Kirim Notifikasi Manual"
        description="Kirim notifikasi manual ke SATU akun — bukan broadcast massal (tidak ada endpoint broadcast-ke-semua yang dievidensi)."
        footer={
          sent ? (
            <Button onClick={() => setOpen(false)}>Tutup</Button>
          ) : (
            <>
              <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button loading={busy} onClick={() => void send()}>
                Kirim
              </Button>
            </>
          )
        }
      >
        {sent ? (
          <p role="status" className="text-body-md text-success-600">
            Notifikasi terkirim ke {selected?.name ?? "akun terpilih"}.
          </p>
        ) : (
          <div className="flex flex-col gap-3.5">
            <Field label="Akun tujuan" required error={errors.userId}>
              {(a) => (
                <div className="flex flex-col gap-1.5">
                  <Input {...a} placeholder="Cari nama atau email…" value={selected ? `${selected.name} · ${selected.email ?? "—"}` : query} onChange={(e) => { setQuery(e.target.value); setF((x) => ({ ...x, userId: "" })); }} />
                  {!selected && query.trim() ? (
                    <ul className="max-h-40 overflow-y-auto rounded-sm border border-ink-100">
                      {filtered.length === 0 ? (
                        <li className="p-2.5 text-caption text-ink-500">Tidak ditemukan.</li>
                      ) : (
                        filtered.map((u) => (
                          <li key={u.id}>
                            <button type="button" className="flex w-full flex-col items-start gap-0.5 p-2.5 text-left hover:bg-ink-50" onClick={() => { setF((x) => ({ ...x, userId: u.id })); setQuery(""); }}>
                              <span className="text-body-md">{u.name}</span>
                              <span className="text-caption">
                                {u.email ?? "—"} · {u.roleCode}
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  ) : null}
                </div>
              )}
            </Field>
            <Field label="Tipe" required error={errors.type}>
              {(a) => (
                <Select {...a} value={f.type} onChange={(e) => setF((x) => ({ ...x, type: e.target.value }))}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t} — {NOTIFICATION_TYPE[t]!.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Judul (opsional, override template)">{(a) => <Input {...a} value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} />}</Field>
            <Field label="Pesan (opsional, override template)">{(a) => <Textarea {...a} rows={2} value={f.message} onChange={(e) => setF((x) => ({ ...x, message: e.target.value }))} />}</Field>
            {error ? (
              <p role="alert" className="text-body-md text-danger-600">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </Dialog>
    </>
  );
}
