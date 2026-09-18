import React, { useState } from 'react';
import { api } from '../../services/api';
import { Icon } from '../ui/icon';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export default function UserBookingsTab({ bookings, currentUser, onBookingCancelled, onNavigateToBook }) {
  const [filter, setFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const filtered = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    return b.status === filter;
  });

  const handleCancelBooking = async (bookingId, bookingRef) => {
    if (!window.confirm(`Are you sure you want to cancel booking [${bookingRef}]?`)) return;

    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId);
      if (onBookingCancelled) onBookingCancelled(bookingId);
      setStatusMsg(`Booking ${bookingRef} has been cancelled.`);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      alert("Failed to cancel booking: " + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">CONFIRMED</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">IN_PROGRESS</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="warning">{status || 'PENDING'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Icon name="event_note" size={22} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Service Appointments</h2>
        </div>

        <Button
          onClick={onNavigateToBook}
          className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs h-10 px-5 shadow-md shadow-emerald-900/20 rounded-xl"
        >
          <Icon name="add" size={16} /> Book Appointment
        </Button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs flex items-center gap-2.5 animate-fadeIn">
          <Icon name="info" size={18} className="text-blue-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              filter === st
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-sm'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            {st} ({st === 'ALL' ? bookings.length : bookings.filter(b => b.status === st).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-zinc-800 bg-zinc-950/40 rounded-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto border border-zinc-800 text-zinc-500">
            <Icon name="calendar_today" size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No bookings in this filter</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Schedule your next vehicle maintenance appointment to keep your car or bike in peak condition.
            </p>
          </div>
          <Button onClick={onNavigateToBook} className="gap-2 text-xs">
            <Icon name="calendar_month" size={16} /> Book Service Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((b) => {
            const isCancellable = b.status === 'CONFIRMED' || b.status === 'PENDING';
            return (
              <Card
                key={b.id}
                className="p-5 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-4 shadow-md hover:border-zinc-700 transition-all"
              >
                {/* Header: Ref & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                      {b.bookingReference || `BK-${b.id}`}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {b.servicePackage}
                    </span>
                  </div>
                  {getStatusBadge(b.status)}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans">Vehicle</span>
                    <span className="text-white font-bold">{b.vehiclePlate}</span>
                    <div className="text-[10px] text-zinc-400 font-sans">{b.vehicleModel}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans">Assigned Bay</span>
                    <span className="text-blue-400 font-bold">Bay #{b.bayId}</span>
                    <div className="text-[10px] text-zinc-400 font-sans">Collision-Protected</div>
                  </div>
                  <div className="pt-2 border-t border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans">Date</span>
                    <span className="text-zinc-200">{b.bookingDate}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 block uppercase font-sans">Time Slot</span>
                    <span className="text-zinc-200 font-bold">{b.timeSlot}</span>
                  </div>
                </div>

                {/* Notes if any */}
                {b.notes && (
                  <p className="text-[11px] text-zinc-400 italic px-1">
                    "{b.notes}"
                  </p>
                )}

                {/* Actions & Status Indicator */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-sans">
                    <Icon
                      name={
                        b.status === 'COMPLETED' ? 'check_circle' :
                        b.status === 'CANCELLED' ? 'cancel' :
                        b.status === 'IN_PROGRESS' ? 'engineering' : 'schedule'
                      }
                      size={14}
                      className={
                        b.status === 'COMPLETED' ? 'text-emerald-400' :
                        b.status === 'CANCELLED' ? 'text-red-400' :
                        b.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-blue-400'
                      }
                    />
                    Status: <strong className="text-zinc-200">{b.status}</strong>
                  </span>

                  {isCancellable && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancelBooking(b.id, b.bookingReference)}
                      className="h-8 text-xs font-semibold text-red-400 border-red-900/50 hover:bg-red-950/50 hover:text-red-300 rounded-xl"
                    >
                      {cancellingId === b.id ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
