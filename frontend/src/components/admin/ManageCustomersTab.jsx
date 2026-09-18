import React, { useState } from 'react';
import { api } from '../../services/api';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function ManageCustomersTab({ customers, vehicles, bookings, onCustomerUpdated }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filtered = customers.filter(c => {
    const s = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      (c.phone && c.phone.toLowerCase().includes(s)) ||
      (c.organization && c.organization.toLowerCase().includes(s))
    );
  });

  const handleToggleStatus = async (customer) => {
    const newStatus = customer.status === 'Active' ? 'Blocked' : 'Active';
    const confirmMsg = newStatus === 'Blocked'
      ? `Are you sure you want to block [${customer.fullName}]? They will be unable to log in or book services.`
      : `Activate account for [${customer.fullName}]?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(customer.id);
    try {
      await api.updateUserStatus(customer.id, newStatus);
      if (onCustomerUpdated) onCustomerUpdated(customer.id, newStatus);
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getCustomerVehicles = (userId) => {
    return vehicles.filter(v => v.userId === userId || v.userId === Number(userId));
  };

  const getCustomerBookings = (userId, email) => {
    return bookings.filter(b => b.customerId === userId || (email && b.customerEmail?.toLowerCase() === email.toLowerCase()));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Icon name="people" size={22} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Customer Directory</h2>
        </div>

        <div className="relative w-full sm:w-72">
          <Icon name="search" size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search Name, Email, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs bg-zinc-950/80 rounded-xl"
          />
        </div>
      </div>

      {/* Customers Table */}
      <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Icon name="list" size={16} className="text-blue-400" /> Customers Master Ledger
          </h3>
          <span className="text-xs text-zinc-400 font-mono">{filtered.length} Customers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Customer Name</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3 text-center">Vehicles</th>
                <th className="py-3 px-3 text-center">Bookings</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200 font-mono">
              {filtered.map((c) => {
                const userVehicles = getCustomerVehicles(c.id);
                const userBookings = getCustomerBookings(c.id, c.email);
                const isActive = c.status === 'Active';

                return (
                  <tr key={c.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-zinc-400">{c.id}</td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white">{c.fullName}</div>
                      <div className="text-[10px] text-zinc-400">{c.organization || 'Individual'}</div>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">{c.email}</td>
                    <td className="py-3 px-3 text-zinc-300">{c.phone || '9876543210'}</td>
                    <td className="py-3 px-3 text-center font-bold text-blue-400">
                      {userVehicles.length}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-400">
                      {userBookings.length}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      <Badge variant={isActive ? 'success' : 'destructive'} className="text-[10px]">
                        {c.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCustomer(c)}
                          className="h-7 text-xs rounded-lg"
                        >
                          Details
                        </Button>
                        <Button
                          variant={isActive ? 'destructive' : 'default'}
                          size="sm"
                          disabled={updatingId === c.id}
                          onClick={() => handleToggleStatus(c)}
                          className={`h-7 text-xs rounded-lg font-semibold ${
                            isActive ? 'bg-red-900/50 hover:bg-red-800 text-red-200' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {isActive ? 'Block' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <Card className="max-w-xl w-full p-6 space-y-5 bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Icon name="person" size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Customer: {selectedCustomer.fullName}</h3>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-zinc-400 hover:text-white">
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block uppercase font-sans text-[10px]">Email</span>
                <span className="text-white">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase font-sans text-[10px]">Phone</span>
                <span className="text-white">{selectedCustomer.phone || '9876543210'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase font-sans text-[10px]">Account Status</span>
                <span className={selectedCustomer.status === 'Active' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {selectedCustomer.status || 'Active'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase font-sans text-[10px]">Organization</span>
                <span className="text-white">{selectedCustomer.organization || 'Individual'}</span>
              </div>
            </div>

            {/* Registered Vehicles */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Icon name="directions_car" size={14} className="text-blue-400" />
                Registered Vehicles ({getCustomerVehicles(selectedCustomer.id).length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {getCustomerVehicles(selectedCustomer.id).map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex justify-between font-mono">
                    <span className="font-bold text-white">{v.plateNumber} ({v.make} {v.model})</span>
                    <span className="text-zinc-400">{v.vehicleType} &bull; {v.year}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Icon name="event_note" size={14} className="text-emerald-400" />
                Service Bookings ({getCustomerBookings(selectedCustomer.id, selectedCustomer.email).length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {getCustomerBookings(selectedCustomer.id, selectedCustomer.email).map((b) => (
                  <div key={b.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs flex justify-between items-center font-mono">
                    <div>
                      <span className="font-bold text-white">{b.bookingReference || `BK-${b.id}`}</span>
                      <span className="text-zinc-400 ml-2">{b.servicePackage}</span>
                    </div>
                    <Badge variant={b.status === 'COMPLETED' ? 'success' : 'warning'} className="text-[10px]">
                      {b.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <Button size="sm" onClick={() => setSelectedCustomer(null)} className="rounded-xl px-5">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
