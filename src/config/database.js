import 'dotenv/config';
import { Sequelize } from 'sequelize';

const dbName =
  process.env.NODE_ENV === 'test'
    ? `${process.env.DB_NAME}_test`
    : process.env.DB_NAME;

export const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);
