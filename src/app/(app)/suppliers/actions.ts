

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function addSupplier(data: any) {
  try {
    await addDoc(collection(db, 'suppliers'), data);
    revalidatePath('/main/suppliers');
    return { success: true, message: 'Proveedor añadido correctamente.' };
  } catch (error) {
    console.error("Error adding supplier to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el proveedor.' };
  }
}

export async function updateSupplier(id: string, data: any) {
    try {
        const supplierRef = doc(db, 'suppliers', id);
        await updateDoc(supplierRef, data);
        revalidatePath('/main/suppliers');
        return { success: true, message: 'Proveedor actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating supplier in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el proveedor.' };
    }
}

export async function deleteSupplier(id: string) {
    try {
        await deleteDoc(doc(db, 'suppliers', id));
        revalidatePath('/main/suppliers');
        return { success: true, message: 'Proveedor eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting supplier from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el proveedor.' };
    }
}

export async function deleteMultipleSuppliers(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'suppliers', id)));
        await Promise.all(deletePromises);
        revalidatePath('/main/suppliers');
        return { success: true, message: 'Proveedores eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple suppliers from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los proveedores.' };
    }
}

    