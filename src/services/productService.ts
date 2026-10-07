import { addDoc, collection, doc, onSnapshot, updateDoc, writeBatch } from 'firebase/firestore';import { db } from '../firebase';
import { Producto } from '../models/types';

export function suscribirProductos(
  onData: (productos: Producto[]) => void,
  onError: (e: unknown) => void
) {
  return onSnapshot(
    collection(db, 'products'),
    (snap) => {
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Producto, 'id'>),
      }));
      // Se ordena aquí para no necesitar un índice compuesto en Firestore
      lista.sort(
        (a, b) =>
          a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre)
      );
      onData(lista);
    },
    onError
  );
}

// Precios de ejemplo: ajústenlos a los reales de la cafetería
const EJEMPLO: Omit<Producto, 'id'>[] = [
  { nombre: 'Café americano', descripcion: 'Taza de 12 oz', precio: 25, categoria: 'Bebidas', disponible: true },
  { nombre: 'Capuchino', descripcion: 'Con espuma de leche', precio: 35, categoria: 'Bebidas', disponible: true },
  { nombre: 'Té caliente', descripcion: 'Manzanilla, menta o canela', precio: 20, categoria: 'Bebidas', disponible: true },
  { nombre: 'Jugo natural', descripcion: 'Naranja o zanahoria', precio: 28, categoria: 'Bebidas', disponible: true },
  { nombre: 'Agua embotellada', descripcion: '600 ml', precio: 15, categoria: 'Bebidas', disponible: true },
  { nombre: 'Torta de jamón', descripcion: 'Con frijoles, aguacate y queso', precio: 45, categoria: 'Comida', disponible: true },
  { nombre: 'Sándwich', descripcion: 'Jamón y queso, pan integral', precio: 40, categoria: 'Comida', disponible: true },
  { nombre: 'Chilaquiles', descripcion: 'Rojos o verdes, con pollo', precio: 55, categoria: 'Comida', disponible: true },
  { nombre: 'Burrito', descripcion: 'De frijol con queso o de carne', precio: 40, categoria: 'Comida', disponible: false },
  { nombre: 'Galletas', descripcion: 'Paquete individual', precio: 15, categoria: 'Snacks', disponible: true },
  { nombre: 'Papas fritas', descripcion: 'Bolsa chica', precio: 18, categoria: 'Snacks', disponible: true },
  { nombre: 'Yogurt con granola', descripcion: 'Vaso de 200 ml', precio: 28, categoria: 'Snacks', disponible: true },
];

export async function cargarProductosEjemplo() {
  const batch = writeBatch(db);
  EJEMPLO.forEach((p) => batch.set(doc(collection(db, 'products')), p));
  await batch.commit();
}

export async function cambiarDisponibilidad(id: string, disponible: boolean) {
  await updateDoc(doc(db, 'products', id), { disponible });
}

export async function crearProducto(p: Omit<Producto, 'id'>) {
  await addDoc(collection(db, 'products'), p);
}