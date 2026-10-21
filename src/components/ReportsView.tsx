import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Laptop, 
  Printer, 
  UserCheck, 
  Printer as PrintIcon, 
  DollarSign,
  Percent,
  Download
} from 'lucide-react';
import { ServiceOrder, Technician, SparePart, Payment } from '../types';
import { formatCurrency } from '../utils/storage';

interface ReportsViewProps {
  orders: ServiceOrder[];
  technicians: Technician[];
  spareParts: SparePart[];
  payments: Payment[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  technicians,
  spareParts,
  payments
}) => {
  // Month and Year selector state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Filter orders by created or completed in selected month
  const monthlyOrders = useMemo(() => {
    return orders.filter(order => {
      const d = new Date(order.createdAt);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [orders, selectedMonth, selectedYear]);

  // Monthly completed
  const monthlyCompleted = useMemo(() => {
    return monthlyOrders.filter(o => o.status === 'entregada' || o.status === 'lista_entrega');
  }, [monthlyOrders]);

  // Monthly canceled
  const monthlyCanceled = useMemo(() => {
    return monthlyOrders.filter(o => o.status === 'cancelada');
  }, [monthlyOrders]);

  // Repair success rate
  const successRate = monthlyOrders.length > 0 
    ? Math.round((monthlyCompleted.length / (monthlyCompleted.length + monthlyCanceled.length || 1)) * 100) 
    : 100;

  // Monthly financial revenue
  const totalBilledMonth = monthlyOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalLaborMonth = monthlyOrders.reduce((sum, o) => sum + (o.laborCost || 0), 0);
  
  // Spare parts revenue & cost
  const totalPartsRevenueMonth = monthlyOrders.reduce((sum, o) => {
    return sum + (o.usedParts?.reduce((pSum, p) => pSum + (p.totalPrice || 0), 0) || 0);
  }, 0);

  // Split PC vs Printers
  const computerOrdersMonth = monthlyOrders.filter(o => o.deviceType === 'computadora');
  const printerOrdersMonth = monthlyOrders.filter(o => o.deviceType === 'impresora');

  const computerRevenueMonth = computerOrdersMonth.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const printerRevenueMonth = printerOrdersMonth.reduce((s, o) => s + (o.totalAmount || 0), 0);

  // Technician performance ranking
  const techPerformance = useMemo(() => {
    return technicians.map(tech => {
      const techOrders = monthlyOrders.filter(o => o.technicianId === tech.id);
      const completed = techOrders.filter(o => o.status === 'entregada' || o.status === 'lista_entrega');
      const laborProduced = completed.reduce((sum, o) => sum + (o.laborCost || 0), 0);
      const commission = laborProduced * ((tech.commissionRate || 0) / 100);

      return {
        technician: tech,
        totalAssigned: techOrders.length,
        completedCount: completed.length,
        laborProduced,
        commission,
        efficiencyRate: techOrders.length > 0 ? Math.round((completed.length / techOrders.length) * 100) : 0
      };
    }).sort((a, b) => b.completedCount - a.completedCount);
  }, [technicians, monthlyOrders]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Reportes Mensuales de Productividad
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Métricas de rendimiento técnico, tiempos de entrega, efectividad e ingresos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-slate-800 p-1.5 focus:outline-none cursor-pointer"
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx}>{name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-slate-800 p-1.5 border-l border-slate-200 focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <PrintIcon className="w-4 h-4" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-2">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Informe Técnico y Financiero
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Productividad de {monthNames[selectedMonth]} {selectedYear}
            </h2>
            <p className="text-xs text-slate-500">
              Laboratorio de Reparación y Mantenimiento &bull; TechFix Pro
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Fecha de emisión: {new Date().toLocaleDateString('es-ES')}</div>
            <div className="font-semibold text-slate-700">Período: 01 al {new Date(selectedYear, selectedMonth + 1, 0).getDate()} de {monthNames[selectedMonth]}</div>
          </div>
        </div>

        {/* 4 Core Productivity Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Órdenes Recibidas
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {monthlyOrders.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {computerOrdersMonth.length} PCs &bull; {printerOrdersMonth.length} Impresoras
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Reparadas Exitosamente
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {monthlyCompleted.length}
            </div>
            <div className="text-xs text-emerald-600 mt-0.5">
              Tasa de éxito: <strong>{successRate}%</strong>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Mano de Obra Facturada
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">
              {formatCurrency(totalLaborMonth)}
            </div>
            <div className="text-xs text-blue-600 mt-0.5">
              Generada por servicios técnicos
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
              Venta de Repuestos
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">
              {formatCurrency(totalPartsRevenueMonth)}
            </div>
            <div className="text-xs text-purple-600 mt-0.5">
              Componentes instalados
            </div>
          </div>
        </div>

        {/* Breakdown by Equipment Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Computers breakdown */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Línea de Computadoras & Laptops</h3>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {computerOrdersMonth.length} equipos
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Ingresos generados:</span>
                <span className="font-bold text-slate-800">{formatCurrency(computerRevenueMonth)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Servicios más comunes:</span>
                <span className="text-slate-800 font-medium">Cambio SSD, Mantenimiento térmico, Teclados</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Participación en el taller:</span>
                <span className="font-semibold text-blue-700">
                  {monthlyOrders.length > 0 ? Math.round((computerOrdersMonth.length / monthlyOrders.length) * 100) : 0}% del volumen
                </span>
              </div>
            </div>
          </div>

          {/* Printers breakdown */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Línea de Impresoras & Multifuncionales</h3>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {printerOrdersMonth.length} equipos
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Ingresos generados:</span>
                <span className="font-bold text-slate-800">{formatCurrency(printerRevenueMonth)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Servicios más comunes:</span>
                <span className="text-slate-800 font-medium">Cambio de fusores, rodillos pickup, reseteo almohadillas</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Participación en el taller:</span>
                <span className="font-semibold text-emerald-700">
                  {monthlyOrders.length > 0 ? Math.round((printerOrdersMonth.length / monthlyOrders.length) * 100) : 0}% del volumen
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Technician Productivity Ranking Table */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Rendimiento y Productividad por Técnico
            </h3>
            <span className="text-xs text-slate-500">
              Cálculo de comisiones y órdenes culminadas
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Técnico & Especialidad</th>
                  <th className="px-4 py-2.5 text-center">Asignadas</th>
                  <th className="px-4 py-2.5 text-center">Completadas</th>
                  <th className="px-4 py-2.5 text-center">Efectividad</th>
                  <th className="px-4 py-2.5 text-right">Mano de Obra ($)</th>
                  <th className="px-4 py-2.5 text-right">Comisión a Pagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {techPerformance.map((item, idx) => (
                  <tr key={item.technician.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{item.technician.name}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{item.technician.specialty}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{item.totalAssigned}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">{item.completedCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {item.efficiencyRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(item.laborProduced)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      {formatCurrency(item.commission)}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({item.technician.commissionRate}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer for Print */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-3">
          <div>
            TechFix Pro &bull; Sistema de Gestión de Mantenimiento y Reparación de Equipos
          </div>
          <div className="font-semibold text-slate-700">
            Total General Facturado en el Mes: <span className="text-sm font-black text-slate-900 ml-1">{formatCurrency(totalBilledMonth)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
