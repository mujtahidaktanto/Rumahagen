// lib/public/whatsapp-message.ts — teks pesan awal saat calon pembeli menekan "Chat via WhatsApp" di Detail Listing. Dibuat agar agen langsung tahu listing mana yang ditanyakan
// (judul, harga, lokasi, tipe, kode listing, dan tautan halaman), tanpa pembeli mengetik apa pun. Murni dan diuji.
import { formatListingPrice } from "@/lib/format";

export type WhatsAppMessageInput = {
  agentName?: string | null;
  title: string;
  slug: string;
  id: string;
  price: number;
  priceUnit: string | null;
  transactionType: "sale" | "rent";
  propertyTypeLabel: string;
  cityName?: string | null;
  provinceName?: string | null;
  /** Alamat situs tanpa garis miring akhir, mis. https://rumahagen.com */
  siteUrl: string;
};

/** Kode listing pendek untuk rujukan cepat: "RA-" + 8 karakter pertama id (huruf besar). Tautan tetap penanda utama yang tepat. */
export function listingCode(id: string): string {
  return `RA-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/** Tanda * dan _ membuat teks tercetak miring/tebal di WhatsApp; dihapus dari judul agar format pesan tidak rusak. */
const plain = (s: string) => s.replace(/[*_~`]/g, "").replace(/\s+/g, " ").trim();

/** Pesan awal dari profil agen (tanpa listing tertentu): memuat tautan profil agar agen tahu dari mana calon klien datang. */
export function buildAgentWhatsAppMessage(i: { agentName: string; slug: string; siteUrl: string }): string {
  return [
    `Halo Kak ${plain(i.agentName)},`,
    "",
    "Saya menemukan profil Anda di RumahAgen.com dan ingin bertanya seputar properti.",
    `• Profil: ${i.siteUrl.replace(/\/+$/, "")}/agen/${i.slug}`,
    "",
    "Boleh saya berkonsultasi mengenai properti yang sedang saya cari?",
    "",
    "Terima kasih.",
  ].join("\n");
}

export function buildListingWhatsAppMessage(i: WhatsAppMessageInput): string {
  const location = [i.cityName, i.provinceName].filter(Boolean).join(", ");
  const name = i.agentName ? plain(i.agentName) : "";
  const lines = [
    name ? `Halo Kak ${name},` : "Halo,",
    "",
    "Saya melihat listing Anda di RumahAgen.com dan tertarik dengan properti berikut:",
    "",
    `*${plain(i.title)}*`,
    `• Harga: ${formatListingPrice(i.price, i.priceUnit)}`,
    ...(location ? [`• Lokasi: ${location}`] : []),
    `• Tipe: ${i.propertyTypeLabel} (${i.transactionType === "sale" ? "Dijual" : "Disewa"})`,
    `• Kode listing: ${listingCode(i.id)}`,
    `• Tautan: ${i.siteUrl.replace(/\/+$/, "")}/listing/${i.slug}`,
    "",
    "Apakah properti ini masih tersedia? Boleh saya minta informasi lebih detail (kondisi properti, kemungkinan nego, dan jadwal survei)?",
    "",
    "Terima kasih.",
  ];
  return lines.join("\n");
}
