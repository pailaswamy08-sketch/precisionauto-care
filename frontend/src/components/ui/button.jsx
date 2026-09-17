import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 border border-zinc-200 font-semibold shadow-sm",
    primary: "bg-white text-black hover:bg-zinc-200 border border-white font-semibold shadow-sm",
    gradient: "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 border border-zinc-200 font-semibold shadow-sm",
    destructive: "bg-zinc-900 text-red-400 hover:bg-red-950/50 border border-red-900/60 font-medium",
    outline: "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white font-medium",
    secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/60 font-medium",
    ghost: "text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-medium",
    link: "text-zinc-200 underline-offset-4 hover:underline font-medium",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-5 text-sm",
    icon: "h-9 w-9 rounded-md",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant] || variants.default, sizes[size] || sizes.default, className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
