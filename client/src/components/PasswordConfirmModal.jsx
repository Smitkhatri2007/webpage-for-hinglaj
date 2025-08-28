import React, { useState } from 'react'

export default function PasswordConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Please enter your admin password to confirm this action.",
  confirmText = "Confirm",
  loading = false 
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Password is required')
      return
    }
    
    setError('')
    try {
      await onConfirm(password)
      setPassword('')
    } catch (err) {
      setError(err.message || 'Invalid password')
    }
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-password">Admin Password</label>
              <input
                id="admin-password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                disabled={loading}
                autoFocus
              />
              {error && <div className="error-message">{error}</div>}
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="button secondary" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="button danger"
                disabled={loading || !password.trim()}
              >
                {loading ? 'Please wait...' : confirmText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
