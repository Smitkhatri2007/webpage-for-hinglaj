import React, { useEffect, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { isAuthed, logout, authEvents, isAdminPhone } from './auth'
import { useCart } from './context/CartContext'

export default function App() {
  const [authed, setAuthed] = useState(isAuthed())
  const [showAdmin, setShowAdmin] = useState(false)
  const { getCartItemCount } = useCart()

  const refresh = () => {
    setAuthed(isAuthed())
    setShowAdmin(isAdminPhone('9999999999'))
  }

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    authEvents.addEventListener('change', onChange)
    return () => authEvents.removeEventListener('change', onChange)
  }, [])

  return (
    <div>
      <nav className="nav">
        <h1>Hinglaj Sweets & Namkeen</h1>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {!showAdmin && (
            <Link to="/cart" className="cart-link">
              Cart {getCartItemCount() > 0 && <span className="cart-badge">{getCartItemCount()}</span>}
            </Link>
          )}
          {showAdmin && <Link to="/admin">Admin</Link>}
          {showAdmin && <Link to="/orders">Orders</Link>}
          {showAdmin && <Link to="/customers">Customers</Link>}
          {authed ? (
            <button className="button" onClick={() => logout()}>Logout</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}

