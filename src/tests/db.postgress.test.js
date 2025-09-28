import { sequelize } from '../../src/config/database.js';


describe('DB Postgres (Sequelize) – conexão', () => {
  test('sequelize.authenticate() deve conectar com sucesso', async () => {
    await expect(sequelize.authenticate()).resolves.toBeUndefined();
  });


  afterAll(async () => {
    await sequelize.close();
  });
});