// components/agent/SubscriptionsView.tsx — Langganan Saya (M14, wireframe 01-Agent/M14-Langganan-Saya): paket saat ini (tanpa langganan aktif = Free), Paket Pro yang dijual (beli lewat dialog), dan semua
// langganan pribadi + organisasi dengan status turunan (aktif, segera berakhir, berakhir, dibatalkan, menunggu; status tak dikenal ditampilkan apa adanya dengan peringatan). Perpanjangan = pembelian baru, tidak
// ada mekanisme perpanjangan otomatis; "jadwal perpanjangan" hanyalah tanggal. Empat keadaan: memuat (loading.tsx), kosong, gagal, sukses, per bagian.
import Link from "next/link";
import type { Route } from "next";
import { CommercialTabs } from "@/components/agent/CommercialTabs";
import { PlanGrid } from "@/components/agent/PlanGrid";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { InfoIcon } from "@/components/ui/icons";
import type { SubscriptionItem, SubscriptionsData } from "@/lib/agent/commercial-data";
import { subscriptionStatus } from "@/lib/agent/commercial-rules";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

export type SubscriptionScopeFilter = "semua" | "pribadi" | "organisasi";
export const parseScopeFilter = (raw: string | string[] | undefined): SubscriptionScopeFilter => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "pribadi" || v === "organisasi" ? v : "semua";
};

