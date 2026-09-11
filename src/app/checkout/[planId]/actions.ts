'use server'

import { api, ApiError } from '@/lib/api'

/**
 * Result of {@link createAuthenticatedCheckoutSession}.
 *
 * Deliberately a plain result object rather than a thrown error: Next.js
 * redacts Server Action exceptions in production (the client only sees an
 * opaque digest), so the failure reason has to be returned as data. Nothing
 * token-related is ever part of this shape — the access/refresh tokens stay
 * inside the httpOnly cookies, read only on the server by `@/lib/api`.
 */
export type CreateAuthenticatedCheckoutSessionResult =
  | { ok: true; enrollmentSessionId: string; paymentMethods: string[] }
  | { ok: false; code: 'auth' | 'duplicate' | 'error'; message: string }

interface AuthenticatedSessionResponse {
  enrollment_session_id: string
  payment_methods?: string[]
}

/**
 * Creates a checkout enrollment session for the currently signed-in customer.
 *
 * Runs entirely on the server so the memberry-api access token (and the 30-day
 * refresh token behind it) never crosses back to browser JavaScript.
 *
 * @param planId          the plan being subscribed to
 * @param distinctId      the caller's PostHog distinct id, forwarded as
 *                        `X-PostHog-Distinct-Id` so pre-signup anonymous events
 *                        join to the customer created by this checkout
 */
export async function createAuthenticatedCheckoutSession(
  planId: string,
  distinctId?: string,
): Promise<CreateAuthenticatedCheckoutSessionResult> {
  try {
    const data = await api.post<AuthenticatedSessionResponse>(
      '/public/checkout/session/authenticated',
      { plan_id: planId },
      distinctId ? { 'X-PostHog-Distinct-Id': distinctId } : undefined,
    )
    return {
      ok: true,
      enrollmentSessionId: data.enrollment_session_id,
      paymentMethods: data.payment_methods?.length ? data.payment_methods : ['gcash'],
    }
  } catch (err) {
    if (err instanceof ApiError) {
      // 401 survives an automatic refresh attempt inside `@/lib/api`, so it
      // means the session is genuinely gone (expired, or revoked by
      // reuse-detection) — the caller must re-prompt sign-in, not show a
      // generic error the customer can only retry forever.
      if (err.status === 401 || err.status === 403) {
        return { ok: false, code: 'auth', message: 'Your session has expired. Please sign in again.' }
      }
      // memberry-api blocks double-charging a customer who already holds an
      // active subscription to this plan (409).
      if (err.status === 409) {
        return {
          ok: false,
          code: 'duplicate',
          message: err.message || 'You already have an active subscription to this plan.',
        }
      }
      return { ok: false, code: 'error', message: err.message || 'Something went wrong. Please try again.' }
    }
    return { ok: false, code: 'error', message: 'Something went wrong. Please try again.' }
  }
}
