import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import { addCircleOutline, removeCircleOutline, trashOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { mensajeError } from '../services/authService';
import { crearPedido } from '../services/orderService';

const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const Carrito: React.FC = () => {
  const { user, perfil } = useAuth();
  const { items, total, cambiarCantidad, quitar, vaciar } = useCart();
  const navigate = useNavigate();
  const [mostrarToast] = useIonToast();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const confirmar = async () => {
    if (!user || items.length === 0) return;
    setError('');

    if (!navigator.onLine) {
      setError('Sin conexión a Internet. Revisa tu red e inténtalo de nuevo.');
      return;
    }

    setEnviando(true);
    try {
      await crearPedido(user.uid, perfil?.nombre ?? '', items, total);
      vaciar();
      mostrarToast({
        message: 'Pedido enviado correctamente',
        duration: 1800,
        color: 'success',
        position: 'top',
      });
      navigate('/pedidos');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carrito</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {items.length === 0 ? (
          <p className="ion-padding ion-text-center">
            Tu carrito está vacío. Agrega productos desde el menú.
          </p>
        ) : (
          <IonList>
            {items.map((i) => (
              <IonItem key={i.productId}>
                <IonLabel>
                  <h2>{i.nombre}</h2>
                  <p>
                    {moneda.format(i.precio)} × {i.cantidad} ={' '}
                    <strong>{moneda.format(i.precio * i.cantidad)}</strong>
                  </p>
                </IonLabel>
                <IonButtons slot="end">
                  <IonButton
                    aria-label={`Quitar una unidad de ${i.nombre}`}
                    disabled={i.cantidad <= 1}
                    onClick={() => cambiarCantidad(i.productId, -1)}
                  >
                    <IonIcon slot="icon-only" icon={removeCircleOutline} />
                  </IonButton>
                  <IonButton
                    aria-label={`Agregar una unidad de ${i.nombre}`}
                    onClick={() => cambiarCantidad(i.productId, 1)}
                  >
                    <IonIcon slot="icon-only" icon={addCircleOutline} />
                  </IonButton>
                  <IonButton
                    color="danger"
                    aria-label={`Eliminar ${i.nombre} del carrito`}
                    onClick={() => quitar(i.productId)}
                  >
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                </IonButtons>
              </IonItem>
            ))}
          </IonList>
        )}

        {error && (
          <IonText color="danger">
            <p className="ion-padding">{error}</p>
          </IonText>
        )}
      </IonContent>

      {items.length > 0 && (
        <IonFooter>
          <IonToolbar className="ion-padding-horizontal">
            <IonTitle>Total: {moneda.format(total)}</IonTitle>
            <IonButton slot="end" disabled={enviando} onClick={confirmar}>
              {enviando ? <IonSpinner name="crescent" /> : 'Confirmar pedido'}
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default Carrito;