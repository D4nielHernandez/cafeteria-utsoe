import { useEffect, useState } from 'react';
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { EstadoPedido, Pedido } from '../models/types';
import { mensajeError } from '../services/authService';
import { suscribirMisPedidos } from '../services/orderService';

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

const Pedidos: React.FC = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const cancelar = suscribirMisPedidos(
      user.uid,
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
    return cancelar;
  }, [user]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis pedidos</IonTitle>
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

        {!cargando && !error && pedidos.length === 0 && (
          <p className="ion-padding ion-text-center">Aún no has realizado pedidos.</p>
        )}

        {pedidos.map((p) => (
          <IonCard key={p.id}>
            <IonCardHeader>
              <IonCardSubtitle>
                {p.creadoEn ? p.creadoEn.toDate().toLocaleString('es-MX') : 'Enviando…'}
              </IonCardSubtitle>
              <IonCardTitle>
                Pedido #{p.id.slice(0, 6).toUpperCase()}{' '}
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
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Pedidos;