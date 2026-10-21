/**
 * TechFix Pro - Sistema de Gestión de Reparación y Mantenimiento de Computadoras e Impresoras
 */

import React, { useState, useEffect } from 'react';
import { 
  ServiceOrder, 
  Client, 
  Technician, 
  SparePart, 
  Payment,
  ActiveTab,
  OrderStatus,
  OrderUsedPart,
  OrderLog
} from './types';
import { 
  loadFromStorage, 
  saveToStorage, 
  STORAGE_KEYS, 
  resetToInitialData,
  calculateOrderTotal,
  INITIAL_DATA,
  STATUS_CONFIG
} from './utils/storage';

// Layout components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// View components
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { ClientsView } from './components/ClientsView';
import { TechniciansView } from './components/TechniciansView';
import { InventoryView } from './components/InventoryView';
import { AccountsView } from './components/AccountsView';
import { ReportsView } from './components/ReportsView';

// Modals
import { OrderDetailModal } from './components/OrderDetailModal';
import { OrderFormModal } from './components/OrderFormModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';

export default function App() {
  // Main Data States with initial storage fallback
  const [orders, setOrders] = useState<ServiceOrder[]>(() => 
    loadFromStorage<ServiceOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_DATA.orders)
  );

  const [clients, setClients] = useState<Client[]>(() => 
    loadFromStorage<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_DATA.clients)
  );

  const [technicians, setTechnicians] = useState<Technician[]>(() => 
    loadFromStorage<Technician[]>(STORAGE_KEYS.TECHNICIANS, INITIAL_DATA.technicians)
  );

  const [spareParts, setSpareParts] = useState<SparePart[]>(() => 
    loadFromStorage<SparePart[]>(STORAGE_KEYS.SPARE_PARTS, INITIAL_DATA.spareParts)
  );

  const [payments, setPayments] = useState<Payment[]>(() => 
    loadFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_DATA.payments)
  );

  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<ServiceOrder | undefined>(undefined);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [preselectedPayOrderId, setPreselectedPayOrderId] = useState<string | undefined>(undefined);

  // Sync to localStorage on every state change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
  }, [clients]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TECHNICIANS, technicians);
  }, [technicians]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SPARE_PARTS, spareParts);
  }, [spareParts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
  }, [payments]);

  // Keep selectedOrder in sync with orders state
  useEffect(() => {
    if (selectedOrder) {
      const refreshed = orders.find(o => o.id === selectedOrder.id);
      if (refreshed) {
        setSelectedOrder(refreshed);
      }
    }
  }, [orders]);

  // Handlers for Orders
  const handleSaveOrder = (orderToSave: ServiceOrder) => {
    setOrders(prevOrders => {
      const existsIndex = prevOrders.findIndex(o => o.id === orderToSave.id);
      if (existsIndex >= 0) {
        const copy = [...prevOrders];
        copy[existsIndex] = orderToSave;
        return copy;
      } else {
        return [orderToSave, ...prevOrders];
      }
    });

    if (selectedOrder && selectedOrder.id === orderToSave.id) {
      setSelectedOrder(orderToSave);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const handleOpenCreateOrder = () => {
    setOrderToEdit(undefined);
    setIsOrderFormOpen(true);
  };

  // Handlers for Clients
  const handleSaveClient = (clientToSave: Client) => {
    setClients(prev => {
      const idx = prev.findIndex(c => c.id === clientToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = clientToSave;
        return copy;
      }
      return [clientToSave, ...prev];
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  // Handlers for Technicians
  const handleSaveTechnician = (techToSave: Technician) => {
    setTechnicians(prev => {
      const idx = prev.findIndex(t => t.id === techToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = techToSave;
        return copy;
      }
      return [techToSave, ...prev];
    });
  };

  const handleDeleteTechnician = (techId: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== techId));
  };

  // Handlers for Spare Parts
  const handleSavePart = (partToSave: SparePart) => {
    setSpareParts(prev => {
      const idx = prev.findIndex(p => p.id === partToSave.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = partToSave;
        return copy;
      }
      return [partToSave, ...prev];
    });
  };

  const handleDeletePart = (partId: string) => {
    setSpareParts(prev => prev.filter(p => p.id !== partId));
  };

  const handleRestockPart = (partId: string, addedQty: number) => {
    setSpareParts(prev => 
      prev.map(p => p.id === partId ? { ...p, stock: p.stock + addedQty } : p)
    );
  };

  // Handlers for Payments
  const handleRegisterPayment = (newPayment: Payment) => {
    // 1. Add payment
    setPayments(prev => [newPayment, ...prev]);

    // 2. Update order paid amount and payment status
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id === newPayment.serviceOrderId) {
          const updatedAmountPaid = (order.amountPaid || 0) + newPayment.amount;
          const isFullyPaid = updatedAmountPaid >= (order.totalAmount - 0.01);
          
          const newStatus = isFullyPaid ? 'pagado' : updatedAmountPaid > 0 ? 'parcial' : 'pendiente';

          const newLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: 'Caja / Pagos',
            status: order.status,
            note: `Pago recibido: $${newPayment.amount.toFixed(2)} (${newPayment.method}). Recibo ${newPayment.receiptNumber}`
          };

          return {
            ...order,
            amountPaid: updatedAmountPaid,
            paymentStatus: newStatus,
            logs: [newLog, ...order.logs]
          };
        }
        return order;
      });
    });

    // 3. Prompt receipt view
    setReceiptPayment(newPayment);
  };

  const handleOpenPaymentForOrder = (orderId: string) => {
    setPreselectedPayOrderId(orderId);
    setCurrentTab('accounts');
  };

  const handleOpenPaymentForClient = (clientId: string) => {
    const clientFirstPendingOrder = orders.find(
      o => o.clientId === clientId && (o.totalAmount - o.amountPaid) > 0
    );
    if (clientFirstPendingOrder) {
      setPreselectedPayOrderId(clientFirstPendingOrder.id);
    }
    setCurrentTab('accounts');
  };

  const handleQuickStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const newLog: OrderLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: 'Sistema / Taller',
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
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      return updated;
    }));
  };

  const handleAddPartToOrder = (orderId: string, partId: string, quantity: number) => {
    const part = spareParts.find(p => p.id === partId);
    if (!part || quantity <= 0) return;

    // 1. Decrement spare part stock
    setSpareParts(prev => prev.map(p => {
      if (p.id === partId) {
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      }
      return p;
    }));

    // 2. Add or increment part in order
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const existingPartIndex = (order.usedParts || []).findIndex(p => p.partId === partId);
      let updatedUsedParts: OrderUsedPart[];

      if (existingPartIndex >= 0) {
        updatedUsedParts = order.usedParts.map((item, idx) => {
          if (idx === existingPartIndex) {
            const newQty = item.quantity + quantity;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice
            };
          }
          return item;
        });
      } else {
        const newUsedPart: OrderUsedPart = {
          partId: part.id,
          sku: part.sku,
          name: part.name,
          quantity: quantity,
          unitPrice: part.sellingPrice,
          totalPrice: part.sellingPrice * quantity
        };
        updatedUsedParts = [...(order.usedParts || []), newUsedPart];
      }

      const calculated = calculateOrderTotal(
        order.laborCost,
        updatedUsedParts,
        order.discount,
        order.taxRate
      );

      const isFullyPaid = order.amountPaid >= (calculated.total - 0.01) && calculated.total > 0;
      const newPaymentStatus = isFullyPaid ? 'pagado' : order.amountPaid > 0 ? 'parcial' : 'pendiente';

      const newLog: OrderLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: 'Inventario / Taller',
        status: order.status,
        note: `Se cargó repuesto: ${part.name} (x${quantity}) - Subtotal: $${(part.sellingPrice * quantity).toFixed(2)}`
      };

      const updatedOrder: ServiceOrder = {
        ...order,
        usedParts: updatedUsedParts,
        totalAmount: calculated.total,
        paymentStatus: newPaymentStatus,
        logs: [newLog, ...(order.logs || [])]
      };

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      return updatedOrder;
    }));
  };

  const handleRemovePartFromOrder = (orderId: string, partIndex: number) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const removedItem = (order.usedParts || [])[partIndex];
      if (!removedItem) return order;

      // Return stock to spareParts
      setSpareParts(spPrev => spPrev.map(p => {
        if (p.id === removedItem.partId) {
          return { ...p, stock: p.stock + removedItem.quantity };
        }
        return p;
      }));

      const updatedUsedParts = (order.usedParts || []).filter((_, idx) => idx !== partIndex);

      const calculated = calculateOrderTotal(
        order.laborCost,
        updatedUsedParts,
        order.discount,
        order.taxRate
      );

      const isFullyPaid = order.amountPaid >= (calculated.total - 0.01) && calculated.total > 0;
      const newPaymentStatus = isFullyPaid ? 'pagado' : order.amountPaid > 0 ? 'parcial' : 'pendiente';

      const newLog: OrderLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: 'Inventario / Taller',
        status: order.status,
        note: `Se removió repuesto: ${removedItem.name} (x${removedItem.quantity}) y se reintegró al inventario.`
      };

      const updatedOrder: ServiceOrder = {
        ...order,
        usedParts: updatedUsedParts,
        totalAmount: calculated.total,
        paymentStatus: newPaymentStatus,
        logs: [newLog, ...(order.logs || [])]
      };

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      return updatedOrder;
    }));
  };

  const handlePrintOrder = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleResetData = () => {
    if (confirm('¿Desea restaurar todos los datos a la demostración inicial? Esto reemplazará los datos actuales.')) {
      resetToInitialData();
      setOrders(INITIAL_DATA.orders);
      setClients(INITIAL_DATA.clients);
      setTechnicians(INITIAL_DATA.technicians);
      setSpareParts(INITIAL_DATA.spareParts);
      setPayments(INITIAL_DATA.payments);
    }
  };

  // Find order & client for open receipt
  const receiptOrder = receiptPayment ? orders.find(o => o.id === receiptPayment.serviceOrderId) : undefined;
  const receiptClient = receiptPayment ? clients.find(c => c.id === receiptPayment.clientId) : undefined;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentTab}
        onNavigate={(view) => setCurrentTab(view as ActiveTab)}
        orders={orders}
        spareParts={spareParts}
        onNewOrder={handleOpenCreateOrder}
        onSelectOrder={setSelectedOrder}
        onResetData={handleResetData}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentView={currentTab}
          onNavigate={(view) => setCurrentTab(view as ActiveTab)}
          orders={orders}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              clients={clients}
              technicians={technicians}
              spareParts={spareParts}
              payments={payments}
              onNewOrder={handleOpenCreateOrder}
              onSelectOrder={setSelectedOrder}
              onNavigate={(view) => setCurrentTab(view as ActiveTab)}
              onQuickPay={() => setCurrentTab('accounts')}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView
              orders={orders}
              technicians={technicians}
              clients={clients}
              onSelectOrder={setSelectedOrder}
              onNewOrder={handleOpenCreateOrder}
              onPrintOrder={handlePrintOrder}
              onQuickStatusChange={handleQuickStatusChange}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              orders={orders}
              payments={payments}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              onSelectOrder={setSelectedOrder}
              onOpenPaymentForClient={handleOpenPaymentForClient}
            />
          )}

          {currentTab === 'technicians' && (
            <TechniciansView
              technicians={technicians}
              orders={orders}
              onSaveTechnician={handleSaveTechnician}
              onDeleteTechnician={handleDeleteTechnician}
              onSelectOrder={setSelectedOrder}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              spareParts={spareParts}
              onSavePart={handleSavePart}
              onDeletePart={handleDeletePart}
              onRestockPart={handleRestockPart}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsView
              payments={payments}
              orders={orders}
              clients={clients}
              onRegisterPayment={handleRegisterPayment}
              onPrintPaymentReceipt={setReceiptPayment}
              onSelectOrder={setSelectedOrder}
              preselectedOrderId={preselectedPayOrderId}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              orders={orders}
              technicians={technicians}
              spareParts={spareParts}
              payments={payments}
            />
          )}
        </main>
      </div>

      {/* MODAL: Service Order Detail & Diagnostics */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          clients={clients}
          technicians={technicians}
          spareParts={spareParts}
          onClose={() => setSelectedOrder(null)}
          onUpdateOrder={handleSaveOrder}
          onAddPartToOrder={handleAddPartToOrder}
          onRemovePartFromOrder={handleRemovePartFromOrder}
          onOpenPaymentModal={(order) => {
            setSelectedOrder(null);
            handleOpenPaymentForOrder(order.id);
          }}
          onPrintOrder={handlePrintOrder}
        />
      )}

      {/* MODAL: Create New Service Order */}
      {isOrderFormOpen && (
        <OrderFormModal
          clients={clients}
          technicians={technicians}
          spareParts={spareParts}
          existingOrder={orderToEdit}
          onClose={() => {
            setIsOrderFormOpen(false);
            setOrderToEdit(undefined);
          }}
          onSave={handleSaveOrder}
          onQuickCreateClient={handleSaveClient}
        />
      )}

      {/* MODAL: Payment Receipt Voucher */}
      {receiptPayment && (
        <PaymentReceiptModal
          payment={receiptPayment}
          order={receiptOrder}
          client={receiptClient}
          onClose={() => setReceiptPayment(null)}
        />
      )}
    </div>
  );
}
