import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Facebook from 'next-auth/providers/facebook'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

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
  },
})
