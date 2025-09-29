import { Post, Comment } from "../models/index.js";

export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title e content são obrigatórios' });

    const post = await Post.create({ title, content, authorId: String(req.user.id), authorUsername: req.user.username, });

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar posts', details: error.message });
  }
}

export async function listPosts(_req, res) {
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Comment, as: 'comments' }]
    });

    return res.json(posts);

  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar posts', details: error.message });
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: Comment, as: 'comments' }],
    });

    if (!post) return res.status(400).json({ error: 'Post não encontrado' });

    return res.json(post);

  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar posts', details: error.message });
  }
}

export async function updatePost(req, res) {
  try {
    const { title, content } = req.body;
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(400).json({ error: 'Post não encontrado' });
    if (post.authorId !== String(req.user.id)) {
      return res.status(403).json({ error: 'Você não e o autor desse post' });
    }

    if (!title && !content) {
      return res.status(400).json({ error: 'Nada para atualizar' });
    }

    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();
    return res.json(post);

  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar posts', details: error.message });
  }
}

export async function deletePost(req, res) {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(400).json({ error: 'Post não encontrado' });

    if (post.authorId !== String(req.user.id)) {
      return res.status(403).json({ error: 'Você não e o autor desse post' });
    }

    await post.destroy();
    return res.status(204).send();
    
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar posts', details: error.message });
  }
}