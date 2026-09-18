import React, { useState } from 'react';
import { api } from '../services/api';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function TechnicianTab({ records = [], technicians = [], currentUser, onRecordUpdated, onNavigateToBilling }) {
  const [selectedRecord, setSelectedRecord] = useState(records[0] || null);
  const [activeModal, setActiveModal] = useState(null); // 'parts' | 'complete' | 'inspect'

  // Parts modal state
  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [partUnitPrice, setPartUnitPrice] = useState(250.0);

  // Complete Service Modal state
  const [problemDescription, setProblemDescription] = useState('Old engine oil & clogged oil filter');
  const [workPerformed, setWorkPerformed] = useState('Full synthetic engine oil replaced and new OEM filter installed');
  const [technicianNotes, setTechnicianNotes] = useState('Engine sounds smooth. Multi-point check passed.');
  const [laborHours, setLaborHours] = useState(1.0);
  const [laborRate, setLaborRate] = useState(300.0);
  const [finalOdometer, setFinalOdometer] = useState(24500);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStageTransition = async (recordId, newStatus) => {
    try {
      const updated = await api.updateRecordStatus(recordId, newStatus);
      if (onRecordUpdated) onRecordUpdated(updated);
      setSelectedRecord(prev => ({ ...prev, serviceStatus: newStatus }));
      showToast(`Record ${selectedRecord.recordNumber} updated to ${newStatus}`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setLoading(true);

    try {
      const updated = await api.addPartToRecord(selectedRecord.id, {
        partNumber: partNumber || 'PRT-' + Math.floor(100 + Math.random() * 900),
        partName,
        quantity: Number(partQuantity),
        unitPrice: Number(partUnitPrice)
      });
      if (onRecordUpdated) onRecordUpdated(updated);
      setSelectedRecord(updated);
      setPartName('');
      setPartNumber('');
      setActiveModal(null);
      showToast(`Added part [${partName}]`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRepair = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setLoading(true);

    const calculatedLabour = Number(laborHours) * Number(laborRate);

    try {
      const updated = await api.completeService(selectedRecord.id, {
        problemDescription,
        workPerformed,
        technicianNotes,
        laborHours: Number(laborHours),
        laborRate: Number(laborRate),
        labourCost: calculatedLabour,
        finalOdometer: Number(finalOdometer)
      });
      if (onRecordUpdated) onRecordUpdated(updated);
      setSelectedRecord(updated);
      setActiveModal(null);
      showToast(`Service completed! Invoice ${updated.invoiceNumber} generated.`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Icon name="engineering" size={24} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Technician Workbench</h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800">
          <span className="text-zinc-400">Assigned Tech:</span>
          <span className="text-amber-400 font-bold">{currentUser?.fullName || 'Ravi Kumar'}</span>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn ${
          toast.isError ? 'bg-red-950/60 text-red-200 border border-red-800/60' : 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60'
        }`}>
          <Icon name={toast.isError ? "error" : "check_circle"} size={16} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* 2-Column Split: Active Orders Queue on Left, Workbench on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Assigned Jobs List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Icon name="view_list" size={16} className="text-amber-400" /> Active Service Orders
              </h3>
              <span className="text-xs text-zinc-400 font-mono">{records.length} Jobs</span>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {records.map((r) => {
                const isSelected = selectedRecord?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecord(r)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-2.5 ${
                      isSelected
                        ? 'bg-zinc-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-zinc-950/80 border-zinc-800/80 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-extrabold text-white text-sm bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {r.vehiclePlate}
                      </span>
                      <Badge
                        variant={
                          r.serviceStatus === 'COMPLETED' || r.serviceStatus === 'INVOICED' ? 'success' :
                          r.serviceStatus === 'IN_PROGRESS' ? 'warning' : 'default'
                        }
                        className="text-[10px]"
                      >
                        {r.serviceStatus}
                      </Badge>
                    </div>

                    <div className="font-semibold text-zinc-200">
                      {r.vehicleModel} &bull; <span className="text-amber-400">{r.servicePackage}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1 border-t border-zinc-800/60">
                      <span>{r.bayNumber}</span>
                      <span>{r.recordNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Workbench Actions & Diagnostics (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-5 shadow-lg">
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="build_circle" size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {selectedRecord ? `Vehicle Diagnostics: ${selectedRecord.vehiclePlate}` : 'Select a Service Order'}
                </h3>
              </div>

              {selectedRecord && (
                <Badge variant={selectedRecord.serviceStatus === 'COMPLETED' ? 'success' : 'warning'}>
                  {selectedRecord.serviceStatus}
                </Badge>
              )}
            </div>

            {selectedRecord ? (
              <div className="space-y-4 text-xs">
                {/* Vehicle & Customer Overview */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono">
                  <div>
                    <span className="text-zinc-500 uppercase font-sans text-[10px] block">Customer</span>
                    <span className="text-white font-bold">{selectedRecord.customerName || 'Swamy Paila'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase font-sans text-[10px] block">Vehicle Model</span>
                    <span className="text-white">{selectedRecord.vehicleModel}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase font-sans text-[10px] block">Service Package</span>
                    <span className="text-amber-400 font-bold">{selectedRecord.servicePackage}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase font-sans text-[10px] block">Bay Station</span>
                    <span className="text-blue-400 font-bold">{selectedRecord.bayNumber}</span>
                  </div>
                </div>

                {/* Problem & Diagnostics */}
                <div>
                  <span className="text-zinc-400 font-semibold block mb-1">Diagnosed Problem:</span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-200 font-mono">
                    {selectedRecord.problemDescription || 'Old engine oil and clogged filter needing replacement.'}
                  </div>
                </div>

                <div>
                  <span className="text-zinc-400 font-semibold block mb-1">Work Performed Log:</span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-200 font-mono">
                    {selectedRecord.workPerformed || selectedRecord.technicianNotes || 'Inspected vehicle systems and verified fluid levels.'}
                  </div>
                </div>

                {/* Replaced Parts Log */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300 font-semibold">
                      Replacement Parts Used ({selectedRecord.parts?.length || 0})
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModal('parts')}
                      className="h-7 text-xs gap-1 rounded-lg"
                    >
                      <Icon name="add" size={13} /> Add Part
                    </Button>
                  </div>

                  {selectedRecord.parts && selectedRecord.parts.length > 0 ? (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {selectedRecord.parts.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs">
                          <span className="text-zinc-200 font-bold">{p.partName}</span>
                          <span className="text-zinc-400">(x{p.quantity})</span>
                          <span className="text-emerald-400 font-bold">₹{(p.totalPrice || p.quantity * p.unitPrice)?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-500 italic text-center">
                      No replacement parts logged yet.
                    </div>
                  )}
                </div>

                {/* Stage Progression Buttons */}
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <span className="text-zinc-400 font-semibold block">Repair Workflow Stages:</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStageTransition(selectedRecord.id, 'IN_INSPECTION')}
                      className="h-8 text-xs rounded-xl"
                    >
                      1. Inspect Vehicle
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStageTransition(selectedRecord.id, 'IN_PROGRESS')}
                      className="h-8 text-xs rounded-xl"
                    >
                      2. Start Service
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStageTransition(selectedRecord.id, 'QUALITY_CHECK')}
                      className="h-8 text-xs rounded-xl"
                    >
                      3. Quality Check
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setActiveModal('complete')}
                      className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-1.5 shadow-md"
                    >
                      <Icon name="check" size={14} /> Complete &amp; Emit Invoice ⭐
                    </Button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-16 text-center text-zinc-500 italic text-xs">
                Select a service order from the queue to start diagnostics and log repairs.
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Modal 1: Add Part */}
      {activeModal === 'parts' && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-md w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Add Part: {selectedRecord.vehiclePlate}</h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleAddPart} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Part Number / SKU</label>
                <Input
                  type="text"
                  placeholder="e.g. FLT-OIL-TY01"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
                  className="font-mono uppercase h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Part Description *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Genuine Micro-Pore Oil Filter"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={partQuantity}
                    onChange={(e) => setPartQuantity(e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Unit Price (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    value={partUnitPrice}
                    onChange={(e) => setPartUnitPrice(e.target.value)}
                    className="h-9 font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="h-9 px-5 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl text-white">
                  {loading ? 'Adding...' : 'Log Part'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal 2: Complete Service & Emit Invoice */}
      {activeModal === 'complete' && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-lg w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                Complete Service &amp; Generate Invoice ⭐
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleCompleteRepair} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Diagnosed Problem Description *</label>
                <Input
                  type="text"
                  required
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Old engine oil and clogged filter"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Work Performed *</label>
                <textarea
                  rows={2}
                  required
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  placeholder="Engine oil drained, new synthetic oil filled and filter replaced"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Labour Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={laborHours}
                    onChange={(e) => setLaborHours(e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Labour Rate (₹/hr)</label>
                  <Input
                    type="number"
                    value={laborRate}
                    onChange={(e) => setLaborRate(e.target.value)}
                    className="h-9 font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Instant Bill Preview */}
              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 text-xs font-mono">
                <div className="text-[10px] text-zinc-500 uppercase font-sans font-bold">Dynamic Billing Calculation</div>
                <div className="flex justify-between text-zinc-300">
                  <span>Parts Cost:</span>
                  <span>₹{selectedRecord.partsCost || 1200}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Labour ({laborHours} hrs @ ₹{laborRate}/hr):</span>
                  <span>₹{Number(laborHours) * Number(laborRate)}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Subtotal:</span>
                  <span>₹{(selectedRecord.partsCost || 1200) + (Number(laborHours) * Number(laborRate))}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>GST (18%):</span>
                  <span>₹{Math.round((((selectedRecord.partsCost || 1200) + (Number(laborHours) * Number(laborRate))) * 0.18) * 100) / 100}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-zinc-800 font-bold text-emerald-400">
                  <span>Total Invoice:</span>
                  <span>₹{Math.round((((selectedRecord.partsCost || 1200) + (Number(laborHours) * Number(laborRate))) * 1.18) * 100) / 100}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white">
                  {loading ? 'Generating...' : 'Emit Complete Invoice'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
