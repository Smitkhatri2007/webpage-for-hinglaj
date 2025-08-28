import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// Success checkmark animation component
const SuccessAnimation = () => (
  <div className="success-animation">
    <div className="success-circle">
      <div className="success-checkmark">
        <svg viewBox="0 0 52 52" className="success-svg">
          <circle 
            className="success-circle-bg" 
            cx="26" 
            cy="26" 
            r="25" 
            fill="none"
            stroke="#4CAF50"
            strokeWidth="2"
          />
          <path 
            className="success-check" 
            fill="none" 
            stroke="#4CAF50"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14,27 L22,35 L38,19"
          />
        </svg>
      </div>
    </div>
  </div>
)

// Bill/Receipt component
const BillComponent = React.forwardRef(({ order }, ref) => {
  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div ref={ref} className="bill-container">
      <div className="bill-header">
        <h1>Hinglaj Sweets & Namkeen</h1>
        <p>Traditional Sweets & Namkeens</p>
        <div className="bill-divider"></div>
      </div>

      <div className="bill-content">
        <div className="bill-section">
          <h3>Order Details</h3>
          <div className="bill-row">
            <span>Order Number:</span>
            <span>{order.orderNumber}</span>
          </div>
          <div className="bill-row">
            <span>Date & Time:</span>
            <span>{formatDate(order.orderDate)}</span>
          </div>
          <div className="bill-row">
            <span>Status:</span>
            <span className="status-badge">{order.status.toUpperCase()}</span>
          </div>
        </div>

        <div className="bill-section">
          <h3>Customer Details</h3>
          <div className="bill-row">
            <span>Name:</span>
            <span>{order.customerDetails.name}</span>
          </div>
          <div className="bill-row">
            <span>Phone:</span>
            <span>{order.customerDetails.phone}</span>
          </div>
          {order.customerDetails.email && (
            <div className="bill-row">
              <span>Email:</span>
              <span>{order.customerDetails.email}</span>
            </div>
          )}
          {order.customerDetails.address && (
            <div className="bill-row">
              <span>Address:</span>
              <span>{order.customerDetails.address}</span>
            </div>
          )}
        </div>

        <div className="bill-section">
          <h3>Order Items</h3>
          <div className="bill-items-header">
            <span>Item</span>
            <span>Size</span>
            <span>Qty</span>
            <span>Price</span>
            <span>Total</span>
          </div>
          {order.items.map((item, index) => (
            <div key={index} className="bill-item-row">
              <span>{item.itemName}</span>
              <span>{item.size}</span>
              <span>{item.quantity}</span>
              <span>{formatCurrency(item.price)}</span>
              <span>{formatCurrency(item.total)}</span>
            </div>
          ))}
          
          <div className="bill-divider"></div>
          
          <div className="bill-total-row">
            <span>Total Amount:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        <div className="bill-footer">
          <p>Thank you for choosing Hinglaj Sweets & Namkeen!</p>
          <p>For any queries, please contact us with your order number.</p>
        </div>
      </div>
    </div>
  )
})

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showAnimation, setShowAnimation] = useState(true)
  const [showBill, setShowBill] = useState(false)
  const billRef = React.useRef()

  const order = location.state?.order
  const message = location.state?.message

  useEffect(() => {
    // If no order data, redirect to home
    if (!order) {
      navigate('/', { replace: true })
      return
    }

    // Show animation for 3 seconds, then show content
    const timer = setTimeout(() => {
      setShowAnimation(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [order, navigate])

  const handlePrintBill = () => {
    window.print()
  }

  const handleDownloadBill = () => {
    // Simple approach - open print dialog which allows "Save as PDF"
    setShowBill(true)
    setTimeout(() => {
      window.print()
      setShowBill(false)
    }, 100)
  }

  const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`

  if (!order) {
    return null // Will redirect in useEffect
  }

  if (showAnimation) {
    return (
      <div className="order-success-animation">
        <SuccessAnimation />
        <h2>Processing your order...</h2>
        <p>Please wait while we confirm your order details.</p>
      </div>
    )
  }

  return (
    <section className="order-success-page">
      {/* Main success content */}
      {!showBill && (
        <>
          <div className="success-header">
            <SuccessAnimation />
            <h1>Order Placed Successfully!</h1>
            <p className="success-message">{message}</p>
          </div>

          <div className="order-summary-card">
            <h2>Order Summary</h2>
            
            <div className="order-info-grid">
              <div className="order-info-item">
                <label>Order Number</label>
                <span className="order-number">{order.orderNumber}</span>
              </div>
              
              <div className="order-info-item">
                <label>Total Amount</label>
                <span className="order-total">{formatCurrency(order.total)}</span>
              </div>
              
              <div className="order-info-item">
                <label>Status</label>
                <span className="order-status">{order.status.toUpperCase()}</span>
              </div>
              
              <div className="order-info-item">
                <label>Order Date</label>
                <span>{new Date(order.orderDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="customer-details">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> {order.customerDetails.name}</p>
              <p><strong>Phone:</strong> {order.customerDetails.phone}</p>
              {order.customerDetails.email && (
                <p><strong>Email:</strong> {order.customerDetails.email}</p>
              )}
              {order.customerDetails.address && (
                <p><strong>Address:</strong> {order.customerDetails.address}</p>
              )}
            </div>

            <div className="order-items">
              <h3>Items Ordered</h3>
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.itemName}</span>
                      <span className="item-size">Size: {item.size}</span>
                    </div>
                    <div className="item-quantity">Qty: {item.quantity}</div>
                    <div className="item-total">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="success-actions">
            <button 
              className="button secondary"
              onClick={handleDownloadBill}
            >
              📄 Download Bill
            </button>
            
            <button 
              className="button secondary"
              onClick={handlePrintBill}
            >
              🖨️ Print Bill
            </button>
            
            <Link to="/products" className="button">
              Continue Shopping
            </Link>
            
            <Link to="/" className="button secondary">
              Back to Home
            </Link>
          </div>
        </>
      )}

      {/* Hidden bill component for printing */}
      <div style={{ display: showBill ? 'block' : 'none' }}>
        <BillComponent ref={billRef} order={order} />
      </div>

      {/* Print-only styles */}
      <style jsx>{`
        @media print {
          .order-success-page > *:not(.bill-container) {
            display: none !important;
          }
          .bill-container {
            display: block !important;
          }
        }
      `}</style>
    </section>
  )
}
