

import { Timestamp } from "firebase/firestore";

export type Project = {
  id: string;
  codigo_proyecto: string;
  name: string;
  clientId: string;
  client: string; 
  status: 'Planificado' | 'En Progreso' | 'Completado';
  operador_ids?: string[];
  startDate: string; 
  endDate: string; 
  budget?: number; 
  spent?: number; 
  margen_previsto?: number;
  centro_coste: string;
  responsable_proyecto_id?: string; 
  equipo_tecnico_ids?: string[];
  numero_vehiculos: number;
  tipo_flota: 'autobuses' | 'camiones' | 'furgonetas' | 'otros';
  localizacion_base: {
    direccion: string;
    ciudad: string;
    provincia: string;
    coordenadas: { lat: number; lng: number };
  };
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  supplierProductCode?: string; // Código del producto según el proveedor
  family?: string; // Familia o categoría del producto
  unitCost: number;
  unit: 'ud' | 'ml';
  suppliers?: string[]; // Lista de IDs de proveedores asociados
  type: 'simple' | 'composite' | 'service';
  observations?: string;
  components?: {
    itemId: string;
    quantity: number;
  }[];
  quantity?: number; // Should be calculated, not stored
  minThreshold?: number; // Umbral mínimo para alertas de stock bajo
  isImport?: boolean; // Indica si el producto es de importación
};

export type PurchaseOrderItem = {
  itemId?: string;
  itemSku?: string;
  itemName: string;
  quantity: number;
  price: number;
  unit: string;
  type: 'Material' | 'Servicio';
  supplierProductCode?: string; // Código del producto del proveedor
};

export type StatusHistoryEntry = {
  status: PurchaseOrder['status'];
  date: string | Timestamp;
  comment?: string;
};

// Estructura para albaranes almacenados en Base64
export type DeliveryNoteAttachment = {
  fileName: string;
  fileType: string;
  fileSize: number;
  data: string; // Contenido en Base64
  uploadedAt: string | Timestamp;
};

export type PurchaseOrder = {
  id: string;
  orderNumber?: string;
  project: string;
  supplier: string;
  deliveryLocationId: string;
  status: 'Pendiente de Aprobación' | 'Aprobada' | 'Enviada al Proveedor' | 'Recibida' | 'Recibida Parcialmente' | 'Rechazado';
  date: string | Timestamp;
  estimatedDeliveryDate: string | Timestamp;
  total: number;
  items: PurchaseOrderItem[];
  rejectionReason?: string;
  receptionNotes?: string;
  statusHistory?: StatusHistoryEntry[];
  originalOrderId?: string; // ID de la orden original si esta es un backorder
  backorderIds?: string[]; // IDs de los backorders generados desde esta orden
  deliveryNotes?: DeliveryNoteAttachment[]; // Albaranes adjuntos en Base64
  hasDeliveryNotes?: boolean;
  lastDeliveryNoteUpload?: string | Timestamp;
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
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  providerId?: string;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
  role?: 'Administrador' | 'Empleado' | 'Almacén';
  permissions?: string[]; 
};

export type Supervisor = {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    notes?: string;
};

export type OperadorDepot = {
  id?: string;
  name: string;
  address: string;
};

// Tipo para Operadores (dueños de flotas)
export type Operador = {
  id: string;
  name: string;
  cif?: string;
  phone?: string;
  email?: string;
  address?: string; // Dirección fiscal
  notes?: string;
  depots?: OperadorDepot[]; // Cocheras / Bases operativas
};

export type OperadorRates = {
    rateWorkHour?: number;
    rateTravelHour?: number;
    rateOvertimeWeekdayDay?: number;
    rateOvertimeWeekdayNight?: number;
    rateOvertimeWeekendDay?: number;
    rateOvertimeWeekendNight?: number;
    rateNotes?: string;
}

export type TechnicianCategory = 
 | 'Técnico Ayudante / Auxiliar'
 | 'Técnico Instalador'
 | 'Técnico Integrador de Sistemas Embarcados'
 | 'Técnico de Puesta en Marcha y Pruebas'
 | 'Técnico de Mantenimiento'
 | 'Jefe de Equipo / Encargado de Instalación'
 | 'Técnico de SAT (Servicio de Asistencia Técnica)'
 | 'Técnico de Calidad / Certificación';

export type Technician = {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    specialty: string;
    category: TechnicianCategory;
    notes?: string;
    rates?: OperadorRates;
}

export type Location = {
  id: string;
  name: string;
  description?: string;
  type: 'physical' | 'mobile';
  street?: string;
  number?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  technicianId?: string; // Optional: associated technician for mobile warehouses
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

// Nuevos tipos para Plantillas de Instalación
export type PlantillaInstalacionMaterial = {
  id: string;
  material_id: string; // Foreign key a InventoryItem
  cantidad_estandar: number;
  opcional: boolean;
};

export type PlantillaInstalacionHerramienta = {
  id: string;
  herramienta: string;
  obligatoria: boolean;
};

export type PlantillaInstalacion = {
  id: string;
  nombre: string;
  tipo_vehiculo: 'autobuses' | 'camiones' | 'furgonetas' | 'otros';
  descripcion: string;
  tiempo_estimado_horas: number;
  num_tecnicos_requeridos: number;
  activa: boolean;
  version: number;
  fecha_creacion: string;
  materiales: PlantillaInstalacionMaterial[];
  herramientas: PlantillaInstalacionHerramienta[];
};

// Nuevos tipos para Informe de Replanteo
export type ReplanteoMaterial = {
  id: string;
  replanteo_id: string;
  material_id: string;
  cantidad_prevista: number;
  justificacion_cambio?: string;
};

export type ReplanteoImagen = {
  id: string;
  replanteo_id: string;
  tipo: 'estado_inicial' | 'esquema' | 'detalle';
  url_imagen: string;
  descripcion: string;
};

export type Replanteo = {
  id: string;
  proyecto_id: string;
  vehiculo_identificacion: string;
  matricula: string;
  fecha_replanteo: string;
  tecnico_responsable_id: string;
  plantilla_base_id: string;
  tiempo_estimado_ajustado: number;
  observaciones: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado';
  materiales: ReplanteoMaterial[];
  imagenes: ReplanteoImagen[];
};

// --- Tipos para los nuevos módulos ---

export type SupplierInvoice = {
  id: string;
  purchaseOrderIds: string[];
  deliveryNoteId?: string;
  invoiceNumber: string;
  supplierId: string;
  emissionDate: string | Date;
  dueDate: string | Date;
  bases: { baseAmount: number; vatRate: number }[];
  vatAmount: number;
  totalAmount: number;
  status: 'Pendiente de validar' | 'Validada' | 'Disputada' | 'Pendiente de pago' | 'Pagada';
  attachment?: DeliveryNoteAttachment;
  notes?: string;
};

export type Payment = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  dueDate: string;
  amountDue: number;
  paymentMethod: 'Transferencia' | 'Confirming' | 'Otro';
  status: 'Pendiente' | 'Pagado parcialmente' | 'Pagado total';
  paymentHistory?: {
    date: string;
    amount: number;
    reference: string;
  }[];
};
