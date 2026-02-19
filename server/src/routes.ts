import { Router } from 'express';
import { RespostaController } from './controllers/RespostaController';
import { PerguntaController } from './controllers/PerguntaController';
import { PartidaController } from './controllers/PartidaController';
import { AuthController } from './controllers/AuthController';
import { authMiddleware, authorize } from './middlewares/authMiddleware';
import { HistoricoController } from './controllers/HistoricoController';

const routes = Router();

const respostaController = new RespostaController();
const perguntaController = new PerguntaController();
const partidaController = new PartidaController();
const authController = new AuthController();
const historicoController = new HistoricoController();

// Rotas de Autenticação
routes.post('/register', (req, res) => authController.register(req, res));
routes.post('/login', (req, res) => authController.login(req, res));

// Rotas protegidas por autenticação
routes.use(authMiddleware);
routes.get('/admin/usuarios', authorize(['ADMIN']), (req, res) => authController.listAll(req, res));
routes.put('/usuarios/:id', (req, res) => authController.update(req, res));
routes.delete('/usuarios/:id', (req, res) => authController.delete(req, res));

// Endpoints de Respostas
routes.post('/respostas', authorize(['ADMIN']), (req, res) => respostaController.create(req, res));
routes.get('/respostas', (req, res) => respostaController.list(req, res));
routes.put('/respostas/:id', authorize(['ADMIN']), (req, res) => respostaController.update(req, res));
routes.delete('/respostas/:id', authorize(['ADMIN']), (req, res) => respostaController.delete(req, res));

// Endpoints de Perguntas (Many-to-Many)
routes.post('/perguntas', authorize(['ADMIN']), (req, res) => perguntaController.create(req, res));
routes.get('/perguntas', (req, res) => perguntaController.list(req, res));
routes.put('/perguntas/:id', authorize(['ADMIN']), (req, res) => perguntaController.update(req, res));
routes.delete('/perguntas/:id', authorize(['ADMIN']), (req, res) => perguntaController.delete(req, res));

// Rotas de Jogo
routes.post('/partidas', (req, res) => partidaController.create(req, res));
routes.post('/partidas/responder', (req, res) => partidaController.responder(req, res));
routes.get('/partidas/:id/resumo', (req, res) => partidaController.getResumo(req, res));
routes.get('/ranking', (req, res) => partidaController.getRanking(req, res));
routes.get('/quiz', authMiddleware, (req, res) => perguntaController.getQuiz(req, res));

// Histórico e explicação de erros com IA
routes.get('/historico', authMiddleware, historicoController.listPartidas);
routes.post('/ia/explicar', authMiddleware, historicoController.explicarErro);

export default routes;