
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, runTransaction, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Project, User } from '@/lib/types';

// Omit 'id' for creation, as Firestore generates it.
type ProjectData = Omit<Project, 'id'>;

export async function addProject(data: ProjectData) {
  try {
    const dataToSave = {
        ...data,
        startDate: Timestamp.fromDate(new Date(data.startDate)),
        endDate: Timestamp.fromDate(new Date(data.endDate)),
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

        if (data.startDate) {
            dataToUpdate.startDate = Timestamp.fromDate(new Date(data.startDate));
        }
        if (data.endDate) {
            dataToUpdate.endDate = Timestamp.fromDate(new Date(data.endDate));
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

export async function getProjectUsers(projectId: string): Promise<{ projectManager: User | null; team: User[] }> {
  try {
    const projectDoc = await runTransaction(db, async (transaction) => {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await transaction.get(projectRef);
      if (!projectSnap.exists()) {
        throw new Error("El proyecto no existe.");
      }
      const projectData = projectSnap.data() as Project;
      
      let projectManager: User | null = null;
      if (projectData.responsable_proyecto_id) {
        const pmRef = doc(db, 'users', projectData.responsable_proyecto_id);
        const pmSnap = await transaction.get(pmRef);
        if (pmSnap.exists()) {
          projectManager = { id: pmSnap.id, ...pmSnap.data() } as User;
        }
      }

      const team: User[] = [];
      if (projectData.equipo_tecnico_ids && projectData.equipo_tecnico_ids.length > 0) {
        const teamRefs = projectData.equipo_tecnico_ids.map(id => doc(db, 'users', id));
        const teamSnaps = await Promise.all(teamRefs.map(ref => transaction.get(ref)));
        teamSnaps.forEach(snap => {
          if (snap.exists()) {
            team.push({ id: snap.id, ...snap.data() } as User);
          }
        });
      }

      return { projectManager, team };
    });
    return projectDoc;
  } catch (e) {
    console.error("Error getting project users:", e);
    return { projectManager: null, team: [] };
  }
}
