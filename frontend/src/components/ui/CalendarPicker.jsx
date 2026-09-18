import React, { useState } from 'react';
import { Icon } from './icon';
import { Button } from './button';
import { Badge } from './badge';

export default function CalendarPicker({ selectedDate, onSelectDate, minDate }) {
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const initialDate = parseDate(selectedDate);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minD = minDate ? parseDate(minDate) : today;
  minD.setHours(0, 0, 0, 0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Quick Preset Options
  const getQuickDates = () => {
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      let label = "";
      if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";
      else label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      dates.push({ iso, label, dayName: d.toLocaleDateString('en-US', { weekday: 'short' }) });
    }
    return dates;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar grid matrix
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Padding days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      dayNumber: prevMonthDays - i,
      isCurrentMonth: false,
      dateObj: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateObj: new Date(currentYear, currentMonth, d)
    });
  }

  // Padding days for next month to fill grid
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells && calendarDays.length < 35; d++) {
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateObj: new Date(currentYear, currentMonth + 1, d)
    });
  }

  const formatIso = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const quickDates = getQuickDates();

  return (
    <div className="space-y-4">
      
      {/* Quick Select Preset Date Chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
          Quick Date Selector
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {quickDates.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => onSelectDate(item.iso)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-md shadow-emerald-900/30'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold">{item.label}</div>
                <div className="text-[10px] font-mono opacity-80 mt-0.5">{item.iso}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Month & Day Calendar Widget */}
      <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
        {/* Month Header & Controls */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Icon name="calendar_month" size={16} className="text-emerald-400" />
            <h4 className="text-xs font-bold text-white tracking-wide">
              {monthNames[currentMonth]} {currentYear}
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <Icon name="chevron_left" size={18} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <Icon name="chevron_right" size={18} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500 uppercase">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, idx) => {
            const iso = formatIso(cell.dateObj);
            const isSelected = selectedDate === iso;
            const isPast = cell.dateObj < minD;
            const isToday = cell.dateObj.getTime() === today.getTime();

            return (
              <button
                key={idx}
                type="button"
                disabled={isPast || !cell.isCurrentMonth}
                onClick={() => onSelectDate(iso)}
                className={`h-9 rounded-xl text-xs font-mono font-semibold transition-all relative flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 font-black shadow-md shadow-emerald-900/40 z-10'
                    : isPast || !cell.isCurrentMonth
                    ? 'text-zinc-700 cursor-not-allowed opacity-30'
                    : isToday
                    ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/40 hover:bg-zinc-850'
                    : 'text-zinc-200 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span>{cell.dayNumber}</span>
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-emerald-400 absolute bottom-1"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Selected Notice */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-400">Selected Service Date:</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-900/40">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

    </div>
  );
}
