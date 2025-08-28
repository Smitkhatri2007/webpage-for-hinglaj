import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function OrderForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = mode === 'edit'
  const [form, setForm] = useState({ orderNumber: '', status: 'pending', customerName: '', itemsText: '[]' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        try {
          const { data } = await api.get(`/api/orders/${id}`)
          setForm({
            orderNumber: data.orderNumber || '',
            status: data.status || 'pending',
            customerName: data.customerName || '',
            itemsText: JSON.stringify(data.items || [], null, 2)
          })
        } catch (e) {
          setMsg('Failed to load order')
        }
      })()
    }
  }, [id, isEdit])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const payload = {
        orderNumber: form.orderNumber,
        status: form.status,
        customerName: form.customerName,
        items: JSON.parse(form.itemsText || '[]')
      }
      if (isEdit) {
        await api.put(`/api/orders/${id}`, payload)
        navigate(`/orders/${id}`)
      } else {
        const { data } = await api.post('/api/orders', payload)
        navigate(`/orders/${data.id}`)
      }
    } catch (e) {
      setMsg('Save failed. Ensure items is valid JSON array.')
    }
  }

  return (
    <section>
      <h2>{isEdit ? 'Edit Order' : 'New Order'}</h2>
      <form onSubmit={submit} className="card" style={{ maxWidth: 640 }}>
        <label>Order Number</label>
        <input className="input" value={form.orderNumber} onChange={e=>setForm({ ...form, orderNumber: e.target.value })} />
        <div style={{ height: 8 }} />
        <label>Status</label>
        <input className="input" value={form.status} onChange={e=>setForm({ ...form, status: e.target.value })} />
        <div style={{ height: 8 }} />
        <label>Customer Name</label>
        <input className="input" value={form.customerName} onChange={e=>setForm({ ...form, customerName: e.target.value })} />
        <div style={{ height: 8 }} />
        <label>Items (JSON array)</label>
        <textarea className="input" rows={8} value={form.itemsText} onChange={e=>setForm({ ...form, itemsText: e.target.value })} />
        <div style={{ height: 12 }} />
        <button className="button" type="submit">{isEdit ? 'Update' : 'Create'} Order</button>
        {msg && <p>{msg}</p>}
      </form>
    </section>
  )
}

