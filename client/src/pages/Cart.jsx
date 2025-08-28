import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { isAuthed } from '../auth'
import api from '../services/api'

export default function Cart() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart()

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toFixed(2)}`
  }

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!isAuthed()) {
      alert('Please login to proceed with checkout')
      return
    }
    
    setShowCheckoutForm(true)
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    
    if (!customerDetails.name || !customerDetails.phone) {
      alert('Please fill in your name and phone number')
      return
    }

    setIsPlacingOrder(true)

    try {
      // Prepare order items in the expected format
      const orderItems = cart.map(item => ({
        itemId: item.itemId,
        size: item.size,
        quantity: item.quantity
      }))

      const orderData = {
        items: orderItems,
        customerDetails: {
          name: customerDetails.name,
          phone: customerDetails.phone,
          email: customerDetails.email,
          address: customerDetails.address,
          notes: customerDetails.notes
        },
        total: getCartTotal(),
        paymentMethod: paymentMethod
      }

      const response = await api.post('/api/orders', orderData)
      
      // Clear cart after successful order
      clearCart()
      
      // Navigate to order success page with order details
      navigate('/order-success', { 
        state: { 
          order: response.data.order,
          message: response.data.message
        }
      })
      
    } catch (error) {
      console.error('Order placement error:', error)
      alert(error.response?.data?.error || 'Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (cart.length === 0) {
    return (
      <section>
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <div className="cart-summary">
            <span className="cart-count">0 items</span>
          </div>
        </div>

        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse our delicious products and add them to your cart!</p>
          <Link to="/products" className="button">
            Browse Products
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <div className="cart-summary">
          <span className="cart-count">{getCartItemCount()} items</span>
          <button 
            className="button secondary clear-cart-btn"
            onClick={() => {
              if (confirm('Are you sure you want to clear your cart?')) {
                clearCart()
              }
            }}
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                {item.photoUrl ? (
                  <img 
                    src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}${item.photoUrl}`} 
                    alt={item.name} 
                  />
                ) : (
                  <div className="no-image">
                    <span>No Image</span>
                  </div>
                )}
              </div>

              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>
                <div className="cart-item-price">
                  {formatCurrency(item.price)} per unit
                </div>
                <div className="cart-item-unit">
                  Size: {item.size}
                </div>
              </div>

              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="quantity-input"
                  />
                  <button 
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  {formatCurrency(item.price * item.quantity)}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove from cart"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-sidebar">
          <div className="cart-summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-line">
              <span>Items ({getCartItemCount()})</span>
              <span>{formatCurrency(getCartTotal())}</span>
            </div>
            
            <div className="summary-line">
              <span>Delivery</span>
              <span>Free</span>
            </div>
            
            <hr />
            
            <div className="summary-line total">
              <span>Total</span>
              <span>{formatCurrency(getCartTotal())}</span>
            </div>

            {!showCheckoutForm ? (
              <>
                <button 
                  className="button checkout-btn"
                  onClick={handleCheckout}
                >
                  {isAuthed() ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>

                <Link to="/products" className="continue-shopping">
                  Continue Shopping
                </Link>
              </>
            ) : (
              <form onSubmit={handlePlaceOrder} className="checkout-form">
                <h4>Customer Details</h4>
                
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    className="input"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="input"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    placeholder="Enter your email (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Address</label>
                  <textarea
                    className="input"
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                    rows="3"
                    placeholder="Enter delivery address (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>Special Notes</label>
                  <textarea
                    className="input"
                    value={customerDetails.notes}
                    onChange={(e) => setCustomerDetails({...customerDetails, notes: e.target.value})}
                    rows="2"
                    placeholder="Any special instructions (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    className="input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="upi">UPI Payment</option>
                    <option value="card">Card Payment</option>
                  </select>
                </div>

                <div className="checkout-actions">
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setShowCheckoutForm(false)}
                    disabled={isPlacingOrder}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="button checkout-btn"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'Placing Order...' : `Place Order - ${formatCurrency(getCartTotal())}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Helper function to format unit display
function formatUnit(unit) {
  switch(unit) {
    case '1kg': return '1 kg'
    case '500g': return '500 grams'
    case '250g': return '250 grams'  
    case '100g': return '100 grams'
    case 'pcs': return 'pieces'
    default: return unit
  }
}
