
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
  quantity: number; // Para artículos simples, es el stock. Para compuestos, puede ser 0.
  minThreshold: number;
  unitCost: number;
  supplier: string;
  type: 'simple' | 'composite';
  components?: {
    itemId: string;
    quantity: number;
  }[];
};

export type PurchaseOrder = {
  id: string;
  project: string;
  supplier: string;
  status: 'Pendiente' | 'Aprobado' | 'Enviado' | 'Recibido' | 'Rechazado';
  date: string;
  total: number;
  items: {
    itemId: string;
    quantity: number;
    price: number;
  }[];
  rejectionReason?: string;
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

export type Client = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Administrador' | 'Empleado' | 'Almacén';
};

export type Location = {
  id: string;
  name: string;
  description: string;
};

export type DeliveryNote = {
  id: string;
  projectId: string;
  date: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
  status: 'Pendiente' | 'Completado';
};

export type InventoryLocation = {
    id: string;
    itemId: string;
    locationId: string;
    quantity: number;
}
    
