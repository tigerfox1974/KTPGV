import type {
  DekontAlanAdi,
  DekontAlanAdayi,
  DekontAlanDegeri,
  DekontAlanDegerleri,
  DekontAlanDurumu,
  DekontAlanKaynagi,
  DekontKonumluAlan,
  DekontNormalizedBbox
} from '../../../types';
import { formatTL } from '../../../utils/currency';
import { normalizeBankaAdi, normalizeDekontNo } from '../../../utils/dekontOcr';

export const DEKONT_ALAN_SIRASI: DekontAlanAdi[] = [
  'dekontNo',
  'bankaReferansNo',
  'banka',
  'tarih',
  'odenenTutar',
  'odemeYapan'
];

export const ZORUNLU_DEKONT_ALANLARI: DekontAlanAdi[] = [
  'dekontNo',
  'banka',
  'tarih',
  'odenenTutar',
  'odemeYapan'
];

export const DEKONT_ALAN_ETIKETLERI: Record<DekontAlanAdi, string> = {
  dekontNo: 'Belge / Dekont No',
  bankaReferansNo: 'Banka Referans No',
  banka: 'Banka',
  tarih: 'Dekont Tarihi',
  odenenTutar: 'Ödenen Tutar',
  odemeYapan: 'Ödeme Yapan'
};

export const MONO_ALANLAR = new Set<DekontAlanAdi>(['dekontNo', 'bankaReferansNo']);

export interface DekontSorunu {
  id: string;
  alan?: DekontAlanAdi;
  tur:
    | 'MUKERRERLIK'
    | 'BENZER_ODEME'
    | 'GELECEK_TARIH'
    | 'EKSIK'
    | 'DOGRULAMA'
    | 'DUSUK_GUVEN'
    | 'CELISKI'
    | 'TUTAR_FARKI';
  seviye: 'hata' | 'uyari' | 'bilgi';
  oncelik: number;
  baslik: string;
  aciklama: string;
}

export interface DekontSorunGirdisi {
  alanlar: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>;
  gecerliDegerler: Partial<DekontAlanDegerleri>;
  beklenenTutar: number;
  tutarKurali: 'ESIT_OLMALI' | 'POZITIF_OLMALI';
  duplicateKayitNo?: string;
  duplicateReferansKayitNo?: string;
  duplicateDosyaKayitNo?: string;
  benzerKayitNo?: string;
  gelecekTarih?: boolean;
}

function clamp01(deger: number): number {
  if (!Number.isFinite(deger)) return 0;
  if (deger < 0) return 0;
  if (deger > 1) return 1;
  return deger;
}

export function alanDegeriBosMu(deger: DekontAlanDegeri | undefined): boolean {
  if (deger === undefined || deger === null) return true;
  if (typeof deger === 'number') return !(deger > 0);
  return deger.trim() === '';
}

export function alanKontroluKorumaliMi(durum: DekontAlanDurumu | undefined): boolean {
  return durum === 'DUZELTILDI' || durum === 'DOGRULANDI';
}

export function alanDegeriniNormalizeEt(alan: DekontAlanAdi, deger: DekontAlanDegeri): string {
  if (alan === 'odenenTutar' && typeof deger === 'number') return deger.toFixed(2);
  if (alan === 'banka') return normalizeBankaAdi(String(deger)).toLocaleUpperCase('tr-TR');
  if (alan === 'tarih') return String(deger).trim();
  if (alan === 'dekontNo') return normalizeDekontNo(String(deger)).replace(/\s/g, '');
  if (alan === 'bankaReferansNo') return normalizeDekontNo(String(deger));
  return String(deger).replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR');
}

export function alanDegeriniGoster(alan: DekontAlanAdi, deger: DekontAlanDegeri | undefined): string {
  if (deger === undefined) return '—';
  if (alan === 'odenenTutar' && typeof deger === 'number') return formatTL(deger);
  return String(deger);
}

export function alanDogrulandiMi(alan: DekontKonumluAlan | undefined): boolean {
  return alan?.durum === 'DOGRULANDI' || alan?.durum === 'DUZELTILDI';
}

function uniqueAlternatives(
  alan: DekontAlanAdi,
  adaylar: DekontAlanAdayi[]
): DekontAlanAdayi[] {
  const benzersiz = new Map<string, DekontAlanAdayi>();
  for (const aday of adaylar) {
    const anahtar = aday.deger
      ? alanDegeriniNormalizeEt(alan, aday.deger)
      : aday.degerMetni.toLocaleUpperCase('tr-TR');
    if (!anahtar) continue;
    const mevcut = benzersiz.get(anahtar);
    if (!mevcut || (aday.guven ?? 0) > (mevcut.guven ?? 0)) {
      benzersiz.set(anahtar, aday);
    }
  }
  return [...benzersiz.values()].sort((sol, sag) => (sag.guven ?? 0) - (sol.guven ?? 0));
}

