// components/public/RatingStars.tsx — peringkat bintang (1-5) untuk ulasan agen. RatingValue: bintang tunggal + angka + jumlah ("4.8 (126 ulasan)"); RatingStars: lima bintang untuk satu ulasan.
import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { RatingSummary } from "@/lib/public/agent-reviews";

export function RatingStars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span role="img" aria-label={`${rating} dari 5 bintang`} className={cn("inline-flex gap-0.5 text-gold-700", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} size={size} className={n <= rating ? "fill-current" : "text-ink-100"} />
      ))}
    </span>
  );
}

/** "★ 4.8 (126 ulasan)"; tanpa ulasan -> "Belum ada ulasan". */
export function RatingValue({ summary, className }: { summary: RatingSummary | undefined; className?: string }) {
  if (!summary || summary.count === 0 || summary.average === null) return <span className={cn("text-caption", className)}>Belum ada ulasan</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-caption", className)}>
      <StarIcon size={14} className="fill-current text-gold-700" />
      <strong className="text-ink-900">{summary.average.toFixed(1)}</strong>
      <span>({new Intl.NumberFormat("id-ID").format(summary.count)} ulasan)</span>
    </span>
  );
}
