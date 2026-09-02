import {
  BagisMakbuzTuru,
  BagisMakbuzu,
  Dekont,
  DekontDogrulamaDurumu,
  DekontTutarDagilimi,
  Islem,
  IslemDurumu,
  KrediTalebiOdemeOzeti
} from '../types';

const KURUS_CARPANI = 100;
const LEGACY_DOGRULANMIS_DURUMLAR: IslemDurumu[] = [
  'ODEME_DOGRULANDI',
  'ISLEM_BASLATILABILIR',
  'TAMAMLANDI'
];

export interface KrediYuklemeDekontGirdisi
extends
Pick<
Dekont,
'dekontNo' |
'odenenTutar' |
'banka' |
'bankaReferansNo' |
'tarih' |
'odemeYapan' |
'dogrulamaDurumu' |
'dogrulamaZamani' |
'tutarDagilimi' |
'bagisMakbuzlari'
> {
  id?: string;
}

export interface DekontDagilimSonucu {
  sira: number;
  dekontKimligi: string;
  dekontNo: string;
  odenenTutar: number;
  krediyeAyrilanTutar: number;
  genelBagisTutari: number;
  kalanHedef: number;
  bekleyenBakiye: number;
  kullanilabilirKrediAdedi: number;
  tutarDagilimi: DekontTutarDagilimi[];
}

export interface KrediYuklemeHesapSonucu extends KrediTalebiOdemeOzeti {
  talepEdilenKrediAdedi: number;
  birimKrediBedeli: number;
  dekontDagilimlari: DekontDagilimSonucu[];
}

export interface EksikBagisMakbuzu {
  dekontKimligi: string;
  bagliDekontId?: string;
  bagliDekontNo: string;
  bagliDekontReferansi?: string;
  bagliDekontTarihi?: string;
  odemeYapan?: string;
  tur: BagisMakbuzTuru;
  tutar: number;
}

export interface KrediYuklemeKayitCozumleSonucu {
  tumDekontOzeti: KrediYuklemeHesapSonucu;
  dogrulanmisOzeti: KrediYuklemeHesapSonucu;
  krediTalebiOdemeOzeti: KrediTalebiOdemeOzeti;
  guncelDekontlar: Dekont[];
  bagisMakbuzlari: BagisMakbuzu[];
  makbuzEksikleri: EksikBagisMakbuzu[];
  yeniYuklemeAdedi: number;
  kayitDurumu: IslemDurumu;
  makbuzNoAlias: string | null;
  bekleyenDekontSayisi: number;
}

export interface DekontKayitKaynagi<TIslem extends Pick<Islem, 'id' | 'kayitNo' | 'dekont' | 'dekontlar'>> {
  islem: TIslem;
  dekont: Dekont;
}

export interface DekontMukerrerlikSonucu<TIslem extends Pick<Islem, 'id' | 'kayitNo' | 'dekont' | 'dekontlar'>> {
  duplicateDekont?: DekontKayitKaynagi<TIslem>;
  duplicateReferans?: DekontKayitKaynagi<TIslem>;
  duplicateDosya?: DekontKayitKaynagi<TIslem>;
  benzerKayit?: DekontKayitKaynagi<TIslem>;
}

function kurusaCevir(tutar: number): number {
  if (!Number.isFinite(tutar)) return 0;
  return Math.round((tutar + Number.EPSILON) * KURUS_CARPANI);
}

function tlYeCevir(kurus: number): number {
  return Number((kurus / KURUS_CARPANI).toFixed(2));
}

function ayniTutarMi(sol: number, sag: number): boolean {
  return kurusaCevir(sol) === kurusaCevir(sag);
}

function kayitLegacyDogrulandiMi(islem: Pick<Islem, 'durum' | 'makbuzNo'>): boolean {
  return !!islem.makbuzNo || LEGACY_DOGRULANMIS_DURUMLAR.includes(islem.durum);
}

function bagisMakbuzuKimligi(makbuz: BagisMakbuzu): string {
  return [
  makbuz.makbuzNo ?? '',
  makbuz.tur,
  makbuz.bagliDekontId ?? '',
  makbuz.bagliDekontNo ?? '',
  makbuz.bagliDekontReferansi ?? '',
  kurusaCevir(makbuz.tutar).toString()]
  .join('|');
}

function dekontNoNormalizeEt(deger?: string): string {
  return (deger ?? '').trim().toLocaleUpperCase('tr-TR').replace(/[^A-Z0-9]/g, '');
}

