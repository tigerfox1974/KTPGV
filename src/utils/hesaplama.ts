import { BentKodu, FAltTur } from '../types';
import { formatTL, formatTLHassas } from './currency';

/** Varsayılan brüt asgari ücret (BAÜ) — sistem ayarı. */
export const VARSAYILAN_BAU = 70893;

export interface HesaplamaGirdi {
  bent: BentKodu | '';
  fAltTur?: FAltTur | '';
  bau: number;
  manuelTutar?: number;
  adet?: number;
  polisSayisi?: number;
  gorevSuresi?: number;
  krediAdedi?: number;
}

export interface HesaplamaSonuc {
  gecerli: boolean;
  tutar: number;
  birimTutar: number | null;
  formul: string;
  satirlar: string[];
  hatalar: string[];
}

export interface MahsupKaynakKullanim {
  kaynakKayitNo?: string;
  kullanilanTutar: number;
  kalanTutar: number;
}

export interface EKrediYuklemeHesapSonucu {
  yontem: 'ADET' | 'TUTAR';
  krediAdedi: number;
  krediYuklemeTutari: number;
  gercekDekontTutari: number;
  yeniDekonttaOdenmesiGerekenTutar: number;
  kullanilanMahsup: number;
  hesaplamayaGirenToplam: number;
  krediyeUygulananTutar: number;
  kalanMahsupBakiyesi: number;
  krediyeUygulanmamisBakiye: number;
  kayitOlusturulabilirMi: boolean;
  krediOlusturulabilirMi: boolean;
  dekontZorunluMu: boolean;
  mahsupKullanildiMi: boolean;
  mahsupKaynakKullanimlari: MahsupKaynakKullanim[];
  mesajTipi: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  mesajlar: string[];
}

const BOS: HesaplamaSonuc = {
  gecerli: false,
  tutar: 0,
  birimTutar: null,
  formul: '',
  satirlar: [],
  hatalar: []
};

export const BENT_ORANLARI: Record<string, number> = {
  C: 0.02,
  Ç: 0.1,
  D: 0.005,
  E: 0.1,
  F: 0.01
};

export function hesapla(girdi: HesaplamaGirdi): HesaplamaSonuc {
  const { bent, bau } = girdi;
  if (!bent) return BOS;

  if (bent === 'A' || bent === 'B') {
    const tutar = girdi.manuelTutar ?? 0;
    const hatalar: string[] = [];
    if (tutar <= 0) hatalar.push('Tutar sıfırdan büyük olmalıdır.');
    return {
      gecerli: hatalar.length === 0,
      tutar,
      birimTutar: null,
      formul: 'Sabit oran yoktur — tutar manuel girilir.',
      satirlar: [
      bent === 'A' ?
      'A bendi: faaliyet geliri / yardım / bağış. Yasal sabit oran bulunmaz.' :
      'B bendi: hurda veya hizmet dışı mal satışı. Yasal sabit oran bulunmaz.',
      `Girilen tutar: ${formatTL(tutar)}`],

      hatalar
    };
  }

  if (bent === 'C' || bent === 'Ç' || bent === 'F') {
    const oran = BENT_ORANLARI[bent];
    const adet = girdi.adet ?? 0;
    const hatalar: string[] = [];
    if (!Number.isInteger(adet) || adet <= 0)
    hatalar.push('Adet sıfırdan büyük tam sayı olmalıdır.');
    if (bent === 'F' && !girdi.fAltTur)
    hatalar.push('F bendi için alt tür seçilmelidir.');
    const birimTutar = bau * oran;
    const oranMetni = `%${(oran * 100).toString().replace('.', ',')}`;
    return {
      gecerli: hatalar.length === 0,
      tutar: birimTutar * adet,
      birimTutar,
      formul: `BAÜ x ${oranMetni} x Adet`,
      satirlar: [
      `BAÜ: ${formatTL(bau)}`,
      `BAÜ x ${oranMetni} = ${formatTL(birimTutar)} (işlem/rapor başı tutar)`,
      `${formatTL(birimTutar)} x ${adet || 0} adet = ${formatTL(birimTutar * adet)}`],

      hatalar
    };
  }

  if (bent === 'D') {
    const polis = girdi.polisSayisi ?? 0;
    const sure = girdi.gorevSuresi ?? 0;
    const hatalar: string[] = [];
    if (!Number.isInteger(polis) || polis <= 0)
    hatalar.push('Polis sayısı pozitif tam sayı olmalıdır. Yarım personel girilemez.');
    if (!Number.isInteger(sure) || sure <= 0)
    hatalar.push('Görev süresi pozitif tam saat olmalıdır. Buçuklu saat girilemez.');
    const saatlik = bau * 0.005;
    return {
      gecerli: hatalar.length === 0,
      tutar: polis * sure * saatlik,
      birimTutar: saatlik,
      formul: 'Polis Sayısı x Görev Süresi x BAÜ x %0,5',
      satirlar: [
      `BAÜ: ${formatTL(bau)}`,
      `BAÜ x %0,5 = ${formatTLHassas(saatlik)} (kişi/saat tutarı)`,
      `${polis || 0} polis x ${sure || 0} saat x ${formatTLHassas(saatlik)} = ${formatTL(
        polis * sure * saatlik
      )}`],

      hatalar
    };
  }

  // E bendi — patlatma kredisi
  const kredi = girdi.krediAdedi ?? 0;
  const hatalar: string[] = [];
  if (!Number.isInteger(kredi) || kredi <= 0)
  hatalar.push('Kredi adedi sıfırdan büyük tam sayı olmalıdır.');
  const patlatma = bau * 0.1;
  return {
    gecerli: hatalar.length === 0,
    tutar: patlatma * kredi,
    birimTutar: patlatma,
    formul: '1 Patlatma Kredisi = BAÜ x %10',
    satirlar: [
    `BAÜ: ${formatTL(bau)}`,
    `BAÜ x %10 = ${formatTL(patlatma)} (1 patlatma bedeli)`,
    `${kredi || 0} kredi x ${formatTL(patlatma)} = ${formatTL(patlatma * kredi)}`],

    hatalar
  };
}

