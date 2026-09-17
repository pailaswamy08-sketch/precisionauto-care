import React from 'react';
import { cn } from '../../lib/utils';

export function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-850 text-white items-center justify-center font-semibold text-xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarFallback({ className, children, ...props }) {
  return (
    <span
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-zinc-100 font-semibold text-xs", className)}
      {...props}
    >
      {children}
    </span>
  );
}
