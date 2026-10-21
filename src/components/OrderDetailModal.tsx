import React, { useState } from 'react';
import { 
  X, 
  Laptop, 
  Printer, 
  User, 
  Clock, 
  Plus, 
  Trash2, 
  DollarSign, 
  Printer as PrintIcon, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Package,
  Wrench
} from 'lucide-react';
import { ServiceOrder, Client, Technician, SparePart, OrderStatus, Priority } from '../types';
import { 
  formatCurrency, 
  formatDateTime, 
  formatDate,
  STATUS_CONFIG, 
  PRIORITY_CONFIG, 
  DEVICE_CATEGORY_LABELS,
  calculateOrderTotal 
} from '../utils/storage';

interface OrderDetailModalProps {
  order: ServiceOrder;
  clients: Client[];
  technicians: Technician[];
  spareParts: SparePart[];
  onClose: () => void;
  onUpdateOrder: (updatedOrder: ServiceOrder) => void;
  onAddPartToOrder: (orderId: string, partId: string, quantity: number) => void;
  onRemovePartFromOrder: (orderId: string, partIndex: number) => void;
  onOpenPaymentModal: (order: ServiceOrder) => void;
  onPrintOrder: (order: ServiceOrder) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  clients,
  technicians,
  spareParts,
  onClose,
  onUpdateOrder,
  onAddPartToOrder,
  onRemovePartFromOrder,
  onOpenPaymentModal,
  onPrintOrder
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'parts' | 'diagnosis' | 'logs'>('info');
  const [newLogNote, setNewLogNote] = useState('');
  const [logAuthor, setLogAuthor] = useState('');

  // Parts addition state
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  // Editable diagnosis & labor
  const [isEditingCosts, setIsEditingCosts] = useState(false);
  const [laborCostInput, setLaborCostInput] = useState(order.laborCost);
  const [discountInput, setDiscountInput] = useState(order.discount);
  const [taxRateInput, setTaxRateInput] = useState(order.taxRate);

  const [diagnosisInput, setDiagnosisInput] = useState(order.technicalDiagnosis);
  const [repairDetailsInput, setRepairDetailsInput] = useState(order.repairDetails);

