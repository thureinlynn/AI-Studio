import React from 'react';

interface GoogleVerifiedBadgeProps {
  className?: string;
}

export const GoogleVerifiedBadge: React.FC<GoogleVerifiedBadgeProps> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-200 leading-none shrink-0 ${className}`}
      title="Google Verified Account"
    >
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.3 0 6.08-1.09 8.11-2.95l-3.88-3.05c-1.1.74-2.51 1.18-4.23 1.18-3.25 0-6.01-2.2-7-5.16H1.01v3.14C3.05 21.2 7.21 24 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5 14.02c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.16H1.01C.37 7.45 0 8.9 0 10.45c0 1.55.37 3 .99 4.29l4.01-3.14v2.42Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.21 0 3.05 2.8 1.01 6.86l3.99 3.1C5.99 6.95 8.75 4.75 12 4.75Z"
        />
      </svg>
      <span>Verified</span>
    </span>
  );
};
