import type { Project, InventoryItem, PurchaseOrder, Supplier, User, Client, Location, DeliveryNote, InventoryLocation } from './types';

export const projects: Project[] = [
  { id: 'PROJ-001', name: 'Actualización Flota A de Autobuses', client: 'Tránsito de la Ciudad', status: 'En Progreso', budget: 50000, spent: 23000, startDate: '2024-05-01', endDate: '2024-08-31' },
  { id: 'PROJ-002', name: 'Instalación Nuevo Autobús Turístico', client: 'Compañía de Turismo', status: 'En Progreso', budget: 25000, spent: 18500, startDate: '2024-06-15', endDate: '2024-09-15' },
  { id: 'PROJ-003', name: 'Sistema de Seguridad para Autobús Escolar', client: 'Junta Escolar del Distrito', status: 'Planificado', budget: 75000, spent: 0, startDate: '2024-09-01', endDate: '2024-12-31' },
  { id: 'PROJ-004', name: 'Mantenimiento de Rutina', client: 'Tránsito de la Ciudad', status: 'Completado', budget: 10000, spent: 9800, startDate: '2024-04-01', endDate: '2024-04-30' },
];

export const inventory: InventoryItem[] = [
  { id: 'ITEM-001', sku: 'CPU-45', name: 'Unidad Central de Procesamiento v4.5', quantity: 25, minThreshold: 10, unitCost: 350, supplier: 'TechParts Inc.', type: 'simple' },
  { id: 'ITEM-002', sku: 'BRKT-SML', name: 'Soporte de Montaje Pequeño', quantity: 8, minThreshold: 20, unitCost: 15.50, supplier: 'MetalWorks Ltd.', type: 'simple' },
  { id: 'ITEM-003', sku: 'CONN-PLT-01', name: 'Placa de Conexión Principal', quantity: 55, minThreshold: 30, unitCost: 45, supplier: 'MetalWorks Ltd.', type: 'simple' },
  { id: 'ITEM-004', sku: 'SCRW-M5', name: 'Paquete de Tornillos M5 (100ct)', quantity: 200, minThreshold: 50, unitCost: 8, supplier: 'Soluciones de Ferretería', type: 'simple' },
  { id: 'ITEM-005', sku: 'GPS-MOD-2', name: 'Módulo GPS v2', quantity: 12, minThreshold: 15, unitCost: 120, supplier: 'Global Nav', type: 'simple' },
  { id: 'ITEM-006', sku: 'CAM-SEC-HD', name: 'Cámara de Seguridad HD', quantity: 30, minThreshold: 10, unitCost: 85, supplier: 'TechParts Inc.', type: 'simple' },
  { 
    id: 'ITEM-100', 
    sku: 'KIT-INST-BASIC', 
    name: 'Kit de Instalación Básico', 
    quantity: 0, // La cantidad se calcula en base a los componentes
    minThreshold: 5, 
    unitCost: 478, // Costo es la suma de los componentes
    supplier: 'Ensamblado Interno',
    type: 'composite', 
    components: [
      { itemId: 'ITEM-001', quantity: 1 }, // 1x CPU
      { itemId: 'ITEM-005', quantity: 1 }, // 1x GPS
      { itemId: 'ITEM-004', quantity: 1 }, // 1x Paquete de tornillos
    ]
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'PO-2024-07-001', project: 'PROJ-001', supplier: 'TechParts Inc.', status: 'Recibido', date: '2024-07-10', total: 3500, items: [{ itemId: 'ITEM-001', itemName: 'Unidad Central de Procesamiento v4.5', quantity: 10, price: 350 }] },
  { id: 'PO-2024-07-002', project: 'PROJ-002', supplier: 'MetalWorks Ltd.', status: 'Enviado', date: '2024-07-12', total: 775, items: [{ itemId: 'ITEM-002', itemName: 'Soporte de Montaje Pequeño', quantity: 50, price: 15.50 }] },
  { id: 'PO-2024-07-003', project: 'PROJ-001', supplier: 'Global Nav', status: 'Pendiente', date: '2024-07-15', total: 1200, items: [{ itemId: 'ITEM-005', itemName: 'Módulo GPS v2', quantity: 10, price: 120 }] },
  { id: 'PO-2024-07-004', project: 'PROJ-002', supplier: 'Soluciones de Ferretería', status: 'Rechazado', date: '2024-07-18', total: 160, items: [{ itemId: 'ITEM-004', itemName: 'Paquete de Tornillos M5 (100ct)', quantity: 20, price: 8 }], rejectionReason: 'El precio es superior al acordado en el presupuesto.' },
  { id: 'PO-2024-07-005', project: 'PROJ-003', supplier: 'TechParts Inc.', status: 'Aprobado', date: '2024-07-20', total: 2550, items: [{ itemId: 'ITEM-006', itemName: 'Cámara de Seguridad HD', quantity: 30, price: 85 }] },
  { id: 'PO-2024-07-006', project: 'PROJ-001', supplier: 'MetalWorks Ltd.', status: 'Aprobado', date: '2024-07-21', total: 900, items: [{ itemId: 'ITEM-003', itemName: 'Placa de Conexión Principal', quantity: 20, price: 45 }] },
];

