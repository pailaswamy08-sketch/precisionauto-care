import React, { useState } from 'react';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

export default function Navbar({
  activeRole,
  setActiveRole,
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  onOpenLoginModal,
  onSignOut
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    const token = localStorage.getItem('precision_jwt_token') || 'sb-jwt-token';
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rolePills = [
    { id: 'CLIENT', label: '👤 Customer Portal', icon: 'person' },
    { id: 'ADMIN', label: '👨💼 Admin Portal', icon: 'admin_panel_settings' },
    { id: 'TECHNICIAN', label: '🧑🔧 Technician Workbench', icon: 'engineering' },
  ];

  return (
    <header className="sticky top-3 z-50 px-4 max-w-7xl mx-auto w-full mb-6">
      <div className="bg-zinc-950/90 border border-zinc-800/90 backdrop-blur-md rounded-2xl sm:rounded-full px-5 py-2.5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer select-none pl-1" 
          onClick={() => setActiveTab('portal')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
            <Icon name="precision_manufacturing" size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
              <span>PrecisionAuto</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono">
                CARE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              Garage &amp; Fleet Platform
            </p>
          </div>
        </div>

        {/* Floating Active Role Selector Tabs */}
        <div className="flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-xl sm:rounded-full border border-zinc-800/80">
          {rolePills.map((r) => {
            const isSelected = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setActiveRole(r.id);
                  if (onSwitchUser) onSwitchUser(r.id);
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg sm:rounded-full transition-all whitespace-nowrap ${
                  isSelected
                    ? r.id === 'ADMIN'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                      : r.id === 'TECHNICIAN'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-900/30'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-2 pr-1">
          {/* Quick User Switcher Badge */}
          <div 
            onClick={onOpenLoginModal}
            title="Switch User Account / Login"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-full px-3 py-1 cursor-pointer transition-colors"
          >
            <Avatar className="w-5 h-5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[10px] font-bold">
              <AvatarFallback>{currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-zinc-100 leading-none">
                {currentUser?.fullName?.split(' ')[0] || 'Swamy'}
              </div>
              <div className="text-[9px] text-zinc-400 font-mono leading-none mt-0.5">
                {currentUser?.role || activeRole}
              </div>
            </div>

            {/* Copy JWT Token */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyToken();
              }}
              title="Copy Authentication JWT Token"
              className="ml-1 p-0.5 text-zinc-400 hover:text-white inline-flex items-center justify-center rounded"
            >
              <Icon name={copied ? "check" : "key"} size={13} className={copied ? "text-emerald-400" : ""} />
            </button>
          </div>

          {/* Architecture / DTI Review Shortcuts */}
          <button
            onClick={() => setActiveTab('architecture')}
            title="Microservices Architecture (Eureka / Gateway)"
            className={`p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors ${
              activeTab === 'architecture' ? 'bg-zinc-800 text-white' : ''
            }`}
          >
            <Icon name="hub" size={16} />
          </button>

          {/* Log Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            title="Sign Out"
            className="h-8 px-2.5 text-zinc-400 hover:text-red-300 hover:bg-zinc-900 rounded-full"
          >
            <Icon name="logout" size={15} />
          </Button>
        </div>

      </div>
    </header>
  );
}
