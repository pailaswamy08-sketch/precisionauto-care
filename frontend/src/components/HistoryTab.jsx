import React, { useState } from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function HistoryTab({ records, onSelectInvoice }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVin, setSelectedVin] = useState('ALL');

  const fleetVins = [
    { plate: 'FL-882-TR', vin: '1FTFW1E84KFA12091', model: 'Ford Transit 250' },
    { plate: 'LG-409-XP', vin: '2C4RC1CG5KR239841', model: 'Freightliner M2' },
  ];

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.vehicleVin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.servicePackage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVin = selectedVin === 'ALL' || r.vehicleVin === selectedVin;

    return matchesSearch && matchesVin;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#271638]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Vehicle Fleet History &amp; Diagnostic Logs
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete maintenance history indexed by VIN and License Plate.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Icon name="search" size={16} className="absolute left-3 top-3 text-zinc-400" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search VIN, Plate, or Record..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Fleet Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={selectedVin === 'ALL' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedVin('ALL')}
          className="text-xs"
        >
          All Fleet Vehicles ({records.length})
        </Button>
        {fleetVins.map(fv => (
          <Button
            key={fv.vin}
            variant={selectedVin === fv.vin ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedVin(fv.vin)}
            className="text-xs font-mono"
          >
            {fv.plate} ({fv.model})
          </Button>
        ))}
      </div>

      {/* History Records Table (Clean, spacious, no nested cards) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#231333]">
          <h2 className="text-sm font-semibold text-white">Maintenance History Ledger</h2>
          <span className="text-xs text-zinc-400 font-mono">{filteredRecords.length} Results</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs">
            No service records match the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#271638] text-zinc-400 font-medium">
                  <th className="py-2.5 px-3">Record #</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">VIN</th>
                  <th className="py-2.5 px-3">Service Package</th>
                  <th className="py-2.5 px-3">DTC / Notes</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e102e] text-zinc-200">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#1a0e28] transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-white">{rec.recordNumber}</td>
                    <td className="py-3 px-3 font-mono">
                      <div className="text-white font-bold">{rec.vehiclePlate}</div>
                      <div className="text-[11px] text-zinc-400 font-sans">{rec.vehicleModel}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-300">{rec.vehicleVin}</td>
                    <td className="py-3 px-3 text-zinc-300">
                      <div>{rec.servicePackage}</div>
                      <div className="text-[11px] text-zinc-400">Bay: {rec.bayNumber} &bull; Tech: {rec.assignedTechnicianName || 'Queue'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-zinc-300">{rec.dtcCodes || 'Clean'}</div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-xs">{rec.technicianNotes || '—'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={
                        rec.serviceStatus === 'COMPLETED' || rec.serviceStatus === 'INVOICED'
                          ? 'success'
                          : rec.serviceStatus === 'IN_PROGRESS'
                          ? 'default'
                          : 'warning'
                      }>
                        {rec.serviceStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {rec.invoiceNumber ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectInvoice(rec.invoiceNumber)}
                          className="h-7 text-xs font-mono"
                        >
                          {rec.invoiceNumber}
                        </Button>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}
