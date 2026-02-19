import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RespostaController {

  async create(req: Request, res: Response) {
    const { nome, perguntasIds } = req.body;

    try {
      const resposta = await prisma.$transaction(async (tx) => {
        const novaResposta = await tx.resposta.create({
          data: { nome }
        });
        if (perguntasIds && perguntasIds.length > 0) {
          for (const id_pergunta of perguntasIds) {
            const ultimaOrdem = await tx.pergunta_Resposta.count({ where: { id_pergunta } });

            await tx.pergunta_Resposta.create({
              data: {
                id_pergunta,
                id_resposta: novaResposta.id,
                ordem: ultimaOrdem + 1,
                correta: false
              }
            });
          }
        }
        return novaResposta;
      });

      return res.status(201).json(resposta);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao criar resposta com vínculos" });
    }
  }

  async list(req: Request, res: Response) {
    const respostas = await prisma.resposta.findMany({
      where: {
        deletedAt: null
      },
      include: {
        perguntas: {
          where: {
            pergunta: {
              deletedAt: null
            }
          }
        }
      }
    });

    return res.json(respostas);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, perguntasIds } = req.body;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.resposta.update({
          where: { id },
          data: { nome }
        });

        if (perguntasIds) {
          await tx.pergunta_Resposta.deleteMany({ where: { id_resposta: id } });
          for (const id_pergunta of perguntasIds) {
            const ultimaOrdem = await tx.pergunta_Resposta.count({ where: { id_pergunta } });

            await tx.pergunta_Resposta.create({
              data: {
                id_pergunta,
                id_resposta: id,
                ordem: ultimaOrdem + 1,
                correta: false
              }
            });
          }
        }
      });
      return res.json({ message: "Resposta atualizada e vinculada!" });
    } catch (error) {
      return res.status(400).json({ error: "Erro ao atualizar resposta" });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.resposta.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: "Erro ao remover resposta" });
    }
  }
}