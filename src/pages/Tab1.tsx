import { useEffect, useMemo, useState } from 'react';
import {
  IonBadge,
  IonButton,
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
  IonToolbar,
} from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { Producto } from '../models/types';
import { mensajeError } from '../services/authService';
import { cargarProductosEjemplo, suscribirProductos } from '../services/productService';

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const Tab1: React.FC = () => {
  const { perfil } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [cargandoEjemplo, setCargandoEjemplo] = useState(false);

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
            <IonItem key={p.id} disabled={!p.disponible}>
              <IonLabel>
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
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;