import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardTab from './components/DashboardTab';
import BookingTab from './components/BookingTab';
import HistoryTab from './components/HistoryTab';
import TechnicianTab from './components/TechnicianTab';
import BillingTab from './components/BillingTab';
import ArchitectureTab from './components/ArchitectureTab';
import ReviewDtiTab from './components/ReviewDtiTab';
import LoginPage from './components/LoginPage';
import { api } from './services/api';
import { Icon } from './components/ui/icon';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';

export default function App() {
  const normalizeTab = (hashStr) => {
    const raw = (hashStr || '').replace('#', '').replace('/', '').trim().toLowerCase();
    if (!raw || raw === 'dashboard') return 'dashboard';
    if (raw === 'login') return 'login';
    if (raw === 'booking' || raw === 'bookings') return 'booking';
    if (raw === 'technician' || raw === 'tech') return 'technician';
    if (raw === 'history' || raw === 'records') return 'history';
    if (raw === 'billing' || raw === 'invoices') return 'billing';
    if (raw === 'architecture' || raw === 'arch' || raw === 'eureka') return 'architecture';
    if (raw === 'review1' || raw === 'review' || raw === 'dti') return 'review1';
    return '404';
  };

  const [activeTab, setActiveTabState] = useState(() => {
    const init = normalizeTab(window.location.hash || window.location.pathname);
    return init === '404' ? 'dashboard' : init;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('precision_jwt_token');
  });

  const setActiveTab = (tab) => {
    const normalized = normalizeTab(tab);
    setActiveTabState(normalized);
    window.location.hash = normalized;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const normalized = normalizeTab(window.location.hash);
      setActiveTabState(normalized);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('precision_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      userId: 4,
      email: 'alex@fleetcorp.com',
      fullName: 'Alex Mercer',
      role: 'CLIENT',
      organization: 'FleetCorp Express'
    };
  });

  const [bays, setBays] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [baysData, bookingsData, recordsData, invoicesData, techsData, statsData] = await Promise.all([
        api.getBays(),
        api.getBookings(),
        api.getRecords(),
        api.getInvoices(),
        api.getTechnicians(),
        api.getBillingStats()
      ]);

      setBays(baysData || []);
      setBookings(bookingsData || []);
      setRecords(recordsData || []);
      setInvoices(invoicesData || []);
      setTechnicians(techsData || []);
      setStats(statsData);
    } catch (err) {
      console.error("Initial load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSwitchPersona = async (persona) => {
    try {
      const password = persona.role === 'ADMIN' ? 'Admin@123' : persona.role === 'TECHNICIAN' ? 'Tech@123' : 'Client@123';
      const user = await api.login(persona.email, password);
      setCurrentUser(user);
    } catch (err) {
      console.warn("Persona switch fallback:", err.message);
      setCurrentUser({
        userId: 1,
        email: persona.email,
        fullName: persona.name,
        role: persona.role,
        organization: persona.title
      });
    }
  };

  const handleBookingCreated = (newBooking) => {
    setBookings(prev => [newBooking, ...prev]);
    api.getRecords().then(setRecords);
  };

  const handleBookingCancelled = (bookingId) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
  };

  const handleRecordUpdated = (updatedRecord) => {
    setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    api.getInvoices().then(setInvoices);
  };

  const handleInvoicePaid = (paidInvoice) => {
    setInvoices(prev => prev.map(i => i.id === paidInvoice.id ? paidInvoice : i));
  };

  const handleSelectInvoice = (invoiceNumber) => {
    setActiveTab('billing');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setActiveTabState('dashboard');
    window.location.hash = 'dashboard';
    loadAllData();
  };

  const handleSignOut = () => {
    localStorage.removeItem('precision_jwt_token');
    localStorage.removeItem('precision_user');
    setIsAuthenticated(false);
    setActiveTabState('login');
    window.location.hash = 'login';
  };

  if (!isAuthenticated || activeTab === 'login') {
    return (
      <LoginPage
        isModal={false}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0712] text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchPersona={handleSwitchPersona}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginPage
          isModal={true}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-zinc-400 font-mono">Syncing with PrecisionAuto API Gateway...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                stats={stats}
                bays={bays}
                bookings={bookings}
                records={records}
                invoices={invoices}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'booking' && (
              <BookingTab
                bays={bays}
                bookings={bookings}
                currentUser={currentUser}
                onBookingCreated={handleBookingCreated}
                onBookingCancelled={handleBookingCancelled}
              />
            )}

            {activeTab === 'technician' && (
              <TechnicianTab
                records={records}
                technicians={technicians}
                onRecordUpdated={handleRecordUpdated}
                onNavigateToBilling={handleSelectInvoice}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab
                records={records}
                onSelectInvoice={handleSelectInvoice}
              />
            )}

            {activeTab === 'billing' && (
              <BillingTab
                invoices={invoices}
                onInvoicePaid={handleInvoicePaid}
              />
            )}

            {activeTab === 'architecture' && (
              <ArchitectureTab />
            )}

            {activeTab === 'review1' && (
              <ReviewDtiTab />
            )}

            {activeTab === '404' && (
              <Card className="p-8 text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-lg bg-[#271638] flex items-center justify-center mx-auto">
                  <Icon name="warning" size={24} />
                </div>
                <h2 className="text-lg font-bold text-white">Page Not Found</h2>
                <p className="text-xs text-zinc-400">
                  The requested platform section does not exist.
                </p>
                <Button
                  onClick={() => setActiveTab('dashboard')}
                  className="gap-2 text-xs"
                >
                  <Icon name="home" size={16} /> Return to Dashboard
                </Button>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#221232] bg-[#0f0817] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            <span className="font-semibold text-white">
              PrecisionAuto Care Platform
            </span> &bull; PS024 Automotive Fleet Maintenance
          </div>
          <div className="font-mono text-[11px] text-zinc-400">
            24SDCS03R &bull; Team PS24-S54-15 &bull; Spring Boot + Eureka + shadcn/ui
          </div>
        </div>
      </footer>
    </div>
  );
}
