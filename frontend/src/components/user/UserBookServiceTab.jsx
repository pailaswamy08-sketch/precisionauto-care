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
  const [selectedVehicleId, setSelectedVehicleId] = useState(() => {
    return preselectedVehicle?.id || vehicles[0]?.id || '';
  });
  const [selectedServiceName, setSelectedServiceName] = useState('Oil Change');
  
  // Date State with Calendar
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  // Availability & Bays State
  const [availability, setAvailability] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('ALL');
  const [vehicleModelFilter, setVehicleModelFilter] = useState('ALL');
  const [modelSearch, setModelSearch] = useState('');

  useEffect(() => {
    if (preselectedVehicle) {
      setSelectedVehicleId(preselectedVehicle.id);
    } else if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [preselectedVehicle, vehicles, selectedVehicleId]);

  // Extract unique models from user's vehicles list
  const uniqueVehicleModels = Array.from(
    new Set(vehicles.map((v) => `${v.make} ${v.model}`.trim()).filter(Boolean))
  );

  // Helper to normalize vehicle type for filtering & icon lookup
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

  // Filter vehicles by search query, vehicle type filter, and model filter
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

    // 1. Type filter match
    if (vehicleTypeFilter !== 'ALL') {
      const filterLower = vehicleTypeFilter.toLowerCase();
      if (filterLower === 'bike' && !vType.includes('bike') && !vType.includes('motorcycle') && !vType.includes('two')) return false;
      if (filterLower === 'scooter' && !vType.includes('scooter') && !vType.includes('moped')) return false;
      if (filterLower === 'car' && (vType.includes('bike') || vType.includes('motorcycle') || vType.includes('scooter') || vType.includes('truck'))) return false;
      if (filterLower === 'fleet' && !vType.includes('truck') && !vType.includes('fleet') && !vType.includes('van')) return false;
    }

    // 2. Model dropdown filter match
    if (vehicleModelFilter !== 'ALL') {
      if (fullModel.toLowerCase() !== vehicleModelFilter.toLowerCase()) return false;
    }

    // 3. Model dedicated search query match
    if (modelQ) {
      if (!model.includes(modelQ) && !make.includes(modelQ) && !fullModel.toLowerCase().includes(modelQ)) {
        return false;
      }
    }

    // 4. General keyword search match (supports "car", "bike", "scooter", or vehicle name/plate)
    if (!q) return true;
    return (
      vType.includes(q) ||
      make.includes(q) ||
      model.includes(q) ||
      plate.includes(q) ||
      vin.includes(q) ||
      notesStr.includes(q) ||
      fullModel.toLowerCase().includes(q) ||
      (q === 'bike' && (vType.includes('two') || vType.includes('motorcycle') || model.includes('activa') || model.includes('pulsar') || model.includes('bullet') || model.includes('splendor'))) ||
      (q === 'car' && (vType === 'car' || vType === 'sedan' || vType === 'suv' || vType === 'hatchback'))
    );
  });

  const fetchAvailability = async (date) => {
    setLoadingAvail(true);
    try {
      const data = await api.getBayAvailability(date);
      setAvailability(data);
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

  const currentVehicle = vehicles.find(v => v.id === Number(selectedVehicleId)) || preselectedVehicle || {
    plateNumber: 'AP39AB1234',
    make: 'Toyota',
    model: 'Corolla',
    vin: '1FTFW1E84KFA12091',
    year: 2022
  };

  const currentService = servicesCatalog.find(s => s.serviceName === selectedServiceName) || {
    serviceName: 'Oil Change',
    basePrice: 1200.0,
    estimatedDurationMinutes: 45,
    description: 'Full synthetic engine oil replacement and filter change'
  };

  const handleSlotClick = (slotStr, isAvailable, bayNum) => {
    if (!isAvailable) {
      setErrorMsg(`Slot ${slotStr} on ${bayNum} is occupied. Please select an open green slot.`);
      return;
    }
    setSelectedSlot(slotStr);
    setErrorMsg(null);
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    if (vehicles.length === 0 && !selectedVehicleId) {
      setErrorMsg("Please add a vehicle to your profile before booking.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      customerId: currentUser?.userId || 1,
      customerName: currentUser?.fullName || 'Swamy Paila',
      customerEmail: currentUser?.email || 'swamy@gmail.com',
      customerPhone: currentUser?.phone || '9876543210',
      vehiclePlate: currentVehicle.plateNumber,
      vehicleModel: `${currentVehicle.make} ${currentVehicle.model}`,
      vehicleVin: currentVehicle.vin || `VIN-${currentVehicle.plateNumber}`,
      servicePackage: currentService.serviceName,
      bookingDate: bookingDate,
      timeSlot: selectedSlot,
      notes: notes.trim()
    };

    try {
      const booking = await api.createBooking(payload);
      setSuccessMsg(`Booking ${booking.bookingReference} confirmed for ${booking.vehiclePlate} on ${booking.bookingDate} at ${booking.timeSlot} in ${booking.bayName}!`);
      if (onBookingSuccess) onBookingSuccess(booking);
      fetchAvailability(bookingDate);
    } catch (err) {
      setErrorMsg(err.message || "Failed to confirm booking. Collision detected.");
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

  return (
    <div className="space-y-6">
      {/* Header Banner with Interactive Date Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="calendar_month" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Book a Service ⭐</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time automated service bay allocation &bull; Select your preferred date and time slot below.
          </p>
        </div>

        {/* Selected Date Indicator & Change Button */}
        <div className="flex items-center gap-2">
          <div 
            onClick={() => setShowCalendarModal(true)}
            className="flex items-center gap-2.5 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <Icon name="calendar_today" size={16} className="text-emerald-400" />
            <div className="text-left">
              <span className="text-[9px] text-zinc-500 uppercase font-mono block leading-tight">Appointment Date</span>
              <span className="text-xs text-white font-bold font-mono">
                {new Date(bookingDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-900/40 ml-1">
              Change &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-3 animate-fadeIn">
          <Icon name="error" size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Collision Conflict / Booking Error</div>
            <div className="opacity-90">{errorMsg}</div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-start gap-3 animate-fadeIn">
          <Icon name="check_circle" size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Reservation Confirmed!</div>
            <div className="opacity-90">{successMsg}</div>
          </div>
        </div>
      )}

      {/* Main 2-Column Split: Booking Form on Left, Bay Availability Grid on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-5 shadow-lg">
            
            <form onSubmit={handleBookService} className="space-y-5 text-xs">
              
              {/* Step 1: Vehicle Selector with Type Search Bar & Filter Chips */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Icon name="directions_car" size={16} className="text-blue-400" /> Step 1: Select Vehicle
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToVehicles}
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-medium transition-colors"
                  >
                    <Icon name="add_circle" size={13} /> Add / Manage Vehicles
                  </button>
                </div>

                {vehicles.length > 0 ? (
                  <div className="space-y-3">
                    {/* Dual Search & Filter Bars: Vehicle Type Bar + Vehicle Model Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      
                      {/* Bar 1: Vehicle Type Search Bar */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Icon name="category" size={13} className="text-blue-400" />
                            1. Vehicle Type Filter
                          </span>
                          {vehicleSearch && (
                            <span className="text-[10px] text-blue-400 font-normal">Active Search</span>
                          )}
                        </label>
                        <div className="relative">
                          <Icon
                            name="search"
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                          />
                          <input
                            type="text"
                            value={vehicleSearch}
                            onChange={(e) => setVehicleSearch(e.target.value)}
                            placeholder="Type: Car, Bike, Scooter..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-7 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          {vehicleSearch && (
                            <button
                              type="button"
                              onClick={() => setVehicleSearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                              title="Clear type search"
                            >
                              <Icon name="close" size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bar 2: Vehicle Model Selector & Search Bar */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Icon name="commute" size={13} className="text-emerald-400" />
                            2. Vehicle Model Selector
                          </span>
                          {vehicleModelFilter !== 'ALL' && (
                            <span className="text-[10px] text-emerald-400 font-normal">Model Filtered</span>
                          )}
                        </label>

                        <div className="flex items-center gap-1.5">
                          {/* Model Select Dropdown */}
                          <div className="relative flex-1">
                            <select
                              value={vehicleModelFilter}
                              onChange={(e) => {
                                const selected = e.target.value;
                                setVehicleModelFilter(selected);
                                if (selected !== 'ALL') {
                                  const matching = vehicles.find(v => `${v.make} ${v.model}`.trim().toLowerCase() === selected.toLowerCase());
                                  if (matching) setSelectedVehicleId(matching.id);
                                }
                              }}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-medium focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-7"
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
                              size={15}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                            />
                          </div>

                          {/* Model Quick Search Input */}
                          <div className="relative w-32 sm:w-36">
                            <input
                              type="text"
                              value={modelSearch}
                              onChange={(e) => setModelSearch(e.target.value)}
                              placeholder="Type model..."
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors pr-6"
                            />
                            {modelSearch && (
                              <button
                                type="button"
                                onClick={() => setModelSearch('')}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                                title="Clear model search"
                              >
                                <Icon name="close" size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Quick Filter Type Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-zinc-500 font-medium mr-1">Quick Type:</span>
                      {[
                        { id: 'ALL', label: 'All', icon: 'apps' },
                        { id: 'Car', label: 'Cars', icon: 'directions_car' },
                        { id: 'Bike', label: 'Bikes / 2-Wheelers', icon: 'two_wheeler' },
                        { id: 'Scooter', label: 'Scooters', icon: 'moped' },
                        { id: 'Fleet', label: 'Fleet / Other', icon: 'airport_shuttle' }
                      ].map((tab) => {
                        const isSelected = vehicleTypeFilter === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setVehicleTypeFilter(tab.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 border ${
                              isSelected
                                ? 'bg-blue-600/30 text-blue-300 border-blue-500/80 shadow-sm font-semibold'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-800/80 hover:bg-zinc-900 hover:text-zinc-200'
                            }`}
                          >
                            <Icon name={tab.icon} size={13} className={isSelected ? 'text-blue-300' : 'text-zinc-400'} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Model Chips (if models exist) */}
                    {uniqueVehicleModels.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] text-zinc-500 font-medium mr-1">Quick Model:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setVehicleModelFilter('ALL');
                            setModelSearch('');
                          }}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all border ${
                            vehicleModelFilter === 'ALL' && !modelSearch
                              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/80 font-semibold'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800/80 hover:bg-zinc-900'
                          }`}
                        >
                          All Models
                        </button>
                        {uniqueVehicleModels.map((m) => {
                          const isSelected = vehicleModelFilter === m || (modelSearch && m.toLowerCase().includes(modelSearch.toLowerCase()));
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                if (vehicleModelFilter === m) {
                                  setVehicleModelFilter('ALL');
                                } else {
                                  setVehicleModelFilter(m);
                                  const matching = vehicles.find(v => `${v.make} ${v.model}`.trim().toLowerCase() === m.toLowerCase());
                                  if (matching) setSelectedVehicleId(matching.id);
                                }
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 border ${
                                isSelected
                                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/80 font-bold shadow-sm'
                                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200'
                              }`}
                            >
                              <Icon name="directions_car" size={11} className={isSelected ? 'text-emerald-300' : 'text-zinc-500'} />
                              <span>{m}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Matching Vehicles Selectable Cards Grid */}
                    {filteredVehicles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 pt-1">
                        {filteredVehicles.map((v) => {
                          const isSelected = Number(selectedVehicleId) === Number(v.id);
                          const typeIcon = getVehicleTypeIcon(v.vehicleType || 'Car');
                          const badgeColor = getVehicleTypeBadgeColor(v.vehicleType || 'Car');

                          return (
                            <div
                              key={v.id}
                              onClick={() => setSelectedVehicleId(v.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative ${
                                isSelected
                                  ? 'bg-blue-950/40 border-blue-500 text-white shadow-md ring-1 ring-blue-500/50'
                                  : 'bg-zinc-950/80 border-zinc-800/90 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-900 text-zinc-400'}`}>
                                    <Icon name={typeIcon} size={16} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-xs text-white leading-tight">
                                      {v.make} {v.model}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 font-mono">
                                      {v.year} &bull; {v.vin ? v.vin.slice(0, 10) + '...' : 'VIN Verified'}
                                    </div>
                                  </div>
                                </div>

                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${badgeColor}`}>
                                  {v.vehicleType || 'Car'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[11px]">
                                <span className="font-mono font-bold text-blue-400 tracking-wider">
                                  [{v.plateNumber}]
                                </span>
                                {isSelected ? (
                                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <Icon name="check_circle" size={12} /> Selected
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-zinc-500">
                                    Click to select
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Empty Search State */
                      <div className="p-4 rounded-xl bg-zinc-950/80 border border-dashed border-zinc-800 text-center space-y-2">
                        <Icon name="search_off" size={24} className="text-zinc-500 mx-auto" />
                        <p className="text-xs text-zinc-400">
                          No vehicles found matching current search or model filters.
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setVehicleSearch('');
                              setVehicleTypeFilter('ALL');
                              setVehicleModelFilter('ALL');
                              setModelSearch('');
                            }}
                            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <div className="text-xs text-zinc-200 font-semibold">No vehicles registered yet</div>
                      <div className="text-[11px] text-zinc-500">Add your Car, Bike, or Scooter to start booking service appointments.</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={onNavigateToVehicles} 
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1"
                    >
                      <Icon name="add" size={14} /> Add Vehicle &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Service Catalog Selector Cards */}
              <div className="space-y-2">
                <div className="pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Icon name="build" size={16} className="text-emerald-400" /> Step 2: Select Service Package
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {servicesCatalog.map((s) => {
                    const isSelected = selectedServiceName === s.serviceName;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedServiceName(s.serviceName)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 relative ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 text-white shadow-md'
                            : 'bg-zinc-950/70 border-zinc-800 hover:bg-zinc-900 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{s.serviceName}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            ₹{s.basePrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2">{s.description}</p>
                        <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 pt-1">
                          <Icon name="schedule" size={11} /> {s.estimatedDurationMinutes} mins &bull; {s.category}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Interactive Calendar Date Selection */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Icon name="calendar_month" size={16} className="text-amber-400" /> Step 3: Choose Date &amp; Time
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                    {bookingDate}
                  </span>
                </div>

                {/* Embedded Calendar Picker */}
                <CalendarPicker
                  selectedDate={bookingDate}
                  onSelectDate={(newDate) => setBookingDate(newDate)}
                />

                {/* Time Slots */}
                <div className="space-y-2 pt-2">
                  <label className="text-zinc-300 font-semibold block">Select Service Time Slot *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md font-bold'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Service Notes / Issues to Report</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please check engine oil filter, battery health test"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs font-mono">
                <div className="text-zinc-400 text-[11px] font-sans font-bold uppercase tracking-wider">
                  Booking Summary
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Vehicle:</span>
                  <span className="text-white font-bold">{currentVehicle.make} {currentVehicle.model} ({currentVehicle.plateNumber})</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Service Package:</span>
                  <span className="text-white font-bold">{currentService.serviceName}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Date &amp; Slot:</span>
                  <span className="text-emerald-400 font-bold">{bookingDate} @ {selectedSlot}</span>
                </div>
                <div className="flex justify-between text-zinc-300 pt-1 border-t border-zinc-800">
                  <span>Base Price:</span>
                  <span className="text-emerald-400 font-bold text-sm">₹{currentService.basePrice?.toLocaleString('en-IN')} (+ GST)</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 gap-2"
              >
                <Icon name="check_circle" size={16} />
                {submitting ? 'Checking Bays & Reserving...' : 'BOOK SERVICE NOW'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Live Service Bay Collision Guard Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-lg sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Icon name="grid_view" size={16} className="text-emerald-400" /> Bay Availability Matrix
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  Live Collision Guard &bull; {bookingDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchAvailability(bookingDate)}
                title="Refresh Availability"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Icon name="refresh" size={15} className={loadingAvail ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Bay legend */}
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Occupied
              </span>
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span> Maintenance
              </span>
            </div>

            {/* Bays List */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {availability.map((bay) => (
                <div
                  key={bay.bayId}
                  className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                    !bay.isOperational
                      ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                      : 'bg-zinc-950 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span className="font-mono text-blue-400">{bay.bayNumber}</span>
                        <span>&bull; {bay.bayName}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        ₹{bay.hourlyRate}/hr &bull; {bay.bayType}
                      </div>
                    </div>
                    <Badge variant={!bay.isOperational ? 'destructive' : 'success'} className="text-[10px]">
                      {!bay.isOperational ? 'Maintenance' : 'Active'}
                    </Badge>
                  </div>

                  {/* Slot pills for this bay */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {bay.slots?.map((slotObj) => {
                      const isSelected = selectedSlot === slotObj.timeSlot;
                      const isAvail = slotObj.available;
                      return (
                        <button
                          key={slotObj.timeSlot}
                          type="button"
                          onClick={() => handleSlotClick(slotObj.timeSlot, isAvail, bay.bayNumber)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-medium transition-all text-center border ${
                            isSelected && isAvail
                              ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-sm'
                              : isAvail
                              ? 'bg-zinc-900 text-emerald-400 border-zinc-800 hover:bg-zinc-850'
                              : 'bg-red-950/40 text-red-400 border-red-900/40 cursor-not-allowed'
                          }`}
                        >
                          <div>{slotObj.timeSlot}</div>
                          <div className="text-[9px] opacity-80">{isAvail ? 'OPEN' : 'BUSY'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* Calendar Full Modal (if user clicks change from banner) */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full p-6 space-y-4 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Icon name="calendar_month" size={18} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">Select Service Date</h3>
              </div>
              <button onClick={() => setShowCalendarModal(false)} className="text-zinc-400 hover:text-white">
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
