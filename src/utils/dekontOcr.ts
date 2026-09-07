import { createWorker } from 'tesseract.js';
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';
import type {
  DekontAlanAdi,
  DekontAlanAdayi,
  DekontAlanDegeri,
  DekontAlanDegerleri,
  DekontAlanDurumu,
  DekontAlanKaynagi,
  DekontDosyasi,
  DekontKonumluAlan,
  DekontNormalizedBbox,
  DekontSupheliKarakter
} from '../types';
import { parseTL } from './currency';

export type DekontOcrAlanlari = DekontAlanDegerleri;

export type DekontOcrDurumu = 'BASARILI' | 'KISMI' | 'BASARISIZ';

export interface DekontOcrSonucu {
  durum: DekontOcrDurumu;
  alanlar: DekontOcrAlanlari;
  okunanAlanlar: DekontAlanAdi[];
  guven: Partial<Record<DekontAlanAdi, number>>;
  alanModelleri: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>;
  ilkDegerleri: Partial<DekontAlanDegerleri>;
  sayfaSayisi: number;
}

export interface DekontBolgeOcrSonucu {
  adaylar: DekontAlanAdayi[];
  hamMetin: string;
  guven?: number;
}

type TesseractWorker = Awaited<ReturnType<typeof createWorker>>;
type TesseractRecognizeOptions = NonNullable<Parameters<TesseractWorker['recognize']>[1]>;
type TesseractRecognizeOutput = NonNullable<Parameters<TesseractWorker['recognize']>[2]>;
type TesseractWorkerParams = Parameters<TesseractWorker['setParameters']>[0];
type TesseractRecognizeImage = Parameters<TesseractWorker['recognize']>[0];
type TesseractRecognizeResult = Awaited<ReturnType<TesseractWorker['recognize']>>;
type TesseractBlock = NonNullable<TesseractRecognizeResult['data']['blocks']>[number];
type TesseractParagraph = TesseractBlock['paragraphs'][number];
type TesseractLine = TesseractParagraph['lines'][number];
type TesseractWord = TesseractLine['words'][number];
type TesseractSymbol = TesseractWord['symbols'][number];
type PdfTextContentItem = TextContent['items'][number];

interface TutarAdayi {
  deger: number;
  hamDeger: string;
  oncelik: number;
}

interface EtiketAdayi {
  alan: keyof DekontOcrAlanlari | 'sinir';
  etiket: string;
  baslangic: number;
  bitis: number;
  oncelik: number;
}

interface OcrTokenu {
  text: string;
  sayfa: number;
  sira: number;
  kaynak: DekontAlanKaynagi;
  bbox?: DekontNormalizedBbox;
  guven?: number;
  supheliKarakterler?: DekontSupheliKarakter[];
}

interface OcrSatiri {
  text: string;
  sayfa: number;
  sira: number;
  kaynak: DekontAlanKaynagi;
  bbox?: DekontNormalizedBbox;
  guven?: number;
  tokenler: OcrTokenu[];
}

interface OcrAnalizSonucu {
  metin: string;
  satirlar: OcrSatiri[];
  sayfaSayisi: number;
}

interface OcrAlanAdayiSirali {
  aday: DekontAlanAdayi;
  puan: number;
}

interface BelgeBolgesiCanvasSonucu {
  canvas: HTMLCanvasElement;
  belgeBbox: DekontNormalizedBbox;
}

const DEKONT_ALANLARI: DekontAlanAdi[] = [
  'dekontNo',
  'bankaReferansNo',
  'banka',
  'tarih',
  'odenenTutar',
  'odemeYapan'
];

const TESSERACT_BLOCKS_OUTPUT: Partial<TesseractRecognizeOutput> = {
  blocks: true
};

const DUSUK_GUVEN_ESIGI = 78;
const CELISKI_GUVEN_FARKI = 12;

const BANKA_NORMALIZASYONLARI: Array<[RegExp, string]> = [
  [/t[uü]rkiye\s+[iİıI][sSşŞ]\s+bankas[iıIİ]|[iİıI][sSşŞ]bank/i, 'Türkiye İş Bankası'],
  [/t\.?\s*halk\s+bankas[iı]|halkbank/i, 'Türkiye Halk Bankası'],
  [/yapı\s+ve\s+kredi\s+bankas[iı]|yapı\s+kredi|yapi\s+kredi/i, 'Yapı ve Kredi Bankası'],
  [/capitalbank/i, 'CapitalBank'],
  [/novabank/i, 'NovaBank'],
  [/t[uü]rk\s+ekonomi\s+bankas[iı]|\bteb\b/i, 'Türk Ekonomi Bankası'],
  [/k[iı]br[iı]s\s+vak[iı]flar\s+bankas[iı]/i, 'Kıbrıs Vakıflar Bankası'],
  [/kooperatif\s+merkez\s+bankas[iı]/i, 'Kooperatif Merkez Bankası'],
  [/limasol\s+t[uü]rk\s+kooperatif\s+bankas[iı]/i, 'Limasol Türk Kooperatif Bankası']
];

export const STANDART_BANKA_ADLARI = Array.from(
  new Set(BANKA_NORMALIZASYONLARI.map(([, ad]) => ad))
).sort((sol, sag) => sol.localeCompare(sag, 'tr'));

