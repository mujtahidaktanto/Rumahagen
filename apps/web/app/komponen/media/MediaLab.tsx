"use client";

import { useState } from "react";
import { loadSource, makeAvatar, makeListingVariants, pickProblem } from "@/lib/media/image-processing";
import { centerCrop, sourceRect } from "@/lib/media/variants";
import { formatFileSize } from "@/lib/validation/profile-form";

type Row = { label: string; text: string };

export function MediaLab() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("Pilih foto (JPG/PNG/WebP).");

  async function onFile(f: File | undefined) {
    if (!f) return;
    const problem = pickProblem(f);
    if (problem) return setMsg(problem);
    setMsg("Memproses…");
    const t0 = performance.now();
    try {
      const src = await loadSource(f);
      const v = await makeListingVariants(src);
      const av = await makeAvatar(src, sourceRect(src.width, src.height, 280, centerCrop(src.width, src.height, 280)));
      setRows([
        { label: "Asli", text: `${src.width}×${src.height} · ${formatFileSize(f.size)} · ${f.type}` },
        { label: "Kecil 400", text: `${formatFileSize(v.blobs.sm.size)} · ${v.type}` },
        { label: "Sedang 1080", text: `${formatFileSize(v.blobs.md.size)} · ${v.type}` },
        { label: "Besar 2048", text: `${formatFileSize(v.blobs.lg.size)} · ${v.type}` },
        { label: "Avatar 512", text: `${formatFileSize(av.blob.size)} · ${av.type}` },
      ]);
      setMsg(`Selesai dalam ${Math.round(performance.now() - t0)} ms.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Gagal.");
    }
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
      <h1 className="text-headline">Uji Pengecilan Foto</h1>
      <input id="lab-file" type="file" accept="image/*" onChange={(e) => void onFile(e.target.files?.[0])} />
      <p role="status">{msg}</p>
      <dl className="flex flex-col gap-1">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 border-b border-ink-100 py-1.5">
            <dt className="text-label-lg">{r.label}</dt>
            <dd className="text-body-md">{r.text}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
