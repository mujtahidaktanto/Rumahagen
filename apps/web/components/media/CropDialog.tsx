"use client";

// components/media/CropDialog.tsx — dialog pemangkas foto umum (logo persegi, banner memanjang): bingkai mengikuti rasio hasil, foto digeser (mouse/jari/panah), di-zoom (penggeser atau roda mouse, 1-4x),
// dan diputar 90 derajat. "Pakai Foto" memangkas persis area di dalam bingkai lalu mengecilkannya (WebP/JPEG <3 MB) di browser. Geometri murni ada di lib/media/variants.ts (diuji).
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { makeCropped, rotateSource, type Encoded, type Source } from "@/lib/media/image-processing";
import { CROP_MAX_ZOOM, centerCropRect, clampCropRect, sourceRectFor, zoomAtCenterRect, type CropState, type Frame } from "@/lib/media/variants";

type Props = {
  /** Foto yang dipangkas; null = dialog tertutup. */
  source: Source | null;
  /** Ukuran bingkai (px kanvas pratinjau); rasionya = rasio hasil. */
  frame: Frame;
  /** Ukuran berkas hasil (px). */
  output: { w: number; h: number };
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: (enc: Encoded) => void;
};

export function CropDialog({ source, frame, output, title, description, onCancel, onConfirm }: Props) {
  const [src, setSrc] = useState<Source | null>(source);
  const [crop, setCrop] = useState<CropState>({ zoom: 1, x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number; k: number } | null>(null);

  // Foto baru = mulai dari tengah.
  useEffect(() => {
    setSrc(source);
    setError(null);
    if (source) setCrop(centerCropRect(source.width, source.height, frame));
  }, [source, frame]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!src || !cv) return;
    const r = sourceRectFor(src.width, src.height, frame, crop);
    const ctx = cv.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, frame.w, frame.h);
    ctx.drawImage(src.canvas, r.sx, r.sy, r.sw, r.sh, 0, 0, frame.w, frame.h);
  }, [src, crop, frame]);

  function move(dx: number, dy: number) {
    if (!src) return;
    setCrop((c) => clampCropRect(src.width, src.height, frame, { ...c, x: c.x + dx, y: c.y + dy }));
  }

  function rotate() {
    if (!src) return;
    const r = rotateSource(src);
    setSrc(r);
    setCrop(centerCropRect(r.width, r.height, frame));
  }

  async function confirm() {
    if (!src) return;
    setBusy(true);
    setError(null);
    try {
      onConfirm(await makeCropped(src, sourceRectFor(src.width, src.height, frame, crop), output.w, output.h));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto belum bisa diproses. Coba foto lain.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={source !== null}
      onClose={() => (busy ? undefined : onCancel())}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onCancel}>
            Batal
          </Button>
          <Button loading={busy} onClick={() => void confirm()}>
            Pakai Foto
          </Button>
        </>
      }
    >
      {src ? (
        <div className="flex flex-col items-center gap-4">
          <div
            role="group"
            tabIndex={0}
            aria-label="Area pangkas foto. Geser dengan mouse atau jari, atau pakai tombol panah."
            className="relative touch-none overflow-hidden rounded-md bg-ink-100 outline-offset-2 select-none focus-visible:outline-2 focus-visible:outline-blue-600"
            style={{ width: "100%", maxWidth: frame.w, aspectRatio: `${frame.w} / ${frame.h}`, cursor: "grab" }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { px: e.clientX, py: e.clientY, x: crop.x, y: crop.y, k: frame.w / e.currentTarget.getBoundingClientRect().width };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              setCrop((c) => clampCropRect(src.width, src.height, frame, { ...c, x: d.x + (e.clientX - d.px) * d.k, y: d.y + (e.clientY - d.py) * d.k }));
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onWheel={(e) => setCrop((c) => zoomAtCenterRect(src.width, src.height, frame, c, c.zoom - e.deltaY * 0.002))}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 30 : 10;
              const k: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
              const m = k[e.key];
              if (m) {
                e.preventDefault();
                move(m[0], m[1]);
              }
            }}
          >
            <canvas ref={canvasRef} width={frame.w} height={frame.h} style={{ width: "100%", height: "100%", display: "block" }} />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-white/90 ring-inset" />
          </div>
          <div className="flex w-full max-w-[420px] items-center gap-3">
            <label htmlFor="crop-zoom" className="text-caption">
              Zoom
            </label>
            <input
              id="crop-zoom"
              type="range"
              min={1}
              max={CROP_MAX_ZOOM}
              step={0.01}
              value={crop.zoom}
              onChange={(e) => setCrop((c) => zoomAtCenterRect(src.width, src.height, frame, c, Number(e.target.value)))}
              className="h-11 flex-1 accent-blue-600"
            />
            <Button variant="secondary" size="sm" onClick={rotate} disabled={busy}>
              Putar 90°
            </Button>
          </div>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}
