import React, { useState } from 'react';
import AdminDashboardTab from './AdminDashboardTab';
import ManageCustomersTab from './ManageCustomersTab';
import ManageTechniciansTab from './ManageTechniciansTab';
import ManageVehiclesTab from './ManageVehiclesTab';
import ManageServicesTab from './ManageServicesTab';
import ManageServiceBaysTab from './ManageServiceBaysTab';
import ManageBookingsTab from './ManageBookingsTab';
import AdminServiceRecordsTab from './AdminServiceRecordsTab';
import AdminInvoicesTab from './AdminInvoicesTab';
import AdminReportsTab from './AdminReportsTab';
import { Icon } from '../ui/icon';

export default function AdminPortal({
  currentUser,
  customers = [],
  vehicles = [],
  technicians = [],
  services = [],
  bays = [],
  bookings = [],
  records = [],
  invoices = [],
  analytics,
  onCustomerUpdated,
  onTechnicianAdded,
  onTechnicianUpdated,
  onServiceAdded,
  onServiceUpdated,
  onBayAdded,
  onBayUpdated,
  onBookingUpdated,
  onBookingCancelled,
  onInvoicePaid
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');

  const adminNavItems = [
    { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
    { id: 'customers', label: 'Customers', icon: 'people', count: customers.length },
    { id: 'technicians', label: 'Technicians', icon: 'engineering', count: technicians.length },
    { id: 'vehicles', label: 'Vehicles', icon: 'directions_car', count: vehicles.length },
    { id: 'services', label: 'Services Catalog', icon: 'build', count: services.length },
    { id: 'bays', label: 'Service Bays', icon: 'garage', count: bays.length },
    { id: 'bookings', label: 'Bookings', icon: 'event_available', count: bookings.length },
    { id: 'records', label: 'Service Records', icon: 'history_edu', count: records.length },
    { id: 'invoices', label: 'Invoices', icon: 'receipt_long', count: invoices.length },
    { id: 'reports', label: 'Analytics & Reports', icon: 'analytics' },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Sub-Navigation Pill Bar */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-lg">
        {adminNavItems.map((tab) => {
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/30 font-bold'
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
        {activeAdminTab === 'dashboard' && (
          <AdminDashboardTab
            analytics={analytics}
            bays={bays}
            bookings={bookings}
            records={records}
            invoices={invoices}
            onNavigate={(targetTab) => setActiveAdminTab(targetTab)}
          />
        )}

        {activeAdminTab === 'customers' && (
          <ManageCustomersTab
            customers={customers}
            vehicles={vehicles}
            bookings={bookings}
            onCustomerUpdated={onCustomerUpdated}
          />
        )}

        {activeAdminTab === 'technicians' && (
          <ManageTechniciansTab
            technicians={technicians}
            records={records}
            onTechnicianAdded={onTechnicianAdded}
            onTechnicianUpdated={onTechnicianUpdated}
          />
        )}

        {activeAdminTab === 'vehicles' && (
          <ManageVehiclesTab
            vehicles={vehicles}
            records={records}
          />
        )}

        {activeAdminTab === 'services' && (
          <ManageServicesTab
            services={services}
            onServiceAdded={onServiceAdded}
            onServiceUpdated={onServiceUpdated}
          />
        )}

        {activeAdminTab === 'bays' && (
          <ManageServiceBaysTab
            bays={bays}
            bookings={bookings}
            onBayAdded={onBayAdded}
            onBayUpdated={onBayUpdated}
          />
        )}

        {activeAdminTab === 'bookings' && (
          <ManageBookingsTab
            bookings={bookings}
            bays={bays}
            technicians={technicians}
            onBookingUpdated={onBookingUpdated}
            onBookingCancelled={onBookingCancelled}
          />
        )}

        {activeAdminTab === 'records' && (
          <AdminServiceRecordsTab
            records={records}
            onSelectInvoice={() => setActiveAdminTab('invoices')}
          />
        )}

        {activeAdminTab === 'invoices' && (
          <AdminInvoicesTab
            invoices={invoices}
            onInvoicePaid={onInvoicePaid}
          />
        )}

        {activeAdminTab === 'reports' && (
          <AdminReportsTab
            analytics={analytics}
            technicians={technicians}
          />
        )}
      </div>
    </div>
  );
}
