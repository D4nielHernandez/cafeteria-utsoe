export type Rol = 'cliente' | 'admin';

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
}