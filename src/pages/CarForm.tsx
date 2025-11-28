import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Car as CarIcon, UploadCloud, XCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { api } from "../lib/api";
import type { Car } from "../types";
import toast from "react-hot-toast";

interface ImageFile extends File {
  preview: string;
}

export function CarForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    titulo: "",
    marca: "",
    modelo: "",
    ano: "",
    km: "",
    precoCentavos: "",
    cor: "",
    portas: "",
    cambio: "MANUAL",
    combustivel: "GASOLINA",
    descricao: "",
  });

  const [files, setFiles] = useState<ImageFile[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [removedExistingImageUrls, setRemovedExistingImageUrls] = useState<
    string[]
  >([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  useEffect(() => {
    // Garante que as URLs de preview sejam liberadas da memória ao sair da página
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  useEffect(() => {
    if (isEditing) {
      async function fetchCarData() {
        try {
          const response = await api.get<Car>(`/cars/${id}`);
          const carData = response.data;
          setFormData({
            titulo: carData.titulo,
            marca: carData.marca,
            modelo: carData.modelo,
            ano: String(carData.ano),
            km: String(carData.km),
            precoCentavos: String(carData.precoCentavos),
            cor: carData.cor || "",
            portas: String(carData.portas),
            cambio: carData.cambio,
            combustivel: carData.combustivel,
            descricao: carData.descricao || "",
          });
          // --- CORREÇÃO 2 APLICADA AQUI ---
          // Mapeia o array de objetos `images` para um array de strings `url`
          setExistingImageUrls(carData.images?.map((image) => image.url) || []);
        } catch (error) {
          console.error("Erro ao buscar dados do carro:", error);
          alert("Não foi possível carregar os dados do carro para edição.");
          navigate("/admin");
        }
      }
      fetchCarData();
    }
  }, [id, isEditing, navigate]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { id, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  }

  function removeNewImage(index: number) {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }

  function removeExistingImage(urlToRemove: string) {
    setExistingImageUrls((prevUrls) =>
      prevUrls.filter((url) => url !== urlToRemove)
    );
    setRemovedExistingImageUrls((prevRemoved) => [...prevRemoved, urlToRemove]);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Validação cliente (espelha parte das regras do backend para evitar 400)
    const tituloTrim = formData.titulo.trim();
    if (tituloTrim.length < 3) {
      toast.error("Título deve ter no mínimo 3 caracteres.");
      return;
    }
    if (!formData.marca || formData.marca.trim().length === 0) {
      toast.error("Preencha o campo Laboratório.");
      return;
    }
    if (!formData.modelo || formData.modelo.trim().length === 0) {
      toast.error("Preencha o campo Princípio Ativo.");
      return;
    }
    const precoNumeroCheck = Number(formData.precoCentavos);
    if (Number.isNaN(precoNumeroCheck) || precoNumeroCheck < 0) {
      toast.error("Preço inválido. Informe um número em centavos (ex: 2500).");
      return;
    }
    const kmNumeroCheck = Number(formData.km);
    if (Number.isNaN(kmNumeroCheck) || kmNumeroCheck < 0) {
      toast.error(
        "Quantidade inválida. Informe um número inteiro não-negativo."
      );
      return;
    }

    // Transformação rápida: adaptar os campos do formulário (farmácia)
    // para os campos e tipos que o backend atual espera (carros).
    // Isso é provisório — idealmente o backend deve ser atualizado para o modelo de medicamentos.
    const currentYear = new Date().getFullYear();

    // Mapear forma farmacêutica -> enum de cambio esperado pelo backend
    const cambioMap: Record<string, "MANUAL" | "AUTOMATICO"> = {
      COMPRIMIDO: "MANUAL",
      CAPSULA: "MANUAL",
      LIQUIDO: "AUTOMATICO",
      INJECAO: "AUTOMATICO",
      POMADA: "MANUAL",
      GOTAS: "MANUAL",
    };

    // Mapear categoria -> enum de combustivel esperado pelo backend
    const combustivelMap: Record<
      string,
      "GASOLINA" | "ETANOL" | "FLEX" | "DIESEL" | "HIBRIDO" | "ELETRICO"
    > = {
      VENDA_LIVRE: "FLEX",
      CONTROLADO: "GASOLINA",
      TARJA_VERMELHA: "GASOLINA",
      TARJA_PRETA: "DIESEL",
      SUPLEMENTO: "FLEX",
    };

    // Extrair um valor numérico para 'ano' compatível com validação (1950..currentYear+1).
    // Aqui usamos o ano atual como valor padrão — alternativa: extrair número da dosagem.
    const anoNumero = currentYear;

    // Garantir inteiros e limites esperados pelo backend
    const kmNumero = Number(formData.km) || 0;
    const originalPortas = Number(formData.portas) || 0;
    let portasNumero = originalPortas || 2;
    if (portasNumero < 2) portasNumero = 2;
    if (portasNumero > 5) portasNumero = 5;
    if (originalPortas !== portasNumero) {
      toast(
        `Validade ajustada para ${portasNumero} meses para atender validação do servidor.`
      );
    }
    const precoNumero = Number(formData.precoCentavos) || 0;

    const payload: Record<string, any> = {
      titulo: formData.titulo,
      descricao: formData.descricao || undefined,
      marca: formData.marca,
      modelo: formData.modelo,
      ano: anoNumero,
      km: kmNumero,
      cambio: cambioMap[formData.cambio] || "MANUAL",
      combustivel: combustivelMap[formData.combustivel] || "FLEX",
      cor: formData.cor || "",
      portas: portasNumero,
      precoCentavos: precoNumero,
    };

    const data = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) data.append(key, String(value));
    });

    files.forEach((file) => {
      data.append("images", file);
    });

    if (isEditing && removedExistingImageUrls.length > 0) {
      data.append("removedImageUrls", JSON.stringify(removedExistingImageUrls));
    }

    try {
      if (isEditing) {
        // --- CORREÇÃO 1 APLICADA AQUI ---
        // Remova o objeto 'headers'. O navegador definirá o Content-Type corretamente.
        await api.patch(`/cars/${id}`, data);
        toast.success("Produto atualizado com sucesso!");
      } else {
        // --- CORREÇÃO 1 APLICADA AQUI ---
        // Remova o objeto 'headers'. O navegador definirá o Content-Type corretamente.
        await api.post("/cars", data);
        toast.success("Produto cadastrado com sucesso!");
      }
      navigate("/admin");
    } catch (error) {
      // Mostrar detalhes da resposta do servidor quando disponível (útil para validar erros do Zod)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = error as any;
      if (anyErr?.response?.data) {
        console.error(
          "Erro ao salvar produto (response):",
          anyErr.response.data
        );
        const serverMessage =
          anyErr.response.data?.erro?.mensagem || anyErr.response.data;
        toast.error(`Falha ao salvar o produto. ${String(serverMessage)}`);
      } else {
        console.error("Erro ao salvar produto:", error);
        toast.error("Falha ao salvar o produto. Verifique os dados.");
      }
    }
  }

  // O restante do seu código JSX continua o mesmo...
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? "Editar Medicamento" : "Cadastrar Novo Medicamento"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="titulo"
              className="block text-sm font-medium text-gray-700"
            >
              Nome do Medicamento
            </label>
            <input
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="marca"
              className="block text-sm font-medium text-gray-700"
            >
              Laboratório
            </label>
            <input
              type="text"
              id="marca"
              value={formData.marca}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="modelo"
              className="block text-sm font-medium text-gray-700"
            >
              Princípio Ativo
            </label>
            <input
              type="text"
              id="modelo"
              value={formData.modelo}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="ano"
              className="block text-sm font-medium text-gray-700"
            >
              Dosagem
            </label>
            <input
              type="text"
              id="ano"
              value={formData.ano}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Ex: 500mg"
            />
          </div>
          <div>
            <label
              htmlFor="km"
              className="block text-sm font-medium text-gray-700"
            >
              Quantidade
            </label>
            <input
              type="number"
              id="km"
              value={formData.km}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="precoCentavos"
              className="block text-sm font-medium text-gray-700"
            >
              Preço (em centavos)
            </label>
            <input
              type="number"
              id="precoCentavos"
              value={formData.precoCentavos}
              onChange={handleChange}
              required
              placeholder="Ex: 2500 para R$ 25,00"
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="cor"
              className="block text-sm font-medium text-gray-700"
            >
              Lote
            </label>
            <input
              type="text"
              id="cor"
              value={formData.cor}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="portas"
              className="block text-sm font-medium text-gray-700"
            >
              Validade (meses)
            </label>
            <input
              type="number"
              id="portas"
              value={formData.portas}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="cambio"
              className="block text-sm font-medium text-gray-700"
            >
              Forma Farmacêutica
            </label>
            <select
              id="cambio"
              value={formData.cambio}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="COMPRIMIDO">Comprimido</option>
              <option value="CAPSULA">Cápsula</option>
              <option value="LIQUIDO">Líquido</option>
              <option value="INJECAO">Injeção</option>
              <option value="POMADA">Pomada</option>
              <option value="GOTAS">Gotas</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="combustivel"
              className="block text-sm font-medium text-gray-700"
            >
              Categoria
            </label>
            <select
              id="combustivel"
              value={formData.combustivel}
              onChange={handleChange}
              required
              className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="VENDA_LIVRE">Venda Livre</option>
              <option value="CONTROLADO">Controlado</option>
              <option value="TARJA_VERMELHA">Tarja Vermelha</option>
              <option value="TARJA_PRETA">Tarja Preta</option>
              <option value="SUPLEMENTO">Suplemento</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-700"
          >
            Descrição
          </label>
          <textarea
            id="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagens do Medicamento
          </label>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            {isDragActive ? (
              <p className="mt-2 text-sm text-gray-600">
                Solte as imagens aqui...
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                Arraste e solte algumas imagens aqui, ou clique para selecionar
                arquivos.
              </p>
            )}
            <em className="mt-1 text-xs text-gray-500">
              (Apenas .jpeg, .jpg, .png e .webp serão aceitos)
            </em>
          </div>

          {isEditing && existingImageUrls.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Imagens Atuais:
              </h3>
              <div className="flex flex-wrap gap-2">
                {existingImageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={url}
                      alt={`Medicamento ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-700"
                      title="Remover imagem existente"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Novas Imagens para Upload:
              </h3>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={file.name}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-700"
                      title="Remover nova imagem"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <CarIcon size={20} />
            Salvar Medicamento
          </button>
        </div>
      </form>
    </div>
  );
}
