// lib/validation/project-uploads.ts
// POST /developer-projects/{id}/uploads — meminta signed upload URL untuk media atau marketing kit (migration 0147).

import { z } from "zod";
import { MAX_KIT_BYTES, MAX_MEDIA_BYTES, MEDIA_CONTENT_TYPES } from "@/lib/storage/project-files";

export const createProjectUploadSchema = z
  .object({
    kind: z.enum(["media", "marketing_kit"]),
    file_name: z.string().trim().min(1).max(255),
    content_type: z.string().trim().min(1).max(100),
    size_bytes: z.number().int().positive().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "media") {
      if (!(v.content_type in MEDIA_CONTENT_TYPES)) {
        ctx.addIssue({ code: "custom", path: ["content_type"], message: "Media hanya JPEG, PNG, WebP, atau MP4." });
      }
      if (v.size_bytes !== undefined && v.size_bytes > MAX_MEDIA_BYTES) {
        ctx.addIssue({ code: "custom", path: ["size_bytes"], message: "Ukuran media maksimal 50 MB." });
      }
    } else {
      if (v.content_type !== "application/pdf") {
        ctx.addIssue({ code: "custom", path: ["content_type"], message: "Marketing kit hanya PDF." });
      }
      if (v.size_bytes !== undefined && v.size_bytes > MAX_KIT_BYTES) {
        ctx.addIssue({ code: "custom", path: ["size_bytes"], message: "Ukuran marketing kit maksimal 20 MB." });
      }
    }
  });
export type CreateProjectUploadInput = z.infer<typeof createProjectUploadSchema>;
