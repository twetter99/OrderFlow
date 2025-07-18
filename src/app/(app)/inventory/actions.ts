
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function addInventoryItem(data: any) {
  try {
    await addDoc(collection(db, 'inventory'), data);
    revalidatePath('/inventory');
    return { success: true, message: 'Artículo añadido correctamente.' };
  } catch (error) {
    console.error("Error adding inventory item to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el artículo.' };
  }
}

export async function updateInventoryItem(id: string, data: any) {
    try {
        const itemRef = doc(db, 'inventory', id);
        await updateDoc(itemRef, data);
        revalidatePath('/inventory');
        return { success: true, message: 'Artículo actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating inventory item in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el artículo.' };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await deleteDoc(doc(db, 'inventory', id));
        revalidatePath('/inventory');
        return { success: true, message: 'Artículo eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting inventory item from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el artículo.' };
    }
}

export async function deleteMultipleInventoryItems(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'inventory', id)));
        await Promise.all(deletePromises);
        revalidatePath('/inventory');
        return { success: true, message: 'Artículos eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple items from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los artículos.' };
    }
}
