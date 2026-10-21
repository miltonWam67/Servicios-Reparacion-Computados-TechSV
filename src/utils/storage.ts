import { Client, Technician, SparePart, ServiceOrder, Payment, OrderStatus, Priority, DeviceType, DeviceCategory } from '../types';
import { INITIAL_CLIENTS, INITIAL_TECHNICIANS, INITIAL_SPARE_PARTS, INITIAL_ORDERS, INITIAL_PAYMENTS } from './initialData';

export const STORAGE_KEYS = {
  CLIENTS: 'techfix_clients',
  TECHNICIANS: 'techfix_technicians',
  SPARE_PARTS: 'techfix_spare_parts',
  ORDERS: 'techfix_service_orders',
  PAYMENTS: 'techfix_payments'
};

export const INITIAL_DATA = {
  clients: INITIAL_CLIENTS,
  technicians: INITIAL_TECHNICIANS,
  spareParts: INITIAL_SPARE_PARTS,
  orders: INITIAL_ORDERS,
  payments: INITIAL_PAYMENTS
};

export const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error loading from localStorage [${key}]:`, error);
    return defaultValue;
  }
};

export const setStoredData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage [${key}]:`, error);
  }
};

export const loadFromStorage = getStoredData;
export const saveToStorage = setStoredData;


// Initializers with defaults
export const loadClients = (): Client[] => getStoredData(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
export const saveClients = (clients: Client[]): void => setStoredData(STORAGE_KEYS.CLIENTS, clients);

export const loadTechnicians = (): Technician[] => getStoredData(STORAGE_KEYS.TECHNICIANS, INITIAL_TECHNICIANS);
export const saveTechnicians = (techs: Technician[]): void => setStoredData(STORAGE_KEYS.TECHNICIANS, techs);

export const loadSpareParts = (): SparePart[] => getStoredData(STORAGE_KEYS.SPARE_PARTS, INITIAL_SPARE_PARTS);
export const saveSpareParts = (parts: SparePart[]): void => setStoredData(STORAGE_KEYS.SPARE_PARTS, parts);

export const loadOrders = (): ServiceOrder[] => getStoredData(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
export const saveOrders = (orders: ServiceOrder[]): void => setStoredData(STORAGE_KEYS.ORDERS, orders);

export const loadPayments = (): Payment[] => getStoredData(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
export const savePayments = (payments: Payment[]): void => setStoredData(STORAGE_KEYS.PAYMENTS, payments);

export const resetToInitialData = (): void => {
  saveClients(INITIAL_CLIENTS);
  saveTechnicians(INITIAL_TECHNICIANS);
  saveSpareParts(INITIAL_SPARE_PARTS);
  saveOrders(INITIAL_ORDERS);
  savePayments(INITIAL_PAYMENTS);
};

export const exportAllData = () => {
  const data = {
    clients: loadClients(),
    technicians: loadTechnicians(),
    spareParts: loadSpareParts(),
    orders: loadOrders(),
    payments: loadPayments(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `techfix-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Formatting helpers
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
};

export const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  recibida: { label: 'Recibida', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  en_diagnostico: { label: 'En Diagnóstico', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  presupuesto_pendiente: { label: 'Presupuesto Pendiente', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  en_reparacion: { label: 'En Reparación', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  esperando_repuesto: { label: 'Esperando Repuesto', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  pruebas_calidad: { label: 'Pruebas de Calidad', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  lista_entrega: { label: 'Lista para Entrega', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  entregada: { label: 'Entregada y Finalizada', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  cancelada: { label: 'Cancelada', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' }
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; badge: string }> = {
  baja: { label: 'Baja', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  media: { label: 'Media', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  alta: { label: 'Alta', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  urgente: { label: 'Urgente', badge: 'bg-red-100 text-red-800 border-red-300 animate-pulse' }
};

export const DEVICE_CATEGORY_LABELS: Record<DeviceCategory, string> = {
  laptop: 'Laptop / Portátil',
  desktop: 'PC de Escritorio / Torre',
  'all-in-one': 'Todo en Uno (All-in-One)',
  servidor: 'Servidor / Workstation',
  impresora_laser: 'Impresora Láser (MFP/Mono/Color)',
  impresora_tinta: 'Impresora Tinta Continua / EcoTank',
  impresora_termica: 'Impresora Térmica / Tickets / POS',
  plotter: 'Plotter / Gran Formato',
  otro: 'Otro Dispositivo'
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia Bancaria',
  tarjeta: 'Tarjeta Débito/Crédito',
  pago_movil: 'Pago Móvil / QR',
  otro: 'Otro Medio'
};

// Calculate order total
export const calculateOrderTotal = (
  laborCost: number,
  parts: { totalPrice: number }[],
  discount: number,
  taxRate: number
): { subtotal: number; partsTotal: number; discountAmount: number; taxAmount: number; total: number } => {
  const partsTotal = parts.reduce((acc, p) => acc + (p.totalPrice || 0), 0);
  const subtotal = laborCost + partsTotal;
  const taxableBase = Math.max(0, subtotal - (discount || 0));
  const taxAmount = taxableBase * (taxRate || 0);
  const total = Number((taxableBase + taxAmount).toFixed(2));

  return {
    subtotal,
    partsTotal,
    discountAmount: discount || 0,
    taxAmount,
    total
  };
};
