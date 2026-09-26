"use client";

// components/agent/AiAssistantView.tsx — AI Assistant (M13, wireframe 01-Agent/M13-AI-Assistant): chat dengan koneksi BYOK aktif milik sendiri lewat POST /ai-assistant/chat. Riwayat percakapan
// HANYA di memori (Transient AI Chat Frame — tidak ada tabel penyimpanan pesan di skema M13); pindah koneksi atau memuat ulang halaman mengosongkan riwayat.
import type { Route } from "next";
import { useState } from "react";
import { LinkButton, Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { SparkleIcon } from "@/components/ui/icons";
import type { ActiveAiConnection } from "@/lib/agent/ai-data";
import type { Part } from "@/lib/agent/dashboard-data";
import { aiModelOptionsFor } from "@/lib/agent/ai-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { initialsOf } from "@/lib/initials";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function AiAssistantView({ data, agentName }: { data: Part<ActiveAiConnection[]>; agentName: string }) {
  if (!data.ok) {
    return (
      <div className="mx-auto w-full max-w-[820px] p-4 lg:p-8">
        <h1 className="mb-4 text-headline">AI Assistant</h1>
        <ErrorState title="Koneksi AI gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      </div>
    );
  }
  return <AiAssistantChat connections={data.data} agentName={agentName} />;
}

function AiAssistantChat({ connections, agentName }: { connections: ActiveAiConnection[]; agentName: string }) {
  const [connectionId, setConnectionId] = useState(connections[0]?.id ?? "");
  const modelOptions = aiModelOptionsFor(connections.find((c) => c.id === connectionId)?.providerCode ?? "");
  const [model, setModel] = useState(modelOptions[0]?.value ?? "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (connections.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[820px] flex-col items-center gap-3.5 p-4 py-20 text-center lg:p-8">
        <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <SparkleIcon size={30} />
        </span>
        <p className="max-w-sm text-body-md text-ink-500">Anda belum punya koneksi AI yang aktif. Hubungkan provider AI (BYOK) dulu untuk mulai memakai AI Assistant.</p>
        <LinkButton href={"/agent/ai" as Route} size="sm">
          Hubungkan Provider AI
        </LinkButton>
      </div>
    );
  }

  async function send() {
    const text = input.trim();
    if (!text || busy || !connectionId) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ reply: { role: string; content: string }; model: string }>(
        "/ai-assistant/chat",
        { connection_id: connectionId, messages: next, ...(model ? { model } : {}) },
        { idempotency: true },
      );
      setMessages((cur) => [...cur, { role: "assistant", content: res.data.reply.content }]);
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Pesan belum terkirim. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline">AI Assistant</h1>
        <div className="flex items-center gap-2.5">
          {connections.length > 1 ? (
            <Select
              aria-label="Pilih koneksi AI"
              value={connectionId}
              onChange={(e) => {
                const nextId = e.target.value;
                setConnectionId(nextId);
                setModel(aiModelOptionsFor(connections.find((c) => c.id === nextId)?.providerCode ?? "")[0]?.value ?? "");
                setMessages([]);
                setError(null);
              }}
              className="h-9 w-auto"
            >
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.providerName}
                </option>
              ))}
            </Select>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-label-lg">
              <span className="text-gold-600">
                <SparkleIcon size={15} />
              </span>
              {connections[0]!.providerName}
            </span>
          )}
          {modelOptions.length > 0 ? (
            <Select aria-label="Pilih model" value={model} onChange={(e) => setModel(e.target.value)} className="h-9 w-auto">
              {modelOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          ) : null}
          <LinkButton href={"/agent/ai" as Route} variant="secondary" size="sm">
            Kelola Koneksi
          </LinkButton>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {messages.length === 0 ? <p className="py-10 text-center text-body-md text-ink-500">Tanyakan apa saja seputar listing, deskripsi properti, atau strategi closing — AI Assistant siap membantu.</p> : null}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-[12px] font-bold ${m.role === "user" ? "bg-blue-100 text-blue-600" : "bg-gold-100 text-gold-700"}`}
            >
              {m.role === "user" ? initialsOf(agentName) : "AI"}
            </span>
            <div
              className={`max-w-[520px] rounded-md px-4 py-3 text-body-md whitespace-pre-wrap ${
                m.role === "user" ? "rounded-tr-[2px] bg-blue-600 text-white" : "rounded-tl-[2px] border border-ink-100 bg-white"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy ? <p className="text-caption text-ink-500">AI sedang mengetik…</p> : null}
      </div>

      <div className="sticky bottom-0 flex flex-col gap-2 border-t border-ink-100 bg-white/95 py-3 backdrop-blur">
        {error ? (
          <p role="alert" className="text-caption text-danger-600">
            {error}
          </p>
        ) : null}
        <div className="flex items-end gap-2.5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Tulis pesan ke AI Assistant…"
            rows={1}
            className="max-h-[140px] min-h-[48px] flex-1 resize-none py-3"
          />
          <Button loading={busy} onClick={() => void send()}>
            Kirim
          </Button>
        </div>
      </div>
    </div>
  );
}
