import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'

// Server-side only, so use `API_BASE_URL`: it is a real runtime lookup (the
// pattern every Server Component in this repo already uses), while
// `NEXT_PUBLIC_*` is inlined at build time and the Dockerfile only declares it
// as a build ARG. No localhost fallback — silently pointing a production
// container at nothing is worse than pointing it at the real API.
const API_URL = process.env.API_BASE_URL ?? 'https://api.getmemberry.com'

declare module 'next-auth' {
  interface Session {
    apiSession?: { access_token: string; refresh_token: string; customer_id: string }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    apiSession?: { access_token: string; refresh_token: string; customer_id: string }
  }
}

interface ApiSessionResponse {
  data: { access_token: string; refresh_token: string; customer_id: string }
}

// Exchanges a provider-verified identity for memberry-api's own JWT session,
// via the same identify()/auth_methods flow memberry-merchant already uses.
async function exchangeForApiSession(path: '/auth/google/verify' | '/auth/facebook/verify', tokenField: string, token: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-App-Type': 'customer' },
    body: JSON.stringify({ [tokenField]: token }),
  })
  if (!res.ok) throw new Error('Failed to exchange identity for a session')
  const { data } = (await res.json()) as ApiSessionResponse
  return data
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // This app deploys as a standalone `node server.js` image behind a reverse
  // proxy (not Vercel), where Auth.js v5 otherwise rejects the forwarded Host
  // with `UntrustedHost`. `AUTH_TRUST_HOST=true` does the same thing via env;
  // setting it here means a deploy can't forget it.
  trustHost: true,
  providers: [Google, Facebook],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === 'google' && account.id_token) {
        token.apiSession = await exchangeForApiSession('/auth/google/verify', 'id_token', account.id_token)
      } else if (account?.provider === 'facebook' && account.access_token) {
        token.apiSession = await exchangeForApiSession('/auth/facebook/verify', 'access_token', account.access_token)
      }
      return token
    },
    async session({ session, token }) {
      session.apiSession = token.apiSession
      return session
    },
    // Preserve the app's own destination. The login page passes
    // `redirectTo: '/auth/bridge?redirect=<path>'` into signIn(), which arrives
    // here as `url` — overwriting it would drop the query string and strand
    // every sign-in on `/`. Only genuinely foreign URLs fall back to the
    // bridge, which is also what an off-site callback should land on.
    // Origins are compared parsed, not by string prefix: `baseUrl` is a bare
    // origin, so `url.startsWith(baseUrl)` would also accept
    // `https://<app>.evil.example/...`.
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/') && !url.startsWith('//')) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url
      } catch {
        /* not a parseable URL — fall through */
      }
      return `${baseUrl}/auth/bridge`
    },
  },
})
