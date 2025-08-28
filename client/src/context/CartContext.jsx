import React, { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload
    
    case 'ADD_TO_CART': {
      const { item, quantity = 1 } = action.payload
      const existingItem = state.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        return state.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        return [...state, { ...item, quantity }]
      }
    }
    
    case 'REMOVE_FROM_CART':
      return state.filter(item => item.id !== action.payload.id)
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return state.filter(item => item.id !== id)
      }
      return state.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    }
    
    case 'CLEAR_CART':
      return []
    
    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) })
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }, [])

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cart])

  const addToCart = (item, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { item, quantity } })
  }

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } })
  }

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const isInCart = (id) => {
    return cart.some(item => item.id === id)
  }

  const getCartItem = (id) => {
    return cart.find(item => item.id === id)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItem
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
