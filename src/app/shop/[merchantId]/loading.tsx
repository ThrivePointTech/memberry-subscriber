export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-8 pb-24 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_full.jpeg" alt="Memberry" className="h-16 w-auto rounded-2xl" />
        </div>

        {/* Merchant header skeleton */}
        <div className="mb-6">
          <div className="h-8 w-48 bg-[#e4ede9] rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-[#e4ede9] rounded animate-pulse" />
        </div>

        {/* Plan card skeletons */}
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="h-6 w-32 bg-[#e4ede9] rounded-lg animate-pulse" />
                <div className="text-right shrink-0">
                  <div className="h-6 w-20 bg-[#e4ede9] rounded-lg animate-pulse mb-1" />
                  <div className="h-3 w-14 bg-[#e4ede9] rounded animate-pulse ml-auto" />
                </div>
              </div>

              <div className="h-6 w-28 bg-[#e4ede9] rounded-full animate-pulse mb-3" />

              <div className="space-y-2 mb-4">
                <div className="h-3.5 w-full bg-[#e4ede9] rounded animate-pulse" />
                <div className="h-3.5 w-4/5 bg-[#e4ede9] rounded animate-pulse" />
              </div>

              <div className="h-10 w-full bg-[#e4ede9] rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
