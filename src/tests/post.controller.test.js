jest.mock('../models/index.js', () => {
  const Post = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };
  const Comment = {
    
  };
  return { __esModule: true, Post, Comment };
});

import { Post } from '../models/index.js';
import {
  createPost, listPosts, getPost, updatePost, deletePost,
} from '../controllers/postController.js';

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.send   = jest.fn().mockReturnValue(res);
  return res;
}
const mockReq = (over = {}) => ({
  params: {},
  body: {},
  user: { id: 'user123', username: 'user1233' },
  ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('postController', () => {
  test('createPost -> 201 (cria com authorId e authorUsername)', async () => {
    const req = mockReq({ body: { title: 'T1', content: 'C1' } });
    const res = mockRes();
    const fakePost = {
      id: 1, title: 'T1', content: 'C1',
      authorId: 'user123', authorUsername: 'user1233',
      createdAt: 'now', updatedAt: 'now',
    };
    Post.create.mockResolvedValue(fakePost);

    await createPost(req, res);

    expect(Post.create).toHaveBeenCalledWith({
      title: 'T1', content: 'C1', authorId: 'user123', authorUsername: 'user1233',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1, title: 'T1', content: 'C1',
      authorId: 'user123', authorUsername: 'user1233',
      createdAt: 'now', updatedAt: 'now',
    });
  });

  test('listPosts -> 200 (lista posts)', async () => {
    const req = mockReq(); const res = mockRes();
    Post.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await listPosts(req, res);

    expect(Post.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  test('getPost -> 404 se não encontrado', async () => {
    const req = mockReq({ params: { id: 99 } }); const res = mockRes();
    Post.findByPk.mockResolvedValue(null);

    await getPost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('getPost -> 200 quando encontrado', async () => {
    const req = mockReq({ params: { id: 1 } }); const res = mockRes();
    Post.findByPk.mockResolvedValue({ id: 1 });

    await getPost(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 1 });
  });

  test('updatePost -> 200 (autor correto e campos válidos)', async () => {
    const req = mockReq({
      params: { id: 1 },
      body: { title: 'Novo' },
      user: { id: 'user123', username: 'user1233' },
    });
    const res = mockRes();
    const postInstance = {
      id: 1,
      authorId: 'user123',
      update: jest.fn().mockResolvedValue(true),
    };
    Post.findByPk.mockResolvedValue(postInstance);

    await updatePost(req, res);

    expect(Post.findByPk).toHaveBeenCalledWith(1);
    expect(postInstance.update).toHaveBeenCalledWith({ title: 'Novo' });
    expect(res.json).toHaveBeenCalledWith(postInstance);
  });

  test('updatePost -> 403 se não é o autor', async () => {
    const req = mockReq({
      params: { id: 1 },
      body: { title: 'Novo' },
      user: { id: 'outro', username: 'x' },
    });
    const res = mockRes();
    Post.findByPk.mockResolvedValue({ id: 1, authorId: 'user123' });

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('updatePost -> 400 se nada para atualizar', async () => {
    const req = mockReq({ params: { id: 1 }, body: {} });
    const res = mockRes();
    Post.findByPk.mockResolvedValue({ id: 1, authorId: 'user123' });

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Nada para atualizar' });
  });

  test('deletePost -> 204 quando autor correto', async () => {
    const req = mockReq({ params: { id: 1 } });
    const res = mockRes();
    const postInstance = { id: 1, authorId: 'user123', destroy: jest.fn().mockResolvedValue(true) };
    Post.findByPk.mockResolvedValue(postInstance);

    await deletePost(req, res);

    expect(postInstance.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('deletePost -> 404 se não encontrado', async () => {
    const req = mockReq({ params: { id: 1 } });
    const res = mockRes();
    Post.findByPk.mockResolvedValue(null);

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
