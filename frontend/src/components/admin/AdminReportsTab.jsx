import React, { useState } from 'react';
import { Icon } from '../ui/icon';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export default function AdminReportsTab({ analytics, technicians = [] }) {
  const [reportPeriod, setReportPeriod] = useState('MONTHLY');

  const totalServices = reportPeriod === 'MONTHLY' ? 250 : 25;
  const completedServices = reportPeriod === 'MONTHLY' ? 220 : 18;
  const cancelledServices = reportPeriod === 'MONTHLY' ? 30 : 3;
  const totalRevenue = reportPeriod === 'MONTHLY' ? 580000 : 45000;

  const popularServices = [
    { name: "Oil Change", count: 110, revenue: 194700, share: 44 },
    { name: "Brake Service", count: 65, revenue: 306800, share: 26 },
    { name: "AC Service", count: 40, revenue: 118000, share: 16 },
    { name: "Engine Service", count: 20, revenue: 188800, share: 8 },
    { name: "Wheel Alignment", count: 15, revenue: 17700, share: 6 }
  ];

  const technicianWorkload = [
    { name: "Ravi Kumar", specialization: "Engine & Diagnostics", active: 3, completed: 85, efficiency: "98%" },
    { name: "Kiran Varma", specialization: "Brake & Suspension", active: 2, completed: 68, efficiency: "95%" },
    { name: "Suresh Babu", specialization: "AC & Electrical", active: 1, completed: 42, efficiency: "92%" },
    { name: "Anand Sharma", specialization: "Chassis & Wheel", active: 2, completed: 25, efficiency: "94%" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Icon name="analytics" size={22} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Executive Reports &amp; Analytics</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Automobile workshop performance metrics &bull; Revenue trends, technician workload, and service popularity.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setReportPeriod('DAILY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              reportPeriod === 'DAILY' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today's Report
          </button>
          <button
            onClick={() => setReportPeriod('MONTHLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              reportPeriod === 'MONTHLY' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly Report (September 2026)
          </button>
        </div>
      </div>

      {/* 4 Big Overview Metrics (Matches prompt: Total Services: 250, Completed: 220, Cancelled: 30, Total Revenue: ₹5,80,000) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <Card className="p-5 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <span className="text-xs font-semibold text-zinc-400 font-sans">Total Services</span>
          <div className="text-3xl font-extrabold text-white">{totalServices}</div>
          <div className="text-[10px] text-zinc-500 font-sans">Bookings processed</div>
        </Card>

        <Card className="p-5 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <span className="text-xs font-semibold text-zinc-400 font-sans">Completed Jobs</span>
          <div className="text-3xl font-extrabold text-emerald-400">{completedServices}</div>
          <div className="text-[10px] text-emerald-500 font-sans">88% Completion Rate</div>
        </Card>

        <Card className="p-5 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <span className="text-xs font-semibold text-zinc-400 font-sans">Cancelled Services</span>
          <div className="text-3xl font-extrabold text-red-400">{cancelledServices}</div>
          <div className="text-[10px] text-red-400 font-sans">12% Customer Drop</div>
        </Card>

        <Card className="p-5 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <span className="text-xs font-semibold text-zinc-400 font-sans">Total Revenue</span>
          <div className="text-3xl font-extrabold text-emerald-400">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-zinc-400 font-sans">Includes 18% GST collection</div>
        </Card>
      </div>

      {/* 2-Column Split: Popular Services & Technician Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Most Popular Services */}
        <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Icon name="bar_chart" size={16} className="text-emerald-400" /> Most Requested Services
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Volume &amp; Revenue</span>
          </div>

          <div className="space-y-4">
            {popularServices.map((s, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-white font-sans">{s.name}</span>
                  <div className="space-x-3 text-right">
                    <span className="text-zinc-400">{s.count} Jobs</span>
                    <span className="text-emerald-400 font-bold">₹{s.revenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                    style={{ width: `${s.share * 2}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Technician Workload Distribution */}
        <Card className="p-6 bg-zinc-900/80 border-zinc-800 rounded-2xl space-y-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Icon name="engineering" size={16} className="text-amber-400" /> Technician Workload &amp; Efficiency
            </h3>
            <span className="text-xs text-zinc-400 font-mono">Workshop Productivity</span>
          </div>

          <div className="space-y-3">
            {technicianWorkload.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{t.name}</span>
                    <div className="text-[10px] text-zinc-400 font-mono">{t.specialization}</div>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono border-emerald-800/60 text-emerald-400">
                    {t.efficiency} Efficiency
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono pt-1 border-t border-zinc-800/60">
                  <div>
                    <span className="text-zinc-500 block uppercase font-sans text-[9px]">Active Queue</span>
                    <span className="font-bold text-amber-400">{t.active} Jobs</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase font-sans text-[9px]">Completed</span>
                    <span className="font-bold text-emerald-400">{t.completed} Jobs</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
