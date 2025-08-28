import { Router } from 'express'
import User from '../models/User.js'
import Order from '../models/Order.js'
import { authRequired, requireRole } from '../middleware/auth.js'
import { Op } from 'sequelize'

const router = Router()

// Get all customers (admin only)
router.get('/', authRequired, requireRole('admin'), async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))

  try {
    const where = {}
    
    // Search functionality
    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { phone: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } }
      ]
    }

    const { rows: customers, count } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'phone', 'email', 'role', 'createdAt', 'updatedAt'],
      offset: (pageNum - 1) * limitNum,
      limit: limitNum,
      order: [['createdAt', 'DESC']]
    })

    // Get order counts for each customer
    const customersWithOrderCounts = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.count({
          where: {
            customerName: customer.name // This is a simplification - in a real app you'd have a proper customer reference
          }
        })
        
        return {
          ...customer.toJSON(),
          orderCount
        }
      })
    )

    res.json({
      data: customersWithOrderCounts,
      total: count,
      page: pageNum,
      pages: Math.ceil(count / limitNum),
      limit: limitNum
    })
  } catch (e) {
    console.error('Get customers error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get individual customer details with order history (admin only)
router.get('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const customer = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'phone', 'email', 'role', 'createdAt', 'updatedAt']
    })

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    // Get customer's order history
    const orders = await Order.findAll({
      where: {
        customerName: customer.name // This is a simplification - in a real app you'd have a proper customer reference
      },
      order: [['createdAt', 'DESC']]
    })

    // Calculate order statistics
    const orderStats = {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => {
        const orderTotal = (order.items || []).reduce((itemSum, item) => {
          return itemSum + (item.price * item.qty || 0)
        }, 0)
        return sum + orderTotal
      }, 0),
      averageOrderValue: 0,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : null,
      statusBreakdown: {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      }
    }

    if (orderStats.totalOrders > 0) {
      orderStats.averageOrderValue = orderStats.totalSpent / orderStats.totalOrders
    }

    res.json({
      customer: customer.toJSON(),
      orders,
      stats: orderStats
    })
  } catch (e) {
    console.error('Get customer details error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get customer statistics (admin only)
router.get('/stats/overview', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const totalCustomers = await User.count()
    const totalAdmins = await User.count({ where: { role: 'admin' } })
    const totalRegularUsers = totalCustomers - totalAdmins

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentRegistrations = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    })

    res.json({
      totalCustomers: totalRegularUsers,
      totalAdmins,
      totalUsers: totalCustomers,
      recentRegistrations
    })
  } catch (e) {
    console.error('Get customer stats error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete customer (admin only with password confirmation)
router.delete('/:id', authRequired, requireRole('admin'), async (req, res) => {
  const { adminPassword } = req.body
  
  if (!adminPassword) {
    return res.status(400).json({ error: 'Admin password required' })
  }

  try {
    // Verify admin password
    const adminUser = await User.findByPk(req.user.id)
    if (!adminUser) {
      return res.status(401).json({ error: 'Admin user not found' })
    }

    const passwordValid = await adminUser.validPassword(adminPassword)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid admin password' })
    }

    // Find and delete the customer
    const customer = await User.findByPk(req.params.id)
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    // Don't allow deleting admin users
    if (customer.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' })
    }

    // Delete all orders associated with this customer
    await Order.destroy({
      where: {
        customerName: customer.name
      }
    })

    // Delete the customer
    await customer.destroy()

    res.json({ 
      success: true, 
      message: `Customer ${customer.name} and their ${await Order.count({ where: { customerName: customer.name } })} orders have been deleted` 
    })
  } catch (e) {
    console.error('Delete customer error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
