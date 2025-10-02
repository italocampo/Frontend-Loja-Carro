import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import type { User } from "../types";

// Define o formato do nosso contexto de autenticação
interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o "Provedor" que irá encapsular nossa aplicação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkUserSession() {
      try {
        const response = await api.get<User>("/auth/me");
        setUser(response.data);
      } catch (error) {
        console.error("Falha ao verificar a sessão do usuário:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkUserSession();
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await api.post<{ user: User; accessToken: string }>(
      "/auth/login",
      { email, senha }
    );

    const { user, accessToken } = response.data;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    if (user) {
      setUser(user);
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}