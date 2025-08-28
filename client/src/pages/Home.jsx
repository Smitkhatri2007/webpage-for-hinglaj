import React, { useEffect, useState } from 'react'
import api from '../services/api'

// Traditional Namaste Icon Component with decorative elements
const NamasteIcon = ({ size = 80 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Decorative lotus-like background frame */}
    <g>
      {/* Outer decorative frame */}
      <path 
        d="M100 20 Q120 30 130 50 Q140 70 150 90 Q160 110 150 130 Q140 150 120 160 Q100 170 100 170 Q80 160 60 150 Q40 130 50 110 Q60 90 70 70 Q80 50 100 20Z" 
        fill="none" 
        stroke="#c2410c" 
        strokeWidth="2.5"
      />
      
      {/* Inner decorative frame */}
      <path 
        d="M100 30 Q115 35 125 50 Q135 65 140 85 Q145 105 140 120 Q135 135 120 145 Q100 150 100 150 Q85 145 70 135 Q55 120 60 105 Q65 85 75 65 Q85 50 100 30Z" 
        fill="none" 
        stroke="#c2410c" 
        strokeWidth="2"
      />
      
      {/* Side decorative elements */}
      <path 
        d="M40 100 Q30 90 25 80 Q30 70 40 75 Q50 80 45 90 Q40 100 40 100" 
        fill="#c2410c" 
      />
      <path 
        d="M160 100 Q170 90 175 80 Q170 70 160 75 Q150 80 155 90 Q160 100 160 100" 
        fill="#c2410c" 
      />
    </g>
    
    {/* Praying hands */}
    <g>
      {/* Left hand */}
      <path 
        d="M85 60 Q80 65 78 75 L78 95 Q78 105 80 115 Q82 125 88 132 Q94 138 100 140" 
        fill="#d97706" 
        stroke="#92400e" 
        strokeWidth="1.5"
      />
      
      {/* Right hand */}
      <path 
        d="M115 60 Q120 65 122 75 L122 95 Q122 105 120 115 Q118 125 112 132 Q106 138 100 140" 
        fill="#d97706" 
        stroke="#92400e" 
        strokeWidth="1.5"
      />
      
      {/* Fingers - Left hand */}
      <ellipse cx="82" cy="65" rx="3" ry="8" fill="#d97706" stroke="#92400e" strokeWidth="1"/>
      <ellipse cx="86" cy="62" rx="3" ry="9" fill="#d97706" stroke="#92400e" strokeWidth="1"/>
      <ellipse cx="90" cy="60" rx="3" ry="10" fill="#d97706" stroke="#92400e" strokeWidth="1"/>
      <ellipse cx="94" cy="62" rx="3" ry="9" fill="#d97706" stroke="#92400e" strokeWidth="1"/>
      
      {/* Fingers - Right hand */}
      <ellipse cx="118" cy="65" rx="3" ry="8" fill="#d97706" stroke="#92400e" strokeWidth="1"/>
      <ellipse cx="114" cy="62" rx="3" ry="9" fill="#d97706" stroke="#92400e" strokeWidth="1"/>
      <ellipse cx="110" cy="60" rx="3" ry="10" fill="#d97706" stroke="#92400e" strokeWidth="1"/>
      <ellipse cx="106" cy="62" rx="3" ry="9" fill="#d97706" stroke="#92400e" strokeWidth="1"/>
      
      {/* Palm details */}
      <line x1="78" y1="80" x2="95" y2="85" stroke="#92400e" strokeWidth="0.8"/>
      <line x1="78" y1="90" x2="95" y2="95" stroke="#92400e" strokeWidth="0.8"/>
      <line x1="122" y1="80" x2="105" y2="85" stroke="#92400e" strokeWidth="0.8"/>
      <line x1="122" y1="90" x2="105" y2="95" stroke="#92400e" strokeWidth="0.8"/>
    </g>
    
    {/* Decorative bracelets/jewelry */}
    <g>
      {/* Left wrist bracelet */}
      <ellipse cx="88" cy="125" rx="8" ry="3" fill="none" stroke="#fbbf24" strokeWidth="2"/>
      <circle cx="84" cy="125" r="1.5" fill="#dc2626"/>
      <circle cx="88" cy="124" r="1.5" fill="#fbbf24"/>
      <circle cx="92" cy="125" r="1.5" fill="#dc2626"/>
      
      {/* Right wrist bracelet */}
      <ellipse cx="112" cy="125" rx="8" ry="3" fill="none" stroke="#fbbf24" strokeWidth="2"/>
      <circle cx="108" cy="125" r="1.5" fill="#dc2626"/>
      <circle cx="112" cy="124" r="1.5" fill="#fbbf24"/>
      <circle cx="116" cy="125" r="1.5" fill="#dc2626"/>
    </g>
    
    {/* Central decorative element */}
    <g>
      {/* Central flame/diya element */}
      <path 
        d="M100 145 Q95 150 100 155 Q105 150 100 145" 
        fill="#dc2626" 
        stroke="#92400e" 
        strokeWidth="1"
      />
      
      {/* Small decorative dots around center */}
      <circle cx="100" cy="140" r="1" fill="#fbbf24"/>
      <circle cx="95" cy="142" r="0.8" fill="#dc2626"/>
      <circle cx="105" cy="142" r="0.8" fill="#dc2626"/>
    </g>
  </svg>
)

