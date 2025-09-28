jest.mock('jsonwebtoken', () => ({ verify: jest.fn(() => ({ sub: '1' })) }));

import jwt from 'jsonwebtoken';
import auth from '../middlewares/auth.js';

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}
function mockNext() { return jest.fn(); }

test('401 se sem Authorization', () => {
  const req = { headers: {} };
  const res = mockRes(); const next = mockNext();
  auth(req, res, next);
  expect(res.status).toHaveBeenCalledWith(401);
});

test('chama next() se token válido', () => {
  const req = { headers: { authorization: 'Bearer abc' } };
  const res = mockRes(); const next = mockNext();
  auth(req, res, next);
  expect(jwt.verify).toHaveBeenCalledWith('abc', process.env.JWT_SECRET);
  expect(next).toHaveBeenCalled();
});
