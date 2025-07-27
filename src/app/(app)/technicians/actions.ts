

'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Technician } from '@/lib/types';

export async function addTechnician(data: Omit<Technician, 'id'>) {
  try {
    await addDoc(collection(db, 'technicians'), data);
    revalidatePath('/main/technicians');
    return { success: true, message: 'Técnico añadido correctamente.' };
  } catch (error) {
    console.error("Error adding technician to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el técnico.' };
  }
}

export async function updateTechnician(id: string, data: Partial<Omit<Technician, 'id'>>) {
    try {
        const technicianRef = doc(db, 'technicians', id);
        await updateDoc(technicianRef, data);
        revalidatePath('/main/technicians');
        return { success: true, message: 'Técnico actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating technician in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el técnico.' };
    }
}

export async function deleteTechnician(id: string) {
    try {
        await deleteDoc(doc(db, 'technicians', id));
        revalidatePath('/main/technicians');
        return { success: true, message: 'Técnico eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting technician from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el técnico.' };
    }
}

export async function deleteMultipleTechnicians(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'technicians', id)));
        await Promise.all(deletePromises);
        revalidatePath('/main/technicians');
        return { success: true, message: 'Técnicos eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple technicians from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los técnicos.' };
    }
}

    