import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function ManageServiceBaysTab({ bays = [], bookings = [], onBayAdded, onBayUpdated }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingBay, setSavingBay] = useState(false);

  // Form State
  const [bayNumber, setBayNumber] = useState('');
  const [bayName, setBayName] = useState('');
  const [bayType, setBayType] = useState('GENERAL_SERVICE');
  const [hourlyRate, setHourlyRate] = useState(500);

  const fetchAvailability = async (date) => {
    setLoadingAvail(true);
    try {
      const data = await api.getBayAvailability(date);
      setAvailability(data);
    } catch (err) {
      console.warn("Fetch availability error:", err);
    } finally {
      setLoadingAvail(false);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate]);

  const handleToggleOperational = async (bayId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await api.updateBayStatus(bayId, newStatus);
      if (onBayUpdated) onBayUpdated(bayId, newStatus);
      fetchAvailability(selectedDate);
    } catch (err) {
      alert("Failed to update bay status: " + err.message);
    }
  };

  const handleAddBay = async (e) => {
    e.preventDefault();
    if (!bayNumber.trim() || !bayName.trim()) return;

    setSavingBay(true);
    try {
      const created = await api.addBay({
        bayNumber: bayNumber.trim(),
        bayName: bayName.trim(),
        bayType,
        hourlyRate: Number(hourlyRate),
        isOperational: true
      });
      if (onBayAdded) onBayAdded(created);
      setShowAddModal(false);
      setBayNumber('');
      setBayName('');
      fetchAvailability(selectedDate);
    } catch (err) {
      alert("Failed to add bay: " + err.message);
    } finally {
      setSavingBay(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Icon name="garage" size={22} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Service Bay Operations</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-800">
            <Icon name="event" size={15} className="text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 px-4 rounded-xl"
          >
            <Icon name="add" size={15} /> Add Bay
          </Button>
        </div>
      </div>

      {/* Service Bays Operational Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {bays.map((b) => {
          const activeBookingsForBay = bookings.filter(bk => bk.bayId === b.id && (bk.status === 'CONFIRMED' || bk.status === 'IN_PROGRESS'));
          return (
            <Card
              key={b.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 shadow-md ${
                !b.isOperational
                  ? 'bg-zinc-950/60 border-zinc-800/60 opacity-70'
                  : 'bg-zinc-900/80 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-white text-sm bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800">
                  {b.bayNumber}
                </span>
                <Badge variant={!b.isOperational ? 'destructive' : 'success'} className="text-[10px]">
                  {!b.isOperational ? 'Maintenance' : 'Operational'}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{b.bayName}</h3>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  ₹{b.hourlyRate}/hr &bull; {b.bayType}
                </div>
              </div>

              {/* Status toggle & schedule */}
              <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-mono">Active Jobs: {activeBookingsForBay.length}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleOperational(b.id, b.isOperational)}
                    className={`text-[11px] font-semibold underline ${
                      b.isOperational ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    {b.isOperational ? 'Set Maintenance' : 'Set Available'}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Real-time Schedule Ledger for Selected Date */}
      <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Icon name="calendar_view_week" size={16} className="text-emerald-400" /> Bay Slot Schedule Matrix ({selectedDate})
          </h3>
          <button
            onClick={() => fetchAvailability(selectedDate)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <Icon name="refresh" size={15} className={loadingAvail ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold font-sans">
                <th className="py-3 px-3">Service Bay</th>
                <th className="py-3 px-2 text-center">09:00 AM</th>
                <th className="py-3 px-2 text-center">10:00 AM</th>
                <th className="py-3 px-2 text-center">11:30 AM</th>
                <th className="py-3 px-2 text-center">02:00 PM</th>
                <th className="py-3 px-2 text-center">03:30 PM</th>
                <th className="py-3 px-2 text-center">05:00 PM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200 font-mono">
              {availability.map((bay) => (
                <tr key={bay.bayId} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{bay.bayNumber}</div>
                    <div className="text-[10px] text-zinc-400 font-sans">{bay.bayName}</div>
                  </td>
                  {bay.slots?.map((slotObj) => (
                    <td key={slotObj.timeSlot} className="py-2.5 px-2 text-center">
                      <div className={`p-2 rounded-xl text-[10px] font-semibold border ${
                        !bay.isOperational
                          ? 'bg-zinc-950 text-zinc-500 border-zinc-800'
                          : slotObj.available
                          ? 'bg-emerald-950/30 text-emerald-300 border-emerald-900/40'
                          : 'bg-red-950/40 text-red-300 border-red-900/40'
                      }`}>
                        <div>{!bay.isOperational ? 'MAINT' : slotObj.available ? 'OPEN' : 'OCCUPIED'}</div>
                        {!slotObj.available && slotObj.vehiclePlate && (
                          <div className="text-[9px] text-red-400 font-bold truncate mt-0.5">
                            {slotObj.vehiclePlate}
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Bay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Add New Service Bay</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBay} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Bay Identifier *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Bay 5"
                    value={bayNumber}
                    onChange={(e) => setBayNumber(e.target.value)}
                    className="h-9 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Hourly Rate (₹)</label>
                  <Input
                    type="number"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Bay Name / Purpose *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. EV High-Voltage Diagnostic Bay"
                  value={bayName}
                  onChange={(e) => setBayName(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Equipment / Bay Type</label>
                <select
                  value={bayType}
                  onChange={(e) => setBayType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="FAST_LUBE">Express Lube &amp; Quick Service</option>
                  <option value="CHASSIS_LIFT">Heavy Duty Chassis Lift</option>
                  <option value="ELECTRONIC_SCAN">Electronic &amp; AC Diagnostics</option>
                  <option value="TRANSMISSION_BAY">Powertrain &amp; Engine Overhaul</option>
                  <option value="GENERAL_SERVICE">General Service Station</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="h-9 px-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingBay}
                  className="h-9 px-5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white"
                >
                  {savingBay ? 'Saving...' : 'Add Service Bay'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
