import React, { useState } from 'react';
import { api } from '../../services/api';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';

export default function UserProfileTab({ currentUser, vehicleCount, bookingCount, onProfileUpdated }) {
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Swamy Paila');
  const [email, setEmail] = useState(currentUser?.email || 'swamy@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '9876543210');
  const [organization, setOrganization] = useState(currentUser?.organization || 'Individual Customer');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const updated = await api.updateProfile(currentUser?.userId || 1, {
        fullName,
        phone,
        organization
      });
      if (onProfileUpdated) onProfileUpdated({ ...currentUser, ...updated });
      setMsg({ type: 'success', text: 'Profile details updated successfully!' });
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Profile Card */}
      <Card className="p-8 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-zinc-800 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <Avatar className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl ring-4 ring-zinc-800">
            <AvatarFallback>{fullName.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl font-bold text-white tracking-tight">{fullName}</h2>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                Customer Account
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">{email}</p>
            <p className="text-xs text-zinc-300 font-medium">{organization}</p>
          </div>

          {/* Quick Metrics */}
          <div className="flex sm:flex-col gap-3 shrink-0">
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-center min-w-[90px]">
              <span className="text-lg font-bold text-white font-mono block">{vehicleCount}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Vehicles</span>
            </div>
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-center min-w-[90px]">
              <span className="text-lg font-bold text-emerald-400 font-mono block">{bookingCount}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Bookings</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card className="p-8 bg-zinc-900/80 border-zinc-800 rounded-2xl shadow-lg space-y-6">
        <div className="pb-4 border-b border-zinc-800 flex items-center gap-2">
          <Icon name="person" size={18} className="text-blue-400" />
          <h3 className="text-base font-bold text-white">Personal &amp; Contact Information</h3>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            msg.type === 'error' ? 'bg-red-950/60 border border-red-800/60 text-red-200' : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-200'
          }`}>
            <Icon name={msg.type === 'error' ? 'error' : 'check_circle'} size={18} />
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Full Name</label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Contact Phone Number</label>
              <Input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Email Address (Read Only)</label>
              <Input
                type="email"
                disabled
                value={email}
                className="h-10 text-xs bg-zinc-950/50 text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Account / Organization</label>
              <Input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <Button
              type="submit"
              disabled={saving}
              className="h-10 px-6 font-bold bg-blue-600 hover:bg-blue-500 rounded-xl"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
