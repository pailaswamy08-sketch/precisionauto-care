import React from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

export default function InvoicePrintModal({ invoice, onClose, onPay }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.paymentStatus === 'PAID';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <Card className="max-w-xl w-full p-8 space-y-6 bg-zinc-900 border-zinc-800 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between no-print pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Icon name="receipt_long" size={20} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Tax Invoice Receipt</h3>
              <p className="text-[11px] text-zinc-400 font-mono">{invoice.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 gap-1.5 text-xs font-semibold rounded-xl"
            >
              <Icon name="print" size={14} /> Print / PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-6 font-mono text-xs text-zinc-200">
          
          {/* Header Branding */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-zinc-700">
            <div className="text-sm font-black tracking-widest text-white uppercase font-sans">
              PRECISIONAUTO CARE
            </div>
            <div className="text-[10px] text-zinc-400">
              Premium Automobile Maintenance &amp; Diagnostic Centre
            </div>
            <div className="text-[10px] text-zinc-500">
              GSTIN: 36AAACP9821R1Z8 &bull; Ph: +91 98765 43210
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <div className="text-zinc-500 uppercase text-[9px] font-sans">Invoice ID</div>
              <div className="font-bold text-white text-xs">{invoice.invoiceNumber}</div>
              <div className="text-zinc-400 text-[10px] mt-1">Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</div>
            </div>
            <div className="text-right">
              <div className="text-zinc-500 uppercase text-[9px] font-sans">Customer</div>
              <div className="font-bold text-white text-xs">{invoice.customerName || 'Swamy Paila'}</div>
              <div className="text-zinc-400 text-[10px] mt-1">{invoice.customerPhone || '9876543210'}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px]">
            <span className="text-zinc-500 uppercase text-[9px] font-sans block">Serviced Vehicle</span>
            <span className="font-bold text-white">{invoice.vehiclePlate}</span>
            <span className="text-zinc-400 ml-2">({invoice.vehicleModel})</span>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 pt-2 border-t border-dashed border-zinc-700">
            <div className="flex justify-between text-zinc-500 uppercase font-sans text-[10px] font-bold">
              <span>Description</span>
              <span>Amount (₹)</span>
            </div>

            {/* Service / Parts */}
            <div className="flex justify-between text-zinc-200">
              <span>{invoice.serviceDescription?.split('-')[0] || 'Service Package / Parts'}</span>
              <span className="font-bold">₹{invoice.partsTotal?.toLocaleString('en-IN') || 1200}</span>
            </div>

            {/* Labour */}
            <div className="flex justify-between text-zinc-200">
              <span>Master Technician Labour</span>
              <span className="font-bold">₹{invoice.laborTotal?.toLocaleString('en-IN') || 300}</span>
            </div>

            {/* Additional line items if present */}
            {invoice.lineItems && invoice.lineItems.length > 2 && (
              invoice.lineItems.slice(2).map((item, idx) => (
                <div key={idx} className="flex justify-between text-zinc-300">
                  <span>{item.description}</span>
                  <span className="font-bold">₹{item.totalPrice?.toLocaleString('en-IN')}</span>
                </div>
              ))
            )}
          </div>

          {/* Totals & GST */}
          <div className="space-y-1.5 pt-3 border-t border-dashed border-zinc-700 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-bold text-white">₹{invoice.subtotal?.toLocaleString('en-IN') || 1500}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>GST (18% Integrated Tax):</span>
              <span className="font-bold text-white">₹{invoice.taxAmount?.toLocaleString('en-IN') || 270}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-700 text-sm font-bold">
              <span className="text-white font-sans uppercase">TOTAL AMOUNT:</span>
              <span className="text-emerald-400 text-base">₹{invoice.totalAmount?.toLocaleString('en-IN') || 1770}</span>
            </div>
          </div>

          {/* Payment Status Stamp */}
          <div className="pt-4 border-t border-dashed border-zinc-700 flex items-center justify-between">
            <div>
              <span className="text-zinc-500 uppercase text-[9px] font-sans block">Payment Status</span>
              <Badge variant={isPaid ? 'success' : 'warning'} className="text-xs font-bold font-sans">
                {isPaid ? 'PAID' : 'PENDING PAYMENT'}
              </Badge>
            </div>
            {invoice.paymentMethod && (
              <div className="text-right text-[10px] text-zinc-400">
                Mode: <strong className="text-zinc-200">{invoice.paymentMethod}</strong>
              </div>
            )}
          </div>

          <div className="text-center text-[10px] text-zinc-500 pt-2 font-sans italic">
            Thank you for choosing PrecisionAuto Care. Safe Driving!
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 no-print pt-2">
          {!isPaid && onPay && (
            <Button
              size="sm"
              onClick={() => onPay(invoice.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-5 h-9"
            >
              <Icon name="payment" size={15} /> Settle Payment Now
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5 h-9"
          >
            Close
          </Button>
        </div>

      </Card>
    </div>
  );
}
