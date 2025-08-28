import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { loginWithToken } from '../auth'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const { data } = await api.post('/api/auth/login', { phone, password })
      loginWithToken(data.token)
      // If admin phone, go to admin page; otherwise go to previous or home
      if (phone === '9999999999') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (e) {
      setMsg('Login failed')
    }
  }

  return (
    <section>
      <h2>Login</h2>
      <form onSubmit={submit} className="card" style={{ maxWidth: 420 }}>
        <input className="input" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <div style={{ height: 8 }} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div style={{ height: 12 }} />
        <button className="button" type="submit">Sign in</button>
        {msg && <p>{msg}</p>}
      </form>
    </section>
  )
}

