import { Router } from 'express'
import Order from '../models/Order.js'
import Item from '../models/Item.js'
import User from '../models/User.js'
import { authRequired, requireRole } from '../middleware/auth.js'
import { Op } from 'sequelize'

const router = Router()

// Create new order (customer)
router.post('/', authRequired, async (req, res) => {
  try {
    const { items, customerDetails, total, paymentMethod } = req.body
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' })
    }
    
    if (!customerDetails || !customerDetails.name || !customerDetails.phone) {
      return res.status(400).json({ error: 'Customer name and phone are required' })
    }

    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Invalid order total' })
    }

    // Verify items exist and calculate actual total
    let calculatedTotal = 0
    const orderItems = []
    
    for (const orderItem of items) {
      const item = await Item.findByPk(orderItem.itemId)
      if (!item) {
        return res.status(400).json({ error: `Item with ID ${orderItem.itemId} not found` })
      }
      
      // Find the variant
      const variant = item.variants?.find(v => v.size === orderItem.size)
      if (!variant || !variant.available) {
        return res.status(400).json({ error: `Variant ${orderItem.size} for ${item.name} is not available` })
      }
      
      const itemTotal = variant.price * orderItem.quantity
      calculatedTotal += itemTotal
      
      orderItems.push({
        itemId: item.id,
        itemName: item.name,
        size: orderItem.size,
        price: variant.price,
        quantity: orderItem.quantity,
        total: itemTotal
      })
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      customerDetails: {
        name: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email || '',
        address: customerDetails.address || '',
        notes: customerDetails.notes || ''
      },
      total: calculatedTotal,
      paymentMethod: paymentMethod || 'cash',
      status: 'pending',
      orderDate: new Date()
    })

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        orderDate: order.orderDate,
        items: order.items,
        customerDetails: order.customerDetails
      }
    })

  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Get user's orders
router.get('/my-orders', authRequired, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    })

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      orderDate: order.orderDate || order.createdAt,
      itemCount: order.items?.length || 0,
      customerDetails: order.customerDetails
    }))

    res.json(formattedOrders)
  } catch (error) {
    console.error('Get user orders error:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Admin: List orders with pagination and sorting
router.get('/', requireRole('admin'), async (req, res) => {
  const { q, status } = req.query
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10))
  const allowedSort = new Set(['createdAt', 'orderNumber', 'status', 'customerName', 'total'])
  const sort = allowedSort.has(req.query.sort) ? req.query.sort : 'createdAt'
  const dir = (req.query.dir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC'

  let where = {}
  
  // Add status filter
  if (status && status !== 'all') {
    where.status = status
  }
  
  // Add search filter
  if (q) {
    where[Op.or] = [
      { orderNumber: { [Op.iLike]: `%${q}%` } },
      { customerName: { [Op.iLike]: `%${q}%` } }
    ]
  }

  try {
    const { rows, count } = await Order.findAndCountAll({
      where,
      offset: (page - 1) * limit,
      limit,
      order: [[sort, dir]]
    })

    const formattedOrders = rows.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      orderDate: order.orderDate || order.createdAt,
      paymentMethod: order.paymentMethod,
      customerDetails: order.customerDetails,
      customerName: order.customerName,
      itemCount: order.items?.length || 0,
      items: order.items,
      createdAt: order.createdAt
    }))

    res.json({ 
      data: formattedOrders, 
      total: count, 
      page, 
      pages: Math.ceil(count / limit), 
      limit, 
      sort, 
      dir: dir.toLowerCase() 
    })
  } catch (e) {
    console.error('Get orders error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get single order details
router.get('/:id', authRequired, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id)
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Check if user owns this order or is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      orderDate: order.orderDate || order.createdAt,
      paymentMethod: order.paymentMethod,
      items: order.items,
      customerDetails: order.customerDetails,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    })

  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// Admin: Update order status
router.patch('/:id/status', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const order = await Order.findByPk(req.params.id)
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    await order.update({ status })

    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order.id,
        status: order.status,
        updatedAt: order.updatedAt
      }
    })

  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// Admin: Delete order
router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id)
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    await order.destroy()
    res.json({ message: 'Order deleted successfully' })

  } catch (error) {
    console.error('Delete order error:', error)
    res.status(500).json({ error: 'Failed to delete order' })
  }
})

export default router