const ETIKETLER: Array<{ alan: EtiketAdayi['alan']; desen: RegExp; oncelik: number }> = [
  { alan: 'dekontNo', desen: /e\s*-?dekont\s+belge\s+no|dekont\s+belge\s+no/i, oncelik: 5 },
  { alan: 'dekontNo', desen: /dekont\s+(no|numarası|numarasi)/i, oncelik: 6 },
  { alan: 'dekontNo', desen: /belge\s+(no|numarası|numarasi)/i, oncelik: 4 },
  {
    alan: 'dekontNo',
    desen: /işlem\s+belge\s+no|transaction\s+document\s+no|fiş\s+no|fis\s+no/i,
    oncelik: 3
  },
  {
    alan: 'bankaReferansNo',
    desen:
      /referans\s+(no|numarası|numarasi)|[iİ]şlem\s+referans\s+no|[iİ]şlem\s+ref|islem\s+ref|transaction\s+reference|transaction\s+id|[iİ]şlem\s+no|islem\s+no|sorgu\s+(no|numarası|numarasi)|b[iİ]mref|seri\s+sıra\s+no|seri\s+sira\s+no/i,
    oncelik: 4
  },
  {
    alan: 'banka',
    desen: /\bbanka\s*adı\b|\bbanka\b(?!\s+(referans|ref|no|numarası|numarasi))|\bbank\s+name\b/i,
    oncelik: 2
  },
  {
    alan: 'odemeYapan',
    desen:
      /gönderen\s+adı|gonderen\s+adi|gönderen|gonderen|gönderici hesap|gonderici hesap|ödeyen|odeyen|ödeme yapan|borçlu|borclu|hesap adı|hesap adi|hesap sahibi|ad soyad|from account holder|sender/i,
    oncelik: 4
  },
  {
    alan: 'tarih',
    desen:
      /dekont\s+tarihi|belge\s+tarihi|[iİ]şlem\s+tarihi|islem\s+tarihi|[iİ]şlem\s+zamanı|islem\s+zamani|tarih\s*-\s*saat|valör\s+tarihi|valor\s+tarihi|valör|valor|transaction date/i,
    oncelik: 4
  },
  {
    alan: 'odenenTutar',
    desen:
      /aktarılan tutar|aktarilan tutar|gönderilen tutar|gonderilen tutar|giden fast tutarı|giden fast tutari|transfer tutarı|transfer tutari|havale tutarı|havale tutari|ödeme tutarı|odeme tutari|[iİ]şlem tutarı|islem tutari|borç|borc|principal amount|transfer amount/i,
    oncelik: 5
  },
  { alan: 'odenenTutar', desen: /toplam ödeme|toplam odeme|toplam tutar/i, oncelik: 3 },
  {
    alan: 'odenenTutar',
    desen: /toplam net tutar|toplam tahsilat tutarı|toplam tahsilat tutari|toplam|net tutar/i,
    oncelik: 1
  },
  { alan: 'odenenTutar', desen: /tutar/i, oncelik: 2 },
  {
    alan: 'sinir',
    desen:
      /\bETTN\b|\bAçıklama\b|\bAciklama\b|\bB[iİ]MREF\b|\bBSMV\b|\bVergi\b|\bKomisyon\b|\bMasraf\b|\bHavale Ücreti\b|\bHavale Ucreti\b|\bFAST Ücreti\b|\bFAST Ucreti\b|\bEFT Ücreti\b|\bEFT Ucreti\b|\bHMK\b/i,
    oncelik: 1
  }
];

const TARIH_DESENI = /\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/g;
const TUTAR_DESENI =
  /\b\d{1,3}(?:[. ]\d{3})*,\d{2}\s*(?:TL|TRY)?\b|\b\d+(?:[.,]\d{2})\s*(?:TL|TRY)?\b/gi;

export function normalizeDekontNo(deger: string): string {
  return deger.trim().replace(/\s+/g, ' ').toLocaleUpperCase('tr-TR');
}

function latinKatla(deger: string): string {
  return deger
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i');
}

export function normalizeBankaAdi(deger: string): string {
  const temiz = deger.replace(/\s+/g, ' ').trim();
  const katlanmis = latinKatla(temiz);
  const banka = BANKA_NORMALIZASYONLARI.find(
    ([desen]) => desen.test(temiz) || desen.test(katlanmis)
  );
  return banka?.[1] ?? (temiz.length <= 80 ? temiz : '');
}

function tarihBul(metin: string): string {
  const eslesme = metin.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
  if (!eslesme) return '';
  const yil = eslesme[3].length === 2 ? `20${eslesme[3]}` : eslesme[3];
  return `${yil}-${eslesme[2].padStart(2, '0')}-${eslesme[1].padStart(2, '0')}`;
}

function sayiyaCevir(aday: string): number | undefined {
  const deger = parseTL(aday);
  return deger !== null && deger > 0 ? deger : undefined;
}

function tutarAdaylariBul(metin: string): TutarAdayi[] {
  const sonuc: TutarAdayi[] = [];
  for (const eslesme of metin.matchAll(TUTAR_DESENI)) {
    const hamDeger = eslesme[0];
    const deger = sayiyaCevir(hamDeger);
    if (deger === undefined) continue;
    const cevre = metin
      .slice(Math.max(0, (eslesme.index ?? 0) - 70), (eslesme.index ?? 0) + hamDeger.length + 70)
      .toLocaleLowerCase('tr-TR');
    const oncelik = /aktarılan|aktarilan|gönderilen|gonderilen|transfer edilen|toplam ödeme|toplam odeme/.test(
      cevre
    )
      ? 4
      : /tutar|ödeme|odeme|havale/.test(cevre)
        ? 3
        : /masraf|bsmv|komisyon|ücret|ucret/.test(cevre)
          ? 1
          : 2;
    sonuc.push({ deger, hamDeger, oncelik });
  }
  return sonuc;
}

function tutarBul(metin: string): number | undefined {
  const adaylar = tutarAdaylariBul(metin);
  return adaylar.sort((a, b) => b.oncelik - a.oncelik || b.deger - a.deger)[0]?.deger;
}

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
    const flags = aday.desen.flags.includes('g') ? aday.desen.flags : `${aday.desen.flags}g`;
    for (const eslesme of metin.matchAll(new RegExp(aday.desen.source, flags))) {
      bulunan.push({
        alan: aday.alan,
        etiket: eslesme[0],
        baslangic: eslesme.index ?? 0,
        bitis: (eslesme.index ?? 0) + eslesme[0].length,
        oncelik: aday.oncelik
      });
    }
  }
  const sirali = bulunan.sort(
    (a, b) => a.baslangic - b.baslangic || b.etiket.length - a.etiket.length
  );
  return sirali.filter((aday, index) => {
    const cakisan = sirali
      .slice(0, index)
      .find((onceki) => onceki.baslangic <= aday.baslangic && onceki.bitis > aday.baslangic);
    return !cakisan || aday.oncelik > cakisan.oncelik;
  });
}