function bagisMakbuzuDagilimaAitMi(
makbuz: BagisMakbuzu,
dagilim: Pick<EksikBagisMakbuzu, 'tur' | 'tutar' | 'bagliDekontId' | 'bagliDekontNo' | 'bagliDekontReferansi'>)
: boolean {
  const ayniDekont =
  (dagilim.bagliDekontId && makbuz.bagliDekontId === dagilim.bagliDekontId) ||
  (!!dagilim.bagliDekontReferansi &&
  !!makbuz.bagliDekontReferansi &&
  makbuz.bagliDekontReferansi === dagilim.bagliDekontReferansi) ||
  makbuz.bagliDekontNo === dagilim.bagliDekontNo;
  return ayniDekont && makbuz.tur === dagilim.tur && ayniTutarMi(makbuz.tutar, dagilim.tutar);
}

function dagilimOlustur(
krediyeAyrilanKurusu: number,
genelBagisKurusu: number,
bagliMakbuzlar?: Partial<Record<BagisMakbuzTuru, string | null>>)
: DekontTutarDagilimi[] {
  const dagilimlar: DekontTutarDagilimi[] = [];

  if (krediyeAyrilanKurusu > 0) {
    dagilimlar.push({
      amac: 'TAS_OCAGI_PATLATMASI',
      tutar: tlYeCevir(krediyeAyrilanKurusu),
      bagliMakbuzNo: bagliMakbuzlar?.TAS_OCAGI_PATLATMASI ?? null
    });
  }

  if (genelBagisKurusu > 0) {
    dagilimlar.push({
      amac: 'GENEL_VAKIF_BAGISI',
      tutar: tlYeCevir(genelBagisKurusu),
      bagliMakbuzNo: bagliMakbuzlar?.GENEL_VAKIF_BAGISI ?? null
    });
  }

  return dagilimlar;
}

export function bagisMakbuzTuruEtiketi(tur: BagisMakbuzTuru): string {
  return tur === 'TAS_OCAGI_PATLATMASI' ? 'Taş Ocağı Patlatması Bağışı' : 'Genel Vakıf Bağışı';
}

export function dekontDogrulamaDurumuEtiketi(durum?: DekontDogrulamaDurumu): string {
  if (durum === 'DOGRULANDI') return 'Doğrulandı';
  if (durum === 'KONTROL_EDILDI') return 'Kontrol edildi';
  if (durum === 'REDDEDILDI') return 'Reddedildi';
  return 'Doğrulama bekliyor';
}

export function krediYuklemeDekontKimligi(
dekont: Pick<KrediYuklemeDekontGirdisi, 'id' | 'bankaReferansNo' | 'dekontNo'>,
sira: number)
: string {
  return dekont.id || dekont.bankaReferansNo || dekont.dekontNo || `dekont-${sira + 1}`;
}

export function dekontDogrulandiMi(
dekont: Pick<KrediYuklemeDekontGirdisi, 'dogrulamaDurumu'>)
: boolean {
  return dekont.dogrulamaDurumu === 'DOGRULANDI';
}

