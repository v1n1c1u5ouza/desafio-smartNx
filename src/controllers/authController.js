import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { ERRORS } from '../constants/errors.js';
import { created, ok, badRequest, unauthorized, internal } from '../utils/https.js';

export async function register(req, res) {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return badRequest(res, ERRORS.AUTH.NAME_USER_PASS_REQUIRED);
    }

    const exists = await User.findOne({ username });
    if (exists) return badRequest(res, ERRORS.AUTH.USERNAME_TAKEN);

    const user = await User.create({ name, username, password });
    return created(res, {
      id: String(user._id),
      name: user.name,
      username: user.username
    });

  } catch (error) {
    return internal(res, error, 'Erro ao registrar');
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return badRequest(res, ERRORS.AUTH.REQUIRED_FIELDS);
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.checkPassword(password))) {
      return unauthorized(res, ERRORS.AUTH.BAD_CREDENTIALS);
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { subject: String(user._id), expiresIn: process.env.JWT_EXPIRES }
    );

    return ok(res, {
      token: `Bearer ${token}`,
      user: { id: String(user._id), name: user.name, username: user.username },
    });
    
  } catch (error) {
    return internal(res, error, 'Erro ao autenticar');
  }
}
