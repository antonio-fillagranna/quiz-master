import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import reactLogo from '../assets/react.svg';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { usuario, logout, isLogged } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  if (!isLogged || location.pathname === '/') return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mobileLinkStyle = "text-lg py-2 transition-colors border-b border-app-border last:border-0";

  return (
    <nav className="fixed top-0 w-full z-[150] bg-app-bg/80 backdrop-blur-md border-b border-app-border">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={reactLogo}
            alt="Logo"
            className="h-8 w-8 animate-[spin_20s_linear_infinite]"
          />
          <Link to="/lobby" className="text-xl font-bold text-indigo-400">QuizMaster</Link>
          <div className="hidden md:block h-6 w-[1px] bg-slate-700"></div>
          <span className="text-indigo-600 dark:text-indigo-400 transition-colors">
            Olá,{' '}
            <Link
              to="/perfil"
              className="text-indigo-300 font-semibold hover:text-indigo-400 hover:underline transition-colors"
            >
              {usuario?.nome || "Usuário Desconhecido"}
            </Link>
          </span>
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/lobby" className="text-indigo-600 dark:text-indigo-400 transition-colors">Lobby</Link>
          <Link to="/historico" className="text-indigo-600 dark:text-indigo-400 transition-colors">Histórico</Link>

          {usuario?.role === 'ADMIN' && (
            <>
              <Link to="/admin/usuarios" className="text-indigo-400 hover:text-indigo-300 font-medium">Gerenciar Usuários</Link>
              <Link to="/admin/perguntas" className="text-indigo-400 hover:text-indigo-300 font-medium">Gerenciar Perguntas</Link>
              <Link to="/admin/respostas" className="text-indigo-400 hover:text-indigo-300 font-medium">Gerenciar Respostas</Link>
            </>
          )}

          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-medium">Sair</button>
          <button onClick={toggleTheme} className="p-2 rounded-lg bg-app-card text-yellow-400">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Botão Hambúrguer Mobile */}
        <button
          className="md:hidden text-slate-700 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400 p-2 text-3xl transition-all active:scale-90"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-app-bg border-b border-app-border p-6 flex flex-col gap-2 shadow-2xl z-[200] opacity-100">

          <Link to="/lobby" onClick={() => setIsOpen(false)} className={`${mobileLinkStyle} text-indigo-600 dark:text-indigo-400 transition-colors`}>
            Lobby
          </Link>

          <Link to="/historico" onClick={() => setIsOpen(false)} className={`${mobileLinkStyle} text-indigo-600 dark:text-indigo-400 transition-colors`}>
            Histórico
          </Link>

          {usuario?.role === 'ADMIN' && (
            <>
              <Link to="/admin/usuarios" onClick={() => setIsOpen(false)} className={`${mobileLinkStyle} text-indigo-600 dark:text-indigo-400 transition-colors`}>
                Gerenciar Usuários
              </Link>
              <Link to="/admin/perguntas" onClick={() => setIsOpen(false)} className={`${mobileLinkStyle} text-indigo-600 dark:text-indigo-400 transition-colors`}>
                Gerenciar Perguntas
              </Link>
              <Link to="/admin/respostas" onClick={() => setIsOpen(false)} className={`${mobileLinkStyle} text-indigo-600 dark:text-indigo-400 transition-colors`}>
                Gerenciar Respostas
              </Link>
            </>
          )}

          <button
            onClick={handleLogout}
            className={`${mobileLinkStyle} text-red-400 hover:text-red-300 text-left font-medium`}
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}