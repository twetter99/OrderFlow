
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Location } from '@/lib/types';

export async function addLocation(data: Omit<Location, 'id'>) {
  try {
    await addDoc(collection(db, 'locations'), data);
    revalidatePath('/locations');
    return { success: true, message: 'Almacén añadido correctamente.' };
  } catch (error) {
    console.error("Error adding location to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el almacén.' };
  }
}

export async function updateLocation(id: string, data: Partial<Omit<Location, 'id'>>) {
    try {
        const locationRef = doc(db, 'locations', id);
        await updateDoc(locationRef, data);
        revalidatePath('/locations');
        return { success: true, message: 'Almacén actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating location in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el almacén.' };
    }
}

export async function deleteLocation(id: string) {
    try {
        await deleteDoc(doc(db, 'locations', id));
        revalidatePath('/locations');
        return { success: true, message: 'Almacén eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting location from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el almacén.' };
    }
}

export async function deleteMultipleLocations(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'locations', id)));
        await Promise.all(deletePromises);
        revalidatePath('/locations');
        return { success: true, message: 'Almacenes eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple locations from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los almacenes.' };
    }
}
