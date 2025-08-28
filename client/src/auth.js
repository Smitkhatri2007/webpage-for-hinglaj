// Simple auth utilities
export const authEvents = new EventTarget()

export function isAuthed() {
  return Boolean(localStorage.getItem('token'))
}

export function getPayload() {
  try {
    const raw = localStorage.getItem('token')
    if (!raw) return null
    const payload = JSON.parse(atob(raw.split('.')[1] || ''))
    return payload
  } catch {
    return null
  }
}

export function isAdmin() {
  const p = getPayload()
  return Boolean(p && p.role === 'admin')
}

export function isAdminPhone(phone) {
  const p = getPayload()
  return Boolean(p && p.role === 'admin' && p.phone === phone)
}

export function loginWithToken(token) {
  localStorage.setItem('token', token)
  authEvents.dispatchEvent(new Event('change'))
}

export function logout() {
  localStorage.removeItem('token')
  authEvents.dispatchEvent(new Event('change'))
}

