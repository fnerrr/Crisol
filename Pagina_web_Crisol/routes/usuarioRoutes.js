import express from 'express';
import { formularioLogin, autenticarUsuario } from '../controller/usuarioController.js';

const router = express.Router();

router.get('/login', formularioLogin);
router.post('/login', autenticarUsuario);

export default router

