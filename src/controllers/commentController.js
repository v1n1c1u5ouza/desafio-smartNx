import { ERRORS } from '../constants/errors.js';
import { Comment, Post } from '../models/index.js';
import { assert, ensureOwner, pickDefined, HttpError } from '../utils/guards.js';
import { ok, created, noContent, badRequest, forbidden, notFound, internal } from '../utils/https.js';

export async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    assert(content, 400, ERRORS.COMMENTS.REQUIRED_FIELDS);

    const post = await Post.findByPk(postId);
    assert(post, 404, ERRORS.COMMENTS.POST_NOT_FOUND);

    const comment = await Comment.create({
      postId: post.id,
      authorId: String(req.user.id),
      authorUsername: req.user.username,
      content,
    });

    return created(res, comment);
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 404) return notFound(res, e.message);
      return badRequest(res, e.message);
    }
    return internal(res, e, 'Erro ao adicionar comentário');
  }
}

export async function updateComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findOne({ where: { id: commentId, postId } });
    assert(comment, 404, ERRORS.COMMENTS.NOT_FOUND);

    ensureOwner(comment.authorId, req.user.id, ERRORS.COMMENTS.FORBIDDEN_AUTHOR);

    const updates = pickDefined(req.body, ['content']);
    assert(Object.keys(updates).length > 0, 400, ERRORS.COMMENTS.NOTHING_TO_UPDATE);

    await comment.update(updates);
    return ok(res, comment);
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 404) return notFound(res, e.message);
      if (e.status === 403) return forbidden(res, e.message);
      return badRequest(res, e.message);
    }
    return internal(res, e, 'Erro ao atualizar comentário');
  }
}

export async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findOne({ where: { id: commentId, postId } });
    assert(comment, 404, ERRORS.COMMENTS.NOT_FOUND);

    ensureOwner(comment.authorId, req.user.id, ERRORS.COMMENTS.FORBIDDEN_AUTHOR);

    await comment.destroy();
    return noContent(res);
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 404) return notFound(res, e.message);
      if (e.status === 403) return forbidden(res, e.message);
      return badRequest(res, e.message);
    }
    return internal(res, e, 'Erro ao apagar comentário');
  }
}