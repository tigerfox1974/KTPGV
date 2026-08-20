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
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} · ${iki(
    d.getHours()
  )}:${iki(d.getMinutes())}`;
}

interface DosyaSecenekleri {
  accept?: string;
  capture?: 'environment';
}

function dosyaBilgisiOlustur(
  secilen: File,
  tur: DekontDosyasi['tur'],
  boyutKb: number,
  yontem: DekontYontemi,
  sikistirildi = false
): DekontDosyasi {
  return {
    ad: secilen.name,
    tur,
    boyutKb,
    yontem,
    yuklemeZamani: zamanEtiketi(),
    sikistirildi: sikistirildi || undefined,
    previewUrl: URL.createObjectURL(secilen),
    mimeType: secilen.type || undefined
  };
}

/**
 * Dekont dosyası seçme simülasyonu.
 * Gerçek dosya adı/boyutu okunur, depolama yapılmaz.
 */
export function dosyaSec(
  yontem: DekontYontemi,
  tamamlandi: (dosya: DekontDosyasi) => void,
  secenekler: DosyaSecenekleri = {}
): void {
  const girdi = document.createElement('input');
  girdi.type = 'file';
  girdi.accept = secenekler.accept ?? '.pdf,.jpg,.jpeg,.png';
  if (secenekler.capture) girdi.setAttribute('capture', secenekler.capture);
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
      tamamlandi(dosyaBilgisiOlustur(secilen, tur, 4800, yontem, true));
      return;
    }

    tamamlandi(dosyaBilgisiOlustur(secilen, tur, boyutKb, yontem));
  };
  girdi.click();
}