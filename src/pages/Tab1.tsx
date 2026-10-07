import { useEffect, useMemo, useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { addCircleOutline, barcodeOutline, informationCircleOutline } from 'ionicons/icons';
import InfoNutricional from '../components/InfoNutricional';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Producto } from '../models/types';
import { mensajeError } from '../services/authService';
import { cargarProductosEjemplo, suscribirProductos } from '../services/productService';

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const Tab1: React.FC = () => {
  const { perfil } = useAuth();
  const { agregar } = useCart();
  const [mostrarToast] = useIonToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [cargandoEjemplo, setCargandoEjemplo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [codigoModal, setCodigoModal] = useState<string | undefined>(undefined);

  useEffect(() => {
    const cancelar = suscribirProductos(
      (lista) => {
        setProductos(lista);
        setError('');
        setCargando(false);
      },
      (e) => {
        setError(mensajeError(e));
        setCargando(false);
      }
    );
    return cancelar;
  }, []);

  const categorias = useMemo(
    () => ['Todos', ...Array.from(new Set(productos.map((p) => p.categoria)))],
    [productos]
  );

  const visibles =
    categoria === 'Todos' ? productos : productos.filter((p) => p.categoria === categoria);

  const agregarAlCarrito = (p: Producto) => {
    agregar(p);
    mostrarToast({
      message: `${p.nombre} agregado al carrito`,
      duration: 1200,
      position: 'top',
    });
  };

  const abrirInfo = (codigo?: string) => {
    setCodigoModal(codigo);
    setModalAbierto(true);
  };

  const cargarEjemplo = async () => {
    setCargandoEjemplo(true);
    setError('');
    try {
      await cargarProductosEjemplo();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargandoEjemplo(false);
    }
  };

  const esAdmin = perfil?.role === 'admin';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menú</IonTitle>
          <IonButtons slot="end">
            <IonButton
              aria-label="Consultar un código de barras"
              onClick={() => abrirInfo(undefined)}
            >
              <IonIcon slot="icon-only" icon={barcodeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {productos.length > 0 && (
          <IonToolbar>
            <IonSegment
              scrollable
              value={categoria}
              onIonChange={(e) => setCategoria(String(e.detail.value))}
            >
              {categorias.map((c) => (
                <IonSegmentButton key={c} value={c}>
                  <IonLabel>{c}</IonLabel>
                </IonSegmentButton>
              ))}
            </IonSegment>
          </IonToolbar>
        )}
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

        {!cargando && !error && productos.length === 0 && (
          <div className="ion-padding ion-text-center">
            <p>Aún no hay productos en el menú.</p>
            {esAdmin && (
              <IonButton onClick={cargarEjemplo} disabled={cargandoEjemplo}>
                {cargandoEjemplo ? <IonSpinner name="crescent" /> : 'Cargar productos de ejemplo'}
              </IonButton>
            )}
          </div>
        )}

        <IonList>
          {visibles.map((p) => (
            <IonItem key={p.id}>
              <IonLabel color={p.disponible ? undefined : 'medium'}>
                <h2>{p.nombre}</h2>
                <p>{p.descripcion}</p>
              </IonLabel>
              <div slot="end" className="ion-text-end">
                <strong>{moneda.format(p.precio)}</strong>
                {!p.disponible && (
                  <div>
                    <IonBadge color="medium">Agotado</IonBadge>
                  </div>
                )}
              </div>
              {p.codigoBarras && (
                <IonButton
                  slot="end"
                  fill="clear"
                  aria-label={`Información nutricional de ${p.nombre}`}
                  onClick={() => abrirInfo(p.codigoBarras)}
                >
                  <IonIcon slot="icon-only" icon={informationCircleOutline} />
                </IonButton>
              )}
              {p.disponible && (
                <IonButton
                  slot="end"
                  fill="clear"
                  aria-label={`Agregar ${p.nombre} al carrito`}
                  onClick={() => agregarAlCarrito(p)}
                >
                  <IonIcon slot="icon-only" icon={addCircleOutline} />
                </IonButton>
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>

      <InfoNutricional
        abierto={modalAbierto}
        codigoInicial={codigoModal}
        onCerrar={() => setModalAbierto(false)}
      />
    </IonPage>
  );
};

export default Tab1;