export function krediYuklemeDagiliminiHesapla({
  talepEdilenKrediAdedi,
  birimKrediBedeli,
  dekontlar
}: {
  talepEdilenKrediAdedi: number;
  birimKrediBedeli: number;
  dekontlar: KrediYuklemeDekontGirdisi[];
}): KrediYuklemeHesapSonucu {
  const talepAdedi =
  Number.isFinite(talepEdilenKrediAdedi) && talepEdilenKrediAdedi > 0 ?
  Math.floor(talepEdilenKrediAdedi) :
  0;
  const birimKrediKurusu = Math.max(kurusaCevir(birimKrediBedeli), 0);
  const hedefKurusu = talepAdedi * birimKrediKurusu;

  let toplamOdenenKurusu = 0;
  let krediyeAyrilanToplamKurusu = 0;
  let genelBagisToplamKurusu = 0;

  const dekontDagilimlari = dekontlar.map((dekont, sira) => {
    const dekontKurusu = Math.max(kurusaCevir(dekont.odenenTutar), 0);
    toplamOdenenKurusu += dekontKurusu;

    const kalanHedefKurusu = Math.max(hedefKurusu - krediyeAyrilanToplamKurusu, 0);
    const krediyeAyrilanKurusu = Math.min(dekontKurusu, kalanHedefKurusu);
    const genelBagisKurusu = dekontKurusu - krediyeAyrilanKurusu;

    krediyeAyrilanToplamKurusu += krediyeAyrilanKurusu;
    genelBagisToplamKurusu += genelBagisKurusu;

    const kullanilabilirKrediAdedi =
    birimKrediKurusu > 0 ?
    Math.min(Math.floor(krediyeAyrilanToplamKurusu / birimKrediKurusu), talepAdedi) :
    0;
    const talepTamamlandi = krediyeAyrilanToplamKurusu >= hedefKurusu;
    const bekleyenBakiyeKurusu =
    !birimKrediKurusu || talepTamamlandi ?
    0 :
    krediyeAyrilanToplamKurusu % birimKrediKurusu;

    return {
      sira,
      dekontKimligi: krediYuklemeDekontKimligi(dekont, sira),
      dekontNo: dekont.dekontNo,
      odenenTutar: tlYeCevir(dekontKurusu),
      krediyeAyrilanTutar: tlYeCevir(krediyeAyrilanKurusu),
      genelBagisTutari: tlYeCevir(genelBagisKurusu),
      kalanHedef: tlYeCevir(Math.max(hedefKurusu - krediyeAyrilanToplamKurusu, 0)),
      bekleyenBakiye: tlYeCevir(bekleyenBakiyeKurusu),
      kullanilabilirKrediAdedi,
      tutarDagilimi: dagilimOlustur(krediyeAyrilanKurusu, genelBagisKurusu)
    };
  });

  const kullanilabilirKrediAdedi =
  birimKrediKurusu > 0 ?
  Math.min(Math.floor(krediyeAyrilanToplamKurusu / birimKrediKurusu), talepAdedi) :
  0;
  const hedefTamamlandi = krediyeAyrilanToplamKurusu >= hedefKurusu;
  const bekleyenBakiyeKurusu =
  !birimKrediKurusu || hedefTamamlandi ?
  0 :
  krediyeAyrilanToplamKurusu % birimKrediKurusu;

  return {
    talepEdilenKrediAdedi: talepAdedi,
    birimKrediBedeli: tlYeCevir(birimKrediKurusu),
    hedefTutar: tlYeCevir(hedefKurusu),
    toplamOdenenTutar: tlYeCevir(toplamOdenenKurusu),
    dogrulanmisOdemeToplami: tlYeCevir(toplamOdenenKurusu),
    krediyeAyrilanToplam: tlYeCevir(krediyeAyrilanToplamKurusu),
    kullanilabilirKrediAdedi,
    bekleyenBakiye: tlYeCevir(bekleyenBakiyeKurusu),
    kalanHedef: tlYeCevir(Math.max(hedefKurusu - krediyeAyrilanToplamKurusu, 0)),
    genelBagisToplami: tlYeCevir(genelBagisToplamKurusu),
    dekontDagilimlari
  };
}

export function islemDekontlariniOku(islem: Pick<Islem, 'dekont' | 'dekontlar'>): Dekont[] {
  if (Array.isArray(islem.dekontlar) && islem.dekontlar.length) {
    return islem.dekontlar;
  }

  return islem.dekont ? [islem.dekont] : [];
}

export function tumIslemDekontKayitlariniDuzlestir<
TIslem extends Pick<Islem, 'id' | 'kayitNo' | 'dekont' | 'dekontlar'>
>(
islemler: TIslem[])
: Array<DekontKayitKaynagi<TIslem>> {
  return islemler.flatMap((islem) =>
    islemDekontlariniOku(islem).map((dekont) => ({ islem, dekont }))
  );
}

