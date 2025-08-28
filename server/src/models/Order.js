import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Order extends Model {}

Order.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: true }, // Reference to user who placed the order
  orderNumber: { type: DataTypes.STRING, allowNull: true, unique: true }, // Auto-generated
  status: { 
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'), 
    allowNull: false, 
    defaultValue: 'pending' 
  },
  customerName: { type: DataTypes.STRING, allowNull: false }, // Keep for backward compatibility
  customerDetails: { 
    type: DataTypes.JSONB, 
    allowNull: false, 
    defaultValue: {},
    comment: 'Contains name, phone, email, address, notes'
  },
  items: { 
    type: DataTypes.JSONB, 
    allowNull: false, 
    defaultValue: [],
    comment: 'Array of order items with itemId, itemName, size, price, quantity, total'
  },
  total: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false, 
    defaultValue: 0.00 
  },
  paymentMethod: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'cash' 
  },
  orderDate: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
  notes: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  }
}, { 
  sequelize, 
  modelName: 'order',
  hooks: {
    beforeCreate: (order) => {
      // Auto-generate order number if not provided
      if (!order.orderNumber) {
        order.orderNumber = `HIN${Date.now()}${Math.floor(Math.random() * 100)}`
      }
      // Ensure customerName is set from customerDetails for backward compatibility
      if (!order.customerName && order.customerDetails?.name) {
        order.customerName = order.customerDetails.name
      }
    }
  }
})

export default Order

