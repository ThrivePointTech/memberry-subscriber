import { signIn } from '@/auth'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string; error?: string }> }) {
  const params = await searchParams

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
          await signIn('google', { redirectTo: `/auth/bridge${params.redirect ? `?redirect=${params.redirect}` : ''}` })
        }}
      >
        <button type="submit" className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition">
          Continue with Google
        </button>
      </form>

      <form
        action={async () => {
          'use server'
          await signIn('facebook', { redirectTo: `/auth/bridge${params.redirect ? `?redirect=${params.redirect}` : ''}` })
        }}
      >
        <button type="submit" className="w-full bg-[#1877F2] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#0f5fcc] transition">
          Continue with Facebook
        </button>
      </form>
    </div>
  )
}
