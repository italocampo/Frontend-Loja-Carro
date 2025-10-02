import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Car } from "../types";
import { api } from "../lib/api";
import { Edit, PlusCircle, Trash2 } from "lucide-react";

export function Admin() {
  const { user } = useAuth();
  const [carros, setCarros] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os carros (sem alterações)
  async function fetchCarros() {
    try {
      setIsLoading(true);
      const response = await api.get('/cars');
      setCarros(response.data);
    } catch (err) {
      setError("Falha ao buscar os carros.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCarros();
  }, []);

  // --- NOVA FUNÇÃO ---
  // Função para deletar um carro
  async function handleDelete(carroId: string) {
    // Pede confirmação antes de deletar
    if (!window.confirm("Tem certeza que deseja apagar este carro? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      // Chama a rota DELETE do backend
      await api.delete(`/cars/${carroId}`);

      // Atualiza a lista de carros na tela, removendo o que foi deletado
      // Isso faz a mágica de sumir da tela sem precisar recarregar
      setCarros(carrosAtuais => carrosAtuais.filter(carro => carro.id !== carroId));

      alert("Carro apagado com sucesso!");
    } catch (err) {
      alert("Erro ao apagar o carro. Tente novamente.");
      console.error(err);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="mt-1 text-gray-600">Bem-vindo, {user?.nome}!</p>
        </div>
        <button className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <PlusCircle size={20} />
          Cadastrar Novo Carro
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {/* ... Thead da tabela (sem alterações) ... */}
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && ( <tr><td colSpan={5} className="text-center py-4">Carregando...</td></tr> )}
            {error && ( <tr><td colSpan={5} className="text-center py-4 text-red-500">{error}</td></tr> )}

            {!isLoading && !error && carros.map((carro) => (
              <tr key={carro.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{carro.titulo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{carro.marca}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{carro.ano}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {(carro.precoCentavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                    <Edit size={20} />
                  </button>
                  {/* CONECTANDO A FUNÇÃO AO BOTÃO */}
                  <button 
                    onClick={() => handleDelete(carro.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}