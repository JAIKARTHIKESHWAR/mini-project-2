import React from 'react';
import clsx from 'clsx';

const Switch = ({ checked, onChange, className, ...props }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange?.(!checked)}
    className={clsx(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scent-amber',
      checked ? 'bg-scent-amber' : 'bg-slate-600',
      className
    )}
    {...props}
  >
    <span
      className={clsx(
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
        checked ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
);

export default Switch;