const nf = new Intl.NumberFormat("id-ID");

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-title-md">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Snapshot({ data }: { data: Record<string, unknown> | null }) {
  const rows = Object.entries(data ?? {}).filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean");
  if (rows.length === 0) return <p className="text-caption">Tidak ada ringkasan pembelian tersimpan.</p>;
  return (
    <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-caption break-words">{k.replace(/_/g, " ")}</dt>
          <dd className="text-body-md break-words">{String(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

function SubscriptionRow({ s }: { s: SubscriptionItem }) {
  const st = subscriptionStatus(s.effective);
  return (
    <li className="flex flex-col gap-2 border-b border-ink-50 py-3.5 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-label-lg break-words">{s.productName}</span>
        <span className="flex flex-wrap items-center gap-2">
          <Badge tone={s.scope === "personal" ? "info" : "neutral"}>{s.scope === "personal" ? "Pribadi" : "Organisasi"}</Badge>
          <Badge tone={st.tone}>{st.label}</Badge>
        </span>
      </div>
      {s.effective === "unknown" ? (
        <p role="alert" className="text-caption text-danger-600">
          Status langganan ini (&quot;{s.status}&quot;) tidak dikenali aplikasi. Hubungi tim RumahAgen bila ada yang tidak sesuai.
        </p>
      ) : null}
      {s.ownerOrg ? <p className="text-caption">Organisasi: {s.ownerOrg}</p> : null}
      <p className="text-caption">
        {s.startsAt ? `Mulai ${formatDate(s.startsAt)}` : "Mulai —"} · {s.endsAt ? `Berakhir ${formatDate(s.endsAt)}` : "Tanpa tanggal berakhir"}
        {s.renewsAt ? ` · Jadwal perpanjangan ${formatDate(s.renewsAt)}` : ""}
        {s.daysLeft !== null ? ` · ${nf.format(s.daysLeft)} hari lagi` : ""}
      </p>
      {s.effective === "expiring" ? <p className="text-caption text-warning-600">Langganan Anda segera berakhir. Untuk melanjutkan, beli paket Pro di atas (beli lagi = langganan baru; masa baru ditumpuk setelah masa aktif).</p> : null}
      {s.scope === "personal" ? (
        <details>
          <summary className="cursor-pointer text-caption font-bold text-blue-600">Ringkasan pembelian</summary>
          <div className="mt-2 rounded-sm bg-ink-50 p-3">
            <Snapshot data={s.snapshot} />
            <p className="mt-2 text-caption">Syarat saat pembelian, tidak berubah walau harga berubah.</p>
          </div>
        </details>
      ) : null}
    </li>
  );
}

const FILTERS: { key: SubscriptionScopeFilter; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "pribadi", label: "Pribadi" },
  { key: "organisasi", label: "Organisasi" },
];

export function SubscriptionsView({ data, cakupan }: { data: SubscriptionsData; cakupan: SubscriptionScopeFilter }) {
  const subs = data.subscriptions.ok ? data.subscriptions.data : null;
  const current = subs?.current ?? null;
  const visible = subs ? subs.items.filter((s) => cakupan === "semua" || (cakupan === "pribadi" ? s.scope === "personal" : s.scope === "organization")) : [];
  const stackWarning = current
    ? `Anda masih punya paket ${current.productName} aktif${current.endsAt ? ` sampai ${formatDate(current.endsAt)}` : ""}. Beli lagi menumpuk masa aktif setelahnya dan mereset kuota Pro; sisa kuota Pro dari pembelian sebelumnya hilang.`
    : null;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <h1 className="text-headline">Komersial</h1>
      <CommercialTabs active="langganan" />

      <p role="note" className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-info-100 p-3.5 text-body-md text-ink-900">
        <InfoIcon size={17} className="mt-0.5 flex-none text-info-600" />
        <span>Beli paket Pro di bagian Paket Pro. Beli lagi = langganan baru (tidak ada perpanjangan): masa aktif ditumpuk dan kuota Pro direset. Riwayat langganan pribadi dan organisasi tampil di bawah.</span>
      </p>

      <Card title="Paket saat ini">
        {!subs ? (
          <ErrorState title="Paket saat ini gagal dimuat" message="Periksa koneksi Anda lalu coba lagi." className="py-6" />
        ) : current ? (
          <div className="flex flex-col gap-1">
            <p className="text-headline">{current.productName}</p>
            <p className="text-body-md">{current.endsAt ? `Berlaku sampai ${formatDate(current.endsAt)}` : "Tanpa tanggal berakhir"}</p>
            {current.ownerOrg ? <p className="text-caption">Dibayar oleh {current.ownerOrg}</p> : null}
            {current.effective === "expiring" ? <p className="text-body-md text-warning-600">Langganan Anda segera berakhir.</p> : null}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-headline">Free</p>
            <p className="text-body-md">Anda belum memiliki langganan aktif, sehingga memakai paket Free dengan fitur dasar.</p>
          </div>
        )}
      </Card>

      <Card title="Paket Pro" right={<span className="text-caption">Menambah kuota penerbitan listing di atas kuota Gratis</span>}>
        {!data.plans.ok ? (
          <>
            <ErrorState title="Paket Pro gagal dimuat" message="Terjadi gangguan saat mengambil paket. Tidak ada pembelian yang diproses." className="py-6" />
            <div className="flex justify-center">
              <LinkButton href={"/agent/komersial/langganan" as Route} variant="secondary" size="sm">
                Coba Lagi
              </LinkButton>
            </div>
          </>
        ) : data.plans.data.length === 0 ? (
          <EmptyState title="Belum ada paket Pro yang dijual" message="Paket akan tampil di sini setelah tim RumahAgen mengaktifkannya." className="py-6" />
        ) : (
          <PlanGrid plans={data.plans.data} leaderOrgs={data.leaderOrgs} memberOnlyOrgs={data.memberOnlyOrgs} defaultOrgId={data.defaultOrgId} stackWarning={stackWarning} />
        )}
      </Card>

      <Card title="Semua Langganan" right={subs ? <span className="text-caption">{subs.items.length} langganan</span> : undefined}>
        {subs ? (
          <nav aria-label="Filter cakupan" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={(f.key === "semua" ? "/agent/komersial/langganan" : `/agent/komersial/langganan?cakupan=${f.key}`) as Route}
                aria-current={cakupan === f.key ? "page" : undefined}
                className={cn(
                  "inline-flex h-10 items-center rounded-pill border-[1.5px] px-4 text-[13px] font-bold no-underline hover:no-underline",
                  cakupan === f.key ? "border-blue-600 bg-blue-600 text-white hover:text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500",
                )}
              >
                {f.label}
              </Link>
            ))}
          </nav>
        ) : null}
        {!subs ? (
          <>
            <ErrorState title="Langganan gagal dimuat" message="Periksa koneksi Anda lalu coba lagi." className="py-6" />
            <div className="flex justify-center">
              <LinkButton href={"/agent/komersial/langganan" as Route} variant="secondary" size="sm">
                Coba Lagi
              </LinkButton>
            </div>
          </>
        ) : subs.items.length === 0 ? (
          <EmptyState title="Belum ada riwayat langganan" message="Anda memakai paket Free. Langganan yang aktif akan tampil di sini." className="py-6" />
        ) : visible.length === 0 ? (
          <EmptyState title="Tidak ada langganan pada cakupan ini" message="Pilih cakupan lain untuk melihat langganan Anda." className="py-6" />
        ) : (
          <ul>
            {visible.map((s) => (
              <SubscriptionRow key={s.id} s={s} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