export default function Home() {
  const [products, setProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/items')
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Auto-advance slideshow
  useEffect(() => {
    if (products.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [products.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <section className="home-page">
      {/* Welcome Section with Namaste Icon */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h2>Welcome</h2>
          <NamasteIcon size={60} />
        </div>
        <p className="welcome-description">
          Welcome to Hinglaj Sweets & Namkeen - your destination for authentic traditional sweets and delicious namkeens. 
          Experience the rich flavors and time-honored recipes that have been delighting families for generations.
        </p>
      </div>

      {/* Product Slideshow */}
      <div className="product-slideshow-section">
        <h3>Our Featured Products</h3>
        
        {loading ? (
          <div className="slideshow-loading">
            <p>Loading our delicious products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="slideshow-empty">
            <p>No products available at the moment.</p>
          </div>
        ) : (
          <div className="slideshow-container">
            <div className="slideshow-wrapper">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`slide ${
                    index === currentSlide ? 'active' : 
                    index === (currentSlide - 1 + products.length) % products.length ? 'prev' :
                    index === (currentSlide + 1) % products.length ? 'next' : 'hidden'
                  }`}
                >
                  <div className="slide-content">
                    <div className="slide-image">
                      {product.photoUrl ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}${product.photoUrl}`} 
                          alt={product.name}
                        />
                      ) : (
                        <div className="no-image">
                          <span>📷</span>
                          <p>No Image</p>
                        </div>
                      )}
                    </div>
                    <div className="slide-info">
                      <h4>{product.name}</h4>
                      {product.description && (
                        <p className="slide-description">{product.description}</p>
                      )}
                      <div className="slide-category">
                        Category: {product.category}
                      </div>
                      {product.variants && product.variants.length > 0 && (
                        <div className="slide-pricing">
                          <div className="price-range">
                            ₹{Math.min(...product.variants.filter(v => v.available).map(v => v.price))} - 
                            ₹{Math.max(...product.variants.filter(v => v.available).map(v => v.price))}
                          </div>
                          <div className="variants-count">
                            {product.variants.filter(v => v.available).length} size{product.variants.filter(v => v.available).length !== 1 ? 's' : ''} available
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button className="slide-arrow prev-arrow" onClick={prevSlide}>
              ‹
            </button>
            <button className="slide-arrow next-arrow" onClick={nextSlide}>
              ›
            </button>

            {/* Slide Indicators */}
            <div className="slide-indicators">
              {products.map((_, index) => (
                <button 
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="home-cta">
        <h3>Explore Our Collection</h3>
        <p>Discover our wide range of traditional sweets and namkeens. From festive specials to everyday favorites!</p>
        <div className="cta-buttons">
          <a href="/products" className="button cta-button">
            View All Products
          </a>
        </div>
      </div>
    </section>
  )
}

