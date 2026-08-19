import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

interface KuralNotuProps {
  baslik?: string;
  children: React.ReactNode;
  ton?: 'bilgi' | 'uyari';
}

export function KuralNotu({ baslik, children, ton = 'bilgi' }: KuralNotuProps) {
  const bilgi = ton === 'bilgi';
  const Ikon = bilgi ? Info : ShieldAlert;
  return (
    <div
      className={`flex gap-3 rounded-lg border p-4 text-sm ${
      bilgi ?
      'border-primary/20 bg-primary/5 text-foreground' :
      'border-amber-200 bg-amber-50 text-amber-900'}`
      }>
      
      <Ikon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {baslik && <p className="font-medium">{baslik}</p>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>);

}