function alanDegeriAl(metin: string, etiket: EtiketAdayi, sonrakiEtiketBaslangici: number): string {
  const ham = metin.slice(etiket.bitis, sonrakiEtiketBaslangici);
  return ham.replace(/^[\s:：#-]+/, '').replace(/\s+/g, ' ').trim();
}

function makulDegerMi(alan: keyof DekontOcrAlanlari, deger: string): boolean {
  if (!deger || deger.length > (alan === 'odemeYapan' ? 120 : alan === 'banka' ? 80 : 64)) {
    return false;
  }
  if (alan === 'dekontNo' || alan === 'bankaReferansNo') {
    return /^[A-Za-z0-9./_-]{3,64}$/.test(deger.replace(/\s/g, ''));
  }
  return true;
}

export function parseDekontFields(metin: string): DekontOcrAlanlari {
  const temizMetin = normalizeMetin(metin);
  const etiketler = etiketleriBul(temizMetin);
  const alanlar: DekontOcrAlanlari = {};
  const tutarEtiketAdaylari: Array<TutarAdayi & { kaynak: string }> = [];

  for (const etiket of etiketler) {
    const sonraki =
      etiketler.find((aday) => aday.baslangic > etiket.baslangic)?.baslangic ?? temizMetin.length;
    const deger = alanDegeriAl(temizMetin, etiket, sonraki);
    if (
      etiket.alan === 'sinir' ||
      !makulDegerMi(etiket.alan, deger) ||
      alanlar[etiket.alan] !== undefined
    ) {
      continue;
    }

    if (etiket.alan === 'banka') {
      alanlar.banka = normalizeBankaAdi(deger);
      continue;
    }
    if (etiket.alan === 'tarih') {
      alanlar.tarih = tarihBul(deger);
      continue;
    }
    if (etiket.alan === 'odenenTutar') {
      const tutar = tutarBul(deger);
      if (tutar !== undefined) {
        tutarEtiketAdaylari.push({
          deger: tutar,
          hamDeger: deger,
          oncelik: etiket.oncelik,
          kaynak: etiket.etiket
        });
      }
      continue;
    }
    if (etiket.alan === 'dekontNo') {
      alanlar.dekontNo = normalizeDekontNo(deger.replace(/\s/g, ''));
      continue;
    }
    if (etiket.alan === 'bankaReferansNo') {
      alanlar.bankaReferansNo = normalizeDekontNo(deger);
      continue;
    }
    if (etiket.alan === 'odemeYapan') {
      const ad = deger
        .split(
          /\bTR(?:\s*[0-9A-Z]){12,}\b|\bIBAN\b|\b(?:adres|şube|sube|açıklama|aciklama)\b/i
        )[0]
        .replace(/\s+/g, ' ')
        .trim();
      if (makulDegerMi('odemeYapan', ad)) alanlar.odemeYapan = ad;
    }
  }

  if (!alanlar.banka) {
    const ustMetin = temizMetin.split('\n').slice(0, 8).join(' ');
    const katlanmis = latinKatla(ustMetin);
    const banka = BANKA_NORMALIZASYONLARI.find(
      ([desen]) => desen.test(ustMetin) || desen.test(katlanmis)
    );
    if (banka) alanlar.banka = banka[1];
  }

  const secilenTutar = tutarEtiketAdaylari.sort(
    (a, b) => b.oncelik - a.oncelik || b.deger - a.deger
  )[0];
  alanlar.odenenTutar = secilenTutar?.deger ?? tutarBul(temizMetin);

  return alanlar;
}

function clamp01(deger: number): number {
  if (!Number.isFinite(deger)) return 0;
  if (deger < 0) return 0;
  if (deger > 1) return 1;
  return deger;
}

function normalizeBbox(bbox: {
  left: number;
  top: number;
  width: number;
  height: number;
}, genislik: number, yukseklik: number): DekontNormalizedBbox {
  const x = clamp01(bbox.left / genislik);
  const y = clamp01(bbox.top / yukseklik);
  const width = clamp01(bbox.width / genislik);
  const height = clamp01(bbox.height / yukseklik);
  return {
    x,
    y,
    width: Math.min(width, 1 - x),
    height: Math.min(height, 1 - y)
  };
}

function bboxBirlesimi(
  kutular: Array<DekontNormalizedBbox | undefined>
): DekontNormalizedBbox | undefined {
  const dolu = kutular.filter((kutu): kutu is DekontNormalizedBbox => !!kutu);
  if (!dolu.length) return undefined;
  const x0 = Math.min(...dolu.map((kutu) => kutu.x));
  const y0 = Math.min(...dolu.map((kutu) => kutu.y));
  const x1 = Math.max(...dolu.map((kutu) => kutu.x + kutu.width));
  const y1 = Math.max(...dolu.map((kutu) => kutu.y + kutu.height));
  return {
    x: clamp01(x0),
    y: clamp01(y0),
    width: clamp01(x1 - x0),
    height: clamp01(y1 - y0)
  };
}

function tesseractBboxNormalizeEt(
  bbox: { x0: number; y0: number; x1: number; y1: number },
  genislik: number,
  yukseklik: number
): DekontNormalizedBbox {
  return normalizeBbox(
    {
      left: bbox.x0,
      top: bbox.y0,
      width: Math.max(1, bbox.x1 - bbox.x0),
      height: Math.max(1, bbox.y1 - bbox.y0)
    },
    genislik,
    yukseklik
  );
}

function isPdfTextItem(item: PdfTextContentItem): item is TextItem {
  return 'str' in item;
}

function tokenSupheliKarakterleriniTopla(semboller: TesseractSymbol[]): DekontSupheliKarakter[] {
  return semboller
    .map((sembol, index) => ({
      index,
      karakter: sembol.text,
      guven: sembol.confidence
    }))
    .filter((kayit) => (kayit.guven ?? 100) < DUSUK_GUVEN_ESIGI);
}

function ortalamaGuven(
  degerler: Array<number | undefined>
): number | undefined {
  const dolu = degerler.filter((deger): deger is number => deger !== undefined && Number.isFinite(deger));
  if (!dolu.length) return undefined;
  return Number((dolu.reduce((toplam, deger) => toplam + deger, 0) / dolu.length).toFixed(2));
}

function alanDegeriniNormalizeEt(alan: DekontAlanAdi, deger: DekontAlanDegeri): string {
  if (alan === 'odenenTutar' && typeof deger === 'number') return deger.toFixed(2);
  if (alan === 'banka') return latinKatla(String(deger));
  if (alan === 'tarih') return String(deger).trim();
  if (alan === 'dekontNo') return normalizeDekontNo(String(deger)).replace(/\s/g, '');
  if (alan === 'bankaReferansNo') return normalizeDekontNo(String(deger));
  return latinKatla(String(deger).replace(/\s+/g, ' ').trim());
}

function alanDegeriniMetneCevir(alan: DekontAlanAdi, deger: DekontAlanDegeri): string {
  if (alan === 'odenenTutar' && typeof deger === 'number') {
    return deger.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  return String(deger ?? '').trim();
}

function alanDegeriniTipliHaleGetir(
  alan: DekontAlanAdi,
  degerMetni: string
): DekontAlanDegeri | undefined {
  if (!degerMetni.trim()) return undefined;
  if (alan === 'banka') return normalizeBankaAdi(degerMetni);
  if (alan === 'tarih') return tarihBul(degerMetni);
  if (alan === 'odenenTutar') return sayiyaCevir(degerMetni);
  if (alan === 'dekontNo') return normalizeDekontNo(degerMetni.replace(/\s/g, ''));
  if (alan === 'bankaReferansNo') return normalizeDekontNo(degerMetni);
  return degerMetni.replace(/\s+/g, ' ').trim();
}

function adayOlustur(
  alan: DekontAlanAdi,
  degerMetni: string,
  deger: DekontAlanDegeri | undefined,
  kaynak: DekontAlanKaynagi,
  satirlar: OcrSatiri[],
  sayfa?: number,
  bbox?: DekontNormalizedBbox,
  guven?: number
): DekontAlanAdayi {
  const satirKutusu = bboxBirlesimi(satirlar.map((satir) => satir.bbox));
  const satirSupheliKarakterleri = satirlar.flatMap((satir) =>
    satir.tokenler.flatMap((token) => token.supheliKarakterler ?? [])
  );
  const sayfaNo = sayfa ?? satirlar[0]?.sayfa;
  const adayDegeri = deger ?? alanDegeriniTipliHaleGetir(alan, degerMetni);
  const benzersizKimlik = alanDegeriniNormalizeEt(alan, adayDegeri ?? degerMetni);
  return {
    id: `${alan}-${sayfaNo ?? 1}-${benzersizKimlik || 'bos'}`,
    alan,
    degerMetni: degerMetni.trim(),
    deger: adayDegeri,
    kaynak,
    guven,
    sayfa: sayfaNo,
    bbox: bbox ?? satirKutusu,
    supheliKarakterler: satirSupheliKarakterleri.length ? satirSupheliKarakterleri : undefined
  };
}

function benzersizAdaylariSirala(adaylar: OcrAlanAdayiSirali[]): DekontAlanAdayi[] {
  const benzersiz = new Map<string, OcrAlanAdayiSirali>();
  for (const kayit of adaylar) {
    const anahtar = kayit.aday.deger
      ? alanDegeriniNormalizeEt(kayit.aday.alan, kayit.aday.deger)
      : latinKatla(kayit.aday.degerMetni);
    if (!anahtar) continue;
    const mevcut = benzersiz.get(anahtar);
    if (!mevcut || kayit.puan > mevcut.puan) benzersiz.set(anahtar, kayit);
  }
  return [...benzersiz.values()]
    .sort((sol, sag) => sag.puan - sol.puan || (sag.aday.guven ?? 0) - (sol.aday.guven ?? 0))
    .map(({ aday }) => aday);
}

function alanAdaylariniParseSnippettenTopla(satirlar: OcrSatiri[]): Partial<Record<DekontAlanAdi, OcrAlanAdayiSirali[]>> {
  const sonuc: Partial<Record<DekontAlanAdi, OcrAlanAdayiSirali[]>> = {};
  for (let index = 0; index < satirlar.length; index += 1) {
    const aktif = satirlar[index];
    const sonraki = satirlar[index + 1];
    const parcaciklar: Array<{ metin: string; satirlar: OcrSatiri[]; bonus: number }> = [
      { metin: aktif.text, satirlar: [aktif], bonus: 140 }
    ];
    if (sonraki && sonraki.sayfa === aktif.sayfa) {
      parcaciklar.push({
        metin: `${aktif.text}\n${sonraki.text}`,
        satirlar: [aktif, sonraki],
        bonus: 110
      });
    }
    for (const parcacik of parcaciklar) {
      const parse = parseDekontFields(parcacik.metin);
      for (const alan of DEKONT_ALANLARI) {
        const deger = parse[alan];
        if (deger === undefined || deger === '') continue;
        const aday = adayOlustur(
          alan,
          alanDegeriniMetneCevir(alan, deger),
          deger,
          parcacik.satirlar[0]?.kaynak ?? 'OCR',
          parcacik.satirlar,
          parcacik.satirlar[0]?.sayfa,
          bboxBirlesimi(parcacik.satirlar.map((satir) => satir.bbox)),
          ortalamaGuven(parcacik.satirlar.map((satir) => satir.guven))
        );
        sonuc[alan] = [...(sonuc[alan] ?? []), { aday, puan: parcacik.bonus + (aday.guven ?? 0) }];
      }
    }
  }
  return sonuc;
}

function amountCandidatesFromLines(satirlar: OcrSatiri[]): OcrAlanAdayiSirali[] {
  const adaylar: OcrAlanAdayiSirali[] = [];
  for (const satir of satirlar) {
    for (const aday of tutarAdaylariBul(satir.text)) {
      const kayit = adayOlustur(
        'odenenTutar',
        aday.hamDeger,
        aday.deger,
        satir.kaynak,
        [satir],
        satir.sayfa,
        satir.bbox,
        satir.guven
      );
      adaylar.push({ aday: kayit, puan: aday.oncelik * 100 + (kayit.guven ?? 0) });
    }
  }
  return adaylar;
}

function dateCandidatesFromLines(satirlar: OcrSatiri[]): OcrAlanAdayiSirali[] {
  const adaylar: OcrAlanAdayiSirali[] = [];
  for (const satir of satirlar) {
    for (const eslesme of satir.text.matchAll(TARIH_DESENI)) {
      const degerMetni = eslesme[0];
      const deger = alanDegeriniTipliHaleGetir('tarih', degerMetni);
      if (!deger) continue;
      const kayit = adayOlustur(
        'tarih',
        degerMetni,
        deger,
        satir.kaynak,
        [satir],
        satir.sayfa,
        satir.bbox,
        satir.guven
      );
      adaylar.push({ aday: kayit, puan: 120 + (kayit.guven ?? 0) });
    }
  }
  return adaylar;
}

function bankCandidatesFromLines(satirlar: OcrSatiri[]): OcrAlanAdayiSirali[] {
  const adaylar: OcrAlanAdayiSirali[] = [];
  for (const satir of satirlar.slice(0, 12)) {
    const banka = normalizeBankaAdi(satir.text);
    if (!banka) continue;
    const kayit = adayOlustur(
      'banka',
      banka,
      banka,
      satir.kaynak,
      [satir],
      satir.sayfa,
      satir.bbox,
      satir.guven
    );
    adaylar.push({ aday: kayit, puan: 160 + (kayit.guven ?? 0) });
  }
  return adaylar;
}

function payerCandidatesFromLines(satirlar: OcrSatiri[]): OcrAlanAdayiSirali[] {
  const adaylar: OcrAlanAdayiSirali[] = [];
  for (let index = 0; index < satirlar.length; index += 1) {
    const satir = satirlar[index];
    const etiketVar = /gönderen|gonderen|ödeyen|odeyen|hesap adı|hesap adi|hesap sahibi|sender/i.test(
      satir.text
    );
    const parse = parseDekontFields(satir.text);
    const deger = parse.odemeYapan;
    if (deger) {
      const kayit = adayOlustur(
        'odemeYapan',
        deger,
        deger,
        satir.kaynak,
        [satir],
        satir.sayfa,
        satir.bbox,
        satir.guven
      );
      adaylar.push({ aday: kayit, puan: (etiketVar ? 150 : 90) + (kayit.guven ?? 0) });
      continue;
    }

    if (!etiketVar) continue;
    const sonraki = satirlar[index + 1];
    if (!sonraki || sonraki.sayfa !== satir.sayfa) continue;
    const adayMetni = parseDekontFields(`${satir.text}\n${sonraki.text}`).odemeYapan;
    if (!adayMetni) continue;
    const kayit = adayOlustur(
      'odemeYapan',
      adayMetni,
      adayMetni,
      satir.kaynak,
      [satir, sonraki],
      satir.sayfa,
      bboxBirlesimi([satir.bbox, sonraki.bbox]),
      ortalamaGuven([satir.guven, sonraki.guven])
    );
    adaylar.push({ aday: kayit, puan: 145 + (kayit.guven ?? 0) });
  }
  return adaylar;
}

function numberCandidatesFromLines(
  satirlar: OcrSatiri[],
  alan: 'dekontNo' | 'bankaReferansNo'
): OcrAlanAdayiSirali[] {
  const adaylar: OcrAlanAdayiSirali[] = [];
  const ilgiliEtiketler = ETIKETLER.filter((etiket) => etiket.alan === alan);
  for (let index = 0; index < satirlar.length; index += 1) {
    const satir = satirlar[index];
    const eslesenEtiket = ilgiliEtiketler.find((etiket) => etiket.desen.test(satir.text));
    if (!eslesenEtiket) continue;
    const parse = parseDekontFields(satir.text);
    const deger = parse[alan];
    if (typeof deger === 'string' && deger) {
      const kayit = adayOlustur(
        alan,
        deger,
        deger,
        satir.kaynak,
        [satir],
        satir.sayfa,
        satir.bbox,
        satir.guven
      );
      adaylar.push({ aday: kayit, puan: 150 + eslesenEtiket.oncelik * 4 + (kayit.guven ?? 0) });
      continue;
    }

    const sonraki = satirlar[index + 1];
    if (!sonraki || sonraki.sayfa !== satir.sayfa) continue;
    const degerSonraki = parseDekontFields(`${satir.text}\n${sonraki.text}`)[alan];
    if (typeof degerSonraki !== 'string' || !degerSonraki) continue;
    const kayit = adayOlustur(
      alan,
      degerSonraki,
      degerSonraki,
      satir.kaynak,
      [satir, sonraki],
      satir.sayfa,
      bboxBirlesimi([satir.bbox, sonraki.bbox]),
      ortalamaGuven([satir.guven, sonraki.guven])
    );
    adaylar.push({ aday: kayit, puan: 140 + eslesenEtiket.oncelik * 4 + (kayit.guven ?? 0) });
  }
  return adaylar;
}

function satirdaDegeriAra(
  alan: DekontAlanAdi,
  deger: DekontAlanDegeri,
  satirlar: OcrSatiri[]
): OcrSatiri | undefined {
  const normal = alanDegeriniNormalizeEt(alan, deger);
  return satirlar.find((satir) => {
    if (!satir.text.trim()) return false;
    const parse = parseDekontFields(satir.text);
    const parseDegeri = parse[alan];
    return parseDegeri !== undefined && alanDegeriniNormalizeEt(alan, parseDegeri) === normal;
  });
}

function varsayilanKaynak(satirlar: OcrSatiri[]): DekontAlanKaynagi {
  return satirlar.find(Boolean)?.kaynak ?? 'OCR';
}

function alanDurumuBelirle(
  birincil: DekontAlanAdayi | undefined,
  alternatifler: DekontAlanAdayi[]
): DekontAlanDurumu {
  if (!birincil?.deger) return 'KONTROL_GEREKLI';
  if (birincil.guven === undefined || birincil.guven < DUSUK_GUVEN_ESIGI) return 'KONTROL_GEREKLI';
  const rakip = alternatifler[0];
  if (
    rakip?.deger !== undefined &&
    alanDegeriniNormalizeEt(birincil.alan, rakip.deger) !==
      alanDegeriniNormalizeEt(birincil.alan, birincil.deger) &&
    Math.abs((birincil.guven ?? 0) - (rakip.guven ?? 0)) <= CELISKI_GUVEN_FARKI
  ) {
    return 'KONTROL_GEREKLI';
  }
  return 'OKUNDU';
}

function ocrAlanModelleriniOlustur(
  satirlar: OcrSatiri[],
  tamMetin: string
): Pick<DekontOcrSonucu, 'alanlar' | 'okunanAlanlar' | 'guven' | 'alanModelleri' | 'ilkDegerleri'> {
  const parseAdaylari = alanAdaylariniParseSnippettenTopla(satirlar);
  const hamParse = parseDekontFields(tamMetin);
  const alanlar: DekontOcrAlanlari = {};
  const ilkDegerleri: Partial<DekontAlanDegerleri> = {};
  const guven: Partial<Record<DekontAlanAdi, number>> = {};
  const alanModelleri: Partial<Record<DekontAlanAdi, DekontKonumluAlan>> = {};

  const alanAdayHaritasi: Partial<Record<DekontAlanAdi, OcrAlanAdayiSirali[]>> = {
    ...parseAdaylari,
    odenenTutar: [...(parseAdaylari.odenenTutar ?? []), ...amountCandidatesFromLines(satirlar)],
    tarih: [...(parseAdaylari.tarih ?? []), ...dateCandidatesFromLines(satirlar)],
    banka: [...(parseAdaylari.banka ?? []), ...bankCandidatesFromLines(satirlar)],
    odemeYapan: [...(parseAdaylari.odemeYapan ?? []), ...payerCandidatesFromLines(satirlar)],
    dekontNo: [...(parseAdaylari.dekontNo ?? []), ...numberCandidatesFromLines(satirlar, 'dekontNo')],
    bankaReferansNo: [
      ...(parseAdaylari.bankaReferansNo ?? []),
      ...numberCandidatesFromLines(satirlar, 'bankaReferansNo')
    ]
  };

  for (const alan of DEKONT_ALANLARI) {
    const siraliAdaylar = benzersizAdaylariSirala(alanAdayHaritasi[alan] ?? []);
    const fallbackDegeri = hamParse[alan];
    if (fallbackDegeri !== undefined) {
      const fallbackNormal = alanDegeriniNormalizeEt(alan, fallbackDegeri);
      const mevcut = siraliAdaylar.some(
        (aday) =>
          aday.deger !== undefined && alanDegeriniNormalizeEt(alan, aday.deger) === fallbackNormal
      );
      if (!mevcut) {
        const satir = satirdaDegeriAra(alan, fallbackDegeri, satirlar);
        siraliAdaylar.push(
          adayOlustur(
            alan,
            alanDegeriniMetneCevir(alan, fallbackDegeri),
            fallbackDegeri,
            satir?.kaynak ?? varsayilanKaynak(satirlar),
            satir ? [satir] : [],
            satir?.sayfa,
            satir?.bbox,
            satir?.guven
          )
        );
      }
    }

    const [birincil, ...digerleri] = siraliAdaylar;
    const secilenDeger = birincil?.deger ?? fallbackDegeri;
    if (secilenDeger === undefined || secilenDeger === '') continue;

    alanlar[alan] = secilenDeger as never;
    ilkDegerleri[alan] = secilenDeger as never;
    guven[alan] = birincil?.guven ?? 0;
    alanModelleri[alan] = {
      alan,
      ocrDegeri: birincil?.degerMetni ?? alanDegeriniMetneCevir(alan, secilenDeger),
      guncelDeger: secilenDeger,
      kaynak: birincil?.kaynak ?? varsayilanKaynak(satirlar),
      durum: alanDurumuBelirle(birincil, digerleri),
      guven: birincil?.guven,
      sayfa: birincil?.sayfa,
      bbox: birincil?.bbox,
      alternatifAdaylar: digerleri.slice(0, 6),
      supheliKarakterler: birincil?.supheliKarakterler
    };
  }

  return {
    alanlar,
    ilkDegerleri,
    guven,
    alanModelleri,
    okunanAlanlar: Object.keys(alanlar) as DekontAlanAdi[]
  };
}

async function imageDimensions(
  kaynak: TesseractRecognizeImage
): Promise<{ width: number; height: number }> {
  if (typeof kaynak === 'string') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('OCR görsel boyutu okunamadı.'));
      img.src = kaynak;
    });
  }
  if (typeof HTMLCanvasElement !== 'undefined' && kaynak instanceof HTMLCanvasElement) {
    return { width: kaynak.width, height: kaynak.height };
  }
  if (typeof HTMLImageElement !== 'undefined' && kaynak instanceof HTMLImageElement) {
    return { width: kaynak.naturalWidth, height: kaynak.naturalHeight };
  }
  if (typeof OffscreenCanvas !== 'undefined' && kaynak instanceof OffscreenCanvas) {
    return { width: kaynak.width, height: kaynak.height };
  }
  if (
    (typeof Blob !== 'undefined' && kaynak instanceof Blob) ||
    (typeof File !== 'undefined' && kaynak instanceof File)
  ) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(kaynak);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('OCR blob boyutu okunamadı.'));
      };
      img.src = url;
    });
  }
  throw new Error('Desteklenmeyen OCR görsel kaynağı.');
}

