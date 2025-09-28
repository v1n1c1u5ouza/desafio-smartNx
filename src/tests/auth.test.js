jest.mock('../models/index.js', () => {
  return {
    User: {
      findOne: jest.fn(),
      create: jest.fn(),
    },
  };
});

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'dummy.jwt.token'),
}));

import { register, login } from '../controllers/authController.js';
import { User } from '../models/index.js';
import { sign as jwtSign } from 'jsonwebtoken';

function mockReq(body = {}) {
  return { body };
}
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
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
    User.create.mockResolvedValue({ id: 1, name: 'Vinicius', username: 'vini' });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'vini' } });
    expect(User.create).toHaveBeenCalledWith({ name: 'Vinicius', username: 'vini', password: '123456' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Vinicius', username: 'vini' });
  });

  test('POST /login -> 200 (retorna token e user)', async () => {
    const req = mockReq({ username: 'vini', password: '123456' });
    const res = mockRes();

    const fakeUser = {
      id: 1,
      name: 'Vinicius',
      username: 'vini',
      checkPassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(fakeUser);

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'vini' } });
    expect(fakeUser.checkPassword).toHaveBeenCalledWith('123456');
    expect(jwtSign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      token: 'dummy.jwt.token',
      user: { id: 1, name: 'Vinicius', username: 'vini' },
    });
  });

  test('POST /login com senha errada -> 401', async () => {
    const req = mockReq({ username: 'vini', password: 'errada' });
    const res = mockRes();

    const fakeUser = {
      id: 1, name: 'Vinicius', username: 'vini',
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

    User.findOne.mockResolvedValue({ id: 99, username: 'vini' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Username já em uso' });
  });

  test('POST /login faltando campos -> 400', async () => {
    let req = mockReq({ username: 'vini' });
    let res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'username e password são obrigatórios' });

    req = mockReq({ password: '123456' });
    res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'username e password são obrigatórios' });
  });
});
