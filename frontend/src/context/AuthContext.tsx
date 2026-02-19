import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface AuthContextData {
  usuario: any;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  updateUsuario: (novoDados: any) => void;
  isLogged: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const updateUsuario = (novoDados: any) => {
    const usuarioAtualizado = { ...usuario, ...novoDados };
    setUsuario(usuarioAtualizado);
    localStorage.setItem('@QuizApp:user', JSON.stringify(usuarioAtualizado));
  };

  useEffect(() => {
    const userSave = localStorage.getItem('@QuizApp:user');
    const token = localStorage.getItem('@QuizApp:token');

    if (userSave && token) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUsuario(JSON.parse(userSave));
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, senha: string) {
    const response = await api.post('/login', { email, senha });
    const { usuario: userLogado, token } = response.data;

    localStorage.setItem('@QuizApp:token', token);
    localStorage.setItem('@QuizApp:user', JSON.stringify(userLogado));

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUsuario(userLogado);
  }

  function logout() {
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      login,
      logout,
      updateUsuario,
      loading,
      isLogged: !!usuario
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);