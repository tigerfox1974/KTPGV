import { BentKodu, FAltTur, GorevDilimi } from '../types';
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
  /** D bendi çoklu görev dilimleri — verilirse polisSayisi/gorevSuresi yerine kullanılır. */
  gorevDilimleri?: GorevDilimi[];
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
    const hatalar: string[] = [];
    const girilenDilimler = girdi.gorevDilimleri ?? [];
    // Çoklu dilim verilmediyse eski tek polisSayisi/gorevSuresi alanı geriye dönük tek dilim olarak işlenir.
    const dilimler: GorevDilimi[] = girilenDilimler.length > 0
      ? girilenDilimler
      : [
        {
          id: 'legacy',
          polisSayisi: girdi.polisSayisi ?? 0,
          gorevSuresi: girdi.gorevSuresi ?? 0
        }
      ];
    let toplamPolisSaat = 0;
    const dilimSatirlari: string[] = [];
    dilimler.forEach((dilim, sira) => {
      const polis = dilim.polisSayisi;
      const sure = dilim.gorevSuresi;
      const polisGecerli = Number.isInteger(polis) && polis >= 1 && polis <= 999;
      const sureGecerli = Number.isInteger(sure) && sure >= 1 && sure <= 99;
      if (!polisGecerli)
      hatalar.push(`Dilim ${sira + 1}: polis sayısı 1-999 arası pozitif tam sayı olmalıdır (${polis ?? 'boş'}).`);
      if (!sureGecerli)
      hatalar.push(`Dilim ${sira + 1}: görev süresi 1-99 arası pozitif tam saat olmalıdır (${sure ?? 'boş'}).`);
      if (polisGecerli && sureGecerli) {
        toplamPolisSaat += polis * sure;
        dilimSatirlari.push(
          `Dilim ${sira + 1}: ${polis} polis x ${sure} saat = ${polis * sure} polis-saat`);
      } else {
        dilimSatirlari.push(`Dilim ${sira + 1}: geçersiz değer`);
      }
    });
    const saatlik = bau * 0.005;
    return {
      gecerli: hatalar.length === 0 && toplamPolisSaat > 0,
      tutar: toplamPolisSaat * saatlik,
      birimTutar: saatlik,
      formul: 'BAÜ x %0,5 x Toplam Polis-Saat',
      satirlar: [
      `BAÜ: ${formatTL(bau)}`,
      `BAÜ x %0,5 = ${formatTLHassas(saatlik)} (kişi/saat tutarı)`,
      ...dilimSatirlari,
      `Toplam polis-saat: ${toplamPolisSaat}`,
      `Toplam tutar: ${formatTL(toplamPolisSaat * saatlik)}`],

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