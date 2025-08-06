
'use server';

import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notFound } from 'next/navigation';
import type { PurchaseOrder, Project } from '@/lib/types';
import { convertPurchaseOrderTimestamps } from '@/lib/utils';
import { ApprovalPageClient } from './approval-page-client';

async function getOrderDetails(id: string) {
  const orderRef = doc(db, 'purchaseOrders', id);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    return { order: null, project: null };
  }

  const order = convertPurchaseOrderTimestamps(orderSnap.data()) as PurchaseOrder;
  
  // No es necesario, ya que el nombre del proyecto ahora está desnormalizado
  // en la propia orden. Dejamos la lógica por si hay órdenes antiguas.
  let project: Project | null = null;
  if (order.project) {
    const projectRef = doc(db, 'projects', order.project);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
        project = { id: projectSnap.id, ...projectSnap.data() } as Project;
    }
  }

  return { order, project };
}

export default async function ApprovalPage({ params }: { params: { id: string } }) {
  const { order, project } = await getOrderDetails(params.id);

  if (!order) {
    notFound();
  }

  return (
    <ApprovalPageClient order={order} project={project} />
  );
}
