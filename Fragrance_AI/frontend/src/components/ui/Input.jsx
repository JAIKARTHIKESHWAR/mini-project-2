import React from 'react';
import clsx from 'clsx';

const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={clsx(
      'w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scent-amber focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export default Input;

