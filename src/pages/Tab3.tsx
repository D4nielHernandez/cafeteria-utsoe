import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { cerrarSesion } from '../services/authService';

const Tab3: React.FC = () => {
  const { user, perfil } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel>
              <p>Nombre</p>
              <h2>{perfil?.nombre ?? '—'}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>Correo</p>
              <h2>{user?.email ?? '—'}</h2>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <p>Rol</p>
              <h2>{perfil?.role ?? '—'}</h2>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonButton
          className="ion-margin-top"
          expand="block"
          color="danger"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;