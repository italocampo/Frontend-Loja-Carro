import type { Car } from "../types";
import { Calendar, Gauge, Tag } from "lucide-react";

// O componente recebe uma propriedade 'carro' do tipo Car
interface CarCardProps {
  carro: Car;
}

export function CarCard({ carro }: CarCardProps) {
  // Procura pela imagem de capa no array de imagens do carro
  const capaUrl = carro.images.find(img => img.capa)?.url;

  // Formata o preço para o padrão brasileiro (R$ 105.000,00)
  const precoFormatado = (carro.precoCentavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Formata a quilometragem
  const kmFormatado = carro.km.toLocaleString('pt-BR');

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      {/* Imagem do Carro */}
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        {capaUrl ? (
          <img src={capaUrl} alt={carro.titulo} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-500">Sem imagem</span>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 flex-1">{carro.titulo}</h3>

        <div className="mt-4 border-t pt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span>{carro.ano}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-gray-500" />
            <span>{kmFormatado} km</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Tag size={18} className="text-blue-600" />
            <span className="text-lg font-bold text-blue-700">{precoFormatado}</span>
          </div>
        </div>
      </div>
    </div>
  );
}