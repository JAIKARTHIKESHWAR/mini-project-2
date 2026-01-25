import React from 'react';
import clsx from 'clsx';

const Sheet = ({ open, onClose, children, side = 'right', className }) => {
  if (!open) return null;

  const sideClass = {
    right: 'right-0 translate-x-0',
    left: 'left-0 translate-x-0',
  }[side];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={clsx(
          'relative ml-auto h-full w-full max-w-md bg-slate-900/95 border-l border-white/10 shadow-2xl transform transition-transform duration-300',
          sideClass,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Sheet;

