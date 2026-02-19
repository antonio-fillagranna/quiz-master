import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function Quiz() {
  const navigate = useNavigate();

  // Estados de Configuração
  const [configurado, setConfigurado] = useState(false);
  const [modoTimer, setModoTimer] = useState<'pergunta' | 'jogo'>('pergunta');
  const [qtdDesejada, setQtdDesejada] = useState(10);
  const [tempoConfig, setTempoConfig] = useState(15); // Segundos ou Minutos

  // Estados do Jogo
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [tempoMaximo, setTempoMaximo] = useState(0); // Para o cálculo da barra
  const [pontos, setPontos] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [idPartida, setIdPartida] = useState<string | null>(null);
  const [respondendo, setRespondendo] = useState(false);


  async function iniciarJogo() {
    try {
      const resPartida = await api.post('/partidas');
      const partidaId = resPartida.data.id;
      setIdPartida(partidaId);

      const resPerguntas = await api.get('/perguntas');

      let lista = resPerguntas.data.filter((p: any) => !p.deletedAt);

      lista = lista.map((p: any) => ({
        ...p,
        respostas: p.respostas
          .filter((item: any) => item.resposta && !item.resposta.deletedAt)
          .sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0))
      }));

      lista = lista.sort(() => Math.random() - 0.5).slice(0, qtdDesejada);

      setPerguntas(lista);

      const tempoEmSegundos = modoTimer === 'pergunta' ? tempoConfig : tempoConfig * 60;
      setTempoRestante(tempoEmSegundos);
      setTempoMaximo(tempoEmSegundos);
      setConfigurado(true);
    } catch (err) {
      console.error("Erro detalhado:", err);
      alert("Erro ao iniciar partida no servidor.");
    }
  }

  async function handleResposta(idPergunta: string, idRespostaEscolhida: string) {
    if (respondendo) return;

    setRespondendo(true);

    try {
      const payload = {
        id_partida: idPartida,
        id_pergunta: idPergunta,
        id_resposta_escolhida: idRespostaEscolhida
      };

      const res = await api.post('/partidas/responder', payload);

      if (res.data.rodada.acertou) {
        setPontos(p => p + 1);
      }

      // Pequeno delay para o usuário sentir a transição
      setTimeout(() => {
        proximaPergunta();
        setRespondendo(false);
      }, 500);

    } catch (err) {
      console.error("Erro ao salvar resposta");
      setRespondendo(false);
      proximaPergunta();
    }
  }

  useEffect(() => {
    if (!configurado || finalizado || perguntas.length === 0) return;

    if (tempoRestante <= 0) {
      if (modoTimer === 'pergunta') proximaPergunta();
      else setFinalizado(true);
      return;
    }

    const timer = setInterval(() => setTempoRestante(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [tempoRestante, configurado, finalizado]);

  function proximaPergunta() {
    if (indiceAtual + 1 < perguntas.length) {
      setIndiceAtual(prev => prev + 1);
      if (modoTimer === 'pergunta') {
        const t = tempoConfig;
        setTempoRestante(t);
        setTempoMaximo(t);
      }
    } else {
      setFinalizado(true);
    }
  }

  // Cor da Barra muda conforme o tempo restante 
  const getBarColor = () => {
    const pct = (tempoRestante / tempoMaximo) * 100;
    if (pct > 50) return 'bg-emerald-500';
    if (pct > 20) return 'bg-yellow-500';
    return 'bg-red-500 animate-pulse';
  };

  if (!configurado) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-6 text-app-fg text-left">
        <div className="bg-app-bg p-8 rounded-3xl border border-app-border w-full max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600 dark:text-indigo-400 transition-colors">Configurar Jogo</h2>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quantidade de Questões</label>
              <input
                type="number"
                value={qtdDesejada}
                onChange={e => setQtdDesejada(Number(e.target.value))}
                className="w-full bg-app-card p-4 rounded-xl border border-app-border mt-2 outline-none focus:border-indigo-500 text-xl font-bold transition-all"
                placeholder="Ex: 10"
              />
            </div>

            <div className="border-t border-app-border pt-6">
              <label className="text-xs font-bold text-slate-500 uppercase">Modo de Tempo</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => { setModoTimer('pergunta'); setTempoConfig(15) }} className={`p-3 rounded-xl border transition-all ${modoTimer === 'pergunta' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-app-card border-app-border text-slate-400'}`}>Por Pergunta</button>
                <button onClick={() => { setModoTimer('jogo'); setTempoConfig(2) }} className={`p-3 rounded-xl border transition-all ${modoTimer === 'jogo' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-app-card border-app-border text-slate-400'}`}>Por Partida</button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">{modoTimer === 'pergunta' ? 'Segundos por pergunta' : 'Minutos de partida'}</label>
              <input
                type="number"
                value={tempoConfig}
                onChange={e => setTempoConfig(Number(e.target.value))}
                className="w-full bg-app-card p-3 rounded-xl border border-app-border mt-2 outline-none focus:border-indigo-500"
              />
            </div>

            <button onClick={iniciarJogo} className="w-full bg-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 mt-4 uppercase tracking-widest">
              Iniciar Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finalizado) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-6 text-app-fg">
        <div className="bg-app-bg p-10 rounded-3xl border border-app-border w-full max-w-sm text-center">
          <h2 className="text-3xl font-bold mb-4 text-indigo-600 dark:text-indigo-400 transition-colors">Fim de Jogo!</h2>
          <div className="bg-app-bg p-6 rounded-2xl border border-app-border mb-8">
            <p className="text-5xl font-black text-indigo-400">{pontos} / {perguntas.length}</p>
            <p className="text-slate-500 text-xs font-bold mt-2 uppercase">Pontuação Final</p>
          </div>
          <button onClick={() => navigate('/lobby')} className="w-full bg-app-card py-4 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">Voltar ao Lobby</button>
        </div>
      </div>
    );
  }

  const pergunta = perguntas[indiceAtual];
  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-6 text-app-fg">
      <div className="w-full max-w-2xl">

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {perguntas.map((_, index) => (
            <div
              key={index}
              className={`h-3 w-3 rounded-full transition-all duration-500 ${index === indiceAtual
                  ? 'bg-indigo-400 ring-4 ring-indigo-400/20 scale-125'
                  : index < indiceAtual
                    ? 'bg-indigo-600'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
            />
          ))}
        </div>

        <div className="w-full bg-app-card h-2 rounded-full mb-6 overflow-hidden border border-app-border">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${getBarColor()}`}
            style={{ width: `${(tempoRestante / tempoMaximo) * 100}%` }}
          />
        </div>

        <div className="flex justify-between mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <span>PERGUNTA {indiceAtual + 1} DE {perguntas.length}</span>
          <span className="font-mono">{tempoRestante}S</span>
        </div>

        <div className="bg-app-bg p-8 rounded-3xl border border-app-border shadow-2xl text-left relative overflow-hidden">

          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />

          <h2 className="text-2xl font-bold mb-8 leading-tight text-indigo-600 dark:text-indigo-400 transition-colors">{pergunta?.nome}</h2>
          <div className="grid gap-3 text-indigo-600 dark:text-indigo-400 transition-colors">
            {pergunta?.respostas?.map((item: any) => (
              <button
                key={item.id}
                disabled={respondendo} // Desabilita o botão durante o processamento da resposta evitando duplo envio
                onClick={() => handleResposta(pergunta.id, item.id_resposta)}
                className="w-full p-4 bg-app-card hover:bg-indigo-600/10 hover:border-indigo-500/50 rounded-xl border border-app-border text-left transition-all group flex justify-between items-center"
              >
                <span className="group-hover:translate-x-1 transition-transform">{item.resposta?.nome || item.nome}</span>
                <div className="h-4 w-4 rounded-full border-2 border-slate-600 group-hover:border-indigo-500 transition-colors" />
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}