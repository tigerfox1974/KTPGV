import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState } from
'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export { cn };

interface SelectContextDegeri {
  secili?: string;
  sec: (deger: string) => void;
  acik: boolean;
  setAcik: (acik: boolean) => void;
  disabled?: boolean;
  etiketler: Record<string, string>;
  etiketKaydet: (deger: string, etiket: string) => void;
}

const SelectContext = createContext<SelectContextDegeri | null>(null);

function useSelect(): SelectContextDegeri {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select alt bileşenleri <Select> içinde kullanılmalıdır.');
  return ctx;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (deger: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Select({ value, defaultValue, onValueChange, disabled, children }: SelectProps) {
  const [icDeger, setIcDeger] = useState<string | undefined>(defaultValue);
  const [acik, setAcik] = useState(false);
  const [etiketler, setEtiketler] = useState<Record<string, string>>({});
  const kapsayici = useRef<HTMLDivElement>(null);

  const secili = value !== undefined ? value : icDeger;

  const etiketKaydet = useCallback((deger: string, etiket: string) => {
    setEtiketler((eski) => eski[deger] === etiket ? eski : { ...eski, [deger]: etiket });
  }, []);

  const sec = useCallback(
    (yeni: string) => {
      setIcDeger(yeni);
      onValueChange?.(yeni);
      setAcik(false);
    },
    [onValueChange]
  );

  useEffect(() => {
    if (!acik) return;
    const disariTikla = (olay: MouseEvent) => {
      if (!kapsayici.current?.contains(olay.target as Node)) setAcik(false);
    };
    const escKapat = (olay: KeyboardEvent) => {
      if (olay.key === 'Escape') setAcik(false);
    };
    document.addEventListener('mousedown', disariTikla);
    document.addEventListener('keydown', escKapat);
    return () => {
      document.removeEventListener('mousedown', disariTikla);
      document.removeEventListener('keydown', escKapat);
    };
  }, [acik]);

  return (
    <SelectContext.Provider
      value={{ secili, sec, acik, setAcik, disabled, etiketler, etiketKaydet }}>
      
      <div ref={kapsayici} className="relative" data-slot="select">
        {children}
      </div>
    </SelectContext.Provider>);

}

export function SelectTrigger({ className, children, ...props }: React.ComponentProps<'button'>) {
  const { acik, setAcik, disabled } = useSelect();
  return (
    <button
      data-slot="select-trigger"
      type="button"
      role="combobox"
      aria-expanded={acik}
      aria-haspopup="listbox"
      disabled={disabled}
      onClick={() => setAcik(!acik)}
      className={cn(
        'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground',
        'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}>
      
      <span className="flex min-w-0 flex-1 items-center truncate text-left">{children}</span>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
    </button>);

}

export function SelectValue({ placeholder }: {placeholder?: string;}) {
  const { secili, etiketler } = useSelect();
  if (!secili) {
    return <span className="truncate text-muted-foreground">{placeholder}</span>;
  }
  return <span className="truncate">{etiketler[secili] ?? secili}</span>;
}

export function SelectContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { acik } = useSelect();
  return (
    <div
      data-slot="select-content"
      role="listbox"
      className={cn(
        'absolute left-0 top-full z-50 mt-1 max-h-64 w-full min-w-full overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
        !acik && 'hidden',
        className
      )}
      {...props}>
      
      {children}
    </div>);

}

export function SelectItem({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {value: string;}) {
  const { secili, sec, etiketKaydet } = useSelect();
  const seciliMi = secili === value;
  const eleman = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const metin = eleman.current?.textContent?.trim();
    if (metin) etiketKaydet(value, metin);
  }, [value, etiketKaydet, children]);

  return (
    <div
      ref={eleman}
      data-slot="select-item"
      role="option"
      aria-selected={seciliMi}
      tabIndex={0}
      onClick={() => sec(value)}
      onKeyDown={(olay) => {
        if (olay.key === 'Enter' || olay.key === ' ') {
          olay.preventDefault();
          sec(value);
        }
      }}
      className={cn(
        'flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        seciliMi && 'bg-accent/60 font-medium',
        className
      )}
      {...props}>
      
      <span className="truncate">{children}</span>
      {seciliMi && <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />}
    </div>);

}

export function SelectGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="select-group" role="group" className={cn('py-1', className)} {...props} />;
}

export function SelectLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props} />);


}