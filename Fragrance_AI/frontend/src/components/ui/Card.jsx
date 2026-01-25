import React from 'react';
import clsx from 'clsx';

const Card = ({ className, children, as = 'div', ...props }) => {
  const Component = as;
  return (
    <Component
      className={clsx(
        'glass-card',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ className, children }) => (
  <div className={clsx('px-6 pt-5', className)}>{children}</div>
);

export const CardContent = ({ className, children }) => (
  <div className={clsx('px-6 pb-6', className)}>{children}</div>
);

export const CardTitle = ({ className, children }) => (
  <h3 className={clsx('text-lg font-semibold text-white', className)}>{children}</h3>
);

export default Card;

