import React, { useState } from 'react';
import { api } from '../../services/api';
import InvoicePrintModal from '../InvoicePrintModal';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export default function UserInvoicesTab({ invoices, currentUser, onInvoicePaid }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handlePayInvoice = async (e) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setProcessing(true);
    try {
      const paid = await api.payInvoice(payingInvoice.id, paymentMethod);
      if (onInvoicePaid) onInvoicePaid(paid);
      setSuccessMessage(`Payment of ₹${payingInvoice.totalAmount?.toLocaleString('en-IN')} confirmed via ${paymentMethod}!`);
      setPayingInvoice(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert("Payment failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Icon name="receipt_long" size={22} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Invoices &amp; Payments</h2>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Icon name="check_circle" size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-zinc-800 bg-zinc-950/40 rounded-2xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto border border-zinc-800 text-zinc-500">
            <Icon name="receipt" size={28} />
          </div>
          <h3 className="text-base font-semibold text-white">No invoices generated yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            When a technician signs off your vehicle's service, your tax-compliant itemized invoice will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <Card
              key={inv.id}
              className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-5 shadow-md hover:border-zinc-700 transition-all"
            >
              {/* Top Row: Invoice Number, Vehicle, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono font-bold text-white bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                    {inv.invoiceNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{inv.serviceDescription}</h3>
                    <div className="text-xs text-zinc-400 font-mono">
                      Vehicle: <strong className="text-zinc-200">{inv.vehiclePlate}</strong> ({inv.vehicleModel})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={inv.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    {inv.paymentStatus}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInvoice(inv)}
                    className="h-8 gap-1.5 text-xs font-semibold rounded-xl"
                  >
                    <Icon name="visibility" size={14} /> View Receipt
                  </Button>
                  {inv.paymentStatus === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => setPayingInvoice(inv)}
                      className="h-8 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
                    >
                      <Icon name="payment" size={14} /> Pay Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Itemized Calculation Summary (User & Admin match) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-sans block">Parts / Service</span>
                  <span className="text-white font-bold">₹{inv.partsTotal?.toLocaleString('en-IN') || 1200}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-sans block">Labour Charges</span>
                  <span className="text-white font-bold">₹{inv.laborTotal?.toLocaleString('en-IN') || 300}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-sans block">GST (18%)</span>
                  <span className="text-zinc-300 font-bold">₹{inv.taxAmount?.toLocaleString('en-IN') || 270}</span>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-zinc-800 pt-2 md:pt-0 md:pl-3">
                  <span className="text-[10px] text-emerald-400 uppercase font-sans block font-bold">Total Amount</span>
                  <span className="text-lg text-emerald-400 font-extrabold">₹{inv.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Details Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <span className="font-mono text-[11px]">
                  Payment Mode: <strong className="text-zinc-200">{inv.paymentMethod || 'Pending Settlement'}</strong>
                </span>
                {inv.paidAt && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <Icon name="check" size={13} /> Settled on {new Date(inv.paidAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pay Now Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Icon name="payment" size={18} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">Settle Invoice Payment</h3>
              </div>
              <button onClick={() => setPayingInvoice(null)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>Invoice:</span>
                <span className="text-white font-bold">{payingInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Vehicle:</span>
                <span className="text-white">{payingInvoice.vehiclePlate}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Subtotal:</span>
                <span className="text-white">₹{payingInvoice.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>GST (18%):</span>
                <span className="text-white">₹{payingInvoice.taxAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold text-sm">
                <span className="text-white">Total Payable:</span>
                <span className="text-emerald-400">₹{payingInvoice.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handlePayInvoice} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Select Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="UPI (GPay / PhonePe / Paytm)">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card (Visa / Mastercard / RuPay)</option>
                  <option value="NetBanking">NetBanking (SBI / HDFC / ICICI / Axis)</option>
                  <option value="Cash at Counter">Cash on Vehicle Delivery</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayingInvoice(null)}
                  className="h-9 px-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white"
                >
                  {processing ? 'Processing...' : `Pay ₹${payingInvoice.totalAmount?.toLocaleString('en-IN')}`}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Printable Invoice View Modal */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPay={(id) => {
            const inv = invoices.find(i => i.id === id);
            setSelectedInvoice(null);
            setPayingInvoice(inv);
          }}
        />
      )}
    </div>
  );
}
