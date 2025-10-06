import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
// 2. Importe o tipo CarImage
import type { Car, CarImage } from "../types";
import { Spinner } from "../components/Spinner";
// 1. Corrija o nome do ícone de GasPump para Fuel
import { Calendar, Gauge, Droplets, DoorOpen, Fuel, Settings, MessageSquare } from "lucide-react";

// 3. Define um tipo local que estende Car com a nova propriedade
type CarWithLink = Car & { linkWhatsApp: string };

export function CarDetail() {
  const { id } = useParams<{ id: string }>();
  // Usa o novo tipo para o estado
  const [carro, setCarro] = useState<CarWithLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    async function fetchCarro() {
      try {
        setIsLoading(true);
        // Informa ao TypeScript que a resposta terá o tipo CarWithLink
        const response = await api.get<CarWithLink>(`/cars/${id}`);
        setCarro(response.data);
        
        if (response.data.images && response.data.images.length > 0) {
          // 2. Usa o tipo CarImage em vez de 'any'
          const capa = response.data.images.find((img: CarImage) => img.capa);
          setMainImage(capa ? capa.url : response.data.images[0].url);
        }
      } catch (err) {
        setError("Não foi possível carregar os detalhes do carro.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchCarro();
    }
  }, [id]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!carro) {
    return <p className="text-center">Carro não encontrado.</p>;
  }

  const precoFormatado = (carro.precoCentavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{carro.titulo}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galeria de Imagens */}
        <div>
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden mb-4">
            {mainImage ? (
              <img src={mainImage} alt={carro.titulo} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500">Sem imagem</span>
            )}
          </div>
          <div className="flex gap-2">
            {carro.images.map((image) => (
              <div 
                key={image.id} 
                className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${mainImage === image.url ? 'border-blue-600' : 'border-transparent'}`}
                onClick={() => setMainImage(image.url)}
              >
                <img src={image.url} alt={`Thumbnail ${carro.titulo}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes e Contato */}
        <div>
          <p className="text-3xl font-bold text-blue-700 mb-6">{precoFormatado}</p>

          <div className="grid grid-cols-2 gap-4 border-t pt-6">
            <div className="flex items-center gap-2 text-gray-700"><Calendar size={20} /> <strong>Ano:</strong> {carro.ano}</div>
            <div className="flex items-center gap-2 text-gray-700"><Gauge size={20} /> <strong>KM:</strong> {carro.km.toLocaleString('pt-BR')}</div>
            <div className="flex items-center gap-2 text-gray-700"><Droplets size={20} /> <strong>Cor:</strong> {carro.cor}</div>
            <div className="flex items-center gap-2 text-gray-700"><DoorOpen size={20} /> <strong>Portas:</strong> {carro.portas}</div>
            <div className="flex items-center gap-2 text-gray-700"><Settings size={20} /> <strong>Câmbio:</strong> {carro.cambio}</div>
            {/* 1. Usa o ícone 'Fuel' corrigido */}
            <div className="flex items-center gap-2 text-gray-700"><Fuel size={20} /> <strong>Combustível:</strong> {carro.combustivel}</div>
          </div>

          {carro.descricao && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-2">Descrição</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{carro.descricao}</p>
            </div>
          )}

          <a 
            href={carro.linkWhatsApp} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-8 w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-lg"
          >
            <MessageSquare size={24} />
            Entrar em contato via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}