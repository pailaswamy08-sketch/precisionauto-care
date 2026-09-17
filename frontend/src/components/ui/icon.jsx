import React from 'react';
import { cn } from '../../lib/utils';

export function Icon({ name, className = '', size = 18, fill = 1, ...props }) {
  return (
    <span
      className={cn("material-symbols-rounded select-none inline-flex items-center justify-center shrink-0 text-white", className)}
      style={{
        fontSize: `${size}px`,
        color: '#ffffff',
        fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${Math.min(48, Math.max(18, size))}`,
        ...props.style
      }}
      {...props}
    >
      {name}
    </span>
  );
}

export default Icon;
