import * as React from 'react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, checked, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Combine refs so both the forwarded ref and our local ref work
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  
  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        ref={inputRef}
        checked={checked}
        className={cn(
          'h-8 w-8 rounded-lg border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-all',
          'hover:border-indigo-400 focus:border-indigo-500',
          checked && 'bg-indigo-600 border-indigo-600',
          className
        )}
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
          outline: 'none',
        }}
        {...props}
      />
      {checked && (
        <svg
          className="absolute w-5 h-5 left-1.5 top-1.5 text-white pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
