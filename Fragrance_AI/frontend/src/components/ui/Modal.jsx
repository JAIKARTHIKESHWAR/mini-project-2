import React from 'react';
import clsx from 'clsx';
import Button from './Button';

const Modal = ({ open, onClose, title, children, footer, className }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={clsx(
          'w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl',
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="px-6 py-4 text-slate-100">{children}</div>
        {footer ? <div className="px-6 py-4 border-t border-white/10">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;

