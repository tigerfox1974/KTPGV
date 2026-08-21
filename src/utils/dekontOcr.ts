import { createWorker } from 'tesseract.js';

export interface DekontOcrAlanlari {
  dekontNo?: string;
  bankaReferansNo?: string;
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

interface TutarAdayi {
  deger: number;
  oncelik: number;
}

interface EtiketAdayi {
  alan: keyof DekontOcrAlanlari | 'sinir';
  etiket: string;
  baslangic: number;
  bitis: number;
  oncelik: number;
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

function sayiyaCevir(aday: string): number | undefined {
  const temiz = aday.replace(/\s/g, '').replace(/TRY|TL/gi, '');
  const normalize = temiz.includes(',') ? temiz.replace(/\./g, '').replace(',', '.') : temiz;
  const deger = Number(normalize);
  return Number.isFinite(deger) && deger > 0 ? deger : undefined;
}

function tutarAdaylariBul(metin: string): TutarAdayi[] {
  const sonuc: TutarAdayi[] = [];
  const tutarDeseni = /\b\d{1,3}(?:[. ]\d{3})*,\d{2}\s*(?:TL|TRY)?\b|\b\d+(?:[.,]\d{2})\s*(?:TL|TRY)?\b/gi;
  for (const eslesme of metin.matchAll(tutarDeseni)) {
    const deger = sayiyaCevir(eslesme[0]);
    if (deger === undefined) continue;
    const cevre = metin.slice(Math.max(0, (eslesme.index ?? 0) - 70), (eslesme.index ?? 0) + eslesme[0].length + 70).toLocaleLowerCase('tr-TR');
    const oncelik = /aktarılan|aktarilan|gönderilen|gonderilen|transfer edilen|toplam ödeme|toplam odeme/.test(cevre)
      ? 4
      : /tutar|ödeme|odeme|havale/.test(cevre)
        ? 3
        : /masraf|bsmv|komisyon|ücret|ucret/.test(cevre)
          ? 1
          : 2;
    sonuc.push({ deger, oncelik });
  }
  return sonuc;
}

function tutarBul(metin: string): number | undefined {
  const adaylar = tutarAdaylariBul(metin);
  return adaylar.sort((a, b) => b.oncelik - a.oncelik || b.deger - a.deger)[0]?.deger;
}

const ETIKETLER: Array<{alan: EtiketAdayi['alan']; desen: RegExp; oncelik: number}> = [
  { alan: 'dekontNo', desen: /e\s*-?dekont\s+belge\s+no|dekont\s+belge\s+no/i, oncelik: 5 },
  { alan: 'dekontNo', desen: /dekont\s+(no|numarası|numarasi)/i, oncelik: 6 },
  { alan: 'dekontNo', desen: /belge\s+(no|numarası|numarasi)/i, oncelik: 4 },
  { alan: 'dekontNo', desen: /işlem\s+belge\s+no|transaction\s+document\s+no/i, oncelik: 3 },
  { alan: 'bankaReferansNo', desen: /referans\s+(no|numarası|numarasi)|işlem\s+referans\s+no|transaction\s+reference|transaction\s+id|işlem\s+no|islem\s+no|sorgu\s+(no|numarası|numarasi)/i, oncelik: 4 },
  { alan: 'banka', desen: /\bbanka\s*adı\b|\bbanka\b(?!\s+(referans|ref|no|numarası|numarasi))|\bbank\s+name\b/i, oncelik: 2 },
  { alan: 'odemeYapan', desen: /gönderen|gonderen|gönderici hesap|gonderici hesap|ödeyen|odeyen|ödeme yapan|borçlu|borclu|hesap sahibi|from account holder|sender/i, oncelik: 4 },
  { alan: 'tarih', desen: /dekont\s+tarihi|işlem\s+tarihi|islem\s+tarihi|işlem\s+zamanı|islem\s+zamani|valör|valor|transaction date/i, oncelik: 4 },
  { alan: 'odenenTutar', desen: /aktarılan tutar|aktarilan tutar|gönderilen tutar|gonderilen tutar|transfer tutarı|transfer tutari|ödeme tutarı|odeme tutari|işlem tutarı|islem tutari|principal amount|transfer amount|toplam tutar|tutar/i, oncelik: 4 },
  { alan: 'sinir', desen: /\bETTN\b|\bAçıklama\b|\bAciklama\b|\bBSMV\b|\bVergi\b|\bKomisyon\b|\bMasraf\b|\bHavale Ücreti\b|\bHavale Ucreti\b/i, oncelik: 1 }
];

function normalizeMetin(metin: string): string {
  const kontrolTemiz = Array.from(metin, (karakter) => {
    const kod = karakter.charCodeAt(0);
    return kod < 32 && kod !== 9 && kod !== 10 ? ' ' : karakter;
  }).join('');
  return kontrolTemiz.replace(/\r/g, '').replace(/[ \t]+/g, ' ');
}

function etiketleriBul(metin: string): EtiketAdayi[] {
  const bulunan: EtiketAdayi[] = [];
  for (const aday of ETIKETLER) {
    for (const eslesme of metin.matchAll(new RegExp(aday.desen.source, `${aday.desen.flags.replace('g', '')}g`))) {
      bulunan.push({ alan: aday.alan, etiket: eslesme[0], baslangic: eslesme.index ?? 0, bitis: (eslesme.index ?? 0) + eslesme[0].length, oncelik: aday.oncelik });
    }
  }
  return bulunan.sort((a, b) => a.baslangic - b.baslangic || b.etiket.length - a.etiket.length);
}

function alanDegeriAl(metin: string, etiket: EtiketAdayi, sonrakiEtiketBaslangici: number): string {
  const ham = metin.slice(etiket.bitis, sonrakiEtiketBaslangici);
  return ham.replace(/^[\s:：#-]+/, '').replace(/\s+/g, ' ').trim();
}

function makulDegerMi(alan: keyof DekontOcrAlanlari, deger: string): boolean {
  if (!deger || deger.length > (alan === 'odemeYapan' ? 120 : alan === 'banka' ? 80 : 64)) return false;
  if (alan === 'dekontNo' || alan === 'bankaReferansNo') return /^[A-Za-z0-9./_-]{3,64}$/.test(deger.replace(/\s/g, ''));
  return true;
}

const BANKA_NORMALIZASYONLARI: Array<[RegExp, string]> = [
  [/t[uü]rkiye\s+[iİıI][sSşŞ]\s+bankas[iıIİ]|[iİıI][sSşŞ]bank/i, 'Türkiye İş Bankası'],
  [/k[iı]br[iı]s\s+vak[iı]flar\s+bankas[iı]/i, 'Kıbrıs Vakıflar Bankası'],
  [/kooperatif\s+merkez\s+bankas[iı]/i, 'Kooperatif Merkez Bankası']
];

function bankaAdiniNormalizeEt(deger: string): string {
  const temiz = deger.replace(/\s+/g, ' ').trim();
  return BANKA_NORMALIZASYONLARI.find(([desen]) => desen.test(temiz))?.[1] ?? (temiz.length <= 80 ? temiz : '');
}

export function parseDekontFields(metin: string): DekontOcrAlanlari {
  const temizMetin = normalizeMetin(metin);
  const etiketler = etiketleriBul(temizMetin);
  const alanlar: DekontOcrAlanlari = {};
  for (const etiket of etiketler) {
    const sonraki = etiketler.find((aday) => aday.baslangic > etiket.baslangic)?.baslangic ?? temizMetin.length;
    const deger = alanDegeriAl(temizMetin, etiket, sonraki);
    if (etiket.alan === 'sinir' || !makulDegerMi(etiket.alan, deger) || alanlar[etiket.alan] !== undefined) continue;
    if (etiket.alan === 'banka') alanlar.banka = bankaAdiniNormalizeEt(deger);
    else if (etiket.alan === 'tarih') alanlar.tarih = tarihBul(deger);
    else if (etiket.alan === 'odenenTutar') alanlar.odenenTutar = tutarBul(deger);
    else if (etiket.alan === 'dekontNo') alanlar.dekontNo = normalizeDekontNo(deger.replace(/\s/g, ''));
    else if (etiket.alan === 'bankaReferansNo') alanlar.bankaReferansNo = normalizeDekontNo(deger);
    else if (etiket.alan === 'odemeYapan') {
      const ad = deger.split(/\bTR(?:\s*[0-9A-Z]){12,}\b|\bIBAN\b|\b(?:adres|şube|sube|açıklama|aciklama)\b/i)[0].replace(/\s+/g, ' ').trim();
      if (makulDegerMi('odemeYapan', ad)) alanlar.odemeYapan = ad;
    }
  }
  if (!alanlar.banka) {
    const ustMetin = temizMetin.split('\n').slice(0, 8).join(' ');
    const banka = BANKA_NORMALIZASYONLARI.find(([desen]) => desen.test(ustMetin));
    if (banka) alanlar.banka = banka[1];
  }
  if (alanlar.odenenTutar === undefined) {
    alanlar.odenenTutar = tutarBul(temizMetin);
  }
  return alanlar;
}

async function pdfMetniOku(veri: ArrayBuffer): Promise<{ metin: string; sayfaGorseli?: string }> {
  const { getDocument, GlobalWorkerOptions, version: pdfVersion } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.mjs`;
  const pdf = await getDocument({ data: veri }).promise;
  let metin = '';
  for (let sayfaNo = 1; sayfaNo <= Math.min(pdf.numPages, 3); sayfaNo += 1) {
    const sayfa = await pdf.getPage(sayfaNo);
    const icerik = await sayfa.getTextContent();
    metin += `${icerik.items.map((item) => 'str' in item ? item.str : '').join(' ')}\n`;
  }
  if (metin.replace(/\s/g, '').length > 30) return { metin };

  const sayfa = await pdf.getPage(1);
  const viewport = sayfa.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');
  if (!context) return { metin };
  await sayfa.render({ canvas, canvasContext: context, viewport }).promise;
  return { metin, sayfaGorseli: canvas.toDataURL('image/png') };
}

async function ocrMetniOku(kaynak: string): Promise<string> {
  const worker = await createWorker('tur+eng');
  try {
    const sonuc = await worker.recognize(kaynak);
    return sonuc.data.text;
  } finally {
    await worker.terminate();
  }
}

export async function dekontOcrOku(dosya: { previewUrl?: string; tur: 'PDF' | 'JPG' | 'PNG'; kaynakVeri?: ArrayBuffer }): Promise<DekontOcrSonucu> {
  if (!dosya.previewUrl) return { durum: 'BASARISIZ', alanlar: {}, okunanAlanlar: [], guven: {} };

  let metin = '';
  if (dosya.tur === 'PDF' && dosya.kaynakVeri) {
    const pdfSonucu = await pdfMetniOku(dosya.kaynakVeri);
    metin = pdfSonucu.metin;
    if (pdfSonucu.sayfaGorseli) metin += `\n${await ocrMetniOku(pdfSonucu.sayfaGorseli)}`;
  } else if (dosya.tur !== 'PDF') {
    metin = await ocrMetniOku(dosya.previewUrl);
  }

  const alanlar = parseDekontFields(metin);

  const okunanAlanlar = Object.keys(alanlar);
  return {
    durum: okunanAlanlar.length >= 3 ? 'BASARILI' : okunanAlanlar.length ? 'KISMI' : 'BASARISIZ',
    alanlar,
    okunanAlanlar,
    guven: {}
  };
}
