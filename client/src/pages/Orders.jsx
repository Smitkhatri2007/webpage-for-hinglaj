import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({})

  const statusColors = {
    pending: '#f97316',
    confirmed: '#3b82f6', 
    preparing: '#eab308',
    ready: '#10b981',
    delivered: '#22c55e',
    cancelled: '#ef4444'
  }

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.search) params.append('q', filters.search)
      params.append('page', filters.page)
      params.append('limit', filters.limit)
      params.append('sort', 'createdAt')
      params.append('dir', 'desc')

      const response = await api.get(`/api/orders?${params}`)
      setOrders(response.data.data || [])
      setPagination({
        page: response.data.page || 1,
        pages: response.data.pages || 1,
        total: response.data.total || 0,
        limit: response.data.limit || 20
      })
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError(err.response?.data?.error || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus })
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      
      // Show success message
      alert('Order status updated successfully!')
      
    } catch (err) {
      console.error('Failed to update order status:', err)
      alert(err.response?.data?.error || 'Failed to update order status')
    }
  }

  const deleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/api/orders/${orderId}`)
      
      // Remove from local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId))
      
      alert('Order deleted successfully!')
      
    } catch (err) {
      console.error('Failed to delete order:', err)
      alert(err.response?.data?.error || 'Failed to delete order')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <section>
      <div className="orders-header">
        <h2>Order Management</h2>
        <p>View and manage all customer orders</p>
      </div>

      {/* Filters and Search */}
      <div className="orders-controls">
        <div className="controls-left">
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="input"
            placeholder="Search by order number, customer name..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          <button type="submit" className="button">
            Search
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Loading orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p style={{ color: '#dc2626' }}>{error}</p>
          <button className="button" onClick={fetchOrders}>
            Retry
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && (
        <>
          <div className="orders-summary">
            <p>
              {pagination.total > 0 
                ? `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} orders`
                : 'No orders found'
              }
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <h3>No orders found</h3>
              <p>No orders match your current filters.</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">
                      <strong>#{order.orderNumber}</strong>
                    </div>
                    <div className="order-date">
                      {formatDate(order.orderDate || order.createdAt)}
                    </div>
                    <div className="order-total">
                      {formatCurrency(order.total)}
                    </div>
                  </div>

                  <div className="order-content">
                    <div className="customer-info">
                      <h4>Customer Details</h4>
                      <p><strong>Name:</strong> {order.customerDetails?.name || order.customerName}</p>
                      <p><strong>Phone:</strong> {order.customerDetails?.phone || 'N/A'}</p>
                      {order.customerDetails?.email && (
                        <p><strong>Email:</strong> {order.customerDetails.email}</p>
                      )}
                      {order.customerDetails?.address && (
                        <p><strong>Address:</strong> {order.customerDetails.address}</p>
                      )}
                    </div>

                    <div className="order-items-summary">
                      <h4>Items ({order.itemCount || order.items?.length || 0})</h4>
                      {order.items && order.items.length > 0 ? (
                        <div className="items-preview">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="item-preview">
                              <span>{item.itemName}</span>
                              <span>({item.size}) × {item.quantity}</span>
                              <span>{formatCurrency(item.total)}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="more-items">...and {order.items.length - 3} more items</p>
                          )}
                        </div>
                      ) : (
                        <p>No item details available</p>
                      )}
                    </div>
                  </div>

                  <div className="order-actions">
                    <div className="status-section">
                      <label>Status:</label>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        style={{ 
                          backgroundColor: statusColors[order.status], 
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {statusOptions.slice(1).map(option => ( // Skip 'all' option
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="button danger"
                        onClick={() => deleteOrder(order.id)}
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="button secondary"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </div>
              
              <button
                className="button secondary"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
