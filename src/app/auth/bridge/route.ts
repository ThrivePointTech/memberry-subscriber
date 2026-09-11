import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { setSession } from '@/lib/session'

// AuthJS's own session cookie is separate from memberry-subscriber's own
// session cookies that src/lib/session.ts and src/lib/api.ts depend on.
// This route is the post-sign-in redirect target: it reads the
// memberry-api-verifiable session minted in the AuthJS jwt/session
// callbacks and writes it into those cookies.
// `?redirect=` is attacker-controllable (it survives the whole OAuth round
// trip), so only an app-relative path is ever honoured. Anything absolute
// (`https://evil.example`), scheme-relative (`//evil.example`, which
// `new URL()` resolves to a foreign origin), or backslash-obfuscated is
// discarded in favour of the home page.
function safeRedirectPath(raw: string | null): string {
  if (!raw) return '/'
  // Control characters (tab/newline/NUL) are stripped by URL parsers and can
  // be used to hide a `//` or a scheme, so reject them outright.
  if (/[\u0000-\u001F\u007F]/.test(raw)) return '/'
  if (!raw.startsWith('/')) return '/'
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/'
  return raw
}

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.apiSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'sso_failed')
    return NextResponse.redirect(loginUrl)
  }

  await setSession(session.apiSession)

  const redirectTo = safeRedirectPath(request.nextUrl.searchParams.get('redirect'))
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
