import React from 'react';
import { 
  Laptop, 
  Printer, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Package, 
  Plus, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { ServiceOrder, Client, Technician, SparePart, Payment } from '../types';
import { formatCurrency, STATUS_CONFIG, PRIORITY_CONFIG } from '../utils/storage';

interface DashboardViewProps {
  orders: ServiceOrder[];
  clients: Client[];
  technicians: Technician[];
  spareParts: SparePart[];
  payments: Payment[];
  onNewOrder: () => void;
  onSelectOrder: (order: ServiceOrder) => void;
  onNavigate: (view: string) => void;
  onQuickPay: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  clients,
  technicians,
  spareParts,
  payments,
  onNewOrder,
  onSelectOrder,
  onNavigate,
  onQuickPay
}) => {
  // Calculations
  const activeOrders = orders.filter(o => o.status !== 'entregada' && o.status !== 'cancelada');
  const readyOrders = orders.filter(o => o.status === 'lista_entrega');
  const waitingPartsOrders = orders.filter(o => o.status === 'esperando_repuesto');
  const diagnosingOrders = orders.filter(o => o.status === 'en_diagnostico');
  const repairingOrders = orders.filter(o => o.status === 'en_reparacion' || o.status === 'pruebas_calidad');

  const computerOrders = activeOrders.filter(o => o.deviceType === 'computadora');
  const printerOrders = activeOrders.filter(o => o.deviceType === 'impresora');

  // Finances
  const totalBilled = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingReceivable = orders.reduce((sum, o) => {
    if (o.status === 'cancelada') return sum;
    return sum + Math.max(0, (o.totalAmount || 0) - (o.amountPaid || 0));
  }, 0);

  // Low stock
  const lowStockParts = spareParts.filter(p => p.stock <= p.minStock);

  // Client lookup
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente no asignado';
  };

  const getTechName = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? tech.name : 'Sin asignar';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-700/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Taller Operativo en Vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Control de Reparación y Mantenimiento
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Gestión en tiempo real de computadoras, laptops, impresoras láser y tinta, inventario y estados de cuenta.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-dash-new-order"
            onClick={onNewOrder}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ingresar Equipo</span>
          </button>

          <button
            id="btn-dash-quick-pay"
            onClick={onQuickPay}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            <span>Registrar Cobro</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Orders Card */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Órdenes Activas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
            {activeOrders.length}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Laptop className="w-3.5 h-3.5 text-blue-600" /> {computerOrders.length} PCs
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Printer className="w-3.5 h-3.5 text-emerald-600" /> {printerOrders.length} Impresoras
            </span>
          </div>
        </div>

        {/* Ready for Delivery Card */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Listas para Entrega</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mb-1">
            {readyOrders.length}
          </div>
          <p className="text-xs text-slate-500">
            Equipos reparados listos para entrega al cliente
          </p>
        </div>

        {/* Pending Accounts Receivable Card */}
        <div 
          onClick={() => onNavigate('accounts')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Por Cobrar (Saldo)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mb-1">
            {formatCurrency(pendingReceivable)}
          </div>
          <p className="text-xs text-slate-500">
            Pendiente en cuentas de clientes en tiempo real
          </p>
        </div>

        {/* Low Stock Alerts Card */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-rose-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Crítico</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-black mb-1 ${lowStockParts.length > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {lowStockParts.length} repuestos
          </div>
          <p className="text-xs text-slate-500">
            {lowStockParts.length > 0 ? 'Por debajo del nivel mínimo de seguridad' : 'Inventario con existencias suficientes'}
          </p>
        </div>
      </div>

      {/* Operational Workflow Summary & Equipment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Pipeline Tracker */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Flujo Operativo de Reparaciones
            </h2>
            <button 
              onClick={() => onNavigate('orders')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Ver todas ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500">En Diagnóstico</span>
              <span className="text-xl font-bold text-slate-800 mt-1">{diagnosingOrders.length}</span>
              <span className="text-[10px] text-slate-400 mt-1">Revisión técnica</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col">
              <span className="text-[11px] font-semibold text-blue-700">En Reparación</span>
              <span className="text-xl font-bold text-blue-900 mt-1">{repairingOrders.length}</span>
              <span className="text-[10px] text-blue-600/80 mt-1">Mano de obra activa</span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 flex flex-col">
              <span className="text-[11px] font-semibold text-rose-700">Esperando Repuesto</span>
              <span className="text-xl font-bold text-rose-900 mt-1">{waitingPartsOrders.length}</span>
              <span className="text-[10px] text-rose-600/80 mt-1">Pieza en pedido</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col">
              <span className="text-[11px] font-semibold text-emerald-700">Lista Retiro</span>
              <span className="text-xl font-bold text-emerald-900 mt-1">{readyOrders.length}</span>
              <span className="text-[10px] text-emerald-600/80 mt-1">Pruebas OK</span>
            </div>
          </div>

          {/* Quick breakdown bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Proporción de Equipos en Servicio</span>
              <span>{computerOrders.length + printerOrders.length} en proceso</span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-600 h-full transition-all"
                style={{ 
                  width: `${activeOrders.length === 0 ? 50 : Math.round((computerOrders.length / activeOrders.length) * 100)}%` 
                }}
                title={`Computadoras: ${computerOrders.length}`}
              />
              <div 
                className="bg-emerald-500 h-full transition-all"
                style={{ 
                  width: `${activeOrders.length === 0 ? 50 : Math.round((printerOrders.length / activeOrders.length) * 100)}%` 
                }}
                title={`Impresoras: ${printerOrders.length}`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                <span>Computadoras ({computerOrders.length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Impresoras ({printerOrders.length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Financial Quick Glance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Resumen de Caja
              </h2>
              <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                Tiempo Real
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-xs text-slate-600">Total Cobrado (Ingresos):</span>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalCollected)}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-xs text-slate-600">Total Facturado en Órdenes:</span>
                <span className="text-sm font-semibold text-slate-800">{formatCurrency(totalBilled)}</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                <span className="text-xs text-slate-600">Saldo Pendiente por Cobrar:</span>
                <span className="text-sm font-bold text-amber-600">{formatCurrency(pendingReceivable)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-600">Pagos Registrados:</span>
                <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {payments.length} transacciones
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigate('accounts')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Ver Estados de Cuenta Detallados</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders In Progress and Attention Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Órdenes de Servicio en Curso
            </h2>
            <p className="text-xs text-slate-500">
              Equipos actualmente ingresados en laboratorio técnico
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto flex items-center gap-1"
          >
            <span>Ver Tablero Completo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-3">Orden & Tipo</th>
                <th className="px-4 py-3">Equipo & Marca</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Falla / Síntoma</th>
                <th className="px-4 py-3">Técnico</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Saldo</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeOrders.slice(0, 6).map((order) => {
                const statusMeta = STATUS_CONFIG[order.status];
                const priorityMeta = PRIORITY_CONFIG[order.priority];
                const balance = Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0));

                return (
                  <tr 
                    key={order.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {order.deviceType === 'computadora' ? (
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Laptop className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Printer className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{order.id}</div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${priorityMeta.badge}`}>
                            {priorityMeta.label}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{order.brand} {order.model}</div>
                      <div className="text-[11px] text-slate-400 font-mono">S/N: {order.serialNumber}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">{getClientName(order.clientId)}</div>
                    </td>

                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="truncate text-slate-600" title={order.reportedFault}>
                        {order.reportedFault}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {getTechName(order.technicianId)}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                        {statusMeta.label}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {balance > 0 ? (
                        <span className="font-bold text-amber-600">{formatCurrency(balance)}</span>
                      ) : (
                        <span className="font-semibold text-emerald-600">Pagado</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Inventory & Technicians Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alert Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Alerta de Repuestos por Agotarse
              </h2>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Ver inventario
            </button>
          </div>

          <div className="space-y-2">
            {lowStockParts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Todos los repuestos tienen niveles óptimos de stock.
              </p>
            ) : (
              lowStockParts.map(part => (
                <div 
                  key={part.id} 
                  className="flex items-center justify-between p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs"
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-900 truncate">{part.name}</div>
                    <div className="text-[11px] text-slate-500">SKU: {part.sku} &bull; {part.location}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                      Quedan: {part.stock} (Mín: {part.minStock})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Technician Active Workload */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Disponibilidad de Técnicos
            </h2>
            <button
              onClick={() => onNavigate('technicians')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Ver equipo
            </button>
          </div>

          <div className="space-y-2.5">
            {technicians.map(tech => {
              const assignedOrders = orders.filter(
                o => o.technicianId === tech.id && o.status !== 'entregada' && o.status !== 'cancelada'
              );

              return (
                <div key={tech.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-xs transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${tech.avatarBg} text-white flex items-center justify-center font-bold text-xs`}>
                      {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{tech.name}</div>
                      <div className="text-[11px] text-slate-500 capitalize">
                        Especialidad: {tech.specialty}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-medium">
                      {assignedOrders.length} {assignedOrders.length === 1 ? 'orden' : 'órdenes'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      tech.status === 'disponible' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : tech.status === 'ocupado' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tech.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
