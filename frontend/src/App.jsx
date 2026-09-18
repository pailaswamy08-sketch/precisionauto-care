import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserPortal from './components/user/UserPortal';
import AdminPortal from './components/admin/AdminPortal';
import TechnicianTab from './components/TechnicianTab';
import ArchitectureTab from './components/ArchitectureTab';
import ReviewDtiTab from './components/ReviewDtiTab';
import LoginPage from './components/LoginPage';
import { api } from './services/api';
import { Icon } from './components/ui/icon';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('precision_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    return currentUser?.role || 'CLIENT';
  });

  const [activeTab, setActiveTab] = useState('portal'); // 'portal' | 'architecture' | 'review1' | 'login'
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('precision_jwt_token') && !!localStorage.getItem('precision_user');
  });

  // Master State Across Domains
  const [vehicles, setVehicles] = useState([]);
  const [servicesCatalog, setServicesCatalog] = useState([]);
  const [bays, setBays] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        vehiclesData,
        servicesData,
        baysData,
        bookingsData,
        recordsData,
        invoicesData,
        techsData,
        customersData,
        analyticsData
      ] = await Promise.all([
        api.getVehicles(),
        api.getServicesCatalog(),
        api.getBays(),
        api.getBookings(),
        api.getRecords(),
        api.getInvoices(),
        api.getTechnicians(),
        api.getCustomers(),
        api.getAnalyticsReport()
      ]);

      setVehicles(vehiclesData || []);
      setServicesCatalog(servicesData || []);
      setBays(baysData || []);
      setBookings(bookingsData || []);
      setRecords(recordsData || []);
      setInvoices(invoicesData || []);
      setTechnicians(techsData || []);
      setCustomers(customersData || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Initial load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Synchronize activeRole with currentUser role permissions
  useEffect(() => {
    if (currentUser?.role && currentUser.role !== 'ADMIN') {
      setActiveRole(currentUser.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'CLIENT');
    }
  }, [currentUser]);

  // Role Switcher Handler (Only accessible if Admin or explicitly allowed)
  const handleSwitchRole = (role) => {
    const userRole = (currentUser?.role || 'CLIENT').toUpperCase();
    if (userRole !== 'ADMIN' && role !== userRole) {
      return; // Non-admin cannot access or switch to unauthorized portals
    }
    setActiveRole(role);
    setActiveTab('portal');
  };

  // User Vehicle Handlers
  const handleVehicleAdded = (newV) => {
    setVehicles(prev => [newV, ...prev]);
  };

  const handleVehicleUpdated = (updatedV) => {
    setVehicles(prev => prev.map(v => v.id === updatedV.id ? updatedV : v));
  };

  const handleVehicleDeleted = (vId) => {
    setVehicles(prev => prev.filter(v => v.id !== vId));
  };

  // Bookings Handlers
  const handleBookingCreated = (newB) => {
    setBookings(prev => [newB, ...prev]);
    api.getRecords().then(setRecords);
  };

  const handleBookingCancelled = (bId) => {
    setBookings(prev => prev.map(b => b.id === bId ? { ...b, status: 'CANCELLED' } : b));
  };

  const handleBookingUpdated = (updatedB) => {
    setBookings(prev => prev.map(b => b.id === updatedB.id ? updatedB : b));
  };

  // Service Catalog Handlers
  const handleServiceAdded = (newS) => {
    setServicesCatalog(prev => [...prev, newS]);
  };

  const handleServiceUpdated = (updatedS) => {
    setServicesCatalog(prev => prev.map(s => s.id === updatedS.id ? updatedS : s));
  };

  // Bay Handlers
  const handleBayAdded = (newB) => {
    setBays(prev => [...prev, newB]);
  };

  const handleBayUpdated = (bayId, isOperational) => {
    setBays(prev => prev.map(b => b.id === bayId ? { ...b, isOperational } : b));
  };

  // Tech & Customer Handlers
  const handleTechnicianAdded = (newT) => {
    setTechnicians(prev => [...prev, newT]);
  };

  const handleTechnicianUpdated = (updatedT) => {
    setTechnicians(prev => prev.map(t => t.id === updatedT.id ? { ...t, ...updatedT } : t));
  };

  const handleCustomerUpdated = (custId, status) => {
    setCustomers(prev => prev.map(c => c.id === custId ? { ...c, status } : c));
  };

  // Record & Invoice Handlers
  const handleRecordUpdated = (updatedR) => {
    setRecords(prev => prev.map(r => r.id === updatedR.id ? updatedR : r));
    api.getInvoices().then(setInvoices);
  };

  const handleInvoicePaid = (paidInv) => {
    setInvoices(prev => prev.map(i => i.id === paidInv.id ? { ...i, ...paidInv } : i));
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveRole(user.role || 'CLIENT');
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setActiveTab('portal');
    loadAllData();
  };

  const handleSignOut = () => {
    localStorage.removeItem('precision_jwt_token');
    localStorage.removeItem('precision_user');
    setIsAuthenticated(false);
    setActiveTab('login');
  };

  if (!isAuthenticated || !currentUser || activeTab === 'login') {
    return (
      <LoginPage
        isModal={false}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Strictly isolate customer datasets by logged-in user ID and email
  const userVehicles = vehicles.filter(v => 
    (currentUser?.userId && v.userId === currentUser.userId) || 
    (currentUser?.id && v.userId === currentUser.id) ||
    (currentUser?.email && v.customerEmail && v.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
  );

  const userVehiclePlates = new Set(userVehicles.map(v => (v.plateNumber || '').toUpperCase()));

  const userBookings = bookings.filter(b => 
    (currentUser?.userId && b.customerId === currentUser.userId) || 
    (currentUser?.id && b.customerId === currentUser.id) ||
    (currentUser?.email && b.customerEmail && b.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
  );

  const userRecords = records.filter(r => 
    (currentUser?.userId && r.customerId === currentUser.userId) || 
    (currentUser?.id && r.customerId === currentUser.id) ||
    (currentUser?.email && r.customerEmail && r.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
    (r.vehiclePlate && userVehiclePlates.has(r.vehiclePlate.toUpperCase()))
  );

  const userInvoices = invoices.filter(i => 
    (currentUser?.userId && i.customerId === currentUser.userId) || 
    (currentUser?.id && i.customerId === currentUser.id) ||
    (currentUser?.email && i.customerEmail && i.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
    (i.vehiclePlate && userVehiclePlates.has(i.vehiclePlate.toUpperCase()))
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased">
      {/* Top Floating Pill Navigation */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchRole}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Login Modal for Account Switching */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <LoginPage
            isModal={true}
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowLoginModal(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-3">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-zinc-400 font-mono">Synchronizing garage operations database...</p>
          </div>
        ) : (
          <>
            {/* Direct Portal Routing Based on Role & Tab */}
            {activeTab === 'portal' && (
              <>
                {/* 👤 USER / CUSTOMER PORTAL */}
                {activeRole === 'CLIENT' && (
                  <UserPortal
                    currentUser={currentUser}
                    vehicles={userVehicles}
                    servicesCatalog={servicesCatalog}
                    bookings={userBookings}
                    records={userRecords}
                    invoices={userInvoices}
                    onVehicleAdded={handleVehicleAdded}
                    onVehicleUpdated={handleVehicleUpdated}
                    onVehicleDeleted={handleVehicleDeleted}
                    onBookingCreated={handleBookingCreated}
                    onBookingCancelled={handleBookingCancelled}
                    onInvoicePaid={handleInvoicePaid}
                    onProfileUpdated={(up) => setCurrentUser(up)}
                  />
                )}

                {/* 👨💼 ADMIN / GARAGE MANAGER PORTAL */}
                {activeRole === 'ADMIN' && (
                  <AdminPortal
                    currentUser={currentUser}
                    customers={customers}
                    vehicles={vehicles}
                    technicians={technicians}
                    services={servicesCatalog}
                    bays={bays}
                    bookings={bookings}
                    records={records}
                    invoices={invoices}
                    analytics={analytics}
                    onCustomerUpdated={handleCustomerUpdated}
                    onTechnicianAdded={handleTechnicianAdded}
                    onTechnicianUpdated={handleTechnicianUpdated}
                    onServiceAdded={handleServiceAdded}
                    onServiceUpdated={handleServiceUpdated}
                    onBayAdded={handleBayAdded}
                    onBayUpdated={handleBayUpdated}
                    onBookingUpdated={handleBookingUpdated}
                    onBookingCancelled={handleBookingCancelled}
                    onInvoicePaid={handleInvoicePaid}
                  />
                )}

                {/* 🧑🔧 TECHNICIAN WORKBENCH */}
                {activeRole === 'TECHNICIAN' && (
                  <TechnicianTab
                    records={records}
                    technicians={technicians}
                    currentUser={currentUser}
                    onRecordUpdated={handleRecordUpdated}
                    onNavigateToBilling={() => setActiveRole('ADMIN')}
                  />
                )}
              </>
            )}

            {activeTab === 'architecture' && (
              <ArchitectureTab />
            )}

            {activeTab === 'review1' && (
              <ReviewDtiTab />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-zinc-800/80 bg-zinc-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            <span className="font-bold text-white tracking-tight">
              PrecisionAuto Care
            </span> &bull; Multi-Role Garage Management &amp; Customer Portal
          </div>
          <div className="font-mono text-[11px] text-zinc-500">
            PS024 &bull; Team PS24-S54-15 &bull; Supabase PostgreSQL
          </div>
        </div>
      </footer>
    </div>
  );
}