function alaninKendisiniAdayaDonustur(
  alan: DekontKonumluAlan
): DekontAlanAdayi | undefined {
  if (alan.guncelDeger === undefined) return undefined;
  return {
    id: `${alan.alan}-guncel`,
    alan: alan.alan,
    degerMetni: alan.ocrDegeri ?? String(alan.guncelDeger),
    deger: alan.guncelDeger,
    kaynak: alan.kaynak,
    guven: alan.guven,
    sayfa: alan.sayfa,
    bbox: alan.bbox,
    supheliKarakterler: alan.supheliKarakterler
  };
}

export function ocrAdayiniUygula(
  mevcut: DekontKonumluAlan | undefined,
  aday: DekontAlanAdayi,
  kaynak: DekontAlanKaynagi
): DekontKonumluAlan {
  const oncekiAdaylar = uniqueAlternatives(
    aday.alan,
    [
      ...(mevcut?.alternatifAdaylar ?? []),
      ...(mevcut ? [alaninKendisiniAdayaDonustur(mevcut)].filter(Boolean) as DekontAlanAdayi[] : [])
    ]
  ).filter(
    (mevcutAday) =>
      alanDegeriniNormalizeEt(aday.alan, mevcutAday.deger ?? mevcutAday.degerMetni) !==
      alanDegeriniNormalizeEt(aday.alan, aday.deger ?? aday.degerMetni)
  );

  return {
    alan: aday.alan,
    ocrDegeri: mevcut?.ocrDegeri ?? aday.degerMetni,
    guncelDeger: aday.deger ?? aday.degerMetni,
    kaynak,
    durum: 'DUZELTILDI',
    guven: aday.guven,
    sayfa: aday.sayfa ?? mevcut?.sayfa,
    bbox: aday.bbox ?? mevcut?.bbox,
    alternatifAdaylar: oncekiAdaylar,
    supheliKarakterler: aday.supheliKarakterler ?? mevcut?.supheliKarakterler
  };
}

export function kullaniciDegeriniUygula(
  alanAdi: DekontAlanAdi,
  mevcut: DekontKonumluAlan | undefined,
  deger: DekontAlanDegeri,
  kaynak: DekontAlanKaynagi = 'KULLANICI'
): DekontKonumluAlan {
  return {
    alan: alanAdi,
    ocrDegeri: mevcut?.ocrDegeri ?? String(deger),
    guncelDeger: deger,
    kaynak,
    durum: 'DUZELTILDI',
    guven: mevcut?.guven,
    sayfa: mevcut?.sayfa,
    bbox: mevcut?.bbox,
    alternatifAdaylar: uniqueAlternatives(
      alanAdi,
      [
        ...(mevcut?.alternatifAdaylar ?? []),
        ...(mevcut ? [alaninKendisiniAdayaDonustur(mevcut)].filter(Boolean) as DekontAlanAdayi[] : [])
      ]
    ).filter(
      (aday) =>
        alanDegeriniNormalizeEt(alanAdi, aday.deger ?? aday.degerMetni) !==
        alanDegeriniNormalizeEt(alanAdi, deger)
    ),
    supheliKarakterler: mevcut?.supheliKarakterler
  };
}

export function alaniDogrula(
  alanAdi: DekontAlanAdi,
  mevcut: DekontKonumluAlan | undefined,
  deger: DekontAlanDegeri | undefined
): DekontKonumluAlan | undefined {
  if (deger === undefined) return mevcut;
  return {
    alan: alanAdi,
    ocrDegeri: mevcut?.ocrDegeri ?? String(deger),
    guncelDeger: deger,
    kaynak: mevcut?.kaynak ?? 'KULLANICI',
    durum: 'DOGRULANDI',
    guven: mevcut?.guven,
    sayfa: mevcut?.sayfa,
    bbox: mevcut?.bbox,
    alternatifAdaylar: mevcut?.alternatifAdaylar,
    supheliKarakterler: mevcut?.supheliKarakterler
  };
}

