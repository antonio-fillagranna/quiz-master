import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from "@google/generative-ai";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class PartidaService {
  async buscarHistoricoUsuario(id_usuario: string) {
    const partidas = await prisma.partida.findMany({
      where: { id_usuario },
      include: {
        rodadas: {
          include: {
            pergunta: {
              include: { respostas: { include: { resposta: true } } }
            }
          }
        }
      },
      orderBy: { data_hora: 'desc' }
    });

    return partidas.map(p => ({
      ...p,
      rodadas: p.rodadas.map(r => {
        const respEscolhida = r.pergunta.respostas.find((res: any) => res.id_resposta === r.id_resposta_escolhida);
        const respCorreta = r.pergunta.respostas.find((res: any) => res.correta);

        return {
          ...r,
          nome_pergunta: r.pergunta.nome,
          nome_resposta_usuario: respEscolhida?.resposta?.nome || "Não encontrada",
          nome_resposta_correta: respCorreta?.resposta?.nome || ""
        };
      })
    }));
  }

  async obterExplicacaoIA(pergunta: string, correta: string, usuario: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Explique de forma didática e resumida em um parágrafo por que a resposta para "${pergunta}" é "${correta}" e por que "${usuario}" está incorreta.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}