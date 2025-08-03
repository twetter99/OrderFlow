
"use server"

import { auth, db } from "@/lib/firebase-admin";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";

// NOTA: Este archivo debe usar el SDK de Admin de Firebase
// para poder crear usuarios sin estar autenticado.

export async function createUser(userData: any) {
  const { email, password, name, phone, permissions, personId } = userData;

  if (!email || !password) {
    return { success: false, message: "El correo y la contraseña son obligatorios." };
  }

  try {
    // 1. Crear usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Crear documento de usuario en Firestore
    const userDocRef = doc(db, "usuarios", userRecord.uid);
    await setDoc(userDocRef, {
      uid: userRecord.uid,
      personId,
      name,
      email,
      phone: phone || '',
      permissions,
      createdAt: serverTimestamp(),
      lastLoginAt: null,
      providerId: 'password'
    });

    return { success: true, message: `Usuario ${name} creado exitosamente.` };

  } catch (error: any) {
    console.error("Error creating user:", error);
    let message = "Ocurrió un error inesperado.";
    if (error.code === 'auth/email-already-exists') {
        message = "Este correo electrónico ya está en uso por otro usuario.";
    } else if (error.code === 'auth/invalid-password') {
        message = `La contraseña no cumple con los requisitos de seguridad: ${error.message}`;
    }
    return { success: false, message };
  }
}

export async function updateUser(uid: string, userData: any) {
  const { password, name, phone, permissions, personId } = userData;

  try {
    const updateAuthData: any = {};
    if (password) {
        updateAuthData.password = password;
    }
    if (name) {
        updateAuthData.displayName = name;
    }
    
    // 1. Actualizar usuario en Firebase Authentication
    if (Object.keys(updateAuthData).length > 0) {
        await auth.updateUser(uid, updateAuthData);
    }
    
    // 2. Actualizar documento en Firestore
    const userDocRef = doc(db, "usuarios", uid);
    await setDoc(userDocRef, {
      name,
      phone: phone || '',
      permissions,
      personId,
    }, { merge: true });

    return { success: true, message: "Usuario actualizado correctamente." };

  } catch (error: any) {
    console.error("Error updating user:", error);
    let message = "Ocurrió un error inesperado al actualizar.";
     if (error.code === 'auth/user-not-found') {
        message = "El usuario que intentas actualizar no existe en Firebase Authentication.";
    }
    return { success: false, message };
  }
}

export async function deleteUser(uid: string) {
    try {
        // 1. Eliminar de Firebase Authentication
        await auth.deleteUser(uid);
        
        // 2. Eliminar de Firestore
        const userDocRef = doc(db, "usuarios", uid);
        await deleteDoc(userDocRef);

        return { success: true, message: "Usuario eliminado." };
    } catch(error: any) {
        console.error("Error deleting user:", error);
        let message = "No se pudo eliminar el usuario.";
        if (error.code === 'auth/user-not-found') {
            message = "El usuario ya no existe en Firebase Authentication. Se procederá a limpiar los datos locales.";
            // Intentar eliminar solo de firestore si en auth no existe
             const userDocRef = doc(db, "usuarios", uid);
             await deleteDoc(userDocRef);
             return { success: true, message };
        }
        return { success: false, message };
    }
}
    