import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      await api.post('/api/auth/register', { name, phone, email, password })
      navigate('/login')
    } catch (e) {
      setMsg('Registration failed')
    }
  }

  return (
    <section>
      <h2>Register</h2>
      <form onSubmit={submit} className="card" style={{ maxWidth: 420 }}>
        <input className="input" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <div style={{ height: 8 }} />
        <input className="input" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <div style={{ height: 8 }} />
        <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div style={{ height: 8 }} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div style={{ height: 12 }} />
        <button className="button" type="submit">Create account</button>
        {msg && <p>{msg}</p>}
      </form>
    </section>
  )
}

