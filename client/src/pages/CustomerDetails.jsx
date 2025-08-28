import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

export default function CustomerDetails() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await api.get(`/api/customers/${id}`)
        setData(response.data)
      } catch (e) {
        console.error('Failed to fetch customer details:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomerDetails()
  }, [id])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toFixed(2)}`
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'var(--accent-brown)'
      case 'processing': return 'var(--secondary-gold)'
      case 'pending': return 'var(--primary-orange)'
      case 'cancelled': return '#dc2626'
      default: return 'var(--text-medium)'
    }
  }

  if (loading) return <div className="loading-state">Loading customer details...</div>
  if (!data) return <div className="empty-state">Customer not found</div>

  const { customer, orders, stats } = data

  return (
    <section>
      {/* Back Navigation */}
      <div className="back-navigation">
        <Link to="/customers" className="back-link">← Back to Customers</Link>
      </div>

      {/* Customer Header */}
      <div className="customer-header-section">
        <div className="customer-basic-info">
          <h1>{customer.name}</h1>
          <div className="customer-role-badge large">
            {customer.role === 'admin' ? 'Admin User' : 'Customer'}
          </div>
        </div>
        
        <div className="customer-contact">
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>{customer.phone || 'No phone provided'}</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <span>{customer.email}</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📅</span>
            <span>Member since {formatDate(customer.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="customer-stats-section">
        <h3>Customer Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
            <div className="stat-label">Total Spent</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.averageOrderValue)}</div>
            <div className="stat-label">Avg Order Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.lastOrderDate ? formatDate(stats.lastOrderDate).split(',')[0] : 'Never'}
            </div>
            <div className="stat-label">Last Order</div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="status-breakdown">
          <h4>Order Status Breakdown</h4>
          <div className="status-items">
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: getStatusColor('completed') }}></span>
              <span>Completed: {stats.statusBreakdown.completed}</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: getStatusColor('processing') }}></span>
              <span>Processing: {stats.statusBreakdown.processing}</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: getStatusColor('pending') }}></span>
              <span>Pending: {stats.statusBreakdown.pending}</span>
            </div>
            <div className="status-item">
              <span className="status-dot" style={{ backgroundColor: getStatusColor('cancelled') }}></span>
              <span>Cancelled: {stats.statusBreakdown.cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="order-history-section">
        <h3>Order History ({orders.length} orders)</h3>
        
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found for this customer</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const orderTotal = (order.items || []).reduce((sum, item) => {
                return sum + (item.price * item.qty || 0)
              }, 0)
              
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h4>
                        <Link to={`/orders/${order.id}`}>#{order.orderNumber}</Link>
                      </h4>
                      <div 
                        className="order-status" 
                        style={{ color: getStatusColor(order.status) }}
                      >
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="order-meta">
                      <div className="order-date">{formatDate(order.createdAt)}</div>
                      <div className="order-total">{formatCurrency(orderTotal)}</div>
                    </div>
                  </div>
                  
                  <div className="order-items">
                    <strong>Items:</strong>
                    <ul>
                      {(order.items || []).map((item, idx) => (
                        <li key={idx}>
                          {item.name} × {item.qty} - {formatCurrency(item.price * item.qty || 0)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="order-actions">
                    <Link to={`/orders/${order.id}`} className="button view-order-btn">
                      View Order Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
