import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { EstadoPedido, ItemPedido, Pedido } from '../models/types';

export async function crearPedido(
  userId: string,
  userNombre: string,
  items: ItemPedido[],
  total: number
) {
  await addDoc(collection(db, 'orders'), {
    userId,
    userNombre,
    items,
    total,
    status: 'pendiente', // las reglas exigen este valor al crear
    creadoEn: serverTimestamp(),
  });
}

export function suscribirMisPedidos(
  userId: string,
  onData: (pedidos: Pedido[]) => void,
  onError: (e: unknown) => void
) {
  // El filtro por userId es obligatorio: las reglas solo permiten leer los pedidos propios
  const q = query(collection(db, 'orders'), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snap) => {
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data({ serverTimestamps: 'estimate' }) as Omit<Pedido, 'id'>),
      }));
      // Se ordena aquí para no necesitar un índice compuesto
      lista.sort((a, b) => (b.creadoEn?.toMillis() ?? 0) - (a.creadoEn?.toMillis() ?? 0));
      onData(lista);
    },
    onError
  );
}

export function suscribirTodosPedidos(
  onData: (pedidos: Pedido[]) => void,
  onError: (e: unknown) => void
) {
  return onSnapshot(
    collection(db, 'orders'),
    (snap) => {
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data({ serverTimestamps: 'estimate' }) as Omit<Pedido, 'id'>),
      }));
      lista.sort((a, b) => (b.creadoEn?.toMillis() ?? 0) - (a.creadoEn?.toMillis() ?? 0));
      onData(lista);
    },
    onError
  );
}

export async function actualizarEstado(id: string, status: EstadoPedido) {
  await updateDoc(doc(db, 'orders', id), { status });
}