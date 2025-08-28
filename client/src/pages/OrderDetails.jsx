import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`)
        setOrder(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) return <p>Loading...</p>
  if (!order) return <p>Order not found</p>

  const authed = Boolean(localStorage.getItem('token'))

  const doDelete = async () => {
    if (!confirm('Delete this order?')) return
    try {
      await api.delete(`/api/orders/${id}`)
      window.history.back()
    } catch (e) {
      alert('Delete failed')
    }
  }

  return (
    <section>
      <h2>Order #{order.orderNumber}</h2>
      <div className="card">
        <div>Status: {order.status}</div>
        <div>Customer: {order.customerName}</div>
        <div>Created: {new Date(order.createdAt).toLocaleString()}</div>
        <div>Updated: {new Date(order.updatedAt).toLocaleString()}</div>
        <div>Items:</div>
        <ul>
          {(order.items || []).map((it, idx) => (
            <li key={idx}>{it.name} x{it.qty} - ${it.price}</li>
          ))}
        </ul>
        {authed && (
          <div style={{ display: 'flex', gap: 8 }}>
            <a className="button" href={`/orders/${id}/edit`}>Edit</a>
            <button className="button" onClick={doDelete}>Delete</button>
          </div>
        )}
      </div>
    </section>
  )
}

