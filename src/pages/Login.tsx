import { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonInput,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { iniciarSesion, mensajeError, registrar } from '../services/authService';

type Modo = 'login' | 'registro';

const Login: React.FC = () => {
  const [modo, setModo] = useState<Modo>('login');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    if (modo === 'registro') {
      if (!nombre.trim()) {
        setError('Escribe tu nombre.');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    setEnviando(true);
    try {
      if (modo === 'login') {
        await iniciarSesion(email.trim(), password);
      } else {
        await registrar(nombre.trim(), email.trim(), password);
      }
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h1 className="ion-text-center">Cafetería UTSOE</h1>

        <IonSegment
          value={modo}
          onIonChange={(e) => {
            setModo(e.detail.value as Modo);
            setError('');
          }}
        >
          <IonSegmentButton value="login">
            <IonLabel>Iniciar sesión</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="registro">
            <IonLabel>Registrarme</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {modo === 'registro' && (
          <IonInput
            className="ion-margin-top"
            label="Nombre"
            labelPlacement="floating"
            fill="outline"
            value={nombre}
            onIonInput={(e) => setNombre(e.detail.value ?? '')}
          />
        )}

        <IonInput
          className="ion-margin-top"
          label="Correo electrónico"
          labelPlacement="floating"
          fill="outline"
          type="email"
          value={email}
          onIonInput={(e) => setEmail(e.detail.value ?? '')}
        />

        <IonInput
          className="ion-margin-top"
          label="Contraseña"
          labelPlacement="floating"
          fill="outline"
          type="password"
          value={password}
          onIonInput={(e) => setPassword(e.detail.value ?? '')}
        />

        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}

        <IonButton
          className="ion-margin-top"
          expand="block"
          disabled={enviando}
          onClick={enviar}
        >
          {enviando ? (
            <IonSpinner name="crescent" />
          ) : modo === 'login' ? (
            'Iniciar sesión'
          ) : (
            'Crear cuenta'
          )}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;