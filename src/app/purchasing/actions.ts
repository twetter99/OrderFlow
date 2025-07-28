
"use server";

import { revalidatePath } from "next/cache";
import { collection, addDoc, doc, updateDoc, writeBatch, getDoc, arrayUnion, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PurchaseOrder, StatusHistoryEntry } from "@/lib/types";
import { sendApprovalEmail, type SendApprovalEmailInput } from "@/ai/flows/send-approval-email";

// Helper para generar el siguiente número de pedido
const getNextOrderNumber = async (): Promise<string> => {
    const today = new Date();
    const year = today.getFullYear();
    // En una app real, leeríamos un contador desde Firestore y lo incrementaríamos atómicamente.
    // Para este prototipo, usaremos un número aleatorio para simularlo.
    const sequentialNumber = Math.floor(Math.random() * 900) + 100; // Simula un contador
    return `WF-PO-${year}-${String(sequentialNumber).padStart(4, '0')}`;
};

export async function addPurchaseOrder(orderData: Partial<PurchaseOrder>) {
  try {
    const newOrderNumber = await getNextOrderNumber();
    const orderDate = new Date();
    const historyEntry: StatusHistoryEntry = {
        status: orderData.status || 'Pendiente de Aprobación',
        date: orderDate,
        comment: 'Pedido creado'
    };

    const docRef = await addDoc(collection(db, "purchaseOrders"), {
      ...orderData,
      orderNumber: newOrderNumber,
      date: orderDate,
      estimatedDeliveryDate: orderData.estimatedDeliveryDate, 
      statusHistory: [historyEntry],
    });
    
    // Si la orden está pendiente, enviar email de aprobación
    if (orderData.status === 'Pendiente de Aprobación') {
        const approvalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/public/approve/${docRef.id}`;
        
        await sendApprovalEmail({
            to: 'juan@winfin.es',
            orderId: docRef.id,
            orderNumber: newOrderNumber,
            orderAmount: orderData.total || 0,
            approvalUrl: approvalUrl,
            orderDate: orderDate.toISOString(), 
        });
    }

    revalidatePath("/purchasing");
    return { success: true, message: `Pedido ${newOrderNumber} creado exitosamente.`, id: docRef.id };
  } catch (error) {
    console.error("Error adding purchase order: ", error);
    return { success: false, message: "No se pudo crear el pedido." };
  }
}

export async function createPurchaseOrder(orderData: Partial<PurchaseOrder>) {
  try {
    const newOrderNumber = await getNextOrderNumber();
    const docRef = await addDoc(collection(db, "purchaseOrders"), {
        ...orderData,
        orderNumber: newOrderNumber
    });
    return { success: true, id: docRef.id };
  } catch(e) {
    return { success: false, message: (e as Error).message };
  }
}


export async function updatePurchaseOrder(id: string, orderData: Partial<PurchaseOrder>) {
  try {
    const orderRef = doc(db, "purchaseOrders", id);
    await updateDoc(orderRef, orderData);
    revalidatePath("/purchasing");
    return { success: true, message: "Pedido actualizado exitosamente." };
  } catch (error) {
    console.error("Error updating purchase order: ", error);
    return { success: false, message: "No se pudo actualizar el pedido." };
  }
}

export async function updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status'], comment?: string) {
  try {
    const orderRef = doc(db, "purchaseOrders", id);
    const newHistoryEntry: StatusHistoryEntry = {
      status,
      date: new Date(),
      comment: comment || `Estado cambiado a ${status}`
    };
    await updateDoc(orderRef, { 
      status: status,
      statusHistory: arrayUnion(newHistoryEntry)
    });

    revalidatePath("/purchasing");
    revalidatePath(`/public/approve/${id}`);
    return { success: true, message: "Estado del pedido actualizado." };
  } catch (error) {
    console.error("Error updating order status: ", error);
    return { success: false, message: "No se pudo actualizar el estado." };
  }
}

export async function deletePurchaseOrder(id: string) {
  try {
    await deleteDoc(doc(db, "purchaseOrders", id));
    revalidatePath("/purchasing");
    return { success: true, message: "Pedido eliminado." };
  } catch (error) {
    console.error("Error deleting purchase order: ", error);
    return { success: false, message: "No se pudo eliminar el pedido." };
  }
}

export async function deleteMultiplePurchaseOrders(ids: string[]) {
    try {
        const batch = writeBatch(db);
        ids.forEach(id => {
            const docRef = doc(db, "purchaseOrders", id);
            batch.delete(docRef);
        });
        await batch.commit();
        revalidatePath("/purchasing");
        return { success: true, message: `${ids.length} pedidos eliminados.` };
    } catch(error) {
        console.error("Error deleting multiple orders: ", error);
        return { success: false, message: "No se pudieron eliminar los pedidos." };
    }
}

export async function linkDeliveryNoteToPurchaseOrder(orderId: string, urls: string[]) {
    try {
        const orderRef = doc(db, "purchaseOrders", orderId);
        await updateDoc(orderRef, {
            deliveryNoteUrls: arrayUnion(...urls)
        });
        revalidatePath(`/purchasing`);
        return { success: true, message: 'Albarán adjuntado con éxito.' };
    } catch (error) {
        console.error("Error linking delivery note: ", error);
        return { success: false, message: "No se pudo adjuntar el albarán." };
    }
}
