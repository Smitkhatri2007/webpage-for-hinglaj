import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useCart } from '../context/CartContext'

export default function Items() {
  const [items, setItems] = useState([])
  const [allItems, setAllItems] = useState([]) // Store all items for filtering
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedVariants, setSelectedVariants] = useState({}) // Track selected variant for each item
  const { addToCart, isInCart, getCartItem } = useCart()

  const handleVariantSelect = (itemId, variantIndex) => {
    setSelectedVariants({
      ...selectedVariants,
      [itemId]: variantIndex
    })
  }

  const getSelectedVariant = (item) => {
    if (!item.variants || item.variants.length === 0) return null
    const selectedIndex = selectedVariants[item.id] || 0
    return item.variants[selectedIndex] || item.variants[0]
  }

  const handleAddToCart = (item, selectedVariant) => {
    if (selectedVariant) {
      // Create a cart item with variant information
      const cartItem = {
        ...item,
        variantId: `${item.id}-${selectedVariant.size}`,
        selectedVariant,
        price: selectedVariant.price,
        displayName: `${item.name} (${selectedVariant.size})`
      }
      addToCart(cartItem, 1)
      alert(`${item.name} (${selectedVariant.size}) added to cart!`)
    } else {
      // Fallback for items without variants
      addToCart(item, 1)
      alert(`${item.name} added to cart!`)
    }
  }

  const fetchItems = async (category = 'all') => {
    try {
      const url = category === 'all' ? '/api/items' : `/api/items?category=${encodeURIComponent(category)}`
      const { data } = await api.get(url)
      setItems(data)
      if (category === 'all') {
        setAllItems(data)
      }
    } catch (e) {
      console.error('Failed to fetch items:', e)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/items/categories')
      setCategories(data)
    } catch (e) {
      console.error('Failed to fetch categories:', e)
    }
  }

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category)
    setLoading(true)
    await fetchItems(category)
    setLoading(false)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchItems('all'),
        fetchCategories()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <p>Loading products...</p>

  return (
    <section>
      <div className="products-header">
        <h2>Our Products</h2>
        
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="category-filter">
            <label className="filter-label">Filter by Category:</label>
            <div className="category-buttons">
              <button 
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                All Products ({allItems.length})
              </button>
              {categories.map(category => {
                const categoryCount = allItems.filter(item => item.category === category).length
                return (
                  <button 
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category} ({categoryCount})
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="empty-state">
          <p>{selectedCategory === 'all' 
            ? 'No products available at the moment.' 
            : `No products found in "${selectedCategory}" category.`
          }</p>
          {selectedCategory !== 'all' && (
            <button 
              className="button secondary" 
              onClick={() => handleCategoryChange('all')}
            >
              View All Products
            </button>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {items.map(item => (
            <div key={item.id} className="product-card">
              <div className="product-image">
                {item.photoUrl ? (
                  <img 
                    src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}${item.photoUrl}`} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '<div class="no-image"><span>Image not found</span></div>'
                    }}
                  />
                ) : (
                  <div className="no-image">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{item.name}</h3>
                
                {item.description && (
                  <p className="product-description">{item.description}</p>
                )}
                
                {/* Variant Selection */}
                {item.variants && item.variants.length > 0 ? (
                  <>
                    <div className="variant-selection">
                      <label className="variant-label">Choose Size:</label>
                      <div className="size-options">
                        {item.variants.map((variant, index) => (
                          <button
                            key={index}
                            className={`size-option ${
                              (selectedVariants[item.id] || 0) === index ? 'selected' : ''
                            } ${!variant.available ? 'disabled' : ''}`}
                            onClick={() => handleVariantSelect(item.id, index)}
                            disabled={!variant.available}
                          >
                            <span className="size-name">{variant.size}</span>
                            <span className="size-price">Rs.{variant.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {(() => {
                      const selectedVariant = getSelectedVariant(item)
                      return (
                        <div className="product-price">
                          <span className="price">Rs. {selectedVariant?.price.toFixed(2) || '0.00'}</span>
                          <span className="per-unit">per {selectedVariant?.size || 'unit'}</span>
                        </div>
                      )
                    })()} 
                  </>
                ) : (
                  <div className="product-price">
                    <span className="price">Rs. {item.price?.toFixed(2) || '0.00'}</span>
                    <span className="per-unit">per {item.unit || 'unit'}</span>
                  </div>
                )}
                
                <div className="product-details">
                  <span className="available">Available: {item.baseQuantity || item.quantity || 0} {item.quantityUnit}</span>
                  {item.category && <span className="category">Category: {item.category}</span>}
                </div>
                
                {/* Add to Cart Section */}
                <div className="add-to-cart-section">
                  {(() => {
                    const selectedVariant = getSelectedVariant(item)
                    const cartItemId = selectedVariant ? `${item.id}-${selectedVariant.size}` : item.id
                    const isInCartCheck = selectedVariant ? isInCart(cartItemId) : isInCart(item.id)
                    const cartItem = selectedVariant ? getCartItem(cartItemId) : getCartItem(item.id)
                    
                    if (selectedVariant && !selectedVariant.available) {
                      return (
                        <button className="button add-to-cart-btn disabled" disabled>
                          Out of Stock
                        </button>
                      )
                    }
                    
                    return isInCartCheck ? (
                      <div className="in-cart-indicator">
                        <span className="cart-check">✓</span>
                        <span>In Cart ({cartItem?.quantity || 0})</span>
                        <button 
                          className="button add-more-btn"
                          onClick={() => handleAddToCart(item, selectedVariant)}
                        >
                          Add More
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="button add-to-cart-btn"
                        onClick={() => handleAddToCart(item, selectedVariant)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.41c-.15.28-.25.61-.25.97 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        Add to Cart
                      </button>
                    )
                  })()} 
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
