import React, { useState } from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

export default function Navbar({ activeTab, setActiveTab, currentUser, onSwitchPersona, onOpenLoginModal, onSignOut }) {
  const [copied, setCopied] = useState(false);

  const personas = [
    { name: "Alex Mercer", email: "alex@fleetcorp.com", role: "CLIENT", title: "Fleet Dispatcher" },
    { name: "Johnathan Miller", email: "tech.john@precisionauto.com", role: "TECHNICIAN", title: "Lead Technician" },
    { name: "Robert Vance", email: "admin@precisionauto.com", role: "ADMIN", title: "Garage Director" },
  ];

  const handleCopyToken = () => {
    const token = localStorage.getItem('precision_jwt_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
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
    { id: 'review1', label: 'Review 1 & DTI', iconName: 'verified' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#11091b] border-b border-[#271638]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-[#7c1782] flex items-center justify-center border border-[#9b24a3]">
              <Icon name="precision_manufacturing" size={20} />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight">
                PrecisionAuto Care
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Port 8080 &bull; PS024
              </p>
            </div>
          </div>

          {/* Persona Switcher & Controls */}
          <div className="flex items-center space-x-3">
            {/* Persona Switch Buttons */}
            <div className="hidden md:flex items-center bg-[#170c24] p-1 rounded-lg border border-[#2c1740] space-x-1">
              <span className="text-xs text-zinc-400 px-2 font-medium">Role:</span>
              {personas.map((p) => {
                const isActive = currentUser?.email === p.email;
                return (
                  <Button
                    key={p.email}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onSwitchPersona(p)}
                    className={`h-7 px-2.5 text-xs ${isActive ? 'bg-[#7c1782] text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {p.role}
                  </Button>
                );
              })}
            </div>

            {/* Current User Pill */}
            <div 
              onClick={onOpenLoginModal}
              title="Switch Account"
              className="flex items-center gap-2 bg-[#170c24] hover:bg-[#231336] border border-[#2c1740] rounded-lg px-3 py-1.5 cursor-pointer transition-colors"
            >
              <Avatar className="w-6 h-6 bg-[#271638] text-white text-xs">
                <AvatarFallback>{currentUser?.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium text-white">
                  {currentUser?.fullName?.split(' ')[0] || 'User'}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">{currentUser?.role || 'CLIENT'}</div>
              </div>
              
              {/* Copy JWT */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyToken();
                }}
                title="Copy JWT Token"
                className="ml-1 p-1 text-zinc-400 hover:text-white inline-flex items-center justify-center"
              >
                <Icon name={copied ? "check" : "key"} size={14} />
              </button>
            </div>

            {/* Log Out Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={onSignOut}
              className="h-8 gap-1.5"
            >
              <Icon name="logout" size={14} />
              <span>Log Out</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-2 overflow-x-auto py-2 border-t border-[#221232]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`h-8 px-3 gap-1.5 text-xs font-medium rounded-md ${
                  isActive ? 'bg-[#7c1782] text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon name={item.iconName} size={15} />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
