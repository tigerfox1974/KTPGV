import { AlertTriangle, Calculator } from 'lucide-react';
import { HesaplamaSonuc } from '../../utils/hesaplama';
import { formatTL } from '../../utils/currency';

export function HesaplamaKutusu({ sonuc }: {sonuc: HesaplamaSonuc;}) {
  if (!sonuc.formul) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Bent seçildiğinde yasal hesaplama açıklaması burada gösterilir.
      </div>);

  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Calculator className="h-4 w-4 text-primary" aria-hidden="true" />
        Hesaplama Açıklaması
      </div>
      <p className="mt-2 font-mono text-xs text-muted-foreground">{sonuc.formul}</p>
      <ul className="mt-3 space-y-1 text-sm text-foreground">
        {sonuc.satirlar.map((satir) =>
        <li key={satir} className="flex gap-2">
            <span className="text-primary">·</span>
            <span>{satir}</span>
          </li>
        )}
      </ul>
      <div className="mt-4 flex items-baseline justify-between border-t border-primary/20 pt-3">
        <span className="text-sm text-muted-foreground">Toplam Tutar</span>
        <span className="font-heading text-xl font-semibold text-foreground">
          {formatTL(sonuc.tutar)}
        </span>
      </div>
      {sonuc.hatalar.length > 0 &&
      <ul className="mt-3 space-y-1">
          {sonuc.hatalar.map((hata) =>
        <li key={hata} className="flex items-start gap-2 text-sm text-rose-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {hata}
            </li>
        )}
        </ul>
      }
    </div>);

}