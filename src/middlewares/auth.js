import jwt from 'jsonwebtoken'

export default function auth(req, res, next){
  const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return res.status(401).json({ error: 'Token não fonecido'});

    const parts = authorizationHeader.split(' ')

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Formato do token inválido (Bearer <token>)' });
    }

    const [schema, token] = parts;
    if (schema !== 'Bearer') {
      return res.status(401).json({ error: 'Formato do token inválido (Esquema deve ser Bearer)' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: Number(decoded.sub)};
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado'});
    }
  }