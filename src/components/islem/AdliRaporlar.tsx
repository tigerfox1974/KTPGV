import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { AdliRapor } from '../../types';
import { formatTL } from '../../utils/currency';

interface AdliRaporlarProps {
  satirlar: AdliRapor[];
  guncelle: (sira: number, alan: keyof AdliRapor, deger: string) => void;
  ekle: () => void;
  kaldir: (sira: number) => void;
  raporBedeliTutar: number;
}

/** İlk adli rapor otomatik açıktır; "alt rapor" ifadesi kullanılmaz. */
export function AdliRaporlar({
  satirlar,
  guncelle,
  ekle,
  kaldir,
  raporBedeliTutar
}: AdliRaporlarProps) {
  return (
    <div className="space-y-3">
      {satirlar.map((satir, index) =>
      <div key={index} className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {index === 0 ? 'Adli Rapor Bilgisi' : `Ek Adli Rapor ${index + 1}`}
              </p>
              {satirlar.length > 1 && satir.no &&
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
              aria-label={`Ek Adli Rapor ${index + 1} kaldır`}>
              
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Kaldır
                </Button>
            }
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`adli-basvuran-${index}`} className="text-xs">
                Başvuran kişi / kurum
              </Label>
              <Input
              id={`adli-basvuran-${index}`}
              value={satir.basvuran}
              onChange={(e) => guncelle(index, 'basvuran', e.target.value)}
              placeholder="Örn. Lefkoşa Kaza Mahkemesi"
              className="mt-1" />
            
            </div>
            <div>
              <Label htmlFor={`adli-dosya-${index}`} className="text-xs">
                Dosya / referans no
              </Label>
              <Input
              id={`adli-dosya-${index}`}
              value={satir.dosyaNo}
              onChange={(e) => guncelle(index, 'dosyaNo', e.target.value)}
              placeholder="Örn. ADL-2026-00318"
              className="mt-1" />
            
            </div>
            <div>
              <Label htmlFor={`adli-konu-${index}`} className="text-xs">
                Rapor konusu
              </Label>
              <Input
              id={`adli-konu-${index}`}
              value={satir.raporKonusu}
              onChange={(e) => guncelle(index, 'raporKonusu', e.target.value)}
              placeholder="Örn. Olay yeri inceleme raporu"
              className="mt-1" />
            
            </div>
            <div>
              <Label htmlFor={`adli-tarih-${index}`} className="text-xs">
                Olay / işlem tarihi
              </Label>
              <Input
              id={`adli-tarih-${index}`}
              type="date"
              value={satir.olayTarihi}
              onChange={(e) => guncelle(index, 'olayTarihi', e.target.value)}
              className="mt-1" />
            
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor={`adli-aciklama-${index}`} className="text-xs">
                Açıklama
              </Label>
              <Textarea
              id={`adli-aciklama-${index}`}
              rows={2}
              value={satir.aciklama}
              onChange={(e) => guncelle(index, 'aciklama', e.target.value)}
              placeholder="Rapor kapsamı ve talep bilgisi"
              className="mt-1" />
            
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={ekle}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ek adli rapor ekle
        </Button>
        <p className="text-xs text-muted-foreground">
          Rapor tutarı BAÜ x %1 = {formatTL(raporBedeliTutar)} olarak otomatik hesaplanır.
        </p>
      </div>
    </div>);

}