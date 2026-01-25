import React from 'react';
import clsx from 'clsx';

const Avatar = ({ src, alt, fallback, className, size = 'md' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-full bg-slate-800 text-white inline-flex items-center justify-center border border-white/10',
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
      {!src ? <span>{fallback || '?'}</span> : null}
    </div>
  );
};

export default Avatar;

