import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { sequelize } from './config/db.js'
import authRoutes from './routes/auth.js'
import orderRoutes from './routes/orders.js'
import itemsRoutes from './routes/items.js'
import customersRoutes from './routes/customers.js'
import path from 'path'
import fs from 'fs'

dotenv.config()
const app = express()

app.use(cors())
app.use(bodyParser.json())

const uploadPath = path.resolve('uploads')
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true })
app.use('/uploads', express.static(uploadPath))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/customers', customersRoutes)

const port = process.env.PORT || 4000

async function start() {
  try {
    await sequelize.authenticate()
    console.log('DB connected')
    app.listen(port, () => console.log(`API on http://localhost:${port}`))
  } catch (e) {
    console.error('Failed to start', e)
    process.exit(1)
  }
}

start()

