import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { sequelize } from '../src/config/db.js'
import User from '../src/models/User.js'
import Order from '../src/models/Order.js'
import authRoutes from '../src/routes/auth.js'
import orderRoutes from '../src/routes/orders.js'

// Setup an express app for tests
function makeApp() {
  const app = express()
  app.use(cors())
  app.use(bodyParser.json())
  app.use('/api/auth', authRoutes)
  app.use('/api/orders', orderRoutes)
  return app
}

async function setupDb() {
  process.env.DB_DIALECT = 'sqlite'
  await sequelize.sync({ force: true })
}

describe('API', () => {
  let app
  beforeAll(async () => {
    await setupDb()
    app = makeApp()
  })

  it('registers and logs in a user', async () => {
    await request(app).post('/api/auth/register').send({ name: 'U', email: 'u@example.com', password: 'pass' }).expect(201)
    const res = await request(app).post('/api/auth/login').send({ email: 'u@example.com', password: 'pass' }).expect(200)
    expect(res.body.token).toBeTruthy()
  })

  it('enforces admin role on delete', async () => {
    // create admin user token
    const adminToken = jwt.sign({ id: 1, email: 'a@example.com', role: 'admin' }, 'dev-secret')
    // create order
    const order = await Order.create({ orderNumber: '1001', status: 'pending', customerName: 'Alice', items: [] })
    await request(app).delete(`/api/orders/${order.id}`).set('Authorization', `Bearer ${adminToken}`).expect(200)
  })
})

