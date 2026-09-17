import React from 'react';
import { cn } from '../../lib/utils';

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [active, setActive] = React.useState(defaultValue || '');
  const currentValue = value !== undefined ? value : active;
  const handleChange = (val) => {
    if (value === undefined) setActive(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child, { currentValue, onValueChange: handleChange });
      })}
    </div>
  );
}

export function TabsList({ className, children, currentValue, onValueChange }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 p-1 text-zinc-400 border border-zinc-800",
        className
      )}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child, { currentValue, onValueChange });
      })}
    </div>
  );
}

export function TabsTrigger({ value, className, children, currentValue, onValueChange, ...props }) {
  const isSelected = currentValue === value;
  return (
    <button
      type="button"
      onClick={() => onValueChange && onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-zinc-800 text-white shadow-sm font-semibold"
          : "text-zinc-400 hover:text-white hover:bg-zinc-850",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, currentValue }) {
  if (currentValue !== value) return null;
  return (
    <div
      className={cn(
        "outline-none transition-opacity duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}
