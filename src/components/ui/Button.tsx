import { cn } from '../../utils/cn';

export { cn };

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'xs' | 'sm' | 'default' | 'lg' | 'icon' | 'icon-sm' | 'icon-xs' | 'icon-lg';

const VARYANTLAR: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-background text-foreground hover:bg-muted',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-white hover:bg-destructive/90',
  link: 'text-primary underline-offset-4 hover:underline'
};

const BOYUTLAR: Record<ButtonSize, string> = {
  xs: 'h-6 gap-1 rounded-md px-2 text-xs',
  sm: 'h-7 gap-1.5 rounded-md px-2.5 text-xs',
  default: 'h-8 gap-1.5 rounded-md px-3 text-sm',
  lg: 'h-9 gap-2 rounded-md px-4 text-sm',
  icon: 'h-8 w-8 rounded-md',
  'icon-sm': 'h-7 w-7 rounded-md',
  'icon-xs': 'h-6 w-6 rounded-md',
  'icon-lg': 'h-9 w-9 rounded-md'
};

export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0',
        VARYANTLAR[variant],
        BOYUTLAR[size],
        className
      )}
      {...props} />);


}