function tesseractSatirlariniOlustur(
  bloklar: TesseractBlock[],
  boyutlar: { width: number; height: number },
  sayfaNo: number
): OcrSatiri[] {
  let satirSirasi = 0;
  const satirlar: OcrSatiri[] = [];
  for (const blok of bloklar) {
    for (const paragraf of blok.paragraphs as TesseractParagraph[]) {
      for (const satir of paragraf.lines as TesseractLine[]) {
        const tokenler = (satir.words as TesseractWord[]).map((kelime, kelimeSirasi) => ({
          text: kelime.text,
          sayfa: sayfaNo,
          sira: satirSirasi * 100 + kelimeSirasi,
          kaynak: 'OCR' as const,
          bbox: tesseractBboxNormalizeEt(kelime.bbox, boyutlar.width, boyutlar.height),
          guven: kelime.confidence,
          supheliKarakterler: tokenSupheliKarakterleriniTopla(kelime.symbols as TesseractSymbol[])
        }));
        const lineText = satir.text.trim() || tokenler.map((token) => token.text).join(' ').trim();
        satirlar.push({
          text: lineText,
          sayfa: sayfaNo,
          sira: satirSirasi,
          kaynak: 'OCR',
          bbox: tesseractBboxNormalizeEt(satir.bbox, boyutlar.width, boyutlar.height),
          guven: satir.confidence,
          tokenler
        });
        satirSirasi += 1;
      }
    }
  }
  return satirlar;
}

