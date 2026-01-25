import React from 'react';
import clsx from 'clsx';

const Badge = ({ children, className, variant = 'default' }) => {
  const styles =
    variant === 'outline'
      ? 'border border-white/20 text-white bg-transparent'
      : 'bg-slate-800/80 text-scent-amber border border-white/10';

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        styles,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;

