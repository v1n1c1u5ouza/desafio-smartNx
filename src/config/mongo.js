import 'dotenv/config'
import mongoose from 'mongoose'

export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB || 'authdb';
  if (!uri) throw new Error('MONGO_URI não configurado');

  await mongoose.connect(uri, {dbName});
  return mongoose.connection;
}