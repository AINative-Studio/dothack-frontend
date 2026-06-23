import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base: sharp corners, uppercase, mono/archivo display, tight tracking, smooth transitions
  'inline-flex items-center justify-center whitespace-nowrap font-archivo font-extrabold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        // Primary — orange fill
        default:
          'bg-accent text-white border-2 border-accent hover:bg-[#e03a14] hover:border-[#e03a14]',
        // Dark — ink fill
        dark:
          'bg-ink text-cream border-2 border-ink hover:bg-[#2a2720] hover:border-[#2a2720]',
        // Ghost / Outline — transparent with ink border
        outline:
          'bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-cream',
        // Ghost — no border, subtle hover
        ghost:
          'bg-transparent text-ink border-2 border-transparent hover:bg-cream-mid hover:border-cream-mid',
        // Destructive — danger border + text, no fill
        destructive:
          'bg-transparent text-danger border-[1.5px] border-danger hover:bg-danger hover:text-white',
        // Legacy aliases for compatibility with existing pages
        secondary:
          'bg-cream-mid text-ink border-2 border-ink hover:bg-cream-dark',
        link: 'text-accent underline-offset-4 hover:underline border-2 border-transparent',
      },
      size: {
        default: 'h-11 px-6 py-3 text-sm',
        sm: 'h-8 px-3 py-1.5 text-[10px] border-[1.5px]',
        lg: 'h-13 px-8 py-4 text-base',
        icon: 'h-10 w-10 text-sm',
        chip: 'h-7 px-3 py-1 text-[10px] border-[1.5px] tracking-widest',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
