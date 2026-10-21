import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Phone, 
  Mail, 
  Percent, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Laptop, 
  Printer, 
  Edit2, 
  Trash2,
  X
} from 'lucide-react';
import { Technician, ServiceOrder } from '../types';
import { formatCurrency } from '../utils/storage';

interface TechniciansViewProps {
  technicians: Technician[];
  orders: ServiceOrder[];
  onSaveTechnician: (tech: Technician) => void;
  onDeleteTechnician: (techId: string) => void;
  onSelectOrder: (order: ServiceOrder) => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({
  technicians,
  orders,
  onSaveTechnician,
  onDeleteTechnician,
  onSelectOrder
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [techForm, setTechForm] = useState<Partial<Technician>>({});
  const [selectedTechForOrders, setSelectedTechForOrders] = useState<Technician | null>(null);

  const getTechMetrics = (techId: string, commissionRate: number) => {
    const techOrders = orders.filter(o => o.technicianId === techId);
    const active = techOrders.filter(o => o.status !== 'entregada' && o.status !== 'cancelada');
    const completed = techOrders.filter(o => o.status === 'entregada' || o.status === 'lista_entrega');
    const totalLaborGenerated = completed.reduce((sum, o) => sum + (o.laborCost || 0), 0);
    const estimatedCommission = totalLaborGenerated * ((commissionRate || 0) / 100);

    return {
      total: techOrders.length,
      activeCount: active.length,
      completedCount: completed.length,
      totalLaborGenerated,
      estimatedCommission,
      activeOrders: active
    };
  };

  const handleOpenNew = () => {
    setTechForm({
      name: '',
      specialty: 'computadoras',
      phone: '',
      email: '',
      status: 'disponible',
      commissionRate: 30,
      avatarBg: 'bg-blue-600'
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (tech: Technician) => {
    setTechForm({ ...tech });
    setIsEditing(true);
  };

  const handleToggleStatus = (tech: Technician) => {
    const nextStatus: Record<string, 'disponible' | 'ocupado' | 'vacaciones'> = {
      disponible: 'ocupado',
      ocupado: 'vacaciones',
      vacaciones: 'disponible'
    };

    onSaveTechnician({
      ...tech,
      status: nextStatus[tech.status] || 'disponible'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techForm.name?.trim() || !techForm.phone?.trim()) {
      alert('Nombre y teléfono son obligatorios.');
      return;
    }

    const techToSave: Technician = {
      id: techForm.id || `tec-${Date.now()}`,
      name: techForm.name.trim(),
      specialty: techForm.specialty || 'computadoras',
      phone: techForm.phone.trim(),
      email: techForm.email?.trim() || '',
      status: techForm.status || 'disponible',
      commissionRate: Number(techForm.commissionRate) || 30,
      avatarBg: techForm.avatarBg || 'bg-blue-600'
    };

    onSaveTechnician(techToSave);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Personal Técnico & Productividad
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Especialidades, estado de disponibilidad, comisiones y asignación de órdenes
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Técnico</span>
        </button>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {technicians.map(tech => {
          const metrics = getTechMetrics(tech.id, tech.commissionRate);

          return (
            <div
              key={tech.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Tech Profile Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl ${tech.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                      {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm leading-tight">{tech.name}</h2>
                      <span className="text-[11px] font-semibold text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                        {tech.specialty === 'computadoras' ? (
                          <Laptop className="w-3 h-3 text-blue-600" />
                        ) : tech.specialty === 'impresoras' ? (
                          <Printer className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Wrench className="w-3 h-3 text-purple-600" />
                        )}
                        Especialista: {tech.specialty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge & Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">Disponibilidad:</span>
                  <button
                    onClick={() => handleToggleStatus(tech)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize transition-all border ${
                      tech.status === 'disponible'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : tech.status === 'ocupado'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Click para alternar disponibilidad"
                  >
                    {tech.status}
                  </button>
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tech.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{tech.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Percent className="w-3.5 h-3.5 text-slate-400" />
                    <span>Comisión pactada: <strong>{tech.commissionRate}%</strong></span>
                  </div>
                </div>

                {/* Productivity Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>En Taller Ahora:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {metrics.activeCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Mano de Obra Resuelta:</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(metrics.totalLaborGenerated)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/80 text-emerald-700 font-semibold">
                    <span>Comisión Estimada:</span>
                    <span className="font-bold">{formatCurrency(metrics.estimatedCommission)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedTechForOrders(tech)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Ver órdenes ({metrics.activeCount})
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(tech)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Editar Técnico"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar técnico ${tech.name}?`)) {
                        onDeleteTechnician(tech.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Eliminar Técnico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over / Modal of orders assigned to selected technician */}
      {selectedTechForOrders && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold">
                  Órdenes a Cargo de {selectedTechForOrders.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Especialidad: {selectedTechForOrders.specialty} &bull; Tel: {selectedTechForOrders.phone}
                </p>
              </div>
              <button 
                onClick={() => setSelectedTechForOrders(null)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-3 text-xs">
              {orders.filter(o => o.technicianId === selectedTechForOrders.id).length === 0 ? (
                <p className="text-slate-400 py-8 text-center">
                  No hay órdenes asignadas a este técnico.
                </p>
              ) : (
                orders.filter(o => o.technicianId === selectedTechForOrders.id).map(order => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedTechForOrders(null);
                      onSelectOrder(order);
                    }}
                    className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{order.id}</span>
                        <span className="font-normal text-slate-600">&bull; {order.brand} {order.model}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-md">{order.reportedFault}</p>
                    </div>
                    <span className="font-semibold text-xs text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      Gestionar
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedTechForOrders(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Tech Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {techForm.id ? 'Editar Técnico' : 'Nuevo Técnico'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Nombre Completo *:</label>
                <input
                  type="text"
                  required
                  value={techForm.name || ''}
                  onChange={(e) => setTechForm({ ...techForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Especialidad:</label>
                  <select
                    value={techForm.specialty || 'computadoras'}
                    onChange={(e) => setTechForm({ ...techForm, specialty: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  >
                    <option value="computadoras">Computadoras / Laptops</option>
                    <option value="impresoras">Impresoras / Multifuncionales</option>
                    <option value="mixto">Mixto (Cómputo & Impresión)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Comisión Mano de Obra (%):</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={techForm.commissionRate || 30}
                    onChange={(e) => setTechForm({ ...techForm, commissionRate: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Teléfono / Celular *:</label>
                  <input
                    type="tel"
                    required
                    value={techForm.phone || ''}
                    onChange={(e) => setTechForm({ ...techForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    value={techForm.email || ''}
                    onChange={(e) => setTechForm({ ...techForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
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
                  Guardar Técnico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
