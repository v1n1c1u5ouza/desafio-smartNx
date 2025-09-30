import pick from '../utils/pick.js';
import { ERRORS } from '../constants/errors.js';
import { Post, Comment } from '../models/index.js';
import { ok, created, noContent, badRequest, forbidden, notFound, internal } from '../utils/https.js';

export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) return badRequest(res, ERRORS.POSTS.REQUIRED_FIELDS);

    const post = await Post.create({
      title,
      content,
      authorId: String(req.user.id),
      authorUsername: req.user.username,
    });

    return created(res, post)

  } catch (e) {
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
    
    if (!post) return notFound(res, ERRORS.POSTS.NOT_FOUND);

    return ok(res, post);

  } catch (e) {
    return internal(res, e, 'Erro ao buscar post');
  }
}

export async function updatePost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) return notFound(res, ERRORS.POSTS.NOT_FOUND);

    if (post.authorId !== String(req.user.id)) {
      return forbidden(res, ERRORS.POSTS.FORBIDDEN_AUTHOR);
    }

    const updates = pick(req.body, ['title', 'content']);

    if (Object.keys(updates).length === 0) {
      return badRequest(res, ERRORS.POSTS.NOTHING_TO_UPDATE);
    }

    await post.update(updates);
    return ok(res, post);

  } catch (e) {
    return internal(res, e, 'Erro ao atualizar post');
  }
}

export async function deletePost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) return notFound(res, ERRORS.POSTS.NOT_FOUND);

    if (post.authorId !== String(req.user.id)) {
      return forbidden(res, ERRORS.POSTS.FORBIDDEN_AUTHOR);
    }

    await post.destroy();
    return noContent(res);

  } catch (e) {
    return internal(res, e, 'Erro ao deletar post');
  }
}
