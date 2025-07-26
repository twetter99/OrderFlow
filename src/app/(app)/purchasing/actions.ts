
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp, getDocs, getDoc, arrayUnion } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { PurchaseOrder } from '@/lib/types';
import { convertPurchaseOrderTimestamps } from '@/lib/utils';

async function createPurchaseOrder(data: Partial<Omit<PurchaseOrder, 'id'>>) {
    const poCollection = collection(db, 'purchaseOrders');
    const poSnapshot = await getDocs(poCollection);
    const orderCount = poSnapshot.size;
    const year = new Date().getFullYear();
    const newOrderNumber = `WF-PO-${year}-${String(orderCount + 1).padStart(4, '0')}`;

    const dataToSave: { [key: string]: any } = {
        ...data,
        orderNumber: newOrderNumber,
    };

    if (data.statusHistory) {
      dataToSave.statusHistory = data.statusHistory.map(h => ({
        ...h,
        date: h.date instanceof Date || typeof h.date === 'string' ? Timestamp.fromDate(new Date(h.date)) : h.date
      }));
    } else {
      dataToSave.statusHistory = [{ status: data.status, date: Timestamp.now() }];
    }

    if (data.date && (typeof data.date === 'string' || data.date instanceof Date)) {
        dataToSave.date = Timestamp.fromDate(new Date(data.date));
    }
    if (data.estimatedDeliveryDate && (typeof data.estimatedDeliveryDate === 'string' || data.estimatedDeliveryDate instanceof Date)) {
        dataToSave.estimatedDeliveryDate = Timestamp.fromDate(new Date(data.estimatedDeliveryDate));
    }
    
    const docRef = await addDoc(poCollection, dataToSave);
    
    // Return a serializable object based on the original input data
    // and add the new server-generated fields. This avoids sending back
    // Firestore Timestamps to the client.
    return { 
        ...data,
        id: docRef.id,
        orderNumber: newOrderNumber,
    };
}


export async function addPurchaseOrder(data: any) {
  try {
    const initialStatus = 'Pendiente de Aprobación';
    await createPurchaseOrder({
        ...data,
        status: initialStatus,
        statusHistory: [{ status: initialStatus, date: new Date() }],
    });
    revalidatePath('/purchasing');
    revalidatePath('/dashboard');
    return { success: true, message: 'Pedido de compra añadido correctamente.' };
  } catch (error) {
    console.error("Error adding purchase order to Firestore:", error);
    return { success: false, message: 'No se pudo añadir el pedido de compra.' };
  }
}

export async function updatePurchaseOrder(id: string, data: any) {
    try {
        const poRef = doc(db, 'purchaseOrders', id);
        const dataToUpdate: any = { ...data };

        if (data.date && !(data.date instanceof Timestamp)) {
            dataToUpdate.date = Timestamp.fromDate(new Date(data.date));
        }
        if (data.estimatedDeliveryDate && !(data.estimatedDeliveryDate instanceof Timestamp)) {
            dataToUpdate.estimatedDeliveryDate = Timestamp.fromDate(new Date(data.estimatedDeliveryDate));
        }

        await updateDoc(poRef, dataToUpdate);
        revalidatePath('/purchasing');
        revalidatePath('/dashboard');
        return { success: true, message: 'Pedido de compra actualizado correctamente.' };
    } catch (error) {
        console.error("Error updating purchase order in Firestore:", error);
        return { success: false, message: 'No se pudo actualizar el pedido de compra.' };
    }
}

export async function deletePurchaseOrder(id: string) {
    try {
        await deleteDoc(doc(db, 'purchaseOrders', id));
        revalidatePath('/purchasing');
        revalidatePath('/completed-orders');
        revalidatePath('/dashboard');
        revalidatePath('/');
        revalidatePath('/', 'layout');
        return { success: true, message: 'Pedido de compra eliminado correctamente.' };
    } catch (error) {
        console.error("Error deleting purchase order from Firestore:", error);
        return { success: false, message: 'No se pudo eliminar el pedido de compra.' };
    }
}

export async function deleteMultiplePurchaseOrders(ids: string[]) {
    try {
        const deletePromises = ids.map(id => deleteDoc(doc(db, 'purchaseOrders', id)));
        await Promise.all(deletePromises);
        revalidatePath('/purchasing');
        revalidatePath('/completed-orders');
        revalidatePath('/dashboard');
        revalidatePath('/');
        revalidatePath('/', 'layout');
        return { success: true, message: 'Pedidos de compra eliminados correctamente.' };
    } catch (error) {
        console.error("Error deleting multiple purchase orders from Firestore:", error);
        return { success: false, message: 'No se pudieron eliminar los pedidos.' };
    }
}


export async function updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']) {
    try {
        const poRef = doc(db, 'purchaseOrders', id);
        const newHistoryEntry = { status, date: Timestamp.now() };
        
        await updateDoc(poRef, { 
            status: status,
            statusHistory: arrayUnion(newHistoryEntry) 
        });
        
        revalidatePath('/purchasing');
        revalidatePath('/completed-orders');
        revalidatePath('/dashboard');
        return { success: true, message: `El estado del pedido se ha actualizado a "${status}".` };
    } catch (error) {
        console.error("Error updating purchase order status:", error);
        return { success: false, message: 'No se pudo actualizar el estado del pedido.' };
    }
}

export { createPurchaseOrder };