async function ocrAnalizEt(
  kaynak: TesseractRecognizeImage,
  sayfaNo: number,
  options?: Partial<TesseractRecognizeOptions>,
  params?: Partial<TesseractWorkerParams>
): Promise<{ metin: string; satirlar: OcrSatiri[]; guven: number }> {
  const worker = await createWorker('tur+eng');
  try {
    if (params && Object.keys(params).length) {
      await worker.setParameters(params);
    }
    const sonuc = await worker.recognize(kaynak, options, TESSERACT_BLOCKS_OUTPUT);
    const boyutlar = await imageDimensions(kaynak);
    const satirlar = tesseractSatirlariniOlustur(sonuc.data.blocks ?? [], boyutlar, sayfaNo);
    return { metin: sonuc.data.text, satirlar, guven: sonuc.data.confidence };
  } finally {
    await worker.terminate();
  }
}

function pdfSatirlariniGrupla(
  textItems: TextItem[],
  boyutlar: { width: number; height: number },
  sayfaNo: number
): OcrSatiri[] {
  const esik = Math.max(4, boyutlar.height * 0.006);
  const ogeKonumlari = textItems
    .filter((item) => item.str.trim())
    .map((item) => {
      const left = item.transform[4];
      const top = Math.max(0, item.transform[5] - item.height);
      const width = Math.max(1, item.width);
      const height = Math.max(1, item.height);
      return {
        item,
        left,
        top,
        width,
        height
      };
    })
    .sort((sol, sag) => sol.top - sag.top || sol.left - sag.left);

  const satirlar: OcrSatiri[] = [];
  for (const oge of ogeKonumlari) {
    const sonSatir = satirlar[satirlar.length - 1];
    const ogeKutusu = normalizeBbox(
      { left: oge.left, top: oge.top, width: oge.width, height: oge.height },
      boyutlar.width,
      boyutlar.height
    );
    const token: OcrTokenu = {
      text: oge.item.str,
      sayfa: sayfaNo,
      sira: (sonSatir?.tokenler.length ?? 0) + 1,
      kaynak: 'PDF_METIN',
      bbox: ogeKutusu
    };

    if (
      sonSatir &&
      sonSatir.sayfa === sayfaNo &&
      sonSatir.bbox &&
      Math.abs(sonSatir.bbox.y * boyutlar.height - ogeKutusu.y * boyutlar.height) <= esik
    ) {
      sonSatir.tokenler.push(token);
      sonSatir.tokenler.sort((sol, sag) => (sol.bbox?.x ?? 0) - (sag.bbox?.x ?? 0));
      sonSatir.text = sonSatir.tokenler.map((mevcut) => mevcut.text).join(' ').replace(/\s+/g, ' ').trim();
      sonSatir.bbox = bboxBirlesimi([...sonSatir.tokenler.map((mevcut) => mevcut.bbox), sonSatir.bbox]);
    } else {
      satirlar.push({
        text: oge.item.str.trim(),
        sayfa: sayfaNo,
        sira: satirlar.length,
        kaynak: 'PDF_METIN',
        bbox: ogeKutusu,
        tokenler: [token]
      });
    }
  }

  return satirlar;
}

