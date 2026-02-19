import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PerguntaController {

  async create(req: Request, res: Response) {
    try {
      const { nome, ordem, respostas } = req.body;

      const novaPergunta = await prisma.pergunta.create({
        data: {
          nome,
          ordem,
          respostas: {
            create: respostas.map((resp: any) => ({
              id_resposta: resp.id_resposta,
              correta: resp.correta || false,
              ordem: resp.ordem
            }))
          }
        },
        include: { respostas: true }
      });

      return res.status(201).json(novaPergunta);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: "Erro ao criar pergunta com vínculos" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const perguntas = await prisma.pergunta.findMany({
        where: { deletedAt: null },
        include: {
          respostas: {
            include: { resposta: true }
          }
        }
      });
      return res.json(perguntas);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar perguntas" });
    }
  }
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, respostas } = req.body;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.pergunta.update({
          where: { id },
          data: { nome }
        });

        await tx.pergunta_Resposta.deleteMany({
          where: { id_pergunta: id }
        });

        const novasRelacoes = respostas.map((r: any) => ({
          id_pergunta: id,
          id_resposta: r.id_resposta,
          correta: r.correta,
          ordem: r.ordem
        }));

        await tx.pergunta_Resposta.createMany({
          data: novasRelacoes
        });
      });

      return res.json({ message: "Pergunta e alternativas atualizadas com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: "Erro ao sincronizar dados da pergunta" });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.pergunta.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: "Erro ao remover pergunta" });
    }
  }

  async getQuiz(req: Request, res: Response) {
    try {
      const perguntas = await prisma.pergunta.findMany({
        where: {
          deletedAt: null
        },
        include: {
          respostas: {
            where: {
              resposta: { deletedAt: null }
            },
            include: { resposta: true }
          }
        }
      });

      const perguntasEmbaralhadas = perguntas
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      return res.json(perguntasEmbaralhadas);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao carregar o desafio" });
    }
  }
}