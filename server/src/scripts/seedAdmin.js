import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { sequelize } from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

async function main() {
  const phone = '9999999999'
  const email = 'admin@example.com'
  const name = 'Admin'
  const password = 'admin123'
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    let user = await User.findOne({ where: { phone } })
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10)
      user = await User.create({ name, phone, email, passwordHash, role: 'admin' })
      console.log('Admin created with phone 9999999999 / password admin123')
    } else {
      user.role = 'admin'
      await user.save()
      console.log('Existing admin ensured')
    }
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
