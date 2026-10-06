import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export async function registrar(nombre: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // El rol siempre inicia como 'cliente' (así lo exigen las reglas de Firestore)
  await setDoc(doc(db, 'users', cred.user.uid), {
    nombre,
    email,
    role: 'cliente',
    creadoEn: serverTimestamp(),
  });
}

export async function iniciarSesion(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function cerrarSesion() {
  await signOut(auth);
}

export function mensajeError(e: unknown): string {
  const code = e instanceof FirebaseError ? e.code : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión a Internet. Revisa tu red.';
    case 'permission-denied':
      return 'No tienes permiso para realizar esta acción.';
    default:
      return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }
}