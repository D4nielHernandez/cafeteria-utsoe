import { useEffect, useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { EstadoPedido, Pedido, Producto } from '../models/types';
import { mensajeError } from '../services/authService';
import { actualizarEstado, suscribirTodosPedidos } from '../services/orderService';
import {
  cambiarDisponibilidad,
  crearProducto,
  suscribirProductos,
} from '../services/productService';

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const colores: Record<EstadoPedido, string> = {
  pendiente: 'warning',
  preparando: 'primary',
  listo: 'success',
  entregado: 'medium',
  cancelado: 'danger',
};

const etiquetas: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  listo: 'Listo para recoger',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const siguiente: Partial<Record<EstadoPedido, EstadoPedido>> = {
  pendiente: 'preparando',
  preparando: 'listo',
  listo: 'entregado',
};

const ACTIVOS: EstadoPedido[] = ['pendiente', 'preparando', 'listo'];

type Vista = 'pedidos' | 'productos';
type Filtro = 'activos' | 'historial';

const Admin: React.FC = () => {
  const [vista, setVista] = useState<Vista>('pedidos');
  const [filtro, setFiltro] = useState<Filtro>('activos');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarToast] = useIonToast();
  const [mostrarAlerta] = useIonAlert();

  useEffect(() => {
    const cancelarPedidos = suscribirTodosPedidos(
      (lista) => {
        setPedidos(lista);
        setError('');
        setCargando(false);
      },
      (e) => {
        setError(mensajeError(e));
        setCargando(false);
      }
    );
    const cancelarProductos = suscribirProductos(setProductos, (e) => setError(mensajeError(e)));
    return () => {
      cancelarPedidos();
      cancelarProductos();
    };
  }, []);

  const aviso = (message: string, color: 'success' | 'danger' = 'danger') =>
    mostrarToast({ message, duration: 2000, color, position: 'top' });

  const ejecutar = async (accion: () => Promise<void>) => {
    if (!navigator.onLine) {
      aviso('Sin conexión a Internet. Revisa tu red.');
      return;
    }
    try {
      await accion();
    } catch (e) {
      aviso(mensajeError(e));
    }
  };

  const cambiarEstado = (p: Pedido, estado: EstadoPedido) =>
    ejecutar(() => actualizarEstado(p.id, estado));

  const confirmarCancelacion = (p: Pedido) =>
    mostrarAlerta({
      header: 'Cancelar pedido',
      message: `¿Cancelar el pedido de ${p.userNombre || 'este usuario'}?`,
      buttons: [
        'No',
        { text: 'Sí, cancelar', role: 'destructive', handler: () => cambiarEstado(p, 'cancelado') },
      ],
    });

  const nuevoProducto = () =>
    mostrarAlerta({
      header: 'Nuevo producto',
      inputs: [
        { name: 'nombre', placeholder: 'Nombre' },
        { name: 'descripcion', placeholder: 'Descripción' },
        { name: 'precio', type: 'number', placeholder: 'Precio (MXN)', min: 1 },
        { name: 'categoria', placeholder: 'Categoría (Bebidas, Comida, Snacks)' },
      ],
      buttons: [
        'Cancelar',
        {
          text: 'Guardar',
          handler: (d: Record<string, string>) => {
            const nombre = (d.nombre ?? '').trim();
            const categoria = (d.categoria ?? '').trim();
            const precio = Number(d.precio);
            if (!nombre || !categoria || !Number.isFinite(precio) || precio <= 0) {
              aviso('Revisa los datos: nombre, categoría y un precio mayor a 0.');
              return false; // mantiene la ventana abierta
            }
            ejecutar(async () => {
              await crearProducto({
                nombre,
                descripcion: (d.descripcion ?? '').trim(),
                precio,
                categoria,
                disponible: true,
              });
              aviso('Producto agregado', 'success');
            });
            return true;
          },
        },
      ],
    });

  const visibles = pedidos.filter((p) =>
    filtro === 'activos' ? ACTIVOS.includes(p.status) : !ACTIVOS.includes(p.status)
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Administración</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={vista} onIonChange={(e) => setVista(e.detail.value as Vista)}>
            <IonSegmentButton value="pedidos">
              <IonLabel>Pedidos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="productos">
              <IonLabel>Productos</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {cargando && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        )}

        {error && (
          <IonText color="danger">
            <p className="ion-padding">{error}</p>
          </IonText>
        )}

        {vista === 'pedidos' && !error && (
          <>
            <IonSegment
              className="ion-padding-horizontal"
              value={filtro}
              onIonChange={(e) => setFiltro(e.detail.value as Filtro)}
            >
              <IonSegmentButton value="activos">
                <IonLabel>Activos</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="historial">
                <IonLabel>Historial</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            {!cargando && visibles.length === 0 && (
              <p className="ion-padding ion-text-center">No hay pedidos en esta sección.</p>
            )}

            {visibles.map((p) => (
              <IonCard key={p.id}>
                <IonCardHeader>
                  <IonCardSubtitle>
                    {p.creadoEn ? p.creadoEn.toDate().toLocaleString('es-MX') : 'Enviando…'}
                  </IonCardSubtitle>
                  <IonCardTitle>
                    {p.userNombre || 'Sin nombre'}{' '}
                    <IonBadge color={colores[p.status]}>{etiquetas[p.status] ?? p.status}</IonBadge>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {p.items.map((i) => (
                    <div key={i.productId}>
                      {i.cantidad} × {i.nombre}
                    </div>
                  ))}
                  <p className="ion-margin-top">
                    <strong>Total: {moneda.format(p.total)}</strong>
                  </p>

                  {siguiente[p.status] && (
                    <IonButton onClick={() => cambiarEstado(p, siguiente[p.status]!)}>
                      Marcar: {etiquetas[siguiente[p.status]!]}
                    </IonButton>
                  )}
                  {ACTIVOS.includes(p.status) && (
                    <IonButton color="danger" fill="outline" onClick={() => confirmarCancelacion(p)}>
                      Cancelar
                    </IonButton>
                  )}
                </IonCardContent>
              </IonCard>
            ))}
          </>
        )}

        {vista === 'productos' && !error && (
          <>
            <div className="ion-padding">
              <IonButton expand="block" onClick={nuevoProducto}>
                Agregar producto
              </IonButton>
            </div>
            <IonList>
              {productos.map((p) => (
                <IonItem key={p.id}>
                  <IonLabel>
                    <h2>{p.nombre}</h2>
                    <p>
                      {p.categoria} · {moneda.format(p.precio)}
                    </p>
                  </IonLabel>
                  <IonToggle
                    checked={p.disponible}
                    onIonChange={(e) => {
                      // Evita escrituras redundantes cuando el cambio viene de Firestore
                      if (e.detail.checked !== p.disponible) {
                        ejecutar(() => cambiarDisponibilidad(p.id, e.detail.checked));
                      }
                    }}
                  >
                    Disponible
                  </IonToggle>
                </IonItem>
              ))}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Admin;