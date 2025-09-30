import jwt from 'jsonwebtoken';
import { ERRORS } from '../constants/errors.js';
import { unauthorized } from '../utils/https.js';
import { assert, HttpError } from '../utils/guards.js';

export default function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization;
    assert(hdr, 401, ERRORS.AUTH.MISSING_TOKEN);

    const [schema, token] = String(hdr).split(' ');
    assert(schema === 'Bearer' && token, 401, ERRORS.AUTH.INVALID_FORMAT);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub, username: decoded.username };

    return next();
  } catch (err) {
    if (err instanceof HttpError) {
      return unauthorized(res, err.message);
    }
    return unauthorized(res, ERRORS.AUTH.INVALID_TOKEN);
  }
}