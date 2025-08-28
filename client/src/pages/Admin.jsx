import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Admin() {
  const [form, setForm] = useState({ 
    name: '', 
    description: '',
    category: '',
    baseQuantity: 0, 
    quantityUnit: 'kg', 
    photo: null,
    variants: [{ size: '250g', price: 0, available: true }]
  })
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const load = async () => {
    const { data } = await api.get('/api/items')
    setItems(data)
  }
  useEffect(() => { load() }, [])

  const addVariant = () => {
    const newVariant = form.quantityUnit === 'kg' 
      ? { size: '500g', price: 0, available: true }
      : { size: 'Pack of 6', price: 0, available: true }
    
    setForm({
      ...form,
      variants: [...form.variants, newVariant]
    })
  }

  const handleUnitChange = (newUnit) => {
    // Reset variants with appropriate default values when unit changes
    const defaultVariant = newUnit === 'kg' 
      ? { size: '250g', price: 0, available: true }
      : { size: 'Single Piece', price: 0, available: true }
    
    setForm({
      ...form,
      quantityUnit: newUnit,
      baseQuantity: 0, // Reset quantity
      variants: [defaultVariant] // Reset to default variant
    })
  }

  const updateVariant = (index, field, value) => {
    const updatedVariants = form.variants.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    )
    setForm({ ...form, variants: updatedVariants })
  }

  const removeVariant = (index) => {
    if (form.variants.length > 1) {
      setForm({
        ...form,
        variants: form.variants.filter((_, i) => i !== index)
      })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    
    // Validate variants
    if (form.variants.length === 0) {
      setMsg('Please add at least one variant')
      return
    }
    
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('category', form.category)
    fd.append('baseQuantity', String(form.baseQuantity))
    fd.append('quantityUnit', form.quantityUnit)
    fd.append('variants', JSON.stringify(form.variants))
    if (form.photo) fd.append('photo', form.photo)
    
    // Log the data being sent
    console.log('Form data being sent:', {
      name: form.name,
      description: form.description,
      category: form.category,
      baseQuantity: form.baseQuantity,
      quantityUnit: form.quantityUnit,
      variants: form.variants,
      photo: form.photo ? form.photo.name : null
    })
    
    try {
      await api.post('/api/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm({ 
        name: '', 
        description: '',
        category: '',
        baseQuantity: 0, 
        quantityUnit: 'kg', 
        photo: null,
        variants: [{ size: '250g', price: 0, available: true }]
      })
      await load()
      setMsg('Product added successfully!')
    } catch (e) {
      console.error('Create product error:', e.response?.data || e.message)
      setMsg(`Create failed: ${e.response?.data?.error || e.message}`)
    }
  }

  const startEdit = (item) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      baseQuantity: item.baseQuantity || item.quantity || 0,
      quantityUnit: item.quantityUnit || 'kg',
      photo: null, // Don't pre-fill photo for editing
      variants: item.variants && item.variants.length > 0 ? item.variants : [{ size: '250g', price: 0, available: true }]
    })
    setMsg('')
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setForm({
      name: '',
      description: '',
      category: '',
      baseQuantity: 0,
      quantityUnit: 'kg',
      photo: null,
      variants: [{ size: '250g', price: 0, available: true }]
    })
    setMsg('')
  }

  const updateProduct = async (e) => {
    e.preventDefault()
    setMsg('')

    if (form.variants.length === 0) {
      setMsg('Please add at least one variant')
      return
    }

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('category', form.category)
    fd.append('baseQuantity', String(form.baseQuantity))
    fd.append('quantityUnit', form.quantityUnit)
    fd.append('variants', JSON.stringify(form.variants))
    if (form.photo) fd.append('photo', form.photo)

    try {
      await api.put(`/api/items/${editingItem.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      cancelEdit()
      await load()
      setMsg('Product updated successfully!')
    } catch (e) {
      console.error('Update product error:', e.response?.data || e.message)
      setMsg(`Update failed: ${e.response?.data?.error || e.message}`)
    }
  }

  const confirmDelete = (item) => {
    setShowDeleteConfirm(item)
  }

  const deleteProduct = async () => {
    if (!showDeleteConfirm) return

    try {
      await api.delete(`/api/items/${showDeleteConfirm.id}`)
      setShowDeleteConfirm(null)
      await load()
      setMsg('Product deleted successfully!')
    } catch (e) {
      console.error('Delete product error:', e.response?.data || e.message)
      setMsg(`Delete failed: ${e.response?.data?.error || e.message}`)
      setShowDeleteConfirm(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  return (
    <section>
      <h2>Admin</h2>
      <form className="card admin-form" onSubmit={editingItem ? updateProduct : submit}>
        <div className="admin-form-header">
          <h3>{editingItem ? 'Edit Product' : 'Add New Product'}</h3>
          <p className="form-description">{editingItem ? 'Update the product details below' : 'Fill in the details below to add a new product to your inventory'}</p>
          {editingItem && (
            <button type="button" className="button secondary" onClick={cancelEdit} style={{ marginTop: '8px' }}>
              ❌ Cancel Edit
            </button>
          )}
        </div>

        {/* Basic Product Information */}
        <div className="form-section">
          <h4 className="section-title">📝 Basic Information</h4>
          
          <div className="form-group">
            <label className="form-label required">Product Name</label>
            <input 
              className="input" 
              value={form.name} 
              onChange={e=>setForm({ ...form, name: e.target.value })} 
              placeholder="e.g., Rasgulla, Gulab Jamun, Mixed Namkeen" 
              required 
            />
            <small className="help-text">Enter the name of your sweet or snack product</small>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="input" 
              value={form.description} 
              onChange={e=>setForm({ ...form, description: e.target.value })} 
              rows={3} 
              placeholder="Describe your product - ingredients, taste, texture, special features..."
            />
            <small className="help-text">Optional: Add a detailed description to help customers understand your product</small>
          </div>
          
          <div className="form-group">
            <label className="form-label required">Category</label>
            <select className="input" value={form.category} onChange={e=>setForm({ ...form, category: e.target.value })} required>
              <option value="">-- Choose Product Category --</option>
              <option value="Traditional Sweets">Traditional Sweets (Rasgulla, Sandesh, etc.)</option>
              <option value="Dry Fruits & Nuts">Dry Fruits & Nuts (Almonds, Cashews, etc.)</option>
              <option value="Festive Specials">Festive Specials (Diwali, Holi items, etc.)</option>
              <option value="Milk Sweets">Milk Sweets (Burfi, Peda, Kheer, etc.)</option>
              <option value="Fried Sweets">Fried Sweets (Jalebi, Imarti, etc.)</option>
              <option value="Sugar Free">Sugar Free (Diabetic-friendly options)</option>
              <option value="Namkeens & Snacks">Namkeens & Snacks (Salty snacks)</option>
              <option value="Gift Boxes">Gift Boxes (Assorted sweet boxes)</option>
            </select>
            <small className="help-text">Select the category that best describes your product</small>
          </div>
        </div>
        
        {/* Inventory Management */}
        <div className="form-section">
          <h4 className="section-title">📦 Inventory & Stock</h4>
          
          <div className="form-group">
            <label className="form-label required">Available Stock</label>
            <div className="stock-input-group">
              <input 
                className="input stock-quantity" 
                type="number" 
                step="0.01" 
                min="0"
                value={form.baseQuantity} 
                onChange={e=>setForm({ ...form, baseQuantity: e.target.value })} 
                placeholder="0.00"
                required 
              />
              <select className="input stock-unit" value={form.quantityUnit} onChange={e=>handleUnitChange(e.target.value)}>
                <option value="kg">Kilograms (kg)</option>
                <option value="pcs">Pieces (pcs)</option>
              </select>
            </div>
            <small className="help-text">
              Enter total available stock. Use "kg" for weight-based products, "pcs" for countable items
            </small>
          </div>
        </div>
        
        {/* Product Variants */}
        <div className="form-section">
          <h4 className="section-title">💰 Pricing & Variants</h4>
          <p className="section-description">
            {form.quantityUnit === 'kg' 
              ? 'Add different weights/sizes for your product. Each variant can have its own price.'
              : 'Add different pack sizes/quantities for your product. Each variant can have its own price.'
            }
          </p>
          
          <div className="variants-section">
            <div className="variant-headers">
              <span className="variant-header">
                {form.quantityUnit === 'kg' ? 'Weight/Size' : 'Pack Size'}
              </span>
              <span className="variant-header">Price (₹)</span>
              <span className="variant-header">Status</span>
              <span className="variant-header">Action</span>
            </div>
            
            {form.variants.map((variant, index) => (
              <div key={index} className="variant-row">
                <div className="variant-field">
                  <input 
                    className="input" 
                    placeholder={form.quantityUnit === 'kg' 
                      ? '250g, 500g, 1kg, Large...' 
                      : 'Single, Pack of 6, Dozen, Box of 20...'
                    }
                    value={variant.size}
                    onChange={e => updateVariant(index, 'size', e.target.value)}
                    required
                  />
                </div>
                <div className="variant-field">
                  <input 
                    className="input" 
                    type="number" 
                    step="0.01"
                    min="0" 
                    placeholder="0.00"
                    value={variant.price}
                    onChange={e => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="variant-field">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={variant.available}
                      onChange={e => updateVariant(index, 'available', e.target.checked)}
                    />
                    <span className={variant.available ? 'status-available' : 'status-unavailable'}>
                      {variant.available ? 'Available' : 'Out of Stock'}
                    </span>
                  </label>
                </div>
                <div className="variant-field">
                  {form.variants.length > 1 ? (
                    <button type="button" className="remove-variant-btn" onClick={() => removeVariant(index)} title="Remove this variant">
                      🗑️
                    </button>
                  ) : (
                    <span className="variant-placeholder">-</span>
                  )}
                </div>
              </div>
            ))}
            
            <div className="variant-actions">
              <button type="button" className="button secondary" onClick={addVariant}>
                ➕ Add Another {form.quantityUnit === 'kg' ? 'Weight/Size' : 'Pack Size'}
              </button>
              <div className="variant-examples">
                <small className="help-text">
                  💡 {form.quantityUnit === 'kg' 
                    ? 'Examples: "250g", "500g", "1kg", "Large Pack", "Family Size"'
                    : 'Examples: "Single Piece", "Pack of 6", "Dozen", "Box of 20", "Family Pack"'
                  }
                </small>
              </div>
            </div>
          </div>
        </div>
        
        {/* Photo Upload */}
        <div className="form-section">
          <h4 className="section-title">📸 Product Photo</h4>
          
          <div className="form-group">
            <label className="form-label">Upload Product Image</label>
            <div className="file-upload-area">
              <input 
                className="input file-input" 
                type="file" 
                accept="image/*" 
                onChange={e=>setForm({ ...form, photo: e.target.files?.[0] || null })} 
              />
              <div className="file-upload-hint">
                <span className="upload-icon">📷</span>
                <p>Choose a clear, well-lit photo of your product</p>
                <small>Supported formats: JPG, PNG, WebP (Max: 5MB)</small>
              </div>
            </div>
            {form.photo && (
              <div className="selected-file">
                ✅ Selected: {form.photo.name}
              </div>
            )}
            <small className="help-text">
              A good product photo helps customers make better purchasing decisions
            </small>
          </div>
        </div>
        
        <button className="button" type="submit">{editingItem ? 'Update Product' : 'Add Product'}</button>
        {msg && <p style={{ color: msg.includes('success') ? 'var(--accent-brown)' : '#dc2626', marginTop: '12px' }}>{msg}</p>}
      </form>

      <h3 style={{ color: 'var(--text-dark)', marginTop: '32px' }}>Products</h3>
      {items.map(it => (
        <div key={it.id} className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' }}>  
                {it.name}
              </div>
              {it.description && (
                <div style={{ color: 'var(--text-medium)', marginBottom: '8px', fontSize: '14px' }}>
                  {it.description}
                </div>
              )}
              <div style={{ color: 'var(--text-medium)', marginBottom: '8px' }}>
                Stock: {it.baseQuantity || it.quantity} {it.quantityUnit}
                {it.category && ` | Category: ${it.category}`}
              </div>
              {it.variants && it.variants.length > 0 ? (
                <div style={{ marginTop: '8px' }}>
                  <strong style={{ color: 'var(--text-dark)' }}>Available Sizes:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {it.variants.map((variant, idx) => (
                      <span key={idx} style={{
                        background: variant.available ? 'var(--soft-orange)' : '#f3f4f6',
                        color: variant.available ? 'var(--text-dark)' : '#9ca3af',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        border: `1px solid ${variant.available ? 'var(--border-light)' : '#d1d5db'}`
                      }}>
                        {variant.size}: Rs.{variant.price} {!variant.available && '(Out of stock)'}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-medium)' }}>
                  Price per {it.unit}: Rs.{it.price}
                </div>
              )}
            </div>
            {it.photoUrl && (
              <img 
                src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}${it.photoUrl}`} 
                alt="photo" 
                style={{ 
                  width: 120, 
                  height: 120, 
                  objectFit: 'cover', 
                  borderRadius: '12px',
                  border: '2px solid var(--border-light)'
                }} 
              />
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button 
              className="button secondary" 
              onClick={() => startEdit(it)}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              ✏️ Edit
            </button>
            <button 
              className="button danger" 
              onClick={() => confirmDelete(it)}
              style={{ fontSize: '12px', padding: '6px 12px', background: '#dc2626', color: 'white' }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>"{showDeleteConfirm.name}"</strong>?</p>
              <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '8px' }}>
                This action cannot be undone. The product and its photo will be permanently removed.
              </p>
            </div>
            <div className="modal-actions">
              <button className="button secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="button danger" onClick={deleteProduct} style={{ background: '#dc2626', color: 'white' }}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
