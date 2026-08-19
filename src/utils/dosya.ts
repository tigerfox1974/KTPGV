import { toast } from 'sonner';
import { DekontDosyasi, DekontYontemi } from '../types';

export const MAKS_BOYUT_KB = 5 * 1024;

function turBelirle(ad: string): DekontDosyasi['tur'] | null {
  const uzanti = ad.split('.').pop()?.toLowerCase();
  if (uzanti === 'pdf') return 'PDF';
  if (uzanti === 'jpg' || uzanti === 'jpeg') return 'JPG';
  if (uzanti === 'png') return 'PNG';
  return null;
}

function zamanEtiketi(): string {
  const d = new Date();
  const iki = (n: number) => n.toString().padStart(2, '0');
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} ${iki(
    d.getHours()
  )}:${iki(d.getMinutes())}`;
}

/**
 * Dekont dosyası seçme simülasyonu.
 * Gerçek dosya adı/boyutu okunur, depolama yapılmaz.
 */
export function dosyaSec(yontem: DekontYontemi, tamamlandi: (dosya: DekontDosyasi) => void): void {
  const girdi = document.createElement('input');
  girdi.type = 'file';
  girdi.accept = '.pdf,.jpg,.jpeg,.png';
  girdi.onchange = () => {
    const secilen = girdi.files?.[0];
    if (!secilen) return;
    const tur = turBelirle(secilen.name);
    if (!tur) {
      toast.error('Kabul edilmeyen dosya türü', {
        description: 'Yalnızca PDF, JPG ve PNG dosyaları yüklenebilir.'
      });
      return;
    }
    const boyutKb = Math.max(1, Math.round(secilen.size / 1024));

    if (boyutKb > MAKS_BOYUT_KB) {
      if (tur === 'PDF') {
        toast.error('PDF dosyası reddedildi', {
          description: '5 MB üzerindeki PDF dosyaları kabul edilmez.'
        });
        return;
      }
      toast.success('Görsel 5 MB altına indirildi', {
        description: 'Kalite kaybı olmadan sıkıştırma simülasyonu uygulandı.'
      });
      tamamlandi({
        ad: secilen.name,
        tur,
        boyutKb: 4800,
        yontem,
        yuklemeZamani: zamanEtiketi(),
        sikistirildi: true
      });
      return;
    }

    tamamlandi({ ad: secilen.name, tur, boyutKb, yontem, yuklemeZamani: zamanEtiketi() });
  };
  girdi.click();
}