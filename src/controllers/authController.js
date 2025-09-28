import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export async function register(req, res) {
  try {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(401).json({ error: 'name, username e password são obrigatórios' });
    }
    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(409).json({ error: 'Username já em uso' });

    const user = await User.create({ name, username, password });
    return res.status(201).json({ id: user.id, name: user.name, username: user.username });
  } catch (error) {
    return res.status(500).json({ 'Erro ao registrar': error.message });
  }
}

export async function login(req, res) {
  try {
    const { username, password} = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username e password são obrigatórios' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error:  'Credenciais inválidas' });
    }

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES || '1h',
    });
    
    return res.json({ token, user: { id: user.id, name: user.name, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao autenticar', details: error.message });
  }
}