
"use server";

import { revalidatePath } from "next/cache";
import { collection, addDoc, doc, updateDoc, writeBatch, getDoc, arrayUnion, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PurchaseOrder, StatusHistoryEntry } from "@/lib/types";
import { sendApprovalEmail } from "@/ai/flows/send-approval-email";

// The Input type is now defined and used locally within the `send-approval-email.ts` flow.
// We only need to match the object structure when calling the function.

export async function addPurchaseOrder(orderData: Partial<PurchaseOrder>) {
  let docRef;
  const newOrderNumber = await getNextOrderNumber();
  const orderDate = new Date();
  
  try {
    const historyEntry: StatusHistoryEntry = {
        status: orderData.status || 'Pendiente de Aprobación',
        date: orderDate,
        comment: 'Pedido creado'
    };

    docRef = await addDoc(collection(db, "purchaseOrders"), {
      ...orderData,
      orderNumber: newOrderNumber,
      date: orderDate,
      estimatedDeliveryDate: orderData.estimatedDeliveryDate, 
      statusHistory: [historyEntry],
    });
    
  } catch (error) {
    console.error("Error creating purchase order in Firestore: ", error);
    return { success: false, message: "No se pudo crear el pedido en la base de datos." };
  }

  if (orderData.status === 'Pendiente de Aprobación') {
      try {
          const approvalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/public/approve/${docRef.id}`;
          
          const emailResult = await sendApprovalEmail({
              to: 'juan@winfin.es',
              orderId: docRef.id,
              orderNumber: newOrderNumber,
              orderAmount: orderData.total || 0,
              approvalUrl: approvalUrl,
              orderDate: orderDate.toISOString(), 
          });

          if (!emailResult.success) {
               console.error(`CRITICAL: Email failed for order ${docRef.id}. Rolling back...`, emailResult.error);
               await deleteDoc(doc(db, "purchaseOrders", docRef.id));
               return { 
                  success: false,
                  message: `No se pudo enviar el email de aprobación. La orden de compra no ha sido creada. Error: ${emailResult.error}`,
              };
          }
          
          revalidatePath("/purchasing");
          return { success: true, message: `Pedido ${newOrderNumber} creado y email de aprobación enviado.`, id: docRef.id };
      
      } catch (emailError) {
          console.error(`CRITICAL: Email process failed for order ${docRef.id}. Rolling back...`, emailError);
          await deleteDoc(doc(db, "purchaseOrders", docRef.id));
          return { 
              success: false, 
              message: `Falló el proceso de envío de email. La orden no ha sido creada.`,
          };
      }
  }

  revalidatePath("/purchasing");
  return { success: true, message: `Pedido ${newOrderNumber} creado exitosamente.`, id: docRef.id };
}


// Helper para generar el siguiente número de pedido
const getNextOrderNumber = async (): Promise<string> => {
    const today = new Date();
    const year = today.getFullYear();
    // En una app real, leeríamos un contador desde Firestore y lo incrementaríamos atómicamente.
    // Para este prototipo, usaremos un número aleatorio para simularlo.
    const sequentialNumber = Math.floor(Math.random() * 900) + 100; // Simula un contador
    return `WF-PO-${year}-${String(sequentialNumber).padStart(4, '0')}`;
};


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
