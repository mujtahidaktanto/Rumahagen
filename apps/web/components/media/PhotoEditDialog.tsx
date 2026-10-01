"use client";

// components/media/PhotoEditDialog.tsx — edit sederhana foto listing sebelum diunggah (M03, Media): pilih rasio bingkai (Asli/1:1/4:3/16:9), geser/zoom/putar seperti CropDialog,
// plus kecerahan dan kontras (filter kanvas). Beda dari CropDialog: rasio bingkai bisa dipilih (bukan tetap) dan hasilnya kanvas (Source) untuk diproses lagi lewat
// makeListingVariants — bukan Encoded siap unggah, karena foto listing punya 3 varian ukuran, bukan satu ukuran keluaran tetap seperti logo/banner.
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { rotateSource, type Source } from "@/lib/media/image-processing";
import { CROP_MAX_ZOOM, PHOTO_EDIT_MAX_DIM, centerCropRect, clampCropRect, sourceRectFor, zoomAtCenterRect, type CropState, type Frame } from "@/lib/media/variants";

type Props = {
  /** Foto yang diedit; null = dialog tertutup. */
  source: Source | null;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: (edited: Source) => void;
};

const PREVIEW_MAX: Frame = { w: 420, h: 340 };
const ASPECTS: { key: string; label: string; ratio: (s: Source) => number }[] = [
  { key: "asli", label: "Asli", ratio: (s) => s.width / s.height },
  { key: "1:1", label: "1:1", ratio: () => 1 },
  { key: "4:3", label: "4:3", ratio: () => 4 / 3 },
  { key: "16:9", label: "16:9", ratio: () => 16 / 9 },
];

function frameForRatio(ratio: number): Frame {
  let w = PREVIEW_MAX.w;
  let h = w / ratio;
  if (h > PREVIEW_MAX.h) {
    h = PREVIEW_MAX.h;
    w = h * ratio;
  }
  return { w: Math.round(w), h: Math.round(h) };
}

const filterCss = (brightness: number, contrast: number) => `brightness(${100 + brightness}%) contrast(${100 + contrast}%)`;

export function PhotoEditDialog({ source, title, description, onCancel, onConfirm }: Props) {
  const [src, setSrc] = useState<Source | null>(source);
  const [aspectKey, setAspectKey] = useState("asli");
  const [crop, setCrop] = useState<CropState>({ zoom: 1, x: 0, y: 0 });
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number; k: number } | null>(null);
  const prevSource = useRef<Source | null>(null);

  const frame = useMemo(() => (src ? frameForRatio(ASPECTS.find((a) => a.key === aspectKey)!.ratio(src)) : PREVIEW_MAX), [src, aspectKey]);

  // Foto baru = mulai dari Asli, tengah, tanpa penyesuaian pencahayaan sebelumnya.
  if (source !== prevSource.current) {
    prevSource.current = source;
    setSrc(source);
    setError(null);
    setAspectKey("asli");
    setBrightness(0);
    setContrast(0);
    if (source) setCrop(centerCropRect(source.width, source.height, frameForRatio(source.width / source.height)));
  }

  useEffect(() => {
    const cv = canvasRef.current;
    if (!src || !cv) return;
    const r = sourceRectFor(src.width, src.height, frame, crop);
    const ctx = cv.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, frame.w, frame.h);
    ctx.filter = filterCss(brightness, contrast);
    ctx.drawImage(src.canvas, r.sx, r.sy, r.sw, r.sh, 0, 0, frame.w, frame.h);
    ctx.filter = "none";
  }, [src, crop, frame, brightness, contrast]);

  function move(dx: number, dy: number) {
    if (!src) return;
    setCrop((c) => clampCropRect(src.width, src.height, frame, { ...c, x: c.x + dx, y: c.y + dy }));
  }

  function selectAspect(key: string) {
    if (!src) return;
    setAspectKey(key);
    const ratio = ASPECTS.find((a) => a.key === key)!.ratio(src);
    setCrop(centerCropRect(src.width, src.height, frameForRatio(ratio)));
  }

  function rotate() {
    if (!src) return;
    const r = rotateSource(src);
    const ratio = ASPECTS.find((a) => a.key === aspectKey)!.ratio(r);
    setSrc(r);
    setCrop(centerCropRect(r.width, r.height, frameForRatio(ratio)));
  }

  async function confirm() {
    if (!src) return;
    setBusy(true);
    setError(null);
    try {
      const r = sourceRectFor(src.width, src.height, frame, crop);
      const scale = Math.min(1, PHOTO_EDIT_MAX_DIM / Math.max(r.sw, r.sh));
      const w = Math.max(1, Math.round(r.sw * scale));
      const h = Math.max(1, Math.round(r.sh * scale));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";
      ctx.filter = filterCss(brightness, contrast);
      ctx.drawImage(src.canvas, r.sx, r.sy, r.sw, r.sh, 0, 0, w, h);
      onConfirm({ canvas: c, width: w, height: h });
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
          <div role="radiogroup" aria-label="Rasio bingkai" className="flex flex-wrap justify-center gap-2">
            {ASPECTS.map((a) => (
              <button
                key={a.key}
                type="button"
                role="radio"
                aria-checked={aspectKey === a.key}
                disabled={busy}
                onClick={() => selectAspect(a.key)}
                className={`h-9 rounded-pill border-[1.5px] px-3.5 text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-60 ${aspectKey === a.key ? "border-blue-600 bg-blue-600 text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500"}`}
              >
                {a.label}
              </button>
            ))}
          </div>
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
            <label htmlFor="photo-zoom" className="text-caption">
              Zoom
            </label>
            <input
              id="photo-zoom"
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
          <div className="flex w-full max-w-[420px] flex-col gap-2">
            <div className="flex items-center gap-3">
              <label htmlFor="photo-brightness" className="w-20 flex-none text-caption">
                Kecerahan
              </label>
              <input id="photo-brightness" type="range" min={-50} max={50} step={1} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="h-11 flex-1 accent-blue-600" />
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="photo-contrast" className="w-20 flex-none text-caption">
                Kontras
              </label>
              <input id="photo-contrast" type="range" min={-50} max={50} step={1} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="h-11 flex-1 accent-blue-600" />
            </div>
            {brightness !== 0 || contrast !== 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => {
                  setBrightness(0);
                  setContrast(0);
                }}
              >
                Atur ulang pencahayaan
              </Button>
            ) : null}
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
