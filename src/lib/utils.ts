import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"
import type { PurchaseOrder } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertPurchaseOrderTimestamps = (orderData: any): PurchaseOrder => {
  const convertedHistory = (orderData.statusHistory || []).map((h: any) => ({
      ...h,
      date: h.date?.toDate ? h.date.toDate().toISOString() : h.date,
  }));

  return {
    ...orderData,
    id: orderData.id,
    date: orderData.date?.toDate ? orderData.date.toDate().toISOString() : orderData.date,
    estimatedDeliveryDate: orderData.estimatedDeliveryDate?.toDate ? orderData.estimatedDeliveryDate.toDate().toISOString() : orderData.estimatedDeliveryDate,
    statusHistory: convertedHistory,
  };
};
