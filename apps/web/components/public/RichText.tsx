// components/public/RichText.tsx — menyajikan teks konten (lib/public/rich-text.ts) sebagai paragraf, subjudul, dan daftar bertipografi nyaman (setara .prose di wireframe). Tanpa HTML mentah.
import { parseContent } from "@/lib/public/rich-text";

export function RichText({ text, empty }: { text: string | null | undefined; empty?: string }) {
  const blocks = parseContent(text);
  if (blocks.length === 0) return empty ? <p className="text-body-md text-ink-500">{empty}</p> : null;
  return (
    <div className="flex flex-col gap-4 break-words">
      {blocks.map((b, i) =>
        b.type === "heading" ? (
          <h2 key={i} className="mt-4 text-title-lg text-ink-900">
            {b.text}
          </h2>
        ) : b.type === "list" ? (
          <ul key={i} className="ml-5 flex list-disc flex-col gap-1.5 text-body-lg text-ink-700" style={{ lineHeight: "26px" }}>
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="text-body-lg text-ink-700" style={{ lineHeight: "26px" }}>
            {b.text}
          </p>
        ),
      )}
    </div>
  );
}
