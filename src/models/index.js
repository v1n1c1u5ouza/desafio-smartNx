import { sequelize } from '../config/database.js';
import userModel from './user.js';

const User = userModel(sequelize);

export { sequelize, User };
