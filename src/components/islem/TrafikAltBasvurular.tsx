import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { TrafikAltBasvuru } from '../../types';
import { formatTL } from '../../utils/currency';

interface TrafikRaporlariProps {
  satirlar: TrafikAltBasvuru[];
  guncelle: (sira: number, alan: keyof TrafikAltBasvuru, deger: string) => void;
  ekle: () => void;
  kaldir: (sira: number) => void;
  raporBedeliTutar: number;
}

/**
 * İlk trafik raporu her zaman açıktır ve kullanıcıya "alt başvuru" olarak gösterilmez.
 * Ek raporlar butonla eklenir; TTRF ana kayıt mantığı sistem içinde korunur.
 */
export function TrafikAltBasvurular({
  satirlar,
  guncelle,
  ekle,
  kaldir,
  raporBedeliTutar
}: TrafikRaporlariProps) {
  const cokluMu = satirlar.length > 1;

  return (
    <div className="space-y-3">
      {satirlar.map((satir, index) =>
      <div
        key={index}
        className="rounded-lg border border-border bg-muted/30 p-4"
        aria-label={index === 0 ? 'Rapor Bilgisi' : `Ek Rapor ${index + 1}`}>
        
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {index === 0 ? 'Rapor Bilgisi' : `Ek Rapor ${index + 1}`}
              </p>
              {cokluMu && satir.no &&
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{satir.no}</p>
            }
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Rapor tutarı: {formatTL(satir.raporTutari)}
              </span>
              {index > 0 &&
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => kaldir(index)}
              aria-label={`Ek Rapor ${index + 1} kaldır`}>
              
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Kaldır
                </Button>
            }
            </div>
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
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={ekle}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ek rapor ekle
        </Button>
        <p className="text-xs text-muted-foreground">
          Rapor tutarı BAÜ x %1 = {formatTL(raporBedeliTutar)} olarak otomatik hesaplanır. Çoklu
          raporlar tek TTRF ana kaydına bağlanır; ek raporlara ayrı makbuz kesilmez.
        </p>
      </div>
    </div>);

}