import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-medium transition-colors select-none";

  const variants = {
    default: "bg-zinc-800 text-zinc-100 border border-zinc-700/80",
    secondary: "bg-zinc-900 text-zinc-300 border border-zinc-800",
    outline: "border border-zinc-700 text-zinc-300 bg-transparent",
    destructive: "bg-red-950/60 text-red-200 border border-red-800/60",
    success: "bg-emerald-950/60 text-emerald-200 border border-emerald-800/60",
    warning: "bg-amber-950/60 text-amber-200 border border-amber-800/60",
    info: "bg-zinc-800 text-white border border-zinc-600",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant] || variants.default, className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
