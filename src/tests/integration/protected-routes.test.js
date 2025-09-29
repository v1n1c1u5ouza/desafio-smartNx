import request from 'supertest';
import app from '../../app.js';

jest.mock('jsonwebtoken', () => ({ verify: jest.fn() }));
jest.mock('../../models/index.js', () => {
  const Post = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };
  const Comment = {
    create: jest.fn(),
    findOne: jest.fn(),
  };
  return { __esModule: true, Post, Comment };
});

import jwt from 'jsonwebtoken';
import { Post, Comment } from '../../models/index.js';

describe('Integração: CRUD protegido (posts/comments)', () => {
  let silent;

  beforeEach(() => {
    jest.clearAllMocks();
    silent = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    silent.mockRestore();
  });

  test('GET /posts -> 401 sem Authorization', async () => {
    const res = await request(app).get('/posts');
    expect(res.status).toBe(401);
  });

  test('GET /posts -> 401 com token inválido', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('bad token'); });
    const res = await request(app)
      .get('/posts')
      .set('Authorization', 'Bearer invalid.token');
    expect(res.status).toBe(401);
  });

  test('GET /posts -> 200 com token válido', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });
    Post.findAll.mockResolvedValue([{ id: 1, title: 'T', content: 'C', authorId: 'user123', authorUsername: 'user1233' }]);

    const res = await request(app)
      .get('/posts')
      .set('Authorization', 'Bearer valid.token');

    expect(res.status).toBe(200);
    expect(Post.findAll).toHaveBeenCalled();
  });

  test('POST /posts -> 201 cria post com author do token', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });
    Post.create.mockResolvedValue({
      id: 10, title: 'T1', content: 'C1', authorId: 'user123', authorUsername: 'user1233',
      createdAt: 'now', updatedAt: 'now',
    });

    const res = await request(app)
      .post('/posts')
      .set('Authorization', 'Bearer token.ok')
      .send({ title: 'T1', content: 'C1' });

    expect(res.status).toBe(201);
    expect(Post.create).toHaveBeenCalledWith({
      title: 'T1', content: 'C1', authorId: 'user123', authorUsername: 'user1233',
    });
  });

  test('PUT /posts/:id -> 403 se não é o autor', async () => {
    jwt.verify.mockReturnValue({ sub: 'other', username: 'x' });
    Post.findByPk.mockResolvedValue({
      id: 10, authorId: 'user123', update: jest.fn(),
    });

    const res = await request(app)
      .put('/posts/10')
      .set('Authorization', 'Bearer token.ok')
      .send({ title: 'Novo' });

    expect(res.status).toBe(403);
  });

  test('PUT /posts/:id -> 400 se body vazio', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });
    Post.findByPk.mockResolvedValue({
      id: 10, authorId: 'user123', update: jest.fn(),
    });

    const res = await request(app)
      .put('/posts/10')
      .set('Authorization', 'Bearer token.ok')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Nada para atualizar' });
  });

  test('DELETE /posts/:id -> 204 quando autor correto', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });
    const destroy = jest.fn().mockResolvedValue(true);
    Post.findByPk.mockResolvedValue({ id: 10, authorId: 'user123', destroy });

    const res = await request(app)
      .delete('/posts/10')
      .set('Authorization', 'Bearer token.ok');

    expect(res.status).toBe(204);
    expect(destroy).toHaveBeenCalled();
  });

  test('GET /posts/:id -> 404 quando não existe', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });
    Post.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .get('/posts/999')
      .set('Authorization', 'Bearer token.ok');

    expect(res.status).toBe(404);
  });

  test('POST /posts/:postId/comments -> 201 adiciona comentário', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });

    Post.findByPk = jest.fn().mockResolvedValue({ id: 10 });
    Comment.create.mockResolvedValue({
      id: 7, postId: 10, authorId: 'user123', content: 'legal',  authorUsername: 'user1233', createdAt: 'now', updatedAt: 'now',
    });

    const res = await request(app)
      .post('/posts/10/comments')
      .set('Authorization', 'Bearer token.ok')
      .send({ content: 'legal' });

    expect(res.status).toBe(201);
    expect(Comment.create).toHaveBeenCalledWith({
      postId: 10, authorId: 'user123', content: 'legal', authorUsername: 'user1233'
    });
  });

  test('PUT /posts/:postId/comments/:commentId -> 403 se não é autor', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });
    Comment.findOne.mockResolvedValue({
      id: 7, postId: 10, authorId: 'someone-else', update: jest.fn(),
    });

    const res = await request(app)
      .put('/posts/10/comments/7')
      .set('Authorization', 'Bearer token.ok')
      .send({ content: 'editado' });

    expect(res.status).toBe(403);
  });

  test('PUT /posts/:postId/comments/:commentId -> 400 se body vazio', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });
    Comment.findOne.mockResolvedValue({
      id: 7, postId: 10, authorId: 'user123', update: jest.fn(),
    });

    const res = await request(app)
      .put('/posts/10/comments/7')
      .set('Authorization', 'Bearer token.ok')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Nada para atualizar' });
  });

  test('DELETE /posts/:postId/comments/:commentId -> 204 quando autor correto', async () => {
    jwt.verify.mockReturnValue({ sub: 'user123', username: 'user1233' });
    const destroy = jest.fn().mockResolvedValue(true);
    Comment.findOne.mockResolvedValue({ id: 7, postId: 10, authorId: 'user123', destroy });

    const res = await request(app)
      .delete('/posts/10/comments/7')
      .set('Authorization', 'Bearer token.ok');

    expect(res.status).toBe(204);
    expect(destroy).toHaveBeenCalled();
  });
});