async function renderPdfPageToCanvas(
  veri: ArrayBuffer,
  sayfaNo: number,
  scale = 2
): Promise<HTMLCanvasElement> {
  const { getDocument, GlobalWorkerOptions, version: pdfVersion } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.mjs`;
  const pdf = await getDocument({ data: veri }).promise;
  const sayfa = await pdf.getPage(sayfaNo);
  const viewport = sayfa.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('PDF sayfası canvas context üretilemedi.');
  await sayfa.render({ canvas, viewport }).promise;
  return canvas;
}

async function pdfAnalizEt(veri: ArrayBuffer): Promise<OcrAnalizSonucu> {
  const { getDocument, GlobalWorkerOptions, version: pdfVersion } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.mjs`;
  const pdf = await getDocument({ data: veri }).promise;
  let metin = '';
  const satirlar: OcrSatiri[] = [];

  for (let sayfaNo = 1; sayfaNo <= pdf.numPages; sayfaNo += 1) {
    const sayfa = await pdf.getPage(sayfaNo);
    const viewport = sayfa.getViewport({ scale: 1 });
    const icerik = await sayfa.getTextContent();
    const ogeSatirlari = pdfSatirlariniGrupla(
      icerik.items.filter(isPdfTextItem),
      { width: viewport.width, height: viewport.height },
      sayfaNo
    );
    if (ogeSatirlari.length) {
      metin += `${ogeSatirlari.map((satir) => satir.text).join('\n')}\n`;
      satirlar.push(...ogeSatirlari);
    }
  }

  if (metin.replace(/\s/g, '').length > 30) {
    return { metin: metin.trim(), satirlar, sayfaSayisi: pdf.numPages };
  }

  const ilkSayfaCanvasi = await renderPdfPageToCanvas(veri, 1, 2);
  const ocrSonucu = await ocrAnalizEt(ilkSayfaCanvasi, 1);
  const birlesikMetin = `${metin}\n${ocrSonucu.metin}`.trim();
  return {
    metin: birlesikMetin,
    satirlar: [...satirlar, ...ocrSonucu.satirlar],
    sayfaSayisi: pdf.numPages
  };
}