export function ocrAlanlariniBirlestir(
  mevcut: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>,
  gelen: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>
): Partial<Record<DekontAlanAdi, DekontKonumluAlan>> {
  const sonuc: Partial<Record<DekontAlanAdi, DekontKonumluAlan>> = { ...mevcut };
  for (const alan of DEKONT_ALAN_SIRASI) {
    const onceki = mevcut[alan];
    const yeni = gelen[alan];
    if (!yeni) continue;
    if (!onceki) {
      sonuc[alan] = yeni;
      continue;
    }

    const yeniAdayi = alaninKendisiniAdayaDonustur(yeni);
    const birlesikAdaylar = uniqueAlternatives(
      alan,
      [
        ...(onceki.alternatifAdaylar ?? []),
        ...(yeni.alternatifAdaylar ?? []),
        ...(yeniAdayi ? [yeniAdayi] : [])
      ]
    );

    if (alanKontroluKorumaliMi(onceki.durum)) {
      sonuc[alan] = {
        ...onceki,
        alternatifAdaylar: birlesikAdaylar.filter(
          (aday) =>
            alanDegeriniNormalizeEt(alan, aday.deger ?? aday.degerMetni) !==
            alanDegeriniNormalizeEt(alan, onceki.guncelDeger ?? '')
        ),
        ocrDegeri: onceki.ocrDegeri ?? yeni.ocrDegeri,
        guven: onceki.guven ?? yeni.guven,
        sayfa: onceki.sayfa ?? yeni.sayfa,
        bbox: onceki.bbox ?? yeni.bbox,
        supheliKarakterler: onceki.supheliKarakterler ?? yeni.supheliKarakterler
      };
      continue;
    }

    sonuc[alan] = {
      ...yeni,
      alternatifAdaylar: birlesikAdaylar.filter(
        (aday) =>
          alanDegeriniNormalizeEt(alan, aday.deger ?? aday.degerMetni) !==
          alanDegeriniNormalizeEt(alan, yeni.guncelDeger ?? '')
      ),
      ocrDegeri: onceki.ocrDegeri ?? yeni.ocrDegeri
    };
  }
  return sonuc;
}

export function alanlardanKayitDegerleri(
  alanlar: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>
): Partial<DekontAlanDegerleri> {
  const sonuc: Partial<DekontAlanDegerleri> = {};
  if (typeof alanlar.dekontNo?.guncelDeger === 'string') sonuc.dekontNo = alanlar.dekontNo.guncelDeger;
  if (typeof alanlar.bankaReferansNo?.guncelDeger === 'string') {
    sonuc.bankaReferansNo = alanlar.bankaReferansNo.guncelDeger;
  }
  if (typeof alanlar.banka?.guncelDeger === 'string') sonuc.banka = alanlar.banka.guncelDeger;
  if (typeof alanlar.tarih?.guncelDeger === 'string') sonuc.tarih = alanlar.tarih.guncelDeger;
  if (typeof alanlar.odenenTutar?.guncelDeger === 'number') sonuc.odenenTutar = alanlar.odenenTutar.guncelDeger;
  if (typeof alanlar.odemeYapan?.guncelDeger === 'string') sonuc.odemeYapan = alanlar.odemeYapan.guncelDeger;
  return sonuc;
}

export function kontrolEdilenAlanSayisi(
  alanlar: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>
): number {
  return ZORUNLU_DEKONT_ALANLARI.filter((alan) => alanDogrulandiMi(alanlar[alan])).length;
}

export function siradakiAlaniBul(
  alanlar: Partial<Record<DekontAlanAdi, DekontKonumluAlan>>,
  baslangicAlani?: DekontAlanAdi
): DekontAlanAdi {
  const sorunlu = DEKONT_ALAN_SIRASI.find(
    (alan) => !alanDogrulandiMi(alanlar[alan]) || alanDegeriBosMu(alanlar[alan]?.guncelDeger)
  );
  if (sorunlu) return sorunlu;
  if (!baslangicAlani) return DEKONT_ALAN_SIRASI[0];
  const baslangicIndex = DEKONT_ALAN_SIRASI.indexOf(baslangicAlani);
  return DEKONT_ALAN_SIRASI[(baslangicIndex + 1) % DEKONT_ALAN_SIRASI.length];
}

function alanDizisiCeliskiliMi(alan: DekontKonumluAlan | undefined): boolean {
  if (!alan?.alternatifAdaylar?.length || alan.guncelDeger === undefined) return false;
  const guncel = alanDegeriniNormalizeEt(alan.alan, alan.guncelDeger);
  return alan.alternatifAdaylar.some(
    (aday) =>
      aday.deger !== undefined && alanDegeriniNormalizeEt(alan.alan, aday.deger) !== guncel
  );
}

