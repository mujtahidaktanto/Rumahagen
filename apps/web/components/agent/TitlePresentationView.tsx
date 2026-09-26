"use client";

// components/agent/TitlePresentationView.tsx — Presentasi Title (M15, wireframe 01-Agent/37): atur title mana yang tampil di profil publik + urutan (maks 1 utama + 3 tambahan).
// <=4 award: semua wajib tampil (pilih urutan saja). >4: Agent bebas pilih. PUT /agents/me/awards/presentation { primary_title_id, additional_title_ids[] } (RPC set_my_public_titles,
// 0148) mengganti SELURUH pilihan sekaligus — disimpan hanya saat tombol Simpan ditekan (bukan tiap klik), supaya perubahan bisa dibatalkan.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { ChevronUpIcon, SparkleIcon } from "@/components/ui/icons";
import type { HeldTitle, LockedTitle } from "@/lib/agent/qualification-data";
import type { Part } from "@/lib/agent/dashboard-data";
import { canCustomizeTitleSelection, titlePresentationRuleText } from "@/lib/agent/qualification-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { initialsOf } from "@/lib/initials";

const df = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });

type Props = { held: Part<HeldTitle[]>; locked: Part<LockedTitle[]>; primaryId: string | null; additionalIds: string[]; agentName: string };

export function TitlePresentationView({ held, locked, primaryId, additionalIds, agentName }: Props) {
  if (!held.ok) {
    return (
      <div className="mx-auto w-full max-w-[1100px] p-4 lg:p-8">
        <h1 className="mb-4 text-headline">Presentasi Title</h1>
        <ErrorState title="Daftar title gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      </div>
    );
  }
  return (
    <TitlePresentationEditor heldTitles={held.data} locked={locked.ok ? locked.data : []} initialPrimary={primaryId} initialAdditional={additionalIds} agentName={agentName} />
  );
}

