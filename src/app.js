import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { sequelize } from './models/index.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(routes);

async function init() {
  await sequelize.authenticate();
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync({ force: true });
  } else {
    await sequelize.sync();
  }
}

init().catch((err) => {
  console.error('Erro ao iniciar DB:', err);
  if (process.env.NODE_ENV !== 'test') process.exit(1);
});


export default app;