// This module reads the httpOnly access/refresh cookies. If it is ever pulled
// into a client bundle, session.ts's `'use server'` cookie readers become
// client-callable Server Actions and both tokens end up in browser JavaScript —
// exactly the leak the httpOnly cookie design exists to prevent. `server-only`
// turns that mistake into a loud build failure instead of a silent leak.
import 'server-only'

import { getAccessToken, getRefreshToken, setRefreshedTokens, clearSession } from './session'

// Server-only code, so use the runtime-readable `API_BASE_URL` (the same var
// every Server Component in this repo uses) — `NEXT_PUBLIC_*` vars are inlined
// at build time and are not reliably readable at container runtime, and a
// localhost fallback in production would be a silent misconfiguration.
const API_URL = process.env.API_BASE_URL ?? 'https://api.getmemberry.com'

/**
 * Carries memberry-api's HTTP status alongside its message so callers can
 * branch on it (401 → re-prompt login, 409 → duplicate subscription, …).
 */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!res.ok) {
    await clearSession()
    return null
  }
  // Both tokens are rotated on every refresh — persist both, not just the
  // access token, or the next refresh presents an already-revoked token.
  const { data } = (await res.json()) as { data: { access_token: string; refresh_token: string } }
  await setRefreshedTokens(data.access_token, data.refresh_token)
  return data.access_token
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = await getAccessToken()
  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-App-Type': 'customer',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (res.status === 401) {
    token = await refreshAccessToken()
    if (token) {
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-App-Type': 'customer',
          Authorization: `Bearer ${token}`,
          ...(options.headers ?? {}),
        },
        cache: 'no-store',
      })
    }
  }

  if (!res.ok) {
    // memberry-api's failure envelope is `{ status, message, error }`
    // (src/lib/response.ts `fail()`), so `message` is the human-readable text.
    const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
    throw new ApiError(body?.message ?? body?.error ?? `API error ${res.status}`, res.status)
  }

  const json = await res.json()
  return json.data as T
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) => request<T>(path, { headers }),
  post: <T>(path: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), headers }),
}
