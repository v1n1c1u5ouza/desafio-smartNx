import mongoose from 'mongoose';
import { connectMongo } from '../../src/config/mongo.js';


describe('DB Mongo (Mongoose) – conexão', () => {
  test(
    'connectMongo() deve conectar com sucesso',
    async () => {
      const conn = await connectMongo();
      expect(conn).toBeDefined();
      expect(mongoose.connection.readyState).toBe(1);
    },
    30000
  );



  afterAll(async () => {
    await mongoose.disconnect();
  });
});