import { useEffect, useState, useCallback } from "react"; // useCallback foi mantido
import type { Car } from "../types";
import { api } from "../lib/api";
import { CarCard } from "../components/CarCard";
import { Search, SlidersHorizontal } from "lucide-react";

// VALORES INICIAIS DOS FILTROS (PARA FACILITAR A LIMPEZA)
const initialFilters = {
  q: '',
  marca: '',
  modelo: '',
  anoMin: '',
  anoMax: '',
  precoMin: '',
  precoMax: '',
  kmMax: '',
  cambio: '',
  combustivel: '',
};

export function Catalogo() {
  const [carros, setCarros] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros expandidos
  const [filters, setFilters] = useState(initialFilters);

  // Novo estado para controlar o painel de filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // A função de busca continua envolvida com useCallback para otimização
  const fetchCarros = useCallback(async (currentFilters: typeof filters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Remove campos vazios para não poluir a URL
      const cleanFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([, value]) => value !== '')
      );

      const response = await api.get('/cars', { params: cleanFilters });
      setCarros(response.data);
    } catch (err) {
      setError("Não foi possível carregar os carros. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []); // O array de dependências do useCallback continua vazio

  // As dependências corretas são mantidas no useEffect
  useEffect(() => {
    fetchCarros(filters);
  }, [fetchCarros, filters]);

  function handleFilterSubmit(event: React.FormEvent) {
    event.preventDefault();
    fetchCarros(filters);
  }

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFilters(prevState => ({ ...prevState, [name]: value }));
  }

  // Nova função para limpar os filtros
  function handleClearFilters() {
    setFilters(initialFilters);
    // A busca com os filtros limpos será refeita automaticamente pelo useEffect
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Catálogo de Carros</h1>
        <p className="text-lg text-gray-600 mt-2">Encontre o carro dos seus sonhos em nosso catálogo completo.</p>
      </div>

      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <form onSubmit={handleFilterSubmit}>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" name="q" placeholder="Buscar por marca, modelo, título..." className="w-full border border-gray-300 rounded-md shadow-sm p-2 pl-10" value={filters.q} onChange={handleFilterChange} />
            </div>
            
            <button type="button" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="p-2 border rounded-md text-gray-600 hover:bg-gray-100 flex items-center gap-2">
              <SlidersHorizontal size={20} />
              <span>Filtros</span>
            </button>

            <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700">
              Buscar
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="mt-6 border-t pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="marca" className="text-sm font-medium">Marca</label>
                  <input type="text" id="marca" name="marca" value={filters.marca} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="modelo" className="text-sm font-medium">Modelo</label>
                  <input type="text" id="modelo" name="modelo" value={filters.modelo} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="anoMin" className="text-sm font-medium">Ano (de)</label>
                  <input type="number" id="anoMin" name="anoMin" value={filters.anoMin} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="anoMax" className="text-sm font-medium">Ano (até)</label>
                  <input type="number" id="anoMax" name="anoMax" value={filters.anoMax} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="precoMin" className="text-sm font-medium">Preço Mín. (R$)</label>
                  <input type="number" id="precoMin" name="precoMin" value={filters.precoMin} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="precoMax" className="text-sm font-medium">Preço Máx. (R$)</label>
                  <input type="number" id="precoMax" name="precoMax" value={filters.precoMax} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="cambio" className="text-sm font-medium">Câmbio</label>
                  <select id="cambio" name="cambio" value={filters.cambio} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm">
                    <option value="">Todos</option>
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATICO">Automático</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="combustivel" className="text-sm font-medium">Combustível</label>
                  <select id="combustivel" name="combustivel" value={filters.combustivel} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm">
                    <option value="">Todos</option>
                    <option value="FLEX">Flex</option>
                    <option value="GASOLINA">Gasolina</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="ETANOL">Etanol</option>
                    <option value="HIBRIDO">Híbrido</option>
                    <option value="ELETRICO">Elétrico</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button type="button" onClick={handleClearFilters} className="text-sm text-blue-600 hover:underline">
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {isLoading && <p className="text-center">Buscando carros...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!isLoading && !error && carros.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {carros.map((carro) => (
            <CarCard key={carro.id} carro={carro} />
          ))}
        </div>
      )}

      {!isLoading && !error && carros.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-xl font-semibold">Nenhum carro encontrado</h3>
          <p className="text-gray-500 mt-2">Tente ajustar os filtros de busca.</p>
        </div>
      )}
    </div>
  )
}