async function gorselCanvasiOlustur(dosya: Pick<DekontDosyasi, 'previewUrl'>): Promise<HTMLCanvasElement> {
  if (!dosya.previewUrl) throw new Error('Görsel kaynağı bulunamadı.');
  return new Promise((resolve, reject) => {
    if (!dosya.previewUrl) {
      reject(new Error('Görsel kaynağı bulunamadı.'));
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Görsel canvas context üretilemedi.'));
        return;
      }
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
    img.src = dosya.previewUrl;
  });
}

function cropCanvas(
  canvas: HTMLCanvasElement,
  bbox: DekontNormalizedBbox
): BelgeBolgesiCanvasSonucu {
  const paddingX = Math.max(4, Math.round(canvas.width * 0.02));
  const paddingY = Math.max(4, Math.round(canvas.height * 0.02));
  const x0 = Math.max(0, Math.floor(bbox.x * canvas.width) - paddingX);
  const y0 = Math.max(0, Math.floor(bbox.y * canvas.height) - paddingY);
  const x1 = Math.min(canvas.width, Math.ceil((bbox.x + bbox.width) * canvas.width) + paddingX);
  const y1 = Math.min(canvas.height, Math.ceil((bbox.y + bbox.height) * canvas.height) + paddingY);
  const width = Math.max(16, x1 - x0);
  const height = Math.max(16, y1 - y0);
  const hedef = document.createElement('canvas');
  hedef.width = width;
  hedef.height = height;
  const context = hedef.getContext('2d');
  if (!context) throw new Error('Bölge canvas context üretilemedi.');
  context.drawImage(canvas, x0, y0, width, height, 0, 0, width, height);
  return {
    canvas: hedef,
    belgeBbox: {
      x: x0 / canvas.width,
      y: y0 / canvas.height,
      width: width / canvas.width,
      height: height / canvas.height
    }
  };
}

