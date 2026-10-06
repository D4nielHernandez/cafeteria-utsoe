export type Rol = 'cliente' | 'admin';

export interface Usuario {
  uid: string;
  nombre: string;
  email: string;
  role: Rol;
}