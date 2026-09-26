"use client";

// components/shell/ContextSwitcher.tsx — Context Switcher topbar (STEP13-E §5.3, wireframe M08): Pribadi <-> organisasi yang diikuti. Pilihan disimpan di cookie \`ra_ctx\` lalu halaman dimuat ulang;
// server memvalidasi pilihan terhadap keanggotaan (lib/agent/context.ts). Yang mengikuti konteks saat ini: layar Organisasi (organisasi yang ditampilkan). Daftar dan kuota Listing Saya tetap pribadi karena Wizard belum menawarkan listing organisasi (audit/FRONTEND_GAPS.md).
// Ganti konteks TIDAK mengubah kepemilikan atau peran platform. Tanpa organisasi, tombol tetap tampil ("Pribadi") tanpa daftar pilihan.
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import { BuildingIcon, CheckCircleIcon, ChevronUpIcon, UserIcon } from "@/components/ui/icons";
import { PERSONAL_CONTEXT, contextCookieString, contextLabel, type ActiveContext, type ContextOrg } from "@/lib/agent/context";
import { ROLE_LABEL } from "@/lib/agent/org-rules";
import { cn } from "@/lib/cn";
import { useDismiss } from "./use-dismiss";

export function ContextSwitcher({ orgs, context, align = "right" }: { orgs: ContextOrg[]; context: ActiveContext; align?: "left" | "right" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close, btnRef);

  const activeId = context.kind === "org" ? context.org.id : PERSONAL_CONTEXT;
  const choices = [{ id: PERSONAL_CONTEXT, label: "Pribadi", note: "Akun Anda sendiri", isOrg: false }, ...orgs.map((o) => ({ id: o.id, label: o.name, note: ROLE_LABEL[o.role] ?? o.role, isOrg: true }))];

  function choose(id: string) {
    setOpen(false);
    if (id === activeId) return;
    document.cookie = contextCookieString(id);
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Ganti konteks, saat ini ${contextLabel(context)}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 max-w-[220px] items-center gap-2 rounded-pill border-[1.5px] border-ink-100 bg-white pr-3 pl-1.5 hover:border-blue-500"
      >
        <span aria-hidden="true" className={cn("flex h-8 w-8 flex-none items-center justify-center rounded-full", context.kind === "org" ? "bg-gold-100 text-gold-700" : "bg-blue-100 text-blue-600")}>
          {context.kind === "org" ? <BuildingIcon size={16} /> : <UserIcon size={16} />}
        </span>
        <span className="min-w-0 truncate text-label-lg">{contextLabel(context)}</span>
        <ChevronUpIcon size={14} className={cn("flex-none rotate-180 text-ink-500 transition-transform", open && "rotate-0")} />
      </button>

      {open ? (
        <ul id={menuId} role="menu" aria-label="Konteks" className={cn("absolute z-40 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-md border border-ink-100 bg-white p-1.5 shadow-3", align === "right" ? "right-0" : "left-0")}>
          {choices.map((c) => (
            <li key={c.id} role="none">
              <button type="button" role="menuitemradio" aria-checked={c.id === activeId} onClick={() => choose(c.id)} className="flex min-h-12 w-full items-center gap-3 rounded-sm px-3 py-2 text-left hover:bg-ink-50">
                <span aria-hidden="true" className={cn("flex h-8 w-8 flex-none items-center justify-center rounded-full", c.isOrg ? "bg-gold-100 text-gold-700" : "bg-blue-100 text-blue-600")}>
                  {c.isOrg ? <BuildingIcon size={16} /> : <UserIcon size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-label-lg">{c.label}</span>
                  <span className="block truncate text-caption">{c.note}</span>
                </span>
                {c.id === activeId ? <CheckCircleIcon size={18} className="flex-none text-blue-600" /> : null}
              </button>
            </li>
          ))}
          {orgs.length === 0 ? <li role="none" className="px-3 py-2 text-caption">Anda belum tergabung ke organisasi. Buat atau terima undangan di menu Organisasi.</li> : null}
        </ul>
      ) : null}
    </div>
  );
}
