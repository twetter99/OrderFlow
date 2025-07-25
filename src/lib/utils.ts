import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"
import type { PurchaseOrder } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertPurchaseOrderTimestamps = (orderData: any): PurchaseOrder => {
  return {
    ...orderData,
    id: orderData.id,
    date: orderData.date instanceof Timestamp ? orderData.date.toDate().toISOString() : orderData.date,
    estimatedDeliveryDate: orderData.estimatedDeliveryDate instanceof Timestamp ? orderData.estimatedDeliveryDate.toDate().toISOString() : orderData.estimatedDeliveryDate,
    statusHistory: (orderData.statusHistory || []).map((h: any) => ({
      ...h,
      date: h.date instanceof Timestamp ? h.date.toDate().toISOString() : h.date
    })),
  };
};
