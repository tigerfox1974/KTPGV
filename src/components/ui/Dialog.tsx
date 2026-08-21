import { createContext, useContext, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export { cn };

interface DialogContextDegeri {
  acik: boolean;
  setAcik: (acik: boolean) => void;
}

const DialogContext = createContext<DialogContextDegeri | null>(null);

function useDialog(): DialogContextDegeri {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('Dialog alt bileşenleri <Dialog> içinde kullanılmalıdır.');
  return ctx;
}

export interface DialogProps {
  open: boolean;
  onOpenChange?: (acik: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider
      value={{ acik: open, setAcik: (deger) => onOpenChange?.(deger) }}>
      
      {children}
    </DialogContext.Provider>);

}

export function DialogTrigger({ className, onClick, ...props }: React.ComponentProps<'button'>) {
  const { setAcik } = useDialog();
  return (
    <button
      data-slot="dialog-trigger"
      type="button"
      className={className}
      onClick={(olay) => {
        onClick?.(olay);
        setAcik(true);
      }}
      {...props} />);


}

export function DialogContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { acik, setAcik } = useDialog();

  useEffect(() => {
    if (!acik) return;
    const escKapat = (olay: KeyboardEvent) => {
      if (olay.key === 'Escape') setAcik(false);
    };
    document.addEventListener('keydown', escKapat);
    return () => document.removeEventListener('keydown', escKapat);
  }, [acik, setAcik]);

  if (!acik) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setAcik(false)}
        aria-hidden="true" />
      
      <div
        data-slot="dialog-content"
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-lg',
          className
        )}
        {...props}>
        
        <button
          type="button"
          onClick={() => setAcik(false)}
          aria-label="Kapat"
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>);

}

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1.5 pr-8', className)}
      {...props} />);


}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-wrap items-center justify-end gap-2', className)}
      {...props} />);


}

export function DialogTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn('font-heading text-base font-semibold text-foreground', className)}
      {...props} />);


}

export function DialogDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props} />);


}