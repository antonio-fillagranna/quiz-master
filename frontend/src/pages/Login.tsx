import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import reactLogo from '../assets/react.svg';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Estados para o Modal de Cadastro
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const senhasConferem = novaSenha === confirmarSenha && novaSenha.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, senha);
      navigate('/lobby');
    } catch (error) {
      alert("Credenciais inválidas!");
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/register', {
        nome: novoNome,
        email: novoEmail,
        senha: novaSenha
      });
      alert("Conta criada com sucesso! Agora é só fazer login.");
      setModalCadastroAberto(false);
      resetCamposCadastro();
    } catch (error: any) {
      alert(error.response?.data?.error || "Erro ao criar conta.");
    }
  }

  function resetCamposCadastro() {
    setNovoNome('');
    setNovoEmail('');
    setNovaSenha('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg text-app-fg p-4">
      <div className="w-full max-w-md p-8 bg-app-bg rounded-2xl border border-app-border shadow-2xl">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-8">
          <img src={reactLogo} alt="Logo" className="h-16 w-16 mb-4 animate-[spin_20s_linear_infinite]" />
          <h1 className="text-3xl font-bold text-indigo-400">Quiz Master AI</h1>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-app-card border border-app-border outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            placeholder="E-mail"
            required
          />
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-app-card border border-app-border outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            placeholder="Senha"
            required
          />
          <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]">
            Entrar
          </button>
        </form>

        {/* Divisor e Botão Criar Conta */}
        <div className="mt-8 pt-6 border-t border-app-border text-center">
          <p className="text-slate-500 text-sm">
            Ainda não tem uma conta?
          </p>
          <button
            onClick={() => setModalCadastroAberto(true)}
            className="mt-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
          >
            CRIAR CONTA AGORA
          </button>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {modalCadastroAberto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-app-card border border-app-border p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-white mb-2">Junte-se ao Desafio</h2>
            <p className="text-slate-400 text-sm mb-8">Preencha os dados abaixo para começar.</p>

            <form onSubmit={handleCadastro} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full p-3 bg-app-bg border border-app-border rounded-xl outline-none focus:border-indigo-500 transition-all"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full p-3 bg-app-bg border border-app-border rounded-xl outline-none focus:border-indigo-500 transition-all"
                  placeholder="exemplo@email.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className={`w-full p-3 bg-app-bg border rounded-xl outline-none transition-all ${novaSenha && confirmarSenha && !senhasConferem ? 'border-red-500/50' : 'border-app-border focus:border-indigo-500'
                    }`}
                  placeholder="••••••••"
                />
              </div>

              {/* Campo: Confirmar Senha */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className={`w-full p-3 bg-app-bg border rounded-xl outline-none transition-all ${novaSenha && confirmarSenha && !senhasConferem ? 'border-red-500/50' : 'border-app-border focus:border-indigo-500'
                    }`}
                  placeholder="••••••••"
                />
                {novaSenha && confirmarSenha && !senhasConferem && (
                  <span className="text-[10px] text-red-500 mt-1 font-bold animate-pulse">As senhas não coincidem</span>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button
                  type="submit"
                  disabled={!senhasConferem}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                >
                  Confirmar Cadastro
                </button>
                <button
                  type="button"
                  onClick={() => setModalCadastroAberto(false)}
                  className="w-full py-3 text-slate-400 font-semibold hover:text-white transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}