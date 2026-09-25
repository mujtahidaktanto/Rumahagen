// components/public/ListingFilters.tsx — isi panel filter Discovery (Server Component; berada di dalam <form method="get"> milik halaman): jenis transaksi, tipe properti,
// rentang harga, kamar tidur/mandi minimal, fasilitas. Kolom tanpa JS: nilai tersimpan di URL saat "Terapkan Filter" ditekan.
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/Button";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL, listingQuery, type ListingSearch } from "@/lib/public/listing-params";
import type { Amenity } from "@/lib/public/listing-search";

const pill =
  "inline-flex h-9 min-w-10 cursor-pointer items-center justify-center rounded-sm border-[1.5px] border-ink-100 px-2.5 text-[13px] font-bold text-ink-700 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)]";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-[13px] font-bold text-ink-900">{title}</legend>
      {children}
    </fieldset>
  );
}

function PillGroup({ name, values, current, label }: { name: string; values: number[]; current: number | null; label: (n: number) => string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <label>
        <input type="radio" name={name} value="" defaultChecked={current === null} className="peer sr-only" />
        <span className={pill}>Semua</span>
      </label>
      {values.map((n) => (
        <label key={n}>
          <input type="radio" name={name} value={n} defaultChecked={current === n} className="peer sr-only" />
          <span className={pill}>{label(n)}</span>
        </label>
      ))}
    </div>
  );
}

const inputCls =
  "h-10 w-full min-w-0 rounded-sm border-[1.5px] border-ink-100 bg-white px-2.5 text-[13px] text-ink-900 placeholder:text-ink-300 focus-visible:border-blue-500 focus-visible:shadow-[0_0_0_3px_var(--color-blue-100)] focus-visible:outline-none";

export function ListingFilters({ search, amenities }: { search: ListingSearch; amenities: Amenity[] }) {
  const resetHref = `/listing${listingQuery(search, { jenis: [], min: null, max: null, kt: null, km: null, fasilitas: [], tampil: 12 })}`;
  return (
    <div className="flex flex-col gap-5 rounded-md border border-ink-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-title-md">Filter</span>
        <Link href={resetHref as Route} className="text-label-lg">
          Reset
        </Link>
      </div>

      <Group title="Tipe Properti">
        {PROPERTY_TYPES.map((t) => (
          <label key={t} className="flex min-h-8 cursor-pointer items-center gap-2.5">
            <input type="checkbox" name="jenis" value={t} defaultChecked={search.jenis.includes(t)} className="h-[18px] w-[18px] accent-blue-600" />
            <span className="text-body-md">{PROPERTY_TYPE_LABEL[t]}</span>
          </label>
        ))}
      </Group>

      <Group title="Rentang Harga">
        <div className="flex items-center gap-2">
          <input type="number" name="min" min={0} inputMode="numeric" placeholder="Rp Min" aria-label="Harga minimum (Rp)" defaultValue={search.min ?? ""} className={inputCls} />
          <span className="text-caption">–</span>
          <input type="number" name="max" min={0} inputMode="numeric" placeholder="Rp Max" aria-label="Harga maksimum (Rp)" defaultValue={search.max ?? ""} className={inputCls} />
        </div>
      </Group>

      <Group title="Kamar Tidur">
        <PillGroup name="kt" values={[1, 2, 3, 4]} current={search.kt} label={(n) => `${n}+`} />
      </Group>

      <Group title="Kamar Mandi">
        <PillGroup name="km" values={[1, 2, 3]} current={search.km} label={(n) => `${n}+`} />
      </Group>

      {amenities.length > 0 ? (
        <Group title="Fasilitas">
          {amenities.map((a) => (
            <label key={a.id} className="flex min-h-8 cursor-pointer items-center gap-2.5">
              <input type="checkbox" name="fasilitas" value={a.id} defaultChecked={search.fasilitas.includes(a.id)} className="h-[18px] w-[18px] accent-blue-600" />
              <span className="text-body-md">{a.name}</span>
            </label>
          ))}
        </Group>
      ) : null}

      <Button type="submit" className="w-full">
        Terapkan Filter
      </Button>
    </div>
  );
}
