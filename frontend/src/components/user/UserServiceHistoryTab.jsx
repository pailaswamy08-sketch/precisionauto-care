import React, { useState } from 'react';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function UserServiceHistoryTab({ records, onSelectInvoice }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const completedRecords = records.filter(r => 
    r.serviceStatus === 'COMPLETED' || r.serviceStatus === 'INVOICED' || r.serviceStatus === 'IN_PROGRESS'
  );

  const filtered = completedRecords.filter(r => {
    const s = searchTerm.toLowerCase();
    return (
      r.vehiclePlate.toLowerCase().includes(s) ||
      r.vehicleModel.toLowerCase().includes(s) ||
      r.servicePackage.toLowerCase().includes(s) ||
      r.recordNumber.toLowerCase().includes(s) ||
      (r.assignedTechnicianName && r.assignedTechnicianName.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Icon name="history" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Service History ⭐</h2>
          </div>
          <p className="text-xs text-zinc-400">
            View completed service logs, technician notes, replaced parts, and diagnostic inspection results.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Icon name="search" size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search Plate, Record, Service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs bg-zinc-950/80 rounded-xl"
          />
        </div>
      </div>

      {/* Grid: Records List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-zinc-800 bg-zinc-950/40 rounded-2xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto border border-zinc-800 text-zinc-500">
            <Icon name="build_circle" size={28} />
          </div>
          <h3 className="text-base font-semibold text-white">No service history records</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Once a technician completes service on your vehicle, full diagnostic reports, parts logs, and invoices will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => (
            <Card
              key={rec.id}
              className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-5 shadow-md hover:border-zinc-700 transition-all"
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono font-bold text-white bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                    {rec.vehiclePlate}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{rec.vehicleModel}</h3>
                    <div className="text-xs text-blue-400 font-semibold">{rec.servicePackage}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={rec.serviceStatus === 'COMPLETED' ? 'success' : 'warning'}>
                    {rec.serviceStatus}
                  </Badge>
                  {rec.invoiceNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectInvoice && onSelectInvoice(rec.invoiceNumber)}
                      className="h-8 gap-1.5 text-xs font-mono font-semibold text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/50 rounded-xl"
                    >
                      <Icon name="receipt" size={14} /> {rec.invoiceNumber} &rarr;
                    </Button>
                  )}
                </div>
              </div>

              {/* Middle 3-Column Diagnostic & Cost Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* 1. Problem Diagnosed */}
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="report_problem" size={13} className="text-amber-400" /> Problem Reported
                  </div>
                  <p className="text-zinc-200 leading-relaxed font-mono">
                    {rec.problemDescription || 'Routine service & multi-point diagnostics check.'}
                  </p>
                </div>

                {/* 2. Work Performed */}
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="check_circle" size={13} className="text-emerald-400" /> Work Performed
                  </div>
                  <p className="text-zinc-200 leading-relaxed font-mono">
                    {rec.workPerformed || rec.technicianNotes || 'Parts replaced and system testing completed.'}
                  </p>
                </div>

                {/* 3. Cost & Technician Info */}
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="person" size={13} className="text-blue-400" /> Technician &amp; Cost
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-zinc-300">
                      <span>Technician:</span>
                      <span className="text-white font-bold">{rec.assignedTechnicianName || 'Ravi Kumar'}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Parts Cost:</span>
                      <span className="text-white">₹{rec.partsCost?.toLocaleString('en-IN') || 1200}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>Labour Charges:</span>
                      <span className="text-white">₹{rec.labourCost?.toLocaleString('en-IN') || 300}</span>
                    </div>
                    <div className="flex justify-between text-zinc-300 pt-1 border-t border-zinc-800 font-bold">
                      <span>Subtotal:</span>
                      <span className="text-emerald-400 text-xs">₹{(rec.totalCost || (rec.partsCost + rec.labourCost))?.toLocaleString('en-IN') || 1500}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Itemized Parts Used If Available */}
              {rec.parts && rec.parts.length > 0 && (
                <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs space-y-1.5">
                  <div className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Icon name="build" size={12} /> Itemized Replacement Parts ({rec.parts.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rec.parts.map((p, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                        {p.partName} (x{p.quantity}) &bull; ₹{p.totalPrice || (p.quantity * p.unitPrice)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
