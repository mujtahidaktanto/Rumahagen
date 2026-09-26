"use client";

// components/agent/AvatarUploader.tsx — "Foto Profil" di Profil Saya (M02): pilih foto (hingga 25 MB, JPG/PNG/WebP), pangkas dengan bingkai lingkaran (geser, zoom, putar 90 derajat),
// lalu browser mengecilkan ke 512x512 WebP (<3 MB) dan mengunggah: POST /agents/me/avatar/upload-url -> PUT berkas -> PUT /agents/me/avatar. "Hapus Foto" = DELETE /agents/me/avatar.
// Empat keadaan: idle, memproses/menyimpan (loading), galat (pesan berbahasa pengguna), sukses (halaman dimuat ulang). Profil harus sudah tersimpan lebih dulu.
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiClientError, api } from "@/lib/api-client";
import { loadSource, makeAvatar, pickProblem, putToSignedUrl, rotateSource, type Source } from "@/lib/media/image-processing";
import { CROP_MAX_ZOOM, centerCrop, clampCrop, sourceRect, zoomAtCenter, type CropState } from "@/lib/media/variants";

const FRAME = 280;
type Target = { path: string; upload_url: string };

export function AvatarUploader({ name, avatarUrl, profileExists }: { name: string; avatarUrl: string | null; profileExists: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [src, setSrc] = useState<Source | null>(null);
  const [crop, setCrop] = useState<CropState>({ zoom: 1, x: 0, y: 0 });
  const [busy, setBusy] = useState<"idle" | "open" | "save" | "remove">("idle");
  const [error, setError] = useState<string | null>(null);
  const [cropError, setCropError] = useState<string | null>(null);

  // Gambar ulang pratinjau setiap posisi/zoom berubah.
  useEffect(() => {
    const cv = canvasRef.current;
    if (!src || !cv) return;
    const r = sourceRect(src.width, src.height, FRAME, crop);
    const ctx = cv.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, FRAME, FRAME);
    ctx.drawImage(src.canvas, r.sx, r.sy, r.size, r.size, 0, 0, FRAME, FRAME);
  }, [src, crop]);

  async function onPick(files: FileList | null) {
    const f = files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!f) return;
    setError(null);
    const problem = pickProblem(f);
    if (problem) return setError(problem);
    setBusy("open");
    try {
      const s = await loadSource(f);
      setSrc(s);
      setCrop(centerCrop(s.width, s.height, FRAME));
      setCropError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto tidak bisa dibuka. Coba foto lain.");
    } finally {
      setBusy("idle");
    }
  }

  const move = useCallback(
    (dx: number, dy: number) => {
      if (!src) return;
      setCrop((c) => clampCrop(src.width, src.height, FRAME, { ...c, x: c.x + dx, y: c.y + dy }));
    },
    [src],
  );

  function rotate() {
    if (!src) return;
    const r = rotateSource(src);
    setSrc(r);
    setCrop(centerCrop(r.width, r.height, FRAME));
  }

  async function save() {
    if (!src) return;
    setBusy("save");
    setCropError(null);
    try {
      const enc = await makeAvatar(src, sourceRect(src.width, src.height, FRAME, crop));
      const t = await api.post<Target>("/agents/me/avatar/upload-url", { content_type: enc.type }, { idempotency: true });
      await putToSignedUrl(t.data.upload_url, enc.blob, enc.type);
      await api.put("/agents/me/avatar", { path: t.data.path }, { idempotency: true });
      setSrc(null);
      router.refresh();
    } catch (e) {
      setCropError(e instanceof ApiClientError ? e.message : e instanceof Error && e.message !== "upload" ? e.message : "Unggah foto gagal. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy("idle");
    }
  }

  async function remove() {
    setBusy("remove");
    setError(null);
    try {
      await api.delete("/agents/me/avatar");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Foto belum bisa dihapus. Coba lagi.");
    } finally {
      setBusy("idle");
    }
  }

  const saving = busy === "save";
  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} imageUrl={avatarUrl} size={72} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} id="avatar-file" type="file" accept="image/*" className="sr-only" onChange={(e) => void onPick(e.target.files)} disabled={!profileExists || busy !== "idle"} />
          <Button variant="secondary" size="sm" disabled={!profileExists} loading={busy === "open"} onClick={() => fileRef.current?.click()}>
            {avatarUrl ? "Ganti Foto" : "Unggah Foto"}
          </Button>
          {avatarUrl ? (
            <Button variant="ghost" size="sm" className="text-danger-600" loading={busy === "remove"} disabled={busy !== "idle"} onClick={() => void remove()}>
              Hapus Foto
            </Button>
          ) : null}
        </div>
        {error ? (
          <p role="alert" className="text-caption text-danger-600">
            {error}
          </p>
        ) : (
          <p className="text-caption">{profileExists ? "JPG, PNG, atau WebP hingga 25 MB. Foto dipangkas berbentuk lingkaran dan dikecilkan otomatis." : "Simpan profil Anda dulu, lalu unggah foto."}</p>
        )}
      </div>

      <Dialog
        open={src !== null}
        onClose={() => (saving ? undefined : setSrc(null))}
        title="Atur Foto Profil"
        description="Geser foto dan atur zoom sampai wajah Anda pas di dalam lingkaran."
        footer={
          <>
            <Button variant="secondary" disabled={saving} onClick={() => setSrc(null)}>
              Batal
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              {saving ? "Menyimpan…" : "Simpan Foto"}
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
              style={{ width: FRAME, height: FRAME, cursor: "grab" }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                drag.current = { px: e.clientX, py: e.clientY, x: crop.x, y: crop.y };
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d) return;
                setCrop((c) => clampCrop(src.width, src.height, FRAME, { ...c, x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py }));
              }}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onWheel={(e) => setCrop((c) => zoomAtCenter(src.width, src.height, FRAME, c, c.zoom - e.deltaY * 0.002))}
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
              <canvas ref={canvasRef} width={FRAME} height={FRAME} style={{ width: FRAME, height: FRAME }} />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(11,20,31,0.55)] ring-2 ring-white" />
            </div>

            <div className="flex w-full max-w-[280px] items-center gap-3">
              <label htmlFor="avatar-zoom" className="text-caption">
                Zoom
              </label>
              <input
                id="avatar-zoom"
                type="range"
                min={1}
                max={CROP_MAX_ZOOM}
                step={0.01}
                value={crop.zoom}
                onChange={(e) => setCrop((c) => zoomAtCenter(src.width, src.height, FRAME, c, Number(e.target.value)))}
                className="h-11 flex-1 accent-blue-600"
              />
              <Button variant="secondary" size="sm" onClick={rotate} disabled={saving}>
                Putar 90°
              </Button>
            </div>
            {cropError ? (
              <p role="alert" className="text-body-md text-danger-600">
                {cropError}
              </p>
            ) : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
