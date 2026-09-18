import React, { useState } from 'react';
import { api } from '../../services/api';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function ManageBookingsTab({
  bookings = [],
  bays = [],
  technicians = [],
  onBookingUpdated,
  onBookingCancelled
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'assign' | 'reschedule' | 'status'

  // Modal State
  const [assignedBayId, setAssignedBayId] = useState(1);
  const [assignedTechId, setAssignedTechId] = useState(technicians[0]?.id || 2);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('10:00 AM');
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [saving, setSaving] = useState(false);

  const filtered = bookings.filter(b => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      b.bookingReference.toLowerCase().includes(s) ||
      b.customerName.toLowerCase().includes(s) ||
      b.vehiclePlate.toLowerCase().includes(s) ||
      b.servicePackage.toLowerCase().includes(s);

    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenAssign = (b) => {
    setSelectedBooking(b);
    setAssignedBayId(b.bayId || 1);
    setAssignedTechId(technicians[0]?.id || 2);
    setActiveModal('assign');
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSaving(true);

    const tech = technicians.find(t => t.id === Number(assignedTechId)) || { id: 2, fullName: "Ravi Kumar" };
    try {
      await api.assignBayAndTech(selectedBooking.id, Number(assignedBayId), tech.id, tech.fullName);
      const updated = {
        ...selectedBooking,
        bayId: Number(assignedBayId),
        assignedTechnicianName: tech.fullName,
        status: 'CONFIRMED'
      };
      if (onBookingUpdated) onBookingUpdated(updated);
      setActiveModal(null);
    } catch (err) {
      alert("Failed to assign: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (bookingId, st) => {
    try {
      await api.updateBookingStatus(bookingId, st);
      if (onBookingUpdated) {
        const b = bookings.find(item => item.id === bookingId);
        if (b) onBookingUpdated({ ...b, status: st });
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleCancel = async (b) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${b.bookingReference}?`)) return;
    try {
      await api.cancelBooking(b.id);
      if (onBookingCancelled) onBookingCancelled(b.id);
    } catch (err) {
      alert("Failed to cancel: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Icon name="event_available" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Manage Bookings ⭐</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Full garage booking controller &bull; Assign bays &amp; technicians, reschedule appointments, and handle cancellations.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Icon name="search" size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search Reference, Customer, Plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs bg-zinc-950/80 rounded-xl"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              filterStatus === st
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold shadow-sm'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            {st} ({st === 'ALL' ? bookings.length : bookings.filter(b => b.status === st).length})
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Icon name="calendar_month" size={16} className="text-purple-400" /> Bookings Master Schedule
          </h3>
          <span className="text-xs text-zinc-400 font-mono">{filtered.length} Bookings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-sans font-semibold">
                <th className="py-3 px-3">Booking ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Service Package</th>
                <th className="py-3 px-3">Schedule</th>
                <th className="py-3 px-3">Bay Assigned</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">
                    <span className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-purple-400">
                      {b.bookingReference || `BK${b.id}`}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-bold text-white">{b.customerName}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{b.customerPhone || b.customerEmail}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-white font-bold">{b.vehiclePlate}</div>
                    <div className="text-[10px] text-zinc-400 font-sans">{b.vehicleModel}</div>
                  </td>
                  <td className="py-3 px-3 font-sans font-medium text-zinc-300">
                    {b.servicePackage}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-white">{b.bookingDate}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">{b.timeSlot}</div>
                  </td>
                  <td className="py-3 px-3 text-blue-400 font-bold">
                    Bay #{b.bayId}
                  </td>
                  <td className="py-3 px-3 text-center font-sans">
                    <Badge
                      variant={
                        b.status === 'COMPLETED' ? 'success' :
                        b.status === 'CANCELLED' ? 'destructive' :
                        b.status === 'IN_PROGRESS' ? 'warning' : 'default'
                      }
                      className="text-[10px]"
                    >
                      {b.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAssign(b)}
                        className="h-7 text-xs rounded-lg gap-1"
                      >
                        <Icon name="person" size={13} /> Assign
                      </Button>

                      {b.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(b)}
                          className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg"
                        >
                          Cancel
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

      {/* Assign Bay & Technician Modal */}
      {activeModal === 'assign' && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                Dispatch Booking: {selectedBooking.bookingReference}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono space-y-1">
                <div className="text-white font-bold">{selectedBooking.customerName} &bull; {selectedBooking.vehiclePlate}</div>
                <div className="text-zinc-400">{selectedBooking.servicePackage} ({selectedBooking.bookingDate} @ {selectedBooking.timeSlot})</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Assign Service Bay</label>
                <select
                  value={assignedBayId}
                  onChange={(e) => setAssignedBayId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none font-semibold"
                >
                  {bays.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bayNumber} &bull; {b.bayName} ({b.isOperational ? 'Available' : 'Maintenance'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Assign Technician</label>
                <select
                  value={assignedTechId}
                  onChange={(e) => setAssignedTechId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none font-semibold"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} &bull; {t.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                  className="h-9 px-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-5 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl text-white"
                >
                  {saving ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
