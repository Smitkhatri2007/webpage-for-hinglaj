import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthed } from '../auth'

export default function Protected({ children, requireAdmin = false, requirePhone } ) {
  const location = useLocation()
  if (!isAuthed()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (requireAdmin || requirePhone) {
    try {
      const [, token] = (localStorage.getItem('token') || '').split(' ')
      const raw = token || localStorage.getItem('token')
      const payload = JSON.parse(atob((raw || '').split('.')[1] || ''))
      if (requireAdmin && payload.role !== 'admin') return <Navigate to="/" replace />
      if (requirePhone && payload.phone !== requirePhone) return <Navigate to="/" replace />
    } catch {
      return <Navigate to="/" replace />
    }
  }
  return children
}

