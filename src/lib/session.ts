'use server'

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

export async function setAccessToken(accessToken: string): Promise<void> {
  const store = await cookies()
  store.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
  store.delete(CUSTOMER_COOKIE)
}
