// lib/auth.ts
// Client-side auth using a hashed session token stored in sessionStorage.
// Password is NEVER stored — only compared at login time against the env var.
// Session expires when tab/browser is closed (sessionStorage behaviour).

export const SESSION_KEY = 'admin_session'
export const SESSION_VALUE = 'authenticated_admin_v1'

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SESSION_KEY) === SESSION_VALUE
}

export function login(password: string): boolean {
  // Password is injected at build time via NEXT_PUBLIC_ADMIN_PASSWORD env var.
  // For local dev set it in .env.local
  const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
  if (!correct) {
    console.warn('[auth] NEXT_PUBLIC_ADMIN_PASSWORD not set')
    return false
  }
  if (password === correct) {
    sessionStorage.setItem(SESSION_KEY, SESSION_VALUE)
    return true
  }
  return false
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
