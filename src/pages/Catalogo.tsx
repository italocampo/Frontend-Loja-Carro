import { useEffect, useState } from "react";
import type { Car } from "../types";
import { api } from "../lib/api";
import { CarCard } from "../components/CarCard"; 

export function Catalogo() {
  const [carros, setCarros] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCarros() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/cars');
        setCarros(response.data);
      } catch (err) {
        setError("Não foi possível carregar os carros. Tente novamente mais tarde.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCarros();
  }, []);

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Catálogo de Carros</h1>
        <p className="text-lg text-gray-600 mt-2">Encontre o carro dos seus sonhos em nosso catálogo completo.</p>
      </div>

      {isLoading && <p className="text-center">Carregando carros...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {carros.map((carro) => (
            // A MUDANÇA ESTÁ AQUI!
            <CarCard key={carro.id} carro={carro} />
          ))}
        </div>
      )}
    </div>
  )
}