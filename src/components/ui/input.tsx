import * as React from 'react';
import { cn } from '@/lib/ui';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400', className)}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
