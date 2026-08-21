import { Toaster as SonnerToaster, ToasterProps } from 'sonner';
import { cn } from '../../utils/cn';

export { cn };

/** Uygulama genelinde bildirimleri gösterir. toast() çağrıları "sonner" paketinden yapılır. */
export function Toaster({ position = 'top-right', ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position={position}
      toastOptions={{
        classNames: {
          toast:
          'rounded-lg border border-border bg-card text-foreground shadow-lg text-sm font-sans',
          description: 'text-muted-foreground'
        }
      }}
      {...props} />);


}

export const Sonner = Toaster;