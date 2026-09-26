"use client";

// components/shell/use-dismiss.ts — menutup popover topbar: klik di luar, Esc (mengembalikan fokus ke tombol pemicu).
import { useEffect, type RefObject } from "react";

export function useDismiss(rootRef: RefObject<HTMLElement | null>, open: boolean, onClose: () => void, triggerRef?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef?.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, rootRef, triggerRef]);
}
