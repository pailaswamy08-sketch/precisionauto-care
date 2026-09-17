import React, { useState } from 'react';
import { api } from '../services/api';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function TechnicianTab({ records, technicians, onRecordUpdated, onNavigateToBilling }) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'parts' | 'complete' | 'assign'

  // Parts state
  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [partUnitPrice, setPartUnitPrice] = useState(45.0);

  // Completion state
  const [laborHours, setLaborHours] = useState(2.0);
  const [laborRate, setLaborRate] = useState(95.0);
  const [finalNotes, setFinalNotes] = useState('');
  const [finalOdometer, setFinalOdometer] = useState(34500);
  const [dtcResolved, setDtcResolved] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Assign state
  const [selectedTechId, setSelectedTechId] = useState(technicians[0]?.id || 2);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleStatusChange = async (recordId, newStatus) => {
    try {
      const updated = await api.updateRecordStatus(recordId, newStatus);
      onRecordUpdated(updated);
      showToast(`Record ${updated.recordNumber} updated to ${newStatus}`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedRecord) return;
    const tech = technicians.find(t => t.id === Number(selectedTechId)) || { id: 2, fullName: "Johnathan Miller" };
    try {
      setLoading(true);
      const updated = await api.assignTechnician(selectedRecord.id, tech.id, tech.fullName);
      onRecordUpdated(updated);
      setActiveModal(null);
      showToast(`Assigned ${tech.fullName} to Record ${updated.recordNumber}`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      setLoading(true);
      const updated = await api.addPartToRecord(selectedRecord.id, {
        partNumber: partNumber || 'GEN-PRT-' + Math.floor(100 + Math.random() * 900),
        partName,
        quantity: Number(partQuantity),
        unitPrice: Number(partUnitPrice)
      });
      onRecordUpdated(updated);
      setSelectedRecord(updated);
      setPartName('');
      setPartNumber('');
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
    try {
      setLoading(true);
      const updated = await api.completeService(selectedRecord.id, {
        laborHours: Number(laborHours),
        laborRate: Number(laborRate),
        technicianNotes: finalNotes || selectedRecord.technicianNotes,
        finalOdometer: Number(finalOdometer),
        dtcResolved,
        discountPercentage: Number(discountPercent)
      });
      onRecordUpdated(updated);
      setActiveModal(null);
      showToast(`Service completed. Invoice ${updated.invoiceNumber || ''} generated.`);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Technician Workbench &amp; Service Orders
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage active garage repairs, log replacement parts, and emit completed invoices.
          </p>
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          <span>Active Technicians: {technicians.length}</span>
        </div>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div className={`p-4 rounded-md text-xs flex items-center gap-2.5 ${
          toast.isError ? 'bg-red-950/60 text-red-200 border border-red-800/60' : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
        }`}>
          <Icon name={toast.isError ? "error" : "check_circle"} size={16} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Spacious 2-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Active Repair Queue */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">Active Service Orders</h2>
            <span className="text-xs text-zinc-400 font-mono">{records.length} Total</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {records.map((r) => {
              const isSelected = selectedRecord?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRecord(r)}
                  className={`p-4 rounded-md border transition-colors cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-500'
                      : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white text-sm">{r.vehiclePlate}</span>
                    <Badge variant={
                      r.serviceStatus === 'COMPLETED' || r.serviceStatus === 'INVOICED'
                        ? 'success'
                        : r.serviceStatus === 'IN_PROGRESS'
                        ? 'default'
                        : 'warning'
                    }>
                      {r.serviceStatus}
                    </Badge>
                  </div>

                  <div className="text-zinc-300">{r.vehicleModel} &bull; {r.servicePackage}</div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <span>Tech: {r.assignedTechnicianName || 'Unassigned'}</span>
                    <span className="font-mono">{r.recordNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Selected Order Actions & Management */}
        <Card className="p-6 space-y-5">
          <div className="pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">
              {selectedRecord ? `Order Details: ${selectedRecord.vehiclePlate}` : 'Select a Service Order'}
            </h2>
          </div>

          {selectedRecord ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-zinc-800">
                <div>
                  <span className="text-zinc-400 block">Record Number</span>
                  <span className="text-white font-mono font-medium">{selectedRecord.recordNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">VIN</span>
                  <span className="text-white font-mono font-medium">{selectedRecord.vehicleVin}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Assigned Bay</span>
                  <span className="text-white font-mono font-medium">{selectedRecord.bayNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block">Technician</span>
                  <span className="text-white font-medium">{selectedRecord.assignedTechnicianName || 'Unassigned'}</span>
                </div>
              </div>

              {/* Diagnostic Notes */}
              <div>
                <span className="text-zinc-400 block mb-1">Technician Notes:</span>
                <p className="text-zinc-200 bg-zinc-950 p-3 rounded-md border border-zinc-800 font-mono text-xs">
                  {selectedRecord.technicianNotes || 'Initial check-in logged. Ready for diagnostics.'}
                </p>
              </div>

              {/* Parts Log */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-300 font-medium">Replaced Parts ({selectedRecord.parts?.length || 0})</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal('parts')}
                    className="h-7 text-xs gap-1"
                  >
                    <Icon name="add" size={13} /> Add Part
                  </Button>
                </div>

                {selectedRecord.parts && selectedRecord.parts.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedRecord.parts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-md border border-zinc-800 text-xs">
                        <span className="font-mono text-zinc-100 font-medium">{p.partNumber}</span>
                        <span className="text-zinc-300">{p.partName} (x{p.quantity})</span>
                        <span className="font-mono text-zinc-200">${(p.totalPrice || p.quantity * p.unitPrice)?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-500 italic p-3 bg-zinc-950 rounded-md border border-zinc-800">
                    No replacement parts added to this order.
                  </div>
                )}
              </div>

              {/* Lifecycle Stage Transitions */}
              <div className="pt-3 border-t border-zinc-800 space-y-2">
                <span className="text-zinc-400 block">Stage Transition:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal('assign')}
                    className="h-8 text-xs gap-1"
                  >
                    <Icon name="person" size={14} /> Assign Tech
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedRecord.id, 'IN_PROGRESS')}
                    className="h-8 text-xs"
                  >
                    Move to In Progress
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setActiveModal('complete')}
                    className="h-8 text-xs gap-1"
                  >
                    <Icon name="check" size={14} /> Sign Off &amp; Invoice
                  </Button>

                  {selectedRecord.invoiceNumber && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToBilling(selectedRecord.invoiceNumber)}
                      className="h-8 text-xs gap-1"
                    >
                      <Icon name="receipt_long" size={14} /> View Invoice
                    </Button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-zinc-500 italic text-center py-20">
              Select an order from the list on the left to view diagnostics and log parts.
            </div>
          )}
        </Card>

      </div>

      {/* Modal 1: Add Part */}
      {activeModal === 'parts' && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Add Part to {selectedRecord.vehiclePlate}</h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddPart} className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-300">Part Number</label>
                <Input
                  type="text"
                  required
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. BRK-PAD-77"
                  className="font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300">Part Name</label>
                <Input
                  type="text"
                  required
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="OEM Brake Pads"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={partQuantity}
                    onChange={(e) => setPartQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-300">Unit Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={partUnitPrice}
                    onChange={(e) => setPartUnitPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Part'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal 2: Sign Off & Complete */}
      {activeModal === 'complete' && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Complete &amp; Invoice: {selectedRecord.vehiclePlate}</h3>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCompleteRepair} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300">Labor Hours</label>
                  <Input
                    type="number"
                    step="0.1"
                    required
                    value={laborHours}
                    onChange={(e) => setLaborHours(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-300">Labor Rate ($/hr)</label>
                  <Input
                    type="number"
                    required
                    value={laborRate}
                    onChange={(e) => setLaborRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300">Technician Repair Notes</label>
                <textarea
                  rows={3}
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value)}
                  placeholder="Completed full inspection and parts installation."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? 'Emitting...' : 'Generate Invoice'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal 3: Assign Tech */}
      {activeModal === 'assign' && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="max-w-sm w-full p-6 space-y-4 shadow-2xl bg-zinc-900 border-zinc-800">
            <h3 className="text-sm font-semibold text-white">Assign Technician</h3>
            
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 focus:outline-none"
            >
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.fullName} ({t.role})</option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAssignTechnician} disabled={loading}>
                {loading ? 'Assigning...' : 'Confirm'}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
