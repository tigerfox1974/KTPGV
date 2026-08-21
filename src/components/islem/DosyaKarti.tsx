import { Eye, FileText, ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { BilgiRozeti } from '../common/DurumRozeti';
import { DekontDosyasi } from '../../types';

interface DosyaKartiProps {
  dosya: DekontDosyasi;
  goruntule?: () => void;
  kaldir?: () => void;
}

export function DosyaKarti({ dosya, goruntule, kaldir }: DosyaKartiProps) {
  const gorsel = dosya.tur === 'JPG' || dosya.tur === 'PNG';
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {gorsel ?
          <ImageIcon className="h-5 w-5" aria-hidden="true" /> :

          <FileText className="h-5 w-5" aria-hidden="true" />
          }
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{dosya.ad}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {dosya.tur} · {(dosya.boyutKb / 1024).toFixed(2)} MB · {dosya.yuklemeZamani}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <BilgiRozeti
              metin={
              dosya.yontem === 'PERSONEL' ?
              'Yükleme: Personel ekranı' :
              'Yükleme: QR/link (başvuru sahibi)'
              } />
            
            {dosya.sikistirildi && <BilgiRozeti metin="5 MB altına indirildi" ton="uyari" />}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {goruntule &&
        <Button variant="outline" size="sm" onClick={goruntule}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            Dosyayı görüntüle
          </Button>
        }
        {kaldir &&
        <Button variant="ghost" size="sm" onClick={kaldir} className="text-rose-700 hover:text-rose-800">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Dosyayı kaldır
          </Button>
        }
      </div>
    </div>);

}