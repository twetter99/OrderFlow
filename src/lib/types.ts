export type Project = {
  id: string;
  name: string;
  client: string;
  status: 'Planned' | 'In Progress' | 'Completed';
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
  status: 'Pending' | 'Approved' | 'Sent' | 'Received' | 'Partial' | 'Rejected';
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
