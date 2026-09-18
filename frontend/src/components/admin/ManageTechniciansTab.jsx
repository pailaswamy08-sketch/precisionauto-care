import React, { useState } from 'react';
import { api } from '../../services/api';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function ManageTechniciansTab({ technicians = [], records = [], onTechnicianAdded, onTechnicianUpdated }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTechJobs, setSelectedTechJobs] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Engine Service');

  const handleOpenAdd = () => {
    setEditingTech(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setSpecialization('Engine Service');
    setShowAddModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTech(t);
    setFullName(t.fullName);
    setEmail(t.email);
    setPhone(t.phone || '');
    setSpecialization(t.specialization || 'Engine Service');
    setShowAddModal(true);
  };

  const handleSaveTech = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTech) {
        const updated = await api.updateTechnician(editingTech.id, {
          fullName,
          phone,
          specialization,
          status: editingTech.status || 'Active'
        });
        if (onTechnicianUpdated) onTechnicianUpdated(updated);
      } else {
        const created = await api.addTechnician({
          fullName,
          email,
          phone,
          specialization
        });
        if (onTechnicianAdded) onTechnicianAdded(created);
      }
      setShowAddModal(false);
    } catch (err) {
      alert("Failed to save technician: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tech) => {
    const newStatus = tech.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await api.updateTechnician(tech.id, { ...tech, status: newStatus });
      if (onTechnicianUpdated) onTechnicianUpdated(updated);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const getTechAssignedJobs = (techId, techName) => {
    return records.filter(r => 
      r.assignedTechnicianId === techId || 
      (techName && r.assignedTechnicianName?.toLowerCase() === techName.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Icon name="engineering" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Manage Technicians</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Roster management, technical specializations, job dispatching, and workshop productivity tracking.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs h-10 px-5 rounded-xl shadow-md shadow-amber-900/20"
        >
          <Icon name="person_add" size={16} /> Add Technician
        </Button>
      </div>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {technicians.map((t) => {
          const assignedJobs = getTechAssignedJobs(t.id, t.fullName);
          const activeJobs = assignedJobs.filter(j => j.serviceStatus === 'IN_PROGRESS' || j.serviceStatus === 'SCHEDULED' || j.serviceStatus === 'IN_INSPECTION');
          const isActive = t.status === 'Active';

          return (
            <Card
              key={t.id}
              className="p-5 bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800 rounded-2xl space-y-4 shadow-md transition-all group"
            >
              {/* Top Row: Name & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{t.fullName}</h3>
                  <div className="text-[11px] text-zinc-400 font-mono">{t.email}</div>
                </div>
                <Badge variant={isActive ? 'success' : 'destructive'} className="text-[10px]">
                  {t.status || 'Active'}
                </Badge>
              </div>

              {/* Specialization Badge */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Specialization</div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <Icon name="build" size={13} /> {t.specialization || 'Engine Service'}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  Phone: {t.phone || '9876500000'}
                </div>
              </div>

              {/* Workload Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-center">
                  <span className="text-sm font-bold text-amber-400 block">{activeJobs.length}</span>
                  <span className="text-[10px] text-zinc-400 font-sans">Active Jobs</span>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-center">
                  <span className="text-sm font-bold text-emerald-400 block">{assignedJobs.length}</span>
                  <span className="text-[10px] text-zinc-400 font-sans">Total Records</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTechJobs({ tech: t, jobs: assignedJobs })}
                  className="h-7 text-xs rounded-xl"
                >
                  View Assigned Jobs
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    title="Edit Technician"
                    className="p-1 text-zinc-400 hover:text-white rounded"
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(t)}
                    title={isActive ? 'Deactivate' : 'Activate'}
                    className={`p-1 rounded ${isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                  >
                    <Icon name={isActive ? 'block' : 'check_circle'} size={15} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Technician Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingTech ? `Edit: ${editingTech.fullName}` : 'Add New Technician'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTech} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Full Name *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Ravi Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9"
                />
              </div>

              {!editingTech && (
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Email Address *</label>
                  <Input
                    type="email"
                    required
                    placeholder="ravi@precisionauto.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="9876500001"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Specialization</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="Engine Service">Engine &amp; Powertrain Service</option>
                  <option value="Brake Service">Brake &amp; Suspension Overhaul</option>
                  <option value="AC & Electrical">AC &amp; ECM Diagnostic Lab</option>
                  <option value="Wheel & Chassis">Wheel Alignment &amp; Chassis</option>
                  <option value="General Diagnostics">General Automotive Diagnostics</option>
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
                  disabled={loading}
                  className="h-9 px-5 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl text-white"
                >
                  {loading ? 'Saving...' : editingTech ? 'Update Technician' : 'Add Technician'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* View Assigned Jobs Modal */}
      {selectedTechJobs && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-lg w-full p-6 space-y-4 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">
                Assigned Jobs: {selectedTechJobs.tech.fullName}
              </h3>
              <button onClick={() => setSelectedTechJobs(null)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {selectedTechJobs.jobs.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs">
                  No service records assigned to this technician.
                </div>
              ) : (
                selectedTechJobs.jobs.map((j) => (
                  <div key={j.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{j.vehiclePlate}</span>
                      <Badge variant={j.serviceStatus === 'COMPLETED' ? 'success' : 'warning'} className="text-[10px]">
                        {j.serviceStatus}
                      </Badge>
                    </div>
                    <div className="text-zinc-400 text-[11px] font-sans">
                      {j.servicePackage} &bull; {j.bayNumber}
                    </div>
                    {j.workPerformed && (
                      <div className="text-[11px] text-zinc-300 italic pt-1 border-t border-zinc-800/60 font-sans">
                        "{j.workPerformed}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <Button size="sm" onClick={() => setSelectedTechJobs(null)} className="rounded-xl px-4">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
