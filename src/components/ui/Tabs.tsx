import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';

export { cn };

interface TabsContextDegeri {
  secili?: string;
  sec: (deger: string) => void;
}

const TabsContext = createContext<TabsContextDegeri | null>(null);

function useTabs(): TabsContextDegeri {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs alt bileşenleri <Tabs> içinde kullanılmalıdır.');
  return ctx;
}

export interface TabsProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (deger: string) => void;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [icDeger, setIcDeger] = useState<string | undefined>(defaultValue);
  const secili = value !== undefined ? value : icDeger;

  const sec = (yeni: string) => {
    setIcDeger(yeni);
    onValueChange?.(yeni);
  };

  return (
    <TabsContext.Provider value={{ secili, sec }}>
      <div data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>);

}

export function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1',
        className
      )}
      {...props} />);


}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<'button'> & {value: string;}) {
  const { secili, sec } = useTabs();
  const aktif = secili === value;
  return (
    <button
      data-slot="tabs-trigger"
      type="button"
      role="tab"
      aria-selected={aktif}
      onClick={() => sec(value)}
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        aktif ?
        'bg-card text-foreground shadow-sm' :
        'text-muted-foreground hover:text-foreground',
        className
      )}
      {...props}>
      
      {children}
    </button>);

}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {value: string;}) {
  const { secili } = useTabs();
  if (secili !== value) return null;
  return (
    <div data-slot="tabs-content" role="tabpanel" className={cn('outline-none', className)} {...props}>
      {children}
    </div>);

}