import { ProductoOFF } from '../models/types';

const BASE = 'https://world.openfoodfacts.org/api/v2/product';
const CAMPOS = [
  'product_name',
  'product_name_es',
  'brands',
  'quantity',
  'serving_size',
  'image_front_small_url',
  'nutriscore_grade',
  'nova_group',
  'ingredients_text',
  'ingredients_text_es',
  'allergens_tags',
  'nutriments',
].join(',');

const TIEMPO_MAXIMO_MS = 10000;
const cache = new Map<string, ProductoOFF>();

export function codigoValido(codigo: string): boolean {
  return /^\d{8,14}$/.test(codigo.trim());
}

function texto(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function numero(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizar(codigo: string, p: Record<string, unknown>): ProductoOFF {
  const n = (p.nutriments ?? {}) as Record<string, unknown>;
  const grado = texto(p.nutriscore_grade).toLowerCase();
  const alergenos = Array.isArray(p.allergens_tags)
    ? (p.allergens_tags as unknown[])
        .filter((a): a is string => typeof a === 'string')
        .map((a) => a.replace(/^[a-z]{2}:/, ''))
    : [];

  return {
    codigo,
    nombre: texto(p.product_name_es) || texto(p.product_name) || 'Producto sin nombre',
    marca: texto(p.brands),
    cantidad: texto(p.quantity),
    porcion: texto(p.serving_size),
    imagen: texto(p.image_front_small_url),
    nutriscore: /^[a-e]$/.test(grado) ? grado : null,
    nova: numero(p.nova_group),
    ingredientes: texto(p.ingredients_text_es) || texto(p.ingredients_text),
    alergenos,
    nutrientes: {
      energiaKcal: numero(n['energy-kcal_100g']),
      grasas: numero(n['fat_100g']),
      grasasSaturadas: numero(n['saturated-fat_100g']),
      carbohidratos: numero(n['carbohydrates_100g']),
      azucares: numero(n['sugars_100g']),
      proteinas: numero(n['proteins_100g']),
      sal: numero(n['salt_100g']),
    },
  };
}

/** Devuelve el producto, o null si el código no existe en Open Food Facts. */
export async function consultarProducto(codigo: string): Promise<ProductoOFF | null> {
  const limpio = codigo.trim();
  if (!codigoValido(limpio)) throw new Error('CODIGO_INVALIDO');

  const guardado = cache.get(limpio);
  if (guardado) return guardado;

  if (!navigator.onLine) throw new Error('SIN_RED');

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  try {
    const res = await fetch(`${BASE}/${limpio}.json?fields=${CAMPOS}`, {
      signal: controlador.signal,
    });

    if (res.status === 404) return null;
    if (res.status === 429) throw new Error('LIMITE');
    if (!res.ok) throw new Error('SERVIDOR');

    const datos = (await res.json()) as { status?: number; product?: Record<string, unknown> };
    if (datos.status !== 1 || !datos.product) return null;

    const producto = normalizar(limpio, datos.product);
    cache.set(limpio, producto);
    return producto;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw new Error('TIEMPO_AGOTADO');
    if (e instanceof TypeError) throw new Error('SIN_RED');
    throw e;
  } finally {
    clearTimeout(temporizador);
  }
}

export function mensajeErrorApi(e: unknown): string {
  const clave = e instanceof Error ? e.message : '';
  switch (clave) {
    case 'CODIGO_INVALIDO':
      return 'Escribe un código de barras válido (solo números, de 8 a 14 dígitos).';
    case 'SIN_RED':
      return 'Sin conexión a Internet. Revisa tu red.';
    case 'TIEMPO_AGOTADO':
      return 'El servicio tardó demasiado en responder. Inténtalo de nuevo.';
    case 'LIMITE':
      return 'Demasiadas consultas seguidas. Espera un momento e inténtalo de nuevo.';
    case 'SERVIDOR':
      return 'El servicio de información nutricional no está disponible por ahora.';
    default:
      return 'No se pudo consultar la información. Inténtalo de nuevo.';
  }
}