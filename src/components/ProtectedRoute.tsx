import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  // Enquanto verifica a sessão, mostra uma tela de carregamento
  if (isLoading) {
    return <div className="text-center mt-10">Carregando sua sessão...</div>;
  }

  // Se não houver usuário e a verificação terminou, redireciona para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se houver usuário, exibe a página protegida
  return <>{children}</>;
}