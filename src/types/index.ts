// Define tipos mais específicos para Câmbio e Combustível para maior segurança
export type Cambio = "MANUAL" | "AUTOMATICO";
export type Combustivel =
  | "GASOLINA"
  | "ETANOL"
  | "FLEX"
  | "DIESEL"
  | "HIBRIDO"
  | "ELETRICO";

export interface CarImage {
  id: string;
  url: string;
  capa: boolean;
}

export interface Car {
  id: string;
  titulo: string;
  marca: string;
  ano: number;
  km: number;
  precoCentavos: number;
  images: CarImage[];
  // --- CAMPOS ADICIONADOS PARA ALINHAR COM O FORMULÁRIO ---
  modelo: string;
  cor: string;
  portas: number;
  cambio: Cambio;
  combustivel: Combustivel;
  descricao: string | null; // Pode ser nulo se não houver descrição
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: "ADMIN" | "STAFF";
}