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
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
}