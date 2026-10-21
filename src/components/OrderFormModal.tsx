import React, { useState } from 'react';
import { 
  X, 
  Laptop, 
  Printer, 
  User, 
  Plus, 
  Calendar, 
  AlertTriangle,
  Check,
  Wrench
} from 'lucide-react';
import { 
  ServiceOrder, 
  Client, 
  Technician, 
  SparePart, 
  DeviceType, 
  DeviceCategory, 
  Priority,
  OrderStatus 
} from '../types';
import { calculateOrderTotal } from '../utils/storage';

interface OrderFormModalProps {
  clients: Client[];
  technicians: Technician[];
  spareParts: SparePart[];
  existingOrder?: ServiceOrder;
  onClose: () => void;
  onSave: (order: ServiceOrder) => void;
  onQuickCreateClient: (newClient: Client) => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  clients,
  technicians,
  spareParts,
  existingOrder,
  onClose,
  onSave,
  onQuickCreateClient
}) => {
  // Client selection
  const [clientId, setClientId] = useState(existingOrder?.clientId || (clients[0]?.id || ''));
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientDoc, setNewClientDoc] = useState('');

  // Device Specs
  const [deviceType, setDeviceType] = useState<DeviceType>(existingOrder?.deviceType || 'computadora');
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>(
    existingOrder?.deviceCategory || 'laptop'
  );
  const [brand, setBrand] = useState(existingOrder?.brand || '');
  const [model, setModel] = useState(existingOrder?.model || '');
  const [serialNumber, setSerialNumber] = useState(existingOrder?.serialNumber || '');
  const [passwordOrPin, setPasswordOrPin] = useState(existingOrder?.passwordOrPin || '');

  // Accessories
  const standardComputerAccessories = ['Cargador original', 'Cable de poder', 'Funda / Maletín', 'Mouse / Teclado', 'Adaptador USB'];
  const standardPrinterAccessories = ['Cable de poder', 'Cable USB', 'Bandeja de papel', 'Cartuchos / Toners instalados', 'Transformador 24V'];

  const [accessories, setAccessories] = useState<string[]>(existingOrder?.accessoriesIncluded || ['Cable de poder']);
  const [customAccessory, setCustomAccessory] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState(
    existingOrder?.physicalConditionNotes || 'Equipo en buen estado general, desgaste estético normal de uso.'
  );

  // Technical info
  const [reportedFault, setReportedFault] = useState(existingOrder?.reportedFault || '');
  const [technicianId, setTechnicianId] = useState(existingOrder?.technicianId || (technicians[0]?.id || ''));
  const [priority, setPriority] = useState<Priority>(existingOrder?.priority || 'media');
  const [laborCost, setLaborCost] = useState(existingOrder?.laborCost || 35);
  const [estimatedDays, setEstimatedDays] = useState(2);

  const toggleAccessory = (acc: string) => {
    if (accessories.includes(acc)) {
      setAccessories(accessories.filter(a => a !== acc));
    } else {
      setAccessories([...accessories, acc]);
    }
  };

  const handleAddCustomAccessory = () => {
    if (customAccessory.trim() && !accessories.includes(customAccessory.trim())) {
      setAccessories([...accessories, customAccessory.trim()]);
      setCustomAccessory('');
    }
  };

  const handleSaveQuickClient = () => {
    if (!newClientName.trim() || !newClientPhone.trim()) return;
    const newCli: Client = {
      id: `cli-${Date.now()}`,
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim() || 'contacto@cliente.com',
      documentId: newClientDoc.trim() || `V-${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: 'Ciudad de México',
      createdAt: new Date().toISOString()
    };
    onQuickCreateClient(newCli);
    setClientId(newCli.id);
    setShowQuickClient(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !reportedFault.trim() || !clientId) {
      alert('Por favor complete los campos obligatorios: Cliente, Marca, Modelo y Falla reportada.');
      return;
    }

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

    const calculated = calculateOrderTotal(
      laborCost,
      existingOrder?.usedParts || [],
      existingOrder?.discount || 0,
      existingOrder?.taxRate || 0.16
    );

    const orderId = existingOrder?.id || `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderToSave: ServiceOrder = {
      id: orderId,
      clientId,
      technicianId,
      deviceType,
      deviceCategory,
      brand: brand.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      passwordOrPin: passwordOrPin.trim(),
      accessoriesIncluded: accessories,
      physicalConditionNotes: physicalCondition.trim(),
      reportedFault: reportedFault.trim(),
      technicalDiagnosis: existingOrder?.technicalDiagnosis || '',
      repairDetails: existingOrder?.repairDetails || '',
      status: existingOrder?.status || 'recibida',
      priority,
      createdAt: existingOrder?.createdAt || new Date().toISOString(),
      estimatedCompletionDate: existingOrder?.estimatedCompletionDate || estimatedDate.toISOString(),
      laborCost,
      usedParts: existingOrder?.usedParts || [],
      discount: existingOrder?.discount || 0,
      taxRate: existingOrder?.taxRate || 0.16,
      totalAmount: calculated.total,
      amountPaid: existingOrder?.amountPaid || 0,
      paymentStatus: existingOrder?.paymentStatus || 'pendiente',
      logs: existingOrder?.logs || [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'Recepción Técnica',
          status: 'recibida',
          note: `Equipo ingresado al laboratorio: ${brand} ${model}. Falla: ${reportedFault}`
        }
      ]
    };

    onSave(orderToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {existingOrder ? `Editar Orden ${existingOrder.id}` : 'Nueva Orden de Servicio Técnico'}
              </h2>
              <p className="text-xs text-slate-400">
                Registro de recepción de equipo para laboratorio
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5 text-xs text-slate-700">
          
          {/* SECTION 1: Client Selection */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Cliente Solicitante *
              </label>
              <button
                type="button"
                onClick={() => setShowQuickClient(!showQuickClient)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showQuickClient ? 'Elegir existente' : 'Nuevo cliente rápido'}</span>
              </button>
            </div>

            {showQuickClient ? (
              <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-2.5">
                <div className="text-[11px] font-semibold text-blue-700">Registrar Cliente Rápido:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre completo o Empresa *"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono / WhatsApp *"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="DNI / RUT / Cédula"
                    value={newClientDoc}
                    onChange={(e) => setNewClientDoc(e.target.value)}
                    className="p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveQuickClient}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                >
                  Guardar y Seleccionar Cliente
                </button>
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''} - Tel: {c.phone}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* SECTION 2: Device Type Selector */}
          <div className="space-y-3">
            <label className="font-bold text-slate-800 uppercase tracking-wider block">
              Tipo de Dispositivo a Reparar *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeviceType('computadora');
                  setDeviceCategory('laptop');
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  deviceType === 'computadora'
                    ? 'border-blue-500 bg-blue-50/60 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  deviceType === 'computadora' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Computadora / PC</div>
                  <div className="text-[10px] text-slate-500">Laptops, Escritorio, Servidores</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeviceType('impresora');
                  setDeviceCategory('impresora_laser');
                }}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  deviceType === 'impresora'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  deviceType === 'impresora' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Printer className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Impresora / Multifuncional</div>
                  <div className="text-[10px] text-slate-500">Láser, Tinta, Térmicas POS</div>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 3: Device Model & Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Categoría Específica:</label>
              <select
                value={deviceCategory}
                onChange={(e) => setDeviceCategory(e.target.value as DeviceCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              >
                {deviceType === 'computadora' ? (
                  <>
                    <option value="laptop">Laptop / Portátil</option>
                    <option value="desktop">PC de Escritorio / Torre</option>
                    <option value="all-in-one">Todo en Uno (All-in-One)</option>
                    <option value="servidor">Servidor / Workstation</option>
                    <option value="otro">Otro</option>
                  </>
                ) : (
                  <>
                    <option value="impresora_laser">Impresora Láser (MFP/Mono)</option>
                    <option value="impresora_tinta">Impresora Tinta Continua (EcoTank)</option>
                    <option value="impresora_termica">Impresora Térmica / Tickets</option>
                    <option value="plotter">Plotter / Gran Formato</option>
                    <option value="otro">Otro</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Marca *:</label>
              <input
                type="text"
                required
                placeholder="Ej. HP, Epson, Dell, Lenovo"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Modelo Exacto *:</label>
              <input
                type="text"
                required
                placeholder="Ej. LaserJet M428fdw / ThinkPad E14"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Número de Serie (S/N):</label>
              <input
                type="text"
                placeholder="Ej. CNB210984X"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono"
              />
            </div>

            {deviceType === 'computadora' && (
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Contraseña o PIN de usuario:</label>
                <input
                  type="text"
                  placeholder="Para pruebas de arranque y drivers"
                  value={passwordOrPin}
                  onChange={(e) => setPasswordOrPin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>
            )}
          </div>

          {/* SECTION 4: Accessories left */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
              Accesorios Recibidos en Taller
            </label>
            <div className="flex flex-wrap gap-2">
              {(deviceType === 'computadora' ? standardComputerAccessories : standardPrinterAccessories).map(acc => {
                const isSelected = accessories.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccessory(acc)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{acc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom accessory input */}
            <div className="flex items-center gap-2 pt-1 max-w-sm">
              <input
                type="text"
                placeholder="Otro accesorio..."
                value={customAccessory}
                onChange={(e) => setCustomAccessory(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomAccessory}
                className="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-semibold"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Physical Condition Notes */}
          <div>
            <label className="text-slate-600 font-semibold block mb-1">Condición Física al Recibir:</label>
            <input
              type="text"
              value={physicalCondition}
              onChange={(e) => setPhysicalCondition(e.target.value)}
              placeholder="Detalle rayones, faltantes de tornillos, golpes..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
            />
          </div>

          {/* Reported Fault */}
          <div>
            <label className="font-bold text-slate-800 text-xs uppercase tracking-wider block mb-1">
              Falla Reportada por el Cliente *
            </label>
            <textarea
              required
              rows={3}
              value={reportedFault}
              onChange={(e) => setReportedFault(e.target.value)}
              placeholder="Describa el problema reportado: 'No enciende', 'Atasca hojas en bandeja 2', 'Pantalla azul al iniciar Windows'..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Technician, Priority and Costs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Técnico Asignado:</label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              >
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Prioridad:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              >
                <option value="baja">Baja</option>
                <option value="media">Media (Estándar)</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Plazo Estimado (Días):</label>
              <input
                type="number"
                min={1}
                max={30}
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(parseInt(e.target.value) || 2)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-600 font-semibold block mb-1">Mano de Obra Base ($):</label>
              <input
                type="number"
                step="0.01"
                value={laborCost}
                onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
            >
              {existingOrder ? 'Guardar Cambios' : 'Ingresar Orden y Generar Ticket'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
