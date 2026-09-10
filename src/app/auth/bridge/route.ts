import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { setSession } from '@/lib/session'

// AuthJS's own session cookie is separate from memberry-subscriber's own
// session cookies that src/lib/session.ts and src/lib/api.ts depend on.
// This route is the post-sign-in redirect target: it reads the
// memberry-api-verifiable session minted in the AuthJS jwt/session
// callbacks and writes it into those cookies.
export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.apiSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'sso_failed')
    return NextResponse.redirect(loginUrl)
  }

  await setSession(session.apiSession)

  const redirectTo = request.nextUrl.searchParams.get('redirect') || '/'
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
