import { useEffect, useState } from "react";
import type { Car } from "../types";
import { api } from "../lib/api";
import { CarCard } from "../components/CarCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { Spinner } from "../components/Spinner";

// 1. IMPORTAR A IMAGEM QUE VOCÊ SALVOU EM 'src/assets'
// Troque 'hero-image.png' pelo nome exato do seu arquivo, se for diferente.
import heroImage from '../assets/img_catalogo.png';

const initialFilters = { q: '', marca: '', modelo: '', anoMin: '', anoMax: '', precoMin: '', precoMax: '', kmMax: '', cambio: '', combustivel: '' };

export function Catalogo() {
  const [carros, setCarros] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      async function fetchCarros() {
        try {
          setError(null);
          const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value !== '')
          );
          const response = await api.get('/cars', { params: cleanFilters });
          setCarros(response.data);
        } catch (err) {
          setError("Não foi possível carregar os carros. Tente novamente mais tarde.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
      fetchCarros();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFilters(prevState => ({ ...prevState, [name]: value }));
  }

  function handleClearFilters() {
    setFilters(initialFilters);
  }

  return (
    <div>
      {/* --- HERO SECTION ATUALIZADA --- */}
      <section className="mb-12 p-8 bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Coluna da Esquerda: NOVAS MENSAGENS */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Seu carro novo você encontra aqui!
            </h1>
            <p className="mt-4 text-2xl text-gray-600">
              <span className="text-blue-600 font-semibold">Seminovos revisados e com garantia.</span>
            </p>
          </div>

          {/* Coluna da Direita: NOVA IMAGEM */}
          <div>
            <img 
              src={heroImage} 
              alt="Carro em destaque" 
              className="w-full h-auto rounded-lg object-cover max-h-80" // max-h-80 para controlar a altura da imagem
            />
          </div>

        </div>
      </section>

      {/* --- SEÇÃO DO CATÁLOGO DE CARROS --- */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Nosso Estoque</h2>
          <p className="text-lg text-gray-600 mt-2">Use os filtros para refinar sua busca.</p>
        </div>

        {/* Filtros */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" name="q" placeholder="Buscar por marca, modelo..." className="w-full border border-gray-300 rounded-md shadow-sm p-2 pl-10" value={filters.q} onChange={handleFilterChange} />
            </div>
            <button type="button" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="p-2 border rounded-md text-gray-600 hover:bg-gray-100 flex items-center gap-2">
              <SlidersHorizontal size={20} />
              <span>Filtros</span>
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
                  <label htmlFor="precoMin" className="text-sm font-medium">Preço Mín.</label>
                  <input type="number" id="precoMin" name="precoMin" value={filters.precoMin} onChange={handleFilterChange} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="precoMax" className="text-sm font-medium">Preço Máx.</label>
                  <input type="number" id="precoMax" name="precoMax" value={filters.precoMax} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
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
        </div>

        {/* Galeria de Carros */}
        {isLoading && <Spinner />}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!isLoading && !error && (
          carros.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {carros.map((carro) => ( <CarCard key={carro.id} carro={carro} /> ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-xl font-semibold">Nenhum carro encontrado</h3>
              <p className="text-gray-500 mt-2">Tente ajustar os filtros de busca.</p>
            </div>
          )
        )}
      </section>
    </div>
  )
}