

export type Project = {
  id: string;
  name: string;
  client: string;
  clientId: string;
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
  imageUrl?: string;
  quantity: number;
  minThreshold: number;
  unitCost: number;
  unit: string; // e.g., 'ud', 'ml', 'kg', 'h'
  supplier: string;
  type: 'simple' | 'composite' | 'service';
  components?: {
    itemId: string;
    quantity: number;
  }[];
};

export type PurchaseOrderItem = {
  itemId?: string;
  itemName: string;
  quantity: number;
  price: number;
  unit: string;
  type: 'Material' | 'Servicio';
};

export type PurchaseOrder = {
  id: string;
  project: string;
  supplier: string;
  status: 'Pendiente' | 'Aprobado' | 'Enviado' | 'Recibido' | 'Rechazado';
  date: string;
  estimatedDeliveryDate: string;
  total: number;
  items: PurchaseOrderItem[];
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
  id:string;
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
  clientId: string;
  projectId: string;
  locationId: string;
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

export type Notification = {
    id: string;
    title: string;
    description: string;
    type: 'alert' | 'info';
    link: string;
    isRead: boolean;
}
