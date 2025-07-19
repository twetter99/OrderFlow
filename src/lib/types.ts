

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
  minThreshold: number;
  unitCost: number;
  unit: 'ud' | 'ml';
  supplier: string;
  type: 'simple' | 'composite' | 'service';
  observations?: string;
  components?: {
    itemId: string;
    quantity: number;
  }[];
  quantity?: number; // Should be calculated, not stored
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
  date: string | Timestamp;
  estimatedDeliveryDate: string | Timestamp;
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

export type UserRole = 
  | 'Solicitante'
  | 'Supervisor'
  | 'Validador'
  | 'Almacén'
  | 'Administrador';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
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

// Tipo para Operadores (Técnicos) con sus tarifas
export type OperadorRates = {
    rateWorkHour?: number;
    rateTravelHour?: number;
    rateOvertimeWeekdayDay?: number;
    rateOvertimeWeekdayNight?: number;
    rateOvertimeWeekendDay?: number;
    rateOvertimeWeekendNight?: number;
    rateNotes?: string;
}

export type Operador = {
  id: string;
  name: string;
  cif?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  rates?: OperadorRates;
};
