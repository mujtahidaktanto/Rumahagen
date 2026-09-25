// lib/cn.ts — gabungkan nama kelas Tailwind dengan aman (kelas yang bentrok, mis. px-2 dan px-4, diselesaikan: yang terakhir menang).
// twMerge dikenalkan pada skala tipografi, bayangan, dan radius kustom RumahAgen (app/globals.css @theme); tanpa ini `text-title-md` dan `text-ink-500`
// dianggap bentrok (sama-sama "text-*") dan salah satunya terbuang.
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "headline", "title-lg", "title-md", "body-lg", "body-md", "label-lg", "label-md", "caption"] }],
      shadow: [{ shadow: ["1", "2", "3"] }],
      rounded: [{ rounded: ["pill"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
