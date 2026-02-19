import { useState, useEffect } from 'react';
import api from '../services/api';

export function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoUser, setEditandoUser] = useState<any>(null);

  useEffect(() => { carregarDados(); }, []);

  async function carregarDados() {
    const res = await api.get('/admin/usuarios');
    setUsuarios(res.data);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.put(`/usuarios/${editandoUser.id}`, {
        nome: editandoUser.nome,
        role: editandoUser.role
      });
      setModalAberto(false);
      carregarDados();
    } catch (error) { alert("Erro ao atualizar usuário"); }
  }

  async function handleDeletar(id: string) {
    if (!window.confirm("Banir este usuário? ele não conseguirá mais logar.")) return;
    await api.delete(`/usuarios/${id}`);
    carregarDados();
  }

  return (
    <div className="min-h-screen pt-24 p-8 bg-app-bg text-app-fg">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">Gestão de Usuários</h1><br />

        <div className="bg-app-bg rounded-2xl border border-app-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-app-card text-slate-400 text-xs uppercase">
              <tr>
                <th className="p-4">Nome</th>
                <th className="p-4">E-mail</th>
                <th className="p-4">Cargo</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-app-card/30 transition-colors">
                  <td className="p-4 font-medium text-app-fg dark:text-slate-200">{u.nome}</td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700 text-app-fg'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setEditandoUser(u); setModalAberto(true); }} className="text-indigo-400 hover:underline text-sm">Editar</button>
                    <button onClick={() => handleDeletar(u.id)} className="text-red-500 hover:underline text-sm">Banir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80]">
          <div className="bg-app-bg p-8 rounded-2xl border border-app-border w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-left text-indigo-500 dark:text-indigo-400">Editar Perfil</h2>
            <form onSubmit={handleSalvar} className="space-y-4 text-left">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Nome</label>
                <input
                  className="w-full bg-app-card p-3 rounded-lg mt-1 outline-none border border-app-border focus:border-indigo-500"
                  value={editandoUser.nome}
                  onChange={e => setEditandoUser({ ...editandoUser, nome: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Cargo (Role)</label>
                <select
                  className="w-full bg-app-card p-3 rounded-lg mt-1 outline-none border border-app-border"
                  value={editandoUser.role}
                  onChange={e => setEditandoUser({ ...editandoUser, role: e.target.value })}
                >
                  <option value="PLAYER">PLAYER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setModalAberto(false)} className="text-slate-400">Cancelar</button>
                <button className="bg-indigo-600 px-6 py-2 rounded-lg font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}