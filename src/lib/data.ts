

import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Project, InventoryItem, PurchaseOrder, Supplier, User, Client, Location, DeliveryNote, InventoryLocation, Notification, PlantillaInstalacion, Replanteo, Technician, Operador } from './types';
import { add, sub } from 'date-fns';

const today = new Date();

// --- Default Mock Data (used as fallback) ---

const mockProjects: Project[] = [
  {
    id: 'WF-PROJ-001',
    codigo_proyecto: 'P24-FLOTA-A-MAD',
    name: 'Actualización Flota A de Autobuses',
    clientId: 'WF-CLI-001',
    client: 'Tránsito de la Ciudad',
    status: 'En Progreso',
    tipo_flota: 'autobuses',
    numero_vehiculos: 50,
    localizacion_base: {
      direccion: 'Calle de la Flota, 123',
      ciudad: 'Madrid',
      provincia: 'Madrid',
      coordenadas: { lat: 40.416775, lng: -3.703790 }
    },
    startDate: '2024-05-01',
    endDate: '2024-08-31',
    budget: 50000,
    spent: 23000,
    margen_previsto: 0.15,
    centro_coste: 'CC-INST-VEH',
    responsable_proyecto_id: 'WF-USER-001',
    equipo_tecnico_ids: ['WF-TECH-001', 'WF-TECH-002'],
    operador_ids: ['WF-OP-001']
  },
  {
    id: 'WF-PROJ-002',
    codigo_proyecto: 'P24-TURISMO-BCN',
    name: 'Instalación Nuevo Autobús Turístico',
    clientId: 'WF-CLI-002',
    client: 'Compañía de Turismo',
    status: 'En Progreso',
    tipo_flota: 'autobuses',
    numero_vehiculos: 5,
    localizacion_base: {
      direccion: 'Avinguda del Port, 45',
      ciudad: 'Barcelona',
      provincia: 'Barcelona',
      coordenadas: { lat: 41.385063, lng: 2.173404 }
    },
    startDate: '2024-06-15',
    endDate: '2024-09-15',
    budget: 25000,
    spent: 18500,
    margen_previsto: 0.20,
    centro_coste: 'CC-PROY-ESP',
    responsable_proyecto_id: 'WF-USER-001',
    equipo_tecnico_ids: ['WF-TECH-001']
  },
  {
    id: 'WF-PROJ-003',
    codigo_proyecto: 'P24-ESCOLARES-SVQ',
    name: 'Sistema de Seguridad para Autobús Escolar',
    clientId: 'WF-CLI-003',
    client: 'Junta Escolar del Distrito',
    status: 'Planificado',
    tipo_flota: 'autobuses',
    numero_vehiculos: 200,
    localizacion_base: {
      direccion: 'Plaza de España, s/n',
      ciudad: 'Sevilla',
      provincia: 'Sevilla',
      coordenadas: { lat: 37.38283, lng: -5.97317 }
    },
    startDate: '2024-09-01',
    endDate: '2024-12-31',
    budget: 75000,
    spent: 0,
    margen_previsto: 0.18,
    centro_coste: 'CC-SEGURIDAD',
    responsable_proyecto_id: 'WF-USER-001',
    equipo_tecnico_ids: []
  },
  {
    id: 'WF-PROJ-004',
    codigo_proyecto: 'P24-MANT-001',
    name: 'Mantenimiento de Rutina',
    clientId: 'WF-CLI-001',
    client: 'Tránsito de la Ciudad',
    status: 'Completado',
    tipo_flota: 'otros',
    numero_vehiculos: 10,
    localizacion_base: {
      direccion: 'Calle de la Flota, 123',
      ciudad: 'Madrid',
      provincia: 'Madrid',
      coordenadas: { lat: 40.416775, lng: -3.703790 }
    },
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    budget: 10000,
    spent: 9800,
    margen_previsto: 0.12,
    centro_coste: 'CC-MANT',
    responsable_proyecto_id: 'WF-USER-001',
    equipo_tecnico_ids: ['WF-TECH-002']
  },
];
const mockInventory: InventoryItem[] = [
  { id: 'ITEM-001', sku: 'CPU-45', name: 'Unidad Central de Procesamiento v4.5', minThreshold: 10, unitCost: 350, unit: 'ud', supplier: 'TechParts Inc.', type: 'simple', observations: 'Componente principal para la mayoría de kits.' },
  { id: 'ITEM-002', sku: 'BRKT-SML', name: 'Soporte de Montaje Pequeño', minThreshold: 20, unitCost: 15.50, unit: 'ud', supplier: 'MetalWorks Ltd.', type: 'simple' },
  { id: 'ITEM-003', sku: 'CONN-PLT-01', name: 'Placa de Conexión Principal', minThreshold: 30, unitCost: 45, unit: 'ud', supplier: 'MetalWorks Ltd.', type: 'simple' },
  { id: 'ITEM-004', sku: 'SCRW-M5', name: 'Paquete de Tornillos M5 (100ct)', minThreshold: 50, unitCost: 8, unit: 'ud', supplier: 'Soluciones de Ferretería', type: 'simple' },
  { id: 'ITEM-005', sku: 'GPS-MOD-2', name: 'Módulo GPS v2', minThreshold: 15, unitCost: 120, unit: 'ud', supplier: 'Global Nav', type: 'simple' },
  { id: 'ITEM-006', sku: 'CAM-SEC-HD', name: 'Cámara de Seguridad HD', minThreshold: 10, unitCost: 85, unit: 'ud', supplier: 'TechParts Inc.', type: 'simple' },
  { id: 'ITEM-007', sku: 'CBL-PWR-10M', name: 'Cable de Alimentación 2-hilos', minThreshold: 50, unitCost: 2.5, unit: 'ml', supplier: 'TechParts Inc.', type: 'simple' },
  { id: 'ITEM-101', sku: 'SERV-INST-HR', name: 'Hora de Instalación Técnica', minThreshold: 0, unitCost: 75, unit: 'ud', supplier: 'N/A', type: 'service' },
  {
    id: 'ITEM-100',
    sku: 'KIT-INST-BASIC',
    name: 'Kit de Instalación Básico',
    minThreshold: 5,
    unitCost: 478, // Costo es la suma de los componentes
    unit: 'ud',
    supplier: 'Ensamblado Interno',
    type: 'composite',
    components: [
      { itemId: 'ITEM-001', quantity: 1 }, // 1x CPU
      { itemId: 'ITEM-005', quantity: 1 }, // 1x GPS
      { itemId: 'ITEM-004', quantity: 1 }, // 1x Paquete de tornillos
    ]
  },
];
const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'WF-PO-2024-001', project: 'WF-PROJ-001', supplier: 'TechParts Inc.', status: 'Recibido', date: '2024-07-10', total: 3500, items: [{ itemId: 'ITEM-001', itemName: 'Unidad Central de Procesamiento v4.5', quantity: 10, price: 350, unit: 'ud', type: 'Material' }], estimatedDeliveryDate: sub(today, { days: 5 }).toISOString() },
  { id: 'WF-PO-2024-002', project: 'WF-PROJ-002', supplier: 'MetalWorks Ltd.', status: 'Enviado', date: '2024-07-12', total: 775, items: [{ itemId: 'ITEM-002', itemName: 'Soporte de Montaje Pequeño', quantity: 50, price: 15.50, unit: 'ud', type: 'Material' }], estimatedDeliveryDate: add(today, { days: 2 }).toISOString() },
  { id: 'WF-PO-2024-003', project: 'WF-PROJ-001', supplier: 'Global Nav', status: 'Pendiente', date: '2024-07-15', total: 1200, items: [{ itemId: 'ITEM-005', itemName: 'Módulo GPS v2', quantity: 10, price: 120, unit: 'ud', type: 'Material' }], estimatedDeliveryDate: add(today, { days: 10 }).toISOString() },
  { id: 'WF-PO-2024-004', project: 'WF-PROJ-002', supplier: 'Soluciones de Ferretería', status: 'Rechazado', date: '2024-07-18', total: 160, items: [{ itemId: 'ITEM-004', itemName: 'Paquete de Tornillos M5 (100ct)', quantity: 20, price: 8, unit: 'ud', type: 'Material' }], rejectionReason: 'El precio es superior al acordado en el presupuesto.', estimatedDeliveryDate: sub(today, { days: 1 }).toISOString() },
  { id: 'WF-PO-2024-005', project: 'WF-PROJ-003', supplier: 'TechParts Inc.', status: 'Aprobado', date: '2024-07-20', total: 2550, items: [{ itemId: 'ITEM-006', itemName: 'Cámara de Seguridad HD', quantity: 30, price: 85, unit: 'ud', type: 'Material' }], estimatedDeliveryDate: add(today, { days: 20 }).toISOString() },
  { id: 'WF-PO-2024-006', project: 'WF-PROJ-001', supplier: 'MetalWorks Ltd.', status: 'Aprobado', date: '2024-07-21', total: 900, items: [{ itemId: 'ITEM-003', itemName: 'Placa de Conexión Principal', quantity: 20, price: 45, unit: 'ud', type: 'Material' }], estimatedDeliveryDate: sub(today, { days: 2 }).toISOString() }, // Retrasado
  { id: 'WF-PO-2024-007', project: 'WF-PROJ-002', supplier: 'Viajes Corporativos', status: 'Aprobado', date: '2024-07-22', total: 875, items: [
    { itemName: 'Vuelo Ida y Vuelta Madrid-Barcelona Técnico', quantity: 1, price: 250, unit: 'viaje', type: 'Servicio' },
    { itemName: 'Hotel 2 noches en Barcelona', quantity: 2, price: 150, unit: 'noche', type: 'Servicio' },
    { itemName: 'Alquiler de coche 3 días', quantity: 1, price: 325, unit: 'ud', type: 'Servicio' },
  ], estimatedDeliveryDate: new Date().toISOString() },
];
const mockSuppliers: Supplier[] = [
  { id: 'WF-SUP-001', name: 'TechParts Inc.', contactPerson: 'Jane Doe', email: 'sales@techparts.com', phone: '123-456-7890', deliveryRating: 4.5, qualityRating: 4.8 },
  { id: 'WF-SUP-002', name: 'MetalWorks Ltd.', contactPerson: 'John Smith', email: 'contact@metalworks.com', phone: '987-654-3210', deliveryRating: 4.2, qualityRating: 4.5 },
  { id: 'WF-SUP-003', name: 'Soluciones de Ferretería', contactPerson: 'Peter Jones', email: 'orders@hardwaresolutions.com', phone: '555-123-4567', deliveryRating: 4.8, qualityRating: 4.3 },
  { id: 'WF-SUP-004', name: 'Global Nav', contactPerson: 'Susan Chen', email: 'support@globalnav.com', phone: '555-987-6543', deliveryRating: 4.0, qualityRating: 4.7 },
  { id: 'WF-SUP-005', name: 'Ensamblado Interno', contactPerson: 'N/A', email: 'N/A', phone: 'N/A', deliveryRating: 5.0, qualityRating: 5.0 },
  { id: 'WF-SUP-006', name: 'Viajes Corporativos', contactPerson: 'Agencia de Viajes', email: 'reservas@viajescorp.com', phone: '555-555-5555', deliveryRating: 5.0, qualityRating: 5.0 },
];
const mockClients: Client[] = [
    { id: 'WF-CLI-001', name: 'Tránsito de la Ciudad', contactPerson: 'Carlos Ruiz', email: 'c.ruiz@transitociudad.gov', phone: '611-222-3333' },
    { id: 'WF-CLI-002', name: 'Compañía de Turismo', contactPerson: 'Ana Torres', email: 'ana.torres@turismo.com', phone: '622-333-4444' },
    { id: 'WF-CLI-003', name: 'Junta Escolar del Distrito', contactPerson: 'Maria Lopez', email: 'm.lopez@juntaescolar.edu', phone: '633-444-5555' },
];
const mockUsers: User[] = [
  { id: 'WF-USER-001', name: 'Admin User', email: 'admin@orderflow.com', phone: '111-222-3333', permissions: ['dashboard', 'projects', 'inventory', 'purchasing', 'users'] },
  { id: 'WF-USER-002', name: 'Warehouse Staff', email: 'warehouse@orderflow.com', phone: '444-555-6666', permissions: ['inventory', 'locations', 'receptions'] },
  { id: 'WF-USER-003', name: 'Solicitante Ejemplo', email: 'solicitante@orderflow.com', phone: '777-888-9999', permissions: ['purchasing'] },
];
const mockTechnicians: Technician[] = [
    { id: 'WF-TECH-001', name: 'Mario García', email: 'm.garcia@tecnicos.com', phone: '655-444-333', specialty: 'Electrónica', category: 'Técnico Integrador de Sistemas Embarcados' },
    { id: 'WF-TECH-002', name: 'Laura Jimenez', email: 'l.jimenez@tecnicos.com', phone: '655-111-222', specialty: 'GPS y Comunicaciones', category: 'Técnico de SAT (Servicio de Asistencia Técnica)' },
];
const mockOperadores: Operador[] = [
    {
      id: 'WF-OP-001',
      name: 'Instalaciones Electrónicas Avanzadas S.L.',
      cif: 'B-12345678',
      phone: '911 23 45 67',
      email: 'facturacion@iea-sl.com',
      address: 'Calle de la Innovación, 1, 28010 Madrid',
      notes: 'Operador principal para proyectos en la comunidad de Madrid.',
      depots: [
          { id: 'DEPOT-01', name: 'Cochera Central', address: 'Calle de la Logística, 42, Getafe' },
          { id: 'DEPOT-02', name: 'Base Norte', address: 'Avenida de la Industria, 1, Alcobendas' }
      ]
    },
];
const mockLocations: Location[] = [
    { id: 'LOC-001', name: 'Almacén Principal', description: 'Almacén principal para componentes generales.' },
    { id: 'LOC-002', name: 'Almacén Secundario', description: 'Almacén para componentes electrónicos sensibles.' },
    { id: 'LOC-003', name: 'Zona de Recepción', description: 'Mercancía pendiente de clasificar.' },
];
const mockInventoryLocations: InventoryLocation[] = [
    { id: 'INVLOC-001', itemId: 'ITEM-001', locationId: 'LOC-002', quantity: 15 },
    { id: 'INVLOC-002', itemId: 'ITEM-001', locationId: 'LOC-003', quantity: 10 },
    { id: 'INVLOC-003', itemId: 'ITEM-002', locationId: 'LOC-001', quantity: 8 },
    { id: 'INVLOC-004', itemId: 'ITEM-003', locationId: 'LOC-001', quantity: 55 },
    { id: 'INVLOC-005', itemId: 'ITEM-004', locationId: 'LOC-001', quantity: 200 },
    { id: 'INVLOC-006', itemId: 'ITEM-005', locationId: 'LOC-002', quantity: 12 },
    { id: 'INVLOC-007', itemId: 'ITEM-006', locationId: 'LOC-002', quantity: 30 },
    { id: 'INVLOC-008', itemId: 'ITEM-007', locationId: 'LOC-001', quantity: 150 },
];
const mockDeliveryNotes: DeliveryNote[] = [
    { id: 'WF-DN-2024-0001', clientId: 'WF-CLI-001', projectId: 'WF-PROJ-001', date: '2024-07-20', status: 'Completado', locationId: 'LOC-002', items: [{itemId: 'ITEM-001', quantity: 5}, {itemId: 'ITEM-004', quantity: 10}] },
    { id: 'WF-DN-2024-0002', clientId: 'WF-CLI-002', projectId: 'WF-PROJ-002', date: '2024-07-22', status: 'Completado', locationId: 'LOC-001', items: [{itemId: 'ITEM-002', quantity: 20}, {itemId: 'ITEM-003', quantity: 15}] },
]
const mockInstallationTemplates: PlantillaInstalacion[] = [
  {
    id: 'TPL-001',
    nombre: 'Instalación Básica GPS Autobús Urbano',
    tipo_vehiculo: 'autobuses',
    descripcion: 'Plantilla estándar para la instalación del sistema de seguimiento GPS en autobuses urbanos. Incluye la unidad central y la antena.',
    tiempo_estimado_horas: 2.5,
    num_tecnicos_requeridos: 1,
    activa: true,
    version: 1,
    fecha_creacion: '2023-10-15T09:00:00Z',
    materiales: [
      { id: 'MAT-001', material_id: 'ITEM-100', cantidad_estandar: 1, opcional: false }, // Kit de Instalación Básico
    ],
    herramientas: [
      { id: 'HER-001', herramienta: 'Juego de destornilladores de precisión', obligatoria: true },
      { id: 'HER-002', herramienta: 'Multímetro digital', obligatoria: true },
      { id: 'HER-003', herramienta: 'Taladro inalámbrico con juego de brocas', obligatoria: true },
    ],
  },
  {
    id: 'TPL-002',
    nombre: 'Instalación Completa Seguridad Camión Larga Distancia',
    tipo_vehiculo: 'camiones',
    descripcion: 'Instalación completa que incluye GPS, 4 cámaras de seguridad y sistema de bloqueo remoto.',
    tiempo_estimado_horas: 6,
    num_tecnicos_requeridos: 2,
    activa: true,
    version: 2,
    fecha_creacion: '2024-02-20T14:30:00Z',
    materiales: [
      { id: 'MAT-002', material_id: 'ITEM-100', cantidad_estandar: 1, opcional: false },
      { id: 'MAT-003', material_id: 'ITEM-006', cantidad_estandar: 4, opcional: false },
      { id: 'MAT-004', material_id: 'ITEM-007', cantidad_estandar: 20, opcional: false },
    ],
    herramientas: [
      { id: 'HER-004', herramienta: 'Juego de llaves de vaso', obligatoria: true },
      { id: 'HER-005', herramienta: 'Herramienta de crimpado de terminales', obligatoria: true },
    ],
  },
];
const mockReplanteos: Replanteo[] = [
  {
    id: 'RE-001',
    proyecto_id: 'WF-PROJ-001',
    vehiculo_identificacion: 'Autobús #345',
    matricula: '1234 ABC',
    fecha_replanteo: '2024-07-10',
    tecnico_responsable_id: 'WF-TECH-001',
    plantilla_base_id: 'TPL-001',
    tiempo_estimado_ajustado: 3.0,
    observaciones: 'El espacio para la CPU es reducido, se necesita un soporte de montaje modificado. Se requiere cableado adicional.',
    estado: 'Completado',
    materiales: [
      { id: 'RE-MAT-001', replanteo_id: 'RE-001', material_id: 'ITEM-100', cantidad_prevista: 1 },
      { id: 'RE-MAT-002', replanteo_id: 'RE-001', material_id: 'ITEM-002', cantidad_prevista: 1, justificacion_cambio: 'Soporte estándar no cabe' },
      { id: 'RE-MAT-003', replanteo_id: 'RE-001', material_id: 'ITEM-007', cantidad_prevista: 2, justificacion_cambio: 'Extensión de cableado necesaria' }
    ],
    imagenes: [
      { id: 'RE-IMG-001', replanteo_id: 'RE-001', tipo: 'estado_inicial', url_imagen: 'https://placehold.co/600x400.png', descripcion: 'Vista del salpicadero antes de la instalación.' },
      { id: 'RE-IMG-002', replanteo_id: 'RE-001', tipo: 'esquema', url_imagen: 'https://placehold.co/600x400.png', descripcion: 'Diagrama de la nueva ubicación de la CPU.' }
    ]
  },
  {
    id: 'RE-002',
    proyecto_id: 'WF-PROJ-001',
    vehiculo_identificacion: 'Autobús #346',
    matricula: '1235 ABC',
    fecha_replanteo: '2024-07-11',
    tecnico_responsable_id: 'WF-TECH-002',
    plantilla_base_id: 'TPL-001',
    tiempo_estimado_ajustado: 2.5,
    observaciones: 'Instalación estándar. Sin desviaciones.',
    estado: 'Pendiente',
    materiales: [
      { id: 'RE-MAT-004', replanteo_id: 'RE-002', material_id: 'ITEM-100', cantidad_prevista: 1 }
    ],
    imagenes: []
  }
];

