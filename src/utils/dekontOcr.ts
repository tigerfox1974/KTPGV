import { createWorker } from 'tesseract.js';

export interface DekontOcrAlanlari {
  dekontNo?: string;
  banka?: string;
  tarih?: string;
  odenenTutar?: number;
  odemeYapan?: string;
}

export type DekontOcrDurumu = 'BASARILI' | 'KISMI' | 'BASARISIZ';

export interface DekontOcrSonucu {
  durum: DekontOcrDurumu;
  alanlar: DekontOcrAlanlari;
  okunanAlanlar: string[];
  guven: Partial<Record<keyof DekontOcrAlanlari, number>>;
}

export function normalizeDekontNo(deger: string): string {
  return deger.trim().replace(/\s+/g, ' ').toLocaleUpperCase('tr-TR');
}

function tarihBul(metin: string): string {
  const eslesme = metin.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
  if (!eslesme) return '';
  const yil = eslesme[3].length === 2 ? `20${eslesme[3]}` : eslesme[3];
  return `${yil}-${eslesme[2].padStart(2, '0')}-${eslesme[1].padStart(2, '0')}`;
}

function tutarBul(metin: string): number | undefined {
  const adaylar = metin.match(/\b\d{1,3}(?:[. ]\d{3})*,\d{2}\b|\b\d+(?:[.,]\d{2})\b/g) ?? [];
  const degerler = adaylar.map((aday) => Number(aday.includes(',')
    ? aday.replace(/\./g, '').replace(',', '.')
    : aday.replace(/ /g, ''))).filter((deger) => Number.isFinite(deger) && deger > 0);
  return degerler.length ? degerler[degerler.length - 1] : undefined;
}

function satirDegeri(lines: string[], desen: RegExp): string {
  const satir = lines.find((line) => desen.test(line));
  return satir?.replace(/^.*?[:#-]\s*/, '').trim() ?? '';
}

export async function dekontOcrOku(dosya: { previewUrl?: string; tur: 'PDF' | 'JPG' | 'PNG' }): Promise<DekontOcrSonucu> {
  if (!dosya.previewUrl || dosya.tur === 'PDF') {
    return { durum: 'BASARISIZ', alanlar: {}, okunanAlanlar: [], guven: {} };
  }

  const worker = await createWorker('tur+eng');
  try {
    const sonuc = await worker.recognize(dosya.previewUrl);
    const lines = sonuc.data.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const dekontNo = satirDegeri(lines, /dekont|referans|işlem no|islem no/i);
    const banka = satirDegeri(lines, /banka|bank/i);
    const tarih = tarihBul(sonuc.data.text);
    const odenenTutar = tutarBul(sonuc.data.text);
    const odemeYapan = satirDegeri(lines, /gönderen|gonderen|ödeyen|odeyen|müşteri|musteri/i);
    const alanlar: DekontOcrAlanlari = {
      ...(dekontNo ? { dekontNo: normalizeDekontNo(dekontNo) } : {}),
      ...(banka ? { banka } : {}),
      ...(tarih ? { tarih } : {}),
      ...(odenenTutar ? { odenenTutar } : {}),
      ...(odemeYapan ? { odemeYapan } : {})
    };
    const okunanAlanlar = Object.keys(alanlar);
    // Tesseract exposes document-level confidence here, not reliable field-level confidence.
    const guven = {};
    return {
      durum: okunanAlanlar.length >= 3 ? 'BASARILI' : okunanAlanlar.length ? 'KISMI' : 'BASARISIZ',
      alanlar,
      okunanAlanlar,
      guven
    };
  } finally {
    await worker.terminate();
  }
}
