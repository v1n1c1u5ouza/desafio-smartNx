import { Post, Comment } from '../models/index.js';
import pick from '../utils/pick.js';

export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title e content são obrigatórios' });

    const post = await Post.create({
      title,
      content,
      authorId: String(req.user.id),
      authorUsername: req.user.username,
    });

    return res.status(201).json({
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      authorUsername: post.authorUsername,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });

  } catch (e) {
    return res.status(500).json({ error: 'Erro ao criar post', details: e.message });
  }
}

export async function listPosts(_req, res) {
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Comment, as: 'comments' }],
    });

    return res.json(posts);

  } catch (e) {
    return res.status(500).json({ error: 'Erro ao listar posts', details: e.message });
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: Comment, as: 'comments' }],
    });
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });
    
    return res.json(post);

  } catch (e) {
    return res.status(500).json({ error: 'Erro ao buscar post', details: e.message });
  }
}

export async function updatePost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });
    if (post.authorId !== String(req.user.id)) {
      return res.status(403).json({ error: 'Você não é o autor deste post' });
    }

    const updates = pick(req.body, ['title', 'content']);
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nada para atualizar' });
    }

    await post.update(updates);
    return res.json(post);

  } catch (e) {
    return res.status(500).json({ error: 'Erro ao atualizar post', details: e.message });
  }
}

export async function deletePost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post não encontrado' });
    if (post.authorId !== String(req.user.id)) {
      return res.status(403).json({ error: 'Você não é o autor deste post' });
    }

    await post.destroy();
    return res.status(204).send();

  } catch (e) {
    return res.status(500).json({ error: 'Erro ao deletar post', details: e.message });
  }
}
