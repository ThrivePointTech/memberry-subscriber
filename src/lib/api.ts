import { getAccessToken, getRefreshToken, setAccessToken, clearSession } from './session'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

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
  const { data } = (await res.json()) as { data: { access_token: string } }
  await setAccessToken(data.access_token)
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
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? `API error ${res.status}`)
  }

  const json = await res.json()
  return json.data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
}
