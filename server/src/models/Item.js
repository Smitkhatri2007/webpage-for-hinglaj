import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'

class Item extends Model {}

Item.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: { type: DataTypes.STRING, allowNull: true },
  baseQuantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  quantityUnit: { type: DataTypes.ENUM('kg', 'pcs'), allowNull: false, defaultValue: 'kg' },
  variants: { 
    type: DataTypes.JSONB, 
    allowNull: false, 
    defaultValue: [],
    comment: 'Array of variants: [{size: "250g", price: 150, weight: 0.25, available: true}, ...]'
  },
  photoUrl: { type: DataTypes.STRING, allowNull: true }
}, { sequelize, modelName: 'item' })

export default Item
