import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { ERRORS } from '../constants/errors.js';
import { assert, requireFields, HttpError } from '../utils/guards.js';
import { created, ok, badRequest, conflict, unauthorized, internal } from '../utils/https.js';

export async function register(req, res) {
  try {
    const { name, username, password } = req.body;
    requireFields({ name, username, password }, ['name', 'username', 'password']);

    const exists = await User.findOne({ username });
    assert(!exists, 409, ERRORS.AUTH.USERNAME_TAKEN);

    const user = await User.create({ name, username, password });
    return created(res, {
      id: String(user._id),
      name: user.name,
      username: user.username,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 409) return conflict(res, error.message);
      return badRequest(res, error.message);
    }
    return internal(res, error, 'Erro ao registrar');
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    requireFields({ username, password }, ['username', 'password']);

    const user = await User.findOne({ username });
    const okCreds = user && (await user.checkPassword(password));
    assert(okCreds, 401, ERRORS.AUTH.BAD_CREDENTIALS);

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
    if (error instanceof HttpError) {
      if (error.status === 401) return unauthorized(res, error.message);
      return badRequest(res, error.message);
    }
    return internal(res, error, 'Erro ao autenticar');
  }
}
