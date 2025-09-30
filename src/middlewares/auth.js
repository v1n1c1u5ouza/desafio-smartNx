import jwt from 'jsonwebtoken';
import { ERRORS } from '../constants/errors.js';
import { unauthorized } from '../utils/https.js';

export default function auth(req, res, next){
  const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return unauthorized(res, ERRORS.AUTH.MISSING_TOKEN);

    const parts = authorizationHeader.split(' ')

    if (parts.length !== 2) {
      return unauthorized(res, ERRORS.AUTH.INVALID_FORMAT);
    }

    const [schema, token] = parts;
    if (schema !== 'Bearer') {
      return unauthorized(res, ERRORS.AUTH.INVALID_SCHEMA);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.sub, username: decoded.username};
      return next();
    } catch (error) {
      console.error('Erro ao validar token:', error.message);
      return unauthorized(res, ERRORS.AUTH.INVALID_TOKEN);
    }
  }