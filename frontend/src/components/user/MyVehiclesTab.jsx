import React, { useState } from 'react';
import { api } from '../../services/api';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function MyVehiclesTab({ vehicles, currentUser, onVehicleAdded, onVehicleUpdated, onVehicleDeleted, onBookForVehicle }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [plateNumber, setPlateNumber] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [vin, setVin] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setPlateNumber('');
    setMake('');
    setModel('');
    setYear(new Date().getFullYear());
    setVin('');
    setVehicleType('Car');
    setNotes('');
    setEditingVehicle(null);
    setError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setPlateNumber(v.plateNumber);
    setMake(v.make);
    setModel(v.model);
    setYear(v.year);
    setVin(v.vin || '');
    setVehicleType(v.vehicleType || 'Car');
    setNotes(v.notes || '');
    setShowAddModal(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!plateNumber.trim() || !make.trim() || !model.trim()) {
      setError("Please provide Registration / Plate No, Make, and Model.");
      return;
    }

    setLoading(true);
    setError(null);

    const vehiclePayload = {
      userId: currentUser?.userId || 1,
      plateNumber: plateNumber.toUpperCase().trim(),
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      vin: vin.trim() || `VIN-${plateNumber.toUpperCase().trim()}`,
      vehicleType,
      notes: notes.trim()
    };

    try {
      if (editingVehicle) {
        const updated = await api.updateVehicle(editingVehicle.id, vehiclePayload);
        onVehicleUpdated(updated);
        setSuccess(`Vehicle ${vehiclePayload.plateNumber} updated successfully!`);
      } else {
        const created = await api.addVehicle(vehiclePayload);
        onVehicleAdded(created);
        setSuccess(`Vehicle ${vehiclePayload.plateNumber} added to your garage!`);
      }
      setShowAddModal(false);
      resetForm();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to save vehicle.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId, plate) => {
    if (!window.confirm(`Are you sure you want to remove vehicle [${plate}] from your profile?`)) return;
    try {
      await api.deleteVehicle(vehicleId);
      onVehicleDeleted(vehicleId);
      setSuccess(`Vehicle [${plate}] removed.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert("Failed to delete vehicle: " + err.message);
    }
  };

  // Quick preset samples for customer
  const samplePresets = [
    { make: 'Toyota', model: 'Corolla', plate: 'AP39AB1234', year: 2022, type: 'Car', notes: 'Daily Commute' },
    { make: 'Honda', model: 'Activa 6G', plate: 'AP39CD5678', year: 2023, type: 'Bike', notes: 'City Two-Wheeler' },
    { make: 'Tata', model: 'Nexon EV', plate: 'TS09EF9012', year: 2024, type: 'Car', notes: 'Electric Compact SUV' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Icon name="directions_car" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">My Vehicles</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Register and manage your cars and bikes for service bookings and digital maintenance records.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs h-10 px-5 shadow-md shadow-blue-900/20 rounded-xl"
        >
          <Icon name="add" size={16} /> Add New Vehicle
        </Button>
      </div>

      {/* Status Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Icon name="check_circle" size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Vehicle Grid */}
      {vehicles.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-zinc-800 bg-zinc-950/40 rounded-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto border border-zinc-800 text-zinc-500">
            <Icon name="garage" size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No vehicles added yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Add your car, bike, or scooter to unlock 1-click bay booking, collision-safe scheduling, and invoice tracking.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            <Button onClick={handleOpenAdd} className="gap-2 text-xs">
              <Icon name="add" size={16} /> Add Your First Vehicle
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <Card
              key={v.id}
              className="p-5 bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all rounded-2xl space-y-4 shadow-md group relative overflow-hidden"
            >
              {/* Top Row: Type & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                    <Icon name={v.vehicleType === 'Bike' ? 'two_wheeler' : 'directions_car'} size={16} />
                  </span>
                  <Badge variant="outline" className="text-[11px] font-mono border-zinc-700 text-zinc-300">
                    {v.vehicleType || 'Car'} &bull; {v.year}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    title="Edit Vehicle"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id, v.plateNumber)}
                    title="Delete Vehicle"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                  >
                    <Icon name="delete" size={15} />
                  </button>
                </div>
              </div>

              {/* Plate & Model */}
              <div className="space-y-1">
                <div className="text-xl font-mono font-extrabold text-white tracking-wide bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800/80 inline-block">
                  {v.plateNumber}
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 pt-1">
                  {v.make} {v.model}
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono truncate">
                  VIN: {v.vin || 'Not Registered'}
                </p>
              </div>

              {/* Notes */}
              {v.notes && (
                <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800 text-[11px] text-zinc-400 italic">
                  "{v.notes}"
                </div>
              )}

              {/* Bottom Quick Action */}
              <div className="pt-2 border-t border-zinc-800/80">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBookForVehicle && onBookForVehicle(v)}
                  className="w-full gap-2 text-xs font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-500 rounded-xl"
                >
                  <Icon name="calendar_month" size={14} /> Book Service for this Vehicle
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-lg w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Icon name="directions_car" size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {editingVehicle ? `Edit Vehicle: ${editingVehicle.plateNumber}` : 'Add New Vehicle'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
                <Icon name="error" size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Autofill Presets */}
            {!editingVehicle && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-zinc-400 font-medium">Quick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {samplePresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setMake(p.make);
                        setModel(p.model);
                        setPlateNumber(p.plate);
                        setYear(p.year);
                        setVehicleType(p.type);
                        setNotes(p.notes);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                    >
                      {p.make} {p.model} ({p.plate})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Registration / Plate No *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. AP39AB1234"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    className="font-mono uppercase font-semibold h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                  >
                    <option value="Car">Car / Sedan / SUV</option>
                    <option value="Bike">Bike / Two-Wheeler</option>
                    <option value="Fleet">Commercial / Fleet Van</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Make / Brand *</label>
                  <Input
                    type="text"
                    required
                    placeholder="Toyota, Honda, Tata"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Model *</label>
                  <Input
                    type="text"
                    required
                    placeholder="Corolla, Activa, Nexon"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-medium">Manufacturing Year</label>
                  <Input
                    type="number"
                    min="1990"
                    max="2030"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">VIN (Vehicle Identification Number)</label>
                <Input
                  type="text"
                  placeholder="e.g. 1FTFW1E84KFA12091 (Optional)"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  className="font-mono uppercase h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-medium">Vehicle Notes / Nickname</label>
                <Input
                  type="text"
                  placeholder="e.g. Primary family car, highway travel"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9"
                />
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
                  disabled={loading}
                  className="h-9 px-5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl"
                >
                  {loading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
