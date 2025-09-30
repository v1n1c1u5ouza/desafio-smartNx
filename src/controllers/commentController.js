import pick from '../utils/pick.js';
import { ERRORS } from '../constants/errors.js';
import { Comment, Post } from '../models/index.js';
import { ok, created, noContent, badRequest, forbidden, notFound, internal } from '../utils/https.js';


export async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) return badRequest(res, ERRORS.COMMENTS.REQUIRED_FIELDS);

    const post = await Post.findByPk(postId);

    if (!post) return notFound(res, ERRORS.COMMENTS.POST_NOT_FOUND);

    const comment = await Comment.create({
      postId: post.id,
      authorId: String(req.user.id),
      content,
      authorUsername: req.user.username,
    });

    return created(res, comment);

  } catch (e) {
    return internal(res, e, 'Erro ao adicionar comentário');
  }
}

export async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findOne({ where: { id: commentId, postId } });

    if (!comment) return notFound(res, ERRORS.COMMENTS.NOT_FOUND);

    if (comment.authorId !== String(req.user.id)) {
      return forbidden(res, ERRORS.COMMENTS.FORBIDDEN_AUTHOR);
    }

    await comment.destroy();
    return noContent(res);

  } catch (e) {
    return internal(res, e, 'Erro ao apagar comentário');
  }
}

export async function updateComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const comment = await Comment.findOne({ where: { id: commentId, postId } });

    if (!comment)  return notFound(res, ERRORS.COMMENTS.NOT_FOUND);

    if (comment.authorId !== String(req.user.id)) {
      return forbidden(res, ERRORS.COMMENTS.FORBIDDEN_AUTHOR);
    }

    const updates = pick(req.body, ['content']);

    if (Object.keys(updates).length === 0) {
      return badRequest(res, ERRORS.COMMENTS.NOTHING_TO_UPDATE);
    }

    await comment.update(updates);
    return ok(res, comment);
    
  } catch (e) {
    return internal(res, e, 'Erro ao atualizar comentário');
  }
}
