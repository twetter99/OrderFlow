
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"
import type { PurchaseOrder } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertPurchaseOrderTimestamps = (orderData: any): PurchaseOrder => {
  if (!orderData) return orderData;

  const convert = (data: any): any => {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map(item => convert(item));
    }

    if (data instanceof Timestamp) {
      return data.toDate().toISOString();
    }

    if (typeof data === 'object' && data !== null) {
      const newObj: { [key: string]: any } = {};
      for (const key in data) {
        newObj[key] = convert(data[key]);
      }
      return newObj;
    }

    return data;
  };
  
  return convert(orderData)
};
