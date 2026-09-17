// app/api/learning/sessions/[id]/assignments/route.ts
// ADD-NEW — STEP11-B5 membahas Q-M04-G-01 (Session Assign) dan Q-M04-G-02
// (Assignment Capability Enforcement) sebagai "NEWLY EXPLICIT / COVERED"
// tanpa memberi API ID spesifik ("resource assignment, not new role" —
// dijelaskan sebagai konsep, bukan endpoint). Tabel+RLS
// `learning_session_assignments` sudah lengkap sejak 0021 (HOST/INSTRUCTOR
// capability, Superadmin/Admin/Manager-only assign per Gate §28 — Instructor/
// Agent TIDAK bisa menugaskan diri sendiri) — endpoint ini yang
// menjangkaunya lewat HTTP.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createAssignmentSchema } from "@/lib/validation/learning-sessions";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_session_assignments")
    .select("*")
    .eq("session_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createAssignmentSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learning_session_assignments")
    .insert({ ...body, session_id: ctx.params.id, created_by: ctx.userId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return { data, status: 201 };
});
