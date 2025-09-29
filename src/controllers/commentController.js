import { Comment, Post } from "../models/index.js";

export async function addComment(req, res) {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    if(!content) res.status(400).json({ error: 'content é obrigatório'});

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });

    const comment = await Comment.create({
      postId: post.id,
      authorId: String(req.user.id),
      authorUsername: req.user.username,
      content
    });
    return res.status(201).json(comment)
    
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao adicioanar comentário', details: error.message });
  }
}

export async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOne({ where: { id: commentId, postId } });
    if (!comment) return res.status(404).json({ error: 'Comentario não encontrado' });

    if(comment.authorId !== String(req.user.id)) {
       return res.status(403).json({ error: 'Você não pe o autor desse comentário' });
    }

    await comment.destroy();
    return res.status(204).send();

  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar posts', details: error.message });
  }
}