import { Sequelize } from 'sequelize';
import dbConfig from './config/database.js';

const sequelize = new Sequelize(dbConfig);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao Postgres com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falhou a conexão:', err.message);
    process.exit(1);
  }
})();