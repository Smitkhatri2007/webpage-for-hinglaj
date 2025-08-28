import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Item from '../models/Item.js'
import { authRequired, requireRole } from '../middleware/auth.js'

const router = Router()

const uploadDir = path.resolve('uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9\-]/gi, '_')
    cb(null, `${base}_${Date.now()}${ext}`)
  }
})
const upload = multer({ storage })

// List items with optional category filtering
router.get('/', async (req, res) => {
  const { category } = req.query
  
  const whereClause = {}
  if (category && category !== 'all') {
    whereClause.category = category
  }
  
  const items = await Item.findAll({ 
    where: whereClause,
    order: [['createdAt', 'DESC']] 
  })
  res.json(items)
})

// Get unique categories
router.get('/categories', async (req, res) => {
  try {
    const items = await Item.findAll({
      attributes: ['category'],
      group: ['category'],
      where: {
        category: {
          [Item.sequelize.Sequelize.Op.not]: null
        }
      }
    })
    
    const categories = items.map(item => item.category).filter(Boolean)
    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Create item (admin)
router.post('/', authRequired, requireRole('admin'), upload.single('photo'), async (req, res) => {
  try {
    const { name, description, category, baseQuantity, quantityUnit, variants } = req.body
    
    if (!name) return res.status(400).json({ error: 'Missing name' })
    
    let parsedVariants = []
    if (variants) {
      try {
        parsedVariants = JSON.parse(variants)
        if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
          return res.status(400).json({ error: 'Variants must be a non-empty array' })
        }
      } catch (e) {
        return res.status(400).json({ error: 'Invalid variants JSON' })
      }
    }
    
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null
    
    const item = await Item.create({ 
      name, 
      description: description || null,
      category: category || null,
      baseQuantity: parseFloat(baseQuantity) || 0, 
      quantityUnit: quantityUnit || 'kg',
      variants: parsedVariants,
      photoUrl 
    })
    
    res.status(201).json(item)
  } catch (error) {
    console.error('Create item error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get single item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const item = await Item.findByPk(id)
    
    if (!item) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    res.json(item)
  } catch (error) {
    console.error('Get item error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update item (admin)
router.put('/:id', authRequired, requireRole('admin'), upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, category, baseQuantity, quantityUnit, variants } = req.body
    
    const item = await Item.findByPk(id)
    if (!item) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    if (!name) return res.status(400).json({ error: 'Missing name' })
    
    let parsedVariants = []
    if (variants) {
      try {
        parsedVariants = JSON.parse(variants)
        if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
          return res.status(400).json({ error: 'Variants must be a non-empty array' })
        }
      } catch (e) {
        return res.status(400).json({ error: 'Invalid variants JSON' })
      }
    }
    
    // Handle photo update
    let photoUrl = item.photoUrl
    if (req.file) {
      // Delete old photo if it exists
      if (item.photoUrl) {
        const oldPhotoPath = path.resolve('uploads', path.basename(item.photoUrl))
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath)
        }
      }
      photoUrl = `/uploads/${req.file.filename}`
    }
    
    // Update item
    await item.update({ 
      name, 
      description: description || null,
      category: category || null,
      baseQuantity: parseFloat(baseQuantity) || 0, 
      quantityUnit: quantityUnit || 'kg',
      variants: parsedVariants,
      photoUrl 
    })
    
    res.json(item)
  } catch (error) {
    console.error('Update item error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete item (admin)
router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params
    
    const item = await Item.findByPk(id)
    if (!item) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Delete associated photo if it exists
    if (item.photoUrl) {
      const photoPath = path.resolve('uploads', path.basename(item.photoUrl))
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath)
      }
    }
    
    await item.destroy()
    
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete item error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