function TitlePresentationEditor({
  heldTitles,
  locked,
  initialPrimary,
  initialAdditional,
  agentName,
}: {
  heldTitles: HeldTitle[];
  locked: LockedTitle[];
  initialPrimary: string | null;
  initialAdditional: string[];
  agentName: string;
}) {
  const router = useRouter();
  const savedSelection = initialPrimary ? [initialPrimary, ...initialAdditional] : [];
  const [selection, setSelection] = useState<string[]>(savedSelection);
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = new Map(heldTitles.map((t) => [t.titleDefinitionId, t]));
  const customizable = canCustomizeTitleSelection(heldTitles.length);
  const shown = selection.map((id) => byId.get(id)).filter((t): t is HeldTitle => !!t);
  const hiddenTitles = customizable ? heldTitles.filter((t) => !selection.includes(t.titleDefinitionId)) : [];
  const dirty = selection.join(",") !== savedSelection.join(",");
  const ruleText = titlePresentationRuleText(heldTitles.length);

  function commit(next: string[]) {
    setSelection(next);
    setSavedFlag(false);
    setError(null);
  }
  function makePrimary(id: string) {
    commit([id, ...selection.filter((x) => x !== id)]);
  }
  function moveUp(i: number) {
    if (i <= 1) return;
    const next = selection.slice();
    [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
    commit(next);
  }
  function moveDown(i: number) {
    if (i >= selection.length - 1) return;
    const next = selection.slice();
    [next[i], next[i + 1]] = [next[i + 1]!, next[i]!];
    commit(next);
  }
  function hide(id: string) {
    commit(selection.filter((x) => x !== id));
  }
  function show(id: string) {
    if (selection.length >= 4) return;
    commit([...selection, id]);
  }
  function discard() {
    setSelection(savedSelection);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await api.put("/agents/me/awards/presentation", { primary_title_id: selection[0] ?? null, additional_title_ids: selection.slice(1) }, { idempotency: true });
      setSavedFlag(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 pb-8 lg:p-8">
      <h1 className="text-headline">Presentasi Title</h1>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex gap-3 rounded-md border border-blue-200 bg-info-100 p-3.5">
            <p className="text-body-md">
              Profil publik Anda menampilkan <strong>maksimal 1 title utama + 3 tambahan</strong>. Punya 1 title: otomatis menjadi utama. Punya 2–4 title: semuanya tampil, Anda memilih satu
              sebagai utama. Punya lebih dari 4: Anda menentukan sendiri mana yang tampil dan urutannya. Title yang tidak tampil <strong>tetap sah</strong> Anda miliki.
            </p>
          </div>

          {heldTitles.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 rounded-md border border-ink-100 bg-white px-5 py-14 text-center">
              <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <SparkleIcon size={26} />
              </span>
              <p className="text-body-md text-ink-500">Belum ada title yang bisa ditampilkan</p>
              <p className="text-caption">Title muncul di sini setelah award Anda aktif.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
                <div className="border-b border-ink-100 px-5 py-3.5">
                  <p className="text-title-md">Title yang tampil ({shown.length} dari maks 4)</p>
                  <p className="text-caption">{ruleText}</p>
                </div>
                <ul>
                  {shown.map((t, i) => (
                    <li key={t.titleDefinitionId} className="flex flex-wrap items-center gap-3 border-t border-ink-50 px-5 py-3.5">
                      {i === 0 ? (
                        <span aria-hidden="true" className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gold-500 text-white">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.3l7.1-.7L12 2Z" />
                          </svg>
                        </span>
                      ) : (
                        <span className="flex flex-none flex-col gap-1">
                          <button
                            type="button"
                            aria-label={`Naikkan ${t.titleName}`}
                            disabled={i <= 1}
                            onClick={() => moveUp(i)}
                            className="flex h-[22px] w-9 items-center justify-center rounded-sm border border-ink-100 text-ink-700 disabled:opacity-40"
                          >
                            <ChevronUpIcon size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Turunkan ${t.titleName}`}
                            disabled={i === shown.length - 1}
                            onClick={() => moveDown(i)}
                            className="flex h-[22px] w-9 items-center justify-center rounded-sm border border-ink-100 text-ink-700 disabled:opacity-40"
                          >
                            <ChevronUpIcon size={14} className="rotate-180" />
                          </button>
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-label-lg">{t.titleName}</p>
                        <span className="text-caption">
                          {i === 0 ? "Utama" : `Tambahan ${i}`} · Diberikan {df.format(new Date(t.issuedAt))}
                        </span>
                      </div>
                      {i > 0 ? (
                        <Button variant="secondary" size="sm" onClick={() => makePrimary(t.titleDefinitionId)}>
                          Jadikan Utama
                        </Button>
                      ) : null}
                      {customizable && shown.length > 1 ? (
                        <Button variant="secondary" size="sm" onClick={() => hide(t.titleDefinitionId)}>
                          Sembunyikan
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              {hiddenTitles.length > 0 ? (
                <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
                  <div className="border-b border-ink-100 px-5 py-3.5">
                    <p className="text-title-md">Title lain yang Anda miliki</p>
                    <p className="text-caption">Belum tampil di profil publik. Tampilkan bila ada slot kosong.</p>
                  </div>
                  <ul>
                    {hiddenTitles.map((t) => (
                      <li key={t.titleDefinitionId} className="flex flex-wrap items-center gap-3 border-t border-ink-50 px-5 py-3.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-label-lg">{t.titleName}</p>
                          <span className="text-caption">Diberikan {df.format(new Date(t.issuedAt))}</span>
                          {selection.length >= 4 ? <span className="block text-caption text-warning-600">Sudah 4 title tampil: sembunyikan salah satu dulu.</span> : null}
                        </div>
                        <Button variant="secondary" size="sm" disabled={selection.length >= 4} onClick={() => show(t.titleDefinitionId)}>
                          Tampilkan
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {locked.length > 0 ? (
                <div className="flex flex-col gap-2.5 rounded-md border border-ink-100 bg-white p-5">
                  <p className="text-title-md">Tidak bisa ditampilkan</p>
                  {locked.map((l, i) => (
                    <div key={i} className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-label-lg">{l.titleName}</p>
                        <span className="text-caption">{l.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="flex w-full flex-none flex-col items-center gap-2 rounded-md border border-ink-100 bg-white p-5 text-center lg:w-[300px]">
          <span className="self-start text-caption text-ink-500">{dirty ? "Pratinjau (belum disimpan)" : "Pratinjau Profil Publik"}</span>
          <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[22px] font-extrabold text-blue-600">
            {initialsOf(agentName)}
          </span>
          <span className="text-title-md">{agentName}</span>
          <div className="mt-1 flex flex-wrap justify-center gap-1.5">
            {shown.length === 0 ? (
              <span className="text-caption">Tidak ada title ditampilkan</span>
            ) : (
              shown.map((t, i) => (
                <span key={t.titleDefinitionId} className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[12px] font-bold ${i === 0 ? "bg-gold-500 text-white" : "bg-gold-100 text-gold-700"}`}>
                  {i === 0 ? "★ " : ""}
                  {t.titleName}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-white/95 p-4 backdrop-blur">
        <div className="flex items-center gap-2">
          {dirty ? <span className="rounded-pill bg-warning-100 px-2.5 py-1 text-[12px] font-bold text-warning-600">Perubahan belum disimpan</span> : null}
          {!dirty && savedFlag ? <span className="rounded-pill bg-success-100 px-2.5 py-1 text-[12px] font-bold text-success-600">Tersimpan</span> : null}
          {error ? (
            <span role="alert" className="text-caption text-danger-600">
              {error}
            </span>
          ) : null}
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" disabled={!dirty} onClick={discard}>
            Batalkan Perubahan
          </Button>
          <Button loading={saving} disabled={!dirty} onClick={() => void save()}>
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}
