import React, { useState } from 'react';
import { api } from '../../services/api';
import InvoicePrintModal from '../InvoicePrintModal';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function AdminInvoicesTab({ invoices = [], onInvoicePaid }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [markingPaidId, setMarkingPaidId] = useState(null);

  const filtered = invoices.filter(inv => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(s) ||
      inv.customerName.toLowerCase().includes(s) ||
      inv.vehiclePlate.toLowerCase().includes(s);

    const matchStatus = filterStatus === 'ALL' || inv.paymentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = invoices.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPending = invoices.filter(i => i.paymentStatus === 'PENDING').reduce((sum, i) => sum + i.totalAmount, 0);

  const handleMarkPaid = async (inv) => {
    if (!window.confirm(`Mark invoice ${inv.invoiceNumber} as PAID?`)) return;
    setMarkingPaidId(inv.id);
    try {
      const paid = await api.payInvoice(inv.id, 'Counter Settlement (Admin)');
      if (onInvoicePaid) onInvoicePaid(paid);
    } catch (err) {
      alert("Failed to mark invoice paid: " + err.message);
    } finally {
      setMarkingPaidId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Icon name="receipt_long" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Garage Billing &amp; Invoices</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Master billing ledger &bull; Automated 18% GST tax invoices, settlement modes, and accounting reports.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Icon name="search" size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search Invoice, Customer, Plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs bg-zinc-950/80 rounded-xl"
          />
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <span className="text-xs font-semibold text-zinc-400">Total Invoiced</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{totalInvoiced.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">{invoices.length} Invoices Emitted</div>
        </Card>

        <Card className="p-5 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <span className="text-xs font-semibold text-zinc-400">Total Collected</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-500 font-mono">
            {invoices.filter(i => i.paymentStatus === 'PAID').length} Paid Invoices
          </div>
        </Card>

        <Card className="p-5 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <span className="text-xs font-semibold text-zinc-400">Pending Receivables</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-500 font-mono">
            {invoices.filter(i => i.paymentStatus === 'PENDING').length} Unpaid Invoices
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'PENDING', 'PAID'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              filterStatus === st
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold shadow-sm'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            {st} ({st === 'ALL' ? invoices.length : invoices.filter(i => i.paymentStatus === st).length})
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Icon name="receipt" size={16} className="text-purple-400" /> Invoices Master Ledger
          </h3>
          <span className="text-xs text-zinc-400 font-mono">{filtered.length} Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-sans font-semibold">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3 text-right">Parts (₹)</th>
                <th className="py-3 px-3 text-right">Labour (₹)</th>
                <th className="py-3 px-3 text-right">GST 18% (₹)</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">
                    <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-purple-400">
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans font-semibold text-white">
                    {inv.customerName}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-white font-bold">{inv.vehiclePlate}</div>
                    <div className="text-[10px] text-zinc-400 font-sans">{inv.vehicleModel}</div>
                  </td>
                  <td className="py-3 px-3 text-right text-zinc-300">₹{inv.partsTotal?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right text-zinc-300">₹{inv.laborTotal?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right text-zinc-300">₹{inv.taxAmount?.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400 text-sm">
                    ₹{inv.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center font-sans">
                    <Badge variant={inv.paymentStatus === 'PAID' ? 'success' : 'warning'} className="text-[10px]">
                      {inv.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                        className="h-7 text-xs rounded-lg"
                      >
                        View Receipt
                      </Button>
                      {inv.paymentStatus === 'PENDING' && (
                        <Button
                          size="sm"
                          disabled={markingPaidId === inv.id}
                          onClick={() => handleMarkPaid(inv)}
                          className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                        >
                          Mark Paid
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

      {/* Invoice Printable View Modal */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPay={() => {}}
        />
      )}
    </div>
  );
}