export function krediYuklemeDekontMukerrerliginiBul<
TIslem extends Pick<Islem, 'id' | 'kayitNo' | 'dekont' | 'dekontlar'>
>({
  islemler,
  dekontNo,
  banka,
  bankaReferansNo,
  dosyaHash,
  tarih,
  odenenTutar,
  odemeYapan
}: {
  islemler: TIslem[];
  dekontNo?: string;
  banka?: string;
  bankaReferansNo?: string;
  dosyaHash?: string;
  tarih?: string;
  odenenTutar?: number;
  odemeYapan?: string;
}): DekontMukerrerlikSonucu<TIslem> {
  const tumDekontlar = tumIslemDekontKayitlariniDuzlestir(islemler);
  const normalizeBanka = banka?.trim().toLocaleUpperCase('tr-TR');
  const normalizeDekontNo = dekontNoNormalizeEt(dekontNo);
  const normalizeReferans = dekontNoNormalizeEt(bankaReferansNo);
  const normalizeOdeyen = odemeYapan?.trim().toLocaleUpperCase('tr-TR');

  const duplicateDekont =
  normalizeDekontNo && normalizeBanka ?
  tumDekontlar.find(({ dekont }) =>
    dekontNoNormalizeEt(dekont.dekontNo) === normalizeDekontNo &&
    dekont.banka.trim().toLocaleUpperCase('tr-TR') === normalizeBanka) :
  undefined;

  const duplicateReferans =
  normalizeReferans && normalizeBanka ?
  tumDekontlar.find(({ dekont }) =>
    dekontNoNormalizeEt(dekont.bankaReferansNo) === normalizeReferans &&
    dekont.banka.trim().toLocaleUpperCase('tr-TR') === normalizeBanka) :
  undefined;

  const duplicateDosya = dosyaHash ?
  tumDekontlar.find(({ dekont }) => dekont.dosya?.dekontHash === dosyaHash) :
  undefined;

  const benzerKayit =
  tarih &&
  Number.isFinite(odenenTutar) &&
  (odenenTutar ?? 0) > 0 &&
  !!normalizeBanka &&
  !!normalizeOdeyen ?
  tumDekontlar.find(({ dekont }) =>
    dekont.banka.trim().toLocaleUpperCase('tr-TR') === normalizeBanka &&
    dekont.tarih === tarih &&
    ayniTutarMi(dekont.odenenTutar, odenenTutar ?? 0) &&
    dekont.odemeYapan.trim().toLocaleUpperCase('tr-TR') === normalizeOdeyen) :
  undefined;

  return {
    duplicateDekont,
    duplicateReferans,
    duplicateDosya,
    benzerKayit
  };
}

export function dogrulanmisDekontlariOku(
islem: Pick<Islem, 'dekont' | 'dekontlar' | 'durum' | 'makbuzNo'>)
: Dekont[] {
  const tumDekontlar = islemDekontlariniOku(islem);
  const siraliDogrulanmisler = tumDekontlar.
  map((dekont, sira) => ({ dekont, sira })).
  filter(({ dekont }) => dekontDogrulandiMi(dekont)).
  sort((sol, sag) => {
    const solZaman = sol.dekont.dogrulamaZamani ?? '';
    const sagZaman = sag.dekont.dogrulamaZamani ?? '';
    if (solZaman && sagZaman && solZaman !== sagZaman) {
      return solZaman.localeCompare(sagZaman);
    }
    if (solZaman && !sagZaman) return -1;
    if (!solZaman && sagZaman) return 1;
    return sol.sira - sag.sira;
  }).
  map(({ dekont }) => dekont);

  if (siraliDogrulanmisler.length) return siraliDogrulanmisler;

  if (tumDekontlar.length === 1 && kayitLegacyDogrulandiMi(islem)) {
    return tumDekontlar;
  }

  return [];
}

export function islemBagisMakbuzlariniOku(
islem: Pick<Islem, 'bagisMakbuzlari' | 'makbuzNo' | 'dekont' | 'dekontlar' | 'durum' | 'krediAdedi'>,
birimKrediBedeli?: number)
: BagisMakbuzu[] {
  const kayitMakbuzlari = islem.bagisMakbuzlari ?? [];
  const dekontMakbuzlari = islemDekontlariniOku(islem).flatMap((dekont) => dekont.bagisMakbuzlari ?? []);
  const birlesik = [...kayitMakbuzlari, ...dekontMakbuzlari];

  if (birlesik.length > 0) {
    const gorulenler = new Set<string>();
    return birlesik.filter((makbuz) => {
      const kimlik = bagisMakbuzuKimligi(makbuz);
      if (gorulenler.has(kimlik)) return false;
      gorulenler.add(kimlik);
      return true;
    });
  }

  if (!islem.makbuzNo || !birimKrediBedeli) return [];

  const dogrulanmisler = dogrulanmisDekontlariOku(islem);
  const ilkDekont = dogrulanmisler[0] ?? islemDekontlariniOku(islem)[0];
  if (!ilkDekont) return [];

  const ozet = krediYuklemeDagiliminiHesapla({
    talepEdilenKrediAdedi: islem.krediAdedi ?? 0,
    birimKrediBedeli,
    dekontlar: dogrulanmisler.length ? dogrulanmisler : [ilkDekont]
  });
  const ilkDagilim = ozet.dekontDagilimlari[0];
  const patlatmaDagilimi = ilkDagilim?.tutarDagilimi.find(
    (dagilim) => dagilim.amac === 'TAS_OCAGI_PATLATMASI'
  );
  if (!patlatmaDagilimi || patlatmaDagilimi.tutar <= 0) return [];

  return [
  {
    makbuzNo: islem.makbuzNo,
    tur: 'TAS_OCAGI_PATLATMASI',
    tutar: patlatmaDagilimi.tutar,
    bagliDekontId: ilkDekont.id,
    bagliDekontNo: ilkDekont.dekontNo,
    bagliDekontReferansi: ilkDekont.bankaReferansNo,
    bagliDekontTarihi: ilkDekont.tarih,
    odemeYapan: ilkDekont.odemeYapan
  }];
}

