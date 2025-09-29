import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { sequelize } from './models/index.js';
import { connectMongo } from './config/mongo.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(routes);

export async function init() {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'test') {
      await sequelize.sync({ force: true });
    } else {
      await sequelize.sync();
    }
    console.log('Conectado ao Postgres');
  } catch (err) {
    console.error('Erro ao conectar ao Postgres:', err);
    if (process.env.NODE_ENV !== 'test') process.exit(1);
  }

  try {
    await connectMongo();
    console.log('Conectado ao Mongo');
  } catch (err) {
    console.error('Erro ao conectar ao Mongo:', err);
    if (process.env.NODE_ENV !== 'test') process.exit(1);
  }
}

export default app;
