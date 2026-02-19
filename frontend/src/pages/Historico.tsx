import { useState, useEffect } from 'react';
import api from '../services/api';

export function Historico() {
  const [partidas, setPartidas] = useState<any[]>([]);
  const [partidaDetalhe, setPartidaDetalhe] = useState<any>(null);
  const [iaExplicacao, setIaExplicacao] = useState("");
  const [loadingIA, setLoadingIA] = useState(false);

  useEffect(() => {
    api.get('/historico').then(res => setPartidas(res.data));
  }, []);

  async function pedirExplicacao(rodada: any) {
    setLoadingIA(true);
    setIaExplicacao("");
    try {
      const res = await api.post('/ia/explicar', {
        pergunta: rodada.nome_pergunta,
        respostaCorreta: rodada.nome_resposta_correta,
        respostaUsuario: rodada.nome_resposta_usuario
      });
      setIaExplicacao(res.data.explicacao);
    } catch (e) {
      setIaExplicacao("Erro de conexão com o servidor.");
    } finally {
      setLoadingIA(false);
    }
  }

  return (
    <div className="min-h-screen pt-24 p-8 bg-app-bg text-app-fg">
      <div className="min-h-screen pt-24 p-8 bg-app-bg text-app-fg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
            Meu Histórico
          </h1>
          <br />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partidas.map(p => {
              // Cálculo da porcentagem
              const totalRodadas = p.rodadas.length;
              const acertos = p.rodadas.filter((r: any) => r.acertou).length;
              const porcentagem = totalRodadas > 0 ? (acertos / totalRodadas) * 100 : 0;

              // Lógica de cores baseado nos resultados
              let corPorcentagem = "text-emerald-500";
              if (porcentagem <= 33) {
                corPorcentagem = "text-red-500";
              } else if (porcentagem <= 66) {
                corPorcentagem = "text-yellow-500";
              }

              return (
                <div
                  key={p.id}
                  onClick={() => setPartidaDetalhe(p)}
                  className="bg-app-card p-6 rounded-2xl border border-app-border hover:border-indigo-500 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase">
                      {new Date(p.data_hora).toLocaleDateString()} às {new Date(p.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {acertos} ACERTOS
                    </span>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
                      Partida #{p.id.substring(0, 8)}
                    </h3>

                    <div className="flex flex-col items-end">
                      <span className={`text-2xl font-black ${corPorcentagem}`}>
                        {Math.round(porcentagem)}%
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                        Aproveitamento
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Partida */}
      {partidaDetalhe && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
          <div className="bg-app-bg border border-app-border w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col text-app-fg transition-colors duration-300">

            {/* Header Fixo */}
            <div className="p-8 pb-4 flex justify-between items-center border-b border-app-border bg-app-bg">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                📊 Detalhes da Partida
              </h2>
              <button
                onClick={() => { setPartidaDetalhe(null); setIaExplicacao("") }}
                className="p-2 text-slate-500 hover:text-app-fg hover:bg-app-card rounded-full transition-all"
              >
                <span className="text-5xl">&times;</span>
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-4">
              {partidaDetalhe.rodadas.map((r: any) => (
                <div
                  key={r.id}
                  className={`p-5 rounded-2xl border transition-all ${r.acertou
                      ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                      : 'border-red-500/30 bg-red-500/5 dark:bg-red-500/10'
                    }`}
                >
                  <p className="font-bold mb-3 text-app-fg dark:text-slate-100">{r.pergunta.nome}</p>

                  <div className="flex justify-between items-center gap-4">
                    <div className="text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Sua resposta: </span>
                      <span className={`font-bold ${r.acertou ? 'text-emerald-500' : 'text-red-500'}`}>
                        {r.nome_resposta_usuario}
                      </span>
                    </div>

                    {!r.acertou && (
                      <button
                        onClick={() => pedirExplicacao(r)}
                        className="shrink-0 text-[10px] bg-indigo-600 text-white px-4 py-2 rounded-full font-bold uppercase hover:bg-indigo-700 shadow-md active:scale-95 transition-all flex items-center gap-2"
                      >
                        💡 Por que errei?
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Box da Explicação da IA */}
              {(loadingIA || iaExplicacao) && (
                <div className="mt-4 p-6 bg-app-card border border-indigo-500/30 rounded-2xl animate-in slide-in-from-bottom-2 duration-500 shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
                      Explicação da IA Gemini
                    </h4>
                  </div>

                  {loadingIA ? (
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                      <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      Analisando seu erro e consultando o oráculo...
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-app-fg dark:text-slate-300 italic">
                      "{iaExplicacao}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-app-card/50 border-t border-app-border text-center text-[10px] text-slate-500 uppercase tracking-widest">
              QuizMaster AI • Histórico de Desempenho
            </div>
          </div>
        </div>
      )}
    </div>
  );
}