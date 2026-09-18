import React, { useState } from 'react';
import { api } from '../../services/api';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function ManageServicesTab({ services = [], onServiceAdded, onServiceUpdated }) {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(1200);
  const [duration, setDuration] = useState(45);

  const handleOpenAdd = () => {
    setEditingService(null);
    setServiceName('');
    setCategory('Maintenance');
    setDescription('');
    setBasePrice(1200);
    setDuration(45);
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingService(s);
    setServiceName(s.serviceName);
    setCategory(s.category || 'Maintenance');
    setDescription(s.description || '');
    setBasePrice(s.basePrice);
    setDuration(s.estimatedDurationMinutes || 45);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      serviceName: serviceName.trim(),
      category: category.trim(),
      description: description.trim(),
      basePrice: Number(basePrice),
      estimatedDurationMinutes: Number(duration),
      isActive: editingService ? editingService.isActive : true
    };

    try {
      if (editingService) {
        const updated = await api.updateServiceCatalogItem(editingService.id, payload);
        if (onServiceUpdated) onServiceUpdated(updated);
      } else {
        const created = await api.addServiceCatalogItem(payload);
        if (onServiceAdded) onServiceAdded(created);
      }
      setShowModal(false);
    } catch (err) {
      alert("Failed to save service: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (s) => {
    try {
      const updated = await api.updateServiceCatalogItem(s.id, {
        ...s,
        isActive: !s.isActive
      });
      if (onServiceUpdated) onServiceUpdated(updated);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="build" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Services Catalog &amp; Pricing</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Define garage maintenance packages, update prices in ₹, and configure estimated repair durations.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs h-10 px-5 rounded-xl shadow-md shadow-emerald-900/20"
        >
          <Icon name="add" size={16} /> Add New Service Package
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s) => (
          <Card
            key={s.id}
            className="p-5 bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 rounded-2xl space-y-4 shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Category & Status */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[11px] border-zinc-700 text-zinc-300">
                  {s.category || 'General'}
                </Badge>
                <Badge variant={s.isActive ? 'success' : 'destructive'} className="text-[10px]">
                  {s.isActive ? 'Active' : 'Disabled'}
                </Badge>
              </div>

              {/* Service Title & Price */}
              <div>
                <h3 className="text-base font-bold text-white">{s.serviceName}</h3>
                <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                  ₹{s.basePrice?.toLocaleString('en-IN')}
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                {s.description || 'Standard repair and maintenance procedure.'}
              </p>
            </div>

            {/* Bottom Meta & Actions */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-3 text-xs">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Icon name="schedule" size={13} /> {s.estimatedDurationMinutes || 60} mins
                </span>
                <span>Tax: 18% GST</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(s)}
                  className="w-full h-8 text-xs font-semibold rounded-xl gap-1.5"
                >
                  <Icon name="edit" size={13} /> Edit Price &amp; Details
                </Button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(s)}
                  title={s.isActive ? 'Disable Service' : 'Enable Service'}
                  className={`p-1.5 rounded-lg border text-xs font-semibold ${
                    s.isActive
                      ? 'border-red-900/40 text-red-400 hover:bg-red-950/40'
                      : 'border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/40'
                  }`}
                >
                  <Icon name={s.isActive ? 'toggle_on' : 'toggle_off'} size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingService ? `Edit Service: ${editingService.serviceName}` : 'Add New Service Package'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Service Package Name *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Oil Change, Brake Service"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="h-9 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Base Price (₹) *</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    step="50"
                    placeholder="1200"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="h-9 font-mono font-bold text-emerald-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Est. Duration (Minutes)</label>
                  <Input
                    type="number"
                    min="15"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Safety">Safety &amp; Brakes</option>
                  <option value="Climate">Climate / AC Service</option>
                  <option value="Diagnostics">Engine Diagnostics &amp; Overhaul</option>
                  <option value="Chassis">Chassis &amp; Alignment</option>
                  <option value="Inspection">General Inspection</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details about what is included in this service package..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-4 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white"
                >
                  {loading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
