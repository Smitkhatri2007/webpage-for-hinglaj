import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PasswordConfirmModal from '../components/PasswordConfirmModal'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/customers/stats/overview')
        setStats(data)
      } catch (e) {
        console.error('Failed to fetch stats:', e)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/api/customers', { 
          params: { q: q || undefined, page, limit } 
        })
        setCustomers(data.data || [])
        setTotal(data.total || 0)
      } catch (e) {
        console.error('Failed to fetch customers:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [q, page, limit])

  const pages = Math.max(1, Math.ceil(total / limit))

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer)
    setShowDeleteModal(true)
  }

  const confirmDelete = async (password) => {
    if (!customerToDelete) return
    
    setDeleteLoading(true)
    try {
      await api.delete(`/api/customers/${customerToDelete.id}`, {
        data: { adminPassword: password }
      })
      
      // Refresh the customer list
      const { data } = await api.get('/api/customers', { 
        params: { q: q || undefined, page, limit } 
      })
      setCustomers(data.data || [])
      setTotal(data.total || 0)
      
      // Refresh stats
      const statsResponse = await api.get('/api/customers/stats/overview')
      setStats(statsResponse.data)
      
      setShowDeleteModal(false)
      setCustomerToDelete(null)
      
      alert(`Customer ${customerToDelete.name} has been successfully deleted.`)
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete customer'
      throw new Error(errorMessage)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <section>
      <div className="customers-header">
        <h2>Customer Management</h2>
        <p style={{ color: 'var(--text-medium)', marginBottom: '24px' }}>
          Manage and view all registered customers
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCustomers || 0}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.recentRegistrations || 0}</div>
          <div className="stat-label">New This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalAdmins || 0}</div>
          <div className="stat-label">Admin Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="customers-controls">
        <div className="search-section">
          <input 
            className="input search-input" 
            placeholder="Search by name, phone, or email..." 
            value={q} 
            onChange={e => { setPage(1); setQ(e.target.value) }} 
          />
        </div>
        <div className="controls-section">
          <select 
            className="input" 
            value={limit} 
            onChange={e => { setPage(1); setLimit(parseInt(e.target.value)) }}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="loading-state">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <p>No customers found</p>
        </div>
      ) : (
        <>
          <div className="customers-list">
            {customers.map(customer => (
              <div key={customer.id} className="customer-card">
                <div className="customer-info">
                  <div className="customer-main">
                    <h3 className="customer-name">{customer.name}</h3>
                    <div className="customer-role-badge">
                      {customer.role === 'admin' ? 'Admin' : 'Customer'}
                    </div>
                  </div>
                  
                  <div className="customer-details">
                    <div className="detail-item">
                      <span className="detail-icon">📞</span>
                      <span>{customer.phone || 'No phone'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📧</span>
                      <span>{customer.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>Joined {formatDate(customer.createdAt)}</span>
                    </div>
                  </div>

                  <div className="customer-stats">
                    <div className="stat-item">
                      <strong>{customer.orderCount}</strong>
                      <span>Orders</span>
                    </div>
                  </div>
                </div>

                <div className="customer-actions">
                  <Link 
                    to={`/customers/${customer.id}`} 
                    className="button view-customer-btn"
                  >
                    View Details
                  </Link>
                  {customer.role !== 'admin' && (
                    <button 
                      className="button danger"
                      onClick={() => handleDeleteCustomer(customer)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button 
              className="button" 
              disabled={page <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {page} of {pages} ({total} customers)
            </div>
            
            <button 
              className="button" 
              disabled={page >= pages} 
              onClick={() => setPage(p => Math.min(pages, p + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <PasswordConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setCustomerToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${customerToDelete?.name}"? This action cannot be undone and will also delete all their orders.`}
        confirmText="Delete Customer"
        loading={deleteLoading}
      />
    </section>
  )
}
