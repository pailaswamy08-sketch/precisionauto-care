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
        "inline-flex h-11 items-center justify-center rounded-2xl bg-muted/60 p-1 text-muted-foreground border border-border/60 backdrop-blur-md",
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
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-gradient-to-r from-[#7c1782] via-[#c63f7b] to-[#f4ad97] text-white shadow-md shadow-pink-500/25 font-bold"
          : "text-muted-foreground hover:text-foreground hover:bg-card/40",
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
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fadeIn",
        className
      )}
    >
      {children}
    </div>
  );
}
