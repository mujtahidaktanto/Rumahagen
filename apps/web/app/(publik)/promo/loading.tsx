// app/(publik)/promo/loading.tsx — keadaan memuat Promo (kerangka kartu).
export default function PromoLoading() {
  return (
    <div role="status" aria-label="Memuat promo">
      <div className="bg-blue-50 py-10">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 xl:px-10">
          <div className="skeleton h-9 w-72 max-w-full" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-5 px-4 py-6 min-[560px]:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:px-10">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton h-62" />
        ))}
      </div>
    </div>
  );
}
