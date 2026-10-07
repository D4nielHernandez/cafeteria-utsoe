import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { ProductoOFF } from '../models/types';
import { codigoValido, consultarProducto, mensajeErrorApi } from '../services/foodFactsService';

interface Props {
  abierto: boolean;
  codigoInicial?: string;
  onCerrar: () => void;
}

const COLOR_NUTRISCORE: Record<string, string> = {
  a: 'success',
  b: 'success',
  c: 'warning',
  d: 'warning',
  e: 'danger',
};

const fmt = (n: number | null, unidad: string) =>
  n === null ? '—' : `${Math.round(n * 10) / 10} ${unidad}`;

const InfoNutricional: React.FC<Props> = ({ abierto, codigoInicial, onCerrar }) => {
  const [codigo, setCodigo] = useState('');
  const [producto, setProducto] = useState<ProductoOFF | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const peticion = useRef(0);

  const buscar = useCallback(async (c: string) => {
    const id = ++peticion.current;
    setError('');
    setProducto(null);
    setNoEncontrado(false);

    if (!codigoValido(c)) {
      setError('Escribe un código de barras válido (solo números, de 8 a 14 dígitos).');
      return;
    }

    setCargando(true);
    try {
      const r = await consultarProducto(c);
      if (id !== peticion.current) return; // llegó una respuesta vieja: se ignora
      if (r) setProducto(r);
      else setNoEncontrado(true);
    } catch (e) {
      if (id !== peticion.current) return;
      setError(mensajeErrorApi(e));
    } finally {
      if (id === peticion.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!abierto) return;
    peticion.current++;
    setProducto(null);
    setNoEncontrado(false);
    setError('');
    setCargando(false);
    setCodigo(codigoInicial ?? '');
    if (codigoInicial) buscar(codigoInicial);
  }, [abierto, codigoInicial, buscar]);

  const filas: [string, string][] = producto
    ? [
        ['Energía', fmt(producto.nutrientes.energiaKcal, 'kcal')],
        ['Grasas', fmt(producto.nutrientes.grasas, 'g')],
        ['Grasas saturadas', fmt(producto.nutrientes.grasasSaturadas, 'g')],
        ['Carbohidratos', fmt(producto.nutrientes.carbohidratos, 'g')],
        ['Azúcares', fmt(producto.nutrientes.azucares, 'g')],
        ['Proteínas', fmt(producto.nutrientes.proteinas, 'g')],
        ['Sal', fmt(producto.nutrientes.sal, 'g')],
      ]
    : [];

  return (
    <IonModal isOpen={abierto} onDidDismiss={onCerrar}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Información nutricional</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onCerrar}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonInput
          label="Código de barras"
          labelPlacement="floating"
          fill="outline"
          inputmode="numeric"
          maxlength={14}
          value={codigo}
          onIonInput={(e) => setCodigo((e.detail.value ?? '').replace(/\D/g, ''))}
        />
        <IonButton
          className="ion-margin-top"
          expand="block"
          disabled={cargando}
          onClick={() => buscar(codigo)}
        >
          Consultar
        </IonButton>

        {cargando && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        )}

        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}

        {noEncontrado && (
          <p>
            Este producto no está en la base de datos de Open Food Facts. Revisa que el código
            esté bien escrito.
          </p>
        )}

        {producto && (
          <>
            {producto.imagen && (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                style={{ maxHeight: 160, display: 'block', margin: '16px auto' }}
              />
            )}
            <h2>{producto.nombre}</h2>
            <p>
              {[producto.marca, producto.cantidad].filter(Boolean).join(' · ') ||
                'Sin marca registrada'}
            </p>

            <p>
              {producto.nutriscore ? (
                <IonBadge color={COLOR_NUTRISCORE[producto.nutriscore]}>
                  Nutri-Score {producto.nutriscore.toUpperCase()}
                </IonBadge>
              ) : (
                <IonBadge color="medium">Nutri-Score no disponible</IonBadge>
              )}{' '}
              {producto.nova !== null && (
                <IonBadge color="tertiary">NOVA {producto.nova}</IonBadge>
              )}
            </p>

            <h3>Por cada 100 g o 100 ml</h3>
            <IonList>
              {filas.map(([nombre, valor]) => (
                <IonItem key={nombre}>
                  <IonLabel>{nombre}</IonLabel>
                  <IonNote slot="end">{valor}</IonNote>
                </IonItem>
              ))}
            </IonList>

            {producto.alergenos.length > 0 && (
              <p>
                <strong>Alérgenos:</strong> {producto.alergenos.join(', ')}
              </p>
            )}
            {producto.ingredientes && (
              <p>
                <strong>Ingredientes:</strong> {producto.ingredientes}
              </p>
            )}
          </>
        )}

        <IonNote className="ion-margin-top" style={{ display: 'block' }}>
          Datos de Open Food Facts (licencia ODbL). Es información colaborativa y puede contener
          errores: revisa siempre la etiqueta del producto.
        </IonNote>
      </IonContent>
    </IonModal>
  );
};

export default InfoNutricional;