import { useState, useEffect } from 'react';
import api from '../services/api';

export function GerenciarPerguntas() {
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [respostasDisponiveis, setRespostasDisponiveis] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [selecionadas, setSelecionadas] = useState<any[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [filtroResposta, setFiltroResposta] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [resP, resR] = await Promise.all([
        api.get('/perguntas'),
        api.get('/respostas')
      ]);
      setPerguntas(resP.data);
      setRespostasDisponiveis(resR.data.filter((r: any) => !r.deletedAt));
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  }

  const abrirEdicao = (pergunta: any) => {
    setEditandoId(pergunta.id);
    setNome(pergunta.nome);

    const formatadas = (pergunta.respostas || [])
      .filter((item: any) => item.resposta && !item.resposta.deletedAt)
      .map((item: any) => ({
        id: item.resposta.id,
        nome: item.resposta.nome,
        isCorreta: item.correta,
        ordem: item.ordem
      }))
      .sort((a: any, b: any) => a.ordem - b.ordem);

    setSelecionadas(formatadas);
    setModalAberto(true);
  };

  const resetForm = () => {
    setNome('');
    setSelecionadas([]);
    setEditandoId(null);
    setModalAberto(false);
  };

  const onDragStart = (index: number) => setDraggedIndex(index);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (index: number) => {
    if (draggedIndex === null) return;
    const novoArray = [...selecionadas];
    const itemArrastado = novoArray[draggedIndex];
    novoArray.splice(draggedIndex, 1);
    novoArray.splice(index, 0, itemArrastado);
    setSelecionadas(novoArray);
    setDraggedIndex(null);
  };

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || selecionadas.length === 0) return alert("Preencha o nome e selecione respostas!");

    const payload = {
      nome: nome,
      ordem: 1,
      respostas: selecionadas.map((r, idx) => ({
        id_resposta: r.id_resposta || r.id,
        correta: r.isCorreta || false,
        ordem: idx + 1
      }))
    };

    try {
      if (editandoId) {
        await api.put(`/perguntas/${editandoId}`, payload);
      } else {
        await api.post('/perguntas', payload);
      }
      resetForm();
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar pergunta. Verifique se todos os campos estão preenchidos.");
    }
  }

  async function handleExcluir() {
    if (!editandoId || !window.confirm("Tem certeza que deseja excluir esta pergunta?")) return;
    try {
      await api.delete(`/perguntas/${editandoId}`);
      resetForm();
      carregarDados();
    } catch (error) {
      alert("Erro ao excluir a pergunta.");
    }
  }


  return (
    <div className="min-h-screen pt-24 p-8 bg-app-bg text-app-fg transition-colors">
      <div className="max-w-5xl mx-auto mb-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Gerenciar Perguntas</h1>
          <button onClick={() => setModalAberto(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all">
            + Nova Pergunta
          </button>
        </div>

        <div className="grid gap-4">
          {perguntas.filter(p => !p.deletedAt).map(p => (
            <div key={p.id} className="bg-app-card p-5 rounded-xl border border-app-border flex justify-between items-center group shadow-sm hover:border-indigo-500/50 transition-all">
              <div className="text-left">
                <span className="font-bold block text-app-fg dark:text-slate-100">{p.nome}</span>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  {p.respostas?.filter((item: any) => item.resposta && !item.resposta.deletedAt).length || 0} Alternativas
                </span>
              </div>
              <button
                onClick={() => abrirEdicao(p)}
                className="bg-app-bg hover:bg-indigo-600 hover:text-white p-2 px-6 rounded-lg text-xs font-bold transition-all border border-app-border text-indigo-500 group-hover:border-indigo-500"
              >
                EDITAR
              </button>
            </div>
          ))}
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 overflow-y-auto">
          <div className="bg-app-bg border border-app-border p-8 rounded-2xl w-full max-w-4xl my-auto shadow-2xl text-app-fg">
            <h2 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400 text-left transition-colors">
              {editandoId ? '📝 Editar Pergunta' : '🚀 Nova Pergunta'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase text-left tracking-wider text">
                  Enunciado da Pergunta
                </label>
                <input
                  className="w-full p-4 bg-app-card rounded-xl border border-app-border outline-none focus:border-indigo-500 transition-all font-medium"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Qual a capital da França?"
                />

                <div className="bg-app-card p-4 rounded-xl border border-dashed border-app-border min-h-[300px]">
                  <p className="text-[10px] text-slate-500 mb-4 text-left font-black uppercase tracking-widest">
                    Ordem das Alternativas (Arraste para ordenar):
                  </p>
                  <div className="space-y-2">
                    {selecionadas.map((res, idx) => (
                      <div
                        key={res.id || idx}
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={onDragOver}
                        onDrop={() => onDrop(idx)}
                        className={`flex items-center gap-3 bg-app-bg p-3 rounded-lg border cursor-move transition-all ${draggedIndex === idx ? 'opacity-20' : 'border-app-border hover:border-indigo-500'
                          }`}
                      >
                        <span className="text-indigo-500 font-black w-6 text-xs">{idx + 1}º</span>
                        <span className="flex-1 text-left truncate text-sm font-medium text-app-fg dark:text-slate-100">{res.nome}</span>

                        <div className="flex items-center gap-2 px-2 border-l border-app-border">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                            checked={res.isCorreta}
                            onChange={() => {
                              const n = [...selecionadas];
                              n[idx].isCorreta = !n[idx].isCorreta;
                              setSelecionadas(n);
                            }}
                          />
                        </div>
                        <button onClick={() => setSelecionadas(selecionadas.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-500/10 p-1 px-2 rounded font-bold">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-app-card p-4 rounded-xl border border-app-border h-[450px] flex flex-col">
                <div className="mb-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-left">
                    Banco de Respostas
                  </p>
                  <input
                    type="text"
                    placeholder="Pesquisar resposta..."
                    value={filtroResposta}
                    onChange={(e) => setFiltroResposta(e.target.value)}
                    className="w-full p-2 bg-app-bg rounded-lg border border-app-border text-xs outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid gap-2 overflow-y-auto pr-2 custom-scrollbar">
                  {respostasDisponiveis
                    .filter(res => res.nome.toLowerCase().includes(filtroResposta.toLowerCase()))
                    .map(res => (
                      <button
                        key={res.id}
                        onClick={() => {
                          setSelecionadas([...selecionadas, { ...res, isCorreta: false }]);
                          setFiltroResposta('');
                        }}
                        disabled={selecionadas.some(s => s.id === res.id)}
                        className="p-3 bg-app-bg hover:border-indigo-500 rounded-lg text-left text-xs border border-app-border disabled:opacity-30 transition-all flex justify-between items-center group font-medium"
                      >
                        <span className="truncate pr-2 text-slate-500">{res.nome}</span>
                        <span className="text-indigo-500 font-bold">+</span>
                      </button>
                    ))}

                  {respostasDisponiveis.filter(res => res.nome.toLowerCase().includes(filtroResposta.toLowerCase())).length === 0 && (
                    <p className="text-[10px] text-slate-500 italic text-center py-4">Nenhuma resposta encontrada.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-app-border">
              <button onClick={handleExcluir} className={`${!editandoId && 'invisible'} text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-xs font-black uppercase`}>
                Excluir Pergunta
              </button>
              <div className="flex gap-4">
                <button onClick={resetForm} className="text-slate-500 hover:text-app-fg font-bold text-xs uppercase px-4 py-2">Cancelar</button>
                <button onClick={handleSalvar} className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                  {editandoId ? 'Salvar Alterações' : 'Criar Pergunta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}