"use client";

// components/admin/CertificateIssuanceTool.tsx — "Penerbitan Sertifikat" (Ekonomi Pembelajaran, tab Poin & Sertifikat): POST /admin/certificates { agent_id, course_id },
// membungkus admin_issue_certificate() (0150) — nomor sertifikat & kode verifikasi dibuat server, idempotent per agent+course. Wireframe punya field "URL sertifikat (opsional)"
// tapi issueCertificateSchema tidak menerima parameter itu — field tidak ditampilkan agar tidak menjanjikan sesuatu yang tak berfungsi.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import type { AgentPickerRow, CoursePickerRow } from "@/lib/admin/learning-economy-data";
import { ApiClientError, api } from "@/lib/api-client";

export function CertificateIssuanceTool({ agents, courses }: { agents: AgentPickerRow[]; courses: CoursePickerRow[] }) {
  const router = useRouter();
  const [agentQuery, setAgentQuery] = useState("");
  const [agent, setAgent] = useState<AgentPickerRow | null>(null);
  const [courseQuery, setCourseQuery] = useState("");
  const [course, setCourse] = useState<CoursePickerRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const agentMatches = useMemo(() => {
    const q = agentQuery.trim().toLowerCase();
    if (!q || agent) return [];
    return agents.filter((a) => a.name.toLowerCase().includes(q) || (a.email ?? "").toLowerCase().includes(q)).slice(0, 8);
  }, [agentQuery, agents, agent]);

  const courseMatches = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    if (!q || course) return [];
    return courses.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [courseQuery, courses, course]);

  const canIssue = !!agent && !!course;

  async function issue() {
    if (!agent || !course) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post("/admin/certificates", { agent_id: agent.id, course_id: course.id }, { idempotency: true });
      setSuccess(`Sertifikat untuk ${agent.name} — ${course.title} berhasil diterbitkan.`);
      setAgent(null);
      setAgentQuery("");
      setCourse(null);
      setCourseQuery("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil diterbitkan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5">
      <span className="text-title-md">Penerbitan Sertifikat</span>
      <p className="text-caption">Bungkus admin_issue_certificate() (0150) — nomor & kode verifikasi dibuat otomatis, idempotent per agent+kursus.</p>

      <Field label="Agent" required>
        {(a) => (
          <div className="relative">
            <Input
              {...a}
              value={agent ? agent.name : agentQuery}
              onChange={(e) => {
                setAgent(null);
                setAgentQuery(e.target.value);
              }}
              placeholder="Cari nama/email agent…"
            />
            {agentMatches.length > 0 ? (
              <div className="absolute z-10 mt-1 w-full rounded-sm border border-ink-100 bg-white shadow-2">
                {agentMatches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-[13px] hover:bg-ink-50"
                    onClick={() => {
                      setAgent(m);
                      setAgentQuery("");
                    }}
                  >
                    {m.name} {m.email ? <span className="text-ink-300">· {m.email}</span> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Field>

      <Field label="Kursus" required>
        {(a) => (
          <div className="relative">
            <Input
              {...a}
              value={course ? course.title : courseQuery}
              onChange={(e) => {
                setCourse(null);
                setCourseQuery(e.target.value);
              }}
              placeholder="Cari judul kursus…"
            />
            {courseMatches.length > 0 ? (
              <div className="absolute z-10 mt-1 w-full rounded-sm border border-ink-100 bg-white shadow-2">
                {courseMatches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-[13px] hover:bg-ink-50"
                    onClick={() => {
                      setCourse(c);
                      setCourseQuery("");
                    }}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Field>

      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
      {success ? <p className="text-body-md text-success-600">{success}</p> : null}

      <Button loading={busy} disabled={!canIssue} onClick={() => void issue()}>
        Terbitkan Sertifikat
      </Button>
    </div>
  );
}
