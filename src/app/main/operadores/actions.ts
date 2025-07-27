

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Operador } from '@/lib/types';

export async function addOperador(data: Omit<Operador, 'id'>) {
  try {
    await addDoc(collection(db, 'operadores'), data);
    revalidatePath('/main/operadores');
    return { success: true, message: 'Operador añadido correctamente.' };
  } catch (error) {
    console.error("Error adding operador to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el operador.' };
  }
}

export async function updateOperador(id: string, data: Partial<Omit<Operador, 'id'>>) {
    try {
        const operadorRef = doc(db, 'operadores', id);
        await updateDoc(operadorRef, data);
        revalidatePath('/main/operadores');
        return { success: true, message: 'Operador actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating operador in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el operador.' };
    }
}

export async function deleteOperador(id: string) {
    try {
        await deleteDoc(doc(db, 'operadores', id));
        revalidatePath('/main/operadores');
        return { success: true, message: 'Operador eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting operador from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el operador.' };
    }
}

export async function deleteMultipleOperadores(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'operadores', id)));
        await Promise.all(deletePromises);
        revalidatePath('/main/operadores');
        return { success: true, message: 'Operadores eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple operadores from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los operadores.' };
    }
}
