import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PartidaController {
  async create(req: Request, res: Response) {
    try {
      const id_usuario = req.userId;

      const novaPartida = await prisma.partida.create({
        data: {
          id_usuario,
          data_hora: new Date(),
        }
      });

      return res.status(201).json(novaPartida);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao iniciar partida" });
    }
  }

  async responder(req: Request, res: Response) {
    try {
      const { id_partida, id_pergunta, id_resposta_escolhida } = req.body;

      const respostaCorretaRelacao = await prisma.pergunta_Resposta.findFirst({
        where: {
          id_pergunta: id_pergunta,
          correta: true
        }
      });

      if (!respostaCorretaRelacao) {
        return res.status(404).json({ error: "Resposta correta não configurada para esta pergunta." });
      }

      const acertou = id_resposta_escolhida === respostaCorretaRelacao.id_resposta;

      const rodada = await prisma.rodada_Partida.create({
        data: {
          id_partida: id_partida,
          id_pergunta: id_pergunta,
          id_resposta_correta: respostaCorretaRelacao.id_resposta,
          id_resposta_escolhida: id_resposta_escolhida,
          acertou: acertou
        }
      });

      return res.json({
        resultado: acertou ? "Acertou!" : "Errou!",
        rodada
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: "Erro ao registrar rodada." });
    }
  }
  async getResumo(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const resumo = await prisma.partida.findUnique({
        where: { id },
        include: {
          _count: {
            select: { rodadas: true }
          },
          rodadas: {
            where: { acertou: true }
          },
          usuario: { select: { nome: true } }
        }
      });

      if (!resumo) return res.status(404).json({ error: "Partida não encontrada" });

      return res.json({
        jogador: resumo.usuario.nome,
        total_respondido: resumo._count.rodadas,
        acertos: resumo.rodadas.length,
        aproveitamento: resumo._count.rodadas > 0
          ? `${((resumo.rodadas.length / resumo._count.rodadas) * 100).toFixed(0)}%`
          : "0%"
      });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao gerar resumo" });
    }
  }
  async getRanking(req: Request, res: Response) {
    try {
      const usuarios = await prisma.usuario.findMany({
        where: {
          deletedAt: null
        },
        include: {
          partidas: {
            include: {
              rodadas: {
                where: { acertou: true }
              }
            }
          }
        }
      });

      const listaRanking = usuarios.map(user => {
        const totalAcertos = user.partidas.reduce((acc, partida) => {
          return acc + partida.rodadas.length;
        }, 0);

        return {
          id: user.id,
          nome: user.nome,
          pontuacao: totalAcertos,
          deletedAt: user.deletedAt
        };
      });

      const rankingOrdenado = listaRanking
        .sort((a, b) => b.pontuacao - a.pontuacao)
        .slice(0, 10);

      return res.json(rankingOrdenado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao gerar ranking" });
    }
  }
}