jest.mock('../models/user.js', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'dummy.jwt.token'),
}));

import { register, login } from '../controllers/authController.js';
import User from '../models/user.js';
import { sign as jwtSign } from 'jsonwebtoken';

function mockReq(body = {}) { return { body }; }
function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json   = jest.fn(() => res);
  res.send   = jest.fn(() => res);
  return res;
}

beforeEach(() => {
  User.findOne.mockReset();
  User.create.mockReset();
  jwtSign.mockClear();
});

describe('authController (register/login)', () => {
  test('POST /register -> 201 (retorna id/name/username e não expõe password)', async () => {
    const req = mockReq({ name: 'Vinicius', username: 'vini', password: '123456' });
    const res = mockRes();

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', name: 'Vinicius', username: 'vini' });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ username: 'vini' });
    expect(User.create).toHaveBeenCalledWith({ name: 'Vinicius', username: 'vini', password: '123456' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: '507f1f77bcf86cd799439011',
      name: 'Vinicius',
      username: 'vini',
    });
  });

  test('POST /login -> 200 (retorna token e user)', async () => {
    const req = mockReq({ username: 'vini', password: '123456' });
    const res = mockRes();

    const fakeUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Vinicius',
      username: 'vini',
      checkPassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(fakeUser);

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ username: 'vini' });
    expect(fakeUser.checkPassword).toHaveBeenCalledWith('123456');
    expect(jwtSign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      token: 'dummy.jwt.token',
      user: { id: '507f1f77bcf86cd799439011', name: 'Vinicius', username: 'vini' },
    });
  });

  test('POST /login com senha errada -> 401', async () => {
    const req = mockReq({ username: 'vini', password: 'errada' });
    const res = mockRes();

    const fakeUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Vinicius',
      username: 'vini',
      checkPassword: jest.fn().mockResolvedValue(false),
    };
    User.findOne.mockResolvedValue(fakeUser);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
  });

  test('POST /register com username duplicado -> 409', async () => {
    const req = mockReq({ name: 'Vinicius', username: 'vini', password: '123456' });
    const res = mockRes();

    User.findOne.mockResolvedValue({ _id: 'X', username: 'vini' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Username já em uso' });
  });

  test('POST /login faltando campos -> 400', async () => {
    let res = mockRes();
    await login(mockReq({ username: 'vini' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'username e password são obrigatórios' });

    res = mockRes();
    await login(mockReq({ password: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'username e password são obrigatórios' });
  });
});
