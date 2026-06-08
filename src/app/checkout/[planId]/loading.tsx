export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-8 pb-24 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_full.jpeg" alt="Memberry" className="h-16 w-auto rounded-2xl" />
        </div>

        {/* Breadcrumb skeleton */}
        <div className="mb-4">
          <div className="h-4 w-44 bg-[#e4ede9] rounded animate-pulse" />
        </div>

        {/* Plan card skeleton */}
        <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-6 mb-6">
          <div className="h-4 w-28 bg-[#e4ede9] rounded animate-pulse mb-2" />
          <div className="h-8 w-48 bg-[#e4ede9] rounded-lg animate-pulse mb-4" />

          <div className="flex items-baseline gap-2 mb-3">
            <div className="h-9 w-24 bg-[#e4ede9] rounded-lg animate-pulse" />
            <div className="h-4 w-14 bg-[#e4ede9] rounded animate-pulse" />
          </div>

          <div className="h-6 w-28 bg-[#e4ede9] rounded-full animate-pulse mb-4" />

          <div className="space-y-2">
            <div className="h-3.5 w-full bg-[#e4ede9] rounded animate-pulse" />
            <div className="h-3.5 w-3/4 bg-[#e4ede9] rounded animate-pulse" />
          </div>
        </div>

        {/* Form skeleton */}
        <div className="flex flex-col gap-4">
          {/* Name field */}
          <div>
            <div className="h-4 w-20 bg-[#e4ede9] rounded animate-pulse mb-2" />
            <div className="h-12 w-full bg-[#e4ede9] rounded-xl animate-pulse" />
          </div>

          {/* Phone field */}
          <div>
            <div className="h-4 w-28 bg-[#e4ede9] rounded animate-pulse mb-2" />
            <div className="h-12 w-full bg-[#e4ede9] rounded-xl animate-pulse" />
            <div className="h-3 w-64 bg-[#e4ede9] rounded animate-pulse mt-2" />
          </div>

          {/* Submit button */}
          <div className="h-13 w-full bg-[#e4ede9] rounded-xl animate-pulse" />

          {/* Footer note */}
          <div className="h-3 w-52 bg-[#e4ede9] rounded animate-pulse mx-auto" />
        </div>
      </div>
    </main>
  );
}
