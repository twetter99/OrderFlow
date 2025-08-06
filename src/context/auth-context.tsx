
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User as FirebaseUser,
  setPersistence,
  browserSessionPersistence
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
  signInAsAdminDev: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  logOut: async () => {},
  sendPasswordReset: async () => {},
  signInAsAdminDev: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
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
                    toast({ variant: "destructive", title: "Acceso Denegado", description: "Tu cuenta no está registrada en el sistema." });
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
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error);
        setLoading(false);
      });
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
       let title = "Error de autenticación";
       let description = "No se pudo iniciar sesión. Por favor, inténtalo de nuevo.";

       switch(error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            title = 'Credenciales Incorrectas';
            description = 'El correo o la contraseña no son correctos.';
            break;
        case 'auth/user-disabled':
            title = 'Usuario Deshabilitado';
            description = 'Esta cuenta ha sido deshabilitada por un administrador.';
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

  const signInAsAdminDev = () => {
    setLoading(true);
    const adminUser: User = {
      uid: 'dev-admin-user',
      name: 'Admin (Dev Mode)',
      email: 'dev@orderflow.app',
      permissions: allPermissions,
      role: 'Administrador',
    };
    setUser(adminUser);
    setLoading(false);
    toast({
        title: "Acceso de Desarrollador",
        description: "Has iniciado sesión como Administrador.",
    });
    router.push('/dashboard'); // Redirección explícita
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
      setUser(null); // Clear user state immediately
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, logOut, sendPasswordReset, signInAsAdminDev }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
