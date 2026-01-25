import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export const DropdownMenu = ({ trigger, children, align = 'end' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer select-none">
        {trigger}
      </div>
      {open ? (
        <div
          className={clsx(
            'absolute z-40 mt-2 min-w-[220px] rounded-xl bg-slate-900/95 text-white border border-white/10 shadow-2xl backdrop-blur-md',
            align === 'end' ? 'right-0' : 'left-0'
          )}
        >
          {React.Children.map(children, (child) =>
            React.cloneElement(child, { onSelect: () => setOpen(false) })
          )}
        </div>
      ) : null}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, onSelect }) => (
  <button
    onClick={(e) => {
      onClick?.(e);
      onSelect?.();
    }}
    className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
  >
    {children}
  </button>
);

export const DropdownMenuLabel = ({ children }) => (
  <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-[0.08em] text-slate-400">
    {children}
  </div>
);

export const DropdownMenuSeparator = () => (
  <div className="h-px w-full bg-white/10 my-1" aria-hidden />
);

export default DropdownMenu;

