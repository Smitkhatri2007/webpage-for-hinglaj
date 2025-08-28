import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/db.js'
import bcrypt from 'bcryptjs'

class User extends Model {
  async validPassword(password) {
    return bcrypt.compare(password, this.passwordHash)
  }
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: true, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' } // 'user' | 'admin'
}, { sequelize, modelName: 'user' })

export default User

