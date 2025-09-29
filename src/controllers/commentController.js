import { Comment, Post } from '../models/index.js';
import pick from '../utils/pick.js';

export async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'content é obrigatório' });

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });

    const comment = await Comment.create({
      postId: post.id,
      authorId: String(req.user.id),
      content,
      authorUsername: req.user.username,
    });

    return res.status(201).json(comment);

  } catch (e) {
    return res.status(500).json({ error: 'Erro ao adicionar comentário', details: e.message });
  }
}

export async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOne({ where: { id: commentId, postId } });
    if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

    if (comment.authorId !== String(req.user.id)) {
      return res.status(403).json({ error: 'Você não é o autor deste comentário' });
    }

    await comment.destroy();
    return res.status(204).send();

  } catch (e) {
    return res.status(500).json({ error: 'Erro ao apagar comentário', details: e.message });
  }
}

export async function updateComment(req, res) {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOne({ where: { id: commentId, postId } });
    if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

    if (comment.authorId !== String(req.user.id)) {
      return res.status(403).json({ error: 'Você não é o autor deste comentário' });
    }

    const updates = pick(req.body, ['content']);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nada para atualizar' });
    }

    await comment.update(updates);
    return res.json(comment);
    
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao atualizar comentário', details: e.message });
  }
}