export function patlatmaBedeli(bau: number): number {
  return bau * 0.1;
}

export function hesaplaEKrediYuklemeMahsup(args: {
  yontem: 'ADET' | 'TUTAR';
  istenenKrediAdedi?: number | string;
  gercekDekontTutari?: number | string;
  mevcutMahsupBakiyesi?: number | string;
  mahsupKullanilsinMi?: boolean;
  krediBedeli: number;
  mevcutMahsupKaynaklari?: MahsupKaynakKullanim[];
}): EKrediYuklemeHesapSonucu {
  const yontem = args.yontem;
  const krediBedeli = Number(args.krediBedeli ?? 0);
  const gercekDekontTutari = Number(args.gercekDekontTutari ?? 0);
  const mevcutMahsupBakiyesi = Number(args.mevcutMahsupBakiyesi ?? 0);
  const istenenKrediAdedi = Number(args.istenenKrediAdedi ?? 0);
  const mahsupKullanilsinMi = !!args.mahsupKullanilsinMi;

  const mesajlar: string[] = [];
  const kaynaklar: MahsupKaynakKullanim[] = Array.isArray(args.mevcutMahsupKaynaklari) ? args.mevcutMahsupKaynaklari : [];
  const gercekKrediyeUygulanmamisBakiye = Math.max(0, gercekDekontTutari - Math.floor(gercekDekontTutari / Math.max(krediBedeli, 1)) * Math.max(krediBedeli, 1));

  if (yontem === 'ADET') {
    const hedefAdet = Number.isFinite(istenenKrediAdedi) && istenenKrediAdedi > 0 ? Math.floor(istenenKrediAdedi) : 0;
    const krediYuklemeTutari = hedefAdet * krediBedeli;
    let kullanilanMahsup = 0;
    if (mahsupKullanilsinMi && mevcutMahsupBakiyesi > 0) {
      kullanilanMahsup = Math.min(mevcutMahsupBakiyesi, Math.max(0, krediYuklemeTutari));
    }
    const yeniDekonttaOdenmesiGerekenTutar = Math.max(0, krediYuklemeTutari - kullanilanMahsup);
    const kalanMahsupBakiyesi = Math.max(0, mevcutMahsupBakiyesi - kullanilanMahsup);
    const krediOlusturulabilirMi = hedefAdet > 0 && krediYuklemeTutari > 0 && yeniDekonttaOdenmesiGerekenTutar >= 0;
    const kayitOlusturulabilirMi = krediOlusturulabilirMi;
    const dekontZorunluMu = yeniDekonttaOdenmesiGerekenTutar > 0;

    if (mahsupKullanilsinMi && mevcutMahsupBakiyesi > 0 && kullanilanMahsup > 0) {
      mesajlar.push('Eski mahsup bakiyesi, yeni dekont ödemesini düşürmek için kullanıldı.');
    }
    if (!mahsupKullanilsinMi && mevcutMahsupBakiyesi > 0) {
      mesajlar.push('Eski mahsup bakiyesi kullanılmadı; işletmeci hesabında kaldı.');
    }
    if (hedefAdet <= 0) {
      mesajlar.push('İstenen kredi adedi pozitif tam sayı olmalıdır.');
    }

    return {
      yontem,
      krediAdedi: hedefAdet,
      krediYuklemeTutari,
      gercekDekontTutari: 0,
      yeniDekonttaOdenmesiGerekenTutar,
      kullanilanMahsup,
      hesaplamayaGirenToplam: krediYuklemeTutari,
      krediyeUygulananTutar: krediYuklemeTutari,
      kalanMahsupBakiyesi,
      krediyeUygulanmamisBakiye: 0,
      kayitOlusturulabilirMi,
      krediOlusturulabilirMi: krediOlusturulabilirMi,
      dekontZorunluMu,
      mahsupKullanildiMi: kullanilanMahsup > 0,
      mahsupKaynakKullanimlari: kaynaklar.length ? kaynaklar : [{ kullanilanTutar: kullanilanMahsup, kalanTutar: kalanMahsupBakiyesi }],
      mesajTipi: kullanilanMahsup > 0 ? 'SUCCESS' : 'INFO',
      mesajlar
    };
  }

  const dekontBasiKrediAdedi = Math.floor(gercekDekontTutari / krediBedeli);
  const dekontBasiKalan = krediBedeli > 0 ? gercekDekontTutari % krediBedeli : 0;
  const eksikTutar = krediBedeli > 0 ? krediBedeli - dekontBasiKalan : 0;

  let kullanilanMahsup = 0;
  let krediAdedi = dekontBasiKrediAdedi;
  let krediyeUygulananTutar = krediAdedi * krediBedeli;
  let kalanMahsupBakiyesi = mevcutMahsupBakiyesi;
  let yeniBakiye = Math.max(0, gercekDekontTutari - krediyeUygulananTutar);
  const gercekUygulanmayanBakiye = Math.max(0, gercekDekontTutari - krediyeUygulananTutar);

  if (mahsupKullanilsinMi && mevcutMahsupBakiyesi > 0 && dekontBasiKalan > 0) {
    const gerekliMahsup = Math.min(mevcutMahsupBakiyesi, eksikTutar);
    if (gerekliMahsup > 0 && gerekliMahsup >= eksikTutar) {
      kullanilanMahsup = gerekliMahsup;
      krediAdedi = Math.floor((gercekDekontTutari + kullanilanMahsup) / krediBedeli);
      krediyeUygulananTutar = krediAdedi * krediBedeli;
      kalanMahsupBakiyesi = Math.max(0, mevcutMahsupBakiyesi - kullanilanMahsup);
      yeniBakiye = Math.max(0, gercekDekontTutari + kullanilanMahsup - krediyeUygulananTutar);
    }
  }

  if (!mahsupKullanilsinMi && gercekDekontTutari > 0) {
    kullanilanMahsup = 0;
    krediAdedi = dekontBasiKrediAdedi;
    krediyeUygulananTutar = krediAdedi * krediBedeli;
    kalanMahsupBakiyesi = mevcutMahsupBakiyesi;
    yeniBakiye = Math.max(0, gercekDekontTutari - krediyeUygulananTutar);
  }

  const kullanilanMaksimumBakiye = Math.max(0, gercekUygulanmayanBakiye);

  const hesaplamayaGirenToplam = gercekDekontTutari + kullanilanMahsup;
  const krediOlusturulabilirMi = gercekDekontTutari > 0 || (mahsupKullanilsinMi && kullanilanMahsup > 0 && krediAdedi > 0);
  const kayitOlusturulabilirMi = krediAdedi > 0 || gercekDekontTutari > 0;
  const dekontZorunluMu = gercekDekontTutari > 0;

  if (mahsupKullanilsinMi && kullanilanMahsup > 0) {
    mesajlar.push('Eski mahsup bakiyesi, bir sonraki tam kredi için kullanıldı.');
  }
  if (!mahsupKullanilsinMi && mevcutMahsupBakiyesi > 0) {
    mesajlar.push('Mahsup kullanma seçildi; eski mahsup bakiyesi korunuyor.');
  }
  if (gercekDekontTutari > 0 && dekontBasiKalan > 0 && kullanilanMahsup === 0) {
    mesajlar.push('Gerçek dekont tutarı tam krediye dönüştürülemedi; kalan tutar krediye uygulanmamış bakiye olarak izlenir.');
  }
  if (gercekDekontTutari === 0 && mevcutMahsupBakiyesi > 0 && kullanilanMahsup > 0) {
    mesajlar.push('Yeni banka dekontu yok; mahsup kullanımı kredi oluşturdu.');
  }

  return {
    yontem,
    krediAdedi,
    krediYuklemeTutari: krediyeUygulananTutar,
    gercekDekontTutari,
    yeniDekonttaOdenmesiGerekenTutar: Math.max(0, gercekDekontTutari - kullanilanMahsup),
    kullanilanMahsup,
    hesaplamayaGirenToplam,
    krediyeUygulananTutar,
    kalanMahsupBakiyesi,
    krediyeUygulanmamisBakiye: Math.max(yeniBakiye, kullanilanMaksimumBakiye, gercekKrediyeUygulanmamisBakiye),
    kayitOlusturulabilirMi,
    krediOlusturulabilirMi,
    dekontZorunluMu,
    mahsupKullanildiMi: kullanilanMahsup > 0,
    mahsupKaynakKullanimlari: kaynaklar.length ? kaynaklar : [{ kullanilanTutar: kullanilanMahsup, kalanTutar: kalanMahsupBakiyesi }],
    mesajTipi: krediAdedi > 0 ? 'SUCCESS' : (gercekDekontTutari > 0 ? 'WARN' : 'INFO'),
    mesajlar
  };
}

export function raporBedeli(bau: number): number {
  return bau * 0.01;
}