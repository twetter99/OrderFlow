export type Project = {
  id: string;
  name: string;
  client: string;
  status: 'Planificado' | 'En Progreso' | 'Completado';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  minThreshold: number;
  unitCost: number;
  supplier: string;
};

export type PurchaseOrder = {
  id: string;
  project: string;
  supplier: string;
  status: 'Pendiente' | 'Aprobado' | 'Enviado' | 'Recibido' | 'Parcial' | 'Rechazado';
  date: string;
  total: number;
  items: {
    itemId: string;
    quantity: number;
    price: number;
  }[];
};

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  deliveryRating: number;
  qualityRating: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Administrador' | 'Empleado' | 'Almacén';
};
