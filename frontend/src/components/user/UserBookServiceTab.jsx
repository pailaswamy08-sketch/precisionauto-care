import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CalendarPicker from '../ui/CalendarPicker';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function UserBookServiceTab({ 
  vehicles = [], 
  servicesCatalog = [], 
  currentUser, 
  preselectedVehicle,
  onBookingSuccess,
  onNavigateToVehicles
}) {
  // Wizard Step State: 1 = Bay & Slot Matrix (First Preference), 2 = Vehicle Selector, 3 = Service Package & Confirm
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Slot & Bay Selection
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [selectedBay, setSelectedBay] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Step 2: Vehicle Selection
  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    return preselectedVehicle?.id || vehicles[0]?.id || '';
  });
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('ALL');
  const [vehicleModelFilter, setVehicleModelFilter] = useState('ALL');
  const [modelSearch, setModelSearch] = useState('');

  // Step 3: Service Package Selection & Notes
  const [selectedServiceName, setSelectedServiceName] = useState('Oil Change');
  const [notes, setNotes] = useState('');

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sync preselected vehicle
  useEffect(() => {
    if (preselectedVehicle) {
      setSelectedVehicleId(preselectedVehicle.id);
    } else if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [preselectedVehicle, vehicles, selectedVehicleId]);

  // Fetch Bay Availability Matrix
  const fetchAvailability = async (date) => {
    setLoadingAvail(true);
    try {
      const data = await api.getBayAvailability(date);
      setAvailability(data || []);
      // Default to first available bay if none selected
      if (!selectedBay && data && data.length > 0) {
        const firstActive = data.find(b => b.isOperational) || data[0];
        setSelectedBay(firstActive);
      }
    } catch (err) {
      console.warn("Failed to fetch availability:", err);
    } finally {
      setLoadingAvail(false);
    }
  };

  useEffect(() => {
    if (bookingDate) {
      fetchAvailability(bookingDate);
    }
  }, [bookingDate]);

  // Vehicle helpers
  const uniqueVehicleModels = Array.from(
    new Set(vehicles.map((v) => `${v.make} ${v.model}`.trim()).filter(Boolean))
  );

  const getVehicleTypeIcon = (type = 'Car') => {
    const t = String(type).toLowerCase();
    if (t.includes('bike') || t.includes('motorcycle') || t.includes('two')) return 'two_wheeler';
    if (t.includes('scooter') || t.includes('moped') || t.includes('activa')) return 'moped';
    if (t.includes('truck') || t.includes('van') || t.includes('fleet') || t.includes('commercial')) return 'airport_shuttle';
    if (t.includes('ev') || t.includes('electric')) return 'electric_car';
    return 'directions_car';
  };

  const getVehicleTypeBadgeColor = (type = 'Car') => {
    const t = String(type).toLowerCase();
    if (t.includes('bike') || t.includes('two') || t.includes('motorcycle')) return 'bg-amber-950/60 text-amber-400 border-amber-800/40';
    if (t.includes('scooter') || t.includes('moped')) return 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40';
    if (t.includes('truck') || t.includes('fleet')) return 'bg-purple-950/60 text-purple-400 border-purple-800/40';
    return 'bg-blue-950/60 text-blue-400 border-blue-800/40';
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const q = vehicleSearch.trim().toLowerCase();
    const modelQ = modelSearch.trim().toLowerCase();
    const vType = (v.vehicleType || 'Car').toLowerCase();
    const make = (v.make || '').toLowerCase();
    const model = (v.model || '').toLowerCase();
    const fullModel = `${v.make} ${v.model}`.trim();
    const plate = (v.plateNumber || '').toLowerCase();
    const vin = (v.vin || '').toLowerCase();
    const notesStr = (v.notes || '').toLowerCase();

    if (vehicleTypeFilter !== 'ALL') {
      const filterLower = vehicleTypeFilter.toLowerCase();
      if (filterLower === 'bike' && !vType.includes('bike') && !vType.includes('motorcycle') && !vType.includes('two')) return false;
      if (filterLower === 'scooter' && !vType.includes('scooter') && !vType.includes('moped')) return false;
      if (filterLower === 'car' && (vType.includes('bike') || vType.includes('motorcycle') || vType.includes('scooter') || vType.includes('truck'))) return false;
      if (filterLower === 'fleet' && !vType.includes('truck') && !vType.includes('fleet') && !vType.includes('van')) return false;
    }

    if (vehicleModelFilter !== 'ALL') {
      if (fullModel.toLowerCase() !== vehicleModelFilter.toLowerCase()) return false;
    }

    if (modelQ) {
      if (!model.includes(modelQ) && !make.includes(modelQ) && !fullModel.toLowerCase().includes(modelQ)) {
        return false;
      }
    }

    if (!q) return true;
    return (
      vType.includes(q) ||
      make.includes(q) ||
      model.includes(q) ||
      plate.includes(q) ||
      vin.includes(q) ||
      notesStr.includes(q) ||
      fullModel.toLowerCase().includes(q)
    );
  });

  const currentVehicle = vehicles.find(v => v.id === Number(selectedVehicleId)) || preselectedVehicle || vehicles[0] || null;

  const currentService = servicesCatalog.find(s => s.serviceName === selectedServiceName) || {
    serviceName: 'Oil Change',
    basePrice: 1200.0,
    estimatedDurationMinutes: 45,
    description: 'Full synthetic engine oil replacement and filter change',
    category: 'Maintenance'
  };

  const timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

  const handleSlotClick = (slotStr, isAvailable, bay) => {
    if (!isAvailable) {
      setErrorMsg(`Slot ${slotStr} on ${bay.bayName || bay.bayNumber} is currently occupied. Please pick an open green slot.`);
      return;
    }
    setSelectedSlot(slotStr);
    setSelectedBay(bay);
    setErrorMsg(null);
  };

  const handleBookService = async (e) => {
    if (e) e.preventDefault();
    if (!currentVehicle) {
      setErrorMsg("Please add or select a vehicle from your profile before confirming the booking.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const bayName = selectedBay?.bayName || selectedBay?.bayNumber || 'Bay-01 Diagnostic Station';

    const payload = {
      customerId: currentUser?.userId || currentUser?.id,
      customerName: currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Customer',
      customerEmail: currentUser?.email || '',
      customerPhone: currentUser?.phone || '',
      vehiclePlate: currentVehicle.plateNumber,
      vehicleModel: `${currentVehicle.make} ${currentVehicle.model}`,
      vehicleVin: currentVehicle.vin || `VIN-${currentVehicle.plateNumber}`,
      servicePackage: currentService.serviceName,
      bookingDate: bookingDate,
      timeSlot: selectedSlot,
      bayName: bayName,
      notes: notes.trim()
    };

    try {
      const booking = await api.createBooking(payload);
      setSuccessMsg(`Booking ${booking.bookingReference || 'CONFIRMED'} reserved for ${booking.vehiclePlate} on ${booking.bookingDate} at ${booking.timeSlot}!`);
      setTimeout(() => {
        if (onBookingSuccess) onBookingSuccess(booking);
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || "Failed to confirm booking. Collision detected.");
    } finally {
      setSubmitting(false);
    }
  };

  const quickDates = [
    { label: 'Today', days: 0 },
    { label: 'Tomorrow', days: 1 },
    { label: '+2 Days', days: 2 },
    { label: '+3 Days', days: 3 },
  ];

  const setRelativeDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setBookingDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Interactive 3-Step Wizard Navigation Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Icon name="calendar_month" size={20} />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Service Appointment Booking
            </h2>
          </div>

          {/* Current Step Badge */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300">
              Step {currentStep} of 3
            </span>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all ${
              currentStep === 1
                ? 'bg-blue-600/10 border-blue-500/80 text-white ring-1 ring-blue-500/30 shadow-md'
                : currentStep > 1
                ? 'bg-zinc-950 border-emerald-900/50 text-emerald-400 hover:bg-zinc-900'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 1
                ? 'bg-blue-600 text-white'
                : currentStep > 1
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {currentStep > 1 ? <Icon name="check" size={14} /> : '1'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-none truncate">1. Bay &amp; Time Slot</div>
              <div className="text-[10px] text-zinc-400 truncate mt-0.5 font-mono">
                {selectedSlot} &bull; {selectedBay?.bayNumber || 'Bay 01'}
              </div>
            </div>
          </button>

          {/* Step 2 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all ${
              currentStep === 2
                ? 'bg-blue-600/10 border-blue-500/80 text-white ring-1 ring-blue-500/30 shadow-md'
                : currentStep > 2
                ? 'bg-zinc-950 border-emerald-900/50 text-emerald-400 hover:bg-zinc-900'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 2
                ? 'bg-blue-600 text-white'
                : currentStep > 2
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {currentStep > 2 ? <Icon name="check" size={14} /> : '2'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-none truncate">2. Select Vehicle</div>
              <div className="text-[10px] text-zinc-400 truncate mt-0.5 font-mono">
                {currentVehicle ? `${currentVehicle.make} ${currentVehicle.model}` : 'Choose Vehicle'}
              </div>
            </div>
          </button>

          {/* Step 3 Pill */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all ${
              currentStep === 3
                ? 'bg-blue-600/10 border-blue-500/80 text-white ring-1 ring-blue-500/30 shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}>
              3
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-none truncate">3. Package &amp; Book</div>
              <div className="text-[10px] text-zinc-400 truncate mt-0.5 font-mono">
                {currentService.serviceName}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Error & Success Notification Banners */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-3 animate-fadeIn">
          <Icon name="error" size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Collision or Booking Notice</div>
            <div className="opacity-90">{errorMsg}</div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-3 animate-fadeIn">
          <Icon name="check_circle" size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Reservation Confirmed!</div>
            <div className="opacity-90">{successMsg}</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: BAY AVAILABILITY MATRIX & TIME SLOT SELECTION (FIRST PREFERENCE)   */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Step 1 Date Selector & Fast Pills */}
          <Card className="p-6 bg-zinc-900 border-zinc-800 rounded-3xl shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-blue-400 uppercase font-mono tracking-wider">
                  Step 1 &bull; Appointment Schedule
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon name="event_available" size={20} className="text-emerald-400" />
                  Select Date &amp; Service Bay Slot
                </h3>
              </div>

              {/* Date Selector Trigger & Quick Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {quickDates.map((qd) => (
                  <button
                    key={qd.label}
                    type="button"
                    onClick={() => setRelativeDate(qd.days)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-medium transition-colors"
                  >
                    {qd.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowCalendarModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-900/30 transition-all cursor-pointer"
                >
                  <Icon name="calendar_month" size={15} />
                  <span>
                    {new Date(bookingDate + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <Icon name="edit" size={13} />
                </button>
              </div>
            </div>

            {/* Matrix Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                  <span>Available (Open)</span>
                </span>
                <span className="flex items-center gap-1.5 text-red-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span>Occupied (Collision Guard)</span>
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-zinc-600"></span>
                  <span>Maintenance</span>
                </span>
              </div>

              <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                <Icon name="schedule" size={13} className="text-blue-400" />
                <span>Selected: <strong className="text-emerald-400">{selectedSlot}</strong> in <strong className="text-white">{selectedBay?.bayName || 'Bay 01'}</strong></span>
              </div>
            </div>

            {/* Bay Availability Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availability.map((bay) => {
                const isBayChosen = selectedBay?.bayId === bay.bayId;
                return (
                  <div
                    key={bay.bayId}
                    className={`p-5 rounded-2xl border space-y-3.5 transition-all ${
                      !bay.isOperational
                        ? 'bg-zinc-950/40 border-zinc-800/50 opacity-50'
                        : isBayChosen
                        ? 'bg-zinc-950 border-blue-500/60 ring-1 ring-blue-500/30 shadow-lg'
                        : 'bg-zinc-950 border-zinc-800/90 hover:border-zinc-700'
                    }`}
                  >
                    {/* Bay Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {bay.bayNumber}
                          </span>
                          <span className="font-bold text-sm text-white">{bay.bayName}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono">
                          {bay.bayType} &bull; ₹{bay.hourlyRate}/hr
                        </p>
                      </div>

                      <Badge
                        variant={!bay.isOperational ? 'destructive' : 'success'}
                        className="text-[10px] px-2.5 py-0.5"
                      >
                        {!bay.isOperational ? 'Maintenance' : 'Active'}
                      </Badge>
                    </div>

                    {/* Time Slots for this Bay */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {bay.slots?.map((slotObj) => {
                        const isSelected = selectedSlot === slotObj.timeSlot && isBayChosen;
                        const isAvail = slotObj.available && bay.isOperational;

                        return (
                          <button
                            key={slotObj.timeSlot}
                            type="button"
                            disabled={!isAvail}
                            onClick={() => handleSlotClick(slotObj.timeSlot, isAvail, bay)}
                            className={`py-2 px-1.5 rounded-xl text-xs font-mono font-semibold transition-all text-center border cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 font-bold shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400'
                                : isAvail
                                ? 'bg-zinc-900 text-emerald-300 border-zinc-800 hover:bg-zinc-850 hover:border-emerald-500/50'
                                : 'bg-red-950/20 text-red-400/80 border-red-900/30 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="text-[11px]">{slotObj.timeSlot}</div>
                            <div className="text-[9px] uppercase tracking-wider font-bold mt-0.5">
                              {isAvail ? (isSelected ? '✓ SELECTED' : 'OPEN') : 'BUSY'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 1 Action Bar */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-zinc-400 font-mono text-center sm:text-left">
                Selected Schedule: <span className="text-white font-bold">{bookingDate}</span> at <span className="text-emerald-400 font-bold">{selectedSlot}</span> ({selectedBay?.bayName || 'Bay 01'})
              </div>

              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto h-11 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 gap-2 cursor-pointer"
              >
                <span>Continue to Step 2: Select Vehicle</span>
                <Icon name="arrow_forward" size={16} />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SELECT VEHICLE & VEHICLE MODEL SEARCH                             */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Step 1 Breadcrumb Bar */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                ✓
              </span>
              <span className="text-zinc-400">Chosen Schedule:</span>
              <span className="text-white font-bold font-mono">{bookingDate} @ {selectedSlot}</span>
              <span className="text-zinc-500">&bull;</span>
              <span className="text-blue-400 font-medium">{selectedBay?.bayName || 'Bay 01'}</span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline self-start sm:self-auto"
            >
              Change Date / Bay Slot &rarr;
            </button>
          </div>

          <Card className="p-6 bg-zinc-900 border-zinc-800 rounded-3xl shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-blue-400 uppercase font-mono tracking-wider">
                  Step 2 &bull; Vehicle Selection
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon name="directions_car" size={20} className="text-blue-400" />
                  Choose Registered Vehicle
                </h3>
              </div>

              <button
                type="button"
                onClick={onNavigateToVehicles}
                className="text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-colors self-start sm:self-auto"
              >
                <Icon name="add_circle" size={15} />
                <span>Add New Vehicle</span>
              </button>
            </div>

            {/* Vehicle Type Filters & Search Bars */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Search Bar */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                    <span>1. Vehicle Search Filter</span>
                    {vehicleSearch && <span className="text-blue-400 text-[10px]">Active Filter</span>}
                  </label>
                  <div className="relative">
                    <Icon
                      name="search"
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                    />
                    <Input
                      type="text"
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      placeholder="Type make, model, license plate..."
                      className="h-10 pl-9 rounded-xl bg-zinc-950 border-zinc-800 text-xs text-white"
                    />
                    {vehicleSearch && (
                      <button
                        type="button"
                        onClick={() => setVehicleSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Model Selector Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                    <span>2. Specific Model Selector</span>
                    {vehicleModelFilter !== 'ALL' && <span className="text-emerald-400 text-[10px]">Model Filtered</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={vehicleModelFilter}
                      onChange={(e) => {
                        const sel = e.target.value;
                        setVehicleModelFilter(sel);
                        if (sel !== 'ALL') {
                          const matching = vehicles.find(v => `${v.make} ${v.model}`.trim().toLowerCase() === sel.toLowerCase());
                          if (matching) setSelectedVehicleId(matching.id);
                        }
                      }}
                      className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-xl px-3 text-xs text-zinc-100 font-medium focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-8"
                    >
                      <option value="ALL">-- All Models ({uniqueVehicleModels.length}) --</option>
                      {uniqueVehicleModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <Icon
                      name="expand_more"
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Type Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-zinc-500 font-medium mr-1">Quick Type:</span>
                {[
                  { id: 'ALL', label: 'All Vehicles', icon: 'apps' },
                  { id: 'Car', label: 'Cars', icon: 'directions_car' },
                  { id: 'Bike', label: 'Bikes / 2-Wheelers', icon: 'two_wheeler' },
                  { id: 'Scooter', label: 'Scooters', icon: 'moped' },
                  { id: 'Fleet', label: 'Commercial Fleet', icon: 'airport_shuttle' }
                ].map((tab) => {
                  const isSelected = vehicleTypeFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setVehicleTypeFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md shadow-blue-900/30'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200'
                      }`}
                    >
                      <Icon name={tab.icon} size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Cards Grid */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Select Vehicle ({filteredVehicles.length} available)
              </label>

              {filteredVehicles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredVehicles.map((v) => {
                    const isSelected = Number(selectedVehicleId) === Number(v.id);
                    const typeIcon = getVehicleTypeIcon(v.vehicleType || 'Car');
                    const badgeColor = getVehicleTypeBadgeColor(v.vehicleType || 'Car');

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 text-white shadow-xl ring-2 ring-blue-500/40'
                            : 'bg-zinc-950 border-zinc-800/90 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-zinc-900 text-zinc-400'}`}>
                              <Icon name={typeIcon} size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white leading-tight">
                                {v.make} {v.model}
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                Year {v.year || '2023'} &bull; {v.vin ? v.vin.slice(0, 10) + '...' : 'VIN Verified'}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${badgeColor}`}>
                            {v.vehicleType || 'Car'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                          <span className="font-mono font-bold text-blue-400 tracking-wider">
                            [{v.plateNumber}]
                          </span>
                          {isSelected ? (
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                              <Icon name="check_circle" size={14} /> Selected
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-500">
                              Click to pick
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                  <Icon name="directions_car" size={32} className="text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    No vehicles found matching current search. Please add your vehicle or clear filters.
                  </p>
                  <Button
                    type="button"
                    onClick={onNavigateToVehicles}
                    className="rounded-xl px-5 h-9 bg-blue-600 hover:bg-blue-500 text-xs text-white"
                  >
                    Add Vehicle to Profile
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2 Action Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto h-11 px-6 rounded-2xl border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold gap-1.5"
              >
                <Icon name="arrow_back" size={16} />
                <span>Back to Slot Selection</span>
              </Button>

              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto h-11 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 gap-2 cursor-pointer"
              >
                <span>Continue to Step 3: Service Package</span>
                <Icon name="arrow_forward" size={16} />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: SELECT SERVICE PACKAGE & BOOK SERVICE NOW                         */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Steps 1 & 2 Summary Header Card */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                ✓
              </span>
              <div>
                <span className="text-zinc-500 font-mono text-[10px] block">APPOINTMENT SCHEDULE:</span>
                <span className="text-white font-bold font-mono">{bookingDate} @ {selectedSlot}</span>
                <span className="text-zinc-400 text-[11px] ml-1.5">({selectedBay?.bayName || 'Bay 01'})</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:border-l sm:border-zinc-800 sm:pl-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                currentVehicle ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {currentVehicle ? '✓' : '!'}
              </span>
              <div>
                <span className="text-zinc-500 font-mono text-[10px] block">CHOSEN VEHICLE:</span>
                {currentVehicle ? (
                  <div>
                    <span className="text-white font-bold">{currentVehicle.make} {currentVehicle.model}</span>
                    <span className="text-blue-400 font-mono text-[11px] ml-1.5">[{currentVehicle.plateNumber}]</span>
                  </div>
                ) : (
                  <span className="text-amber-400 font-semibold">No vehicle selected (Click Back to select)</span>
                )}
              </div>
            </div>
          </div>

          <Card className="p-6 bg-zinc-900 border-zinc-800 rounded-3xl shadow-xl space-y-6">
            <div className="space-y-0.5 pb-4 border-b border-zinc-800">
              <span className="text-xs font-bold text-blue-400 uppercase font-mono tracking-wider">
                Step 3 &bull; Confirmation
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Icon name="build" size={20} className="text-amber-400" />
                Select Service Package &amp; Confirm
              </h3>
            </div>

            {/* Service Packages Grid */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">
                Available Service Packages
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {servicesCatalog.map((s) => {
                  const isSelected = selectedServiceName === s.serviceName;
                  return (
                    <div
                      key={s.id || s.serviceName}
                      onClick={() => setSelectedServiceName(s.serviceName)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-xl ring-2 ring-emerald-500/40'
                          : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{s.serviceName}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            ₹{s.basePrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {s.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Icon name="schedule" size={13} className="text-amber-400" />
                          <span>{s.estimatedDurationMinutes} mins</span>
                        </span>
                        {isSelected ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Icon name="check_circle" size={13} /> Selected
                          </span>
                        ) : (
                          <span className="text-zinc-500">Select</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Special Instructions / Symptom Notes (Optional)</span>
                <span className="text-[10px] text-zinc-500 font-normal">Passed to technician repair log</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Unusual brake squeak at low speeds, check engine oil filter, replace wiper blades..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Detailed Cost & Reservation Summary Breakdown */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-bold text-zinc-300 uppercase tracking-wider text-[11px]">
                  Final Reservation Summary
                </span>
                <span className="text-emerald-400 font-bold text-[10px]">
                  Collision Check Passed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Vehicle:</span>
                  <span className="text-white font-bold">
                    {currentVehicle ? `${currentVehicle.make} ${currentVehicle.model} (${currentVehicle.plateNumber})` : 'None Selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Service Bay:</span>
                  <span className="text-white font-bold">{selectedBay?.bayName || 'Bay 01'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date &amp; Slot:</span>
                  <span className="text-white font-bold">{bookingDate} @ {selectedSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Est. Duration:</span>
                  <span className="text-white font-bold">{currentService.estimatedDurationMinutes} Minutes</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-sm">
                <div>
                  <span className="text-zinc-400 text-xs">Package Base Amount:</span>
                  <div className="text-[10px] text-zinc-500 font-sans">+ 18% GST generated on service completion</div>
                </div>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  ₹{currentService.basePrice?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Step 3 Action Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-auto h-11 px-6 rounded-2xl border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold gap-1.5"
              >
                <Icon name="arrow_back" size={16} />
                <span>Back to Vehicle Selection</span>
              </Button>

              <Button
                type="button"
                disabled={submitting}
                onClick={handleBookService}
                className="w-full sm:w-auto h-12 px-10 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-900/40 gap-2 cursor-pointer transition-all"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Reserving Bay Slot...</span>
                  </span>
                ) : (
                  <>
                    <Icon name="check_circle" size={18} />
                    <span>BOOK SERVICE NOW</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Calendar Modal Trigger Popup */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full p-6 space-y-4 bg-zinc-900 border-zinc-800 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Icon name="calendar_month" size={20} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">Select Service Date</h3>
              </div>
              <button 
                onClick={() => setShowCalendarModal(false)} 
                className="text-zinc-400 hover:text-white p-1 rounded-xl"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <CalendarPicker
              selectedDate={bookingDate}
              onSelectDate={(newDate) => {
                setBookingDate(newDate);
                setShowCalendarModal(false);
              }}
            />

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Button size="sm" onClick={() => setShowCalendarModal(false)} className="rounded-xl px-5">
                Confirm Date
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
