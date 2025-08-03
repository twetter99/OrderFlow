
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
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
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

const createUserProfile = async (firebaseUser: FirebaseUser) => {
  const userRef = doc(db, 'usuarios', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  // Only create the user document if it doesn't already exist.
  if (!userSnap.exists()) {
    const userData: Partial<User> = {
      uid: firebaseUser.uid,
      providerId: firebaseUser.providerData[0]?.providerId || 'password',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    if (firebaseUser.email) userData.email = firebaseUser.email;
    
    // For email/password, these fields are often null initially.
    // They might be populated later from a user profile page.
    if (firebaseUser.displayName) userData.name = firebaseUser.displayName;
    if (firebaseUser.photoURL) userData.photoURL = firebaseUser.photoURL;

    await setDoc(userRef, userData, { merge: true });
  } else {
    // If user exists, just update the last login time.
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            await createUserProfile(firebaseUser);
            // Fetch the full user profile from Firestore to get all data (incl. roles, permissions etc. in future)
            const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
            if (userDoc.exists()) {
                setUser(userDoc.data() as User);
            } else {
                // This case is unlikely if createUserProfile works, but good as a fallback
                setUser({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                });
            }
        } catch (error) {
            console.error("Error creating/fetching user profile:", error);
            toast({
                variant: "destructive",
                title: "Error de perfil",
                description: "No se pudo cargar tu perfil de usuario. Por favor, intenta iniciar sesión de nuevo."
            });
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
      router.push('/dashboard');
    } catch (error: any) {
       let title = "Error de autenticación";
       let description = "No se pudo iniciar sesión. Por favor, inténtalo de nuevo.";

       switch(error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
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
