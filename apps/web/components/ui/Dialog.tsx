"use client";

// components/ui/Dialog.tsx — dialog modal berbasis elemen <dialog> bawaan browser: role=dialog, jebakan fokus, Esc menutup, dan latar (::backdrop) sudah
// ditangani browser. Klik di luar kartu menutup dialog. `open` dikendalikan induk; `onClose` dipanggil saat pengguna menutup.
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { CloseIcon } from "./icons";
import { IconButton } from "./Button";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Baris tombol aksi di bawah (mis. Batal dan Simpan). */
  footer?: ReactNode;
  className?: string;
};

export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // klik pada latar
      }}
      className={cn("m-auto w-[calc(100%-32px)] max-w-md rounded-lg bg-white p-0 shadow-3 backdrop:bg-ink-900/50", className)}
    >
      <div className="flex flex-col gap-3.5 p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-title-lg">{title}</h2>
          <IconButton label="Tutup" onClick={onClose} className="-mt-2 -mr-2">
            <CloseIcon />
          </IconButton>
        </div>
        {description ? <p id={descId} className="text-body-md text-ink-500">{description}</p> : null}
        {children}
        {footer ? <div className="mt-1 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </dialog>
  );
}
