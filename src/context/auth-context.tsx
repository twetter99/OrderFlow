
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

// This function is kept for potential future use (e.g., first-time setup for a user created by an admin)
// but it is NOT called during the standard login flow anymore.
const updateUserProfileOnLogin = async (firebaseUser: FirebaseUser) => {
  const userRef = doc(db, 'usuarios', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  const userData: Partial<User> = {
    lastLoginAt: serverTimestamp(),
  };

  if (!userSnap.exists()) {
    // This case should ideally not happen if users are pre-provisioned.
    // As a fallback, create a basic profile.
    userData.uid = firebaseUser.uid;
    userData.email = firebaseUser.email;
    userData.name = firebaseUser.displayName;
    userData.providerId = firebaseUser.providerData[0]?.providerId || 'password';
    userData.createdAt = serverTimestamp();
    await setDoc(userRef, userData);
  } else {
    await setDoc(userRef, userData, { merge: true });
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
            // After auth state change, always re-fetch the user profile from Firestore
            // to ensure permissions and data are up-to-date.
            const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
            if (userDoc.exists()) {
                setUser(userDoc.data() as User);
            } else {
                // If user exists in Firebase Auth but not in our system, log them out.
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
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      // **Critical Step**: Verify the user exists in our Firestore 'usuarios' collection.
      const userDocRef = doc(db, 'usuarios', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If the user is not in our system, deny access and sign them out from Firebase.
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Acceso Denegado",
          description: "Este usuario no está autorizado para acceder al sistema."
        });
        setLoading(false);
        return;
      }
      
      // If authorized, update last login time and proceed.
      await setDoc(userDocRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      router.push('/dashboard');

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
