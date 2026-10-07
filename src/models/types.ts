export type Rol = 'cliente' | 'admin';
import type { Timestamp } from 'firebase/firestore';

export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  role: Rol;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  codigoBarras?: string;
}

export type EstadoPedido =
  | 'pendiente'
  | 'preparando'
  | 'listo'
  | 'entregado'
  | 'cancelado';

export interface ItemPedido {
  productId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  userId: string;
  userNombre: string;
  items: ItemPedido[];
  total: number;
  status: EstadoPedido;
  creadoEn: Timestamp | null;
}

export interface ProductoOFF {
  codigo: string;
  nombre: string;
  marca: string;
  cantidad: string;
  porcion: string;
  imagen: string;
  nutriscore: string | null;
  nova: number | null;
  ingredientes: string;
  alergenos: string[];
  nutrientes: {
    energiaKcal: number | null;
    grasas: number | null;
    grasasSaturadas: number | null;
    carbohidratos: number | null;
    azucares: number | null;
    proteinas: number | null;
    sal: number | null;
  };
}