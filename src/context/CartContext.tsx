import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ItemPedido, Producto } from '../models/types';
import { useAuth } from './AuthContext';

const MAX_POR_PRODUCTO = 10;

interface CartContextValue {
  items: ItemPedido[];
  total: number;
  cantidadTotal: number;
  agregar: (p: Producto) => void;
  cambiarCantidad: (productId: string, delta: number) => void;
  quitar: (productId: string) => void;
  vaciar: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  total: 0,
  cantidadTotal: 0,
  agregar: () => {},
  cambiarCantidad: () => {},
  quitar: () => {},
  vaciar: () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemPedido[]>([]);

  useEffect(() => {
    setItems([]);
  }, [user?.uid]);

  const agregar = useCallback((p: Producto) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.productId === p.id);
      if (existente) {
        return prev.map((i) =>
          i.productId === p.id
            ? { ...i, cantidad: Math.min(i.cantidad + 1, MAX_POR_PRODUCTO) }
            : i
        );
      }
      return [...prev, { productId: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 }];
    });
  }, []);

  const cambiarCantidad = useCallback((productId: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, cantidad: Math.min(Math.max(i.cantidad + delta, 1), MAX_POR_PRODUCTO) }
          : i
      )
    );
  }, []);

  const quitar = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((suma, i) => suma + i.precio * i.cantidad, 0),
    [items]
  );
  const cantidadTotal = useMemo(
    () => items.reduce((suma, i) => suma + i.cantidad, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, total, cantidadTotal, agregar, cambiarCantidad, quitar, vaciar }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);