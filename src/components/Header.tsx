import { Car } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/'); // Volta para a página inicial após o logout
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      {/* O container principal agora usa 'justify-between' para empurrar os itens para as pontas */}
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Lado Esquerdo: Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Car className="text-blue-600" />
          <span>Paulo Ney Veículos</span>
        </Link>
        
        {/* Lado Direito: Links de Navegação e Botão de Ação */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
            Catálogo
          </Link>

          {/* O link do Painel só aparece se o usuário estiver logado */}
          {user && (
            <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Painel de Gestão
            </Link>
          )}

          {/* Lógica para mostrar Login ou Informações do Usuário */}
          {user ? (
            <div className='flex items-center gap-4'>
              <span className='text-sm text-gray-700 hidden sm:block'>Olá, {user.nome.split(' ')[0]}</span>
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold text-sm"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">
                Login
              </button>
            </Link>
          )}
        </div>

      </nav>
    </header>
  )
}