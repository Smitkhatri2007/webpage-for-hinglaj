import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { Op } from 'sequelize'

const router = Router()

router.post('/register', async (req, res) => {
  const { name, phone, email, password } = req.body
  if (!name || !phone || !email || !password) return res.status(400).json({ error: 'Missing fields' })
  try {
    const existing = await User.findOne({ where: { [Op.or]: [{ email }, { phone }] } })
    if (existing) return res.status(409).json({ error: 'Email or phone already registered' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, phone, email, passwordHash })
    res.status(201).json({ id: user.id, name: user.name, phone: user.phone, email: user.email })
  } catch (e) {
    console.error('Register error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  const { phone, password } = req.body
  if (!phone || !password) return res.status(400).json({ error: 'Missing fields' })
  try {
    const user = await User.findOne({ where: { phone } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await user.validPassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, phone: user.phone, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' })
    res.json({ token })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router

