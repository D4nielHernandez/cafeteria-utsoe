import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Usuario } from '../models/types';

interface AuthContextValue {
  user: User | null;
  perfil: Usuario | null;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  perfil: null,
  cargando: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelarPerfil: (() => void) | null = null;

    const cancelarAuth = onAuthStateChanged(auth, (u) => {
      cancelarPerfil?.();
      cancelarPerfil = null;
      setUser(u);

      if (!u) {
        setPerfil(null);
        setCargando(false);
        return;
      }

      cancelarPerfil = onSnapshot(
        doc(db, 'users', u.uid),
        (snap) => {
          setPerfil(
            snap.exists()
              ? { uid: u.uid, ...(snap.data() as Omit<Usuario, 'uid'>) }
              : null
          );
          setCargando(false);
        },
        () => setCargando(false)
      );
    });

    return () => {
      cancelarAuth();
      cancelarPerfil?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, perfil, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);