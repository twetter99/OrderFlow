
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getFirstAccessibleRoute, allPermissions } from '@/lib/permissions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  logOut: async () => {},
  sendPasswordReset: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    
    // --- MODO DESARROLLADOR CON ACCESO DIRECTO ---
    if (process.env.NODE_ENV === 'development') {
      const handleDevLogin = async () => {
        try {
          // Iniciar sesión con credenciales de desarrollo para obtener una sesión real
          await signInWithEmailAndPassword(auth, 'juan@winfin.es', 'h8QJsx');
          // El listener onAuthStateChanged se encargará del resto
        } catch (error) {
          console.error("Error en el inicio de sesión automático de desarrollo:", error);
          toast({ 
            variant: "destructive", 
            title: "Error de Desarrollo", 
            description: "No se pudo iniciar sesión automáticamente. Revisa las credenciales en auth-context.tsx o las reglas de seguridad de Firebase." 
          });
          setLoading(false);
        }
      };
      
      handleDevLogin();
    }

    // --- Listener de autenticación normal ---
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
                const userData = { uid: userDoc.id, ...userDoc.data() } as User;
                setUser(userData);
            } else {
                console.warn(`Usuario con UID ${firebaseUser.uid} no encontrado en Firestore. Usando datos de dev.`);
                // Si el usuario no existe en Firestore (común en el primer login de dev), creamos un mock
                const devUser: User = {
                    uid: firebaseUser.uid,
                    personId: 'dev-admin',
                    name: 'Dev Admin',
                    email: 'dev@orderflow.test',
                    phone: '600000000',
                    permissions: allPermissions,
                    role: 'Administrador'
                };
                setUser(devUser);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            await signOut(auth);
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged se encargará del resto
    } catch (error: any) {
       let title = "Error de autenticación";
       let description = "No se pudo iniciar sesión. Por favor, inténtalo de nuevo.";
       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = 'El correo electrónico o la contraseña son incorrectos.';
       }
       toast({ variant: "destructive", title, description });
       setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
     try {
        await sendPasswordResetEmail(auth, email);
        toast({ title: 'Correo enviado', description: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
    } catch (error: any) {
        console.error("Password reset error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar el correo de restablecimiento.' });
    }
  }

  const logOut = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    router.push('/login');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, logOut, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
