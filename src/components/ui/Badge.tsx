import { cn } from '../../utils/cn';

export { cn };

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const VARYANTLAR: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-white',
  outline: 'border-border text-foreground'
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'span'> & {variant?: BadgeVariant;}) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        VARYANTLAR[variant],
        className
      )}
      {...props} />);


}