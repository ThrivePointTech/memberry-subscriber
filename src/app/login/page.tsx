import { signIn } from '@/auth'

// Only app-relative destinations are carried through sign-in, and the value is
// URL-encoded so a path containing `&` or `#` can't corrupt (or inject extra
// params into) the bridge URL's query string. /auth/bridge re-validates the
// same way, since the value survives the whole OAuth round trip.
function bridgeUrl(redirect?: string): string {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//') || redirect.startsWith('/\\')) {
    return '/auth/bridge'
  }
  return `/auth/bridge?redirect=${encodeURIComponent(redirect)}`
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const params = await searchParams
  const redirectTo = bridgeUrl(params.redirect)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
      <h1 className="text-xl font-extrabold text-[#001a18]" style={{ fontFamily: 'var(--font-manrope)' }}>
        Sign in to Memberry
      </h1>

      {params.error && (
        <p className="text-red-600 text-sm font-medium" role="alert">
          Sign-in failed. Please try again.
        </p>
      )}

      <form
        action={async () => {
          'use server'
          await signIn('google', { redirectTo })
        }}
      >
        <button type="submit" className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition">
          Continue with Google
        </button>
      </form>

      <form
        action={async () => {
          'use server'
          await signIn('facebook', { redirectTo })
        }}
      >
        <button type="submit" className="w-full bg-[#1877F2] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#0f5fcc] transition">
          Continue with Facebook
        </button>
      </form>
    </div>
  )
}
