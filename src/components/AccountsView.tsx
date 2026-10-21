import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Search, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  Filter, 
  Printer as PrintIcon, 
  CheckCircle, 
  AlertCircle,
  FileText,
  User,
  X
} from 'lucide-react';
import { Payment, ServiceOrder, Client, PaymentMethod } from '../types';
import { formatCurrency, formatDateTime, formatDate, PAYMENT_METHOD_LABELS } from '../utils/storage';

interface AccountsViewProps {
  payments: Payment[];
  orders: ServiceOrder[];
  clients: Client[];
  onRegisterPayment: (payment: Payment) => void;
  onPrintPaymentReceipt: (payment: Payment) => void;
  onSelectOrder: (order: ServiceOrder) => void;
  preselectedOrderId?: string;
  preselectedClientId?: string;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  payments,
  orders,
  clients,
  onRegisterPayment,
  onPrintPaymentReceipt,
  onSelectOrder,
  preselectedOrderId,
  preselectedClientId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'transactions' | 'receivables'>('transactions');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Payment form state
  const [payOrderId, setPayOrderId] = useState(preselectedOrderId || (orders.find(o => (o.totalAmount - o.amountPaid) > 0)?.id || ''));
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('transferencia');
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Update suggested amount when payOrderId changes
  React.useEffect(() => {
    if (payOrderId) {
      const ord = orders.find(o => o.id === payOrderId);
      if (ord) {
        const bal = Math.max(0, (ord.totalAmount || 0) - (ord.amountPaid || 0));
        setPayAmount(bal);
      }
    }
  }, [payOrderId, orders]);

  // If preselectedOrderId passed, open modal
  React.useEffect(() => {
    if (preselectedOrderId) {
      setPayOrderId(preselectedOrderId);
      setIsPaymentModalOpen(true);
    }
  }, [preselectedOrderId]);

  // Lookup maps
  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  const orderMap = useMemo(() => new Map(orders.map(o => [o.id, o])), [orders]);

