import React, { useState } from 'react';
import MyVehiclesTab from './MyVehiclesTab';
import UserBookServiceTab from './UserBookServiceTab';
import UserBookingsTab from './UserBookingsTab';
import UserServiceHistoryTab from './UserServiceHistoryTab';
import UserInvoicesTab from './UserInvoicesTab';
import UserProfileTab from './UserProfileTab';
import { Icon } from '../ui/icon';

export default function UserPortal({
  currentUser,
  vehicles,
  servicesCatalog,
  bookings,
  records,
  invoices,
  onVehicleAdded,
  onVehicleUpdated,
  onVehicleDeleted,
  onBookingCreated,
  onBookingCancelled,
  onInvoicePaid,
  onProfileUpdated
}) {
  const [activeUserTab, setActiveUserTab] = useState('book'); // 'vehicles' | 'book' | 'bookings' | 'history' | 'invoices' | 'profile'
  const [preselectedVehicle, setPreselectedVehicle] = useState(null);

  const handleBookForVehicle = (vehicle) => {
    setPreselectedVehicle(vehicle);
    setActiveUserTab('book');
  };

  const handleBookingCreated = (newBooking) => {
    if (onBookingCreated) onBookingCreated(newBooking);
    setActiveUserTab('bookings');
  };

  const userNavItems = [
    { id: 'vehicles', label: 'My Vehicles', icon: 'directions_car', count: vehicles.length },
    { id: 'book', label: 'Book Service', icon: 'calendar_month' },
    { id: 'bookings', label: 'Appointments', icon: 'event_note', count: bookings.length },
    { id: 'history', label: 'Service History', icon: 'history', count: records.filter(r => r.serviceStatus === 'COMPLETED').length },
    { id: 'invoices', label: 'Invoices & Billing', icon: 'receipt_long', count: invoices.length },
    { id: 'profile', label: 'Account Profile', icon: 'person' },
  ];

  return (
    <div className="space-y-6">
      {/* User Domain Sub-Navigation Pill Bar */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-lg">
        {userNavItems.map((tab) => {
          const isActive = activeUserTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveUserTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon name={tab.icon} size={15} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div className="min-h-[500px]">
        {activeUserTab === 'vehicles' && (
          <MyVehiclesTab
            vehicles={vehicles}
            currentUser={currentUser}
            onVehicleAdded={onVehicleAdded}
            onVehicleUpdated={onVehicleUpdated}
            onVehicleDeleted={onVehicleDeleted}
            onBookForVehicle={handleBookForVehicle}
          />
        )}

        {activeUserTab === 'book' && (
          <UserBookServiceTab
            vehicles={vehicles}
            servicesCatalog={servicesCatalog}
            currentUser={currentUser}
            preselectedVehicle={preselectedVehicle}
            onBookingSuccess={handleBookingCreated}
            onNavigateToVehicles={() => setActiveUserTab('vehicles')}
          />
        )}

        {activeUserTab === 'bookings' && (
          <UserBookingsTab
            bookings={bookings}
            currentUser={currentUser}
            onBookingCancelled={onBookingCancelled}
            onNavigateToBook={() => setActiveUserTab('book')}
          />
        )}

        {activeUserTab === 'history' && (
          <UserServiceHistoryTab
            records={records}
            onSelectInvoice={() => setActiveUserTab('invoices')}
          />
        )}

        {activeUserTab === 'invoices' && (
          <UserInvoicesTab
            invoices={invoices}
            currentUser={currentUser}
            onInvoicePaid={onInvoicePaid}
          />
        )}

        {activeUserTab === 'profile' && (
          <UserProfileTab
            currentUser={currentUser}
            vehicleCount={vehicles.length}
            bookingCount={bookings.length}
            onProfileUpdated={onProfileUpdated}
          />
        )}
      </div>
    </div>
  );
}
