import React, { useState } from 'react';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function AdminServiceRecordsTab({ records = [], onSelectInvoice }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filtered = records.filter(r => {
    const s = searchTerm.toLowerCase();
    return (
      r.recordNumber.toLowerCase().includes(s) ||
      r.customerName.toLowerCase().includes(s) ||
      r.vehiclePlate.toLowerCase().includes(s) ||
      r.servicePackage.toLowerCase().includes(s) ||
      (r.assignedTechnicianName && r.assignedTechnicianName.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Icon name="history_edu" size={22} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Service Records Ledger</h2>
        </div>

        <div className="relative w-full sm:w-72">
          <Icon name="search" size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search Record, Customer, Plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs bg-zinc-950/80 rounded-xl"
          />
        </div>
      </div>

      {/* Records Table */}
      <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Icon name="description" size={16} className="text-blue-400" /> Service Orders Ledger
          </h3>
          <span className="text-xs text-zinc-400 font-mono">{filtered.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-sans font-semibold">
                <th className="py-3 px-3">Record #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Service Package</th>
                <th className="py-3 px-3">Technician</th>
                <th className="py-3 px-3 text-right">Parts (₹)</th>
                <th className="py-3 px-3 text-right">Labour (₹)</th>
                <th className="py-3 px-3 text-right">Total (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filtered.map((r) => {
                const parts = r.partsCost || 1200;
                const labour = r.labourCost || 300;
                const total = r.totalCost || (parts + labour);

                return (
                  <tr key={r.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-blue-400">
                        {r.recordNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white">{r.customerName || 'Customer'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-white font-bold">{r.vehiclePlate}</div>
                      <div className="text-[10px] text-zinc-400 font-sans">{r.vehicleModel}</div>
                    </td>
                    <td className="py-3 px-3 font-sans text-zinc-300">
                      {r.servicePackage}
                    </td>
                    <td className="py-3 px-3 font-sans text-amber-400 font-medium">
                      {r.assignedTechnicianName || 'Ravi Kumar'}
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-300">₹{parts?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right text-zinc-300">₹{labour?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      ₹{total?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <Badge variant={r.serviceStatus === 'COMPLETED' ? 'success' : 'warning'} className="text-[10px]">
                        {r.serviceStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecord(r)}
                        className="h-7 text-xs rounded-lg"
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Inspect Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-xl w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                Service Record: {selectedRecord.recordNumber} ({selectedRecord.vehiclePlate})
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer:</span>
                  <span className="text-white font-bold">{selectedRecord.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Vehicle / VIN:</span>
                  <span className="text-white">{selectedRecord.vehiclePlate} ({selectedRecord.vehicleModel})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Technician:</span>
                  <span className="text-amber-400 font-bold">{selectedRecord.assignedTechnicianName || 'Ravi Kumar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Bay:</span>
                  <span className="text-blue-400 font-bold">{selectedRecord.bayNumber}</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block font-semibold mb-1">Diagnosed Problem:</label>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono">
                  {selectedRecord.problemDescription || 'Engine oil replacement and filtration check.'}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block font-semibold mb-1">Work Performed:</label>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono">
                  {selectedRecord.workPerformed || selectedRecord.technicianNotes || 'Parts installed and tested.'}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-center">
                <div>
                  <span className="text-zinc-500 block uppercase font-sans text-[10px]">Parts Cost</span>
                  <span className="text-white font-bold">₹{selectedRecord.partsCost?.toLocaleString('en-IN') || 1200}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase font-sans text-[10px]">Labour</span>
                  <span className="text-white font-bold">₹{selectedRecord.labourCost?.toLocaleString('en-IN') || 300}</span>
                </div>
                <div>
                  <span className="text-emerald-400 block uppercase font-sans text-[10px] font-bold">Total Cost</span>
                  <span className="text-emerald-400 font-extrabold text-sm">₹{selectedRecord.totalCost?.toLocaleString('en-IN') || 1500}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <Button size="sm" onClick={() => setSelectedRecord(null)} className="rounded-xl px-5">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
