import React, { useState } from 'react';
import { api } from '../services/api';
import InvoicePrintModal from './InvoicePrintModal';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function BillingTab({ invoices, onInvoicePaid }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('FLEET_CREDIT');
  const [processingPay, setProcessingPay] = useState(false);

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);

  const filtered = invoices.filter(inv => {
    const matchesFilter = filterStatus === 'ALL' || inv.paymentStatus === filterStatus;
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.vehicleVin.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    try {
      setProcessingPay(true);
      const paid = await api.payInvoice(paymentModalInvoice.id, paymentMethod);
      onInvoicePaid(paid);
      setPaymentModalInvoice(null);
      if (selectedInvoice && selectedInvoice.id === paid.id) {
        setSelectedInvoice(paid);
      }
    } catch (err) {
      alert("Payment processing failed: " + err.message);
    } finally {
      setProcessingPay(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dynamic Billing &amp; Invoices
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic labor, itemized parts calculation, and 18% GST invoice generation.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Icon name="search" size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Invoice, Client, Plate..."
            className="pl-9"
          />
        </div>
      </div>

      {/* 2-Column Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Total Invoiced</span>
            <Icon name="receipt_long" size={16} />
          </div>
          <div className="text-2xl font-bold text-white">${totalInvoiced.toFixed(2)}</div>
          <div className="text-xs text-zinc-400 font-mono">{invoices.length} Total Invoices</div>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Collected Revenue</span>
            <Icon name="check_circle" size={16} />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${totalPaid.toFixed(2)}</div>
          <div className="text-xs text-zinc-400 font-mono">
            {invoices.filter(i => i.paymentStatus === 'PAID').length} Paid Invoices
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'PENDING', 'PAID'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="text-xs"
          >
            {status} ({status === 'ALL' ? invoices.length : invoices.filter(i => i.paymentStatus === status).length})
          </Button>
        ))}
      </div>

      {/* Invoices Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white">Invoices Ledger</h2>
          <span className="text-xs text-zinc-400 font-mono">{filtered.length} Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3 text-right">Labor</th>
                <th className="py-2.5 px-3 text-right">Parts</th>
                <th className="py-2.5 px-3 text-right">GST (18%)</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-white font-medium">{inv.customerName}</div>
                    <div className="text-[11px] text-zinc-400">{inv.customerEmail}</div>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div className="text-white">{inv.vehiclePlate}</div>
                    <div className="text-[11px] text-zinc-400 font-sans">{inv.vehicleModel}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-300">${inv.laborTotal?.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-300">${inv.partsTotal?.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-300">${inv.taxAmount?.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    ${inv.totalAmount?.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={inv.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                      {inv.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                        className="h-7 text-xs"
                      >
                        View
                      </Button>

                      {inv.paymentStatus === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => setPaymentModalInvoice(inv)}
                          className="h-7 text-xs"
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Settle Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-zinc-900 border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Settle Invoice Payment</h3>
            <div className="p-4 bg-zinc-950 rounded-md border border-zinc-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Invoice:</span>
                <span className="text-white font-bold">{paymentModalInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Client:</span>
                <span className="text-white font-sans">{paymentModalInvoice.customerName}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-zinc-800">
                <span className="text-zinc-300">Total:</span>
                <span className="text-emerald-400">${paymentModalInvoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300">Payment Settlement Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="FLEET_CREDIT">Corporate Fleet Credit Line (Net 30)</option>
                  <option value="CORPORATE_CARD">Corporate Fleet Card (Visa/Mastercard)</option>
                  <option value="ACH_TRANSFER">Automated Clearing House (ACH Transfer)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentModalInvoice(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={processingPay}
                >
                  {processingPay ? 'Authorizing...' : 'Authorize & Pay'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Invoice Printable View Modal */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPay={(id) => {
            const inv = invoices.find(i => i.id === id);
            setPaymentModalInvoice(inv);
          }}
        />
      )}

    </div>
  );
}
