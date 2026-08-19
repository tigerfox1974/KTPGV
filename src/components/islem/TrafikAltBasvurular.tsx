import React from 'react';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { TrafikAltBasvuru } from '../../types';
import { formatTL } from '../../utils/currency';

interface TrafikAltBasvurularProps {
  satirlar: TrafikAltBasvuru[];
  guncelle: (sira: number, alan: keyof TrafikAltBasvuru, deger: string) => void;
  raporBedeliTutar: number;
}

export function TrafikAltBasvurular({
  satirlar,
  guncelle,
  raporBedeliTutar
}: TrafikAltBasvurularProps) {
  if (!satirlar.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Alt başvuru adedi girildiğinde satırlar burada oluşur. Tekli başvuruda da ana TTRF kaydı
        altında 001 numaralı alt başvuru açılır.
      </p>);

  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Alt başvurular ({satirlar.length})
        </p>
        <p className="text-xs text-muted-foreground">
          Rapor tutarı BAÜ x %1 = {formatTL(raporBedeliTutar)} olarak otomatik dolar.
        </p>
      </div>

      <ul className="space-y-3">
        {satirlar.map((satir, index) =>
        <li key={satir.no} className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-medium text-primary">{satir.no}</span>
              <span className="text-xs text-muted-foreground">
                Rapor tutarı: {formatTL(satir.raporTutari)}
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor={`plaka-${index}`} className="text-xs">
                  Plaka
                </Label>
                <Input
                id={`plaka-${index}`}
                value={satir.plaka}
                onChange={(e) => guncelle(index, 'plaka', e.target.value)}
                placeholder="Örn. LF 421"
                className="mt-1" />
              
              </div>
              <div>
                <Label htmlFor={`hasar-${index}`} className="text-xs">
                  Hasar / dosya no
                </Label>
                <Input
                id={`hasar-${index}`}
                value={satir.hasarDosyaNo}
                onChange={(e) => guncelle(index, 'hasarDosyaNo', e.target.value)}
                placeholder="Örn. HS-2026-11840"
                className="mt-1" />
              
              </div>
              <div>
                <Label htmlFor={`kaza-${index}`} className="text-xs">
                  Kaza tarihi
                </Label>
                <Input
                id={`kaza-${index}`}
                type="date"
                value={satir.kazaTarihi}
                onChange={(e) => guncelle(index, 'kazaTarihi', e.target.value)}
                className="mt-1" />
              
              </div>
              <div>
                <Label htmlFor={`konu-${index}`} className="text-xs">
                  Rapor konusu
                </Label>
                <Input
                id={`konu-${index}`}
                value={satir.raporKonusu}
                onChange={(e) => guncelle(index, 'raporKonusu', e.target.value)}
                placeholder="Örn. Maddi hasarlı kaza"
                className="mt-1" />
              
              </div>
            </div>
          </li>
        )}
      </ul>
    </div>);

}