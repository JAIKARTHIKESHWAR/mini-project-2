import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import Button from './Button';

const Dialog = ({ open, onOpenChange, children, className }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange?.(false);
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Dialog Content */}
      <div
        className={clsx(
          'relative z-50 w-full max-w-2xl max-h-[90vh] overflow-hidden',
          'bg-card border border-border rounded-lg shadow-lg',
          'transform transition-all',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className, onClose }) => {
  return (
    <div className={clsx('flex flex-col', className)}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children, className }) => {
  return (
    <div className={clsx('flex flex-col space-y-1.5 px-6 pt-6', className)}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ children, className }) => {
  return (
    <h2 className={clsx('text-lg font-semibold leading-none tracking-tight text-foreground font-semibold', className)}>
      {children}
    </h2>
  );
};

export const DialogDescription = ({ children, className }) => {
  return (
    <p className={clsx('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
};

export const DialogClose = ({ onClose, className }) => {
  return (
    <button
      onClick={onClose}
      className={clsx(
        'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity',
        'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
};

export default Dialog;

