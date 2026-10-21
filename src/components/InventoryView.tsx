import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Laptop, 
  Printer, 
  TrendingUp, 
  Edit2, 
  Trash2, 
  X,
  ArrowDownRight,
  Boxes
} from 'lucide-react';
import { SparePart } from '../types';
import { formatCurrency } from '../utils/storage';

interface InventoryViewProps {
  spareParts: SparePart[];
  onSavePart: (part: SparePart) => void;
  onDeletePart: (partId: string) => void;
  onRestockPart: (partId: string, addedQty: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  spareParts,
  onSavePart,
  onDeletePart,
  onRestockPart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'computadoras' | 'impresoras' | 'low_stock'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [partForm, setPartForm] = useState<Partial<SparePart>>({});
  const [restockModalPart, setRestockModalPart] = useState<SparePart | null>(null);
  const [restockQty, setRestockQty] = useState(5);

  const filteredParts = useMemo(() => {
    return spareParts.filter(part => {
      // Category / Alert filter
      if (categoryFilter === 'low_stock') {
        if (part.stock > part.minStock) return false;
      } else if (categoryFilter !== 'all' && part.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          part.name.toLowerCase().includes(q) ||
          part.sku.toLowerCase().includes(q) ||
          part.subcategory.toLowerCase().includes(q) ||
          part.compatibleWith.toLowerCase().includes(q) ||
          part.location.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [spareParts, categoryFilter, searchQuery]);

  // KPIs
  const totalItemsCount = spareParts.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryCost = spareParts.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const totalSellingValue = spareParts.reduce((acc, p) => acc + (p.sellingPrice * p.stock), 0);
  const lowStockCount = spareParts.filter(p => p.stock <= p.minStock).length;

  const handleOpenNew = () => {
    setPartForm({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'computadoras',
      subcategory: 'Almacenamiento SSD',
      compatibleWith: '',
      stock: 5,
      minStock: 2,
      costPrice: 20,
      sellingPrice: 35,
      location: 'Estante A-1'
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (part: SparePart) => {
    setPartForm({ ...part });
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partForm.name?.trim() || !partForm.sku?.trim()) {
      alert('Nombre y SKU son requeridos.');
      return;
    }

    const partToSave: SparePart = {
      id: partForm.id || `rep-${Date.now()}`,
      sku: partForm.sku.trim().toUpperCase(),
      name: partForm.name.trim(),
      category: partForm.category || 'computadoras',
      subcategory: partForm.subcategory?.trim() || 'General',
      compatibleWith: partForm.compatibleWith?.trim() || 'Universal',
      stock: Number(partForm.stock) || 0,
      minStock: Number(partForm.minStock) || 2,
      costPrice: Number(partForm.costPrice) || 0,
      sellingPrice: Number(partForm.sellingPrice) || 0,
      location: partForm.location?.trim() || 'Taller Central'
    };

    onSavePart(partToSave);
    setIsEditing(false);
  };

  const handleApplyRestock = () => {
    if (!restockModalPart || restockQty <= 0) return;
    onRestockPart(restockModalPart.id, restockQty);
    setRestockModalPart(null);
    setRestockQty(5);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Inventario de Repuestos & Insumos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Control de stock, alertas de agotamiento y compatibilidad para PCs e impresoras
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Repuesto</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Repuestos Registrados
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{spareParts.length} SKUs</div>
          <p className="text-xs text-slate-400 mt-0.5">{totalItemsCount} unidades en almacén</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Valor de Compra (Costo)
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalInventoryCost)}</div>
          <p className="text-xs text-slate-400 mt-0.5">Capital invertido en stock</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Valor Comercial (Venta)
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalSellingValue)}</div>
          <p className="text-xs text-emerald-600/80 font-medium mt-0.5">
            Margen estimado: {formatCurrency(totalSellingValue - totalInventoryCost)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Alertas de Stock Bajo
          </span>
          <div className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {lowStockCount} artículos
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {lowStockCount > 0 ? 'Requieren compra a proveedores' : 'Stock en niveles seguros'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({spareParts.length})
          </button>
          <button
            onClick={() => setCategoryFilter('computadoras')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              categoryFilter === 'computadoras' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-blue-600" />
            Computadoras
          </button>
          <button
            onClick={() => setCategoryFilter('impresoras')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              categoryFilter === 'impresoras' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            Impresoras
          </button>
          <button
            onClick={() => setCategoryFilter('low_stock')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
              categoryFilter === 'low_stock' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Stock Bajo ({lowStockCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por SKU, nombre, compatibilidad o ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-3">Repuesto & SKU</th>
                <th className="px-4 py-3">Categoría & Ubicación</th>
                <th className="px-4 py-3">Modelos Compatibles</th>
                <th className="px-4 py-3 text-center">Existencias</th>
                <th className="px-4 py-3 text-right">Costo</th>
                <th className="px-4 py-3 text-right">Precio Venta</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No se encontraron repuestos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredParts.map(part => {
                  const isLow = part.stock <= part.minStock;
                  const marginPercent = part.costPrice > 0 
                    ? Math.round(((part.sellingPrice - part.costPrice) / part.costPrice) * 100) 
                    : 0;

                  return (
                    <tr key={part.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & SKU */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{part.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                            {part.sku}
                          </span>
                          <span className="text-[11px] text-slate-400">{part.subcategory}</span>
                        </div>
                      </td>

                      {/* Category & Location */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          {part.category === 'computadoras' ? (
                            <Laptop className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span className="capitalize">{part.category}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Loc: {part.location}
                        </div>
                      </td>

                      {/* Compatibility */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <p className="truncate text-slate-600 font-medium" title={part.compatibleWith}>
                          {part.compatibleWith}
                        </p>
                      </td>

                      {/* Stock Level */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isLow 
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {part.stock} unid.
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Mínimo: {part.minStock}
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="px-4 py-3.5 text-right font-medium text-slate-600 whitespace-nowrap">
                        {formatCurrency(part.costPrice)}
                      </td>

                      {/* Selling Price & Margin */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {formatCurrency(part.sellingPrice)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          +{marginPercent}% margen
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setRestockModalPart(part)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                            title="Añadir stock"
                          >
                            <Boxes className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">+Stock</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(part)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Editar repuesto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar repuesto ${part.name}?`)) {
                                onDeletePart(part.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="Eliminar repuesto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Quick Restock Modal */}
      {restockModalPart && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">Reabastecer Repuesto</h2>
              <button onClick={() => setRestockModalPart(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <div className="font-bold text-slate-900 text-sm">{restockModalPart.name}</div>
                <div className="text-slate-500 font-mono mt-0.5">SKU: {restockModalPart.sku}</div>
                <div className="text-slate-500 mt-1">Stock actual: <strong>{restockModalPart.stock} unidades</strong></div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Cantidad de unidades a sumar al stock:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={restockQty}
                    onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-center text-sm font-bold"
                  />
                  <div className="flex gap-1">
                    {[5, 10, 20].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRestockQty(n)}
                        className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-800">
                Nuevo stock resultante: <strong>{restockModalPart.stock + restockQty} unidades</strong>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockModalPart(null)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyRestock}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Sumar al Inventario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Part Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {partForm.id ? 'Editar Repuesto' : 'Nuevo Repuesto'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Nombre Descriptivo del Repuesto *:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Unidad SSD Kingston 1TB NVMe / Fusor HP LaserJet RM2-5399"
                  value={partForm.name || ''}
                  onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Código / SKU *:</label>
                  <input
                    type="text"
                    required
                    value={partForm.sku || ''}
                    onChange={(e) => setPartForm({ ...partForm, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Categoría Principal:</label>
                  <select
                    value={partForm.category || 'computadoras'}
                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  >
                    <option value="computadoras">Computadoras / Laptops</option>
                    <option value="impresoras">Impresoras / Plotters</option>
                    <option value="general">General / Electrónica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Subcategoría:</label>
                  <input
                    type="text"
                    placeholder="Ej. Toners, Fusores, RAM, SSD"
                    value={partForm.subcategory || ''}
                    onChange={(e) => setPartForm({ ...partForm, subcategory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Ubicación en Taller:</label>
                  <input
                    type="text"
                    placeholder="Ej. Estante B-2, Cajón 4"
                    value={partForm.location || ''}
                    onChange={(e) => setPartForm({ ...partForm, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Compatibilidad (Marcas y Modelos):</label>
                <input
                  type="text"
                  placeholder="Ej. HP LaserJet Pro M402, M404, M428 MFP / Dell Latitude 5420"
                  value={partForm.compatibleWith || ''}
                  onChange={(e) => setPartForm({ ...partForm, compatibleWith: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Stock Inicial:</label>
                  <input
                    type="number"
                    min={0}
                    value={partForm.stock ?? 5}
                    onChange={(e) => setPartForm({ ...partForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Stock Mínimo:</label>
                  <input
                    type="number"
                    min={1}
                    value={partForm.minStock ?? 2}
                    onChange={(e) => setPartForm({ ...partForm, minStock: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Costo ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={partForm.costPrice ?? 0}
                    onChange={(e) => setPartForm({ ...partForm, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-center"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">P. Venta ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={partForm.sellingPrice ?? 0}
                    onChange={(e) => setPartForm({ ...partForm, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-center font-bold text-emerald-700"
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
                  Guardar Repuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
