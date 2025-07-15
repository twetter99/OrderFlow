
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
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
