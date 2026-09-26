"use client";

// components/agent/LpHistoryButton.tsx — "Riwayat Transaksi" pada kartu Learning Points (M04 Pembelajaran): dialog berisi ledger LP milik sendiri, dimuat saat dibuka lewat
// GET /api/agents/me/learning-points/transactions (20 per halaman, "Muat Lebih Banyak"). Empat keadaan: memuat, kosong, gagal (Coba Lagi), sukses.
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { LP_TX_LABEL, lpAmountLabel } from "@/lib/agent/learning-rules";
import { relativeTimeId } from "@/lib/agent/time";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type Tx = { id: string; transaction_type: string; amount: number | string; occurred_at: string };
const PAGE = 20;

export function LpHistoryButton() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Tx[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "error" | "ready">("idle");

  async function load(offset: number) {
    setState("loading");
    try {
      const res = await api.get<Tx[]>("/agents/me/learning-points/transactions", { limit: PAGE, offset });
      setItems((cur) => (offset === 0 ? res.data : [...cur, ...res.data]));
      setTotal(res.meta?.pagination?.total ?? res.data.length);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  function show() {
    setOpen(true);
    if (state === "idle" || state === "error") void load(0);
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={show} className="border-white/30 bg-white/15 text-white hover:bg-white/25 hover:text-white">
        Riwayat Transaksi
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Riwayat Learning Points"
        footer={
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Tutup
          </Button>
        }
      >
        {state === "loading" && items.length === 0 ? (
          <div className="flex flex-col gap-3" role="status" aria-label="Memuat riwayat…">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-12 rounded-md" />
            ))}
          </div>
        ) : state === "error" && items.length === 0 ? (
          <ErrorState title="Riwayat gagal dimuat" message="Periksa koneksi Anda lalu coba lagi." onRetry={() => void load(0)} />
        ) : items.length === 0 ? (
          <EmptyState title="Belum ada transaksi" message="Poin yang Anda dapat dari kursus dan sesi akan tercatat di sini." />
        ) : (
          <>
            <ul className="max-h-[50vh] overflow-y-auto">
              {items.map((t) => {
                const n = Number(t.amount);
                return (
                  <li key={t.id} className="flex items-center gap-3 border-b border-ink-50 py-2.5 last:border-b-0">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-md">{LP_TX_LABEL[t.transaction_type] ?? "Transaksi poin"}</span>
                      <span className="text-caption">{relativeTimeId(t.occurred_at)}</span>
                    </span>
                    <span className={cn("flex-none text-label-lg", n < 0 ? "text-danger-600" : "text-success-600")}>{lpAmountLabel(n)}</span>
                  </li>
                );
              })}
            </ul>
            {state === "error" ? (
              <p role="alert" className="pt-2 text-caption text-danger-600">
                Gagal memuat sisanya.
              </p>
            ) : null}
            {items.length < total ? (
              <div className="flex justify-center pt-3">
                <Button variant="secondary" size="sm" loading={state === "loading"} onClick={() => void load(items.length)}>
                  Muat Lebih Banyak
                </Button>
              </div>
            ) : null}
          </>
        )}
      </Dialog>
    </>
  );
}