function bboxIcineBboxMaple(
  dis: DekontNormalizedBbox,
  ic: DekontNormalizedBbox | undefined
): DekontNormalizedBbox | undefined {
  if (!ic) return dis;
  return {
    x: clamp01(dis.x + ic.x * dis.width),
    y: clamp01(dis.y + ic.y * dis.height),
    width: clamp01(ic.width * dis.width),
    height: clamp01(ic.height * dis.height)
  };
}

function alanIcinAdaylariBul(
  alan: DekontAlanAdi,
  satirlar: OcrSatiri[],
  metin: string
): DekontAlanAdayi[] {
  const detay = ocrAlanModelleriniOlustur(satirlar, metin);
  const secili = detay.alanModelleri[alan];
  if (!secili) return [];
  const adaylar = [
    adayOlustur(
      alan,
      secili.ocrDegeri ?? alanDegeriniMetneCevir(alan, secili.guncelDeger ?? ''),
      secili.guncelDeger,
      secili.kaynak,
      [],
      secili.sayfa,
      secili.bbox,
      secili.guven
    ),
    ...(secili.alternatifAdaylar ?? [])
  ];
  return benzersizAdaylariSirala(adaylar.map((aday) => ({ aday, puan: aday.guven ?? 0 })));
}

export async function dekontOcrOku(
  dosya: Pick<DekontDosyasi, 'previewUrl' | 'tur' | 'kaynakVeri'>
): Promise<DekontOcrSonucu> {
  if (!dosya.previewUrl) {
    return {
      durum: 'BASARISIZ',
      alanlar: {},
      okunanAlanlar: [],
      guven: {},
      alanModelleri: {},
      ilkDegerleri: {},
      sayfaSayisi: 0
    };
  }

  const analiz =
    dosya.tur === 'PDF' && dosya.kaynakVeri
      ? await pdfAnalizEt(dosya.kaynakVeri)
      : {
          ...(await ocrAnalizEt(dosya.previewUrl, 1)),
          sayfaSayisi: 1
        };

  const detay = ocrAlanModelleriniOlustur(analiz.satirlar, analiz.metin);
  return {
    durum:
      detay.okunanAlanlar.length >= 3
        ? 'BASARILI'
        : detay.okunanAlanlar.length
          ? 'KISMI'
          : 'BASARISIZ',
    ...detay,
    sayfaSayisi: analiz.sayfaSayisi
  };
}

export async function dekontBolgesiniTekrarOku({
  dosya,
  alan,
  bbox,
  sayfa = 1
}: {
  dosya: Pick<DekontDosyasi, 'previewUrl' | 'tur' | 'kaynakVeri'>;
  alan: DekontAlanAdi;
  bbox: DekontNormalizedBbox;
  sayfa?: number;
}): Promise<DekontBolgeOcrSonucu> {
  const tamCanvas =
    dosya.tur === 'PDF' && dosya.kaynakVeri
      ? await renderPdfPageToCanvas(dosya.kaynakVeri, sayfa, 2.5)
      : await gorselCanvasiOlustur(dosya);
  const bolge = cropCanvas(tamCanvas, bbox);
  const params: Partial<TesseractWorkerParams> = {};
  if (alan === 'dekontNo' || alan === 'bankaReferansNo') {
    params.tessedit_char_whitelist =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./_-';
  }
  if (alan === 'tarih') {
    params.tessedit_char_whitelist = '0123456789./-: ';
  }
  const ocr = await ocrAnalizEt(bolge.canvas, sayfa, undefined, params);
  const adaylar = alanIcinAdaylariBul(alan, ocr.satirlar, ocr.metin).map((aday) => ({
    ...aday,
    sayfa,
    bbox: bboxIcineBboxMaple(bolge.belgeBbox, aday.bbox)
  }));
  return {
    adaylar,
    hamMetin: ocr.metin,
    guven: ocr.guven
  };
}
