import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CalendarPicker from './ui/CalendarPicker';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function BookingTab({ bays, bookings, currentUser, onBookingCreated, onBookingCancelled }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  
  // Selection
  const [selectedBayId, setSelectedBayId] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState('09:00 - 11:00');

  // Form
  const [customerName, setCustomerName] = useState(currentUser?.fullName || 'Alex Mercer');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'alex@fleetcorp.com');
  const [customerPhone, setCustomerPhone] = useState('+1 555-0103');
  const [vehicleVin, setVehicleVin] = useState('1FTFW1E84KFA12091');
  const [vehiclePlate, setVehiclePlate] = useState('FL-882-TR');
  const [vehicleModel, setVehicleModel] = useState('Ford Transit Cargo 250');
  const [servicePackage, setServicePackage] = useState('ECM Sensor Calibration & 10k Tune-up');
  const [notes, setNotes] = useState('');

  // Status message
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const vehiclePresets = [
    { plate: 'FL-882-TR', vin: '1FTFW1E84KFA12091', model: 'Ford Transit Cargo 250', pkg: 'ECM Sensor Calibration & 10k Tune-up' },
    { plate: 'LG-409-XP', vin: '2C4RC1CG5KR239841', model: 'Freightliner M2 Medium Duty', pkg: 'Pneumatic Air Brake Overhaul' },
    { plate: 'SP-104-NV', vin: 'WD3PE8CD8LP190822', model: 'Mercedes Sprinter 2500 Van', pkg: 'Full Chassis Lubrication & Alignment' },
    { plate: 'RM-550-HD', vin: '3C6UR5DL7MG551094', model: 'Ram ProMaster 3500 High-Roof', pkg: 'Heavy Duty Transmission Flush' }
  ];

  const fetchAvailability = async (date) => {
    setLoadingAvail(true);
    try {
      const data = await api.getBayAvailability(date);
      setAvailability(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAvail(false);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate]);

  const handleSelectSlot = (bayId, slot, isAvailable, slotData) => {
    if (!isAvailable) {
      setErrorMessage({
        title: "Bay Collision Conflict",
        detail: `Bay #${bayId} is occupied during ${slot} by [${slotData?.vehiclePlate || 'RESERVED'}]. Please select another slot.`
      });
      return;
    }

    setSelectedBayId(bayId);
    setSelectedSlot(slot);
    setErrorMessage(null);
    setStatusMessage({
      type: 'info',
      text: `Selected Bay #${bayId} for ${slot}. Fill form below to reserve.`
    });
  };

  const handleApplyPreset = (preset) => {
    setVehiclePlate(preset.plate);
    setVehicleVin(preset.vin);
    setVehicleModel(preset.model);
    setServicePackage(preset.pkg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const payload = {
      bayId: Number(selectedBayId),
      customerId: currentUser?.userId || 1,
      customerName,
      customerEmail,
      customerPhone,
      vehicleVin,
      vehiclePlate,
      vehicleModel,
      servicePackage,
      bookingDate: selectedDate,
      timeSlot: selectedSlot,
      notes
    };

    try {
      const result = await api.createBooking(payload);
      setStatusMessage({
        type: 'success',
        text: `Booking ${result.bookingReference} confirmed for ${result.vehiclePlate} on Bay #${selectedBayId} (${selectedSlot}).`
      });
      onBookingCreated(result);
      fetchAvailability(selectedDate);
    } catch (err) {
      setErrorMessage({
        title: "Booking Conflict Error",
        detail: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id, ref) => {
    if (!window.confirm(`Cancel booking ${ref}?`)) return;
    try {
      await api.cancelBooking(id);
      onBookingCancelled(id);
      setStatusMessage({
        type: 'info',
        text: `Booking ${ref} was cancelled.`
      });
      fetchAvailability(selectedDate);
    } catch (err) {
      alert("Failed to cancel booking: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Service Bay Reservation &amp; Schedule
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time slot availability with atomic collision prevention.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-zinc-900 px-3.5 py-2 rounded-md border border-zinc-800">
          <Icon name="calendar_month" size={16} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
          />
          <button
            onClick={() => fetchAvailability(selectedDate)}
            className="p-1 text-zinc-400 hover:text-white inline-flex items-center justify-center rounded"
            title="Refresh availability"
          >
            <Icon name="refresh" size={15} className={loadingAvail ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="bg-red-950/60 border border-red-800/60 rounded-md p-4 text-xs text-red-200 flex items-start gap-3">
          <Icon name="error" size={18} />
          <div>
            <div className="font-semibold">{errorMessage.title}</div>
            <div className="mt-0.5 opacity-90">{errorMessage.detail}</div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4 text-xs text-zinc-100 flex items-center gap-3">
          <Icon name="check_circle" size={18} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Calendar Date Picker Matrix */}
      <CalendarPicker
        selectedDate={selectedDate}
        onSelectDate={(newD) => setSelectedDate(newD)}
      />

      {/* Bay Availability Grid */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Icon name="grid_view" size={16} /> Bay Slot Grid ({selectedDate})
          </h2>
          
          <div className="flex items-center gap-4 text-xs">
            <span className="text-emerald-400 font-medium">&bull; Available</span>
            <span className="text-red-400 font-medium">&bull; Occupied</span>
            <span className="text-zinc-100 font-medium">&bull; Selected</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-medium text-zinc-400">
                <th className="py-2.5 px-3">Bay Station</th>
                <th className="py-2.5 px-2 text-center">09:00 - 11:00</th>
                <th className="py-2.5 px-2 text-center">11:00 - 13:00</th>
                <th className="py-2.5 px-2 text-center">14:00 - 16:00</th>
                <th className="py-2.5 px-2 text-center">16:00 - 18:00</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {availability.map((bay) => (
                <tr key={bay.bayId} className="hover:bg-zinc-850/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white font-mono">{bay.bayNumber} &bull; {bay.bayName}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">₹{bay.hourlyRate}/hr &bull; {bay.bayType}</div>
                  </td>

                  {bay.slots?.map((slotObj) => {
                    const isSelected = selectedBayId === bay.bayId && selectedSlot === slotObj.timeSlot;
                    const isAvailable = slotObj.available;

                    return (
                      <td key={slotObj.timeSlot} className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleSelectSlot(bay.bayId, slotObj.timeSlot, isAvailable, slotObj)}
                          className={`w-full py-2 px-2 rounded-md text-xs font-medium transition-colors border ${
                            isSelected
                              ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold shadow-sm'
                              : isAvailable
                              ? 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800'
                              : 'bg-red-950/40 text-red-300 border-red-900/40 cursor-not-allowed'
                          }`}
                        >
                          <div>{isAvailable ? 'OPEN' : 'LOCKED'}</div>
                          {!isAvailable && (
                            <div className="text-[10px] font-mono text-red-300 truncate mt-0.5">
                              {slotObj.vehiclePlate || 'OCCUPIED'}
                            </div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 2-Column Split: Form on Left, Presets & Confirmed on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Form Card */}
        <Card className="p-6 space-y-4">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">
              Reserve Bay #{selectedBayId} ({selectedSlot})
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Customer Name</label>
              <Input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Email</label>
                <Input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Phone</label>
                <Input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Vehicle License Plate</label>
                <Input
                  type="text"
                  required
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Vehicle Model</label>
                <Input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Vehicle VIN</label>
              <Input
                type="text"
                required
                value={vehicleVin}
                onChange={(e) => setVehicleVin(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-medium">Service Package</label>
              <select
                value={servicePackage}
                onChange={(e) => setServicePackage(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="ECM Sensor Calibration & 10k Tune-up">ECM Sensor Calibration &amp; 10k Tune-up</option>
                <option value="Pneumatic Air Brake Overhaul">Pneumatic Air Brake Overhaul</option>
                <option value="Full Chassis Lubrication & Alignment">Full Chassis Lubrication &amp; 4-Wheel Alignment</option>
                <option value="Heavy Duty Transmission Flush & Filter">Heavy Duty Transmission Flush &amp; Filter</option>
                <option value="Diagnostic Scan & Electrical Repair">Diagnostic Scan &amp; Electrical System Repair</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 text-xs font-semibold mt-2 rounded-md"
            >
              {submitting ? 'Validating Slot...' : 'Confirm Reservation'}
            </Button>
          </form>
        </Card>

        {/* Right Column: Fleet Presets & Active List */}
        <div className="space-y-6">
          
          {/* Quick Presets */}
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white">Fleet Quick Presets</h3>
            <div className="space-y-2">
              {vehiclePresets.map((vp) => (
                <button
                  key={vp.plate}
                  type="button"
                  onClick={() => handleApplyPreset(vp)}
                  className="w-full text-left p-3 rounded-md bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 transition-colors text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono font-semibold text-white">{vp.plate}</div>
                    <div className="text-[11px] text-zinc-400">{vp.model}</div>
                  </div>
                  <span className="text-[11px] text-zinc-300 font-medium">Autofill &rarr;</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Active Bookings List */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Confirmed Bookings</h3>
              <span className="text-xs text-zinc-400 font-mono">{bookings.length} Total</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {bookings.map((b) => (
                <div key={b.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-md text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{b.vehiclePlate}</span>
                    <span className="text-zinc-400 font-mono text-[11px]">{b.bookingReference}</span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Bay #{b.bayId} &bull; {b.timeSlot} &bull; {b.bookingDate}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant={b.status === 'CANCELLED' ? 'destructive' : 'success'}>
                      {b.status}
                    </Badge>
                    {b.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id, b.bookingReference)}
                        className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
