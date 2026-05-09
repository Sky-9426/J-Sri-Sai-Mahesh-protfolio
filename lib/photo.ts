// Photo storage with local fallback
export const PHOTO_KEY = 'portfolio_photo'

// Simple green circle avatar (always works, no external dependencies)
const SIMPLE_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23000902"/%3E%3Ccircle cx="100" cy="80" r="40" fill="%2300ff41"/%3E%3Cellipse cx="100" cy="160" rx="60" ry="50" fill="%2300ff41" opacity="0.7"/%3E%3C/svg%3E'

export function resolvePhotoUrl() {
  // Try localStorage first (if user uploaded)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(PHOTO_KEY)
    if (stored) return stored
  }
  // Fall back to simple local avatar
  return SIMPLE_AVATAR
}

export function getFallbackPhotoUrl() {
  return SIMPLE_AVATAR
}

export function storePhotoUrl(url: string) {
  // Store in environment variable or update via admin panel
  // The URL should be a persistent Vercel Blob or cloud storage URL
  if (typeof window !== 'undefined') {
    localStorage.setItem(PHOTO_KEY, url)
  }
}
