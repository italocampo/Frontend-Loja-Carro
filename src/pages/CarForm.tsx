import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Car as CarIcon } from "lucide-react";
import { api } from "../lib/api";
import type { Car } from "../types";

export function CarForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL, se existir
  const isEditing = Boolean(id); // Se tem ID, estamos editando

  const [formData, setFormData] = useState({
    titulo: '',
    marca: '',
    modelo: '',
    ano: '',
    km: '',
    precoCentavos: '',
    cor: '',
    portas: '',
    cambio: 'MANUAL',
    combustivel: 'GASOLINA',
    descricao: '',
  });

  // Efeito que busca os dados do carro quando estamos em modo de edição
  useEffect(() => {
    if (isEditing) {
      async function fetchCarData() {
        try {
          const response = await api.get<Car>(`/cars/${id}`);
          const carData = response.data;
          // Preenche o formulário com os dados do carro buscado
          setFormData({
            titulo: carData.titulo,
            marca: carData.marca,
            modelo: carData.modelo,
            ano: String(carData.ano),
            km: String(carData.km),
            precoCentavos: String(carData.precoCentavos),
            cor: carData.cor, // Assumindo que cor existe no tipo Car
            portas: String(carData.portas), // Assumindo que portas existe
            cambio: carData.cambio, // Assumindo que cambio existe
            combustivel: carData.combustivel, // Assumindo que combustivel existe
            descricao: carData.descricao || '',
          });
        } catch (error) {
          console.error("Erro ao buscar dados do carro:", error);
          alert("Não foi possível carregar os dados do carro para edição.");
          navigate('/admin');
        }
      }
      fetchCarData();
    }
  }, [id, isEditing, navigate]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { id, value } = event.target;
    setFormData(prevState => ({ ...prevState, [id]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const dataToSend = {
      ...formData,
      ano: parseInt(formData.ano, 10),
      km: parseInt(formData.km, 10),
      precoCentavos: parseInt(formData.precoCentavos, 10),
      portas: parseInt(formData.portas, 10),
    };

    try {
      if (isEditing) {
        // Se estiver editando, chama o método PATCH
        await api.patch(`/cars/${id}`, dataToSend);
        alert('Carro atualizado com sucesso!');
      } else {
        // Se não, chama o método POST para criar
        await api.post('/cars', dataToSend);
        alert('Carro cadastrado com sucesso!');
      }
      navigate('/admin');
    } catch (error) {
      console.error("Erro ao salvar carro:", error);
      alert('Falha ao salvar o carro. Verifique os dados e tente novamente.');
    }
  }

  return (
    <div>
      {/* O título da página agora é dinâmico */}
      <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Editar Carro' : 'Cadastrar Novo Carro'}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {/* O RESTO DO FORMULÁRIO (CAMPOS E BOTÃO) É EXATAMENTE O MESMO DE ANTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="titulo">Título do Anúncio</label>
            <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="marca">Marca</label>
            <input type="text" id="marca" value={formData.marca} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="modelo">Modelo</label>
            <input type="text" id="modelo" value={formData.modelo} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="ano">Ano</label>
            <input type="number" id="ano" value={formData.ano} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="km">Quilometragem (km)</label>
            <input type="number" id="km" value={formData.km} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="precoCentavos">Preço (em centavos)</label>
            <input type="number" id="precoCentavos" value={formData.precoCentavos} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="cor">Cor</label>
            <input type="text" id="cor" value={formData.cor} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="portas">Número de Portas</label>
            <input type="number" id="portas" value={formData.portas} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="cambio">Câmbio</label>
            <select id="cambio" value={formData.cambio} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATICO">Automático</option>
            </select>
          </div>
          <div>
            <label htmlFor="combustivel">Combustível</label>
            <select id="combustivel" value={formData.combustivel} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2">
              <option value="GASOLINA">Gasolina</option><option value="ETANOL">Etanol</option><option value="FLEX">Flex</option><option value="DIESEL">Diesel</option><option value="HIBRIDO">Híbrido</option><option value="ELETRICO">Elétrico</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" value={formData.descricao} onChange={handleChange} rows={4} className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <CarIcon size={20} />
            Salvar Carro
          </button>
        </div>
      </form>
    </div>
  );
}