import React, { useState } from 'react';
import clsx from 'clsx';

const Tooltip = ({ label, children, side = 'top' }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open ? (
        <div
          className={clsx(
            'absolute z-30 whitespace-nowrap rounded-md bg-slate-900 text-xs text-white px-2 py-1 shadow-lg border border-white/10',
            side === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : '',
            side === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : '',
            side === 'right' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : '',
            side === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' : ''
          )}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

export default Tooltip;

