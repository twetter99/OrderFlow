
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function addUser(data: any) {
  try {
    await addDoc(collection(db, 'users'), data);
    revalidatePath('/main/users');
    return { success: true, message: 'Usuario añadido correctamente.' };
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el usuario.' };
  }
}

export async function updateUser(id: string, data: any) {
    try {
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, data);
        revalidatePath('/main/users');
        return { success: true, message: 'Usuario actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating user in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el usuario.' };
    }
}

export async function deleteUser(id: string) {
    try {
        await deleteDoc(doc(db, 'users', id));
        revalidatePath('/main/users');
        return { success: true, message: 'Usuario eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting user from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el usuario.' };
    }
}

export async function deleteMultipleUsers(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'users', id)));
        await Promise.all(deletePromises);
        revalidatePath('/main/users');
        return { success: true, message: 'Usuarios eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple users from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los usuarios.' };
    }
}

    