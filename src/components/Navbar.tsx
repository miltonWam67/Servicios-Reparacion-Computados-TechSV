import React, { useState } from 'react';
import { 
  Wrench, 
  PlusCircle, 
  Search, 
  Bell, 
  Download, 
  RotateCcw, 
  Printer, 
  Laptop, 
  AlertTriangle,
  Menu,
  CheckCircle2
} from 'lucide-react';
import { SparePart, ServiceOrder } from '../types';
import { exportAllData, resetToInitialData } from '../utils/storage';

interface NavbarProps {
  onNewOrder: () => void;
  spareParts: SparePart[];
  orders: ServiceOrder[];
  onSelectOrder: (order: ServiceOrder) => void;
  onNavigate: (view: string) => void;
  currentView: string;
  onResetData: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewOrder,
  spareParts,
  orders,
  onSelectOrder,
  onNavigate,
  currentView,
  onResetData,
  onOpenMobileMenu
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Low stock parts
  const lowStockParts = spareParts.filter(p => p.stock <= p.minStock);
  // Urgent or pending orders
  const urgentOrders = orders.filter(o => o.priority === 'urgente' && o.status !== 'entregada' && o.status !== 'cancelada');

  // Search results
  const filteredOrders = searchQuery.trim() === '' ? [] : orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.reportedFault.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleReset = () => {
    if (confirmReset) {
      resetToInitialData();
      onResetData();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="btn-mobile-menu"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Abrir menú"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-all">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg text-white">
                <span>TechFix</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Computadoras & Impresoras
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-global-search"
              type="text"
              placeholder="Buscar por orden (ej. OS-2025), cliente, marca, serie..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-slate-800/90 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && searchQuery.trim() !== '' && (
            <div 
              className="absolute left-0 right-0 top-full mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-2 z-50 overflow-hidden"
              onMouseLeave={() => setShowSearchDropdown(false)}
            >
              <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                Resultados ({filteredOrders.length})
              </div>
              {filteredOrders.length === 0 ? (
                <div className="p-3 text-xs text-slate-400 text-center">
                  No se encontraron órdenes para "{searchQuery}"
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => {
                      onSelectOrder(order);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="p-2.5 rounded-lg hover:bg-slate-700/70 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {order.deviceType === 'computadora' ? (
                        <Laptop className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : (
                        <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-white mr-2">{order.id}</span>
                        <span className="text-slate-300">{order.brand} {order.model}</span>
                        <div className="text-[11px] text-slate-400 truncate max-w-[260px]">
                          {order.reportedFault}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900/80 text-slate-300">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Actions & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Create Order Button */}
          <button
            id="btn-quick-new-order"
            onClick={onNewOrder}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Nueva Orden</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Notificaciones y alertas"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              {(lowStockParts.length > 0 || urgentOrders.length > 0) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-slate-900" />
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-3 z-50 text-xs"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                  <span className="font-semibold text-slate-200">Alertas del Taller</span>
                  <span className="text-[11px] text-slate-400">
                    {lowStockParts.length + urgentOrders.length} pendientes
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {urgentOrders.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Órdenes Urgentes ({urgentOrders.length})
                      </div>
                      {urgentOrders.map(o => (
                        <div 
                          key={o.id}
                          onClick={() => {
                            onSelectOrder(o);
                            setShowNotifications(false);
                          }}
                          className="p-2 rounded bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between font-medium text-red-200">
                            <span>{o.id} - {o.brand} {o.model}</span>
                          </div>
                          <p className="text-[11px] text-red-300/80 truncate mt-0.5">{o.reportedFault}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {lowStockParts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Repuestos con Stock Crítico ({lowStockParts.length})
                      </div>
                      {lowStockParts.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => {
                            onNavigate('inventory');
                            setShowNotifications(false);
                          }}
                          className="p-2 rounded bg-amber-950/40 border border-amber-900/60 hover:bg-amber-900/40 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div className="truncate mr-2">
                            <div className="font-medium text-amber-200 truncate">{p.name}</div>
                            <span className="text-[10px] text-amber-400/80">SKU: {p.sku}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-900/80 text-amber-200 rounded font-bold text-[10px] shrink-0">
                            Stock: {p.stock} (Mín: {p.minStock})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {urgentOrders.length === 0 && lowStockParts.length === 0 && (
                    <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span>Todo en orden. No hay alertas críticas.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Backup / Export Button */}
          <button
            id="btn-export-backup"
            onClick={exportAllData}
            title="Exportar respaldo JSON"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center"
            aria-label="Exportar respaldo JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reset Demo Data Button */}
          <button
            id="btn-reset-demo"
            onClick={handleReset}
            title={confirmReset ? "¿Confirmar restauración de datos demo?" : "Restablecer datos de muestra"}
            className={`p-2 rounded-lg text-xs font-medium transition-colors hidden sm:flex items-center gap-1 ${
              confirmReset 
                ? 'bg-amber-600 text-white' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            aria-label="Restablecer datos de muestra"
          >
            <RotateCcw className={`w-4 h-4 ${confirmReset ? 'animate-spin' : ''}`} />
            {confirmReset && <span className="text-[10px]">¿Confirmar?</span>}
          </button>

        </div>
      </div>
    </header>
  );
};
