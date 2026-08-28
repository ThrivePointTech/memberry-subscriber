export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-4 pb-24 px-4">
      <div className="w-full max-w-md">
        {/* Merchant header skeleton: banner with overlapping logo, both centered */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative w-full mb-12">
            <div className="h-32 w-full bg-[#e4ede9] rounded-2xl animate-pulse" />
            <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 w-16 h-16 rounded-full bg-[#d8e3df] ring-4 ring-white animate-pulse" />
          </div>
          <div className="h-8 w-48 bg-[#e4ede9] rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-40 bg-[#e4ede9] rounded animate-pulse" />
        </div>

        {/* "Choose your membership" heading skeleton */}
        <div className="h-4 w-40 bg-[#e4ede9] rounded animate-pulse mb-4" />

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

              <div className="flex gap-2 mb-3">
                <div className="h-6 w-20 bg-[#e4ede9] rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-[#e4ede9] rounded-full animate-pulse" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="h-3.5 w-full bg-[#e4ede9] rounded animate-pulse" />
                <div className="h-3.5 w-4/5 bg-[#e4ede9] rounded animate-pulse" />
              </div>

              <div className="flex flex-col gap-1.5 mb-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-3.5 w-full bg-[#e4ede9] rounded animate-pulse" />
                ))}
              </div>

              <div className="h-10 w-full bg-[#e4ede9] rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
