import React from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function InvoicePrintModal({ invoice, onClose, onPay }) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-2xl w-full shadow-2xl overflow-hidden bg-white text-slate-900 border-zinc-200">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-3 bg-zinc-100 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-700">Invoice:</span>
            <span className="font-mono text-xs text-zinc-900 font-bold">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            {invoice.paymentStatus === 'PENDING' && (
              <Button
                size="sm"
                onClick={() => onPay(invoice.id)}
                className="h-7 text-xs"
              >
                Settle Payment
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="h-7 text-xs bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50"
            >
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-zinc-900"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-8 space-y-6 text-xs">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-200 pb-6">
            <div>
              <div className="text-xl font-bold text-zinc-900">PrecisionAuto Care</div>
              <p className="text-zinc-500 mt-0.5">Automotive Fleet Maintenance &amp; Service Operations</p>
              <p className="text-zinc-500">100 Fleet Parkway, Suite 400 &bull; support@precisionauto.com</p>
            </div>

            <div className="text-right font-mono">
              <div className="text-xl font-bold text-zinc-900">INVOICE</div>
              <div className="text-zinc-600 mt-0.5 font-bold">{invoice.invoiceNumber}</div>
              <div className="text-zinc-500 text-[11px] mt-0.5">Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</div>
              <div className="mt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  invoice.paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To & Vehicle */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <div>
              <div className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-1">Bill To</div>
              <div className="font-bold text-zinc-900">{invoice.customerName}</div>
              <div className="text-zinc-600">{invoice.customerEmail}</div>
              <div className="text-zinc-600">{invoice.customerPhone || 'N/A'}</div>
            </div>

            <div>
              <div className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-1">Vehicle Serviced</div>
              <div className="font-bold text-zinc-900 font-mono">{invoice.vehiclePlate} ({invoice.vehicleModel})</div>
              <div className="text-zinc-600 font-mono">VIN: {invoice.vehicleVin}</div>
              <div className="text-zinc-600 mt-0.5">{invoice.serviceDescription}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-300 text-zinc-600 font-semibold uppercase text-[10px]">
                  <th className="py-2">Type</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {invoice.lineItems?.map((item, idx) => (
                  <tr key={idx} className="text-zinc-800">
                    <td className="py-2 font-mono font-medium">{item.itemType}</td>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right font-mono">${item.unitPrice?.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono font-semibold">${item.totalPrice?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-2 border-t border-zinc-200">
            <div className="w-60 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Labor:</span>
                <span className="font-mono text-zinc-900">${invoice.laborTotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Parts:</span>
                <span className="font-mono text-zinc-900">${invoice.partsTotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shop Supplies Fee:</span>
                <span className="font-mono text-zinc-900">${invoice.shopSuppliesFee?.toFixed(2) || '18.50'}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>GST (18%):</span>
                <span className="font-mono text-zinc-900">${invoice.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-300 text-sm">
                <span>Total Amount:</span>
                <span className="font-mono">${invoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="pt-4 border-t border-zinc-200 text-[10px] text-zinc-500 text-center">
            PrecisionAuto Care &bull; Microservices Invoicing &bull; PS024
          </div>

        </div>

      </Card>
    </div>
  );
}
