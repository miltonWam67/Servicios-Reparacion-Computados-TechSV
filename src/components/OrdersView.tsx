import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Laptop, 
  Printer, 
  Calendar, 
  DollarSign, 
  Printer as PrintIcon, 
  Eye, 
  LayoutList, 
  Kanban,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ServiceOrder, Client, Technician, OrderStatus, DeviceType } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  STATUS_CONFIG, 
  PRIORITY_CONFIG, 
  DEVICE_CATEGORY_LABELS 
} from '../utils/storage';

interface OrdersViewProps {
  orders: ServiceOrder[];
  clients: Client[];
  technicians: Technician[];
  onNewOrder: () => void;
  onSelectOrder: (order: ServiceOrder) => void;
  onPrintOrder: (order: ServiceOrder) => void;
  onQuickStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  clients,
  technicians,
  onNewOrder,
  onSelectOrder,
  onPrintOrder,
  onQuickStatusChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | DeviceType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const clientMap = useMemo(() => {
    return new Map(clients.map(c => [c.id, c]));
  }, [clients]);

  const techMap = useMemo(() => {
    return new Map(technicians.map(t => [t.id, t]));
  }, [technicians]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Device filter
      if (deviceFilter !== 'all' && order.deviceType !== deviceFilter) return false;

      // Status filter
      if (statusFilter === 'active') {
        if (order.status === 'entregada' || order.status === 'cancelada') return false;
      } else if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Tech filter
      if (techFilter !== 'all' && order.technicianId !== techFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const client = clientMap.get(order.clientId);
        const matchId = order.id.toLowerCase().includes(query);
        const matchBrand = order.brand.toLowerCase().includes(query);
        const matchModel = order.model.toLowerCase().includes(query);
        const matchSerial = order.serialNumber.toLowerCase().includes(query);
        const matchFault = order.reportedFault.toLowerCase().includes(query);
        const matchClient = client ? client.name.toLowerCase().includes(query) : false;

        return matchId || matchBrand || matchModel || matchSerial || matchFault || matchClient;
      }

      return true;
    });
  }, [orders, deviceFilter, statusFilter, techFilter, priorityFilter, searchQuery, clientMap]);

  // Kanban groups
  const kanbanColumns: { id: string; label: string; statuses: OrderStatus[]; color: string }[] = [
    { id: 'col-reception', label: '1. Recepción & Diagnóstico', statuses: ['recibida', 'en_diagnostico', 'presupuesto_pendiente'], color: 'border-slate-300 bg-slate-50/50' },
    { id: 'col-repair', label: '2. En Reparación / Pruebas', statuses: ['en_reparacion', 'esperando_repuesto', 'pruebas_calidad'], color: 'border-blue-300 bg-blue-50/30' },
    { id: 'col-ready', label: '3. Lista para Entrega', statuses: ['lista_entrega'], color: 'border-emerald-300 bg-emerald-50/30' },
    { id: 'col-done', label: '4. Finalizadas / Entregadas', statuses: ['entregada', 'cancelada'], color: 'border-slate-200 bg-slate-50/20' }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Órdenes de Servicio Técnico
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Historial detallado y seguimiento en tiempo real de computadoras e impresoras
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista de Tabla"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista Tablero Kanban"
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Tablero</span>
            </button>
          </div>

          <button
            id="btn-create-order-view"
            onClick={onNewOrder}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ingresar Nueva Orden</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Top filter row: Type tabs and search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Equipment Type Quick Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setDeviceFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                deviceFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setDeviceFilter('computadora')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                deviceFilter === 'computadora' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-blue-600" />
              Computadoras ({orders.filter(o => o.deviceType === 'computadora').length})
            </button>
            <button
              onClick={() => setDeviceFilter('impresora')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                deviceFilter === 'impresora' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              Impresoras ({orders.filter(o => o.deviceType === 'impresora').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por OS#, cliente, modelo, serial o falla..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Secondary Filters: Status, Technician, Priority */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Estado: Todos los estados</option>
            <option value="active">Solo Órdenes Activas en Taller</option>
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

          {/* Technician Select */}
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Técnico: Todos los técnicos</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
            ))}
          </select>

          {/* Priority Select */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Prioridad: Todas</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          {(searchQuery || deviceFilter !== 'all' || statusFilter !== 'all' || techFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDeviceFilter('all');
                setStatusFilter('all');
                setTechFilter('all');
                setPriorityFilter('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold text-xs ml-auto"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* View Mode: Table vs Kanban */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Nº Orden</th>
                  <th className="px-4 py-3">Tipo & Equipo</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Falla Reportada</th>
                  <th className="px-4 py-3">Técnico</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Costo / Saldo</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                        <span className="text-sm font-medium">No se encontraron órdenes con los filtros seleccionados.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => {
                    const client = clientMap.get(order.clientId);
                    const tech = techMap.get(order.technicianId);
                    const statusMeta = STATUS_CONFIG[order.status];
                    const priorityMeta = PRIORITY_CONFIG[order.priority];
                    const balance = Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0));

                    return (
                      <tr 
                        key={order.id} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => onSelectOrder(order)}
                      >
                        {/* Order ID & Priority */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                            {order.id}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${priorityMeta.badge}`}>
                              {priorityMeta.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Device details */}
                        <td className="px-4 py-3.5">
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
                              <div className="font-semibold text-slate-900">{order.brand} {order.model}</div>
                              <div className="text-[11px] text-slate-500">
                                {DEVICE_CATEGORY_LABELS[order.deviceCategory] || order.deviceCategory}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Client details */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800">{client ? client.name : 'Cliente no encontrado'}</div>
                          <div className="text-[11px] text-slate-500">{client?.phone || 'Sin teléfono'}</div>
                        </td>

                        {/* Fault */}
                        <td className="px-4 py-3.5 max-w-[240px]">
                          <div className="truncate font-medium text-slate-700" title={order.reportedFault}>
                            {order.reportedFault}
                          </div>
                          {order.technicalDiagnosis && (
                            <div className="text-[11px] text-blue-600 truncate mt-0.5" title={order.technicalDiagnosis}>
                              Diag: {order.technicalDiagnosis}
                            </div>
                          )}
                        </td>

                        {/* Tech */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                          {tech ? tech.name : 'Sin asignar'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={order.status}
                            onChange={(e) => onQuickStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border} focus:outline-none cursor-pointer`}
                          >
                            <option value="recibida">Recibida</option>
                            <option value="en_diagnostico">En Diagnóstico</option>
                            <option value="presupuesto_pendiente">Presupuesto Pendiente</option>
                            <option value="en_reparacion">En Reparación</option>
                            <option value="esperando_repuesto">Esperando Repuesto</option>
                            <option value="pruebas_calidad">Pruebas de Calidad</option>
                            <option value="lista_entrega">Lista para Entrega</option>
                            <option value="entregada">Entregada</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                        </td>

                        {/* Total and Balance */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</div>
                          <div className="text-[11px] mt-0.5">
                            {balance <= 0 ? (
                              <span className="font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Pagado
                              </span>
                            ) : (
                              <span className="font-bold text-amber-600">
                                Debe: {formatCurrency(balance)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onSelectOrder(order)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalle completo"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPrintOrder(order)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Imprimir comprobante"
                            >
                              <PrintIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kanbanColumns.map(col => {
            const colOrders = filteredOrders.filter(o => col.statuses.includes(o.status));

            return (
              <div 
                key={col.id} 
                className={`rounded-2xl border p-3 flex flex-col space-y-3 ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200/80">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[75vh] pr-0.5">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Sin órdenes en esta fase
                    </div>
                  ) : (
                    colOrders.map(order => {
                      const client = clientMap.get(order.clientId);
                      const tech = techMap.get(order.technicianId);
                      const statusMeta = STATUS_CONFIG[order.status];
                      const priorityMeta = PRIORITY_CONFIG[order.priority];
                      const balance = Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0));

                      return (
                        <div
                          key={order.id}
                          onClick={() => onSelectOrder(order)}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer space-y-2"
                        >
                          {/* Top: ID, Device Type, Priority */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {order.deviceType === 'computadora' ? (
                                <Laptop className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              <span className="font-bold text-xs text-slate-900">{order.id}</span>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${priorityMeta.badge}`}>
                              {priorityMeta.label}
                            </span>
                          </div>

                          {/* Brand and Model */}
                          <div>
                            <div className="font-semibold text-xs text-slate-800">
                              {order.brand} {order.model}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Cliente: {client?.name || 'N/A'}
                            </div>
                          </div>

                          {/* Fault description */}
                          <div className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                            {order.reportedFault}
                          </div>

                          {/* Footer: Tech, Status, Balance */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 truncate max-w-[100px]">
                              Téc: {tech?.name.split(' ')[0] || 'N/A'}
                            </span>
                            <div className="text-right">
                              {balance > 0 ? (
                                <span className="font-bold text-amber-600">{formatCurrency(balance)}</span>
                              ) : (
                                <span className="font-semibold text-emerald-600">Pagado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
