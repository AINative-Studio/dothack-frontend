import * as React from 'react';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Input — PRESS editorial style
// Sharp corners, 2px ink border, input-bg fill, Inter font.
// Includes an optional Label sub-component for the mono uppercase label.
// ---------------------------------------------------------------------------

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted leading-none"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-10 w-full bg-input-bg border-2 border-ink px-3 py-2',
            'font-inter text-sm text-ink leading-none',
            'placeholder:text-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink',
            'disabled:cursor-not-allowed disabled:opacity-40',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

// Standalone label helper for use outside Input
const InputLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'font-mono text-[9px] uppercase tracking-[0.08em] text-muted leading-none mb-1.5 block',
      className
    )}
    {...props}
  />
));
InputLabel.displayName = 'InputLabel';

export { Input, InputLabel };
