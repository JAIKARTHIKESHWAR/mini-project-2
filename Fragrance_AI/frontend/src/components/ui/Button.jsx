import React from 'react';
import clsx from 'clsx';

const variants = {
  default:
    'bg-scent-amber text-slate-900 hover:bg-scent-amber/90 shadow-lg shadow-amber-500/20',
  secondary:
    'bg-slate-800/80 text-slate-100 border border-white/10 hover:bg-slate-700/70',
  outline:
    'border border-white/20 text-white hover:bg-white/10 bg-transparent shadow-none',
  ghost: 'text-white hover:bg-white/10',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scent-amber focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:pointer-events-none gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = 'Button';

export default Button;

