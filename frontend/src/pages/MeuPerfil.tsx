import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export function MeuPerfil() {
  const { usuario, logout, updateUsuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(`/usuarios/${usuario?.id}`, { nome, email, senha });

      updateUsuario(response.data);
      alert("Perfil atualizado com sucesso!");
      setSenha('');
    } catch (error) {
      alert("Erro ao atualizar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm("Deseja excluir sua conta?")) return;
    try {
      await api.delete(`/usuarios/${usuario?.id}`);
      logout();
    } catch (error) {
      alert("Erro ao excluir.");
    }
  }

  return (
    <div className="min-h-screen pt-24 p-8 bg-app-bg text-app-fg flex justify-center">
      <div className="w-full max-w-md">
        <div className="bg-app-bg border border-app-border p-8 rounded-2xl shadow-xl text-left">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">Meu Perfil</h1><br />

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <input
                className="w-full bg-app-card p-4 rounded-xl mt-1 border border-app-border focus:border-indigo-500 outline-none transition-all"
                value={nome}
                onChange={e => setNome(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
              <input
                type="email"
                className="w-full bg-app-card p-4 rounded-xl mt-1 border border-app-border focus:border-indigo-500 outline-none transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nova Senha (deixe vazio para manter)</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-app-card p-4 rounded-xl mt-1 border border-app-border focus:border-indigo-500 outline-none transition-all"
                value={senha}
                onChange={e => setSenha(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>

          <div className="mt-12 pt-6 border-t border-app-border">
            <p className="text-sm text-slate-500 mb-4 text-center">Zona de Perigo</p>
            <button
              onClick={handleDeleteAccount}
              className="w-full border border-red-500/30 text-red-500 hover:bg-red-500/10 py-3 rounded-xl font-medium transition-all"
            >
              Excluir minha conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}