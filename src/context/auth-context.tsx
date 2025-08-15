
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

// Determina el modo de desarrollo de forma síncrona
const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// Crea el usuario de desarrollo fuera del componente para que sea consistente
const devUser: User = {
  uid: 'dev-admin-uid',
  personId: 'dev-admin-uid',
  name: 'Dev Admin',
  email: 'dev@orderflow.com',
  phone: '600000000',
  permissions: allPermissions,
  isDev: true,
};

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
  // Inicializa el estado basándose en el modo de desarrollo de forma síncrona
  const [user, setUser] = useState<User | null>(isDevMode ? devUser : null);
  const [loading, setLoading] = useState<boolean>(!isDevMode);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Si estamos en modo desarrollo, no hacemos nada con Firebase Auth.
    if (isDevMode) return;

    // Listener de estado de autenticación normal para producción
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
                console.error(`Usuario con UID ${firebaseUser.uid} autenticado pero no encontrado en Firestore. Se cerrará la sesión.`);
                await signOut(auth);
                setUser(null);
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
  }, [router]);
  
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
    // Si estamos en modo desarrollo, simplemente reseteamos el estado local
    if (isDevMode) {
      setUser(null);
      router.push('/login');
      return;
    }
    
    // En producción, cerramos la sesión de Firebase
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