export function dekontSorunlariniOlustur(girdi: DekontSorunGirdisi): DekontSorunu[] {
  const sorunlar: DekontSorunu[] = [];
  if (girdi.duplicateKayitNo) {
    sorunlar.push({
      id: 'duplicate-dekont',
      tur: 'MUKERRERLIK',
      seviye: 'hata',
      oncelik: 100,
      baslik: 'Mükerrer dekont',
      aciklama: `Aynı dekont daha önce ${girdi.duplicateKayitNo} kaydında kullanılmış.`
    });
  }
  if (girdi.duplicateReferansKayitNo) {
    sorunlar.push({
      id: 'duplicate-referans',
      tur: 'MUKERRERLIK',
      seviye: 'hata',
      oncelik: 99,
      baslik: 'Mükerrer banka referansı',
      aciklama: `Aynı banka referansı ${girdi.duplicateReferansKayitNo} kaydında zaten var.`
    });
  }
  if (girdi.duplicateDosyaKayitNo) {
    sorunlar.push({
      id: 'duplicate-dosya',
      tur: 'MUKERRERLIK',
      seviye: 'hata',
      oncelik: 98,
      baslik: 'Mükerrer dijital dosya',
      aciklama: `Bu dijital dekont dosyası ${girdi.duplicateDosyaKayitNo} kaydında kullanılmış.`
    });
  }
  if (girdi.gelecekTarih) {
    sorunlar.push({
      id: 'future-date',
      alan: 'tarih',
      tur: 'GELECEK_TARIH',
      seviye: 'hata',
      oncelik: 97,
      baslik: 'Gelecek tarih',
      aciklama: 'Dekont tarihi bugünden ileri olamaz.'
    });
  }
  if (girdi.benzerKayitNo) {
    sorunlar.push({
      id: 'similar-payment',
      tur: 'BENZER_ODEME',
      seviye: 'uyari',
      oncelik: 72,
      baslik: 'Benzer ödeme kaydı',
      aciklama: `Tarih, banka, tutar ve ödeme yapan bilgisi ${girdi.benzerKayitNo} kaydıyla benziyor.`
    });
  }

  for (const alan of DEKONT_ALAN_SIRASI) {
    const model = girdi.alanlar[alan];
    const deger = girdi.gecerliDegerler[alan];
    const zorunlu = ZORUNLU_DEKONT_ALANLARI.includes(alan);
    if (zorunlu && alanDegeriBosMu(deger)) {
      sorunlar.push({
        id: `eksik-${alan}`,
        alan,
        tur: 'EKSIK',
        seviye: 'hata',
        oncelik: 90,
        baslik: `${DEKONT_ALAN_ETIKETLERI[alan]} eksik`,
        aciklama: 'Alan boş. Belgeden seçin veya manuel girin.'
      });
      continue;
    }
    if (zorunlu && !alanDogrulandiMi(model)) {
      sorunlar.push({
        id: `dogrulama-${alan}`,
        alan,
        tur: 'DOGRULAMA',
        seviye: 'uyari',
        oncelik: 80,
        baslik: `${DEKONT_ALAN_ETIKETLERI[alan]} doğrulanmadı`,
        aciklama: 'Zorunlu alan kullanıcı tarafından doğrulanmadan kontrol tamamlanamaz.'
      });
    }
    if (model && (model.guven ?? 0) > 0 && (model.guven ?? 0) < 78) {
      sorunlar.push({
        id: `guven-${alan}`,
        alan,
        tur: 'DUSUK_GUVEN',
        seviye: 'uyari',
        oncelik: 68,
        baslik: `${DEKONT_ALAN_ETIKETLERI[alan]} düşük güven`,
        aciklama: `OCR güveni ${(model.guven ?? 0).toFixed(0)}. Lütfen belge üzerinde kontrol edin.`
      });
    }
    if (alanDizisiCeliskiliMi(model)) {
      sorunlar.push({
        id: `celiski-${alan}`,
        alan,
        tur: 'CELISKI',
        seviye: 'uyari',
        oncelik: 67,
        baslik: `${DEKONT_ALAN_ETIKETLERI[alan]} için birden fazla aday`,
        aciklama: 'OCR aynı alan için farklı adaylar buldu; doğru değeri seçin.'
      });
    }
  }

  const odenenTutar = girdi.gecerliDegerler.odenenTutar ?? 0;
  if (girdi.tutarKurali === 'ESIT_OLMALI') {
    const fark = Number((odenenTutar - girdi.beklenenTutar).toFixed(2));
    if (odenenTutar > 0 && Math.abs(fark) >= 0.01) {
      sorunlar.push({
        id: 'tutar-esit-degil',
        alan: 'odenenTutar',
        tur: 'TUTAR_FARKI',
        seviye: 'hata',
        oncelik: 95,
        baslik: 'Dekont tutarı eşleşmiyor',
        aciklama: `Hesaplanan tutar ${formatTL(girdi.beklenenTutar)}, dekonttaki tutar ${formatTL(odenenTutar)}.`
      });
    }
  } else if (odenenTutar > 0) {
    const fark = Number((odenenTutar - girdi.beklenenTutar).toFixed(2));
    if (Math.abs(fark) >= 0.01) {
      sorunlar.push({
        id: 'tutar-hedef-farki',
        alan: 'odenenTutar',
        tur: 'TUTAR_FARKI',
        seviye: 'bilgi',
        oncelik: 40,
        baslik: fark > 0 ? 'Hedefe göre fazla ödeme' : 'Hedefe göre eksik ödeme',
        aciklama: `Talep hedefi ${formatTL(girdi.beklenenTutar)}, dekonttaki tutar ${formatTL(odenenTutar)}.`
      });
    }
  }

  return sorunlar.sort((sol, sag) => sag.oncelik - sol.oncelik || sol.baslik.localeCompare(sag.baslik, 'tr'));
}

