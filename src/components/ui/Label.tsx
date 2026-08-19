import React from 'react';
import { cn } from '../../utils/cn';

export { cn };

export function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('text-sm font-medium leading-none text-foreground', className)}
      {...props} />);


}