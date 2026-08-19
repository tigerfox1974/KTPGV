import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { isKurallari } from '../data/isKurallari';
import { bentler } from '../data/bentler';
import { useApp } from '../contexts/AppContext';
import { formatTL } from '../utils/currency';
import { patlatmaBedeli } from '../utils/hesaplama';

export function IsKurallari() {
  const { bau } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="İş Kuralları / Teknik Kurallar"
        aciklama="Sistemin uyduğu yasal ve operasyonel kurallar. Yasa 57/2026 Madde 6 gelir bentleri." />
      

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading text-base font-semibold">Bent hesaplama kuralları</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Brüt asgari ücret (BAÜ): {formatTL(bau)} · 1 patlatma kredisi:{' '}
            {formatTL(patlatmaBedeli(bau))}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Bent</th>
                <th scope="col" className="px-4 py-3 font-medium">Formül</th>
                <th scope="col" className="px-4 py-3 font-medium">Ajanda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bentler.map((b) =>
              <tr key={b.kod}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {b.kod} - {b.baslik}
                    </p>
                    <p className="text-xs text-muted-foreground">{b.aciklama}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{b.formul}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {b.ajandayaDuser ? 'Otomatik düşer' : 'Düşmez'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {isKurallari.map((grup) =>
        <section key={grup.baslik} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold text-foreground">{grup.baslik}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {grup.kurallar.map((kural) =>
            <li key={kural} className="flex gap-2">
                  <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true" />
              
                  <span className="text-foreground">{kural}</span>
                </li>
            )}
            </ul>
          </section>
        )}
      </div>
    </div>);

}