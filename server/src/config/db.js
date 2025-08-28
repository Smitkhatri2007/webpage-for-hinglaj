import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'order_tracking',
  DB_USER = 'postgres',
  DB_PASS = 'postgres',
  DB_SSL = 'false',
  DB_DIALECT = 'postgres'
} = process.env

let sequelizeInstance
if (DB_DIALECT === 'sqlite') {
  sequelizeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  })
} else {
  sequelizeInstance = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: 'postgres',
    dialectOptions: DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    logging: false
  })
}

export const sequelize = sequelizeInstance

