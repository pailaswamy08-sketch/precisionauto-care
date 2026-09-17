import React from 'react';
import { cn } from '../../lib/utils';

export function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-muted/60 text-foreground items-center justify-center font-bold text-xs shadow-inner",
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
      className={cn("flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c1782]/40 to-[#c63f7b]/30 text-pink-200 font-bold", className)}
      {...props}
    >
      {children}
    </span>
  );
}
