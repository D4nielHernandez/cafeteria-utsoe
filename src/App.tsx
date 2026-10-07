import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonBadge,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonSpinner,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { cart, person, receipt, restaurant } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab3 from './pages/Tab3';
import Carrito from './pages/Carrito';
import Pedidos from './pages/Pedidos';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const Contenido: React.FC = () => {
  const { user, cargando } = useAuth();
  const { cantidadTotal } = useCart();

  if (cargando) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <IonSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    );
  }

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/tab1" element={<Tab1 />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/tab3" element={<Tab3 />} />
          <Route path="/login" element={<Navigate to="/tab1" replace />} />
          <Route path="/" element={<Navigate to="/tab1" replace />} />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/tab1">
            <IonIcon aria-hidden="true" icon={restaurant} />
            <IonLabel>Menú</IonLabel>
          </IonTabButton>
          <IonTabButton tab="carrito" href="/carrito">
            <IonIcon aria-hidden="true" icon={cart} />
            <IonLabel>Carrito</IonLabel>
            {cantidadTotal > 0 && <IonBadge color="danger">{cantidadTotal}</IonBadge>}
          </IonTabButton>
          <IonTabButton tab="pedidos" href="/pedidos">
            <IonIcon aria-hidden="true" icon={receipt} />
            <IonLabel>Pedidos</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" href="/tab3">
            <IonIcon aria-hidden="true" icon={person} />
            <IonLabel>Perfil</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <CartProvider>
        <Contenido />
      </CartProvider>
    </AuthProvider>
  </IonApp>
);

export default App;