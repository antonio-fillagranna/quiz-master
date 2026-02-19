import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login, Lobby, Quiz, GerenciarPerguntas, GerenciarRespostas, GerenciarUsuarios, MeuPerfil, Historico } from './pages';
import { ThemeProvider } from './context/ThemeContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLogged, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-app-bg flex items-center justify-center text-app-fg">Carregando...</div>;

  return isLogged ? <>{children}</> : <Navigate to="/" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLogged, usuario, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-app-bg flex items-center justify-center text-app-fg">Carregando...</div>;

  // Ajuste da proteção aqui também
  if (!isLogged || usuario?.role !== 'ADMIN') {
    return <Navigate to="/lobby" />;
  }

  return <>{children}</>;
}

export default function App() {
  const { loading } = useAuth();
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {!loading && <Navbar />}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/lobby" element={<PrivateRoute><Lobby /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><MeuPerfil /></PrivateRoute>} />
            <Route path="/historico" element={<PrivateRoute><Historico /></PrivateRoute>} />
            <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
            <Route path="/admin/usuarios" element={<AdminRoute><GerenciarUsuarios /></AdminRoute>} />
            <Route path="/admin/perguntas" element={<AdminRoute><GerenciarPerguntas /></AdminRoute>} />
            <Route path="/admin/respostas" element={<AdminRoute><GerenciarRespostas /></AdminRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}