  // Overall Financial Calculations
  const totalBilled = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalReceivable = orders.reduce((sum, o) => {
    if (o.status === 'cancelada') return sum;
    return sum + Math.max(0, (o.totalAmount || 0) - (o.amountPaid || 0));
  }, 0);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (methodFilter !== 'all' && p.method !== methodFilter) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const client = clientMap.get(p.clientId);
        const matchReceipt = p.receiptNumber.toLowerCase().includes(q);
        const matchOrder = p.serviceOrderId.toLowerCase().includes(q);
        const matchClient = client ? client.name.toLowerCase().includes(q) : false;
        const matchRef = p.referenceNumber ? p.referenceNumber.toLowerCase().includes(q) : false;
        return matchReceipt || matchOrder || matchClient || matchRef;
      }

      return true;
    });
  }, [payments, methodFilter, searchQuery, clientMap]);

  // Outstanding orders (Cuentas por Cobrar)
  const outstandingOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status === 'cancelada') return false;
      const balance = Math.max(0, (o.totalAmount || 0) - (o.amountPaid || 0));
      return balance > 0;
    });
  }, [orders]);

  const handleOpenPaymentModalForOrder = (orderId: string) => {
    setPayOrderId(orderId);
    const ord = orders.find(o => o.id === orderId);
    if (ord) {
      const bal = Math.max(0, (ord.totalAmount || 0) - (ord.amountPaid || 0));
      setPayAmount(bal);
    }
    setIsPaymentModalOpen(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payOrderId || payAmount <= 0) {
      alert('Seleccione una orden válida e ingrese un monto mayor a cero.');
      return;
    }

    const order = orders.find(o => o.id === payOrderId);
    if (!order) return;

    const receiptNum = `REC-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      serviceOrderId: order.id,
      clientId: order.clientId,
      date: new Date().toISOString(),
      amount: Number(payAmount),
      method: payMethod,
      referenceNumber: payReference.trim() || undefined,
      notes: payNotes.trim() || `Abono por servicio en ${order.brand} ${order.model}`
    };

    onRegisterPayment(newPayment);
    setIsPaymentModalOpen(false);
    setPayReference('');
    setPayNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Estados de Cuenta en Tiempo Real & Pagos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Seguimiento de ingresos, cuentas por cobrar, abonos y recibos de pago por servicios
          </p>
        </div>

        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Cobro / Abono</span>
        </button>
      </div>

      {/* Financial Snapshot KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cobrado (Caja)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {formatCurrency(totalCollected)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {payments.length} transacciones de cobro registradas
          </p>
        </div>

        {/* Total Receivable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Por Cobrar (Saldo Pendiente)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {formatCurrency(totalReceivable)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            En {outstandingOrders.length} órdenes de servicio activas
          </p>
        </div>

        {/* Total Billed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Facturado en Servicios</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatCurrency(totalBilled)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mano de obra + repuestos en todas las órdenes
          </p>
        </div>
      </div>

      {/* Sub tabs: Transacciones vs Cuentas por cobrar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex space-x-3 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'transactions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Historial de Pagos Recibidos ({payments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('receivables')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'receivables'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Cuentas por Cobrar Pendientes ({outstandingOrders.length})</span>
          </button>
        </div>

        {activeSubTab === 'transactions' && (
          <div className="flex items-center gap-2 text-xs">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
            >
              <option value="all">Medio: Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="pago_movil">Pago Móvil</option>
            </select>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'transactions'
                ? "Buscar por recibo #, cliente, orden o referencia bancaria..."
                : "Buscar orden o cliente con deuda..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* VIEW: TRANSACTIONS LIST */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Recibo Nº</th>
                  <th className="px-4 py-3">Fecha & Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Orden de Servicio</th>
                  <th className="px-4 py-3">Método & Referencia</th>
                  <th className="px-4 py-3 text-right">Monto Cobrado</th>
                  <th className="px-4 py-3 text-center">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No hay registros de pago que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => {
                    const client = clientMap.get(payment.clientId);
                    const order = orderMap.get(payment.serviceOrderId);

                    return (
                      <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                          {payment.receiptNumber}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                          {formatDateTime(payment.date)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800">{client ? client.name : 'Cliente no encontrado'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{client?.documentId}</div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {order ? (
                            <button
                              onClick={() => onSelectOrder(order)}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              {order.id} ({order.brand} {order.model})
                            </button>
                          ) : (
                            <span className="text-slate-400">{payment.serviceOrderId}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold capitalize text-slate-800">
                            {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                          </span>
                          {payment.referenceNumber && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              Ref: {payment.referenceNumber}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-emerald-600 text-sm whitespace-nowrap">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => onPrintPaymentReceipt(payment)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            title="Ver / Imprimir Recibo"
                          >
                            <PrintIcon className="w-3.5 h-3.5" />
                            <span>Recibo</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: RECEIVABLES LIST */}
      {activeSubTab === 'receivables' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">Orden & Equipo</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3 text-right">Total Facturado</th>
                  <th className="px-4 py-3 text-right">Abonado</th>
                  <th className="px-4 py-3 text-right">Saldo Deudor</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outstandingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-emerald-600 font-semibold">
                      ¡Excelente! No hay cuentas pendientes por cobrar en este momento.
                    </td>
                  </tr>
                ) : (
                  outstandingOrders.map(order => {
                    const client = clientMap.get(order.clientId);
                    const balance = Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0));

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left"
                          >
                            {order.id} &bull; {order.brand} {order.model}
                          </button>
                          <div className="text-[11px] text-slate-400 capitalize">{order.status.replace('_', ' ')}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800">{client?.name || 'N/A'}</div>
                          {client?.company && <div className="text-[11px] text-slate-500">{client.company}</div>}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">
                          {client?.phone || 'Sin teléfono'}
                        </td>

                        <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-medium text-emerald-600">
                          {formatCurrency(order.amountPaid)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-black text-amber-600 text-sm whitespace-nowrap">
                          {formatCurrency(balance)}
                        </td>

                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenPaymentModalForOrder(order.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 mx-auto shadow-xs active:scale-95"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Cobrar Saldo</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Registrar Pago / Abono */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Registrar Pago de Servicio
              </h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Orden de Servicio a Abonar / Liquidar *:
                </label>
                <select
                  value={payOrderId}
                  onChange={(e) => setPayOrderId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-medium"
                >
                  <option value="">-- Seleccionar Orden --</option>
                  {orders.map(o => {
                    const bal = Math.max(0, (o.totalAmount || 0) - (o.amountPaid || 0));
                    const client = clientMap.get(o.clientId);
                    return (
                      <option key={o.id} value={o.id}>
                        {o.id} - {client?.name} [{o.brand} {o.model}] - Saldo: {formatCurrency(bal)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Order quick balance preview */}
              {payOrderId && (() => {
                const ord = orders.find(o => o.id === payOrderId);
                if (!ord) return null;
                const bal = Math.max(0, (ord.totalAmount || 0) - (ord.amountPaid || 0));
                return (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Total Orden: {formatCurrency(ord.totalAmount)}</span>
                      <span className="text-slate-500 block text-[11px]">Ya pagado: {formatCurrency(ord.amountPaid)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo Pendiente:</span>
                      <span className="text-base font-black text-amber-600">{formatCurrency(bal)}</span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Monto a Pagar ($) *:
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Método de Pago:</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="tarjeta">Tarjeta Débito/Crédito</option>
                    <option value="pago_movil">Pago Móvil / QR</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Nº Comprobante / Ref:</label>
                  <input
                    type="text"
                    placeholder="Ej. SPEI-98124"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Notas del Pago:</label>
                <input
                  type="text"
                  placeholder="Detalle adicional para el recibo..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md"
                >
                  Registrar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
