import { sequelize } from '../config/db.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Item from '../models/Item.js'

async function sync() {
  try {
    await sequelize.sync({ alter: true })
    console.log('DB synced')
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

sync()

