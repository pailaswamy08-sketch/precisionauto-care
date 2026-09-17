import React, { useState } from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenLoginModal, onSignOut }) {
  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    const token = localStorage.getItem('precision_jwt_token') || 'sb-jwt-token';
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
    { id: 'booking', label: 'Bay Booking', iconName: 'calendar_month' },
    { id: 'technician', label: 'Technician', iconName: 'build' },
    { id: 'history', label: 'Fleet History', iconName: 'directions_car' },
    { id: 'billing', label: 'Invoices', iconName: 'receipt_long' },
    { id: 'architecture', label: 'Architecture', iconName: 'hub' },
    { id: 'review1', label: 'Review & DTI', iconName: 'verified' },
  ];

  return (
    <header className="sticky top-3 z-50 px-4 max-w-7xl mx-auto w-full mb-6">
      <div className="bg-zinc-950/90 border border-zinc-800/90 backdrop-blur-md rounded-full px-5 py-2.5 shadow-2xl flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer select-none pl-1" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-8 h-8 rounded-md bg-zinc-850 flex items-center justify-center border border-zinc-700">
            <Icon name="precision_manufacturing" size={18} />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white tracking-tight uppercase">
              PrecisionAuto
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Fleet Operations
            </p>
          </div>
        </div>

        {/* Floating Navigation Pill Items */}
        <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-850/80'
                }`}
              >
                <Icon name={item.iconName} size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-2 pr-1">
          {/* User Badge */}
          <div 
            onClick={onOpenLoginModal}
            title="Switch User / Account"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-full px-3 py-1 cursor-pointer transition-colors"
          >
            <Avatar className="w-5 h-5 bg-zinc-800 text-white text-[10px]">
              <AvatarFallback>{currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <div className="text-xs font-medium text-zinc-100 leading-none">
                {currentUser?.fullName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-[9px] text-zinc-400 font-mono leading-none mt-0.5">
                {currentUser?.role || 'CLIENT'}
              </div>
            </div>

            {/* Copy JWT Token */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyToken();
              }}
              title="Copy Authentication Token"
              className="ml-1 p-0.5 text-zinc-400 hover:text-white inline-flex items-center justify-center rounded"
            >
              <Icon name={copied ? "check" : "key"} size={13} />
            </button>
          </div>

          {/* Log Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            title="Sign Out"
            className="h-8 px-2.5 text-zinc-400 hover:text-red-300 hover:bg-zinc-900 rounded-md"
          >
            <Icon name="logout" size={15} />
          </Button>
        </div>

      </div>
    </header>
  );
}
