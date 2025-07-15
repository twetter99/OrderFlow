
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function addClient(data: { name: string; contactPerson: string; email: string; phone: string; }) {
  try {
    await addDoc(collection(db, 'clients'), data);
    revalidatePath('/clients');
    return { success: true, message: 'Cliente añadido correctamente.' };
  } catch (error) {
    console.error("Error adding client to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el cliente.' };
  }
}

export async function updateClient(id: string, data: { name: string; contactPerson: string; email: string; phone: string; }) {
    try {
        const clientRef = doc(db, 'clients', id);
        await updateDoc(clientRef, data);
        revalidatePath('/clients');
        return { success: true, message: 'Cliente actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating client in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el cliente.' };
    }
}

export async function deleteClient(id: string) {
    try {
        await deleteDoc(doc(db, 'clients', id));
        revalidatePath('/clients');
        return { success: true, message: 'Cliente eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting client from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el cliente.' };
    }
}

export async function deleteMultipleClients(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'clients', id)));
        await Promise.all(deletePromises);
        revalidatePath('/clients');
        return { success: true, message: 'Clientes eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple clients from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los clientes.' };
    }
}
