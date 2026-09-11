// `server-only`, NOT `'use server'`. Every export here reads or writes the
// httpOnly session cookies; under `'use server'` they would each become a
// client-invocable Server Action the moment any client module imported this
// file, handing the raw access token and the 30-day refresh token to browser
// JavaScript. Nothing here needs to be callable from the client — the callers
// are Route Handlers, Server Components and Server Actions — so the safer
// directive is the one that makes a client import fail the build.
import 'server-only'

import { cookies } from 'next/headers'

const ACCESS_COOKIE = 'memberry_subscriber_access'
const REFRESH_COOKIE = 'memberry_subscriber_refresh'
const CUSTOMER_COOKIE = 'memberry_subscriber_customer_id'

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(ACCESS_COOKIE)?.value ?? null
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(REFRESH_COOKIE)?.value ?? null
}

export async function getCustomerId(): Promise<string | null> {
  const store = await cookies()
  return store.get(CUSTOMER_COOKIE)?.value ?? null
}

export async function setSession(session: { access_token: string; refresh_token: string; customer_id: string }): Promise<void> {
  const store = await cookies()
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  store.set(ACCESS_COOKIE, session.access_token, { ...common, maxAge: 60 * 15 })
  store.set(REFRESH_COOKIE, session.refresh_token, { ...common, maxAge: 60 * 60 * 24 * 30 })
  store.set(CUSTOMER_COOKIE, session.customer_id, { ...common, maxAge: 60 * 60 * 24 * 30 })
}

// memberry-api's refresh endpoint rotates the refresh token on every call
// and revokes the one just presented (see user-session-auth spec) — a
// refresh response's rotated pair MUST both be persisted, or the next
// refresh attempt presents an already-revoked token and memberry-api's
// reuse-detection revokes the whole token family, forcing an unplanned
// full re-login well before the nominal 30-day session length.
export async function setRefreshedTokens(accessToken: string, refreshToken: string): Promise<void> {
  const store = await cookies()
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
  store.set(ACCESS_COOKIE, accessToken, { ...common, maxAge: 60 * 15 })
  store.set(REFRESH_COOKIE, refreshToken, { ...common, maxAge: 60 * 60 * 24 * 30 })
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
  store.delete(CUSTOMER_COOKIE)
}
