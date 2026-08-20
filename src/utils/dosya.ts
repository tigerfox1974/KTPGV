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

function mbEtiketi(kb: number): string {
  return `${(kb / 1024).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MB`;
}

interface DosyaSecenekleri {
  accept?: string;
  capture?: 'environment';
}

function dosyaBilgisiOlustur(
  secilen: File | Blob,
  ad: string,
  tur: DekontDosyasi['tur'],
  boyutKb: number,
  yontem: DekontYontemi,
  sikistirildi = false
): DekontDosyasi {
  return {
    ad,
    tur,
    boyutKb,
    yontem,
    yuklemeZamani: zamanEtiketi(),
    sikistirildi: sikistirildi || undefined,
    previewUrl: URL.createObjectURL(secilen),
    mimeType: secilen.type || undefined
  };
}

function uzantisizAd(ad: string): string {
  return ad.replace(/\.[^.]+$/, '');
}

function gorselYukle(dosya: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(dosya);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Görsel okunamadı.'));
    };
    img.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, kalite: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', kalite));
}

async function gorselOptimizeEt(dosya: File): Promise<{ blob: Blob; boyutKb: number } | null> {
  const img = await gorselYukle(dosya);
  const denemeler = [1800, 1400];

  for (const maxBoyut of denemeler) {
    const oran = Math.min(1, maxBoyut / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * oran));
    canvas.height = Math.max(1, Math.round(img.height * oran));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (const kalite of [0.88, 0.82, 0.76, 0.7, 0.64]) {
      const blob = await canvasBlob(canvas, kalite);
      if (!blob) continue;
      const boyutKb = Math.max(1, Math.round(blob.size / 1024));
      if (boyutKb <= MAKS_BOYUT_KB) return { blob, boyutKb };
    }
  }

  return null;
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
  girdi.onchange = async () => {
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
          description: 'PDF dosyası 5 MB sınırını aşıyor. Lütfen daha küçük bir PDF yükleyin.'
        });
        return;
      }
      try {
        const optimize = await gorselOptimizeEt(secilen);
        if (!optimize) {
          toast.error('Dosya yüklenemedi', {
            description: 'Dosya 5 MB sınırının altına indirilemedi. Lütfen daha düşük boyutlu bir görsel yükleyin.'
          });
          return;
        }
        toast.success('Görsel dekont optimize edildi', {
          description: `Dosya ${mbEtiketi(boyutKb)} olduğu için optimize edildi. Yeni boyut: ${mbEtiketi(optimize.boyutKb)}.`
        });
        tamamlandi(
          dosyaBilgisiOlustur(
            optimize.blob,
            `${uzantisizAd(secilen.name)}-optimize.jpg`,
            'JPG',
            optimize.boyutKb,
            yontem,
            true
          )
        );
      } catch {
        toast.error('Dosya yüklenemedi', {
          description: 'Dosya 5 MB sınırının altına indirilemedi. Lütfen daha düşük boyutlu bir görsel yükleyin.'
        });
      }
      return;
    }

    tamamlandi(dosyaBilgisiOlustur(secilen, secilen.name, tur, boyutKb, yontem));
  };
  girdi.click();
}