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

import User from '../models/user.js';
import { sign as jwtSign } from 'jsonwebtoken';
import { ERRORS } from '../constants/errors.js';
import { register, login } from '../controllers/authController.js';

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
    const req = mockReq({ name: 'usuario', username: 'user1233', password: '123456' });
    const res = mockRes();

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', name: 'usuario', username: 'user1233' });

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ username: 'user1233' });
    expect(User.create).toHaveBeenCalledWith({ name: 'usuario', username: 'user1233', password: '123456' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: '507f1f77bcf86cd799439011',
      name: 'usuario',
      username: 'user1233',
    });
  });

  test('POST /login -> 200 (retorna token e user)', async () => {
    const req = mockReq({ username: 'user1233', password: '123456' });
    const res = mockRes();

    const fakeUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'usuario',
      username: 'user1233',
      checkPassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(fakeUser);

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ username: 'user1233' });
    expect(fakeUser.checkPassword).toHaveBeenCalledWith('123456');
    expect(jwtSign).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      token: 'Bearer dummy.jwt.token',
      user: { id: '507f1f77bcf86cd799439011', name: 'usuario', username: 'user1233' },
    });
  });

  test('POST /login com senha errada -> 401', async () => {
    const req = mockReq({ username: 'user1233', password: 'errada' });
    const res = mockRes();

    const fakeUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'usuario',
      username: 'user1233',
      checkPassword: jest.fn().mockResolvedValue(false),
    };
    User.findOne.mockResolvedValue(fakeUser);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: ERRORS.AUTH.BAD_CREDENTIALS });
  });

  test('POST /register com username duplicado -> 400', async () => {
    const req = mockReq({ name: 'usuario', username: 'user1233', password: '123456' });
    const res = mockRes();

    User.findOne.mockResolvedValue({ _id: 'X', username: 'user1233' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: ERRORS.AUTH.USERNAME_TAKEN });
  });

  test('POST /login faltando campos -> 400', async () => {
    let res = mockRes();
    await login(mockReq({ username: 'user1233' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: ERRORS.AUTH.REQUIRED_FIELDS });

    res = mockRes();
    await login(mockReq({ password: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: ERRORS.AUTH.REQUIRED_FIELDS });
  });
});
