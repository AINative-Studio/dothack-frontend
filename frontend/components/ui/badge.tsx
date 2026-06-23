import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Status badge variants (hackathon lifecycle states)
// ---------------------------------------------------------------------------
const badgeVariants = cva(
  'inline-flex items-center font-mono text-[9px] uppercase tracking-[0.04em] px-2 py-0.5 leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        // Status badges
        draft:
          'bg-cream border-[1.5px] border-ink text-ink',
        live:
          'bg-accent border-[1.5px] border-accent text-white',
        completed:
          'bg-ink border-[1.5px] border-ink text-cream',
        judging:
          'bg-warning-bg border-[1.5px] border-ink text-ink',
        upcoming:
          'bg-cream-mid border-[1.5px] border-ink text-muted',

        // Role badges
        organizer:
          'bg-ink border-[1.5px] border-ink text-cream',
        builder:
          'bg-accent border-[1.5px] border-accent text-white',
        judge:
          'bg-[#f0ebe0] border-[1.5px] border-muted text-muted',
        mentor:
          'bg-success border-[1.5px] border-ink text-ink',

        // Generic / legacy aliases
        default:
          'bg-cream border-[1.5px] border-ink text-ink',
        secondary:
          'bg-cream-mid border-[1.5px] border-ink text-ink',
        destructive:
          'bg-danger border-[1.5px] border-danger text-white',
        outline:
          'bg-transparent border-[1.5px] border-ink text-ink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
