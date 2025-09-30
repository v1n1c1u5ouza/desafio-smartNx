import { ERRORS } from '../constants/errors.js';
import { Post, Comment } from '../models/index.js';
import { assert, ensureOwner, pickDefined, HttpError } from '../utils/guards.js';
import { ok, created, noContent, badRequest, forbidden, notFound, internal } from '../utils/https.js';

export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    assert(title && content, 400, ERRORS.POSTS.REQUIRED_FIELDS);

    const post = await Post.create({
      title,
      content,
      authorId: String(req.user.id),
      authorUsername: req.user.username,
    });

    return created(res, post);
  } catch (e) {
    if (e instanceof HttpError) return badRequest(res, e.message);
    return internal(res, e, 'Erro ao criar post');
  }
}

export async function listPosts(_req, res) {
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Comment, as: 'comments' }],
    });
    return ok(res, posts);
  } catch (e) {
    return internal(res, e, 'Erro ao listar posts');
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: Comment, as: 'comments' }],
    });
    assert(post, 404, ERRORS.POSTS.NOT_FOUND);
    return ok(res, post);
  } catch (e) {
    if (e instanceof HttpError) return notFound(res, e.message);
    return internal(res, e, 'Erro ao buscar post');
  }
}

export async function updatePost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id);
    assert(post, 404, ERRORS.POSTS.NOT_FOUND);
    ensureOwner(post.authorId, req.user.id, ERRORS.POSTS.FORBIDDEN_AUTHOR);

    const updates = pickDefined(req.body, ['title', 'content']);
    assert(Object.keys(updates).length > 0, 400, ERRORS.POSTS.NOTHING_TO_UPDATE);

    await post.update(updates);
    return ok(res, post);
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 404) return notFound(res, e.message);
      if (e.status === 403) return forbidden(res, e.message);
      return badRequest(res, e.message);
    }
    return internal(res, e, 'Erro ao atualizar post');
  }
}

export async function deletePost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id);
    assert(post, 404, ERRORS.POSTS.NOT_FOUND);
    ensureOwner(post.authorId, req.user.id, ERRORS.POSTS.FORBIDDEN_AUTHOR);

    await post.destroy();
    return noContent(res);
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 404) return notFound(res, e.message);
      if (e.status === 403) return forbidden(res, e.message);
      return badRequest(res, e.message);
    }
    return internal(res, e, 'Erro ao deletar post');
  }
}