export const suppliers: Supplier[] = [
  { id: 'SUP-001', name: 'TechParts Inc.', contactPerson: 'Jane Doe', email: 'sales@techparts.com', phone: '123-456-7890', deliveryRating: 4.5, qualityRating: 4.8 },
  { id: 'SUP-002', name: 'MetalWorks Ltd.', contactPerson: 'John Smith', email: 'contact@metalworks.com', phone: '987-654-3210', deliveryRating: 4.2, qualityRating: 4.5 },
  { id: 'SUP-003', name: 'Soluciones de Ferretería', contactPerson: 'Peter Jones', email: 'orders@hardwaresolutions.com', phone: '555-123-4567', deliveryRating: 4.8, qualityRating: 4.3 },
  { id: 'SUP-004', name: 'Global Nav', contactPerson: 'Susan Chen', email: 'support@globalnav.com', phone: '555-987-6543', deliveryRating: 4.0, qualityRating: 4.7 },
  { id: 'SUP-005', name: 'Ensamblado Interno', contactPerson: 'N/A', email: 'N/A', phone: 'N/A', deliveryRating: 5.0, qualityRating: 5.0 },
];

export const clients: Client[] = [
    { id: 'CLI-001', name: 'Tránsito de la Ciudad', contactPerson: 'Carlos Ruiz', email: 'c.ruiz@transitociudad.gov', phone: '611-222-3333' },
    { id: 'CLI-002', name: 'Compañía de Turismo', contactPerson: 'Ana Torres', email: 'ana.torres@turismo.com', phone: '622-333-4444' },
    { id: 'CLI-003', name: 'Junta Escolar del Distrito', contactPerson: 'Maria Lopez', email: 'm.lopez@juntaescolar.edu', phone: '633-444-5555' },
];

export const users: User[] = [
  { id: 'USER-001', name: 'Admin User', email: 'admin@orderflow.com', phone: '111-222-3333', role: 'Administrador' },
  { id: 'USER-002', name: 'Warehouse Staff', email: 'warehouse@orderflow.com', phone: '444-555-6666', role: 'Almacén' },
  { id: 'USER-003', name: 'Employee User', email: 'employee@orderflow.com', phone: '777-888-9999', role: 'Empleado' },
];

export const locations: Location[] = [
    { id: 'LOC-001', name: 'Estantería A-1', description: 'Materiales generales' },
    { id: 'LOC-002', name: 'Estantería A-2', description: 'Componentes electrónicos' },
    { id: 'LOC-003', name: 'Zona de Recepción', description: 'Mercancía pendiente de clasificar' },
];

export const inventoryLocations: InventoryLocation[] = [
    { id: 'INVLOC-001', itemId: 'ITEM-001', locationId: 'LOC-002', quantity: 15 },
    { id: 'INVLOC-002', itemId: 'ITEM-001', locationId: 'LOC-003', quantity: 10 },
    { id: 'INVLOC-003', itemId: 'ITEM-002', locationId: 'LOC-001', quantity: 8 },
    { id: 'INVLOC-004', itemId: 'ITEM-003', locationId: 'LOC-001', quantity: 55 },
    { id: 'INVLOC-005', itemId: 'ITEM-004', locationId: 'LOC-001', quantity: 200 },
    { id: 'INVLOC-006', itemId: 'ITEM-005', locationId: 'LOC-002', quantity: 12 },
    { id: 'INVLOC-007', itemId: 'ITEM-006', locationId: 'LOC-002', quantity: 30 },
];

export const deliveryNotes: DeliveryNote[] = [
    { id: 'DN-2024-0001', projectId: 'PROJ-001', date: '2024-07-20', status: 'Completado', items: [{itemId: 'ITEM-001', quantity: 5}, {itemId: 'ITEM-004', quantity: 10}] },
    { id: 'DN-2024-0002', projectId: 'PROJ-002', date: '2024-07-22', status: 'Completado', items: [{itemId: 'ITEM-002', quantity: 20}, {itemId: 'ITEM-003', quantity: 15}] },
]
