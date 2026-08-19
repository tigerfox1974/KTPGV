import { BentKodu, FAltTur } from '../types';
import { formatTL } from './currency';

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
    return {
      gecerli: hatalar.length === 0,
      tutar: birimTutar * adet,
      birimTutar,
      formul: `Brüt Asgari Ücret x %${(oran * 100).
      toString().
      replace('.', ',')} x Adet`,
      satirlar: [
      `Brüt Asgari Ücret (BAÜ): ${formatTL(bau)}`,
      `BAÜ x %${(oran * 100).toString().replace('.', ',')} = ${formatTL(
        birimTutar
      )} (işlem başı tutar)`,
      `İşlem başı tutar x ${adet || 0} adet = ${formatTL(birimTutar * adet)}`],

      hatalar
    };
  }

  if (bent === 'D') {
    const polis = girdi.polisSayisi ?? 0;
    const sure = girdi.gorevSuresi ?? 0;
    const hatalar: string[] = [];
    if (!Number.isInteger(polis) || polis <= 0)
    hatalar.push('Polis sayısı sıfırdan büyük tam sayı olmalıdır. Yarım personel girilemez.');
    if (!Number.isInteger(sure) || sure <= 0)
    hatalar.push('Görev süresi sıfırdan büyük tam saat olmalıdır. Buçuklu saat girilemez.');
    const saatlik = bau * 0.005;
    return {
      gecerli: hatalar.length === 0,
      tutar: polis * sure * saatlik,
      birimTutar: saatlik,
      formul: 'Polis Sayısı x Görev Süresi x Brüt Asgari Ücret x %0,5',
      satirlar: [
      `Brüt Asgari Ücret (BAÜ): ${formatTL(bau)}`,
      `BAÜ x %0,5 = ${formatTL(saatlik)} (personel/saat tutarı)`,
      `${polis || 0} polis x ${sure || 0} saat x ${formatTL(saatlik)} = ${formatTL(
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
  const patlatmaBedeli = bau * 0.1;
  return {
    gecerli: hatalar.length === 0,
    tutar: patlatmaBedeli * kredi,
    birimTutar: patlatmaBedeli,
    formul: '1 Patlatma Kredisi = Brüt Asgari Ücret x %10',
    satirlar: [
    `Brüt Asgari Ücret (BAÜ): ${formatTL(bau)}`,
    `BAÜ x %10 = ${formatTL(patlatmaBedeli)} (1 patlatma bedeli)`,
    `${kredi || 0} kredi x ${formatTL(patlatmaBedeli)} = ${formatTL(
      patlatmaBedeli * kredi
    )}`],

    hatalar
  };
}

export function patlatmaBedeli(bau: number): number {
  return bau * 0.1;
}