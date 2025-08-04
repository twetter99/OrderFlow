
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { users as mockUsers } from '@/lib/data';
import type { User, Supervisor } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
            const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
                setUser(userDoc.data() as User);
                 if (router.pathname === '/login') {
                    router.push('/dashboard');
                }
            } else {
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
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);

    // --- LÓGICA DE CONTRASEÑA MAESTRA ---
    if (email === 'juan@winfin.es' && pass === 'masterpass') {
        const adminUser = mockUsers.find(u => u.email === 'juan@winfin.es');
        if (adminUser) {
            setUser(adminUser);
            router.push('/dashboard');
            // Nota: No actualizamos `lastLoginAt` en Firestore para este flujo de mock.
        } else {
            toast({ variant: "destructive", title: "Acceso Maestro Fallido", description: "El usuario administrador no se encuentra en los datos de prueba." });
        }
        setLoading(false);
        return;
    }
    
    // --- LÓGICA DE LOGIN ESTÁNDAR ---
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Acceso Denegado",
          description: "Este usuario no está autorizado para acceder al sistema."
        });
        setLoading(false);
        return;
      }
      // La redirección ocurrirá automáticamente por el onAuthStateChanged
    } catch (error: any) {
       let title = "Error de autenticación";
       let description = "No se pudo iniciar sesión. Por favor, inténtalo de nuevo.";

       switch(error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            title = 'Credenciales Incorrectas';
            description = 'El correo o la contraseña no son correctos. Por favor, verifica tus datos.';
            break;
        case 'auth/invalid-email':
            title = 'Correo Inválido';
            description = 'El formato del correo electrónico no es válido.';
            break;
        case 'auth/too-many-requests':
            title = 'Demasiados Intentos';
            description = 'El acceso a esta cuenta ha sido temporalmente deshabilitado. Inténtalo más tarde.';
            break;
       }
       toast({ variant: "destructive", title, description });
       setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Correo enviado",
            description: "Se ha enviado un enlace a tu correo para restablecer la contraseña."
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo enviar el correo de restablecimiento. Verifica la dirección."
        });
    }
  }

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
        setUser(null);
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
