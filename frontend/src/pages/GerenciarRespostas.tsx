import { useState, useEffect } from 'react';
import api from '../services/api';

export function GerenciarRespostas() {
  const [respostas, setRespostas] = useState<any[]>([]);
  const [perguntasDisponiveis, setPerguntasDisponiveis] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [perguntasSelecionadas, setPerguntasSelecionadas] = useState<string[]>([]);

  const [filtroPergunta, setFiltroPergunta] = useState('');

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    const [resR, resP] = await Promise.all([api.get('/respostas'), api.get('/perguntas')]);
    setRespostas(resR.data.filter((r: any) => !r.deletedAt));
    setPerguntasDisponiveis(resP.data);
  }

  const abrirEdicao = (resposta: any) => {
    setEditandoId(resposta.id);
    setNome(resposta.nome);
    const ids = resposta.perguntas?.map((p: any) => p.id_pergunta) || [];
    setPerguntasSelecionadas(ids);
    setModalAberto(true);
  };

  async function handleSalvar() {
    const payload = { nome, perguntasIds: perguntasSelecionadas };
    try {
      if (editandoId) await api.put(`/respostas/${editandoId}`, payload);
      else await api.post('/respostas', payload);
      resetForm();
      carregarDados();
    } catch (error) { alert("Erro ao salvar"); }
  }

  async function handleExcluir() {
    if (!editandoId) return;
    if (!window.confirm("Deseja remover esta resposta da biblioteca?")) return;

    try {
      await api.delete(`/respostas/${editandoId}`);
      resetForm();
      carregarDados();
    } catch (error) {
      alert("Erro ao excluir resposta.");
    }
  }

  const resetForm = () => {
    setNome('');
    setPerguntasSelecionadas([]);
    setEditandoId(null);
    setModalAberto(false);
  };

  return (
    <div className="min-h-screen pt-24 p-8 bg-app-bg text-app-fg">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">Biblioteca de Respostas</h1><br />
          <button onClick={() => setModalAberto(true)} className="bg-emerald-600 px-6 py-2 rounded-lg font-bold">
            + Nova Resposta
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {respostas.map(r => (
            <div key={r.id} onClick={() => abrirEdicao(r)} className="bg-app-bg p-4 rounded-xl border border-app-border hover:border-emerald-500 cursor-pointer transition-all text-left">
              <p className="font-medium mb-2 text-app-fg dark:text-slate-200">{r.nome}</p>
              <span className="text-[10px] bg-app-card px-2 py-1 rounded text-indigo-600 dark:text-indigo-400 transition-colors uppercase">
                Em {r.perguntas?.length || 0} perguntas
              </span>
            </div>
          ))}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 overflow-y-auto">
          <div className="bg-app-bg border border-app-border p-8 rounded-2xl w-full max-w-4xl my-auto shadow-2xl text-app-fg transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-6 text-emerald-500 dark:text-emerald-400 text-left">
              {editandoId ? '📝 Editar Resposta' : '🚀 Nova Resposta'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lado Esquerdo: Edição do Texto */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-left">
                  Texto da Alternativa
                </label>
                <textarea
                  className="w-full p-4 bg-app-card rounded-xl border border-app-border outline-none focus:border-emerald-500 text-app-fg dark:text-white placeholder:text-slate-500 transition-all font-medium h-32 resize-none"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Digite o texto da resposta..."
                  style={{ color: 'inherit' }}
                />

                <div className="bg-app-card p-4 rounded-xl border border-dashed border-app-border min-h-[200px]">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-left font-bold uppercase">
                    Informações da Resposta:
                  </p>
                  <div className="p-4 bg-app-bg rounded-lg border border-app-border shadow-sm text-left">
                    <span className="text-xs text-slate-500 dark:text-slate-300">
                      Esta resposta pode ser vinculada a múltiplas perguntas ao lado.
                      A marcação de "Correta" é feita individualmente dentro de cada pergunta.
                    </span>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Vínculo com Perguntas (Banco) */}
              <div className="bg-app-card p-4 rounded-xl border border-app-border h-[400px] flex flex-col">
                <div className="mb-3">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 text-left uppercase">
                    Vincular às Perguntas Disponíveis
                  </p>
                  <input
                    type="text"
                    placeholder="Pesquisar pergunta..."
                    value={filtroPergunta}
                    onChange={(e) => setFiltroPergunta(e.target.value)}
                    className="w-full p-2 bg-app-bg rounded-lg border border-app-border text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="grid gap-2 overflow-y-auto pr-2 custom-scrollbar">
                  {perguntasDisponiveis
                    .filter(p => p.nome.toLowerCase().includes(filtroPergunta.toLowerCase()))
                    .map(p => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 p-3 bg-app-bg hover:bg-emerald-600/10 rounded-lg border border-app-border cursor-pointer transition-all group shadow-sm"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          checked={perguntasSelecionadas.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) setPerguntasSelecionadas([...perguntasSelecionadas, p.id]);
                            else setPerguntasSelecionadas(perguntasSelecionadas.filter(id => id !== p.id));
                          }}
                        />
                        <span className="text-xs text-left truncate text-app-fg dark:text-slate-200 font-medium group-hover:text-emerald-500 transition-colors">
                          {p.nome}
                        </span>
                      </label>
                    ))}

                  {/* Feedback de lista vazia ou não encontrada */}
                  {perguntasDisponiveis.filter(p => p.nome.toLowerCase().includes(filtroPergunta.toLowerCase())).length === 0 && (
                    <p className="text-[10px] text-slate-500 italic text-center py-4">Nenhuma pergunta encontrada.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-app-border">
              <div>
                {editandoId && (
                  <button
                    onClick={handleExcluir}
                    className="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm font-bold border border-transparent hover:border-red-500/20"
                  >
                    Excluir Resposta
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetForm}
                  className="text-slate-500 hover:text-app-fg font-medium transition-colors px-4 py-2"
                >
                  Descartar
                </button>
                <button
                  onClick={handleSalvar}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  {editandoId ? 'Atualizar Resposta' : 'Criar Resposta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}