// --- Firestore Data Fetching Logic ---

async function getData<T>(collectionName: string, mockData: T[]): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    if (querySnapshot.empty) {
      console.warn(`Firestore collection '${collectionName}' is empty. Using mock data.`);
      return mockData;
    }
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error fetching from Firestore collection '${collectionName}':`, error);
    console.warn(`Falling back to mock data for '${collectionName}'.`);
    return mockData;
  }
}

// --- Exported Data ---
// For now, we export the mock data directly. 
// Once you have data in Firestore, you can switch to the `getData` function.

export const projects: Project[] = mockProjects;
export const inventory: InventoryItem[] = mockInventory;
export const purchaseOrders: PurchaseOrder[] = mockPurchaseOrders;
export const suppliers: Supplier[] = mockSuppliers;
export const clients: Client[] = mockClients;
export const users: User[] = mockUsers;
export const technicians: Technician[] = mockTechnicians;
export const operadores: Operador[] = mockOperadores;
export const locations: Location[] = mockLocations;
export const inventoryLocations: InventoryLocation[] = mockInventoryLocations;
export const deliveryNotes: DeliveryNote[] = mockDeliveryNotes;
export const installationTemplates: PlantillaInstalacion[] = mockInstallationTemplates;
export const replanteos: Replanteo[] = mockReplanteos;


// Generador de notificaciones dinámicas
export const getNotifications = (): Notification[] => {
    const notifications: Notification[] = [];

    // Notificaciones de aprobación de PO
    const pendingPOs = purchaseOrders.filter(po => po.status === 'Pendiente');
    pendingPOs.forEach(po => {
        notifications.push({
            id: `notif-po-${po.id}`,
            title: 'Aprobación Requerida',
            description: `El pedido ${po.id} necesita tu revisión.`,
            type: 'alert',
            link: '/purchasing',
            isRead: false
        });
    });

    // Notificaciones de stock bajo
    const lowStockItems = inventory.filter(item => {
        if (item.type === 'composite') return false; // Por ahora, solo items simples
        
        // Calcular la cantidad total de todas las ubicaciones
        const totalQuantity = inventoryLocations
          .filter(loc => loc.itemId === item.id)
          .reduce((sum, loc) => sum + loc.quantity, 0);

        return totalQuantity < item.minThreshold;
    });
    lowStockItems.forEach(item => {
        notifications.push({
            id: `notif-stock-${item.id}`,
            title: 'Stock Bajo',
            description: `El artículo ${item.name} (${item.sku}) está por debajo del umbral.`,
            type: 'info',
            link: '/inventory',
            isRead: false
        });
    });
    
    return notifications;
}
