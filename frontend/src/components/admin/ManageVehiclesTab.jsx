import React, { useState } from 'react';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export default function ManageVehiclesTab({ vehicles = [], records = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  const filtered = vehicles.filter(v => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      v.plateNumber.toLowerCase().includes(s) ||
      v.make.toLowerCase().includes(s) ||
      v.model.toLowerCase().includes(s) ||
      (v.ownerName && v.ownerName.toLowerCase().includes(s)) ||
      (v.vin && v.vin.toLowerCase().includes(s));

    const matchType = selectedType === 'ALL' || v.vehicleType === selectedType;
    return matchSearch && matchType;
  });

  const getVehicleServiceCount = (plate) => {
    return records.filter(r => r.vehiclePlate?.toUpperCase() === plate.toUpperCase()).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Icon name="directions_car" size={22} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Registered Vehicle Fleet</h2>
        </div>

        <div className="relative w-full sm:w-72">
          <Icon name="search" size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search Plate, Model, Owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs bg-zinc-950/80 rounded-xl"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'Car', 'Bike', 'Fleet'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedType === type
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold shadow-sm'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            {type === 'ALL' ? 'All Vehicles' : type} ({type === 'ALL' ? vehicles.length : vehicles.filter(v => v.vehicleType === type).length})
          </button>
        ))}
      </div>

      {/* Vehicles Table */}
      <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Icon name="list" size={16} className="text-blue-400" /> Vehicle Master Index
          </h3>
          <span className="text-xs text-zinc-400 font-mono">{filtered.length} Vehicles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-sans font-semibold">
                <th className="py-3 px-3">Plate / Reg No</th>
                <th className="py-3 px-3">Make &amp; Model</th>
                <th className="py-3 px-3">Year</th>
                <th className="py-3 px-3">Owner / Customer</th>
                <th className="py-3 px-3">VIN</th>
                <th className="py-3 px-3 text-center">Type</th>
                <th className="py-3 px-3 text-center">Services Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {filtered.map((v) => {
                const serviceCount = getVehicleServiceCount(v.plateNumber);
                return (
                  <tr key={v.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      <span className="bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-blue-400">
                        {v.plateNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-white">
                      {v.make} {v.model}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">{v.year}</td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-white">{v.ownerName || 'Customer'}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{v.ownerEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-zinc-400 text-[11px] truncate max-w-xs">{v.vin}</td>
                    <td className="py-3 px-3 text-center font-sans">
                      <Badge variant="outline" className="text-[10px] border-zinc-700">
                        {v.vehicleType || 'Car'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-400">
                      {serviceCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