  const client = clients.find(c => c.id === order.clientId);
  const tech = technicians.find(t => t.id === order.technicianId);
  const statusMeta = STATUS_CONFIG[order.status];
  const priorityMeta = PRIORITY_CONFIG[order.priority];
  const balance = Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0));

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === order.status) return;

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: tech?.name || 'Sistema / Técnico',
      status: newStatus,
      note: `Estado actualizado a "${STATUS_CONFIG[newStatus].label}"`
    };

    const updated: ServiceOrder = {
      ...order,
      status: newStatus,
      completedAt: (newStatus === 'lista_entrega' || newStatus === 'entregada') && !order.completedAt 
        ? new Date().toISOString() 
        : order.completedAt,
      deliveredAt: newStatus === 'entregada' && !order.deliveredAt 
        ? new Date().toISOString() 
        : order.deliveredAt,
      logs: [newLog, ...(order.logs || [])]
    };

    onUpdateOrder(updated);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: logAuthor.trim() || tech?.name || 'Técnico de Taller',
      status: order.status,
      note: newLogNote.trim()
    };

    const updated: ServiceOrder = {
      ...order,
      logs: [newLog, ...(order.logs || [])]
    };

    onUpdateOrder(updated);
    setNewLogNote('');
  };

  const handleAddPart = () => {
    if (!selectedPartId || partQty <= 0) return;
    onAddPartToOrder(order.id, selectedPartId, partQty);
    setSelectedPartId('');
    setPartQty(1);
  };

  const handleSaveCostsAndDiagnosis = () => {
    const calculated = calculateOrderTotal(
      Number(laborCostInput) || 0,
      order.usedParts,
      Number(discountInput) || 0,
      Number(taxRateInput) || 0
    );

    const updated: ServiceOrder = {
      ...order,
      laborCost: Number(laborCostInput) || 0,
      discount: Number(discountInput) || 0,
      taxRate: Number(taxRateInput) || 0,
      totalAmount: calculated.total,
      technicalDiagnosis: diagnosisInput,
      repairDetails: repairDetailsInput,
      paymentStatus: (order.amountPaid >= calculated.total && calculated.total > 0) 
        ? 'pagado' 
        : order.amountPaid > 0 
        ? 'parcial' 
        : 'pendiente'
    };

    onUpdateOrder(updated);
    setIsEditingCosts(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              order.deviceType === 'computadora' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {order.deviceType === 'computadora' ? (
                <Laptop className="w-5 h-5 text-white" />
              ) : (
                <Printer className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">{order.id}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${priorityMeta.badge}`}>
                  {priorityMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {order.brand} {order.model} &bull; Ingresado el {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintOrder(order)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Imprimir Orden"
            >
              <PrintIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Status Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Estado Actual:</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              className={`px-3 py-1.5 rounded-xl font-bold border text-xs focus:outline-none cursor-pointer ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
            >
              <option value="recibida">Recibida</option>
              <option value="en_diagnostico">En Diagnóstico</option>
              <option value="presupuesto_pendiente">Presupuesto Pendiente</option>
              <option value="en_reparacion">En Reparación</option>
              <option value="esperando_repuesto">Esperando Repuesto</option>
              <option value="pruebas_calidad">Pruebas de Calidad</option>
              <option value="lista_entrega">Lista para Entrega</option>
              <option value="entregada">Entregada y Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Balance summary */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-500 mr-1">Total:</span>
              <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1">Abonado:</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(order.amountPaid)}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1">Saldo:</span>
              <span className={`font-bold ${balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {balance > 0 ? formatCurrency(balance) : 'Liquidado'}
              </span>
            </div>
            {balance > 0 && (
              <button
                onClick={() => onOpenPaymentModal(order)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded-lg shadow-xs transition-all flex items-center gap-1 active:scale-95"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Cobrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex space-x-6 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Equipo & Cliente</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'diagnosis' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Diagnóstico & Trabajo</span>
          </button>

          <button
            onClick={() => setActiveTab('parts')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors relative ${
              activeTab === 'parts' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Repuestos & Costos</span>
            {order.usedParts?.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Bitácora ({order.logs?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* Client & Tech Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" /> Datos del Cliente
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{client?.documentId}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 text-sm">{client?.name}</div>
                    <div className="text-slate-600">Tel: <span className="font-medium text-slate-800">{client?.phone}</span></div>
                    <div className="text-slate-600">Email: {client?.email}</div>
                    <div className="text-slate-600 truncate">Dir: {client?.address}</div>
                    {client?.company && <div className="text-slate-500 text-[11px]">Empresa: {client.company}</div>}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-600" /> Técnico Responsable
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold uppercase">{tech?.specialty}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 text-sm">{tech?.name}</div>
                    <div className="text-slate-600">Tel: {tech?.phone}</div>
                    <div className="text-slate-600">Email: {tech?.email}</div>
                    <div className="text-slate-500 text-[11px]">
                      Comisión mano de obra: {tech?.commissionRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Detailed Spec */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Especificaciones del Dispositivo
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Tipo:</span>
                    <span className="font-semibold capitalize text-slate-800">{order.deviceType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Categoría:</span>
                    <span className="font-semibold text-slate-800">
                      {DEVICE_CATEGORY_LABELS[order.deviceCategory] || order.deviceCategory}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Marca & Modelo:</span>
                    <span className="font-semibold text-slate-800">{order.brand} {order.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Número de Serie:</span>
                    <span className="font-mono font-semibold text-slate-800">{order.serialNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">PIN / Contraseña:</span>
                    <span className="font-mono text-slate-800">{order.passwordOrPin || 'Sin contraseña'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fecha Promesa:</span>
                    <span className="font-semibold text-slate-800">{formatDate(order.estimatedCompletionDate)}</span>
                  </div>
                </div>

                {/* Accessories */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-1.5 font-medium">Accesorios dejados en recepción:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {order.accessoriesIncluded && order.accessoriesIncluded.length > 0 ? (
                      order.accessoriesIncluded.map((acc, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                          {acc}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Ningún accesorio dejado</span>
                    )}
                  </div>
                </div>

                {/* Physical condition notes */}
                {order.physicalConditionNotes && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-1 font-medium">Condición física reportada en recepción:</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {order.physicalConditionNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Reported Fault */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1.5">
                <span className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Falla Reportada por el Cliente
                </span>
                <p className="text-slate-800 font-medium text-xs sm:text-sm">
                  {order.reportedFault}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DIAGNOSIS & REPAIRS */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Diagnóstico Técnico Detallado:
                </label>
                <textarea
                  rows={4}
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  placeholder="Escriba las causas raíz encontradas, pruebas realizadas, mediciones de voltaje, temperaturas..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Trabajo Realizado / Procedimiento de Solución:
                </label>
                <textarea
                  rows={4}
                  value={repairDetailsInput}
                  onChange={(e) => setRepairDetailsInput(e.target.value)}
                  placeholder="Detalle los servicios ejecutados: limpieza ultrasónica, cambio de fusor, pasta térmica, reinstalación..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveCostsAndDiagnosis}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-xs transition-all"
                >
                  Guardar Diagnóstico y Notas Técnicas
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SPARE PARTS & COSTS */}
          {activeTab === 'parts' && (
            <div className="space-y-5">
              
              {/* Add Part from Inventory */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Asignar Repuesto del Inventario a esta Orden
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-8">
                    <select
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Seleccionar Repuesto disponible --</option>
                      {spareParts.map(p => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.name} [{p.sku}] - {formatCurrency(p.sellingPrice)} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={partQty}
                      onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="Cantidad"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddPart}
                      disabled={!selectedPartId}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Consumed Parts Table */}
              <div>
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block mb-2">
                  Repuestos Asignados a la Orden ({order.usedParts?.length || 0})
                </span>

                {(!order.usedParts || order.usedParts.length === 0) ? (
                  <p className="text-xs text-slate-400 py-4 text-center border border-dashed rounded-xl">
                    No se han cargado repuestos a esta orden de servicio.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Repuesto</th>
                          <th className="px-3 py-2 text-center">Cant.</th>
                          <th className="px-3 py-2 text-right">P. Unitario</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                          <th className="px-3 py-2 text-center">Quitar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {order.usedParts.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2 font-medium text-slate-800">
                              {item.name}
                              <span className="text-[10px] text-slate-400 ml-1 font-mono">[{item.sku}]</span>
                            </td>
                            <td className="px-3 py-2 text-center font-bold">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900">{formatCurrency(item.totalPrice)}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => onRemovePartFromOrder(order.id, index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                title="Quitar repuesto y devolver a stock"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Financial Calculation & Costs Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Desglose Económico del Servicio
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingCosts(!isEditingCosts)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {isEditingCosts ? 'Cancelar edición' : 'Modificar valores'}
                  </button>
                </div>

                {isEditingCosts ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Mano de Obra ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={laborCostInput}
                        onChange={(e) => setLaborCostInput(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Descuento ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Tasa IVA (ej: 0.16):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={taxRateInput}
                        onChange={(e) => setTaxRateInput(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3 flex justify-end">
                      <button
                        onClick={handleSaveCostsAndDiagnosis}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded-lg text-xs"
                      >
                        Aplicar Cambios de Costo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Mano de Obra Técnica:</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(order.laborCost)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Repuestos e Insumos:</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(order.usedParts?.reduce((s, p) => s + (p.totalPrice || 0), 0) || 0)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Descuento aplicado:</span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    {order.taxRate > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Impuesto / IVA ({order.taxRate * 100}%):</span>
                        <span>
                          {formatCurrency(
                            Math.max(0, (order.laborCost + (order.usedParts?.reduce((s, p) => s + (p.totalPrice || 0), 0) || 0) - order.discount)) * order.taxRate
                          )}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                      <span>Total Liquidación:</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LOGS & TIMELINE */}
          {activeTab === 'logs' && (
            <div className="space-y-5">
              {/* Add Note form */}
              <form onSubmit={handleAddLog} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Registrar Nota Técnica en la Bitácora
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={logAuthor}
                    onChange={(e) => setLogAuthor(e.target.value)}
                    placeholder="Autor (ej. Ing. Carlos Méndez)"
                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newLogNote}
                    onChange={(e) => setNewLogNote(e.target.value)}
                    placeholder="Escriba el avance técnico, resultado de prueba o nota..."
                    className="sm:col-span-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Avance</span>
                  </button>
                </div>
              </form>

              {/* Timeline list */}
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                {order.logs && order.logs.map((log) => {
                  const logStatus = STATUS_CONFIG[log.status] || STATUS_CONFIG.recibida;
                  return (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600" />
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{log.author}</span>
                          <span className="text-[10px] text-slate-400">{formatDateTime(log.timestamp)}</span>
                        </div>
                        <p className="text-slate-600">{log.note}</p>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold border ${logStatus.bg} ${logStatus.text} ${logStatus.border}`}>
                          {logStatus.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            ID de Orden: <span className="font-mono font-bold text-slate-800">{order.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintOrder(order)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <PrintIcon className="w-3.5 h-3.5" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
