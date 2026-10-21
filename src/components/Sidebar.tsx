import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  UserCheck, 
  Package, 
  CreditCard, 
  BarChart3, 
  X,
  Laptop,
  Printer
} from 'lucide-react';
import { ServiceOrder } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  orders: ServiceOrder[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  orders,
  isMobileOpen,
  onCloseMobile
}) => {
  const activeOrdersCount = orders.filter(
    o => o.status !== 'entregada' && o.status !== 'cancelada'
  ).length;

  const computerOrdersCount = orders.filter(
    o => o.deviceType === 'computadora' && o.status !== 'entregada' && o.status !== 'cancelada'
  ).length;

  const printerOrdersCount = orders.filter(
    o => o.deviceType === 'impresora' && o.status !== 'entregada' && o.status !== 'cancelada'
  ).length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'orders',
      label: 'Órdenes de Servicio',
      icon: ClipboardList,
      badge: activeOrdersCount > 0 ? `${activeOrdersCount} activas` : null
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      badge: null
    },
    {
      id: 'technicians',
      label: 'Técnicos',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'inventory',
      label: 'Inventario Repuestos',
      icon: Package,
      badge: null
    },
    {
      id: 'accounts',
      label: 'Estados de Cuenta & Pagos',
      icon: CreditCard,
      badge: null
    },
    {
      id: 'reports',
      label: 'Reportes de Productividad',
      icon: BarChart3,
      badge: null
    }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Top Mobile Header */}
      <div className="p-4 md:hidden flex items-center justify-between border-b border-slate-200">
        <span className="font-bold text-slate-800 text-sm">Menú de Navegación</span>
        <button 
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="p-3 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isActive ? 'bg-blue-700/80 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Workshop Summary Widget in Sidebar */}
      <div className="p-3 m-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          En Taller Ahora
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-blue-600" />
              Computadoras
            </span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {computerOrdersCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-700">
            <span className="flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              Impresoras
            </span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {printerOrdersCount}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Version */}
      <div className="p-3 text-[11px] text-slate-600 text-center border-t border-slate-200">
        TechFix Pro v2.5 &bull; Modo En Línea
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:block min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-50 flex flex-col">
            {navContent}
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Bar for convenient thumbs access */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around md:hidden shadow-lg">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentView === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => onNavigate('orders')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors relative ${
            currentView === 'orders' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ClipboardList className="w-4 h-4 mb-0.5" />
          <span>Órdenes</span>
          {activeOrdersCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => onNavigate('inventory')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentView === 'inventory' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Package className="w-4 h-4 mb-0.5" />
          <span>Repuestos</span>
        </button>

        <button
          onClick={() => onNavigate('accounts')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentView === 'accounts' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <CreditCard className="w-4 h-4 mb-0.5" />
          <span>Pagos</span>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            currentView === 'reports' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span>Reportes</span>
        </button>
      </nav>
    </>
  );
};
