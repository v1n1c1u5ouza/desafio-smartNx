import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

const routes = Router();

routes.get("/health", (_req, res) => res.json({ status: 'ok' }));
routes.post("/register", register);
routes.post("/login", login);

export default routes;