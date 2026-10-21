import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  FileText, 
  DollarSign, 
  Laptop, 
  Printer, 
  X,
  Edit2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Client, ServiceOrder, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/storage';

interface ClientsViewProps {
  clients: Client[];
  orders: ServiceOrder[];
  payments: Payment[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onSelectOrder: (order: ServiceOrder) => void;
  onOpenPaymentForClient: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  orders,
  payments,
  onSaveClient,
  onDeleteClient,
  onSelectOrder,
  onOpenPaymentForClient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [clientForm, setClientForm] = useState<Partial<Client>>({});

  // Search filter
  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.documentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, searchQuery]);

  // Client stats calculator
  const getClientStats = (clientId: string) => {
    const clientOrders = orders.filter(o => o.clientId === clientId);
    const totalBilled = clientOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalPaid = clientOrders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    const pendingBalance = Math.max(0, totalBilled - totalPaid);

    return {
      orderCount: clientOrders.length,
      totalBilled,
      totalPaid,
      pendingBalance,
      orders: clientOrders
    };
  };

  const handleOpenNew = () => {
    setClientForm({
      name: '',
      documentId: '',
      phone: '',
      email: '',
      address: '',
      company: '',
      notes: ''
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (client: Client) => {
    setClientForm({ ...client });
    setIsEditing(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name?.trim() || !clientForm.phone?.trim()) {
      alert('Nombre y teléfono son obligatorios.');
      return;
    }

    const clientToSave: Client = {
      id: clientForm.id || `cli-${Date.now()}`,
      name: clientForm.name.trim(),
      documentId: clientForm.documentId?.trim() || `V-${Math.floor(10000000 + Math.random() * 90000000)}`,
      phone: clientForm.phone.trim(),
      email: clientForm.email?.trim() || '',
      address: clientForm.address?.trim() || '',
      company: clientForm.company?.trim() || '',
      notes: clientForm.notes?.trim() || '',
      createdAt: clientForm.createdAt || new Date().toISOString()
    };

    onSaveClient(clientToSave);
    setIsEditing(false);
    if (selectedClient && selectedClient.id === clientToSave.id) {
      setSelectedClient(clientToSave);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Directorio de Clientes & Estados de Cuenta
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registro de particulares y empresas, historial de equipos y saldos en tiempo real
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, empresa, documento o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Mostrando {filteredClients.length} de {clients.length} clientes
        </div>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map(client => {
          const stats = getClientStats(client.id);

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Client Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base">{client.name}</h2>
                    {client.company && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{client.company}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {client.documentId}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Financial Summary Card */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Órdenes Totales</span>
                    <span className="font-bold text-slate-800 text-sm">{stats.orderCount} equipos</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Saldo Pendiente</span>
                    <span className={`font-bold text-sm ${stats.pendingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {stats.pendingBalance > 0 ? formatCurrency(stats.pendingBalance) : 'Al día'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Estado de Cuenta</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Editar Cliente"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar cliente ${client.name}?`)) {
                        onDeleteClient(client.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Eliminar Cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Statement Slide-over / Modal for Selected Client */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold">
                  Estado de Cuenta: {selectedClient.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Documento: {selectedClient.documentId} &bull; Tel: {selectedClient.phone}
                </p>
              </div>
              <button 
                onClick={() => setSelectedClient(null)} 
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Financial KPI Summary */}
              {(() => {
                const stats = getClientStats(selectedClient.id);
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[11px] text-slate-500 font-semibold uppercase block">Total Facturado</span>
                      <span className="text-base font-bold text-slate-900 mt-1 block">
                        {formatCurrency(stats.totalBilled)}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <span className="text-[11px] text-emerald-700 font-semibold uppercase block">Total Cobrado</span>
                      <span className="text-base font-bold text-emerald-700 mt-1 block">
                        {formatCurrency(stats.totalPaid)}
                      </span>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                      <span className="text-[11px] text-amber-700 font-semibold uppercase block">Saldo Pendiente</span>
                      <span className="text-base font-bold text-amber-700 mt-1 block">
                        {formatCurrency(stats.pendingBalance)}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Action: Quick Pay */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700">¿Registrar nuevo abono o pago para este cliente?</span>
                <button
                  onClick={() => {
                    const cid = selectedClient.id;
                    setSelectedClient(null);
                    onOpenPaymentForClient(cid);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Registrar Pago</span>
                </button>
              </div>

              {/* Equipment & Service Orders History */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Historial de Órdenes de Servicio del Cliente
                </span>

                {orders.filter(o => o.clientId === selectedClient.id).length === 0 ? (
                  <p className="text-slate-400 py-6 text-center border border-dashed rounded-xl">
                    Este cliente no tiene órdenes de servicio registradas.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2">Orden</th>
                          <th className="px-3 py-2">Dispositivo</th>
                          <th className="px-3 py-2">Fecha</th>
                          <th className="px-3 py-2">Estado</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="px-3 py-2 text-right">Saldo</th>
                          <th className="px-3 py-2 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.filter(o => o.clientId === selectedClient.id).map(order => {
                          const balance = Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0));
                          return (
                            <tr key={order.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2.5 font-bold text-slate-900">{order.id}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                  {order.deviceType === 'computadora' ? (
                                    <Laptop className="w-3 h-3 text-blue-600" />
                                  ) : (
                                    <Printer className="w-3 h-3 text-emerald-600" />
                                  )}
                                  <span>{order.brand} {order.model}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-slate-500">{formatDate(order.createdAt)}</td>
                              <td className="px-3 py-2.5 capitalize">{order.status.replace('_', ' ')}</td>
                              <td className="px-3 py-2.5 text-right font-semibold text-slate-900">
                                {formatCurrency(order.totalAmount)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-bold text-amber-600">
                                {balance > 0 ? formatCurrency(balance) : <span className="text-emerald-600">Pagado</span>}
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedClient(null);
                                    onSelectOrder(order);
                                  }}
                                  className="text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                  Ver
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payments History for this client */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                  Pagos y Abonos Registrados
                </span>

                {payments.filter(p => p.clientId === selectedClient.id).length === 0 ? (
                  <p className="text-slate-400 py-4 text-center border border-dashed rounded-xl">
                    No se registran pagos para este cliente aún.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {payments.filter(p => p.clientId === selectedClient.id).map(p => (
                      <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 mr-2">{p.receiptNumber}</span>
                          <span className="text-slate-500">{formatDate(p.date)} &bull; Método: <span className="capitalize">{p.method}</span></span>
                          {p.notes && <div className="text-[11px] text-slate-400">{p.notes}</div>}
                        </div>
                        <span className="font-bold text-emerald-600 text-sm">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Client Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {clientForm.id ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Nombre Completo o Razón Social *:</label>
                <input
                  type="text"
                  required
                  value={clientForm.name || ''}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Documento (DNI/RUT/RFC):</label>
                  <input
                    type="text"
                    value={clientForm.documentId || ''}
                    onChange={(e) => setClientForm({ ...clientForm, documentId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Empresa / Negocio:</label>
                  <input
                    type="text"
                    value={clientForm.company || ''}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Teléfono / WhatsApp *:</label>
                  <input
                    type="tel"
                    required
                    value={clientForm.phone || ''}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    value={clientForm.email || ''}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Dirección de entrega o facturación:</label>
                <input
                  type="text"
                  value={clientForm.address || ''}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Notas internas:</label>
                <textarea
                  rows={2}
                  value={clientForm.notes || ''}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="Instrucciones especiales de entrega o contacto..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
