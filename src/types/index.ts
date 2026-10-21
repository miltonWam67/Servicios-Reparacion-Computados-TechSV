export type DeviceType = 'computadora' | 'impresora';

export type DeviceCategory = 
  | 'laptop' 
  | 'desktop' 
  | 'all-in-one' 
  | 'servidor' 
  | 'impresora_laser' 
  | 'impresora_tinta' 
  | 'impresora_termica' 
  | 'plotter'
  | 'otro';

export type OrderStatus = 
  | 'recibida' 
  | 'en_diagnostico' 
  | 'presupuesto_pendiente' 
  | 'en_reparacion' 
  | 'esperando_repuesto' 
  | 'pruebas_calidad' 
  | 'lista_entrega' 
  | 'entregada' 
  | 'cancelada';

export type Priority = 'baja' | 'media' | 'alta' | 'urgente';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'pago_movil' | 'otro';

export type PaymentStatus = 'pendiente' | 'parcial' | 'pagado';

export interface Client {
  id: string;
  name: string;
  documentId: string; // DNI, RUT, RFC o Cédula
  phone: string;
  email: string;
  address: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

export interface Technician {
  id: string;
  name: string;
  specialty: 'computadoras' | 'impresoras' | 'mixto';
  phone: string;
  email: string;
  status: 'disponible' | 'ocupado' | 'vacaciones';
  commissionRate: number; // Porcentaje de comisión por mano de obra (ej: 30%)
  avatarBg: string;
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: 'computadoras' | 'impresoras' | 'general';
  subcategory: string;
  compatibleWith: string;
  stock: number;
  minStock: number;
  costPrice: number;
  sellingPrice: number;
  location: string;
}

export interface OrderUsedPart {
  partId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderLog {
  id: string;
  timestamp: string;
  author: string;
  status: OrderStatus;
  note: string;
}

export interface ServiceOrder {
  id: string; // ej: OS-2025-0101
  clientId: string;
  technicianId: string;
  deviceType: DeviceType;
  deviceCategory: DeviceCategory;
  brand: string;
  model: string;
  serialNumber: string;
  passwordOrPin?: string;
  accessoriesIncluded: string[];
  physicalConditionNotes: string;
  reportedFault: string;
  technicalDiagnosis: string;
  repairDetails: string;
  status: OrderStatus;
  priority: Priority;
  createdAt: string;
  estimatedCompletionDate: string;
  completedAt?: string;
  deliveredAt?: string;
  laborCost: number;
  usedParts: OrderUsedPart[];
  discount: number;
  taxRate: number; // porcentaje (ej: 0.16 para 16% o 0)
  totalAmount: number; // calculada: (laborCost + partsCost - discount) * (1 + taxRate)
  amountPaid: number;
  paymentStatus: PaymentStatus;
  logs: OrderLog[];
}

export interface Payment {
  id: string;
  receiptNumber: string; // ej: REC-2025-045
  serviceOrderId: string;
  clientId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export type ActiveTab = 'dashboard' | 'orders' | 'clients' | 'technicians' | 'inventory' | 'accounts' | 'reports';

