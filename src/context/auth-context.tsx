
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

const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

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
  const [loading, setLoading] = useState<boolean>(true);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleDevLogin = async () => {
      try {
        await signInWithEmailAndPassword(auth, 'juan@winfin.es', 'h8QJsx');
        // onAuthStateChanged se encargará del resto
      } catch (error) {
        console.error("Error en el login automático de desarrollo:", error);
        toast({
          variant: "destructive",
          title: "Error de Acceso en Desarrollo",
          description: "No se pudo iniciar sesión con las credenciales de desarrollo. Revisa que el usuario exista y la contraseña sea correcta."
        });
        setLoading(false); // Detener la carga si el login falla para no bloquear la app
      }
    };

    if (isDevMode && !auth.currentUser) {
      handleDevLogin();
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
                const userData = { uid: userDoc.id, ...userDoc.data() } as User;
                setUser(userData);
                if (window.location.pathname === '/login' || window.location.pathname === '/') {
                  const targetRoute = getFirstAccessibleRoute(userData.permissions || []);
                  router.push(targetRoute);
                }
            } else {
                const devUser: User = {
                  uid: firebaseUser.uid,
                  personId: firebaseUser.uid,
                  name: 'Dev Admin',
                  email: firebaseUser.email || 'dev@orderflow.com',
                  permissions: allPermissions,
                  isDev: true,
                };
                setUser(devUser);
                if (window.location.pathname === '/login' || window.location.pathname === '/') {
                    router.push('/dashboard');
                }
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

    if (!isDevMode) {
      return () => unsubscribe();
    }
    // Para dev, el listener se queda activo.
    return () => unsubscribe();
  }, [router, toast]);
  
  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
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
    try {
        await signOut(auth);
        setUser(null);
        router.push('/login');
    } catch (error) {
        console.error("Error signing out:", error);
    } finally {
        setLoading(false);
    }
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
