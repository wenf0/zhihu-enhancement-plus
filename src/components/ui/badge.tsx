import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/ui';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600', className)} {...props} />
  );
}
