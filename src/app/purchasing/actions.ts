
"use server";

import { revalidatePath } from "next/cache";
import { collection, addDoc, doc, updateDoc, writeBatch, getDoc, arrayUnion, deleteDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-admin"; // Use admin SDK for backend actions
import type { PurchaseOrder, StatusHistoryEntry, DeliveryNoteAttachment, Project } from "@/lib/types";
import { sendApprovalEmail } from "@/ai/flows/send-approval-email";

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
      estimatedDeliveryDate: orderData.estimatedDeliveryDate, // Firestore will convert to Timestamp
      statusHistory: [historyEntry]
    });
    
  } catch (error) {
    console.error("Error creating purchase order in Firestore: ", error);
    return { success: false, message: "No se pudo crear el pedido en la base de datos." };
  }

  if (orderData.status === 'Pendiente de Aprobación') {
      try {
          // Fetch project name
          let projectName = 'No especificado';
          if (orderData.project) {
            const projectRef = doc(db, 'projects', orderData.project);
            const projectSnap = await getDoc(projectRef);
            if (projectSnap.exists()) {
                projectName = (projectSnap.data() as Project).name;
            }
          }

          // Forza el uso de la URL de producción para los enlaces de aprobación.
          const baseUrl = 'https://studio--orderflow-pxtw9.us-central1.hosted.app';
          const approvalUrl = `${baseUrl}/public/approve/${docRef.id}`;
          
          console.log(`Triggering approval email for order ${docRef.id} to juan@winfin.es`);
          const emailResult = await sendApprovalEmail({
              to: 'juan@winfin.es',
              orderId: docRef.id,
              orderNumber: newOrderNumber,
              orderAmount: orderData.total || 0,
              approvalUrl: approvalUrl,
              orderDate: orderDate.toISOString(),
              projectName: projectName
          });

          console.log("Received result from sendApprovalEmail flow:", emailResult);

          if (!emailResult.success) {
               // The error from the flow is now more reliable.
               const errorMessage = emailResult.error || "El flujo de email falló sin un mensaje específico.";
               console.error(`CRITICAL: Email failed for order ${docRef.id}. Rolling back... Error details:`, errorMessage);
               await deleteDoc(doc(db, "purchaseOrders", docRef.id));
               return { 
                  success: false,
                  message: `No se pudo enviar el email de aprobación. La orden de compra no ha sido creada. Error: ${errorMessage}`,
              };
          }
          
          console.log(`Successfully sent approval email for order ${docRef.id}.`);
          revalidatePath("/purchasing");
          return { success: true, message: `Pedido ${newOrderNumber} creado y email de aprobación enviado.`, id: docRef.id };
      
      } catch (emailError: any) {
          console.error(`CRITICAL: The entire email process failed for order ${docRef.id}. Rolling back... Full error:`, emailError);
          await deleteDoc(doc(db, "purchaseOrders", docRef.id));
          return { 
              success: false, 
              message: `Falló el proceso de envío de email. La orden no ha sido creada. Error: ${emailError.message}`,
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
        revalidatePath("/completed-orders");
        return { success: true, message: `${ids.length} pedidos eliminados.` };
    } catch(error) {
        console.error("Error deleting multiple orders: ", error);
        return { success: false, message: "No se pudieron eliminar los pedidos." };
    }
}

export async function linkDeliveryNoteToPurchaseOrder(orderId: string, notes: DeliveryNoteAttachment[]) {
    try {
        const orderRef = doc(db, "purchaseOrders", orderId);
        await updateDoc(orderRef, {
            deliveryNotes: arrayUnion(...notes),
            hasDeliveryNotes: true,
            lastDeliveryNoteUpload: new Date(),
        });
        revalidatePath(`/purchasing`);
        return { success: true, message: 'Albarán adjuntado con éxito.' };
    } catch (error) {
        console.error("Error linking delivery note: ", error);
        return { success: false, message: "No se pudo adjuntar el albarán en la base de datos." };
    }
}