export function krediTalebiOzetiniOlustur(
tumDekontOzeti: KrediYuklemeHesapSonucu,
dogrulanmisOzeti: KrediYuklemeHesapSonucu)
: KrediTalebiOdemeOzeti {
  return {
    hedefTutar: tumDekontOzeti.hedefTutar,
    toplamOdenenTutar: tumDekontOzeti.toplamOdenenTutar,
    dogrulanmisOdemeToplami: dogrulanmisOzeti.toplamOdenenTutar,
    krediyeAyrilanToplam: dogrulanmisOzeti.krediyeAyrilanToplam,
    kullanilabilirKrediAdedi: dogrulanmisOzeti.kullanilabilirKrediAdedi,
    bekleyenBakiye: dogrulanmisOzeti.bekleyenBakiye,
    kalanHedef: dogrulanmisOzeti.kalanHedef,
    genelBagisToplami: dogrulanmisOzeti.genelBagisToplami
  };
}

export function krediYuklemeKaydiniCozumle({
  islem,
  birimKrediBedeli,
  mevcutYuklemeAdedi = 0
}: {
  islem: Pick<Islem, 'krediAdedi' | 'dekont' | 'dekontlar' | 'durum' | 'makbuzNo' | 'bagisMakbuzlari'>;
  birimKrediBedeli: number;
  mevcutYuklemeAdedi?: number;
}): KrediYuklemeKayitCozumleSonucu {
  const tumDekontlar = islemDekontlariniOku(islem);
  const tumDekontOzeti = krediYuklemeDagiliminiHesapla({
    talepEdilenKrediAdedi: islem.krediAdedi ?? 0,
    birimKrediBedeli,
    dekontlar: tumDekontlar
  });
  const dogrulanmisDekontlar = dogrulanmisDekontlariOku(islem);
  const dogrulanmisOzeti = krediYuklemeDagiliminiHesapla({
    talepEdilenKrediAdedi: islem.krediAdedi ?? 0,
    birimKrediBedeli,
    dekontlar: dogrulanmisDekontlar
  });
  const bagisMakbuzlari = islemBagisMakbuzlariniOku(islem, birimKrediBedeli);

  const dogrulanmisDagilimHaritasi = new Map<
  string,
  {krediyeAyrilanTutar: number;genelBagisTutari: number;tutarDagilimi: DekontTutarDagilimi[];}
  >();
  const makbuzEksikleri: EksikBagisMakbuzu[] = [];

  dogrulanmisOzeti.dekontDagilimlari.forEach((dagilim, sira) => {
    const dekont = dogrulanmisDekontlar[sira];
    if (!dekont) return;
    const bagliMakbuzlar = {
      TAS_OCAGI_PATLATMASI:
      bagisMakbuzlari.
      find((makbuz) =>
      bagisMakbuzuDagilimaAitMi(makbuz, {
        tur: 'TAS_OCAGI_PATLATMASI',
        tutar: dagilim.krediyeAyrilanTutar,
        bagliDekontId: dekont.id,
        bagliDekontNo: dekont.dekontNo,
        bagliDekontReferansi: dekont.bankaReferansNo
      }))?.
      makbuzNo ?? null,
      GENEL_VAKIF_BAGISI:
      bagisMakbuzlari.
      find((makbuz) =>
      bagisMakbuzuDagilimaAitMi(makbuz, {
        tur: 'GENEL_VAKIF_BAGISI',
        tutar: dagilim.genelBagisTutari,
        bagliDekontId: dekont.id,
        bagliDekontNo: dekont.dekontNo,
        bagliDekontReferansi: dekont.bankaReferansNo
      }))?.
      makbuzNo ?? null
    } satisfies Partial<Record<BagisMakbuzTuru, string | null>>;

    const zenginDagilim = dagilimOlustur(
      kurusaCevir(dagilim.krediyeAyrilanTutar),
      kurusaCevir(dagilim.genelBagisTutari),
      bagliMakbuzlar
    );
    dogrulanmisDagilimHaritasi.set(dagilim.dekontKimligi, {
      krediyeAyrilanTutar: dagilim.krediyeAyrilanTutar,
      genelBagisTutari: dagilim.genelBagisTutari,
      tutarDagilimi: zenginDagilim
    });

    zenginDagilim.
    filter((kalem) => kalem.tutar > 0 && !kalem.bagliMakbuzNo).
    forEach((kalem) => {
      makbuzEksikleri.push({
        dekontKimligi: dagilim.dekontKimligi,
        bagliDekontId: dekont.id,
        bagliDekontNo: dekont.dekontNo,
        bagliDekontReferansi: dekont.bankaReferansNo,
        bagliDekontTarihi: dekont.tarih,
        odemeYapan: dekont.odemeYapan,
        tur: kalem.amac,
        tutar: kalem.tutar
      });
    });
  });

  const bekleyenDekontSayisi = tumDekontlar.reduce((toplam, dekont, sira) => {
    const legacyDogrulandi =
    tumDekontlar.length === 1 &&
    !dekont.dogrulamaDurumu &&
    sira === 0 &&
    kayitLegacyDogrulandiMi(islem);
    if (legacyDogrulandi) return toplam;
    if (dekont.dogrulamaDurumu === 'DOGRULANDI' || dekont.dogrulamaDurumu === 'REDDEDILDI') {
      return toplam;
    }
    return toplam + 1;
  }, 0);

  const kayitDurumu: IslemDurumu =
  dogrulanmisDekontlar.length === 0 ?
  'ODEME_BEKLIYOR' :
  makbuzEksikleri.length > 0 ?
  'MAKBUZ_BEKLIYOR' :
  bekleyenDekontSayisi === 0 && dogrulanmisOzeti.kalanHedef <= 0 ?
  'TAMAMLANDI' :
  dogrulanmisOzeti.kullanilabilirKrediAdedi > 0 ?
  'ISLEM_BASLATILABILIR' :
  'ODEME_DOGRULANDI';

  const makbuzNoAlias =
  bagisMakbuzlari.find((makbuz) => makbuz.tur === 'TAS_OCAGI_PATLATMASI')?.makbuzNo ??
  islem.makbuzNo ??
  null;

  const guncelDekontlar = tumDekontlar.map((dekont, sira) => {
    const kimlik = krediYuklemeDekontKimligi(dekont, sira);
    const tutarDagilimi = dogrulanmisDagilimHaritasi.get(kimlik)?.tutarDagilimi;
    const dekontaAitMakbuzlar = bagisMakbuzlari.filter((makbuz) =>
      bagisMakbuzuDagilimaAitMi(makbuz, {
        tur: makbuz.tur,
        tutar: makbuz.tutar,
        bagliDekontId: dekont.id,
        bagliDekontNo: dekont.dekontNo,
        bagliDekontReferansi: dekont.bankaReferansNo
      })
    );
    return {
      ...dekont,
      tutarDagilimi,
      bagisMakbuzlari: dekontaAitMakbuzlar.length ? dekontaAitMakbuzlar : undefined
    };
  });

  return {
    tumDekontOzeti,
    dogrulanmisOzeti,
    krediTalebiOdemeOzeti: krediTalebiOzetiniOlustur(tumDekontOzeti, dogrulanmisOzeti),
    guncelDekontlar,
    bagisMakbuzlari,
    makbuzEksikleri,
    yeniYuklemeAdedi: Math.max(dogrulanmisOzeti.kullanilabilirKrediAdedi - Math.max(mevcutYuklemeAdedi, 0), 0),
    kayitDurumu,
    makbuzNoAlias,
    bekleyenDekontSayisi
  };
}

export function islemKrediYuklemeOzetiniHesapla(
islem: Pick<Islem, 'dekont' | 'dekontlar' | 'krediAdedi' | 'durum' | 'makbuzNo'>,
birimKrediBedeli: number)
: KrediYuklemeHesapSonucu {
  return krediYuklemeKaydiniCozumle({
    islem: {
      ...islem,
      bagisMakbuzlari: undefined
    },
    birimKrediBedeli
  }).dogrulanmisOzeti;
}
