import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function Lobby() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    api.get('/ranking')
      .then(res => {
        const ativos = res.data
          .filter((item: any) => !item.deletedAt)
          .sort((a: any, b: any) => b.pontuacao - a.pontuacao);

        setRanking(ativos);
      })
      .catch(err => console.error("Erro ao carregar ranking", err));
  }, []);

  return (
    <div className="min-h-screen pt-24 p-8 bg-app-bg text-app-fg flex flex-col items-center transition-colors">
      <div className="grid grid-cols-1 gap-8 w-full max-w-4xl">
        <div className="bg-app-card p-8 rounded-2xl border border-app-border shadow-xl">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors text-left">
            Ranking Geral
          </h1>
          <p className="text-slate-500 text-xs uppercase font-black tracking-widest mt-2 mb-6 text-left">
            Top Jogadores da Temporada
          </p>

          <ul className="space-y-4 mb-8">
            {ranking.length > 0 ? (
              ranking.map((item: any, idx) => (
                <li
                  key={item.id || idx}
                  className="flex justify-between items-center border-b border-app-border/50 pb-3 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Medalhas para o Top 3 */}
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-yellow-500 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                        idx === 1 ? 'bg-slate-300 text-slate-700' :
                          idx === 2 ? 'bg-orange-400 text-orange-950' :
                            'bg-app-bg text-slate-500 border border-app-border'
                      }`}>
                      {idx + 1}º
                    </span>

                    <span className="text-app-fg dark:text-slate-100 font-bold text-sm md:text-base">
                      {item.nome || "Anônimo"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-indigo-500 dark:text-indigo-400 font-black text-lg">
                      {item.pontuacao}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">pts</span>
                  </div>
                </li>
              ))
            ) : (
              <div className="py-10 text-center bg-app-bg/50 rounded-xl border border-dashed border-app-border">
                <p className="text-slate-500 text-sm italic font-medium">Nenhum dado no ranking ainda.</p>
              </div>
            )}
          </ul>

          <button
            onClick={() => navigate('/quiz')}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            🚀 INICIAR DESAFIO
          </button>
        </div>
      </div>
    </div>
  );
}