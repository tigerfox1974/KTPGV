import { BentKodu, DGorevDilimi, FAltTur } from '../types';
import { formatTL, formatTLHassas } from './currency';

/** Varsayılan brüt asgari ücret (BAÜ) — sistem ayarı. */
export const VARSAYILAN_BAU = 70893;

export interface HesaplamaGirdi {
  bent: BentKodu | '';
  fAltTur?: FAltTur | '';
  bau: number;
  manuelTutar?: number;
  adet?: number;
  gorevDilimleri?: DGorevDilimi[];
  /** Geriye uyumluluk: tekli D bendi girişi. */
  polisSayisi?: number;
  /** Geriye uyumluluk: tekli D bendi girişi. */
  gorevSuresi?: number;
  krediAdedi?: number;
}

export const D_BENDI_POLIS_SAYISI_MAX = 999;
export const D_BENDI_GOREV_SAATI_MAX = 99;

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
    const gorevDilimleri =
    girdi.gorevDilimleri && girdi.gorevDilimleri.length > 0 ?
    girdi.gorevDilimleri :
    girdi.polisSayisi && girdi.gorevSuresi ?
    [{ polisSayisi: girdi.polisSayisi, gorevSuresi: girdi.gorevSuresi }] :
    [];
    const hatalar: string[] = [];
    if (gorevDilimleri.length === 0) {
      hatalar.push('En az 1 görev dilimi girilmelidir.');
    }
    const saatlik = bau * 0.005;
    let toplam = 0;
    const dilimSatirlari: string[] = [];

    gorevDilimleri.forEach((dilim, index) => {
      const polis = dilim.polisSayisi;
      const sure = dilim.gorevSuresi;
      const dilimEtiketi = `${index + 1}. görev dilimi`;

      if (!Number.isInteger(polis) || polis <= 0) {
        hatalar.push(`${dilimEtiketi}: polis sayısı pozitif tam sayı olmalıdır.`);
      } else if (polis > D_BENDI_POLIS_SAYISI_MAX) {
        hatalar.push(`${dilimEtiketi}: polis sayısı en fazla ${D_BENDI_POLIS_SAYISI_MAX} olabilir.`);
      }

      if (!Number.isInteger(sure) || sure <= 0) {
        hatalar.push(`${dilimEtiketi}: görev süresi pozitif tam saat olmalıdır.`);
      } else if (sure > D_BENDI_GOREV_SAATI_MAX) {
        hatalar.push(`${dilimEtiketi}: görev süresi en fazla ${D_BENDI_GOREV_SAATI_MAX} saat olabilir.`);
      }

      if (
      Number.isInteger(polis) &&
      polis > 0 &&
      polis <= D_BENDI_POLIS_SAYISI_MAX &&
      Number.isInteger(sure) &&
      sure > 0 &&
      sure <= D_BENDI_GOREV_SAATI_MAX)
      {
        const araToplam = polis * sure * saatlik;
        toplam += araToplam;
        dilimSatirlari.push(
          `${index + 1}. dilim: ${polis} polis x ${sure} saat x ${formatTLHassas(saatlik)} = ${formatTL(
            araToplam
          )}`
        );
      }
    });

    return {
      gecerli: hatalar.length === 0,
      tutar: toplam,
      birimTutar: saatlik,
      formul: 'Her görev dilimi için (Polis Sayısı x Görev Süresi x BAÜ x %0,5), toplam tutar dilimlerin toplamıdır.',
      satirlar: [
      `BAÜ: ${formatTL(bau)}`,
      `BAÜ x %0,5 = ${formatTLHassas(saatlik)} (kişi/saat tutarı)`,
      ...dilimSatirlari,
      ...(dilimSatirlari.length ? [`Toplam D bendi tutarı: ${formatTL(toplam)}`] : [])],

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

export function raporBedeli(bau: number): number {
  return bau * 0.01;
}