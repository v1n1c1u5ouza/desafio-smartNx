import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { register, login } from '../controllers/authController.js';
import { addComment, deleteComment, updateComment } from '../controllers/commentController.js';
import { createPost, listPosts, getPost, updatePost, deletePost } from '../controllers/postController.js';

const routes = Router();

// Auth
routes.post("/login", login);
routes.post("/register", register);

// Posts
routes.use('/posts', auth)
routes.get('/posts', listPosts);
routes.get('/posts/:id', getPost);
routes.post('/posts', createPost);
routes.put('/posts/:id', updatePost);
routes.delete('/posts/:id', deletePost);

// Comments
routes.post('/posts/:postId/comments', addComment);
routes.put('/posts/:postId/comments/:commentId', updateComment)
routes.delete('/posts/:postId/comments/:commentId', deleteComment)

export default routes;