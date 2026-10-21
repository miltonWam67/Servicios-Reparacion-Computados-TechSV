import React from 'react';
import { X, Printer as PrintIcon, CheckCircle2, FileText, Wrench } from 'lucide-react';
import { Payment, ServiceOrder, Client } from '../types';
import { formatCurrency, formatDateTime } from '../utils/storage';

interface PaymentReceiptModalProps {
  payment: Payment;
  order?: ServiceOrder;
  client?: Client;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  order,
  client,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const balanceAfter = order 
    ? Math.max(0, (order.totalAmount || 0) - (order.amountPaid || 0))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header - No print */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Comprobante de Pago / Recibo</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
            >
              <PrintIcon className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Body (Formatted for printing and screen) */}
        <div className="p-8 space-y-5 text-slate-800 text-xs bg-white font-sans print:p-0">
          
          {/* Company Branding */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center gap-2 font-black text-slate-900 text-base">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span>TechFix Pro</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Centro Especializado en Reparación y Mantenimiento de Computadoras e Impresoras
            </p>
            <p className="text-[10px] text-slate-400">
              Av. Insurgentes Sur #1420 &bull; Tel / WhatsApp: +52 (55) 8920-1120
            </p>
            <p className="text-[10px] text-slate-400">RFC: TFP-210419-AB9 &bull; info@techfixpro.com</p>
          </div>

          {/* Receipt Number & Date */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Recibo de Caja Nº</span>
              <span className="text-sm font-mono font-black text-slate-900">{payment.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha de Emisión</span>
              <span className="text-xs font-semibold text-slate-700">{formatDateTime(payment.date)}</span>
            </div>
          </div>

          {/* Client & Equipment Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Cliente:</span>
              <div className="font-bold text-slate-900">{client?.name || 'Cliente'}</div>
              <div className="text-slate-500 font-mono text-[11px]">{client?.documentId}</div>
              <div className="text-slate-500">{client?.phone}</div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Equipo & Orden:</span>
              <div className="font-bold text-blue-700">{payment.serviceOrderId}</div>
              {order && (
                <div className="text-slate-700">
                  {order.brand} {order.model}
                  <div className="text-[11px] text-slate-400 font-mono">S/N: {order.serialNumber}</div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details Box */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 font-bold text-[11px] text-slate-600 border-b border-slate-200">
              Concepto del Pago
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-slate-900">
                    {payment.notes || `Servicio técnico y mantenimiento: ${order?.brand} ${order?.model}`}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Método: <strong className="capitalize">{payment.method}</strong>
                    {payment.referenceNumber && ` (Ref: ${payment.referenceNumber})`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-base text-emerald-600">{formatCurrency(payment.amount)}</div>
                </div>
              </div>

              {order && (
                <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                  <span>Total de la Orden: {formatCurrency(order.totalAmount)}</span>
                  <span>Total Pagado Acumulado: {formatCurrency(order.amountPaid)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Balance Status */}
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700">Saldo Pendiente de la Orden:</span>
            <span className={`font-black text-sm ${balanceAfter > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {balanceAfter > 0 ? formatCurrency(balanceAfter) : 'Liquidada al 100%'}
            </span>
          </div>

          {/* Terms & Warranty Notice */}
          <div className="text-[10px] text-slate-400 space-y-1 text-center pt-2">
            <p>
              * Garantía técnica de 90 días por concepto de mano de obra y repuestos sustituidos.
            </p>
            <p>
              Conserve este comprobante para cualquier aclaración o reclamo de garantía.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-6 text-center text-[10px] text-slate-500">
            <div className="border-t border-slate-300 pt-1">
              Firma y Sello de Taller
            </div>
            <div className="border-t border-slate-300 pt-1">
              Firma del Cliente de Conformidad
            </div>
          </div>

        </div>

        {/* Footer actions - No print */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xl font-semibold text-slate-600 hover:bg-slate-100 text-xs"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <PrintIcon className="w-4 h-4" />
            <span>Imprimir Recibo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
