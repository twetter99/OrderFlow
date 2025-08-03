
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logOut: async () => {},
});

const createUserProfile = async (firebaseUser: FirebaseUser) => {
  const userRef = doc(db, 'usuarios', firebaseUser.uid);
  
  const userData: Partial<User> = {
    uid: firebaseUser.uid,
    providerId: firebaseUser.providerData[0]?.providerId || 'google.com',
    lastLoginAt: serverTimestamp(),
  };

  if (firebaseUser.displayName) {
    userData.name = firebaseUser.displayName;
  }
  if (firebaseUser.email) {
    userData.email = firebaseUser.email;
  }
  if (firebaseUser.photoURL) {
    userData.photoURL = firebaseUser.photoURL;
  }

  // Use set with merge to create if not exists, or update if it does.
  await setDoc(userRef, userData, { merge: true });
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            await createUserProfile(firebaseUser);
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            });
            if (pathname === '/login') {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error("Error creating user profile in Firestore:", error);
            toast({
                variant: "destructive",
                title: "Error de perfil",
                description: "No se pudo crear o actualizar tu perfil de usuario. Por favor, intenta iniciar sesión de nuevo."
            });
            await signOut(auth); // Log out the user if profile creation fails
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname, toast]);

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle the rest
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
       if (error.code === 'auth/unauthorized-domain') {
        toast({
            variant: "destructive",
            title: "Dominio no autorizado",
            description: "Este dominio no está autorizado para la autenticación. Añádelo en la configuración de Authentication de tu Firebase Console.",
        })
       } else if (error.code !== 'auth/popup-closed-by-user') {
         toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "No se pudo iniciar sesión con Google. Por favor, inténtalo de nuevo.",
        })
       }
      setLoading(false);
    }
  };

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

  if (loading && pathname !== '/login') {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
     )
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
