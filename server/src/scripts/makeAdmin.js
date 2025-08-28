import dotenv from 'dotenv'
import { sequelize } from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node src/scripts/makeAdmin.js <email>')
    process.exit(1)
  }
  try {
    await sequelize.authenticate()
    const user = await User.findOne({ where: { email } })
    if (!user) {
      console.error('User not found')
      process.exit(1)
    }
    user.role = 'admin'
    await user.save()
    console.log(`Promoted ${email} to admin`)
    process.exit(0)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main()
