import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// StatTile — PRESS editorial style
// Grid-ready stat display with a large Archivo numeral and mono label.
// Variant "dark": ink bg, cream text, accent numeral.
// Variant "light" (default): cream bg, ink text.
// ---------------------------------------------------------------------------

const statTileVariants = cva(
  'flex flex-col justify-between p-5 border-2 border-ink',
  {
    variants: {
      variant: {
        light: 'bg-cream text-ink',
        dark: 'bg-ink text-cream',
        accent: 'bg-accent text-white',
        muted: 'bg-cream-mid text-ink',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  }
);

export interface StatTileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statTileVariants> {
  /** The primary statistic value — rendered as a large numeral */
  value: React.ReactNode;
  /** Short descriptor shown below the value */
  label: string;
  /** Optional trend or sub-value */
  sub?: React.ReactNode;
}

const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  ({ className, variant, value, label, sub, ...props }, ref) => {
    const isDark = variant === 'dark';
    const isAccent = variant === 'accent';

    return (
      <div
        ref={ref}
        className={cn(statTileVariants({ variant }), 'min-h-[110px]', className)}
        {...props}
      >
        {/* Value */}
        <span
          className={cn(
            'font-archivo font-black text-[34px] leading-none tracking-[-0.02em] block',
            isDark && 'text-accent',
            isAccent && 'text-white'
          )}
        >
          {value}
        </span>

        {/* Bottom row: label + optional sub */}
        <div className="flex items-end justify-between gap-2 mt-3">
          <span
            className={cn(
              'font-mono text-[9px] uppercase tracking-[0.08em] leading-tight',
              isDark ? 'text-muted-light' : 'text-muted',
              isAccent && 'text-white/80'
            )}
          >
            {label}
          </span>
          {sub != null && (
            <span
              className={cn(
                'font-mono text-[9px] uppercase tracking-wide leading-tight',
                isDark ? 'text-cream/60' : 'text-muted',
                isAccent && 'text-white/70'
              )}
            >
              {sub}
            </span>
          )}
        </div>
      </div>
    );
  }
);
StatTile.displayName = 'StatTile';

// ---------------------------------------------------------------------------
// StatTileGrid — convenience wrapper for a responsive grid of tiles.
// Tiles share 2px borders; adjacent tiles collapse their shared border via
// negative margin so the overall frame stays clean.
// ---------------------------------------------------------------------------
const StatTileGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { cols?: 2 | 3 | 4 | 5 }
>(({ className, cols = 4, ...props }, ref) => {
  const colClass: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-5',
  };

  return (
    <div
      ref={ref}
      className={cn(
        // Outer border on the wrapper; inner tiles use negative margin to
        // collapse duplicate borders into hairlines.
        'grid border-2 border-ink',
        colClass[cols] ?? colClass[4],
        // Each child tile's right/bottom border acts as the divider
        '[&>*]:border-r-0 [&>*]:border-b-0 [&>*]:border-t-0 [&>*]:border-l-0',
        '[&>*:not(:nth-last-child(-n+1))]:border-b [&>*]:border-r',
        className
      )}
      {...props}
    />
  );
});
StatTileGrid.displayName = 'StatTileGrid';

export { StatTile, StatTileGrid };
