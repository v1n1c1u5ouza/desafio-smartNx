jest.mock('../models/index.js', () => {
  const Post = {
    findByPk: jest.fn(),
  };
  const Comment = {
    create: jest.fn(),
    findOne: jest.fn(),
  };
  return { __esModule: true, Post, Comment };
});

import { Post, Comment } from '../models/index.js';
import {
  addComment, deleteComment, updateComment,
} from '../controllers/commentController.js';
import { ERRORS } from '../constants/errors.js';

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

describe('commentController', () => {
  test('addComment -> 400 se faltar content', async () => {
    const req = mockReq({ params: { postId: 1 }, body: {} });
    const res = mockRes();

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('addComment -> 404 se post não existe', async () => {
    const req = mockReq({ params: { postId: 1 }, body: { content: 'oi' } });
    const res = mockRes();
    Post.findByPk.mockResolvedValue(null);

    await addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('addComment -> 201 quando ok', async () => {
    const req = mockReq({ params: { postId: 1 }, body: { content: 'legal' } });
    const res = mockRes();
    Post.findByPk.mockResolvedValue({ id: 1 });
    Comment.create.mockResolvedValue({ id: 10, postId: 1, authorId: 'user123', content: 'legal', authorUsername: 'user1233' });

    await addComment(req, res);

    expect(Comment.create).toHaveBeenCalledWith({
      postId: 1, authorId: 'user123', content: 'legal', authorUsername: 'user1233'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 10, postId: 1, authorId: 'user123', content: 'legal', authorUsername: 'user1233' });
  });

  test('deleteComment -> 404 se comentário não existe', async () => {
    const req = mockReq({ params: { postId: 1, commentId: 99 } });
    const res = mockRes();
    Comment.findOne.mockResolvedValue(null);

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('deleteComment -> 403 se não é autor', async () => {
    const req = mockReq({ params: { postId: 1, commentId: 10 } });
    const res = mockRes();
    Comment.findOne.mockResolvedValue({ id: 10, postId: 1, authorId: 'alguem' });

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('deleteComment -> 204 quando autor correto', async () => {
    const req = mockReq({ params: { postId: 1, commentId: 10 } });
    const res = mockRes();
    const commentInstance = { id: 10, postId: 1, authorId: 'user123', destroy: jest.fn().mockResolvedValue(true) };
    Comment.findOne.mockResolvedValue(commentInstance);

    await deleteComment(req, res);

    expect(commentInstance.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('updateComment -> 404 se não existe', async () => {
    const req = mockReq({ params: { postId: 1, commentId: 10 }, body: { content: 'novo' } });
    const res = mockRes();
    Comment.findOne.mockResolvedValue(null);

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('updateComment -> 403 se não é autor', async () => {
    const req = mockReq({ params: { postId: 1, commentId: 10 }, body: { content: 'novo' } });
    const res = mockRes();
    Comment.findOne.mockResolvedValue({ id: 10, postId: 1, authorId: 'outro' });

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('updateComment -> 400 se nada para atualizar', async () => {
    const req = mockReq({ params: { postId: 1, commentId: 10 }, body: {} });
    const res = mockRes();
    Comment.findOne.mockResolvedValue({ id: 10, postId: 1, authorId: 'user123' });

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: ERRORS.COMMENTS.NOTHING_TO_UPDATE });
  });

  test('updateComment -> 200 quando ok', async () => {
    const req = mockReq({ params: { postId: 1, commentId: 10 }, body: { content: 'editado' } });
    const res = mockRes();
    const instance = { id: 10, postId: 1, authorId: 'user123', update: jest.fn().mockResolvedValue(true) };
    Comment.findOne.mockResolvedValue(instance);

    await updateComment(req, res);

    expect(instance.update).toHaveBeenCalledWith({ content: 'editado' });
    expect(res.json).toHaveBeenCalledWith(instance);
  });
});
