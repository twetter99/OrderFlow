
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Project } from '@/lib/types';

// Omit 'id' for creation, as Firestore generates it.
type ProjectData = Omit<Project, 'id'>;

export async function addProject(data: ProjectData) {
  try {
    // Firestore handles date objects correctly
    const dataToSave = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
    };
    await addDoc(collection(db, 'projects'), dataToSave);
    revalidatePath('/projects');
    return { success: true, message: 'Proyecto añadido correctamente.' };
  } catch (error) {
    console.error("Error adding project to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el proyecto.' };
  }
}

export async function updateProject(id: string, data: Partial<ProjectData>) {
    try {
        const projectRef = doc(db, 'projects', id);
        const dataToUpdate: any = { ...data };

        // Convert date strings back to Date objects if they exist
        if (data.startDate) {
            dataToUpdate.startDate = new Date(data.startDate);
        }
        if (data.endDate) {
            dataToUpdate.endDate = new Date(data.endDate);
        }

        await updateDoc(projectRef, dataToUpdate);
        revalidatePath('/projects');
        return { success: true, message: 'Proyecto actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating project in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el proyecto.' };
    }
}

export async function deleteProject(id: string) {
    try {
        await deleteDoc(doc(db, 'projects', id));
        revalidatePath('/projects');
        return { success: true, message: 'Proyecto eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting project from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el proyecto.' };
    }
}

export async function deleteMultipleProjects(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'projects', id)));
        await Promise.all(deletePromises);
        revalidatePath('/projects');
        return { success: true, message: 'Proyectos eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple projects from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los proyectos.' };
    }
}
