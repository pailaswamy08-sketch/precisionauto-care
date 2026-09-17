import React from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

export default function DashboardTab({ stats, bays, bookings, records, invoices, onNavigate }) {
  const activeBays = bays.filter(b => b.isOperational).length;
  const inServiceBookings = bookings.filter(b => b.status === 'IN_SERVICE' || b.status === 'CONFIRMED').length;
  const totalRevenue = invoices.filter(i => i.paymentStatus === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#271638]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Garage Operations &amp; Fleet Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            PrecisionAuto Care digital platform &bull; Bay scheduling, vehicle diagnostics, and dynamic billing.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onNavigate('booking')}
            className="gap-2"
          >
            <Icon name="calendar_month" size={16} /> Book Service Bay
          </Button>
          <Button
            variant="outline"
            onClick={() => onNavigate('technician')}
            className="gap-2"
          >
            <Icon name="build" size={16} /> Open Workbench
          </Button>
        </div>
      </div>

      {/* 2-Column Spacious Overview Grid (NO 3/4 Horizontal Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metric Card 1 */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Bay Occupancy &amp; Concurrency</span>
            <div className="w-8 h-8 rounded-lg bg-[#271638] flex items-center justify-center">
              <Icon name="verified_user" size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">{activeBays} / {bays.length}</span>
            <span className="text-xs text-zinc-400 font-mono">Bays Operational</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-[#231333]">
            Active reservation guard preventing overlapping double-bookings across all service bays.
          </p>
        </Card>

        {/* Metric Card 2 */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Dynamic Invoicing &amp; Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#271638] flex items-center justify-center">
              <Icon name="receipt_long" size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</span>
            <span className="text-xs text-zinc-400 font-mono">{invoices.length} Invoices Generated</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-[#231333]">
            Dynamic labor and itemized parts settlement emitted downstream upon service completion.
          </p>
        </Card>

      </div>

      {/* Service Bays 2-Column Spacious Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Service Bays Status</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate('booking')}
            className="text-xs text-zinc-400 hover:text-white gap-1"
          >
            <span>View All Slots</span>
            <Icon name="arrow_forward" size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bays.map((bay) => {
            const activeBooking = bookings.find(b => b.bayId === bay.id && b.status === 'IN_SERVICE');
            const scheduledBooking = bookings.find(b => b.bayId === bay.id && b.status === 'CONFIRMED');
            const currentJob = activeBooking || scheduledBooking;

            return (
              <Card key={bay.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-1 bg-[#221332] text-white font-mono text-xs rounded border border-[#321c47]">
                      {bay.bayNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{bay.bayName}</h3>
                      <div className="text-xs text-zinc-400 font-mono">${bay.hourlyRate}/hr &bull; {bay.bayType}</div>
                    </div>
                  </div>

                  <Badge variant={!bay.isOperational ? "destructive" : activeBooking ? "warning" : "success"}>
                    {!bay.isOperational ? 'Maintenance' : activeBooking ? 'In Service' : 'Available'}
                  </Badge>
                </div>

                <div className="pt-3 border-t border-[#231333] text-xs text-zinc-300">
                  {currentJob ? (
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-white font-bold">{currentJob.vehiclePlate}</span>
                        <span className="text-zinc-400">{currentJob.timeSlot}</span>
                      </div>
                      <div className="text-zinc-400">{currentJob.servicePackage}</div>
                    </div>
                  ) : (
                    <div className="text-zinc-500 italic">No vehicle staged in bay</div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('booking')}
                  className="w-full"
                >
                  Schedule Bay
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Fleet Activity Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#231333]">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Icon name="history" size={18} /> Recent Service Records
          </h2>
          <span className="text-xs text-zinc-400 font-mono">{records.length} Total Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#271638] text-zinc-400 font-medium">
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Service</th>
                <th className="py-2.5 px-3">Bay</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e102e] text-zinc-200">
              {records.slice(0, 5).map((rec) => (
                <tr key={rec.id} className="hover:bg-[#1a0e28] transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-white">
                    {rec.vehiclePlate} <span className="text-zinc-400 font-sans">({rec.vehicleModel})</span>
                  </td>
                  <td className="py-3 px-3 text-zinc-300">{rec.servicePackage}</td>
                  <td className="py-3 px-3 font-mono text-zinc-400">{rec.bayNumber}</td>
                  <td className="py-3 px-3">
                    <Badge variant={rec.serviceStatus === 'COMPLETED' || rec.serviceStatus === 'INVOICED' ? 'success' : 'default'}>
                      {rec.serviceStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-zinc-300">
                    {rec.invoiceNumber || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
