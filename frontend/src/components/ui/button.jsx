import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-[#7c1782] text-white hover:bg-[#8f1e96] border border-[#9b24a3]",
    gradient: "bg-[#7c1782] text-white hover:bg-[#8f1e96] border border-[#9b24a3]",
    primary: "bg-[#7c1782] text-white hover:bg-[#8f1e96] border border-[#9b24a3]",
    destructive: "bg-red-900/60 text-white hover:bg-red-800 border border-red-700/50",
    outline: "border border-[#321c47] bg-[#160d21] text-zinc-100 hover:bg-[#231534] hover:text-white",
    secondary: "bg-[#231534] text-zinc-100 hover:bg-[#321c47] border border-[#3e215e]",
    ghost: "text-zinc-300 hover:text-white hover:bg-[#1e102e]",
    link: "text-purple-300 underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-lg px-5 text-sm",
    icon: "h-9 w-9",
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
