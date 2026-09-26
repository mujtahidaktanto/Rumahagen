// app/verifikasi/loading.tsx — keadaan memuat verifikasi sertifikat.
export default function VerifyLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Memeriksa sertifikat" className="mx-auto w-full max-w-[720px] px-4 sm:px-6">
      <div className="flex flex-col gap-4 py-8">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-5 w-80 max-w-full" />
        <div className="skeleton h-40 rounded-lg" />
      </div>
      <p className="pb-6 text-center text-caption">Memeriksa sertifikat…</p>
    </div>
  );
}
