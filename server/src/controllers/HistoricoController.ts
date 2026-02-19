import { Request, Response } from 'express';
import { PartidaService } from '../services/PartidaService';

const partidaService = new PartidaService();

export class HistoricoController {
  async listPartidas(req: Request, res: Response) {
    const { userId } = req as any;
    try {
      const historico = await partidaService.buscarHistoricoUsuario(userId);
      return res.json(historico);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao processar histórico" });
    }
  }

  async explicarErro(req: Request, res: Response) {
    const { pergunta, respostaCorreta, respostaUsuario } = req.body;
    try {
      const explicacao = await partidaService.obterExplicacaoIA(pergunta, respostaCorreta, respostaUsuario);
      return res.json({ explicacao });
    } catch (error) {
      return res.status(500).json({ error: "Falha na comunicação com a IA" });
    }
  }
}