function bigramlar(metin: string): string[] {
  const temiz = metin
    .toLocaleUpperCase('tr-TR')
    .replace(/[^A-ZÇĞİÖŞÜ0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (temiz.length < 2) return temiz ? [temiz] : [];
  const sonuc: string[] = [];
  for (let index = 0; index < temiz.length - 1; index += 1) {
    sonuc.push(temiz.slice(index, index + 2));
  }
  return sonuc;
}

export function metinBenzerlikSkoru(sol: string, sag: string): number {
  const solBigram = bigramlar(sol);
  const sagBigram = bigramlar(sag);
  if (!solBigram.length || !sagBigram.length) return 0;
  const sagSayac = new Map<string, number>();
  for (const parca of sagBigram) {
    sagSayac.set(parca, (sagSayac.get(parca) ?? 0) + 1);
  }
  let kesisim = 0;
  for (const parca of solBigram) {
    const adet = sagSayac.get(parca) ?? 0;
    if (adet > 0) {
      kesisim += 1;
      sagSayac.set(parca, adet - 1);
    }
  }
  return Number(((2 * kesisim) / (solBigram.length + sagBigram.length)).toFixed(2));
}

export function alanTonSinifi(
  alan: DekontKonumluAlan | undefined
): { kenarlik: string; etiket: string } {
  if (!alan) {
    return { kenarlik: 'border-amber-400 bg-amber-500/10', etiket: 'bg-amber-500 text-white' };
  }
  if (alan.durum === 'DOGRULANDI') {
    return { kenarlik: 'border-emerald-400 bg-emerald-500/10', etiket: 'bg-emerald-600 text-white' };
  }
  if (alan.durum === 'DUZELTILDI') {
    return { kenarlik: 'border-indigo-400 bg-indigo-500/10', etiket: 'bg-indigo-600 text-white' };
  }
  if ((alan.guven ?? 0) > 0 && (alan.guven ?? 0) < 78) {
    return { kenarlik: 'border-amber-400 bg-amber-500/10', etiket: 'bg-amber-500 text-white' };
  }
  return { kenarlik: 'border-sky-400 bg-sky-500/10', etiket: 'bg-sky-600 text-white' };
}

export function normalizeBboxForRotation(
  bbox: DekontNormalizedBbox,
  rotation: 0 | 90 | 180 | 270
): DekontNormalizedBbox {
  if (rotation === 90) {
    return {
      x: clamp01(1 - (bbox.y + bbox.height)),
      y: clamp01(bbox.x),
      width: clamp01(bbox.height),
      height: clamp01(bbox.width)
    };
  }
  if (rotation === 180) {
    return {
      x: clamp01(1 - (bbox.x + bbox.width)),
      y: clamp01(1 - (bbox.y + bbox.height)),
      width: clamp01(bbox.width),
      height: clamp01(bbox.height)
    };
  }
  if (rotation === 270) {
    return {
      x: clamp01(bbox.y),
      y: clamp01(1 - (bbox.x + bbox.width)),
      width: clamp01(bbox.height),
      height: clamp01(bbox.width)
    };
  }
  return bbox;
}

export function normalizeBboxFromDisplay(
  bbox: DekontNormalizedBbox,
  rotation: 0 | 90 | 180 | 270
): DekontNormalizedBbox {
  if (rotation === 0) return bbox;
  if (rotation === 90) return normalizeBboxForRotation(bbox, 270);
  if (rotation === 180) return normalizeBboxForRotation(bbox, 180);
  return normalizeBboxForRotation(bbox, 90);
}
