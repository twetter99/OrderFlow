import type { Project, InventoryItem, PurchaseOrder, Supplier } from './types';

export const projects: Project[] = [
  { id: 'PROJ-001', name: 'Bus Fleet A Upgrade', client: 'City Transit', status: 'In Progress', budget: 50000, spent: 23000, startDate: '2024-05-01', endDate: '2024-08-31' },
  { id: 'PROJ-002', name: 'New Tourist Bus Install', client: 'Sightseeing Co.', status: 'In Progress', budget: 25000, spent: 18500, startDate: '2024-06-15', endDate: '2024-09-15' },
  { id: 'PROJ-003', name: 'School Bus Safety System', client: 'District School Board', status: 'Planned', budget: 75000, spent: 0, startDate: '2024-09-01', endDate: '2024-12-31' },
  { id: 'PROJ-004', name: 'Maintenance Run', client: 'City Transit', status: 'Completed', budget: 10000, spent: 9800, startDate: '2024-04-01', endDate: '2024-04-30' },
];

export const inventory: InventoryItem[] = [
  { id: 'ITEM-001', sku: 'CPU-45', name: 'Central Processing Unit v4.5', quantity: 25, minThreshold: 10, unitCost: 350, supplier: 'TechParts Inc.' },
  { id: 'ITEM-002', sku: 'BRKT-SML', name: 'Small Mounting Bracket', quantity: 8, minThreshold: 20, unitCost: 15.50, supplier: 'MetalWorks Ltd.' },
  { id: 'ITEM-003', sku: 'CONN-PLT-01', name: 'Main Connection Plate', quantity: 55, minThreshold: 30, unitCost: 45, supplier: 'MetalWorks Ltd.' },
  { id: 'ITEM-004', sku: 'SCRW-M5', name: 'M5 Screw Pack (100ct)', quantity: 200, minThreshold: 50, unitCost: 8, supplier: 'Hardware Solutions' },
  { id: 'ITEM-005', sku: 'GPS-MOD-2', name: 'GPS Module v2', quantity: 12, minThreshold: 15, unitCost: 120, supplier: 'Global Nav' },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-2024-07-001', project: 'PROJ-001', supplier: 'TechParts Inc.', status: 'Received', date: '2024-07-10', total: 3500, items: [{ itemId: 'ITEM-001', quantity: 10, price: 350 }] },
  { id: 'PO-2024-07-002', project: 'PROJ-002', supplier: 'MetalWorks Ltd.', status: 'Sent', date: '2024-07-12', total: 775, items: [{ itemId: 'ITEM-002', quantity: 50, price: 15.50 }] },
  { id: 'PO-2024-07-003', project: 'PROJ-001', supplier: 'Global Nav', status: 'Pending', date: '2024-07-15', total: 1200, items: [{ itemId: 'ITEM-005', quantity: 10, price: 120 }] },
  { id: 'PO-2024-07-004', project: 'PROJ-002', supplier: 'Hardware Solutions', status: 'Approved', date: '2024-07-18', total: 160, items: [{ itemId: 'ITEM-004', quantity: 20, price: 8 }] },
];

export const suppliers: Supplier[] = [
  { id: 'SUP-001', name: 'TechParts Inc.', contactPerson: 'Jane Doe', email: 'sales@techparts.com', phone: '123-456-7890', deliveryRating: 4.5, qualityRating: 4.8 },
  { id: 'SUP-002', name: 'MetalWorks Ltd.', contactPerson: 'John Smith', email: 'contact@metalworks.com', phone: '987-654-3210', deliveryRating: 4.2, qualityRating: 4.5 },
  { id: 'SUP-003', name: 'Hardware Solutions', contactPerson: 'Peter Jones', email: 'orders@hardwaresolutions.com', phone: '555-123-4567', deliveryRating: 4.8, qualityRating: 4.3 },
  { id: 'SUP-004', name: 'Global Nav', contactPerson: 'Susan Chen', email: 'support@globalnav.com', phone: '555-987-6543', deliveryRating: 4.0, qualityRating: 4.7 },
];
